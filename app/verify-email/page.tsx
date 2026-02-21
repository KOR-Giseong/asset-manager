"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const ERROR_MAP: Record<string, { icon: React.ReactNode; title: string; desc: string }> = {
  invalid: {
    icon: <XCircle className="h-8 w-8 text-red-500" />,
    title: "유효하지 않은 링크",
    desc: "인증 링크가 올바르지 않습니다. 다시 회원가입을 시도해주세요.",
  },
  expired: {
    icon: <Clock className="h-8 w-8 text-amber-500" />,
    title: "만료된 링크",
    desc: "인증 링크가 만료되었습니다. 다시 회원가입하여 새 인증 메일을 받아주세요.",
  },
  missing: {
    icon: <XCircle className="h-8 w-8 text-red-500" />,
    title: "잘못된 접근",
    desc: "인증 토큰이 없습니다. 이메일 내 링크를 통해 접근해주세요.",
  },
  server: {
    icon: <XCircle className="h-8 w-8 text-red-500" />,
    title: "서버 오류",
    desc: "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  },
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const info = error ? ERROR_MAP[error] ?? ERROR_MAP.invalid : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-xl text-center space-y-4">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
            {info ? info.icon : <Mail className="h-8 w-8 text-blue-500" />}
          </div>
        </div>

        {info ? (
          <>
            <h2 className="text-xl font-bold text-foreground">{info.title}</h2>
            <p className="text-sm text-muted-foreground">{info.desc}</p>
            <Link href="/register">
              <Button className="w-full mt-2">회원가입 다시 시도</Button>
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-foreground">이메일을 확인해주세요</h2>
            <p className="text-sm text-muted-foreground">
              가입 시 입력한 이메일로 인증 링크를 발송했습니다.
              <br />메일함을 확인하고 링크를 클릭해 인증을 완료해주세요.
            </p>
            <p className="text-xs text-muted-foreground">링크는 24시간 동안 유효합니다.</p>
            <Link href="/login">
              <Button variant="outline" className="w-full mt-2">로그인으로 이동</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
