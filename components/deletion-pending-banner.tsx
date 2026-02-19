"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import { cancelDeleteAccount } from "@/actions/settings";

interface DeletionPendingBannerProps {
  scheduledAt: string; // ISO string
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "곧 삭제됩니다";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}시간 ${m}분 ${s}초`;
}

export function DeletionPendingBanner({ scheduledAt }: DeletionPendingBannerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [remaining, setRemaining] = useState("");

  const deleteAt = new Date(scheduledAt).getTime() + 24 * 60 * 60 * 1000;

  useEffect(() => {
    const tick = () => setRemaining(formatRemaining(deleteAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deleteAt]);

  function handleCancel() {
    startTransition(async () => {
      await cancelDeleteAccount();
      router.refresh();
    });
  }

  return (
    <div className="w-full bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/50 px-4 py-2.5">
      <div className="max-w-3xl mx-auto flex items-center gap-3 text-sm">
        <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="flex-1 text-amber-800 dark:text-amber-300">
          <span className="font-semibold">탈퇴 예정:</span>{" "}
          <span className="tabular-nums">{remaining}</span> 후 계정이 삭제됩니다.
          24시간 이내 재로그인하면 자동으로 취소됩니다.
        </p>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="shrink-0 flex items-center gap-1 rounded-md bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white px-3 py-1 text-xs font-medium transition-colors"
        >
          {isPending ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <X size={13} />
          )}
          탈퇴 취소
        </button>
      </div>
    </div>
  );
}
