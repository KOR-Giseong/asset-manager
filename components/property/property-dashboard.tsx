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
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Building2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">부동산 관리</h2>
            <p className="text-sm text-muted-foreground">
              {summary.totalProperties}개 부동산 · 총 {formatKRW(summary.totalCurrentValue)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {summary.expiringCount > 0 && (
            <Badge variant="warning" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              만기 임박 {summary.expiringCount}건
            </Badge>
          )}
          <AddPropertyDialog />
        </div>
      </div>

      {/* 포트폴리오 요약 카드 */}
      {properties.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription>총 시가</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatKRW(summary.totalCurrentValue)}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription>총 순자산</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${summary.totalEquity >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {formatKRW(summary.totalEquity)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription>월 현금흐름</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${summary.totalMonthlyCashFlow >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {summary.totalMonthlyCashFlow >= 0 ? "+" : ""}
                {formatKRW(summary.totalMonthlyCashFlow)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardDescription>평균 LTV</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${summary.averageLTV >= 80 ? "text-red-500" : summary.averageLTV >= 70 ? "text-amber-500" : ""}`}>
                {summary.averageLTV.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 부동산 목록 */}
      {properties.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">등록된 부동산이 없습니다</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              부동산을 추가하여 자산을 관리해보세요
            </p>
            <div className="mt-4">
              <AddPropertyDialog />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
