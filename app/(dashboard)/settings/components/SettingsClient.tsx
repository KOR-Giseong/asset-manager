"use client";

import { FC, useState } from "react";
import { usePrivacyMode } from "@/components/privacy-mode-context";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { AccountSettings } from "./AccountSettings";
import { PersonalizeSettings } from "./PersonalizeSettings";
import { DataSettings } from "./DataSettings";
import { InfoSettings } from "./InfoSettings";
import { DangerZoneModal } from "./DangerZoneModal";
import {
  changeNickname,
  updateSettings,
  requestDeleteAccount,
  cancelDeleteAccount,
  resetAllData,
  exportCSV,
  toggleTwoFactor,
} from "@/actions/settings";
import type { User } from "@/types/user";

interface SettingsClientProps {
  user: User;
  deletedAt?: string | null;
  twoFactorEnabled?: boolean;
}

export const SettingsClient: FC<SettingsClientProps> = ({ user, deletedAt, twoFactorEnabled = false }) => {
  const { update: updateSession } = useSession();
  const router = useRouter();
  const [category, setCategory] = useState("account");
  const [dangerModal, setDangerModal] = useState<{
    open: boolean;
    type: "reset" | "delete";
  }>({ open: false, type: "reset" });
  const { isPrivacyMode, setPrivacyMode } = usePrivacyMode();

  const handleExport = async () => {
    const csv = await exportCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asset-manager-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDangerConfirm = async () => {
    if (dangerModal.type === "reset") {
      await resetAllData();
    } else {
      // 즉시 삭제 대신 24시간 유예 신청 (signOut 없음)
      await requestDeleteAccount();
      router.refresh();
    }
    setDangerModal({ open: false, type: "reset" });
  };

  const handleCancelDelete = async () => {
    await cancelDeleteAccount();
    router.refresh();
  };

  const renderContent = () => {
    switch (category) {
      case "account":
        return (
          <AccountSettings
            nickname={user.nickname}
            deletedAt={deletedAt}
            twoFactorEnabled={twoFactorEnabled}
            onNicknameChange={async (nickname) => {
              const result = await changeNickname(nickname);
              if (!result.ok) throw new Error(result.error ?? "오류가 발생했습니다.");
              await updateSession();
              router.refresh();
            }}
            onToggleTwoFactor={async () => {
              const result = await toggleTwoFactor();
              if (result.ok) router.refresh();
              return result;
            }}
            onLogout={() => signOut({ callbackUrl: "/login" })}
            onDelete={() => setDangerModal({ open: true, type: "delete" })}
            onCancelDelete={handleCancelDelete}
          />
        );
      case "personalize":
        return (
          <PersonalizeSettings
            isPrivacyMode={isPrivacyMode}
            onChange={({ isPrivacyMode }) => {
              if (typeof isPrivacyMode === "boolean") setPrivacyMode(isPrivacyMode);
            }}
          />
        );
      case "data":
        return (
          <DataSettings
            allowNotifications={user.allowNotifications}
            onChange={(data: { allowNotifications?: boolean }) => updateSettings(data)}
            onExport={handleExport}
            onReset={() => setDangerModal({ open: true, type: "reset" })}
          />
        );
      case "info":
        return <InfoSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[600px]">
      <Sidebar selected={category} onSelect={setCategory} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">{renderContent()}</main>
      <DangerZoneModal
        open={dangerModal.open}
        onClose={() => setDangerModal({ open: false, type: "reset" })}
        onConfirm={handleDangerConfirm}
        type={dangerModal.type}
      />
    </div>
  );
};
