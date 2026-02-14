"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { Loader2 } from "lucide-react";
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
import { updateAsset } from "@/app/actions/asset-actions";
import { toast } from "sonner";
import { handleActionResult, toastMessages } from "@/lib/toast-helpers";
import { formatKRWWithUnit } from "@/lib/format";
import type { Asset, AssetCategory } from "@/types/asset";

interface EditAssetDialogProps {
  asset: Asset | null;
  onClose: () => void;
}

export function EditAssetDialog({ asset, onClose }: EditAssetDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState(asset?.type || "주식");
  
  // 주식용 상태
  const [purchasePrice, setPurchasePrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // asset 변경 시 상태 초기화
  useEffect(() => {
    if (asset) {
      setType(asset.type);
      if (asset.type === "주식") {
        setPurchasePrice(asset.purchasePrice?.toString() || "");
        setQuantity(asset.quantity?.toString() || "");
      }
    }
  }, [asset]);

  // 총 매수금액 계산 (주식)
  const calculateTotal = useCallback(() => {
    const price = parseFloat(purchasePrice) || 0;
    const qty = parseFloat(quantity) || 0;
    return price * qty;
  }, [purchasePrice, quantity]);

  const totalAmount = calculateTotal();
  
  async function handleUpdate(formData: FormData) {
    startTransition(async () => {
      toast.loading(toastMessages.asset.update.loading, { id: "update-asset" });
      const result = await updateAsset(formData);
      
      if (handleActionResult(result, { 
        success: toastMessages.asset.update.success 
      }, { id: "update-asset" })) {
        onClose();
      }
    });
  }

  return (
    <Dialog open={!!asset} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>자산 수정</DialogTitle>
          <DialogDescription>자산 정보를 수정해주세요.</DialogDescription>
        </DialogHeader>
        {asset && (
          <form action={handleUpdate}>
            <input type="hidden" name="id" value={asset.id} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">자산 이름</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={asset.name}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">카테고리</Label>
                <select
                  id="edit-type"
                  name="type"
                  className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-10 sm:text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value as AssetCategory)}
                >
                  <option value="주식">주식</option>
                  <option value="부동산">부동산</option>
                  <option value="예적금">예적금</option>
                </select>
              </div>

              {/* 주식: 종목 코드, 매수 단가, 수량 */}
              {type === "주식" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-symbol">종목 코드 (Symbol)</Label>
                    <Input
                      id="edit-symbol"
                      name="symbol"
                      defaultValue={asset.symbol || ""}
                      placeholder="주식: 005930.KS / 코인: BTC"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-purchasePrice">매수 단가 (원)</Label>
                      <Input
                        id="edit-purchasePrice"
                        name="purchasePrice"
                        type="number"
                        placeholder="예: 70000"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-quantity">보유 수량</Label>
                      <Input
                        id="edit-quantity"
                        name="quantity"
                        type="number"
                        step="any"
                        placeholder="예: 100"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {/* 총 매수금액 실시간 표시 */}
                  {totalAmount > 0 && (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">총 매수금액</span>
                        <span className="text-lg font-bold text-primary">
                          {formatKRWWithUnit(totalAmount, { compact: true })}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 비주식: 총액 직접 입력 */}
              {type !== "주식" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-symbol">종목 코드 (Symbol)</Label>
                    <Input
                      id="edit-symbol"
                      name="symbol"
                      defaultValue={asset.symbol || ""}
                      placeholder="선택사항"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-amount">금액 (원)</Label>
                    <Input
                      id="edit-amount"
                      name="amount"
                      type="number"
                      defaultValue={asset.amount}
                      required
                    />
                    <input
                      type="hidden"
                      name="currentPrice"
                      value={asset.currentPrice}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  "저장하기"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
