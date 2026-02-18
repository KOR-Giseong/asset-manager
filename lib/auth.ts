import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { User } from "@/types/user";

/**
 * 현재 로그인한 사용자 정보를 반환합니다.
 * 미인증 시 로그인 페이지로 리다이렉트합니다.
 */
export async function getCurrentUser(): Promise<User> {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return {
    id: session.user.id,
    email: session.user.email ?? undefined,
    nickname: session.user.nickname ?? "",
    role: session.user.role ?? "USER",
    baseCurrency: session.user.baseCurrency ?? "KRW",
    isPrivacyMode: session.user.isPrivacyMode ?? false,
    language: session.user.language ?? "KO",
    allowNotifications: session.user.allowNotifications ?? true,
  };
}
