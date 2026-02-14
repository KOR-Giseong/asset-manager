"use client";

// =========================================
// 부동산 카드 - 목록에서 표시되는 카드 컴포넌트
// =========================================

import { Building2, MapPin, Calendar, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKRW } from "@/lib/format";
import {
  calculateEquity,
  calculateCashFlow,
  calculateLTV,
  isExpiryWarning,
  calculateDaysUntilExpiry,
} from "@/services/propertyService";
import {
  PROPERTY_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_COLORS,
  type Property,
} from "@/types/property";

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const equity = calculateEquity(property);
  const cashFlow = calculateCashFlow(property);
  const ltv = calculateLTV(property);
  const daysUntilExpiry = calculateDaysUntilExpiry(property.contractEndDate);
  const showExpiryWarning = isExpiryWarning(property.contractEndDate);

  // 수익 여부
  const isPositiveCashFlow = cashFlow.monthlyCashFlow > 0;
  const isNegativeCashFlow = cashFlow.monthlyCashFlow < 0;

  return (
    <Card
      className="cursor-pointer border-border/60 shadow-sm transition-all hover:shadow-md hover:border-border"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{property.name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[180px]">{property.address}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="outline"
              className={CONTRACT_TYPE_COLORS[property.contractType]}
            >
              {CONTRACT_TYPE_LABELS[property.contractType]}
            </Badge>
            {showExpiryWarning && (
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                만기 {daysUntilExpiry}일
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 시세 및 순자산 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">현재 시세</p>
            <p className="text-lg font-bold text-foreground">
              {formatKRW(property.currentPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">순자산</p>
            <p className={`text-lg font-bold ${equity.equity >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {formatKRW(equity.equity)}
            </p>
          </div>
        </div>

        {/* 현금흐름 및 LTV */}
        <div className="flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex items-center gap-2">
            {isPositiveCashFlow && (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            )}
            {isNegativeCashFlow && (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">월 현금흐름</span>
            <span
              className={`text-sm font-semibold ${
                isPositiveCashFlow
                  ? "text-emerald-500"
                  : isNegativeCashFlow
                    ? "text-red-500"
                    : "text-muted-foreground"
              }`}
            >
              {isPositiveCashFlow ? "+" : ""}
              {formatKRW(cashFlow.monthlyCashFlow)}
            </span>
          </div>

          {property.loanPrincipal > 0 && (
            <Badge
              variant={ltv.isDanger ? "danger" : ltv.isWarning ? "warning" : "secondary"}
            >
              LTV {ltv.ltv.toFixed(1)}%
            </Badge>
          )}
        </div>

        {/* 유형 태그 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-secondary px-2 py-0.5">
            {PROPERTY_TYPE_LABELS[property.propertyType]}
          </span>
          {property.contractEndDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(property.contractEndDate).toLocaleDateString("ko-KR")} 만기
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
