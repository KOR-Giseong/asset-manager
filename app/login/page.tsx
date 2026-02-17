import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// =========================================
// 로그인 페이지 - Split Screen Layout
// =========================================

// Google 로고 SVG 컴포넌트
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// 브랜드 섹션 컴포넌트
function BrandSection() {
  return (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-12 text-center md:min-h-screen md:py-0">
      {/* 로고 */}
      <div className="relative mb-6 h-20 w-20 overflow-hidden rounded-2xl bg-white/10 p-3 shadow-2xl backdrop-blur-sm md:mb-8 md:h-28 md:w-28">
        <Image
          src="/asset-manager-logo.png"
          alt="Asset Manager Logo"
          fill
          className="object-contain p-2"
          priority
        />
      </div>

      {/* 제목 */}
      <h1 className="mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent md:mb-4 md:text-4xl lg:text-5xl">
        Asset Manager
      </h1>

      {/* 설명 */}
      <p className="max-w-xs text-sm text-gray-400 md:max-w-sm md:text-base lg:text-lg">
        효율적인 자산 관리를 시작하세요.
        <br />
        <span className="text-gray-500">투자, 부동산, 세금까지 한 곳에서.</span>
      </p>

      {/* 장식 요소 */}
      <div className="mt-8 hidden items-center gap-6 text-xs text-gray-500 md:flex md:mt-12">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          실시간 자산 추적
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          스마트 세금 계산
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet-500" />
          맞춤형 리포트
        </span>
      </div>
    </div>
  );
}

// 로그인 섹션 컴포넌트
function LoginSection({ signInAction }: { signInAction: () => Promise<void> }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-white px-8 py-12 md:min-h-screen dark:bg-gray-950">
      {/* 로그인 카드 */}
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {/* 헤더 */}
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-2xl">
            로그인
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            계속하려면 Google 계정으로 로그인하세요
          </p>
        </div>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-900">소셜 로그인</span>
          </div>
        </div>

        {/* 로그인 버튼 */}
        <form action={signInAction}>
          <Button
            type="submit"
            variant="outline"
            size="lg"
            className="w-full gap-3 border-gray-300 bg-white py-6 text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <GoogleLogo className="h-5 w-5" />
            Google 계정으로 계속하기
          </Button>
        </form>

        {/* 푸터 */}
        <p className="text-center text-xs text-gray-400">
          로그인하면{" "}
          <span className="underline underline-offset-2">서비스 이용약관</span>
          {" "}및{" "}
          <span className="underline underline-offset-2">개인정보 처리방침</span>
          에 동의하게 됩니다.
        </p>
      </div>

      {/* 저작권 */}
      <p className="mt-8 text-xs text-gray-400">
        © 2026 Asset Manager. All rights reserved.
      </p>
    </div>
  );
}

// =========================================
// 메인 페이지 컴포넌트
// =========================================

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  // Server Action
  async function handleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col md:grid md:grid-cols-2">
      {/* 왼쪽: 브랜드 섹션 */}
      <BrandSection />

      {/* 오른쪽: 로그인 섹션 */}
      <LoginSection signInAction={handleSignIn} />
    </div>
  );
}
