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
      <CardHeader className="p-3 pb-2 sm:p-4 sm:pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 sm:h-10 sm:w-10">
              <Building2 className="h-4 w-4 text-emerald-500 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground sm:text-base">{property.name}</h3>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
                <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span className="max-w-[140px] truncate sm:max-w-[180px]">{property.address}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge
              variant="outline"
              className={`text-[10px] sm:text-xs ${CONTRACT_TYPE_COLORS[property.contractType]}`}
            >
              {CONTRACT_TYPE_LABELS[property.contractType]}
            </Badge>
            {showExpiryWarning && (
              <Badge variant="warning" className="gap-0.5 text-[10px] sm:gap-1 sm:text-xs">
                <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                만기 {daysUntilExpiry}일
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-3 pt-0 sm:space-y-3 sm:p-4 sm:pt-0">
        {/* 시세 및 순자산 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div>
            <p className="text-[10px] text-muted-foreground sm:text-xs">현재 시세</p>
            <p className="text-sm font-bold text-foreground sm:text-lg">
              {formatKRW(property.currentPrice)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground sm:text-xs">순자산</p>
            <p className={`text-sm font-bold sm:text-lg ${equity.equity >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {formatKRW(equity.equity)}
            </p>
          </div>
        </div>

        {/* 현금흐름 및 LTV */}
        <div className="flex items-center justify-between border-t border-border/50 pt-2 sm:pt-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isPositiveCashFlow && (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500 sm:h-4 sm:w-4" />
            )}
            {isNegativeCashFlow && (
              <TrendingDown className="h-3.5 w-3.5 text-red-500 sm:h-4 sm:w-4" />
            )}
            <span className="text-[10px] text-muted-foreground sm:text-sm">월 현금흐름</span>
            <span
              className={`text-xs font-semibold sm:text-sm ${
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
              className="text-[10px] sm:text-xs"
            >
              LTV {ltv.ltv.toFixed(1)}%
            </Badge>
          )}
        </div>

        {/* 유형 태그 */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground sm:gap-2 sm:text-xs">
          <span className="rounded bg-secondary px-1.5 py-0.5 sm:px-2">
            {PROPERTY_TYPE_LABELS[property.propertyType]}
          </span>
          {property.contractEndDate && (
            <span className="flex items-center gap-0.5 sm:gap-1">
              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              {new Date(property.contractEndDate).toLocaleDateString("ko-KR")} 만기
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
