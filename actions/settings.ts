"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { updateNickname, updateUserSettings, deleteUserAndData, resetUserData, exportUserData, requestSoftDelete, cancelSoftDelete, clearReactivatedAt } from "@/services/userService";
import type { Currency, Language } from "@/types/user";
import { prisma } from "@/lib/prisma";

export async function changeNickname(nickname: string): Promise<{ ok: boolean; error?: string }> {
  const trimmed = nickname?.trim() ?? "";
  if (trimmed.length < 2 || trimmed.length > 16)
    return { ok: false, error: "닉네임은 2~16자여야 합니다." };
  if (!/^[a-zA-Z0-9가-힣]+$/.test(trimmed))
    return { ok: false, error: "닉네임은 한글, 영문, 숫자만 사용 가능합니다." };

  try {
    const user = await getCurrentUser();
    await updateNickname(user.id, trimmed);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "오류가 발생했습니다." };
  }
}

export async function updateSettings(data: { baseCurrency?: Currency; language?: Language; isPrivacyMode?: boolean; allowNotifications?: boolean }) {
  const user = await getCurrentUser();
  await updateUserSettings(user.id, data);
  revalidatePath("/settings");
}

export async function logout() {
  // next-auth signOut은 클라이언트에서 처리
}

/** @deprecated 즉시 삭제 대신 requestDeleteAccount 사용 */
export async function deleteAccount() {
  const user = await getCurrentUser();
  await deleteUserAndData(user.id);
  revalidatePath("/");
}

/** 탈퇴 신청 — 24시간 유예 후 삭제 (signOut은 클라이언트에서 처리하지 않음) */
export async function requestDeleteAccount() {
  const user = await getCurrentUser();
  await requestSoftDelete(user.id);
  revalidatePath("/settings");
}

/** 탈퇴 취소 */
export async function cancelDeleteAccount() {
  const user = await getCurrentUser();
  await cancelSoftDelete(user.id);
  revalidatePath("/settings");
}

/** 재활성화 토스트 플래그 초기화 */
export async function clearReactivationNotice() {
  const user = await getCurrentUser();
  await clearReactivatedAt(user.id);
}

export async function resetAllData() {
  const user = await getCurrentUser();
  await resetUserData(user.id);
  revalidatePath("/settings");
}

export async function exportCSV() {
  const user = await getCurrentUser();
  return await exportUserData(user.id);
}

/** 이메일 2FA 활성화/비활성화 토글 */
export async function toggleTwoFactor(): Promise<{ ok: boolean; enabled?: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorEnabled: true },
    });
    if (!dbUser) return { ok: false, error: "사용자를 찾을 수 없습니다." };

    const next = !dbUser.twoFactorEnabled;
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: next },
    });
    revalidatePath("/settings");
    return { ok: true, enabled: next };
  } catch {
    return { ok: false, error: "오류가 발생했습니다." };
  }
}
