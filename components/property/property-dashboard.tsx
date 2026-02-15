"use client";

// =========================================
// 부동산 대시보드 - 전체 부동산 관리 UI
// =========================================

import { useState } from "react";
import { Building2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "./property-card";
import { PropertyDetailSheet } from "./property-detail-sheet";
import { AddPropertyDialog } from "./add-property-dialog";
import { EditPropertyDialog } from "./edit-property-dialog";
import { formatKRW } from "@/lib/format";
import { calculatePortfolioSummary } from "@/services/propertyService";
import type { Property } from "@/types/property";

interface PropertyDashboardProps {
  properties: Property[];
  totalAssetValue?: number; // 전체 자산 가치 (주식 + 예적금 + 부동산)
}

export function PropertyDashboard({ properties, totalAssetValue = 0 }: PropertyDashboardProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const summary = calculatePortfolioSummary(properties);

  // 부동산 총 가치 (전체 자산에 더해질 값)
  const propertyTotalValue = summary.totalCurrentValue;
  const combinedTotalAsset = totalAssetValue + propertyTotalValue;

  function handlePropertyClick(property: Property) {
    setSelectedProperty(property);
    setDetailOpen(true);
  }

  function handleEdit(property: Property) {
    setDetailOpen(false);
    setEditingProperty(property);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 액션 바 */}
      {properties.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {summary.totalProperties}개 부동산 · 총 {formatKRW(summary.totalCurrentValue)}
          </div>
          <div className="flex items-center gap-2">
            {summary.expiringCount > 0 && (
              <Badge variant="warning" className="gap-1 text-[10px] sm:text-xs">
                <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                만기 임박 {summary.expiringCount}건
              </Badge>
            )}
            <AddPropertyDialog />
          </div>
        </div>
      )}

      {/* 포트폴리오 요약 카드 */}
      {properties.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          <Card className="border-border/60">
            <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
              <CardDescription className="text-[10px] sm:text-xs">총 시가</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
              <p className="text-base font-bold sm:text-2xl">{formatKRW(summary.totalCurrentValue)}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
              <CardDescription className="text-[10px] sm:text-xs">총 순자산</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
              <p className={`text-base font-bold sm:text-2xl ${summary.totalEquity >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {formatKRW(summary.totalEquity)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
              <CardDescription className="text-[10px] sm:text-xs">월 현금흐름</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
              <p className={`text-base font-bold sm:text-2xl ${summary.totalMonthlyCashFlow >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {summary.totalMonthlyCashFlow >= 0 ? "+" : ""}
                {formatKRW(summary.totalMonthlyCashFlow)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="p-3 pb-1 sm:p-4 sm:pb-2">
              <CardDescription className="text-[10px] sm:text-xs">평균 LTV</CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
              <p className={`text-base font-bold sm:text-2xl ${summary.averageLTV >= 80 ? "text-red-500" : summary.averageLTV >= 70 ? "text-amber-500" : ""}`}>
                {summary.averageLTV.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 부동산 목록 */}
      {properties.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Building2 className="h-10 w-10 text-muted-foreground/50 sm:h-12 sm:w-12" />
            <h3 className="mt-3 text-base font-medium sm:mt-4 sm:text-lg">등록된 부동산이 없습니다</h3>
            <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
              부동산을 추가하여 자산을 관리해보세요
            </p>
            <div className="mt-3 sm:mt-4">
              <AddPropertyDialog />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => handlePropertyClick(property)}
            />
          ))}
        </div>
      )}

      {/* 상세 시트 */}
      <PropertyDetailSheet
        property={selectedProperty}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        totalAssetValue={combinedTotalAsset}
      />

      {/* 수정 다이얼로그 */}
      <EditPropertyDialog
        property={editingProperty}
        open={!!editingProperty}
        onOpenChange={(isOpen: boolean) => !isOpen && setEditingProperty(null)}
      />
    </div>
  );
}
