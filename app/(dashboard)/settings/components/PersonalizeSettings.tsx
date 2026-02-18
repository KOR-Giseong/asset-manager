"use client";
import { FC } from "react";
import { Switch } from "@/components/ui/switch";
import { EyeOff } from "lucide-react";

interface PersonalizeSettingsProps {
  isPrivacyMode: boolean;
  onChange: (data: { isPrivacyMode?: boolean }) => void;
}

export const PersonalizeSettings: FC<PersonalizeSettingsProps> = ({ isPrivacyMode, onChange }) => (
  <div className="space-y-6 md:space-y-8 w-full max-w-lg">
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-1">화면 표시</h3>
      <p className="text-xs text-muted-foreground mb-4">앱의 표시 방식을 설정합니다.</p>
      <div className="rounded-lg border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-muted">
            <EyeOff size={15} className="text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">잔액 숨기기 모드</p>
            <p className="text-xs text-muted-foreground">자산 금액을 *** 으로 표시합니다.</p>
          </div>
        </div>
        <Switch
          checked={isPrivacyMode}
          onCheckedChange={(v: boolean) => onChange({ isPrivacyMode: v })}
        />
      </div>
    </div>
  </div>
);
