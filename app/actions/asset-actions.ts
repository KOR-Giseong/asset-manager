"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { fetchPrice } from "@/services/price-service";
import * as assetRepo from "@/repositories/asset-repository";
import * as userRepo from "@/repositories/user-repository";
import type { Asset, ActionResult } from "@/types/asset";

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const existingUser = await userRepo.findUserById(session.user.id);
    if (!existingUser) {
      await userRepo.createUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      });
    }

    return session.user.id;
  } catch (err) {
    console.error("[Session] auth() 호출 실패:", err);
    return null;
  }
}

export async function getAssets(): Promise<Asset[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  return assetRepo.findAssetsByUserId(userId);
}

export async function addAsset(formData: FormData): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "로그인이 필요합니다." };

  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currentPrice = parseFloat(formData.get("currentPrice") as string) || 0;
  const symbol = (formData.get("symbol") as string) || null;

  if (!name || !type || isNaN(amount)) {
    return { success: false, error: "잘못된 입력입니다." };
  }

  let resolvedPrice = currentPrice;
  if (symbol) {
    const livePrice = await fetchPrice(symbol);
    if (livePrice !== null) resolvedPrice = livePrice;
  }

  await assetRepo.createAsset({
    name,
    type,
    amount,
    currentPrice: resolvedPrice,
    symbol,
    userId,
  });

  revalidatePath("/");
  return { success: true };
}

export async function deleteAsset(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "로그인이 필요합니다." };

  const asset = await assetRepo.findAssetById(id);
  if (!asset || asset.userId !== userId) {
    return { success: false, error: "권한이 없습니다." };
  }

  await assetRepo.deleteAssetWithTransactions(id);
  revalidatePath("/");
  return { success: true };
}

export async function updateAsset(formData: FormData): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "로그인이 필요합니다." };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const currentPrice = parseFloat(formData.get("currentPrice") as string) || 0;
  const symbol = (formData.get("symbol") as string) || null;

  if (!id || !name || !type || isNaN(amount)) {
    return { success: false, error: "잘못된 입력입니다." };
  }

  const asset = await assetRepo.findAssetById(id);
  if (!asset || asset.userId !== userId) {
    return { success: false, error: "권한이 없습니다." };
  }

  await assetRepo.updateAsset(id, { name, type, amount, currentPrice, symbol });
  revalidatePath("/");
  return { success: true };
}

export async function refreshPrices(): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "로그인이 필요합니다." };

  const assets = await assetRepo.findAssetsWithSymbol(userId);

  for (const asset of assets) {
    if (!asset.symbol) continue;
    const price = await fetchPrice(asset.symbol);
    if (price !== null) {
      await assetRepo.updateAssetPrice(asset.id, price);
    }
  }

  revalidatePath("/");
  return { success: true };
}
