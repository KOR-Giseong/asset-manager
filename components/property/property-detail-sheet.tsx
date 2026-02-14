"use client";

// =========================================
// 부동산 상세 슬라이드오버
// =========================================

import { useTransition } from "react";
import {
  Building2,
  MapPin,
  Trash2,
  Pencil,
  TrendingUp,
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
import {
  calculateInvestmentSummary,
  isLandlord as checkIsLandlord,
  isTenant as checkIsTenant,
} from "@/services/propertyService";
import {
  PROPERTY_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  CONTRACT_TYPE_COLORS,
  type Property,
} from "@/types/property";
import { deleteProperty } from "@/app/actions/property-actions";
import { toast } from "sonner";
import { handleActionResult, toastMessages } from "@/lib/toast-helpers";
import { PropertyMiniChart } from "./property-mini-chart";
import { InvestmentTab } from "./detail-tabs/investment-tab";
import { RentalTab } from "./detail-tabs/rental-tab";
import { LoanTab } from "./detail-tabs/loan-tab";

interface PropertyDetailSheetProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (property: Property) => void;
  totalAssetValue?: number;
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
  const landlord = checkIsLandlord(property.contractType);
  const tenant = checkIsTenant(property.contractType);

  const assetRatio = totalAssetValue > 0
    ? (property.currentPrice / totalAssetValue) * 100
    : 0;

  const debtRatio = property.currentPrice > 0
    ? (summary.equity.totalLiability / property.currentPrice) * 100
    : 0;

  function handleDelete() {
    if (!property) return;
    if (!confirm(`'${property.name}'을(를) 삭제하시겠습니까?`)) return;

    startTransition(async () => {
      toast.loading(toastMessages.property.delete.loading, { id: `delete-property-${property.id}` });
      const result = await deleteProperty(property.id);
      
      if (handleActionResult(result, { 
        success: `'${property.name}'이(가) 삭제되었습니다` 
      }, { id: `delete-property-${property.id}` })) {
        onOpenChange(false);
      }
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

        <div className="mt-6">
          <PropertyMiniChart
            assetRatio={assetRatio}
            debtRatio={debtRatio}
            equity={summary.equity.equity}
            currentPrice={property.currentPrice}
          />
        </div>

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

          <TabsContent value="summary">
            <InvestmentTab property={property} summary={summary} />
          </TabsContent>

          <TabsContent value="rental">
            <RentalTab
              property={property}
              summary={summary}
              isLandlord={landlord}
              isTenant={tenant}
            />
          </TabsContent>

          <TabsContent value="loan">
            <LoanTab property={property} summary={summary} />
          </TabsContent>
        </Tabs>

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
