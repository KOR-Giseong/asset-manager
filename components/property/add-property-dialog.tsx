"use client";

// =========================================
// 부동산 추가 다이얼로그
// =========================================

import { useState } from "react";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { addProperty } from "@/app/actions/property-actions";
import { toast } from "sonner";
import {
  PROPERTY_TYPE_LABELS,
  CONTRACT_TYPE_LABELS,
  type PropertyType,
  type ContractType,
} from "@/types/property";

export function AddPropertyDialog() {
  const [open, setOpen] = useState(false);
  const [contractType, setContractType] = useState<ContractType>("OWNED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 계약 유형에 따라 표시할 필드 결정
  const showRentalFields = contractType === "RENTAL_JEONSE" || contractType === "RENTAL_MONTHLY";
  const showTenantFields = contractType === "JEONSE" || contractType === "MONTHLY";
  const showMonthlyRent = contractType === "MONTHLY" || contractType === "RENTAL_MONTHLY";

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    const name = formData.get("name") as string;
    const result = await addProperty(formData);
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error || "부동산 추가에 실패했습니다.");
      return;
    }

    setOpen(false);
    toast.success(`'${name}' 부동산이 추가되었습니다.`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="default" variant="outline" className="gap-2">
          <Building2 className="h-4 w-4" />
          부동산 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            새 부동산 추가
          </DialogTitle>
          <DialogDescription>
            부동산 정보를 입력해주세요. 계약 유형에 따라 입력 필드가 변경됩니다.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* 기본 정보 섹션 */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">기본 정보</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">자산명 *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="예: 강남 아파트"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">주소 *</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="예: 서울시 강남구 테헤란로 123"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="propertyType">부동산 유형 *</Label>
                  <Select name="propertyType" defaultValue="APARTMENT">
                    <SelectTrigger>
                      <SelectValue placeholder="유형 선택" />
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
                  <Label htmlFor="contractType">계약 유형 *</Label>
                  <Select
                    name="contractType"
                    value={contractType}
                    onValueChange={(v) => setContractType(v as ContractType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="계약 유형 선택" />
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
                  <Label htmlFor="purchasePrice">매수 가격 (원) *</Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    placeholder="예: 500000000"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currentPrice">현재 시세 (원) *</Label>
                  <Input
                    id="currentPrice"
                    name="currentPrice"
                    type="number"
                    placeholder="예: 550000000"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="acquisitionCost">취득세/부대비용 (원)</Label>
                  <Input
                    id="acquisitionCost"
                    name="acquisitionCost"
                    type="number"
                    placeholder="예: 15000000"
                    defaultValue="0"
                  />
                </div>
              </div>
            </div>

            {/* 대출 정보 섹션 */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">대출 정보</h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="loanPrincipal">대출 원금 (원)</Label>
                  <Input
                    id="loanPrincipal"
                    name="loanPrincipal"
                    type="number"
                    placeholder="예: 300000000"
                    defaultValue="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="loanInterestRate">대출 이자율 (연 %)</Label>
                  <Input
                    id="loanInterestRate"
                    name="loanInterestRate"
                    type="number"
                    step="0.01"
                    placeholder="예: 4.5"
                    defaultValue="0"
                  />
                </div>
              </div>
            </div>

            {/* 임대 정보 섹션 (조건부 표시) */}
            {(showRentalFields || showTenantFields || showMonthlyRent) && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {showRentalFields ? "임대 정보 (받는 금액)" : "임차 정보 (내는 금액)"}
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="deposit">보증금 (원)</Label>
                    <Input
                      id="deposit"
                      name="deposit"
                      type="number"
                      placeholder="예: 50000000"
                      defaultValue="0"
                    />
                  </div>
                  {showMonthlyRent && (
                    <div className="grid gap-2">
                      <Label htmlFor="monthlyRent">월세 (원)</Label>
                      <Input
                        id="monthlyRent"
                        name="monthlyRent"
                        type="number"
                        placeholder="예: 1500000"
                        defaultValue="0"
                      />
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="maintenanceFee">관리비 (원/월)</Label>
                    <Input
                      id="maintenanceFee"
                      name="maintenanceFee"
                      type="number"
                      placeholder="예: 300000"
                      defaultValue="0"
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
                  <Label htmlFor="contractStartDate">계약 시작일</Label>
                  <Input
                    id="contractStartDate"
                    name="contractStartDate"
                    type="date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contractEndDate">계약 만기일</Label>
                  <Input
                    id="contractEndDate"
                    name="contractEndDate"
                    type="date"
                  />
                </div>
              </div>
            </div>

            {/* 메모 */}
            <div className="grid gap-2">
              <Label htmlFor="notes">메모</Label>
              <textarea
                id="notes"
                name="notes"
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="특이사항이나 메모를 입력하세요..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "추가 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
