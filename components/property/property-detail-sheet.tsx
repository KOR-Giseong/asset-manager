"use client";

// =========================================
// 부동산 상세 슬라이드오버 - 투자요약, 임대정보, 대출정보 탭 분리
// =========================================

import { useTransition } from "react";
import {
  Building2,
  MapPin,
  Calendar,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Landmark,
  Home,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatKRW } from "@/lib/format";
import {
  calculateInvestmentSummary,
  isLandlord,
  isTenant,
} from "@/services/propertyService";
import {
  PROPERTY_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_COLORS,
  type Property,
} from "@/types/property";
import { deleteProperty } from "@/app/actions/property-actions";
import { toast } from "sonner";
import { PropertyMiniChart } from "./property-mini-chart";

interface PropertyDetailSheetProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (property: Property) => void;
  totalAssetValue?: number; // 전체 자산 가치 (비중 계산용)
}

export function PropertyDetailSheet({
  property,
  open,
  onOpenChange,
  onEdit,
  totalAssetValue = 0,
}: PropertyDetailSheetProps) {
  const [isPending, startTransition] = useTransition();

  if (!property) return null;

  const summary = calculateInvestmentSummary(property);
  const landlord = isLandlord(property.contractType);
  const tenant = isTenant(property.contractType);

  // 전체 자산 대비 이 부동산 비중
  const assetRatio = totalAssetValue > 0
    ? (property.currentPrice / totalAssetValue) * 100
    : 0;

  // 부채 비율 (부채 / 시세)
  const debtRatio = property.currentPrice > 0
    ? (summary.equity.totalLiability / property.currentPrice) * 100
    : 0;

  function handleDelete() {
    if (!property) return;
    if (!confirm(`'${property.name}'을(를) 삭제하시겠습니까?`)) return;

    startTransition(async () => {
      const result = await deleteProperty(property.id);
      if (!result.success) {
        toast.error(result.error || "삭제에 실패했습니다.");
        return;
      }
      toast.success(`'${property.name}'이(가) 삭제되었습니다.`);
      onOpenChange(false);
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <Building2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <SheetTitle className="text-xl">{property.name}</SheetTitle>
                <SheetDescription className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {property.address}
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* 배지 영역 */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={CONTRACT_TYPE_COLORS[property.contractType]}>
              {CONTRACT_TYPE_LABELS[property.contractType]}
            </Badge>
            <Badge variant="secondary">
              {PROPERTY_TYPE_LABELS[property.propertyType]}
            </Badge>
            {summary.isExpiryWarning && (
              <Badge variant="warning" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                만기 {summary.daysUntilExpiry}일 남음
              </Badge>
            )}
            {summary.ltv.isDanger && (
              <Badge variant="danger" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                LTV 위험
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* 미니 차트 영역 */}
        <div className="mt-6">
          <PropertyMiniChart
            assetRatio={assetRatio}
            debtRatio={debtRatio}
            equity={summary.equity.equity}
            currentPrice={property.currentPrice}
          />
        </div>

        {/* 탭 영역 */}
        <Tabs defaultValue="summary" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary" className="text-xs">
              <TrendingUp className="mr-1 h-3 w-3" />
              투자 요약
            </TabsTrigger>
            <TabsTrigger value="rental" className="text-xs">
              <Home className="mr-1 h-3 w-3" />
              임대 정보
            </TabsTrigger>
            <TabsTrigger value="loan" className="text-xs">
              <Landmark className="mr-1 h-3 w-3" />
              대출 정보
            </TabsTrigger>
          </TabsList>

          {/* 투자 요약 탭 */}
          <TabsContent value="summary" className="space-y-4">
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
          </TabsContent>

          {/* 임대 정보 탭 */}
          <TabsContent value="rental" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {landlord ? "임대 수입" : tenant ? "임차 비용" : "거주 비용"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {property.deposit > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {landlord ? "받은 보증금" : "낸 보증금"}
                    </span>
                    <span className="font-semibold">{formatKRW(property.deposit)}</span>
                  </div>
                )}
                {property.monthlyRent > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {landlord ? "월세 수입" : "월세 지출"}
                    </span>
                    <span className={`font-semibold ${landlord ? "text-emerald-500" : "text-red-500"}`}>
                      {landlord ? "+" : "-"}{formatKRW(property.monthlyRent)}
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

            {/* 계약 정보 */}
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
          </TabsContent>

          {/* 대출 정보 탭 */}
          <TabsContent value="loan" className="space-y-4">
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
          </TabsContent>
        </Tabs>

        {/* 메모 */}
        {property.notes && (
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                메모
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{property.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* 액션 버튼 */}
        <div className="mt-6 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onEdit?.(property)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isPending ? "삭제 중..." : "삭제"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
