"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { fetchPrice } from "@/services/price-service";
import * as assetRepo from "@/repositories/asset-repository";
import * as userRepo from "@/repositories/user-repository";
import type { Asset, AssetCategory, ActionResult } from "@/types/asset";

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
  const type = formData.get("type") as AssetCategory;
  const symbol = (formData.get("symbol") as string) || null;

  // 주식: 매수 단가 * 수량으로 amount 계산
  // 비주식: 직접 입력된 amount 사용
  let amount: number;
  let currentPrice: number;
  let purchasePrice: number | null = null;
  let quantity: number | null = null;

  if (type === "주식") {
    purchasePrice = parseFloat(formData.get("purchasePrice") as string);
    quantity = parseFloat(formData.get("quantity") as string);
    
    if (isNaN(purchasePrice) || isNaN(quantity) || purchasePrice <= 0 || quantity <= 0) {
      return { success: false, error: "매수 단가와 수량을 올바르게 입력해주세요." };
    }
    
    amount = purchasePrice * quantity;
    currentPrice = amount; // 초기값은 매수금액과 동일, 나중에 시세 업데이트
    
    // 심볼이 있으면 현재 시세 가져오기
    if (symbol) {
      const livePrice = await fetchPrice(symbol);
      if (livePrice !== null) {
        currentPrice = livePrice * quantity;
      }
    }
  } else {
    // 비주식 (부동산, 예적금)
    amount = parseFloat(formData.get("amount") as string);
    currentPrice = parseFloat(formData.get("currentPrice") as string) || 0;
    
    if (isNaN(amount)) {
      return { success: false, error: "잘못된 입력입니다." };
    }
  }

  if (!name || !type) {
    return { success: false, error: "잘못된 입력입니다." };
  }

  await assetRepo.createAsset({
    name,
    type,
    amount,
    currentPrice,
    symbol,
    purchasePrice,
    quantity,
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
  const type = formData.get("type") as AssetCategory;
  const symbol = (formData.get("symbol") as string) || null;

  if (!id || !name || !type) {
    return { success: false, error: "잘못된 입력입니다." };
  }

  const existingAsset = await assetRepo.findAssetById(id);
  if (!existingAsset || existingAsset.userId !== userId) {
    return { success: false, error: "권한이 없습니다." };
  }

  // 주식: 매수 단가 * 수량으로 amount 계산
  let amount: number;
  let currentPrice: number;
  let purchasePrice: number | null = null;
  let quantity: number | null = null;

  if (type === "주식") {
    purchasePrice = parseFloat(formData.get("purchasePrice") as string);
    quantity = parseFloat(formData.get("quantity") as string);
    
    if (isNaN(purchasePrice) || isNaN(quantity) || purchasePrice <= 0 || quantity <= 0) {
      return { success: false, error: "매수 단가와 수량을 올바르게 입력해주세요." };
    }
    
    amount = purchasePrice * quantity;
    currentPrice = existingAsset.currentPrice || amount;
    
    // 심볼이 있으면 현재 시세 가져오기
    if (symbol) {
      const livePrice = await fetchPrice(symbol);
      if (livePrice !== null) {
        currentPrice = livePrice * quantity;
      }
    }
  } else {
    // 비주식 (부동산, 예적금)
    amount = parseFloat(formData.get("amount") as string);
    currentPrice = parseFloat(formData.get("currentPrice") as string) || 0;
    
    if (isNaN(amount)) {
      return { success: false, error: "잘못된 입력입니다." };
    }
  }

  await assetRepo.updateAsset(id, { 
    name, 
    type, 
    amount, 
    currentPrice, 
    symbol, 
    purchasePrice, 
    quantity 
  });
  
  revalidatePath("/");
  return { success: true };
}

export async function refreshPrices(): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "로그인이 필요합니다." };

  const assets = await assetRepo.findAssetsWithSymbol(userId);

  for (const asset of assets) {
    if (!asset.symbol) continue;
    const unitPrice = await fetchPrice(asset.symbol);
    if (unitPrice !== null) {
      // 주식이고 수량이 있으면: 시세 * 수량으로 평가금액 업데이트
      // 그 외: 단순히 시세 업데이트
      const quantity = asset.quantity ?? 1;
      const totalValue = unitPrice * quantity;
      await assetRepo.updateAssetPrice(asset.id, totalValue);
    }
  }

  revalidatePath("/");
  return { success: true };
}
