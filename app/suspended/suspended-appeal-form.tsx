"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function SuspendedAppealForm({ userId }: { userId: string }) {
  const [appeal, setAppeal] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/suspended-appeal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, appeal }),
    });
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <div className="text-green-600 font-semibold mt-4">
        해제 신청이 접수되었습니다. 관리자 검토 후 처리됩니다.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 mt-4 text-left">
      <p className="text-sm text-muted-foreground font-medium">해제 신청 사유</p>
      <Textarea
        value={appeal}
        onChange={(e) => setAppeal(e.target.value)}
        placeholder="해제 신청 사유를 입력하세요 (최소 5자)"
        minLength={5}
        required
        className="min-h-[80px]"
      />
      <Button
        type="submit"
        disabled={loading || appeal.trim().length < 5}
        className="w-full"
      >
        {loading ? "신청 중..." : "해제 신청"}
      </Button>
    </form>
  );
}
