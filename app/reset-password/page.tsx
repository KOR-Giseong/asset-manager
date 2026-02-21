"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl text-center space-y-4">
          <p className="text-sm text-muted-foreground">유효하지 않은 링크입니다.</p>
          <Link href="/forgot-password">
            <Button variant="outline" className="w-full">비밀번호 찾기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("비밀번호는 8자 이상이어야 합니다."); return; }
    if (password !== confirm) { setError("비밀번호가 일치하지 않습니다."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다.");
      } else {
        router.push("/login?reset=true");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8 shadow-xl space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">새 비밀번호 설정</h1>
            <p className="text-sm text-muted-foreground">사용할 새 비밀번호를 입력해주세요.</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">새 비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8자 이상"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {password && (
              <div className="mt-1.5 flex gap-1">
                {[4, 6, 8].map((n) => (
                  <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= n
                      ? n === 4 ? "bg-red-400" : n === 6 ? "bg-amber-400" : "bg-emerald-500"
                      : "bg-secondary"
                  }`} />
                ))}
                <span className="ml-1 text-[10px] text-muted-foreground">
                  {password.length < 4 ? "너무 짧음" : password.length < 6 ? "약함" : password.length < 8 ? "보통" : "안전"}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">비밀번호 확인</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="비밀번호 재입력"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              {confirm && password === confirm && (
                <CheckCircle2 size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-500" />
              )}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button type="submit" size="lg" disabled={loading} className="w-full py-6">
            {loading ? "변경 중..." : "비밀번호 변경"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
