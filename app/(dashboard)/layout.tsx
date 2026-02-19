// =========================================
// 대시보드 레이아웃 (사이드바 포함)
// =========================================

import { getCurrentUser } from "@/lib/auth";
import { SidebarLayout } from "@/components/layout";
import { UserProvider } from "@/components/user-context";
import { prisma } from "@/lib/prisma";
import { DeletionPendingBanner } from "@/components/deletion-pending-banner";
import { ReactivationToast } from "@/components/reactivation-toast";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { deletedAt: true, reactivatedAt: true },
  });

  const isReactivated =
    !!dbUser?.reactivatedAt &&
    Date.now() - dbUser.reactivatedAt.getTime() < 5 * 60 * 1000;

  return (
    <UserProvider initialUser={user}>
      {dbUser?.deletedAt && (
        <DeletionPendingBanner scheduledAt={dbUser.deletedAt.toISOString()} />
      )}
      {isReactivated && <ReactivationToast />}
      <SidebarLayout>{children}</SidebarLayout>
    </UserProvider>
  );
}
