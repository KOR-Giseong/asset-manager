"use client";

import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKRW } from "@/lib/format";
import type { Property, PropertyInvestmentSummary } from "@/types/property";

interface RentalTabProps {
  property: Property;
  summary: PropertyInvestmentSummary;
  isLandlord: boolean;
  isTenant: boolean;
}

export function RentalTab({ property, summary, isLandlord, isTenant }: RentalTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {isLandlord ? "임대 수입" : isTenant ? "임차 비용" : "거주 비용"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {property.deposit > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {isLandlord ? "받은 보증금" : "낸 보증금"}
              </span>
              <span className="font-semibold">{formatKRW(property.deposit)}</span>
            </div>
          )}
          {property.monthlyRent > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                {isLandlord ? "월세 수입" : "월세 지출"}
              </span>
              <span className={`font-semibold ${isLandlord ? "text-emerald-500" : "text-red-500"}`}>
                {isLandlord ? "+" : "-"}{formatKRW(property.monthlyRent)}
              </span>
            </div>
          )}
          {property.maintenanceFee > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">관리비</span>
              <span className="font-semibold text-red-500">
                -{formatKRW(property.maintenanceFee)}
              </span>
            </div>
          )}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">월 현금흐름</span>
              <span className={`font-bold text-lg ${summary.cashFlow.monthlyCashFlow >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {summary.cashFlow.monthlyCashFlow >= 0 ? "+" : ""}
                {formatKRW(summary.cashFlow.monthlyCashFlow)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {(property.contractStartDate || property.contractEndDate) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              계약 기간
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {property.contractStartDate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">시작일</span>
                <span className="font-semibold">
                  {new Date(property.contractStartDate).toLocaleDateString("ko-KR")}
                </span>
              </div>
            )}
            {property.contractEndDate && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">만기일</span>
                <span className={`font-semibold ${summary.isExpiryWarning ? "text-amber-500" : ""}`}>
                  {new Date(property.contractEndDate).toLocaleDateString("ko-KR")}
                </span>
              </div>
            )}
            {summary.daysUntilExpiry !== null && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">남은 일수</span>
                <Badge variant={summary.isExpiryWarning ? "warning" : "secondary"}>
                  {summary.daysUntilExpiry}일
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
