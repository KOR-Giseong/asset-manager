"use client";
import { FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { CheckCircle2, LogOut, Trash2, Clock, X } from "lucide-react";

interface AccountSettingsProps {
  nickname: string;
  deletedAt?: string | null;
  onNicknameChange: (nickname: string) => Promise<void>;
  onLogout: () => void;
  onDelete: () => void;
  onCancelDelete?: () => Promise<void>;
}

export const AccountSettings: FC<AccountSettingsProps> = ({
  nickname,
  deletedAt,
  onNicknameChange,
  onLogout,
  onDelete,
  onCancelDelete,
}) => {
  const { register, handleSubmit, formState, reset } = useForm({ defaultValues: { nickname } });
  const [checking, setChecking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 서버에서 닉네임이 바뀌면 폼도 갱신
  useEffect(() => { reset({ nickname }); }, [nickname, reset]);

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

  const handleCancelDelete = async () => {
    if (!onCancelDelete) return;
    setCancelling(true);
    try {
      await onCancelDelete();
    } finally {
      setCancelling(false);
    }
  };

  // 탈퇴 신청 시각 + 24시간 = 삭제 예정 시각
  const deleteScheduledAt = deletedAt
    ? new Date(new Date(deletedAt).getTime() + 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="space-y-6 md:space-y-8 w-full max-w-lg">
      {/* 프로필 섹션 */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">프로필</h3>
        <p className="text-xs text-muted-foreground mb-4">웹에서 표시될 닉네임을 설정합니다.</p>
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

          {/* 탈퇴 예정 상태 */}
          {deletedAt && deleteScheduledAt ? (
            <div className="rounded-lg border border-amber-300/60 bg-amber-50/60 dark:border-amber-700/40 dark:bg-amber-950/20 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <Clock size={15} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-300">탈퇴 신청 중</p>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                      {deleteScheduledAt.toLocaleString("ko-KR")}에 계정이 영구 삭제됩니다.
                    </p>
                    <p className="text-xs text-amber-600/70 dark:text-amber-500/70 mt-1">
                      재로그인하면 탈퇴가 자동으로 취소됩니다.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelDelete}
                  disabled={cancelling}
                  className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30 gap-1.5"
                >
                  {cancelling ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <X size={13} />
                  )}
                  탈퇴 취소
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-destructive">서비스 탈퇴</p>
                <p className="text-xs text-muted-foreground">탈퇴 신청 후 24시간 유예 기간이 부여됩니다.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1.5">
                <Trash2 size={14} />
                탈퇴
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
