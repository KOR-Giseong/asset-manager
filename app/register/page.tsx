"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle2, Mail } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", confirm: "", nickname: "" });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.email || !form.password || !form.confirm || !form.nickname)
      return "모든 항목을 입력해주세요.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "올바른 이메일 형식이 아닙니다.";
    if (form.password.length < 8)
      return "비밀번호는 8자 이상이어야 합니다.";
    if (form.password !== form.confirm)
      return "비밀번호가 일치하지 않습니다.";
    if (form.nickname.length < 2 || form.nickname.length > 16)
      return "닉네임은 2~16자여야 합니다.";
    if (!/^[a-zA-Z0-9가-힣]+$/.test(form.nickname))
      return "닉네임은 한글, 영문, 숫자만 사용 가능합니다.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, nickname: form.nickname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "회원가입에 실패했습니다.");
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
          <h2 className="text-xl font-bold text-foreground">인증 메일을 발송했습니다</h2>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">{form.email}</strong>로 인증 링크를 보냈습니다.
            <br />메일함을 확인하고 링크를 클릭해 인증을 완료해주세요.
          </p>
          <p className="text-xs text-muted-foreground">링크는 24시간 동안 유효합니다.</p>
          <Link href="/login">
            <Button variant="outline" className="w-full mt-2">로그인 페이지로 이동</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-foreground">회원가입</h1>
          <p className="text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              로그인
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-8 shadow-xl space-y-4">
          {/* 이메일 */}
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">이메일</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="example@email.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 닉네임 */}
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">닉네임</label>
            <input
              type="text"
              required
              value={form.nickname}
              onChange={(e) => update("nickname", e.target.value)}
              placeholder="2~16자, 한글/영문/숫자"
              maxLength={16}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="8자 이상"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {/* 비밀번호 강도 힌트 */}
            {form.password && (
              <div className="mt-1.5 flex gap-1">
                {[4, 6, 8].map((n) => (
                  <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${
                    form.password.length >= n
                      ? n === 4 ? "bg-red-400" : n === 6 ? "bg-amber-400" : "bg-emerald-500"
                      : "bg-secondary"
                  }`} />
                ))}
                <span className="ml-1 text-[10px] text-muted-foreground">
                  {form.password.length < 4 ? "너무 짧음" : form.password.length < 6 ? "약함" : form.password.length < 8 ? "보통" : "안전"}
                </span>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label className="mb-1 block text-xs font-medium text-foreground">비밀번호 확인</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                required
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                placeholder="비밀번호 재입력"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              {form.confirm && form.password === form.confirm && (
                <CheckCircle2 size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-500" />
              )}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <Button type="submit" size="lg" disabled={loading} className="w-full py-6">
            {loading ? "처리 중..." : "회원가입"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            가입하면{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">서비스 이용약관</Link>
            {" "}및{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">개인정보 처리방침</Link>
            에 동의하게 됩니다.
          </p>
        </form>
      </div>
    </div>
  );
}
