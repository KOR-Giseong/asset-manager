"use server";

// =========================================
// 부동산 Server Actions - CRUD 및 데이터 조회
// =========================================

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { Property, CreatePropertyInput, PropertyType, ContractType } from "@/types/property";
import type { ActionResult } from "@/types/asset";

// =========================================
// 사용자 ID 조회 (User 자동 생성 포함)
// =========================================

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    // DB에 User가 없으면 생성
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
    }

    return session.user.id;
  } catch {
    return null;
  }
}

// =========================================
// 부동산 목록 조회
// =========================================

export async function getProperties(): Promise<Property[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const properties = await prisma.property.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return properties as Property[];
}

// =========================================
// 부동산 상세 조회
// =========================================

export async function getPropertyById(id: string): Promise<Property | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const property = await prisma.property.findFirst({
    where: { id, userId },
  });

  return property as Property | null;
}

// =========================================
// 부동산 추가
// =========================================

export async function addProperty(formData: FormData): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const input: CreatePropertyInput = {
      name: formData.get("name") as string,
      propertyType: formData.get("propertyType") as PropertyType,
      contractType: formData.get("contractType") as ContractType,
      address: formData.get("address") as string,
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

    // 필수 필드 검증
    if (!input.name || !input.propertyType || !input.contractType || !input.address) {
      return { success: false, error: "필수 정보를 입력해주세요." };
    }

    await prisma.property.create({
      data: {
        ...input,
        userId,
      },
    });

    revalidatePath("/");
    revalidatePath("/properties");
    return { success: true };
  } catch (error) {
    console.error("[Property] 추가 실패:", error);
    return { success: false, error: "부동산 추가에 실패했습니다." };
  }
}

// =========================================
// 부동산 수정
// =========================================

export async function updateProperty(formData: FormData): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const id = formData.get("id") as string;
  if (!id) {
    return { success: false, error: "부동산 ID가 필요합니다." };
  }

  // 권한 확인
  const existing = await prisma.property.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return { success: false, error: "부동산을 찾을 수 없습니다." };
  }

  try {
    await prisma.property.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        propertyType: formData.get("propertyType") as PropertyType,
        contractType: formData.get("contractType") as ContractType,
        address: formData.get("address") as string,
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
      },
    });

    revalidatePath("/");
    revalidatePath("/properties");
    return { success: true };
  } catch (error) {
    console.error("[Property] 수정 실패:", error);
    return { success: false, error: "부동산 수정에 실패했습니다." };
  }
}

// =========================================
// 부동산 삭제
// =========================================

export async function deleteProperty(id: string): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 권한 확인
  const existing = await prisma.property.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return { success: false, error: "부동산을 찾을 수 없습니다." };
  }

  try {
    await prisma.property.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/properties");
    return { success: true };
  } catch (error) {
    console.error("[Property] 삭제 실패:", error);
    return { success: false, error: "부동산 삭제에 실패했습니다." };
  }
}

// =========================================
// 현재 시세 업데이트
// =========================================

export async function updatePropertyPrice(
  id: string,
  newPrice: number
): Promise<ActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 권한 확인
  const existing = await prisma.property.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return { success: false, error: "부동산을 찾을 수 없습니다." };
  }

  try {
    await prisma.property.update({
      where: { id },
      data: { currentPrice: newPrice },
    });

    revalidatePath("/");
    revalidatePath("/properties");
    return { success: true };
  } catch (error) {
    console.error("[Property] 시세 업데이트 실패:", error);
    return { success: false, error: "시세 업데이트에 실패했습니다." };
  }
}

// =========================================
// 만기 임박 부동산 조회
// =========================================

export async function getExpiringProperties(daysThreshold = 90): Promise<Property[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const now = new Date();
  const threshold = new Date();
  threshold.setDate(now.getDate() + daysThreshold);

  const properties = await prisma.property.findMany({
    where: {
      userId,
      contractEndDate: {
        gte: now,
        lte: threshold,
      },
    },
    orderBy: { contractEndDate: "asc" },
  });

  return properties as Property[];
}
