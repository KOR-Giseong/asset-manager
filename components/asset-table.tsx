"use client";

import { useState, useTransition } from "react";
import { Trash2, Pencil, RefreshCw, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditAssetDialog } from "@/components/edit-asset-dialog";
import { deleteAsset, refreshPrices } from "@/app/actions/asset-actions";
import { formatKRW } from "@/lib/format";
import { getProfitInfo } from "@/lib/asset-utils";
import { calculateStockProfit, formatProfitRate } from "@/services/stock-service";
import { toast } from "sonner";
import { handleActionResult, toastMessages } from "@/lib/toast-helpers";
import type { Asset } from "@/types/asset";

// =========================================
// 모바일 자산 카드 컴포넌트
// =========================================

interface AssetCardProps {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (asset: Asset) => void;
  isPending: boolean;
}

function AssetCard({ asset, onEdit, onDelete, isPending }: AssetCardProps) {
  const stockProfit = calculateStockProfit(asset);
  const profit = stockProfit 
    ? { diff: stockProfit.profitAmount, rate: stockProfit.profitRate }
    : getProfitInfo(asset.amount, asset.currentPrice);

  return (
    <div className="rounded-lg border border-border/60 bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium text-foreground">{asset.name}</span>
            <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
              {asset.type}
            </span>
          </div>
          {asset.symbol && (
            <p className="mt-0.5 text-xs text-muted-foreground">{asset.symbol}</p>
          )}
          {/* 주식: 매수 단가 표시 */}
          {stockProfit && (
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              매수가 {formatKRW(stockProfit.purchasePrice)} × {stockProfit.quantity}주
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(asset)}>
              <Pencil className="mr-2 h-4 w-4" />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(asset)}
              disabled={isPending}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-muted-foreground">매수금액</p>
          <p className="font-medium">{formatKRW(asset.amount)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">평가금액</p>
          <p className="font-medium">
            {asset.currentPrice > 0 ? formatKRW(asset.currentPrice) : "—"}
          </p>
        </div>
      </div>

      {profit && (
        <div className="mt-2 flex items-center justify-between">
          {stockProfit && (
            <span className={`text-xs ${profit.diff >= 0 ? "text-red-500" : "text-blue-500"}`}>
              {profit.diff > 0 ? "+" : ""}{formatKRW(profit.diff)}
            </span>
          )}
          <span
            className={`text-sm font-semibold ${
              profit.rate > 0
                ? "text-red-500"
                : profit.rate < 0
                  ? "text-blue-500"
                  : "text-muted-foreground"
            } ${!stockProfit ? "ml-auto" : ""}`}
          >
            {formatProfitRate(profit.rate)}
          </span>
        </div>
      )}
    </div>
  );
}

// =========================================
// 메인 테이블 컴포넌트
// =========================================

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
      <p className="py-8 text-center text-xs text-muted-foreground sm:text-sm">
        등록된 자산이 없습니다. 자산을 추가해보세요.
      </p>
    );
  }

  return (
    <>
      {/* 헤더 */}
      <div className="mb-3 flex justify-end sm:mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-9 gap-1.5 text-xs sm:gap-2 sm:text-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{isRefreshing ? "업데이트 중..." : "시세 새로고침"}</span>
          <span className="sm:hidden">{isRefreshing ? "업데이트..." : "새로고침"}</span>
        </Button>
      </div>

      {/* 모바일: 카드 리스트 */}
      <div className="flex flex-col gap-2 md:hidden">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onEdit={setEditingAsset}
            onDelete={handleDelete}
            isPending={isPending}
          />
        ))}
      </div>

      {/* 데스크톱: 테이블 */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-left font-medium text-muted-foreground">자산명</th>
                <th className="pb-3 text-left font-medium text-muted-foreground">카테고리</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">매수 정보</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">평가금액</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">수익</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">관리</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => {
                const stockProfit = calculateStockProfit(asset);
                const profit = stockProfit 
                  ? { diff: stockProfit.profitAmount, rate: stockProfit.profitRate }
                  : getProfitInfo(asset.amount, asset.currentPrice);

                return (
                  <tr
                    key={asset.id}
                    className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/50"
                  >
                    <td
                      className="cursor-pointer py-3 font-medium text-foreground hover:text-primary"
                      onClick={() => setEditingAsset(asset)}
                    >
                      <div className="max-w-[200px] truncate">{asset.name}</div>
                      {asset.symbol && (
                        <span className="text-xs text-muted-foreground">{asset.symbol}</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        {asset.type}
                      </span>
                    </td>
                    {/* 매수 정보: 주식은 단가×수량, 그 외는 총액 */}
                    <td className="py-3 text-right">
                      <div className="font-medium">{formatKRW(asset.amount)}</div>
                      {stockProfit && (
                        <div className="text-[11px] text-muted-foreground">
                          {formatKRW(stockProfit.purchasePrice)} × {stockProfit.quantity}주
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {asset.currentPrice > 0 ? formatKRW(asset.currentPrice) : (
                        <span className="text-muted-foreground">
                          {asset.symbol ? "N/A" : "—"}
                        </span>
                      )}
                    </td>
                    {/* 수익: 수익금 + 수익률 */}
                    <td className="py-3 text-right">
                      {profit ? (
                        <div>
                          <span
                            className={`font-semibold ${
                              profit.rate > 0
                                ? "text-red-500"
                                : profit.rate < 0
                                  ? "text-blue-500"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {formatProfitRate(profit.rate)}
                          </span>
                          {stockProfit && (
                            <div className={`text-[11px] ${profit.diff >= 0 ? "text-red-500/80" : "text-blue-500/80"}`}>
                              {profit.diff > 0 ? "+" : ""}{formatKRW(profit.diff)}
                            </div>
                          )}
                        </div>
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
      </div>

      <EditAssetDialog
        asset={editingAsset}
        onClose={() => setEditingAsset(null)}
      />
    </>
  );
}
