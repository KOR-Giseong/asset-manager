"use client";

// =========================================
// 건강보험료 시뮬레이션 계산기
// =========================================

import { useMemo, useState } from "react";
import { Briefcase, Building2, TrendingUp, Info, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateHealthInsurance } from "@/services/taxService";
import { formatKRW } from "@/lib/format";

// =========================================
// 타입 정의
// =========================================

interface HealthInsuranceCalculatorProps {
  annualSalary: number;
  onAnnualSalaryChange: (value: number) => void;
  rentalIncome: number;
  dividendIncome: number;
}

// =========================================
// 메인 컴포넌트
// =========================================

export function HealthInsuranceCalculator({
  annualSalary,
  onAnnualSalaryChange,
  rentalIncome: initialRentalIncome,
  dividendIncome: initialDividendIncome,
}: HealthInsuranceCalculatorProps) {
  const [rentalIncome, setRentalIncome] = useState(initialRentalIncome);
  const [dividendIncome, setDividendIncome] = useState(initialDividendIncome);
  const [otherIncome, setOtherIncome] = useState(0);

  // 계산 결과
  const result = useMemo(() => {
    return calculateHealthInsurance({
      annualSalary,
      rentalIncome,
      dividendIncome,
      otherIncome,
    });
  }, [annualSalary, rentalIncome, dividendIncome, otherIncome]);

  // 근로 외 소득 합계
  const nonSalaryIncome = rentalIncome + dividendIncome + otherIncome;
  const threshold = 20_000_000;
  const isOverThreshold = nonSalaryIncome > threshold;

  // 입력값 파싱
  function parseNumber(value: string): number {
    const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }

  return (
    <div className="space-y-6">
      {/* 안내 메시지 */}
      <div className="flex items-start gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 sm:p-4">
        <Info className="h-5 w-5 shrink-0 text-rose-500" />
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground sm:text-sm">
            건강보험료 시뮬레이션 (2026년 기준)
          </p>
          <p className="text-[10px] text-muted-foreground sm:text-xs">
            근로 외 소득(임대+배당+이자 등)이 연 2,000만원을 초과하면
            소득월액보험료가 추가로 부과됩니다. 보험료율은 약 7.09%입니다.
          </p>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="salary" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Briefcase className="h-3.5 w-3.5 text-blue-500" />
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
          <Label htmlFor="dividend" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
            배당/이자소득 (연간)
          </Label>
          <div className="relative">
            <Input
              id="dividend"
              type="text"
              value={dividendIncome.toLocaleString()}
              onChange={(e) => setDividendIncome(parseNumber(e.target.value))}
              className="pr-8 text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              원
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="other" className="text-xs sm:text-sm">
            기타 금융소득 (연간)
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

      {/* 근로 외 소득 요약 */}
      <div className={`rounded-lg border p-4 ${
        isOverThreshold 
          ? "border-amber-500/30 bg-amber-500/10" 
          : "border-border/60 bg-muted/30"
      }`}>
        <div className="flex items-center gap-2 mb-3">
          {isOverThreshold && <AlertTriangle className="h-4 w-4 text-amber-500" />}
          <span className="text-sm font-medium">
            근로 외 소득 현황
          </span>
        </div>
        
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-[10px] text-muted-foreground sm:text-xs">근로 외 소득 합계</p>
            <p className={`text-lg font-bold ${isOverThreshold ? "text-amber-500" : "text-foreground"}`}>
              {formatKRW(nonSalaryIncome)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground sm:text-xs">기준 금액</p>
            <p className="text-lg font-bold text-foreground">
              {formatKRW(threshold)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground sm:text-xs">초과 금액</p>
            <p className={`text-lg font-bold ${isOverThreshold ? "text-red-500" : "text-emerald-500"}`}>
              {isOverThreshold ? formatKRW(result.excessIncome) : "없음"}
            </p>
          </div>
        </div>

        {isOverThreshold && (
          <p className="mt-3 text-xs text-amber-600">
            ⚠️ 근로 외 소득이 2,000만원을 초과하여 소득월액보험료가 부과됩니다.
          </p>
        )}
      </div>

      {/* 결과 카드 */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-500/20 bg-blue-500/5 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[9px] text-muted-foreground sm:text-xs">기본 건보료 (월)</p>
            <p className="text-sm font-bold text-foreground truncate sm:text-xl">
              {formatKRW(result.salaryInsurance)}
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground">
              본인 50%
            </p>
          </CardContent>
        </Card>

        <Card className={`overflow-hidden ${
          result.additionalInsurance > 0 
            ? "border-amber-500/20 bg-amber-500/5" 
            : "border-emerald-500/20 bg-emerald-500/5"
        }`}>
          <CardContent className="p-3 sm:p-4">
            <p className="text-[9px] text-muted-foreground sm:text-xs">소득월액보험료</p>
            <p className={`text-sm font-bold truncate sm:text-xl ${
              result.additionalInsurance > 0 ? "text-amber-500" : "text-foreground"
            }`}>
              {result.additionalInsurance > 0 
                ? `+${formatKRW(result.additionalInsurance)}`
                : "없음"
              }
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground">
              초과소득×7.09%
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-500/20 bg-violet-500/5 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[9px] text-muted-foreground sm:text-xs">총 월 건보료</p>
            <p className="text-sm font-bold text-violet-500 truncate sm:text-xl">
              {formatKRW(result.totalMonthlyInsurance)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5 overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[9px] text-muted-foreground sm:text-xs">연간 건보료</p>
            <p className="text-sm font-bold text-red-500 truncate sm:text-xl">
              {formatKRW(result.totalAnnualInsurance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 건보료 절감 팁 */}
      <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
        <h4 className="mb-3 text-sm font-semibold">💡 건강보험료 절감 전략</h4>
        <div className="space-y-2 text-xs text-muted-foreground sm:text-sm">
          <p>
            <strong>소득 분산:</strong> 근로 외 소득을 연 2,000만원 이하로 관리하면
            소득월액보험료를 피할 수 있습니다.
          </p>
          <p>
            <strong>ISA 활용:</strong> ISA 계좌 내 수익은 비과세 또는 분리과세되어
            건강보험료 부과 대상에서 제외됩니다.
          </p>
          <p>
            <strong>배당금 수령 시기:</strong> 배당 소득이 2,000만원 초과 시
            종합과세로 전환되어 건보료 부과 대상이 됩니다.
          </p>
          <p>
            <strong>임대소득:</strong> 주택임대소득은 연 2,000만원 이하 시
            분리과세를 선택하면 건보료 부과 대상에서 제외될 수 있습니다.
          </p>
        </div>
      </div>

      {/* 건보료율 안내 */}
      <div className="overflow-x-auto rounded-lg border border-border/60 -mx-1 sm:mx-0">
        <table className="w-full text-[10px] sm:text-sm min-w-[250px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">항목</th>
              <th className="px-3 py-2 text-center font-medium">2026년 요율</th>
              <th className="px-3 py-2 text-right font-medium">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            <tr>
              <td className="px-3 py-2">건강보험료율</td>
              <td className="px-3 py-2 text-center font-medium">7.09%</td>
              <td className="px-3 py-2 text-right text-muted-foreground">본인 50% 부담</td>
            </tr>
            <tr>
              <td className="px-3 py-2">장기요양보험료율</td>
              <td className="px-3 py-2 text-center font-medium">12.95%</td>
              <td className="px-3 py-2 text-right text-muted-foreground">건보료의 12.95%</td>
            </tr>
            <tr>
              <td className="px-3 py-2">소득월액보험료</td>
              <td className="px-3 py-2 text-center font-medium">7.09%</td>
              <td className="px-3 py-2 text-right text-muted-foreground">2,000만원 초과분</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
