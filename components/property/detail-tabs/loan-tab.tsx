"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKRW } from "@/lib/format";
import { isLandlord } from "@/services/propertyService";
import type { Property, PropertyInvestmentSummary } from "@/types/property";

interface LoanTabProps {
  property: Property;
  summary: PropertyInvestmentSummary;
}

export function LoanTab({ property, summary }: LoanTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            대출 현황
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">대출 원금</span>
            <span className="font-semibold">{formatKRW(property.loanPrincipal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">대출 이자율</span>
            <span className="font-semibold">{property.loanInterestRate}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">월 이자</span>
            <span className="font-semibold text-red-500">
              -{formatKRW(summary.cashFlow.monthlyLoanInterest)}
            </span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">LTV 비율</span>
              <Badge variant={summary.ltv.isDanger ? "danger" : summary.ltv.isWarning ? "warning" : "secondary"}>
                {summary.ltv.ltv.toFixed(1)}%
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {summary.ltv.isDanger
                ? "⚠️ LTV 80% 이상 - 추가 대출 어려움, 금리 상승 시 위험"
                : summary.ltv.isWarning
                  ? "⚠️ LTV 70% 이상 - 금리 변동에 주의 필요"
                  : "✅ LTV 안정 구간"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            부채 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">대출금</span>
            <span className="font-semibold">{formatKRW(property.loanPrincipal)}</span>
          </div>
          {isLandlord(property.contractType) && property.deposit > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">임차 보증금</span>
              <span className="font-semibold">{formatKRW(property.deposit)}</span>
            </div>
          )}
          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">총 부채</span>
              <span className="font-bold text-red-500">
                {formatKRW(summary.equity.totalLiability)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
