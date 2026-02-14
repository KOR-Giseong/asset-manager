export type AssetCategory = "주식" | "부동산" | "예적금";

export interface Asset {
  id: string;
  name: string;
  type: string;
  amount: number;
  currentPrice: number;
  symbol: string | null;
  userId: string;
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
  userId: string;
}

export interface UpdateAssetInput {
  name: string;
  type: string;
  amount: number;
  currentPrice: number;
  symbol: string | null;
}

export interface UpbitTickerResponse {
  market: string;
  trade_price: number;
  [key: string]: unknown;
}
