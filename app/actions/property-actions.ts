"use server";

// =========================================
// 부동산 Server Actions - 얇은 오케스트레이션 레이어
// =========================================

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { ensureUser } from "@/repositories/user-repository";
import * as propertyRepo from "@/repositories/property-repository";
import type { Property, CreatePropertyInput, PropertyType, ContractType } from "@/types/property";
import type { ActionResult } from "@/types/asset";

// =========================================
// 인증 헬퍼
// =========================================

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    await ensureUser({
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email ?? null,
      image: session.user.image ?? null,
    });

    return session.user.id;
  } catch {
    return null;
  }
}

function revalidatePropertyPaths() {
  revalidatePath("/");
  revalidatePath("/properties");
}

// =========================================
// FormData → CreatePropertyInput 변환
// =========================================

const PROPERTY_TYPES: Set<string> = new Set([
  "APARTMENT", "VILLA", "OFFICETEL", "COMMERCIAL", "LAND", "OTHER",
]);

const CONTRACT_TYPES: Set<string> = new Set([
  "OWNED", "JEONSE", "MONTHLY", "RENTAL_JEONSE", "RENTAL_MONTHLY",
]);

function parsePropertyFormData(formData: FormData): CreatePropertyInput | null {
  const name = formData.get("name") as string | null;
  const propertyType = formData.get("propertyType") as string | null;
  const contractType = formData.get("contractType") as string | null;
  const address = formData.get("address") as string | null;

  // 필수 필드 + enum 런타임 검증
  if (
    !name ||
    !propertyType ||
    !contractType ||
    !address ||
    !PROPERTY_TYPES.has(propertyType) ||
    !CONTRACT_TYPES.has(contractType)
  ) {
    return null;
  }

  return {
    name,
    propertyType: propertyType as PropertyType,
    contractType: contractType as ContractType,
    address,
    purchasePrice: parseFloat(formData.get("purchasePrice") as string) || 0,
    currentPrice: parseFloat(formData.get("currentPrice") as string) || 0,
    acquisitionCost: parseFloat(formData.get("acquisitionCost") as string) || 0,
    loanPrincipal: parseFloat(formData.get("loanPrincipal") as string) || 0,
    loanInterestRate: parseFloat(formData.get("loanInterestRate") as string) || 0,
    deposit: parseFloat(formData.get("deposit") as string) || 0,
    monthlyRent: parseFloat(formData.get("monthlyRent") as string) || 0,
    maintenanceFee: parseFloat(formData.get("maintenanceFee") as string) || 0,
    contractStartDate: formData.get("contractStartDate")
      ? new Date(formData.get("contractStartDate") as string)
      : null,
    contractEndDate: formData.get("contractEndDate")
      ? new Date(formData.get("contractEndDate") as string)
      : null,
    notes: (formData.get("notes") as string) || null,
  };
}

// =========================================
// CRUD Actions
// =========================================

export async function getProperties(): Promise<Property[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  return propertyRepo.findPropertiesByUserId(userId);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return propertyRepo.findPropertyByIdAndUserId(id, userId);
}

export async function addProperty(formData: FormData): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "로그인이 필요합니다." };

  const input = parsePropertyFormData(formData);
  if (!input) return { success: false, error: "필수 정보를 입력해주세요." };

  try {
    await propertyRepo.createProperty(input, userId);
    revalidatePropertyPaths();
    return { success: true };
  } catch (error) {
    console.error("[Property] 추가 실패:", error);
    return { success: false, error: "부동산 추가에 실패했습니다." };
  }
}

export async function updateProperty(formData: FormData): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "로그인이 필요합니다." };

  const id = formData.get("id") as string;
  if (!id) return { success: false, error: "부동산 ID가 필요합니다." };

  const existing = await propertyRepo.findPropertyByIdAndUserId(id, userId);
  if (!existing) return { success: false, error: "부동산을 찾을 수 없습니다." };

  const input = parsePropertyFormData(formData);
  if (!input) return { success: false, error: "필수 정보를 입력해주세요." };

  try {
    await propertyRepo.updatePropertyById(id, input);
    revalidatePropertyPaths();
    return { success: true };
  } catch (error) {
    console.error("[Property] 수정 실패:", error);
    return { success: false, error: "부동산 수정에 실패했습니다." };
  }
}

export async function deleteProperty(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "로그인이 필요합니다." };

  const existing = await propertyRepo.findPropertyByIdAndUserId(id, userId);
  if (!existing) return { success: false, error: "부동산을 찾을 수 없습니다." };

  try {
    await propertyRepo.deletePropertyById(id);
    revalidatePropertyPaths();
    return { success: true };
  } catch (error) {
    console.error("[Property] 삭제 실패:", error);
    return { success: false, error: "부동산 삭제에 실패했습니다." };
  }
}

export async function updatePropertyPrice(
  id: string,
  newPrice: number
): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "로그인이 필요합니다." };

  const existing = await propertyRepo.findPropertyByIdAndUserId(id, userId);
  if (!existing) return { success: false, error: "부동산을 찾을 수 없습니다." };

  try {
    await propertyRepo.updatePropertyById(id, { currentPrice: newPrice });
    revalidatePropertyPaths();
    return { success: true };
  } catch (error) {
    console.error("[Property] 시세 업데이트 실패:", error);
    return { success: false, error: "시세 업데이트에 실패했습니다." };
  }
}

export async function getExpiringProperties(daysThreshold = 90): Promise<Property[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  return propertyRepo.findExpiringProperties(userId, daysThreshold);
}
