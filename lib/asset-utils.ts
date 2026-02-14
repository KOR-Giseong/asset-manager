import type { Asset, ProfitInfo } from "@/types/asset";

export function getProfitInfo(amount: number, currentPrice: number): ProfitInfo | null {
  if (!currentPrice || !amount) return null;
  const diff = currentPrice - amount;
  const rate = (diff / amount) * 100;
  return { diff, rate };
}

export function calculateTotalAssets(assets: Asset[]): number {
  return assets.reduce(
    (sum, a) => sum + (a.currentPrice > 0 ? a.currentPrice : a.amount),
    0
  );
}

export function calculateCategoryTotals(assets: Asset[]): Record<string, number> {
  return assets.reduce<Record<string, number>>((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + a.amount;
    return acc;
  }, {});
}
