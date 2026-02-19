"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { updateNickname, updateUserSettings, deleteUserAndData, resetUserData, exportUserData, requestSoftDelete, cancelSoftDelete, clearReactivatedAt } from "@/services/userService";
import type { Currency, Language } from "@/types/user";

export async function changeNickname(nickname: string) {
  const user = await getCurrentUser();
  await updateNickname(user.id, nickname);
  revalidatePath("/settings");
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
