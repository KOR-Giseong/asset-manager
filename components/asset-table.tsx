"use client";

import { useState, useTransition } from "react";
import { Trash2, Pencil, RefreshCw } from "lucide-react";
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
import { deleteAsset, updateAsset, refreshPrices } from "@/app/actions/asset-actions";
import { toast } from "sonner";

interface Asset {
  id: string;
  name: string;
  type: string;
  amount: number;
  currentPrice: number;
  symbol: string | null;
}

function formatKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

function getProfitInfo(amount: number, currentPrice: number) {
  if (!currentPrice || !amount) return null;
  const diff = currentPrice - amount;
  const rate = (diff / amount) * 100;
  return { diff, rate };
}

export function AssetTable({ assets }: { assets: Asset[] }) {
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();

  function handleDelete(asset: Asset) {
    startTransition(async () => {
      const result = await deleteAsset(asset.id);
      if (!result.success) {
        toast.error(result.error || "삭제에 실패했습니다.");
        return;
      }
      toast.success(`'${asset.name}' 자산이 삭제되었습니다.`);
    });
  }

  async function handleUpdate(formData: FormData) {
    const result = await updateAsset(formData);
    if (!result.success) {
      toast.error(result.error || "수정에 실패했습니다.");
      return;
    }
    setEditingAsset(null);
    toast.success("자산 정보가 수정되었습니다.");
  }

  function handleRefresh() {
    startRefresh(async () => {
      const result = await refreshPrices();
      if (!result.success) {
        toast.error(result.error || "시세 업데이트에 실패했습니다.");
        return;
      }
      toast.success("시세가 업데이트되었습니다.");
    });
  }

  if (assets.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        등록된 자산이 없습니다. 자산을 추가해보세요.
      </p>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "업데이트 중..." : "시세 새로고침"}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 text-left font-medium text-muted-foreground">
                자산명
              </th>
              <th className="pb-3 text-left font-medium text-muted-foreground">
                카테고리
              </th>
              <th className="pb-3 text-right font-medium text-muted-foreground">
                매수금액
              </th>
              <th className="pb-3 text-right font-medium text-muted-foreground">
                현재가
              </th>
              <th className="pb-3 text-right font-medium text-muted-foreground">
                수익률
              </th>
              <th className="pb-3 text-right font-medium text-muted-foreground">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              const profit = getProfitInfo(asset.amount, asset.currentPrice);

              return (
                <tr
                  key={asset.id}
                  className="border-b border-border/50 last:border-0 transition-colors hover:bg-muted/50"
                >
                  <td
                    className="py-3 font-medium text-foreground cursor-pointer hover:text-primary"
                    onClick={() => setEditingAsset(asset)}
                  >
                    <div>{asset.name}</div>
                    {asset.symbol && (
                      <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                      {asset.type}
                    </span>
                  </td>
                  <td className="py-3 text-right font-medium">
                    {formatKRW(asset.amount)}
                  </td>
                  <td className="py-3 text-right font-medium">
                    {asset.currentPrice > 0 ? formatKRW(asset.currentPrice) : (
                      <span className="text-muted-foreground">
                        {asset.symbol ? "N/A" : "—"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {profit ? (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          profit.rate > 0
                            ? "text-red-500"
                            : profit.rate < 0
                              ? "text-blue-500"
                              : "text-muted-foreground"
                        }`}
                      >
                        {profit.rate > 0 ? "+" : ""}
                        {profit.rate.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {asset.symbol ? "N/A" : "—"}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditingAsset(asset)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(asset)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 수정 다이얼로그 */}
      <Dialog open={!!editingAsset} onOpenChange={(open) => !open && setEditingAsset(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>자산 수정</DialogTitle>
            <DialogDescription>자산 정보를 수정해주세요.</DialogDescription>
          </DialogHeader>
          {editingAsset && (
            <form action={handleUpdate}>
              <input type="hidden" name="id" value={editingAsset.id} />
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">자산 이름</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingAsset.name}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">카테고리</Label>
                  <select
                    id="edit-type"
                    name="type"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue={editingAsset.type}
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
                    defaultValue={editingAsset.symbol || ""}
                    placeholder="주식: 005930.KS / 코인: BTC"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-amount">매수 금액 (원)</Label>
                  <Input
                    id="edit-amount"
                    name="amount"
                    type="number"
                    defaultValue={editingAsset.amount}
                    required
                  />
                  <input
                    type="hidden"
                    name="currentPrice"
                    value={editingAsset.currentPrice}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingAsset(null)}
                >
                  취소
                </Button>
                <Button type="submit">저장하기</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
