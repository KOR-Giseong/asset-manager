import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/icons/google-logo";

// =========================================
// 브랜드 섹션 - 장식 데이터
// =========================================

const FEATURES = [
  { label: "실시간 자산 추적", color: "bg-emerald-500" },
  { label: "스마트 세금 계산", color: "bg-blue-500" },
  { label: "맞춤형 리포트", color: "bg-violet-500" },
] as const;

// =========================================
// 브랜드 섹션 컴포넌트
// =========================================

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
// 로그인 섹션 컴포넌트
// =========================================

function LoginSection({
  signInAction,
  reason,
}: {
  signInAction: () => Promise<void>;
  reason?: string;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-white px-8 py-12 dark:bg-gray-950 md:min-h-screen">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl dark:border-gray-800 dark:bg-gray-900">
        {reason === "account_expired" && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-300">
            계정이 만료되어 영구 삭제되었습니다.
            <br />
            새로 가입하여 이용하실 수 있습니다.
          </div>
        )}
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white md:text-2xl">
            로그인
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            계속하려면 Google 계정으로 로그인하세요
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500 dark:bg-gray-900">소셜 로그인</span>
          </div>
        </div>

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

        <p className="text-center text-xs text-gray-400">
          로그인하면{" "}
          <span className="underline underline-offset-2">서비스 이용약관</span>
          {" "}및{" "}
          <span className="underline underline-offset-2">개인정보 처리방침</span>
          에 동의하게 됩니다.
        </p>
      </div>

      <p className="mt-8 text-xs text-gray-400">
        © 2026 Asset Manager. All rights reserved.
      </p>
    </div>
  );
}

// =========================================
// 메인 페이지 컴포넌트
// =========================================

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  async function handleSignIn() {
    "use server";
    await signIn("google", { redirectTo: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col md:grid md:grid-cols-2">
      <BrandSection />
      <LoginSection signInAction={handleSignIn} reason={searchParams.reason} />
    </div>
  );
}
