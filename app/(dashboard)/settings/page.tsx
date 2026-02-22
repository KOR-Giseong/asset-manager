import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./components/SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { deletedAt: true, twoFactorEnabled: true },
  });

  return (
    <SettingsClient
      user={user}
      deletedAt={dbUser?.deletedAt?.toISOString() ?? null}
      twoFactorEnabled={dbUser?.twoFactorEnabled ?? false}
    />
  );
}
