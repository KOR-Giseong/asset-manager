import {
  TrendingUp,
  Building2,
  PiggyBank,
  LayoutDashboard,
  History,
  CalendarDays,
  ShieldCheck,
  MessageSquare,
  ArrowUpRight,
} from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
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
import { AssetTrendChart } from "@/components/asset-trend-chart";
import { RefreshButton } from "@/components/refresh-button";
import { UserNav } from "@/components/user-nav";
import { PropertySummaryCard } from "@/components/property";
import { PageHeader } from "@/components/ui/page-header";
import { getAssets } from "@/app/actions/asset-actions";
import { getProperties } from "@/app/actions/property-actions";
import { FormattedCurrency } from "@/components/formatted-currency";
import { calculateTotalAssets, calculateCategoryTotals } from "@/lib/asset-utils";
import { calculatePortfolioSummary } from "@/services/propertyService";
import type { AssetCategory, ChartDataItem } from "@/types/asset";

const CHART_COLORS: Record<AssetCategory, string> = {
  주식: "hsl(217, 91%, 60%)",
  부동산: "hsl(160, 84%, 39%)",
  예적금: "hsl(38, 92%, 50%)",
};

const ASSET_CATEGORIES = [
  { name: "주식" as const, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "부동산" as const, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "예적금" as const, icon: PiggyBank, color: "text-amber-500", bg: "bg-amber-500/10" },
] as const;

const QUICK_MENU = [
  { label: "자산 히스토리", href: "/history", icon: History, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "현금흐름", href: "/cashflow", icon: CalendarDays, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "부동산", href: "/property", icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "세금/절세", href: "/tax", icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "게시판", href: "/board", icon: MessageSquare, color: "text-rose-500", bg: "bg-rose-500/10" },
] as const;

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const assets = await getAssets();
  const properties = await getProperties();

  const assetTotal = calculateTotalAssets(assets);
  const categoryTotals = calculateCategoryTotals(assets);
  const propertySummary = calculatePortfolioSummary(properties);
  const totalAssets = assetTotal + propertySummary.totalEquity;

  const chartData: ChartDataItem[] = ASSET_CATEGORIES.map((cat) => ({
    name: cat.name,
    value: cat.name === "부동산"
      ? (categoryTotals[cat.name] || 0) + propertySummary.totalCurrentValue
      : categoryTotals[cat.name] || 0,
    color: CHART_COLORS[cat.name],
  }));

  const chartTotal = chartData.reduce((sum, d) => sum + d.value, 0);
  const firstName = session.user.name?.split(" ").at(-1) ?? "사용자";

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="대시보드"
        subtitle="나의 자산 현황을 한눈에 확인하세요"
        icon={LayoutDashboard}
        iconColor="bg-primary/10"
        iconTextColor="text-primary"
      >
        <RefreshButton />
        <AddAssetDialog />
        <UserNav user={session.user} />
      </PageHeader>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">

        {/* ── 히어로 ── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 shadow-xl">
          {/* 배경 장식 */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-8 right-24 h-36 w-36 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute top-6 right-48 h-20 w-20 rounded-full bg-white/5" />

          <div className="relative p-6 sm:p-8">
            {/* 날짜 + 인사 */}
            <p className="text-xs text-white/50 mb-1">{today}</p>
            <p className="text-sm font-medium text-white/80 mb-5">
              안녕하세요, {firstName}님 👋
            </p>

            {/* 총 자산 */}
            <div className="mb-5">
              <p className="text-xs text-white/60 mb-1">총 자산</p>
              <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
                <FormattedCurrency value={totalAssets} />
              </div>
              <p className="mt-2 text-sm text-white/60">
                {assets.length}개 자산 · {properties.length}개 부동산 보유 중
              </p>
            </div>

            {/* 카테고리 미니 요약 */}
            <div className="flex flex-wrap gap-x-5 gap-y-3 pb-5 border-b border-white/10">
              {ASSET_CATEGORIES.map((cat) => {
                const amount = cat.name === "부동산"
                  ? (categoryTotals[cat.name] || 0) + propertySummary.totalCurrentValue
                  : categoryTotals[cat.name] || 0;
                const ratio = chartTotal > 0 ? ((amount / chartTotal) * 100).toFixed(1) : "0.0";
                return (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15">
                      <cat.icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/50 leading-none mb-0.5">{cat.name} {ratio}%</p>
                      <p className="text-sm font-semibold text-white leading-none">
                        <FormattedCurrency value={amount} />
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 빠른 이동 링크 */}
            <div className="pt-4 flex flex-wrap gap-2">
              {QUICK_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/20 transition-colors"
                >
                  <item.icon className="h-3 w-3" />
                  {item.label}
                  <ArrowUpRight className="h-3 w-3 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── 빠른 메뉴 그리드 ── */}
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {QUICK_MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-card p-3 sm:p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl ${item.bg} transition-transform group-hover:scale-110`}>
                <item.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`} />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-foreground text-center leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* ── 카테고리 카드 + 자산 비중 차트 ── */}
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-3">
            {ASSET_CATEGORIES.map((cat) => {
              const amount = cat.name === "부동산"
                ? (categoryTotals[cat.name] || 0) + propertySummary.totalCurrentValue
                : categoryTotals[cat.name] || 0;
              const ratio = chartTotal > 0 ? (amount / chartTotal) * 100 : 0;

              return (
                <Card key={cat.name} className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                    <CardDescription className="text-xs font-medium text-muted-foreground">
                      {cat.name}
                    </CardDescription>
                    <div className={`rounded-lg p-1.5 ${cat.bg}`}>
                      <cat.icon className={`h-3.5 w-3.5 ${cat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="truncate text-lg font-bold text-foreground">
                      <FormattedCurrency value={amount} />
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${ratio}%`, backgroundColor: CHART_COLORS[cat.name] }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {ratio.toFixed(1)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-border/60 shadow-sm lg:col-span-2">
            <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
              <CardDescription className="text-xs font-medium text-muted-foreground sm:text-sm">
                자산 비중
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <AssetChart data={chartData} />
            </CardContent>
          </Card>
        </div>

        {/* ── 자산 추이 ── */}
        <AssetTrendChart />

        {/* ── 자산 목록 ── */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">자산 목록</CardTitle>
            <CardDescription className="text-xs sm:text-sm">등록된 자산 내역입니다.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <AssetTable assets={assets} />
          </CardContent>
        </Card>

        {/* ── 부동산 요약 ── */}
        <PropertySummaryCard
          summary={propertySummary}
          propertyCount={properties.length}
        />
      </div>
    </div>
  );
}
