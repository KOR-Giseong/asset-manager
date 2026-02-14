"use client";

// =========================================
// 해외주식 양도세 계산기
// =========================================

import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, Info, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateForeignStockTax } from "@/services/taxService";
import { formatKRW } from "@/lib/format";

// =========================================
// 타입 정의
// =========================================

interface ForeignStockTaxCalculatorProps {
  foreignStockValue: number;
}

// =========================================
// 메인 컴포넌트
// =========================================

export function ForeignStockTaxCalculator({
  foreignStockValue,
}: ForeignStockTaxCalculatorProps) {
  const [totalGain, setTotalGain] = useState(foreignStockValue * 0.1 || 10_000_000);
  const [totalLoss, setTotalLoss] = useState(0);

  // 계산 결과
  const result = useMemo(() => {
    return calculateForeignStockTax({
      totalGain,
      totalLoss,
    });
  }, [totalGain, totalLoss]);

  // 입력값 파싱
  function parseNumber(value: string): number {
    const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 sm:p-4">
        <Info className="h-5 w-5 shrink-0 text-amber-500" />
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground sm:text-sm">
            해외주식 양도세 계산 (2026년 기준)
          </p>
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            해외주식 양도차익에서 연간 250만원 기본공제 후 22% 세율(양도세 20% + 지방소득세 2%)이 적용됩니다.
            손익통산이 가능하여 손실과 이익을 합산할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 보유 해외주식 정보 */}
      {foreignStockValue > 0 && (
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-medium">보유 해외주식 현황</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatKRW(foreignStockValue)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            실현 수익을 아래에 입력하세요
          </p>
        </div>
      )}

      {/* 입력 폼 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gain" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            실현 수익 (연간)
          </Label>
          <div className="relative">
            <Input
              id="gain"
              type="text"
              value={totalGain.toLocaleString()}
              onChange={(e) => setTotalGain(parseNumber(e.target.value))}
              className="pr-8 text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              원
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            올해 실현한 총 수익금액
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="loss" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            실현 손실 (연간)
          </Label>
          <div className="relative">
            <Input
              id="loss"
              type="text"
              value={totalLoss.toLocaleString()}
              onChange={(e) => setTotalLoss(parseNumber(e.target.value))}
              className="pr-8 text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              원
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            손익통산을 위한 손실금액
          </p>
        </div>
      </div>

      {/* 계산 과정 */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-4 text-sm font-semibold">📊 양도세 계산 과정</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded bg-background/50 p-2 text-xs sm:text-sm">
            <span className="text-muted-foreground">실현 수익</span>
            <span className="font-medium text-emerald-500">+{formatKRW(totalGain)}</span>
          </div>
          {totalLoss > 0 && (
            <div className="flex items-center justify-between rounded bg-background/50 p-2 text-xs sm:text-sm">
              <span className="text-muted-foreground">실현 손실 (손익통산)</span>
              <span className="font-medium text-red-500">-{formatKRW(totalLoss)}</span>
            </div>
          )}
          <div className="flex items-center justify-between rounded bg-background/50 p-2 text-xs sm:text-sm">
            <span className="text-muted-foreground">순수익</span>
            <span className="font-bold">{formatKRW(result.netGain)}</span>
          </div>
          <div className="flex items-center justify-between rounded bg-background/50 p-2 text-xs sm:text-sm">
            <span className="text-muted-foreground">기본공제</span>
            <span className="font-medium text-red-500">-{formatKRW(result.basicDeduction)}</span>
          </div>
          <div className="flex items-center justify-between rounded bg-primary/5 p-2 text-xs sm:text-sm">
            <span className="font-medium">과세대상 수익</span>
            <span className="font-bold">{formatKRW(result.taxableGain)}</span>
          </div>
        </div>
      </div>

      {/* 결과 카드 */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground sm:text-xs">순수익</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">
              {formatKRW(result.netGain)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground sm:text-xs">기본공제</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">
              {formatKRW(result.basicDeduction)}
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">연 250만원</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground sm:text-xs">적용 세율</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">
              {(result.taxRate * 100).toFixed(0)}%
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">양도세 20% + 지방세 2%</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground sm:text-xs">납부 세금</p>
            <p className="text-lg font-bold text-red-500 sm:text-xl">
              {formatKRW(result.totalTax)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 절세 팁 */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-3 text-sm font-semibold">💡 해외주식 양도세 절세 팁</h4>
        <div className="space-y-2 text-xs text-muted-foreground sm:text-sm">
          <p>
            <strong>손익통산 활용:</strong> 수익이 난 종목과 손실이 난 종목을 같은 해에 매도하면
            손실분만큼 과세대상에서 제외됩니다.
          </p>
          <p>
            <strong>기본공제 분산:</strong> 매년 250만원의 기본공제가 있으므로,
            수익 실현을 여러 해에 분산하면 절세 효과가 큽니다.
          </p>
          <p>
            <strong>ISA 활용:</strong> ISA 계좌에서 해외주식 ETF를 매매하면
            비과세 또는 9.9% 분리과세 혜택을 받을 수 있습니다.
          </p>
          <p>
            <strong>신고 기한:</strong> 매년 5월에 전년도 해외주식 양도소득을 신고해야 합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
