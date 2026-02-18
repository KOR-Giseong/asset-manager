// =========================================
// 대시보드 레이아웃 (사이드바 포함)
// =========================================

import { getCurrentUser } from "@/lib/auth";
import { SidebarLayout } from "@/components/layout";
import { UserProvider } from "@/components/user-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <UserProvider initialUser={user}>
      <SidebarLayout>{children}</SidebarLayout>
    </UserProvider>
  );
}
