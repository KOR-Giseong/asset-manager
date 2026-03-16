import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { User } from "@/types/user";
import { prisma } from "@/lib/prisma";

/**
 * 현재 로그인한 사용자 정보를 반환합니다.
 * 미인증 시 로그인 페이지로 리다이렉트합니다.
 */
export async function getCurrentUser(): Promise<User> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // 세션이 있지만 DB에는 사용자가 없어진 경우(강제 삭제 등) 즉시 로그아웃 처리
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!dbUser) {
    redirect("/login");
  }

  return {
    id: dbUser.id,
    email: dbUser.email ?? undefined,
    nickname: dbUser.nickname,
    role: dbUser.role,
    baseCurrency: dbUser.baseCurrency,
    isPrivacyMode: dbUser.isPrivacyMode,
    language: dbUser.language,
    allowNotifications: dbUser.allowNotifications,
  };
}
