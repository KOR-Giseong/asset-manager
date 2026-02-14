"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    console.log("[Session] 현재 세션:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      console.error("[Session] 세션에 user.id 없음:", session);
      return null;
    }

    // DB에 User가 없으면 생성 (JWT 전략 + PrismaAdapter 조합 대응)
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        },
      });
      console.log("[Session] 새 User 생성:", session.user.id);
    }

    return session.user.id;
  } catch (err) {
    console.error("[Session] auth() 호출 실패:", err);
    return null;
  }
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

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function getAssets(): Promise<Asset[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const assets = await prisma.asset.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });

  return assets;
}

export async function addAsset(formData: FormData): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currentPrice = parseFloat(formData.get("currentPrice") as string) || 0;
  const symbol = (formData.get("symbol") as string) || null;

  if (!name || !type || isNaN(amount)) {
    return { success: false, error: "잘못된 입력입니다." };
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
  return { success: true };
}

export async function deleteAsset(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset || asset.userId !== userId) {
    return { success: false, error: "권한이 없습니다." };
  }

  await prisma.transaction.deleteMany({
    where: { assetId: id },
  });

  await prisma.asset.delete({
    where: { id },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateAsset(formData: FormData): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currentPrice = parseFloat(formData.get("currentPrice") as string) || 0;
  const symbol = (formData.get("symbol") as string) || null;

  if (!id || !name || !type || isNaN(amount)) {
    return { success: false, error: "잘못된 입력입니다." };
  }

  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset || asset.userId !== userId) {
    return { success: false, error: "권한이 없습니다." };
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
  return { success: true };
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

export async function refreshPrices(): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

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
  return { success: true };
}
