"use client";

import { useState, useTransition } from "react";
import { Trash2, Pencil, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditAssetDialog } from "@/components/edit-asset-dialog";
import { deleteAsset, refreshPrices } from "@/app/actions/asset-actions";
import { formatKRW } from "@/lib/format";
import { getProfitInfo } from "@/lib/asset-utils";
import { toast } from "sonner";
import { handleActionResult, toastMessages } from "@/lib/toast-helpers";
import type { Asset } from "@/types/asset";

export function AssetTable({ assets }: { assets: Asset[] }) {
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isRefreshing, startRefresh] = useTransition();

  function handleDelete(asset: Asset) {
    startTransition(async () => {
      toast.loading(toastMessages.asset.delete.loading, { id: `delete-${asset.id}` });
      const result = await deleteAsset(asset.id);
      handleActionResult(result, { 
        success: `'${asset.name}' 자산이 삭제되었습니다` 
      }, { id: `delete-${asset.id}` });
    });
  }

  function handleRefresh() {
    startRefresh(async () => {
      toast.loading(toastMessages.asset.refresh.loading, { id: "refresh-prices" });
      const result = await refreshPrices();
      handleActionResult(result, { 
        success: toastMessages.asset.refresh.success,
        error: toastMessages.asset.refresh.error
      }, { id: "refresh-prices" });
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
              <th className="pb-3 text-left font-medium text-muted-foreground">자산명</th>
              <th className="pb-3 text-left font-medium text-muted-foreground">카테고리</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">매수금액</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">현재가</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">수익률</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">관리</th>
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

      <EditAssetDialog
        asset={editingAsset}
        onClose={() => setEditingAsset(null)}
      />
    </>
  );
}
