"use client";

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
import type { Asset } from "@/types/asset";

interface EditAssetDialogProps {
  asset: Asset | null;
  onClose: () => void;
}

export function EditAssetDialog({ asset, onClose }: EditAssetDialogProps) {
  async function handleUpdate(formData: FormData) {
    const result = await updateAsset(formData);
    if (!result.success) {
      toast.error(result.error || "수정에 실패했습니다.");
      return;
    }
    onClose();
    toast.success("자산 정보가 수정되었습니다.");
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
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={asset.type}
                >
                  <option value="주식">주식</option>
                  <option value="부동산">부동산</option>
                  <option value="예적금">예적금</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-symbol">종목 코드 (Symbol)</Label>
                <Input
                  id="edit-symbol"
                  name="symbol"
                  defaultValue={asset.symbol || ""}
                  placeholder="주식: 005930.KS / 코인: BTC"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">매수 금액 (원)</Label>
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
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit">저장하기</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
