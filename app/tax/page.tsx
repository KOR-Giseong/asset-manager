import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TaxCenter } from "@/components/tax/tax-center";
import { prisma } from "@/lib/prisma";

export default async function TaxPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // 사용자 자산 데이터 가져오기
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      assets: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  // 자산 데이터에서 세금 계산에 필요한 정보 추출
  const assets = user.assets;

  // 부동산 자산 (매수가 합계)
  const propertyAssets = assets.filter((a) => a.type === "부동산");
  const propertyValue = propertyAssets.reduce((sum, a) => sum + (a.currentPrice || 0), 0);
  const propertyPurchasePrice = propertyAssets.reduce(
    (sum, a) => sum + (a.purchasePrice || a.amount || 0),
    0
  );

  // 월세 소득 계산 (연간) - 부동산 자산 기준 추정 (2% 연 수익률 가정)
  const rentalIncome = propertyValue * 0.02;

  // 주식 자산
  const stockAssets = assets.filter(
    (a) => a.type === "국내주식" || a.type === "해외주식"
  );
  const stockValue = stockAssets.reduce((sum, a) => sum + (a.currentPrice || 0), 0);
  const foreignStockValue = assets
    .filter((a) => a.type === "해외주식")
    .reduce((sum, a) => sum + (a.currentPrice || 0), 0);

  // 예금/적금 자산
  const depositAssets = assets.filter((a) => a.type === "예금/적금");
  const depositValue = depositAssets.reduce((sum, a) => sum + (a.currentPrice || 0), 0);

  // 배당/이자 소득 추정 (연간) - 주식 2%, 예금 3% 가정
  const dividendIncome = stockValue * 0.02;
  const interestIncome = depositValue * 0.03;

  // 초기 데이터 구성
  const initialData = {
    propertyValue,
    propertyPurchasePrice,
    rentalIncome,
    stockValue,
    foreignStockValue,
    depositValue,
    dividendIncome,
    interestIncome,
    totalAssets: assets.reduce((sum, a) => sum + (a.amount || 0), 0),
    savedAnnualSalary: user.annualSalary || null,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {/* 헤더 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 pl-12 md:pl-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg sm:h-12 sm:w-12">
              <svg
                className="h-5 w-5 text-white sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
                세금 & 절세 마스터 센터
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                2026년 최신 세법 기준 · 맞춤형 절세 전략
              </p>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <TaxCenter initialData={initialData} />
      </div>
    </div>
  );
}
