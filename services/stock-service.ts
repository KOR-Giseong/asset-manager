// =========================================
// 주식 수익률 계산 서비스
// =========================================

import type { Asset, StockProfitInfo } from "@/types/asset";

/**
 * 주식 자산의 수익 정보를 계산합니다.
 * 
 * @param asset - 주식 자산 객체
 * @param currentUnitPrice - 현재 주당 시세 (선택적, 없으면 평가금액 기반으로 역산)
 * @returns StockProfitInfo | null - 필수 데이터가 없으면 null 반환
 */
export function calculateStockProfit(
  asset: Asset,
  currentUnitPrice?: number
): StockProfitInfo | null {
  // 주식이 아니거나 필수 데이터가 없으면 null
  if (asset.type !== "주식") return null;
  if (!asset.purchasePrice || !asset.quantity) return null;

  const purchasePrice = asset.purchasePrice;
  const quantity = asset.quantity;
  const totalPurchase = purchasePrice * quantity;

  // 현재 주당 시세 결정
  // 1. 파라미터로 전달된 값 사용
  // 2. 없으면 평가금액에서 역산 (currentPrice / quantity)
  let unitPrice = currentUnitPrice;
  if (!unitPrice && asset.currentPrice > 0 && quantity > 0) {
    unitPrice = asset.currentPrice / quantity;
  }
  
  // 현재 시세 정보가 없으면 매수가 기준으로 계산
  const effectiveUnitPrice = unitPrice ?? purchasePrice;
  const totalValue = effectiveUnitPrice * quantity;
  
  // 수익금: (현재 시세 - 매수 단가) * 보유 수량
  const profitAmount = (effectiveUnitPrice - purchasePrice) * quantity;
  
  // 수익률: ((현재 시세 - 매수 단가) / 매수 단가) * 100
  const profitRate = purchasePrice > 0 
    ? ((effectiveUnitPrice - purchasePrice) / purchasePrice) * 100 
    : 0;

  return {
    purchasePrice,
    currentUnitPrice: effectiveUnitPrice,
    quantity,
    totalPurchase,
    totalValue,
    profitAmount,
    profitRate,
  };
}

/**
 * 주식 평가 금액을 계산합니다.
 * 
 * @param currentUnitPrice - 현재 주당 시세
 * @param quantity - 보유 수량
 * @returns 총 평가 금액
 */
export function calculateTotalValue(
  currentUnitPrice: number,
  quantity: number
): number {
  return currentUnitPrice * quantity;
}

/**
 * 주식 총 매수 금액을 계산합니다.
 * 
 * @param purchasePrice - 매수 단가
 * @param quantity - 보유 수량
 * @returns 총 매수 금액
 */
export function calculateTotalPurchase(
  purchasePrice: number,
  quantity: number
): number {
  return purchasePrice * quantity;
}

/**
 * 수익률을 포맷팅합니다.
 * 
 * @param rate - 수익률 (%)
 * @returns 포맷된 문자열 (예: "+12.34%" 또는 "-5.67%")
 */
export function formatProfitRate(rate: number): string {
  const sign = rate > 0 ? "+" : "";
  return `${sign}${rate.toFixed(2)}%`;
}

/**
 * 주식 여부를 확인하고 수량 기반 관리가 가능한지 검사합니다.
 */
export function isQuantityBasedStock(asset: Asset): boolean {
  return asset.type === "주식" && asset.purchasePrice !== null && asset.quantity !== null;
}
