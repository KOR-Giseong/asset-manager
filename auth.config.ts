import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import type { UserRole, Currency, Language } from "@/types/user";

// Edge Runtime(미들웨어)에서도 사용되므로 prisma import 금지
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // JWT 만료 30일
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole | undefined;
        session.user.nickname = token.nickname as string | undefined;
        session.user.baseCurrency = token.baseCurrency as Currency | undefined;
        session.user.isPrivacyMode = token.isPrivacyMode as boolean | undefined;
        session.user.language = token.language as Language | undefined;
        session.user.allowNotifications = token.allowNotifications as boolean | undefined;
        session.user.suspended = (token.suspended as boolean) ?? false;
        session.user.suspendedReason = token.suspendedReason as string | null | undefined;
      }
      return session;
    },
  },
};
