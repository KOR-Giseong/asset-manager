"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKRW } from "@/lib/format";
import type { Property, PropertyInvestmentSummary } from "@/types/property";

interface InvestmentTabProps {
  property: Property;
  summary: PropertyInvestmentSummary;
}

export function InvestmentTab({ property, summary }: InvestmentTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            핵심 지표
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">현재 시세</span>
            <span className="font-semibold">{formatKRW(property.currentPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">매수 가격</span>
            <span className="font-semibold">{formatKRW(property.purchasePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">부대비용</span>
            <span className="font-semibold">{formatKRW(property.acquisitionCost)}</span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">순자산 (Equity)</span>
              <span className={`font-bold ${summary.equity.equity >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {formatKRW(summary.equity.equity)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            수익률 분석
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">실투자금</span>
            <span className="font-semibold">{formatKRW(summary.roi.actualInvestment)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">연 순수익</span>
            <span className={`font-semibold ${summary.roi.annualNetIncome >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {summary.roi.annualNetIncome >= 0 ? "+" : ""}
              {formatKRW(summary.roi.annualNetIncome)}
            </span>
          </div>
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ROI (수익률)</span>
              <div className="flex items-center gap-2">
                {summary.roi.roi >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`font-bold text-lg ${summary.roi.roi >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {summary.roi.roi >= 0 ? "+" : ""}
                  {summary.roi.roi.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
