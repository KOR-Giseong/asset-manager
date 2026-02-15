import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { TaxCenter } from "@/components/tax/tax-center";
import { SidebarLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
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
    <SidebarLayout>
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-background to-muted/20">
        <PageHeader
          title="세금 & 절세 마스터 센터"
          subtitle="2026년 최신 세법 기준 · 맞춤형 절세 전략"
          icon={ShieldCheck}
          iconGradient="from-violet-500 to-purple-600"
        />

        <div className="container max-w-6xl px-4 py-6 overflow-x-hidden">
          <TaxCenter initialData={initialData} />
        </div>
      </div>
    </SidebarLayout>
  );
}
