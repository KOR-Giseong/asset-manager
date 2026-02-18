"use client";

import { FC, useState } from "react";
import { usePrivacyMode } from "@/components/privacy-mode-context";
import { signOut, useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { AccountSettings } from "./AccountSettings";
import { PersonalizeSettings } from "./PersonalizeSettings";
import { DataSettings } from "./DataSettings";
import { InfoSettings } from "./InfoSettings";
import { DangerZoneModal } from "./DangerZoneModal";
import {
  changeNickname,
  updateSettings,
  deleteAccount,
  resetAllData,
  exportCSV,
} from "@/actions/settings";
import type { User } from "@/types/user";

interface SettingsClientProps {
  user: User;
}

export const SettingsClient: FC<SettingsClientProps> = ({ user }) => {
  const { update: updateSession } = useSession();
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
      await deleteAccount();
      signOut({ callbackUrl: "/login" });
    }
    setDangerModal({ open: false, type: "reset" });
  };

  const renderContent = () => {
    switch (category) {
      case "account":
        return (
          <AccountSettings
            nickname={user.nickname}
            onNicknameChange={async (nickname) => {
              await changeNickname(nickname);
              await updateSession();
            }}
            onLogout={() => signOut({ callbackUrl: "/login" })}
            onDelete={() => setDangerModal({ open: true, type: "delete" })}
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
    <div className="flex h-full min-h-[600px]">
      <Sidebar selected={category} onSelect={setCategory} />
      <main className="flex-1 overflow-y-auto p-8">{renderContent()}</main>
      <DangerZoneModal
        open={dangerModal.open}
        onClose={() => setDangerModal({ open: false, type: "reset" })}
        onConfirm={handleDangerConfirm}
        type={dangerModal.type}
      />
    </div>
  );
};
