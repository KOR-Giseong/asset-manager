"use client";

// =========================================
// 종합소득세 계산기
// =========================================

import { useMemo, useState } from "react";
import { Calculator, Briefcase, Building2, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateIncomeTax } from "@/services/taxService";
import { formatKRW } from "@/lib/format";

// =========================================
// 타입 정의
// =========================================

interface IncomeTaxCalculatorProps {
  annualSalary: number;
  onAnnualSalaryChange: (value: number) => void;
  rentalIncome: number;
}

// =========================================
// 메인 컴포넌트
// =========================================

export function IncomeTaxCalculator({
  annualSalary,
  onAnnualSalaryChange,
  rentalIncome: initialRentalIncome,
}: IncomeTaxCalculatorProps) {
  const [rentalIncome, setRentalIncome] = useState(initialRentalIncome);
  const [otherIncome, setOtherIncome] = useState(0);

  // 계산 결과
  const result = useMemo(() => {
    return calculateIncomeTax({
      annualSalary,
      rentalIncome,
      otherIncome,
    });
  }, [annualSalary, rentalIncome, otherIncome]);

  // 입력값 파싱
  function parseNumber(value: string): number {
    const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 sm:p-4">
        <Info className="h-5 w-5 shrink-0 text-blue-500" />
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground sm:text-sm">
            2026년 종합소득세 계산
          </p>
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            근로소득과 임대소득을 합산하여 종합소득세를 계산합니다.
            세율은 6%~45%의 누진세율이 적용됩니다.
          </p>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="salary" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Briefcase className="h-3.5 w-3.5 text-blue-500" />
            근로소득 (연봉)
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
          <Label htmlFor="rental" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Building2 className="h-3.5 w-3.5 text-emerald-500" />
            임대소득 (연간)
          </Label>
          <div className="relative">
            <Input
              id="rental"
              type="text"
              value={rentalIncome.toLocaleString()}
              onChange={(e) => setRentalIncome(parseNumber(e.target.value))}
              className="pr-8 text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              원
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="other" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Calculator className="h-3.5 w-3.5 text-amber-500" />
            기타소득 (연간)
          </Label>
          <div className="relative">
            <Input
              id="other"
              type="text"
              value={otherIncome.toLocaleString()}
              onChange={(e) => setOtherIncome(parseNumber(e.target.value))}
              className="pr-8 text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              원
            </span>
          </div>
        </div>
      </div>

      {/* 계산 과정 */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-4 text-sm font-semibold">📊 소득세 계산 과정</h4>
        
        <div className="space-y-4">
          {/* 근로소득 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-blue-500">1. 근로소득 계산</p>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
              <div className="flex justify-between rounded bg-background/50 p-2">
                <span className="text-muted-foreground">총 급여</span>
                <span className="font-medium">{formatKRW(result.grossSalary)}</span>
              </div>
              <div className="flex justify-between rounded bg-background/50 p-2">
                <span className="text-muted-foreground">근로소득공제</span>
                <span className="font-medium text-red-500">-{formatKRW(result.salaryDeduction)}</span>
              </div>
              <div className="flex justify-between rounded bg-background/50 p-2">
                <span className="text-muted-foreground">근로소득금액</span>
                <span className="font-bold">{formatKRW(result.netSalary)}</span>
              </div>
            </div>
          </div>

          {/* 임대소득 */}
          {rentalIncome > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-emerald-500">2. 임대소득 계산 (필요경비 50%)</p>
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                <div className="flex justify-between rounded bg-background/50 p-2">
                  <span className="text-muted-foreground">총 임대수입</span>
                  <span className="font-medium">{formatKRW(result.grossRental)}</span>
                </div>
                <div className="flex justify-between rounded bg-background/50 p-2">
                  <span className="text-muted-foreground">필요경비</span>
                  <span className="font-medium text-red-500">-{formatKRW(result.rentalDeduction)}</span>
                </div>
                <div className="flex justify-between rounded bg-background/50 p-2">
                  <span className="text-muted-foreground">임대소득금액</span>
                  <span className="font-bold">{formatKRW(result.netRental)}</span>
                </div>
              </div>
            </div>
          )}

          {/* 종합소득 */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-violet-500">3. 종합소득 및 세금</p>
            <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <div className="flex justify-between rounded bg-background/50 p-2">
                <span className="text-muted-foreground">종합소득금액</span>
                <span className="font-medium">{formatKRW(result.totalIncome)}</span>
              </div>
              <div className="flex justify-between rounded bg-background/50 p-2">
                <span className="text-muted-foreground">기본공제</span>
                <span className="font-medium text-red-500">-{formatKRW(result.basicDeduction)}</span>
              </div>
              <div className="flex justify-between rounded bg-background/50 p-2">
                <span className="text-muted-foreground">과세표준</span>
                <span className="font-bold">{formatKRW(result.taxableIncome)}</span>
              </div>
              <div className="flex justify-between rounded bg-background/50 p-2">
                <span className="text-muted-foreground">적용 세율</span>
                <span className="font-bold text-amber-500">{result.taxBracket}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 카드 */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground sm:text-xs">산출세액</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">
              {formatKRW(result.calculatedTax)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground sm:text-xs">지방소득세</p>
            <p className="text-lg font-bold text-foreground sm:text-xl">
              {formatKRW(result.localTax)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground sm:text-xs">총 납부세액</p>
            <p className="text-lg font-bold text-red-500 sm:text-xl">
              {formatKRW(result.totalTax)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-500/20 bg-violet-500/5">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground sm:text-xs">실효세율</p>
            <p className="text-lg font-bold text-violet-500 sm:text-xl">
              {result.effectiveRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 세율 구간 안내 */}
      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="w-full text-xs sm:text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">과세표준</th>
              <th className="px-3 py-2 text-center font-medium">세율</th>
              <th className="px-3 py-2 text-right font-medium">누진공제</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <tr className={result.taxableIncome <= 14_000_000 ? "bg-primary/5" : ""}>
              <td className="px-3 py-2">1,400만원 이하</td>
              <td className="px-3 py-2 text-center">6%</td>
              <td className="px-3 py-2 text-right">-</td>
            </tr>
            <tr className={result.taxableIncome > 14_000_000 && result.taxableIncome <= 50_000_000 ? "bg-primary/5" : ""}>
              <td className="px-3 py-2">1,400만원 ~ 5,000만원</td>
              <td className="px-3 py-2 text-center">15%</td>
              <td className="px-3 py-2 text-right">126만원</td>
            </tr>
            <tr className={result.taxableIncome > 50_000_000 && result.taxableIncome <= 88_000_000 ? "bg-primary/5" : ""}>
              <td className="px-3 py-2">5,000만원 ~ 8,800만원</td>
              <td className="px-3 py-2 text-center">24%</td>
              <td className="px-3 py-2 text-right">576만원</td>
            </tr>
            <tr className={result.taxableIncome > 88_000_000 && result.taxableIncome <= 150_000_000 ? "bg-primary/5" : ""}>
              <td className="px-3 py-2">8,800만원 ~ 1.5억원</td>
              <td className="px-3 py-2 text-center">35%</td>
              <td className="px-3 py-2 text-right">1,544만원</td>
            </tr>
            <tr className={result.taxableIncome > 150_000_000 ? "bg-primary/5" : ""}>
              <td className="px-3 py-2">1.5억원 초과</td>
              <td className="px-3 py-2 text-center">38~45%</td>
              <td className="px-3 py-2 text-right">1,994만원~</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
