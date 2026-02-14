import { TrendingUp, Building2, PiggyBank } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddAssetDialog } from "@/components/add-asset-dialog";
import { AssetChart } from "@/components/asset-chart";
import { AssetTable } from "@/components/asset-table";
import { RefreshButton } from "@/components/refresh-button";
import { UserNav } from "@/components/user-nav";
import { PropertyDashboard } from "@/components/property";
import { getAssets } from "@/app/actions/asset-actions";
import { getProperties } from "@/app/actions/property-actions";
import { auth } from "@/auth";
import { LoginButton } from "@/components/login-button";
import { formatKRW } from "@/lib/format";
import { calculateTotalAssets, calculateCategoryTotals } from "@/lib/asset-utils";
import { calculatePortfolioSummary } from "@/services/propertyService";
import type { AssetCategory, ChartDataItem } from "@/types/asset";

const CHART_COLORS: Record<AssetCategory, string> = {
  주식: "hsl(217, 91%, 60%)",
  부동산: "hsl(160, 84%, 39%)",
  예적금: "hsl(38, 92%, 50%)",
};

const CATEGORIES = [
  { name: "주식" as const, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { name: "부동산" as const, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { name: "예적금" as const, icon: PiggyBank, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
] as const;

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              자산 관리 대시보드
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              나의 자산을 한눈에 관리하고 분석하세요
            </p>
          </div>
          <Card className="border-border/60 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">시작하기</CardTitle>
              <CardDescription>
                Google 계정으로 로그인하여 자산 관리를 시작하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoginButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const assets = await getAssets();
  const properties = await getProperties();
  
  // 자산 계산
  const assetTotal = calculateTotalAssets(assets);
  const categoryTotals = calculateCategoryTotals(assets);
  
  // 부동산 포트폴리오 계산
  const propertySummary = calculatePortfolioSummary(properties);
  
  // 총 자산 = 주식/예적금 + 부동산 순자산
  const totalAssets = assetTotal + propertySummary.totalEquity;

  const chartData: ChartDataItem[] = CATEGORIES.map((cat) => ({
    name: cat.name,
    value: cat.name === "부동산" 
      ? (categoryTotals[cat.name] || 0) + propertySummary.totalCurrentValue
      : categoryTotals[cat.name] || 0,
    color: CHART_COLORS[cat.name],
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              자산 관리 대시보드
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              나의 자산 현황을 한눈에 확인하세요
            </p>
          </div>
          <div className="flex items-center gap-4">
            <RefreshButton />
            <AddAssetDialog />
            <UserNav user={session.user} />
          </div>
        </div>

        {/* 총 자산 + 도넛 차트 */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm font-medium text-muted-foreground">
                총 자산
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  {formatKRW(totalAssets)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {assets.length}개 자산 + {properties.length}개 부동산 보유 중
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm font-medium text-muted-foreground">
                자산 비중
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetChart data={chartData} />
            </CardContent>
          </Card>
        </div>

        {/* 카테고리별 카드 */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {CATEGORIES.map((cat) => {
            // 부동산 카테고리는 Property 모델 데이터도 합산
            const amount = cat.name === "부동산"
              ? (categoryTotals[cat.name] || 0) + propertySummary.totalCurrentValue
              : categoryTotals[cat.name] || 0;
            const chartTotal = chartData.reduce((sum, d) => sum + d.value, 0);
            const ratio = chartTotal > 0 ? (amount / chartTotal) * 100 : 0;
            const Icon = cat.icon;

            return (
              <Card key={cat.name} className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-sm font-medium text-muted-foreground">
                    {cat.name}
                  </CardDescription>
                  <div className={`rounded-lg p-2 ${cat.bg}`}>
                    <Icon className={`h-4 w-4 ${cat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {formatKRW(amount)}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full transition-all ${cat.bg.replace("/10", "")}`}
                        style={{ width: `${ratio}%`, backgroundColor: CHART_COLORS[cat.name] }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {ratio.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 자산 목록 */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">자산 목록</CardTitle>
            <CardDescription>등록된 자산 내역입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <AssetTable assets={assets} />
          </CardContent>
        </Card>

        {/* 부동산 관리 섹션 */}
        <div className="mt-8">
          <PropertyDashboard 
            properties={properties} 
            totalAssetValue={assetTotal} 
          />
        </div>
      </div>
    </div>
  );
}
