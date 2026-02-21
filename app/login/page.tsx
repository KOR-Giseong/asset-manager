"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/icons/google-logo";
import { Eye, EyeOff } from "lucide-react";

// =========================================
// 브랜드 섹션
// =========================================

const FEATURES = [
  { label: "실시간 자산 추적", color: "bg-emerald-500" },
  { label: "스마트 세금 계산", color: "bg-blue-500" },
  { label: "맞춤형 리포트", color: "bg-violet-500" },
] as const;

function BrandSection() {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-12 text-center md:min-h-screen md:py-0">
      <div className="relative mb-4 h-40 w-40 md:h-56 md:w-56 lg:h-64 lg:w-64">
        <Image
          src="/asset-manager-logo.png"
          alt="Asset Manager Logo"
          fill
          className="object-contain drop-shadow-2xl"
          priority
          unoptimized
        />
      </div>
      <h1 className="mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text pb-2 text-3xl font-bold leading-normal tracking-tight text-transparent md:text-4xl lg:text-5xl">
        Asset Manager
      </h1>
      <p className="max-w-xs pt-1 text-sm text-gray-400 md:max-w-sm md:text-base lg:text-lg">
        효율적인 자산 관리를 시작하세요.
        <br />
        <span className="text-gray-500">투자, 부동산, 세금까지 한 곳에서.</span>
      </p>
      <div className="mt-8 hidden items-center gap-6 text-xs text-gray-500 md:mt-12 md:flex">
        {FEATURES.map((feature) => (
          <span key={feature.label} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${feature.color}`} />
            {feature.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// =========================================
// 로그인 섹션 내부 (useSearchParams 사용)
// =========================================

function LoginSectionInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? undefined;
  const verified = searchParams.get("verified") === "true";

  const [tab, setTab] = useState<"google" | "email">("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", { email, password, redirect: false });
      if (res?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.\n이메일 인증을 완료했는지 확인해주세요.");
      } else {
        router.push("/");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-white px-8 py-12 dark:bg-gray-950 md:min-h-screen">
      <div className="w-full max-w-sm space-y-5 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">

        {/* 상태 배너 */}
        {reason === "account_expired" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300">
            계정이 만료되어 영구 삭제되었습니다.
            <br />새로 가입하여 이용하실 수 있습니다.
          </div>
        )}
        {verified && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            이메일 인증이 완료되었습니다. 로그인해주세요.
          </div>
        )}

        <div className="space-y-1 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-2xl">
            로그인
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            계정이 없으신가요?{" "}
            <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              회원가입
            </Link>
          </p>
        </div>

        {/* 탭 */}
        <div className="flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
          <button
            type="button"
            onClick={() => { setTab("google"); setError(""); }}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              tab === "google"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Google
          </button>
          <button
            type="button"
            onClick={() => { setTab("email"); setError(""); }}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              tab === "email"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            이메일
          </button>
        </div>

        {/* Google 탭 */}
        {tab === "google" && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full gap-3 border-gray-300 bg-white py-6 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            <GoogleLogo className="h-5 w-5" />
            Google 계정으로 계속하기
          </Button>
        )}

        {/* 이메일 탭 */}
        {tab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">이메일</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">비밀번호</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="whitespace-pre-line text-xs text-red-500">{error}</p>}

            <Button type="submit" size="lg" disabled={loading} className="w-full py-6">
              {loading ? "로그인 중..." : "로그인"}
            </Button>

            <div className="text-center">
              <Link href="/forgot-password" className="text-xs text-gray-400 hover:text-gray-600 hover:underline dark:hover:text-gray-300">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gray-400">
          로그인하면{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">서비스 이용약관</Link>
          {" "}및{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">개인정보 처리방침</Link>
          에 동의하게 됩니다.
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-400">© 2026 Asset Manager. All rights reserved.</p>
    </div>
  );
}

// =========================================
// 메인 페이지
// =========================================

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col md:grid md:grid-cols-2">
      <BrandSection />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center" />}>
        <LoginSectionInner />
      </Suspense>
    </div>
  );
}
