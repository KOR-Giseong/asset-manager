"use client";

import { useState, useTransition, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { addAsset } from "@/app/actions/asset-actions";
import { toast } from "sonner";
import { handleActionResult, toastMessages } from "@/lib/toast-helpers";
import { formatKRWWithUnit } from "@/lib/format";

export function AddAssetDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("주식");
  const [isPending, startTransition] = useTransition();
  
  // 주식용 상태
  const [purchasePrice, setPurchasePrice] = useState("");
  const [quantity, setQuantity] = useState("");
  
  // 비주식용 상태
  const [amountDisplay, setAmountDisplay] = useState("");

  // 총 매수금액 계산 (주식)
  const calculateTotal = useCallback(() => {
    const price = parseFloat(purchasePrice) || 0;
    const qty = parseFloat(quantity) || 0;
    return price * qty;
  }, [purchasePrice, quantity]);

  const totalAmount = calculateTotal();

  function resetForm() {
    setType("주식");
    setPurchasePrice("");
    setQuantity("");
    setAmountDisplay("");
  }

  async function handleSubmit(formData: FormData) {
    const name = formData.get("name") as string;
    
    startTransition(async () => {
      toast.loading(toastMessages.asset.add.loading, { id: "add-asset" });
      
      const result = await addAsset(formData);
      
      if (handleActionResult(result, { 
        success: `'${name}' 자산이 추가되었습니다` 
      }, { id: "add-asset" })) {
        setOpen(false);
        resetForm();
      }
    });
  }
  
  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const numValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(numValue) && numValue > 0) {
      setAmountDisplay(formatKRWWithUnit(numValue, { compact: true }));
    } else {
      setAmountDisplay("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button size="default">
          <Plus className="h-4 w-4" />
          자산 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 자산 추가</DialogTitle>
          <DialogDescription>
            추가할 자산의 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="asset-name">자산 이름</Label>
              <Input
                id="asset-name"
                name="name"
                placeholder="예: 삼성전자, 서울 아파트"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="asset-type">카테고리</Label>
              <select
                id="asset-type"
                name="type"
                className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:h-10 sm:text-sm"
                value={type}
                onChange={(e) => setType(e.target.value)}
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
                  <Label htmlFor="asset-symbol">종목 코드 (Symbol)</Label>
                  <Input
                    id="asset-symbol"
                    name="symbol"
                    placeholder="주식: 005930.KS / 코인: BTC"
                  />
                  <p className="text-xs text-muted-foreground">
                    한국 주식: 종목코드.KS (예: 005930.KS) · 미국 주식: 티커 (예: AAPL) · 코인: 심볼 (예: BTC, ETH)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="asset-purchasePrice">매수 단가 (원)</Label>
                    <Input
                      id="asset-purchasePrice"
                      name="purchasePrice"
                      type="number"
                      placeholder="예: 70000"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="asset-quantity">보유 수량</Label>
                    <Input
                      id="asset-quantity"
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
              <div className="grid gap-2">
                <Label htmlFor="asset-amount">금액 (원)</Label>
                <Input
                  id="asset-amount"
                  name="amount"
                  type="number"
                  placeholder="예: 50000000"
                  onChange={handleAmountChange}
                  required
                />
                {amountDisplay && (
                  <p className="text-xs font-medium text-primary">
                    ≈ {amountDisplay}
                  </p>
                )}
                <input type="hidden" name="currentPrice" value="0" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  추가 중...
                </>
              ) : (
                "추가하기"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
