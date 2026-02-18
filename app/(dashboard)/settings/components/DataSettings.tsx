"use client";
import { FC } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface DataSettingsProps {
  allowNotifications: boolean;
  onChange: (data: { allowNotifications?: boolean }) => void;
  onExport: () => void;
  onReset: () => void;
}

export const DataSettings: FC<DataSettingsProps> = ({ allowNotifications, onChange, onExport, onReset }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2">
      <Switch checked={allowNotifications} onCheckedChange={(v) => onChange({ allowNotifications: v })} />
      <span>푸시 알림 받기</span>
    </div>
    <Button variant="outline" onClick={onExport}>CSV 데이터 내보내기</Button>
    <Button variant="destructive" onClick={onReset}>전체 초기화</Button>
  </div>
);
