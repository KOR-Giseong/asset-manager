import YahooFinance from "yahoo-finance2";
import type { UpbitTickerResponse } from "@/types/asset";

const yahooFinance = new YahooFinance();

export async function fetchStockPrice(symbol: string): Promise<number | null> {
  try {
    const result = (await yahooFinance.quote(symbol)) as Record<string, unknown>;
    const price = result?.regularMarketPrice;
    if (typeof price === "number") return price;
    console.error(`주식 시세 파싱 실패 (${symbol}):`, result);
    return null;
  } catch (err) {
    console.error(`주식 시세 조회 실패 (${symbol}):`, err);
    return null;
  }
}

export async function fetchCryptoPrice(symbol: string): Promise<number | null> {
  try {
    const market = `KRW-${symbol.toUpperCase()}`;
    const res = await fetch(
      `https://api.upbit.com/v1/ticker?markets=${market}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      console.error(`코인 API 응답 실패 (${symbol}): ${res.status}`);
      return null;
    }
    const data: UpbitTickerResponse[] = await res.json();
    const price = data[0]?.trade_price;
    if (typeof price === "number") return price;
    console.error(`코인 시세 파싱 실패 (${symbol}):`, data);
    return null;
  } catch (err) {
    console.error(`코인 시세 조회 실패 (${symbol}):`, err);
    return null;
  }
}

export async function fetchPrice(symbol: string): Promise<number | null> {
  const isStock = symbol.includes(".");
  return isStock ? fetchStockPrice(symbol) : fetchCryptoPrice(symbol);
}
