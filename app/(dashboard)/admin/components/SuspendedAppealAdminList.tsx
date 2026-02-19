"use client";

import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle2, Loader2, UserCheck } from "lucide-react";
import { useState } from "react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function SuspendedAppealAdminList() {
  const { data, mutate } = useSWR("/api/admin/suspended-appeals", fetcher);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUnsuspend = async (userId: string) => {
    setLoadingId(userId);
    await fetch("/api/admin/unsuspend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setLoadingId(null);
    mutate();
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">불러오는 중...</span>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-destructive">권한이 없습니다.</p>
      </div>
    );
  }

  if (data.users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 size={40} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">해제 신청 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.users.map((u: any) => (
        <div key={u.id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* 상단: 사용자 정보 */}
          <div className="px-4 pt-4 pb-3 flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <div className="rounded-lg bg-destructive/10 p-2">
                <Ban size={16} className="text-destructive" />
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              {/* 닉네임 + 이메일 */}
              <div>
                <p className="text-sm font-semibold">{u.nickname}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>

              {/* 정지 사유 */}
              <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-3 py-2">
                <p className="text-[11px] font-semibold text-destructive mb-0.5">정지 사유</p>
                <p className="text-xs text-foreground">{u.suspendedReason || "사유 미기재"}</p>
              </div>

              {/* 해제 신청 사유 */}
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-[11px] font-semibold text-muted-foreground mb-0.5">해제 신청 사유</p>
                <p className="text-xs text-foreground">{u.suspendedAppeal}</p>
              </div>
            </div>
          </div>

          {/* 하단: 액션 */}
          <div className="px-4 pb-3 border-t pt-3 flex justify-end">
            <Button
              size="sm"
              className="text-xs h-7 gap-1.5"
              disabled={loadingId === u.id}
              onClick={() => handleUnsuspend(u.id)}
            >
              {loadingId === u.id ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <UserCheck size={11} />
              )}
              정지 해제
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
