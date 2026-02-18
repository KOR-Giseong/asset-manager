"use client";
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";

interface AccountSettingsProps {
  nickname: string;
  onNicknameChange: (nickname: string) => Promise<void>;
  onLogout: () => void;
  onDelete: () => void;
}

export const AccountSettings: FC<AccountSettingsProps> = ({ nickname, onNicknameChange, onLogout, onDelete }) => {
  const { register, handleSubmit, formState } = useForm({ defaultValues: { nickname } });
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const handleNickname: SubmitHandler<{ nickname: string }> = async (data) => {
    setChecking(true);
    setError("");
    try {
      await onNicknameChange(data.nickname);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("오류 발생");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(handleNickname)} className="space-y-2">
        <label className="block font-medium">닉네임</label>
        <div className="flex gap-2">
          <Input {...register("nickname", { required: true })} disabled={checking} />
          <Button type="submit" disabled={checking || formState.isSubmitting}>수정</Button>
        </div>
        {error && <div className="text-destructive text-sm">{error}</div>}
      </form>
      <Button variant="outline" onClick={onLogout}>로그아웃</Button>
      <Button variant="destructive" onClick={onDelete}>서비스 탈퇴</Button>
    </div>
  );
};
