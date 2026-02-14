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
import { UserNav } from "@/components/user-nav";
import { getAssets, type Asset } from "@/app/actions/asset-actions";
import { auth } from "@/auth";
import { LoginButton } from "@/components/login-button";

function formatKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

const CHART_COLORS = {
  주식: "hsl(217, 91%, 60%)",
  부동산: "hsl(160, 84%, 39%)",
  예적금: "hsl(38, 92%, 50%)",
} as const;

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

  const totalAssets = assets.reduce((sum: number, a: Asset) => sum + a.amount, 0);

  const categoryTotals = assets.reduce(
    (acc: Record<string, number>, a: Asset) => {
      acc[a.type] = (acc[a.type] || 0) + a.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const categories = [
    { name: "주식" as const, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { name: "부동산" as const, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { name: "예적금" as const, icon: PiggyBank, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  ];

  const chartData = categories.map((cat) => ({
    name: cat.name,
    value: categoryTotals[cat.name] || 0,
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
                {assets.length}개 자산 보유 중
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
          {categories.map((cat) => {
            const amount = categoryTotals[cat.name] || 0;
            const ratio = totalAssets > 0 ? (amount / totalAssets) * 100 : 0;
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
      </div>
    </div>
  );
}
