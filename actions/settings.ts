"use server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { updateNickname, updateUserSettings, deleteUserAndData, resetUserData, exportUserData } from "@/services/userService";
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

export async function deleteAccount() {
  const user = await getCurrentUser();
  await deleteUserAndData(user.id);
  revalidatePath("/");
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
