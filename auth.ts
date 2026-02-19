import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
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
  adapter: createAdapter(),
  callbacks: {
    ...authConfig.callbacks,
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
