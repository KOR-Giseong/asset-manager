"use client";

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function VerifyTwoFactorPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 2FA pending 상태가 아니면 홈으로
  useEffect(() => {
    if (session && !session.user.twoFactorPending) {
      router.replace("/");
    }
  }, [session, router]);

  // OTP 만료 여부 체크 - 만료됐으면 자동 로그아웃
  useEffect(() => {
    if (!session?.user?.twoFactorPending) return;
    fetch("/api/auth/verify-2fa")
      .then((res) => res.json())
      .then((data) => {
        if (!data.valid) {
          signOut({ callbackUrl: "/login" });
        }
      });
  }, [session]);

  const code = digits.join("");

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] ?? "";
    }
    setDigits(next);
    const lastFilled = Math.min(pasted.length, 5);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "인증에 실패했습니다.");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }

      // JWT에서 twoFactorPending 제거
      await update({ twoFactorPending: false });
      router.replace("/");
    } catch {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm mx-auto px-6">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="rounded-full bg-primary/10 p-4">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold">이중 인증</h1>
            <p className="text-sm text-muted-foreground mt-1">
              등록된 이메일로 발송된 6자리 코드를 입력해주세요.
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="w-11 h-14 text-center text-xl font-bold rounded-lg border border-input bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              disabled={loading}
              aria-label={`코드 ${i + 1}번째 자리`}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive text-center mb-4">{error}</p>
        )}

        <Button
          className="w-full"
          disabled={code.length !== 6 || loading}
          onClick={handleVerify}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              확인 중...
            </>
          ) : (
            "인증하기"
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          코드는 10분 동안 유효합니다.
        </p>
      </div>
    </div>
  );
}
