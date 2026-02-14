// =========================================
// 자산 히스토리 서비스
// =========================================
// 스냅샷 기록 및 조회 로직
// =========================================

import { prisma } from "@/lib/prisma";

// =========================================
// 타입 정의
// =========================================

export interface AssetSnapshotData {
  totalAmount: number;
  stockAmount: number;
  propertyAmount: number;
  depositAmount: number;
}

export interface SnapshotWithDate {
  id: string;
  date: string; // ISO string formatted as YYYY-MM-DD
  totalAmount: number;
  stockAmount: number;
  propertyAmount: number;
  depositAmount: number;
}

export type HistoryPeriod = "7d" | "30d" | "90d" | "1y" | "all";

// =========================================
// 스냅샷 생성 함수
// =========================================

/**
 * 현재 유저의 모든 자산을 합산하여 스냅샷 생성
 * Cron Job 또는 수동 실행용
 */
export async function createAssetSnapshot(userId: string): Promise<AssetSnapshotData> {
  // 1. 모든 자산(Asset) 조회
  const assets = await prisma.asset.findMany({
    where: { userId },
  });

  // 2. 모든 부동산(Property) 조회
  const properties = await prisma.property.findMany({
    where: { userId },
  });

  // 3. 카테고리별 합산
  let stockAmount = 0;
  let depositAmount = 0;

  for (const asset of assets) {
    const value = asset.currentPrice > 0 ? asset.currentPrice : asset.amount;
    
    if (asset.type === "주식") {
      stockAmount += value;
    } else if (asset.type === "예적금") {
      depositAmount += value;
    }
  }

  // 4. 부동산 순자산 계산 (시세 - 대출 - 보증금)
  let propertyAmount = 0;
  for (const property of properties) {
    const equity = property.currentPrice - property.loanPrincipal - property.deposit;
    propertyAmount += equity;
  }

  // 5. 총 자산
  const totalAmount = stockAmount + propertyAmount + depositAmount;

  // 6. 스냅샷 저장
  await prisma.assetSnapshot.create({
    data: {
      userId,
      totalAmount,
      stockAmount,
      propertyAmount,
      depositAmount,
    },
  });

  return {
    totalAmount,
    stockAmount,
    propertyAmount,
    depositAmount,
  };
}

/**
 * 오늘 이미 스냅샷이 있는지 확인
 */
export async function hasSnapshotToday(userId: string): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existing = await prisma.assetSnapshot.findFirst({
    where: {
      userId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  return !!existing;
}

// =========================================
// 히스토리 조회 함수
// =========================================

/**
 * 기간별 스냅샷 조회
 */
export async function getSnapshotHistory(
  userId: string,
  period: HistoryPeriod = "30d"
): Promise<SnapshotWithDate[]> {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case "1y":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case "all":
    default:
      startDate = new Date(0); // Unix epoch
  }

  const snapshots = await prisma.assetSnapshot.findMany({
    where: {
      userId,
      createdAt: {
        gte: startDate,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return snapshots.map((snapshot) => ({
    id: snapshot.id,
    date: snapshot.createdAt.toISOString().split("T")[0],
    totalAmount: snapshot.totalAmount,
    stockAmount: snapshot.stockAmount,
    propertyAmount: snapshot.propertyAmount,
    depositAmount: snapshot.depositAmount,
  }));
}

/**
 * 최신 스냅샷 조회
 */
export async function getLatestSnapshot(userId: string): Promise<SnapshotWithDate | null> {
  const snapshot = await prisma.assetSnapshot.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (!snapshot) return null;

  return {
    id: snapshot.id,
    date: snapshot.createdAt.toISOString().split("T")[0],
    totalAmount: snapshot.totalAmount,
    stockAmount: snapshot.stockAmount,
    propertyAmount: snapshot.propertyAmount,
    depositAmount: snapshot.depositAmount,
  };
}

/**
 * 자산 변화율 계산
 */
export async function calculateAssetChange(
  userId: string,
  period: HistoryPeriod = "30d"
): Promise<{
  absoluteChange: number;
  percentChange: number;
  startAmount: number;
  endAmount: number;
} | null> {
  const snapshots = await getSnapshotHistory(userId, period);
  
  if (snapshots.length < 2) return null;

  const startAmount = snapshots[0].totalAmount;
  const endAmount = snapshots[snapshots.length - 1].totalAmount;
  const absoluteChange = endAmount - startAmount;
  const percentChange = startAmount > 0 
    ? ((endAmount - startAmount) / startAmount) * 100 
    : 0;

  return {
    absoluteChange,
    percentChange,
    startAmount,
    endAmount,
  };
}

/**
 * 모든 유저의 스냅샷 생성 (Cron Job용)
 */
export async function createAllUsersSnapshots(): Promise<number> {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  let count = 0;
  for (const user of users) {
    try {
      await createAssetSnapshot(user.id);
      count++;
    } catch (error) {
      console.error(`Failed to create snapshot for user ${user.id}:`, error);
    }
  }

  return count;
}
