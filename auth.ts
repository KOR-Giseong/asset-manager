import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
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
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.nickname = dbUser.nickname;
          token.baseCurrency = dbUser.baseCurrency;
          token.isPrivacyMode = dbUser.isPrivacyMode;
          token.language = dbUser.language;
          token.allowNotifications = dbUser.allowNotifications;
        }
      }

      return token;
    },
  },
});
