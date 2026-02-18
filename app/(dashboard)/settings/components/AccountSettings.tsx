"use client";
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { CheckCircle2, LogOut, Trash2 } from "lucide-react";

interface AccountSettingsProps {
  nickname: string;
  onNicknameChange: (nickname: string) => Promise<void>;
  onLogout: () => void;
  onDelete: () => void;
}

export const AccountSettings: FC<AccountSettingsProps> = ({
  nickname,
  onNicknameChange,
  onLogout,
  onDelete,
}) => {
  const { register, handleSubmit, formState } = useForm({ defaultValues: { nickname } });
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleNickname: SubmitHandler<{ nickname: string }> = async (data) => {
    setChecking(true);
    setError("");
    setSuccess(false);
    try {
      await onNicknameChange(data.nickname);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("오류 발생");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-lg">
      {/* 프로필 섹션 */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">프로필</h3>
        <p className="text-xs text-muted-foreground mb-4">앱에서 표시될 닉네임을 설정합니다.</p>
        <form onSubmit={handleSubmit(handleNickname)} className="space-y-3">
          <div className="flex gap-2">
            <Input
              {...register("nickname", { required: true })}
              disabled={checking}
              placeholder="닉네임 입력"
              className="flex-1"
            />
            <Button type="submit" disabled={checking || formState.isSubmitting} size="sm">
              {checking ? "저장 중..." : "저장"}
            </Button>
          </div>
          {success && (
            <div className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle2 size={14} />
              닉네임이 변경되었습니다.
            </div>
          )}
          {error && <div className="text-sm text-destructive">{error}</div>}
        </form>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">계정 관리</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">로그아웃</p>
              <p className="text-xs text-muted-foreground">현재 세션을 종료합니다.</p>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5">
              <LogOut size={14} />
              로그아웃
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-destructive">서비스 탈퇴</p>
              <p className="text-xs text-muted-foreground">계정 및 모든 데이터가 삭제됩니다.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1.5">
              <Trash2 size={14} />
              탈퇴
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
