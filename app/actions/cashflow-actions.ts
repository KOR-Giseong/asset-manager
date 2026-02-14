"use server";

// =========================================
// 현금흐름 Server Actions
// =========================================

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getMonthlyCashFlow,
  type MonthlyCashFlowSummary,
} from "@/services/cashFlowService";
import type { Property } from "@/types/property";

// =========================================
// 월별 현금흐름 조회
// =========================================

export async function fetchMonthlyCashFlow(
  year: number,
  month: number
): Promise<{
  success: boolean;
  data?: MonthlyCashFlowSummary;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "인증이 필요합니다." };
    }

    // 사용자의 부동산 조회 (Property 타입 변환)
    const properties = await prisma.property.findMany({
      where: { userId: session.user.id },
    });

    // Prisma 결과를 Property 타입으로 변환
    const typedProperties: Property[] = properties.map((p) => ({
      ...p,
      propertyType: p.propertyType as Property["propertyType"],
      contractType: p.contractType as Property["contractType"],
    }));

    // 현금흐름 계산 (userId, year, month, properties)
    const summary = await getMonthlyCashFlow(
      session.user.id,
      year,
      month,
      typedProperties
    );

    return { success: true, data: summary };
  } catch (error) {
    console.error("Failed to fetch monthly cash flow:", error);
    return { success: false, error: "현금흐름 조회에 실패했습니다." };
  }
}
