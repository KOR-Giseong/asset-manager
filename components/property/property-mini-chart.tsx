"use client";

// =========================================
// 부동산 미니 차트 - 자산 비중 및 부채 비율 시각화
// =========================================

import { formatKRW } from "@/lib/format";

interface PropertyMiniChartProps {
  assetRatio: number;    // 전체 자산 대비 이 부동산 비중 (%)
  debtRatio: number;     // 시세 대비 부채 비율 (%)
  equity: number;        // 순자산
  currentPrice: number;  // 현재 시세
}

export function PropertyMiniChart({
  assetRatio,
  debtRatio,
  equity,
  currentPrice,
}: PropertyMiniChartProps) {
  // 색상 결정
  const debtColor = debtRatio >= 80 ? "bg-red-500" : debtRatio >= 70 ? "bg-amber-500" : "bg-blue-500";
  const equityColor = equity >= 0 ? "bg-emerald-500" : "bg-red-500";

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-4">
      {/* 자산 비중 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">전체 자산 중 비중</span>
          <span className="font-semibold">{assetRatio.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(assetRatio, 100)}%` }}
          />
        </div>
      </div>

      {/* 부채 비율 (시세 대비) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">부채 비율 (시세 대비)</span>
          <span className={`font-semibold ${debtRatio >= 80 ? "text-red-500" : debtRatio >= 70 ? "text-amber-500" : ""}`}>
            {debtRatio.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={`h-full transition-all duration-500 ${debtColor}`}
            style={{ width: `${Math.min(debtRatio, 100)}%` }}
          />
        </div>
      </div>

      {/* 순자산 vs 시세 비교 바 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">순자산 / 시세</span>
          <span className={`font-semibold ${equity >= 0 ? "text-emerald-500" : "text-red-500"}`}>
            {formatKRW(equity)} / {formatKRW(currentPrice)}
          </span>
        </div>
        <div className="relative h-6 w-full overflow-hidden rounded-md bg-secondary">
          {/* 시세 전체 (100%) */}
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            시세
          </div>
          {/* 순자산 비율 */}
          {equity > 0 && currentPrice > 0 && (
            <div
              className={`absolute left-0 top-0 h-full ${equityColor} flex items-center justify-center text-xs text-white font-medium transition-all duration-500`}
              style={{ width: `${Math.min((equity / currentPrice) * 100, 100)}%` }}
            >
              {((equity / currentPrice) * 100).toFixed(0)}%
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {equity >= 0 
            ? `시세의 ${((equity / currentPrice) * 100).toFixed(1)}%가 순자산` 
            : `부채가 시세를 초과 (−${((Math.abs(equity) / currentPrice) * 100).toFixed(1)}%)`}
        </p>
      </div>
    </div>
  );
}
