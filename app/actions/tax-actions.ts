"use server";

// =========================================
// 세금 관련 서버 액션
// =========================================

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// =========================================
// 연봉 업데이트
// =========================================

export async function updateAnnualSalary(annualSalary: number) {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: { annualSalary },
    });

    revalidatePath("/tax");
    return { success: true };
  } catch (error) {
    console.error("연봉 업데이트 실패:", error);
    return { success: false, error: "연봉 업데이트에 실패했습니다." };
  }
}

// =========================================
// 사용자 연봉 조회
// =========================================

export async function getAnnualSalary(): Promise<number | null> {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { annualSalary: true },
  });

  return user?.annualSalary ?? null;
}
