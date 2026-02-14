"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

async function getCurrentUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("로그인이 필요합니다.");
  }

  return session.user.id;
}

export type Asset = {
  id: string;
  name: string;
  type: string;
  amount: number;
  currentPrice: number;
  symbol: string | null;
  userId: string;
};

export async function getAssets(): Promise<Asset[]> {
  const userId = await getCurrentUserId();

  const assets = await prisma.asset.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });

  return assets;
}

export async function addAsset(formData: FormData) {
  const userId = await getCurrentUserId();

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currentPrice = parseFloat(formData.get("currentPrice") as string) || 0;
  const symbol = (formData.get("symbol") as string) || null;

  if (!name || !type || isNaN(amount)) {
    throw new Error("잘못된 입력입니다.");
  }

  // symbol이 있으면 즉시 시세 조회
  let resolvedPrice = currentPrice;
  if (symbol) {
    const livePrice = await fetchPrice(symbol);
    if (livePrice !== null) {
      resolvedPrice = livePrice;
    }
  }

  await prisma.asset.create({
    data: {
      name,
      type,
      amount,
      currentPrice: resolvedPrice,
      symbol,
      userId,
    },
  });

  revalidatePath("/");
}

export async function deleteAsset(id: string) {
  const userId = await getCurrentUserId();

  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset || asset.userId !== userId) {
    throw new Error("권한이 없습니다.");
  }

  await prisma.transaction.deleteMany({
    where: { assetId: id },
  });

  await prisma.asset.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function updateAsset(formData: FormData) {
  const userId = await getCurrentUserId();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currentPrice = parseFloat(formData.get("currentPrice") as string) || 0;
  const symbol = (formData.get("symbol") as string) || null;

  if (!id || !name || !type || isNaN(amount)) {
    throw new Error("잘못된 입력입니다.");
  }

  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset || asset.userId !== userId) {
    throw new Error("권한이 없습니다.");
  }

  await prisma.asset.update({
    where: { id },
    data: {
      name,
      type,
      amount,
      currentPrice,
      symbol,
    },
  });

  revalidatePath("/");
}

async function fetchStockPrice(symbol: string): Promise<number | null> {
  try {
    const result = await yahooFinance.quote(symbol) as Record<string, unknown>;
    const price = result?.regularMarketPrice;
    if (typeof price === "number") return price;
    console.error(`주식 시세 파싱 실패 (${symbol}):`, result);
    return null;
  } catch (err) {
    console.error(`주식 시세 조회 실패 (${symbol}):`, err);
    return null;
  }
}

async function fetchCryptoPrice(symbol: string): Promise<number | null> {
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
    const data = await res.json();
    const price = data[0]?.trade_price;
    if (typeof price === "number") return price;
    console.error(`코인 시세 파싱 실패 (${symbol}):`, data);
    return null;
  } catch (err) {
    console.error(`코인 시세 조회 실패 (${symbol}):`, err);
    return null;
  }
}

async function fetchPrice(symbol: string): Promise<number | null> {
  const isStock = symbol.includes(".");
  return isStock ? fetchStockPrice(symbol) : fetchCryptoPrice(symbol);
}

export async function refreshPrices() {
  const userId = await getCurrentUserId();

  const assets = await prisma.asset.findMany({
    where: {
      userId,
      symbol: { not: null },
    },
  });

  for (const asset of assets) {
    if (!asset.symbol) continue;

    const price = await fetchPrice(asset.symbol);

    if (price !== null) {
      await prisma.asset.update({
        where: { id: asset.id },
        data: { currentPrice: price },
      });
    }
  }

  revalidatePath("/");
}
