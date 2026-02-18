"use client";
import { FC } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface PersonalizeSettingsProps {
  baseCurrency: string;
  language: string;
  isPrivacyMode: boolean;
  onChange: (data: { baseCurrency?: string; language?: string; isPrivacyMode?: boolean }) => void;
}

export const PersonalizeSettings: FC<PersonalizeSettingsProps> = ({ baseCurrency, language, isPrivacyMode, onChange }) => (
  <div className="space-y-6">
    <div>
      <label className="block font-medium mb-1">기본 통화</label>
      <Select value={baseCurrency} onValueChange={(v) => onChange({ baseCurrency: v })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="KRW">KRW (₩)</SelectItem>
          <SelectItem value="USD">USD ($)</SelectItem>
          <SelectItem value="JPY">JPY (¥)</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div>
      <label className="block font-medium mb-1">언어</label>
      <Select value={language} onValueChange={(v) => onChange({ language: v })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="KO">한국어</SelectItem>
          <SelectItem value="EN">English</SelectItem>
          <SelectItem value="JP">日本語</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="flex items-center gap-2">
      <Switch checked={isPrivacyMode} onCheckedChange={(v: boolean) => onChange({ isPrivacyMode: v })} />
      <span>잔액 숨기기 모드</span>
    </div>
  </div>
);
