import { prisma } from "@/lib/prisma";
import { User } from "@/types/user";

export async function updateNickname(userId: string, nickname: string) {
  // 닉네임 중복 체크
  const exists = await prisma.user.findUnique({ where: { nickname } });
  if (exists && exists.id !== userId) throw new Error("이미 사용 중인 닉네임입니다.");
  return prisma.user.update({ where: { id: userId }, data: { nickname } });
}

export async function updateUserSettings(userId: string, data: Partial<Pick<User, "baseCurrency" | "language" | "isPrivacyMode" | "allowNotifications">>) {
  return prisma.user.update({ where: { id: userId }, data });
}

export async function deleteUserAndData(userId: string) {
  // 연쇄 삭제 (prisma onDelete: Cascade 활용)
  return prisma.user.delete({ where: { id: userId } });
}

export async function resetUserData(userId: string) {
  // 자산, 이력 등만 삭제, 계정은 남김
  await prisma.asset.deleteMany({ where: { userId } });
  await prisma.property.deleteMany({ where: { userId } });
  await prisma.assetSnapshot.deleteMany({ where: { userId } });
  // 기타 필요한 데이터 추가 삭제
}

export async function exportUserData(userId: string) {
  // CSV 변환 로직은 생략 (예시)
  return "id,title,amount\n1,Sample,1000";
}
