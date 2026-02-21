"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "오류가 발생했습니다.");
      } else {
        setDone(true);
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
              <Mail className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-foreground">메일을 발송했습니다</h2>
          <p className="text-sm text-muted-foreground">
            입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.
            <br />메일함을 확인해주세요.
          </p>
          <p className="text-xs text-muted-foreground">링크는 1시간 동안 유효합니다.</p>
          <Link href="/login">
            <Button variant="outline" className="w-full mt-2">로그인으로 이동</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          로그인으로 돌아가기
        </Link>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8 shadow-xl space-y-5">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">비밀번호 찾기</h1>
            <p className="text-sm text-muted-foreground">
              가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">이메일</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button type="submit" size="lg" disabled={loading} className="w-full py-6">
            {loading ? "발송 중..." : "재설정 메일 발송"}
          </Button>
        </form>
      </div>
    </div>
  );
}
