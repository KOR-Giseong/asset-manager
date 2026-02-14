export type AssetCategory = "주식" | "부동산" | "예적금";

export interface Asset {
  id: string;
  name: string;
  type: string;
  amount: number;         // 총 매수 금액
  currentPrice: number;   // 총 평가 금액
  symbol: string | null;
  purchasePrice: number | null;  // 매수 단가 (주식 전용)
  quantity: number | null;       // 보유 수량 (주식 전용)
  userId: string;
}

// 주식 수익률 계산 결과
export interface StockProfitInfo {
  purchasePrice: number;    // 매수 단가
  currentUnitPrice: number; // 현재 주당 시세
  quantity: number;         // 보유 수량
  totalPurchase: number;    // 총 매수 금액
  totalValue: number;       // 총 평가 금액
  profitAmount: number;     // 수익금
  profitRate: number;       // 수익률 (%)
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export interface ProfitInfo {
  diff: number;
  rate: number;
}

export interface CreateAssetInput {
  name: string;
  type: string;
  amount: number;
  currentPrice: number;
  symbol: string | null;
  purchasePrice: number | null;
  quantity: number | null;
  userId: string;
}

export interface UpdateAssetInput {
  name: string;
  type: string;
  amount: number;
  currentPrice: number;
  symbol: string | null;
  purchasePrice: number | null;
  quantity: number | null;
}

export interface UpbitTickerResponse {
  market: string;
  trade_price: number;
  [key: string]: unknown;
}
