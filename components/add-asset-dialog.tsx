"use client";

import { useState, useTransition } from "react";
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
  const [amountDisplay, setAmountDisplay] = useState("");

  async function handleSubmit(formData: FormData) {
    const name = formData.get("name") as string;
    
    startTransition(async () => {
      toast.loading(toastMessages.asset.add.loading, { id: "add-asset" });
      
      const result = await addAsset(formData);
      
      if (handleActionResult(result, { 
        success: `'${name}' 자산이 추가되었습니다` 
      }, { id: "add-asset" })) {
        setOpen(false);
        setAmountDisplay("");
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
    <Dialog open={open} onOpenChange={setOpen}>
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
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                defaultValue="주식"
                onChange={(e) => setType(e.target.value)}
              >
                <option value="주식">주식</option>
                <option value="부동산">부동산</option>
                <option value="예적금">예적금</option>
              </select>
            </div>
            {type === "주식" && (
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
            )}
            <div className="grid gap-2">
              <Label htmlFor="asset-amount">매수 금액 (원)</Label>
              <Input
                id="asset-amount"
                name="amount"
                type="number"
                placeholder="예: 50000000"
                onChange={handleAmountChange}
                required
              />
              {amountDisplay && (
                <p className="text-xs text-primary font-medium">
                  ≈ {amountDisplay}
                </p>
              )}
              <input type="hidden" name="currentPrice" value="0" />
            </div>
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
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
