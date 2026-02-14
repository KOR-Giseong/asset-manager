"use client";

// =========================================
// 부동산 수정 다이얼로그
// =========================================

import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProperty } from "@/app/actions/property-actions";
import { toast } from "sonner";
import {
  PROPERTY_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  type Property,
  type PropertyType,
  type ContractType,
} from "@/types/property";

interface EditPropertyDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPropertyDialog({ property, open, onOpenChange }: EditPropertyDialogProps) {
  const [contractType, setContractType] = useState<ContractType>("OWNED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // property가 변경되면 contractType 업데이트
  useEffect(() => {
    if (property) {
      setContractType(property.contractType);
    }
  }, [property]);

  if (!property) return null;

  // 계약 유형에 따라 표시할 필드 결정
  const showRentalFields = contractType === "RENTAL_JEONSE" || contractType === "RENTAL_MONTHLY";
  const showTenantFields = contractType === "JEONSE" || contractType === "MONTHLY";
  const showMonthlyRent = contractType === "MONTHLY" || contractType === "RENTAL_MONTHLY";

  // 날짜 포맷 (input[type=date]용)
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  async function handleSubmit(formData: FormData) {
    if (!property) return;
    setIsSubmitting(true);
    formData.set("id", property.id);
    const name = formData.get("name") as string;
    const result = await updateProperty(formData);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error || "부동산 수정에 실패했습니다.");
      return;
    }

    onOpenChange(false);
    toast.success(`'${name}' 정보가 수정되었습니다.`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            부동산 정보 수정
          </DialogTitle>
          <DialogDescription>
            부동산 정보를 수정합니다.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* 기본 정보 섹션 */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">기본 정보</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">자산명 *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={property.name}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-address">주소 *</Label>
                  <Input
                    id="edit-address"
                    name="address"
                    defaultValue={property.address}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-propertyType">부동산 유형 *</Label>
                  <Select name="propertyType" defaultValue={property.propertyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PROPERTY_TYPE_LABELS) as PropertyType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {PROPERTY_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-contractType">계약 유형 *</Label>
                  <Select
                    name="contractType"
                    value={contractType}
                    onValueChange={(v) => setContractType(v as ContractType)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CONTRACT_TYPE_LABELS) as ContractType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {CONTRACT_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 가격 정보 섹션 */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">가격 정보</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-purchasePrice">매수 가격 (원) *</Label>
                  <Input
                    id="edit-purchasePrice"
                    name="purchasePrice"
                    type="number"
                    defaultValue={property.purchasePrice}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-currentPrice">현재 시세 (원) *</Label>
                  <Input
                    id="edit-currentPrice"
                    name="currentPrice"
                    type="number"
                    defaultValue={property.currentPrice}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-acquisitionCost">취득세/부대비용 (원)</Label>
                  <Input
                    id="edit-acquisitionCost"
                    name="acquisitionCost"
                    type="number"
                    defaultValue={property.acquisitionCost}
                  />
                </div>
              </div>
            </div>

            {/* 대출 정보 섹션 */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">대출 정보</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-loanPrincipal">대출 원금 (원)</Label>
                  <Input
                    id="edit-loanPrincipal"
                    name="loanPrincipal"
                    type="number"
                    defaultValue={property.loanPrincipal}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-loanInterestRate">대출 이자율 (연 %)</Label>
                  <Input
                    id="edit-loanInterestRate"
                    name="loanInterestRate"
                    type="number"
                    step="0.01"
                    defaultValue={property.loanInterestRate}
                  />
                </div>
              </div>
            </div>

            {/* 임대 정보 섹션 (조건부 표시) */}
            {(showRentalFields || showTenantFields || showMonthlyRent) && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {showRentalFields ? "임대 정보" : "임차 정보"}
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-deposit">보증금 (원)</Label>
                    <Input
                      id="edit-deposit"
                      name="deposit"
                      type="number"
                      defaultValue={property.deposit}
                    />
                  </div>
                  {showMonthlyRent && (
                    <div className="grid gap-2">
                      <Label htmlFor="edit-monthlyRent">월세 (원)</Label>
                      <Input
                        id="edit-monthlyRent"
                        name="monthlyRent"
                        type="number"
                        defaultValue={property.monthlyRent}
                      />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="edit-maintenanceFee">관리비 (원/월)</Label>
                    <Input
                      id="edit-maintenanceFee"
                      name="maintenanceFee"
                      type="number"
                      defaultValue={property.maintenanceFee}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 계약 기간 섹션 */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">계약 기간</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-contractStartDate">계약 시작일</Label>
                  <Input
                    id="edit-contractStartDate"
                    name="contractStartDate"
                    type="date"
                    defaultValue={formatDate(property.contractStartDate)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-contractEndDate">계약 만기일</Label>
                  <Input
                    id="edit-contractEndDate"
                    name="contractEndDate"
                    type="date"
                    defaultValue={formatDate(property.contractEndDate)}
                  />
                </div>
              </div>
            </div>

            {/* 메모 */}
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">메모</Label>
              <textarea
                id="edit-notes"
                name="notes"
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={property.notes || ""}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
