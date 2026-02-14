// =========================================
// 대시보드 레이아웃 (사이드바 포함)
// =========================================

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SidebarLayout } from "@/components/layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session?.user) {
    redirect("/login");
  }

  return <SidebarLayout>{children}</SidebarLayout>;
}
