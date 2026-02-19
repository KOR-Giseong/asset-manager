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

export async function requestSoftDelete(userId: string) {
  return prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
}

export async function cancelSoftDelete(userId: string) {
  return prisma.user.update({ where: { id: userId }, data: { deletedAt: null } });
}

export async function clearReactivatedAt(userId: string) {
  return prisma.user.update({ where: { id: userId }, data: { reactivatedAt: null } });
}

export async function resetUserData(userId: string) {
  // 자산, 이력 등만 삭제, 계정은 남김
  await prisma.asset.deleteMany({ where: { userId } });
  await prisma.property.deleteMany({ where: { userId } });
  await prisma.assetSnapshot.deleteMany({ where: { userId } });
  // 기타 필요한 데이터 추가 삭제
}

export async function exportUserData(userId: string) {
  const assets = await prisma.asset.findMany({ where: { userId } });
  const properties = await prisma.property.findMany({ where: { userId } });

  const lines: string[] = [];

  // 자산 섹션
  lines.push("=== 자산 ===");
  lines.push("이름,유형,매수금액,평가금액,수익률,종목코드,매수단가,수량");
  for (const a of assets) {
    const returnRate = a.amount > 0
      ? (((a.currentPrice - a.amount) / a.amount) * 100).toFixed(2) + "%"
      : "0%";
    lines.push([
      a.name, a.type, a.amount, a.currentPrice, returnRate,
      a.symbol ?? "", a.purchasePrice ?? "", a.quantity ?? "",
    ].join(","));
  }

  // 부동산 섹션
  lines.push("");
  lines.push("=== 부동산 ===");
  lines.push("이름,유형,계약형태,주소,매수가,현재시세,대출원금,대출이자율,보증금,월세,관리비");
  for (const p of properties) {
    lines.push([
      p.name, p.propertyType, p.contractType, p.address,
      p.purchasePrice, p.currentPrice, p.loanPrincipal, p.loanInterestRate,
      p.deposit, p.monthlyRent, p.maintenanceFee,
    ].join(","));
  }

  // BOM 추가 (엑셀에서 한글 깨짐 방지)
  return "\uFEFF" + lines.join("\n");
}
