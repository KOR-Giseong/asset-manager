"use client";

// =========================================
// ISA/IRP 절세 전략 계산기
// =========================================

import { useMemo } from "react";
import { ShieldCheck, Wallet, PiggyBank, TrendingUp, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateIsaIrpBenefit, formatTaxAmount } from "@/services/taxService";
import { formatKRW } from "@/lib/format";

// =========================================
// 타입 정의
// =========================================

interface IsaIrpCalculatorProps {
  annualSalary: number;
  onAnnualSalaryChange: (value: number) => void;
  isaDeposit: number;
  onIsaDepositChange: (value: number) => void;
  irpDeposit: number;
  onIrpDepositChange: (value: number) => void;
}

// =========================================
// 메인 컴포넌트
// =========================================

export function IsaIrpCalculator({
  annualSalary,
  onAnnualSalaryChange,
  isaDeposit,
  onIsaDepositChange,
  irpDeposit,
  onIrpDepositChange,
}: IsaIrpCalculatorProps) {
  // 계산 결과
  const result = useMemo(() => {
    return calculateIsaIrpBenefit({
      annualSalary,
      isaDeposit,
      irpDeposit,
      expectedReturn: 5,
    });
  }, [annualSalary, isaDeposit, irpDeposit]);

  // 입력값 파싱
  function parseNumber(value: string): number {
    const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="flex items-start gap-3 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 sm:p-4">
        <Info className="h-5 w-5 shrink-0 text-violet-500" />
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground sm:text-sm">
            ISA와 IRP를 활용한 절세 전략
          </p>
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            IRP(개인형퇴직연금)는 연 900만원 한도로 세액공제를 받을 수 있고,
            ISA(개인종합자산관리계좌)는 비과세 및 분리과세 혜택을 제공합니다.
          </p>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="salary" className="text-xs sm:text-sm">
            연봉 (세전)
          </Label>
          <div className="relative">
            <Input
              id="salary"
              type="text"
              value={annualSalary.toLocaleString()}
              onChange={(e) => onAnnualSalaryChange(parseNumber(e.target.value))}
              className="pr-8 text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              원
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="irp" className="text-xs sm:text-sm">
            IRP 연간 납입액 (최대 900만원)
          </Label>
          <div className="relative">
            <Input
              id="irp"
              type="text"
              value={irpDeposit.toLocaleString()}
              onChange={(e) => {
                const value = parseNumber(e.target.value);
                onIrpDepositChange(Math.min(value, 9_000_000));
              }}
              className="pr-8 text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              원
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="isa" className="text-xs sm:text-sm">
            ISA 연간 납입액 (최대 2,000만원)
          </Label>
          <div className="relative">
            <Input
              id="isa"
              type="text"
              value={isaDeposit.toLocaleString()}
              onChange={(e) => {
                const value = parseNumber(e.target.value);
                onIsaDepositChange(Math.min(value, 20_000_000));
              }}
              className="pr-8 text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              원
            </span>
          </div>
        </div>
      </div>

      {/* 결과 카드 */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* IRP 세액공제 */}
        <Card className="border-blue-500/20 bg-blue-500/5 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <PiggyBank className="h-3.5 w-3.5 text-blue-500 sm:h-4 sm:w-4" />
              <span className="text-[10px] font-medium text-blue-500 sm:text-xs">IRP 세액공제</span>
            </div>
            <p className="text-base font-bold text-foreground truncate sm:text-2xl">
              {formatKRW(result.irpDeduction)}
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground sm:text-xs">
              공제율: {(result.irpDeductionRate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        {/* ISA 비과세 한도 */}
        <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Wallet className="h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4" />
              <span className="text-[10px] font-medium text-emerald-500 sm:text-xs">ISA 비과세</span>
            </div>
            <p className="text-base font-bold text-foreground truncate sm:text-2xl">
              {formatKRW(result.isaNonTaxableLimit)}
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground sm:text-xs">
              {annualSalary <= 50_000_000 ? "서민형" : "일반형"}
            </p>
          </CardContent>
        </Card>

        {/* ISA 절세 금액 */}
        <Card className="border-amber-500/20 bg-amber-500/5 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500 sm:h-4 sm:w-4" />
              <span className="text-[10px] font-medium text-amber-500 sm:text-xs">ISA 절세</span>
            </div>
            <p className="text-base font-bold text-foreground truncate sm:text-2xl">
              {formatKRW(result.isaTaxSaved)}
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground sm:text-xs">
              수익률 5% 기준
            </p>
          </CardContent>
        </Card>

        {/* 총 절세 효과 */}
        <Card className="border-violet-500/20 bg-violet-500/5 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-violet-500 sm:h-4 sm:w-4" />
              <span className="text-[10px] font-medium text-violet-500 sm:text-xs">총 절세</span>
            </div>
            <p className="text-base font-bold text-violet-500 truncate sm:text-2xl">
              {formatKRW(result.totalTaxSaved)}
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground sm:text-xs">
              IRP + ISA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 상세 설명 */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-3 text-sm font-semibold">💡 절세 전략 가이드</h4>
        <div className="space-y-2 text-xs text-muted-foreground sm:text-sm">
          <p>
            <strong>IRP 세액공제:</strong> 연봉 5,500만원 이하는 16.5%, 초과 시 13.2%의 세액공제율이 적용됩니다.
            연 900만원까지 납입 가능하며, 최대 {formatTaxAmount(9_000_000 * 0.165)}의 세금을 절약할 수 있습니다.
          </p>
          <p>
            <strong>ISA 비과세:</strong> 3년 이상 유지 시 {annualSalary <= 50_000_000 ? "400만원" : "200만원"}까지의 수익에 대해 비과세됩니다.
            비과세 한도 초과분은 9.9% 분리과세로 일반 과세(15.4%)보다 유리합니다.
          </p>
          <p>
            <strong>추천 전략:</strong> IRP 900만원 → ISA 2,000만원 순으로 납입하여 세액공제와 비과세 혜택을 모두 받으세요.
          </p>
        </div>
      </div>
    </div>
  );
}
