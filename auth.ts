import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

/**
 * PrismaAdapter는 nickname(NOT NULL, UNIQUE) 필드를 모르기 때문에
 * createUser를 오버라이드하여 자동으로 기본 닉네임을 생성합니다.
 */
function createAdapter(): Adapter {
  const base = PrismaAdapter(prisma);
  return {
    ...base,
    async createUser(data) {
      const rawBase =
        data.name?.replace(/[^a-zA-Z0-9가-힣]/g, "").slice(0, 16) ||
        data.email?.split("@")[0] ||
        "user";
      const base = rawBase || "user";

      // 닉네임 중복 시 숫자 접미사 추가
      let nickname = base;
      let i = 1;
      while (await prisma.user.findUnique({ where: { nickname } })) {
        nickname = `${base}${i++}`;
      }

      return prisma.user.create({
        data: {
          name: data.name,
          email: data.email!,
          emailVerified: data.emailVerified ?? null,
          image: data.image ?? null,
          nickname,
          role: "USER",
        },
      }) as ReturnType<NonNullable<Adapter["createUser"]>>;
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        // OAuth 전용 계정이거나 유저가 없는 경우
        if (!user?.password) return null;

        // 이메일 미인증
        if (!user.emailVerified) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return user;
      },
    }),
  ],
  adapter: createAdapter(),
  callbacks: {
    ...authConfig.callbacks,

    // 로그인 시 탈퇴 유예 상태 처리
    async signIn({ user }) {
      if (!user.email) return true;
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
        select: { id: true, deletedAt: true },
      });
      if (!dbUser?.deletedAt) return true;

      const elapsed = Date.now() - dbUser.deletedAt.getTime();
      const GRACE_MS = 24 * 60 * 60 * 1000;

      if (elapsed < GRACE_MS) {
        // 24시간 내 재로그인 → 탈퇴 자동 취소
        await prisma.user.update({
          where: { id: dbUser.id },
          data: { deletedAt: null, reactivatedAt: new Date() },
        });
        return true;
      } else {
        // 24시간 경과 → 완전 삭제 후 신규 가입 가능
        await prisma.user.delete({ where: { id: dbUser.id } });
        return "/login?reason=account_expired";
      }
    },

    async jwt({ token, user, trigger }) {
      // 최초 로그인 시 커스텀 필드 로드
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.nickname = user.nickname;
        token.baseCurrency = user.baseCurrency;
        token.isPrivacyMode = user.isPrivacyMode;
        token.language = user.language;
        token.allowNotifications = user.allowNotifications;
        token.suspended = user.suspended ?? false;
        token.suspendedReason = user.suspendedReason ?? null;
      }

      // 세션 업데이트 시 DB에서 최신 정보 다시 로드
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            nickname: true,
            baseCurrency: true,
            isPrivacyMode: true,
            language: true,
            allowNotifications: true,
            suspended: true,
            suspendedReason: true,
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.nickname = dbUser.nickname;
          token.baseCurrency = dbUser.baseCurrency;
          token.isPrivacyMode = dbUser.isPrivacyMode;
          token.language = dbUser.language;
          token.allowNotifications = dbUser.allowNotifications;
          token.suspended = dbUser.suspended ?? false;
          token.suspendedReason = dbUser.suspendedReason ?? null;
        }
      }

      return token;
    },
  },
});
