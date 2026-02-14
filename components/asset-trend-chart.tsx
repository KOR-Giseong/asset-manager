"use client";

// =========================================
// 자산 추이 선 그래프 (Line Chart)
// =========================================

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, History, Camera, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getChartDataAction, createManualSnapshot } from "@/app/actions/history-actions";
import { formatKRW, formatYAxis } from "@/lib/format";
import { toast } from "sonner";
import type { HistoryPeriod, ChartDataPoint, AssetChange } from "@/types/history";

// =========================================
// 기간 옵션
// =========================================

const PERIOD_OPTIONS: { value: HistoryPeriod; label: string }[] = [
  { value: "7d", label: "7일" },
  { value: "30d", label: "30일" },
  { value: "90d", label: "90일" },
  { value: "1y", label: "1년" },
  { value: "all", label: "전체" },
];

// =========================================
// 커스텀 툴팁
// =========================================

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    color: string;
    name: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/50 bg-background/95 p-3 shadow-lg backdrop-blur-sm">
      <p className="mb-2 text-sm font-medium text-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">{entry.name}</span>
            </div>
            <span className="text-sm font-medium">{formatKRW(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =========================================
// XAxis interval 계산 (모바일 대응)
// =========================================

function getXAxisInterval(dataLength: number, isMobile: boolean): number | "preserveStartEnd" {
  if (dataLength <= 7) return 0;
  if (isMobile) {
    if (dataLength <= 14) return 1;
    if (dataLength <= 30) return 4;
    return Math.floor(dataLength / 5);
  }
  if (dataLength <= 30) return 2;
  return Math.floor(dataLength / 8);
}

// =========================================
// 메인 컴포넌트
// =========================================

export function AssetTrendChart() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [period, setPeriod] = useState<HistoryPeriod>("30d");
  const [assetChange, setAssetChange] = useState<AssetChange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 차트 데이터 로드
  const loadData = useCallback(async (p: HistoryPeriod) => {
    setIsLoading(true);
    try {
      const result = await getChartDataAction(p);

      if (result.success && result.data) {
        setData(result.data.chartData);
        setAssetChange(result.data.change);
      } else {
        setData([]);
        setAssetChange(null);
      }
    } catch (error) {
      console.error("Failed to load chart data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(period);
  }, [period, loadData]);

  // 수동 스냅샷 생성
  function handleCreateSnapshot() {
    startTransition(async () => {
      toast.loading("스냅샷 기록 중...", { id: "create-snapshot" });
      const result = await createManualSnapshot();

      if (result.success) {
        toast.success("오늘의 자산 스냅샷이 기록되었습니다!", { id: "create-snapshot" });
        await loadData(period);
      } else {
        toast.error(result.error || "스냅샷 생성에 실패했습니다.", { id: "create-snapshot" });
      }
    });
  }

  // 변화율 색상
  const changeColor = assetChange
    ? assetChange.percentChange >= 0
      ? "text-emerald-500"
      : "text-red-500"
    : "text-muted-foreground";

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 sm:h-10 sm:w-10">
              <History className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">자산 추이</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {period === "7d" && "최근 7일간 자산 변화"}
                {period === "30d" && "최근 30일간 자산 변화"}
                {period === "90d" && "최근 90일간 자산 변화"}
                {period === "1y" && "최근 1년간 자산 변화"}
                {period === "all" && "전체 기간 자산 변화"}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 변화율 배지 */}
            {assetChange && (
              <Badge
                variant={assetChange.percentChange >= 0 ? "default" : "destructive"}
                className="gap-1 text-xs"
              >
                {assetChange.percentChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {assetChange.percentChange >= 0 ? "+" : ""}
                {assetChange.percentChange.toFixed(2)}%
              </Badge>
            )}

            {/* 스냅샷 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateSnapshot}
              disabled={isPending}
              className="h-9 gap-1.5 px-3 text-xs sm:gap-2 sm:px-4 sm:text-sm"
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
              ) : (
                <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              )}
              <span className="hidden sm:inline">스냅샷</span>
            </Button>
          </div>
        </div>

        {/* 기간 선택 탭 */}
        <div className="mt-3 flex gap-1 overflow-x-auto sm:mt-4">
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={period === option.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setPeriod(option.value)}
              className="h-7 shrink-0 px-2.5 text-xs sm:px-3"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3 sm:p-6 sm:pt-4">
        {isLoading ? (
          <div className="flex h-[200px] items-center justify-center sm:h-[300px]">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground sm:h-8 sm:w-8" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center gap-3 text-center sm:h-[300px] sm:gap-4">
            <History className="h-10 w-10 text-muted-foreground/50 sm:h-12 sm:w-12" />
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">
                아직 기록된 히스토리가 없습니다
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground/70 sm:text-xs">
                &apos;스냅샷&apos; 버튼을 눌러 오늘의 자산을 기록하세요
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateSnapshot}
              disabled={isPending}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              첫 스냅샷 기록하기
            </Button>
          </div>
        ) : (
          <div className="h-[200px] w-full sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={
                  isMobile
                    ? { top: 5, right: 5, left: -15, bottom: 0 }
                    : { top: 10, right: 10, left: -10, bottom: 0 }
                }
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="displayDate"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={isMobile ? 9 : 10}
                  tickLine={false}
                  axisLine={false}
                  interval={getXAxisInterval(data.length, isMobile)}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={isMobile ? 9 : 10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatYAxis}
                  width={isMobile ? 40 : 50}
                />
                <Tooltip content={<CustomTooltip />} />
                {!isMobile && (
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="total"
                  name="총자산"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorTotal)"
                  dot={false}
                  activeDot={{ r: isMobile ? 4 : 6, fill: "#3b82f6" }}
                />
                <Line
                  type="monotone"
                  dataKey="stock"
                  name="주식"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="property"
                  name="부동산"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="deposit"
                  name="예적금"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 변화 요약 */}
        {assetChange && data.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/50 pt-3 sm:mt-4 sm:grid-cols-4 sm:gap-4 sm:pt-4">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground sm:text-xs">시작 자산</p>
              <p className="truncate text-xs font-semibold sm:text-sm">{formatKRW(assetChange.startAmount)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground sm:text-xs">현재 자산</p>
              <p className="truncate text-xs font-semibold sm:text-sm">{formatKRW(assetChange.endAmount)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground sm:text-xs">변화 금액</p>
              <p className={`truncate text-xs font-semibold sm:text-sm ${changeColor}`}>
                {assetChange.absoluteChange >= 0 ? "+" : ""}
                {formatKRW(assetChange.absoluteChange)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground sm:text-xs">변화율</p>
              <p className={`text-xs font-semibold sm:text-sm ${changeColor}`}>
                {assetChange.percentChange >= 0 ? "+" : ""}
                {assetChange.percentChange.toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
