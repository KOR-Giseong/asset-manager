"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { clearReactivationNotice } from "@/actions/settings";

export function ReactivationToast() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // DB 플래그 초기화
    clearReactivationNotice();
    // 3초 후 숨김
    const id = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(id);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-800 px-4 py-3 shadow-lg text-sm text-emerald-800 dark:text-emerald-300 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <CheckCircle2 size={16} className="shrink-0" />
      탈퇴가 취소되었습니다. 계속 이용하세요!
    </div>
  );
}
