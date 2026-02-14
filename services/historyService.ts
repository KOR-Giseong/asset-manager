// =========================================
// 자산 히스토리 서비스
// =========================================
// 스냅샷 기록, 조회, 차트 데이터 가공
// =========================================

import { prisma } from "@/lib/prisma";
import { calculateEquity } from "@/services/propertyService";
import type { Property } from "@/types/property";
import type {
  AssetSnapshotData,
  SnapshotWithDate,
  HistoryPeriod,
  ChartDataPoint,
  AssetChange,
  ChartResponse,
} from "@/types/history";

// 타입 재export (기존 import 경로 호환)
export type { AssetSnapshotData, SnapshotWithDate, HistoryPeriod };

// =========================================
// 기간 → 시작 날짜 변환
// =========================================

function getStartDate(period: HistoryPeriod): Date {
  const now = new Date();

  const daysMap: Record<HistoryPeriod, number | null> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
    "all": null,
  };

  const days = daysMap[period];
  if (days === null) return new Date(0);

  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

// =========================================
// 스냅샷 생성
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

  // 4. 부동산 순자산 계산 — propertyService.calculateEquity() 재사용
  //    계약 유형(임대인/임차인)에 따라 보증금 처리가 달라짐
  let propertyAmount = 0;
  for (const property of properties) {
    const { equity } = calculateEquity(property as unknown as Property);
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

  return { totalAmount, stockAmount, propertyAmount, depositAmount };
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
      createdAt: { gte: today, lt: tomorrow },
    },
  });

  return !!existing;
}

// =========================================
// 히스토리 조회
// =========================================

/**
 * 기간별 스냅샷 조회
 */
export async function getSnapshotHistory(
  userId: string,
  period: HistoryPeriod = "30d"
): Promise<SnapshotWithDate[]> {
  const startDate = getStartDate(period);

  const snapshots = await prisma.assetSnapshot.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: "asc" },
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

// =========================================
// 자산 변화율 계산
// =========================================

/**
 * 스냅샷 배열에서 자산 변화율 계산
 */
function calculateChangeFromSnapshots(
  snapshots: SnapshotWithDate[],
  period: HistoryPeriod
): AssetChange | null {
  if (snapshots.length < 2) return null;

  const startAmount = snapshots[0].totalAmount;
  const endAmount = snapshots[snapshots.length - 1].totalAmount;
  const absoluteChange = endAmount - startAmount;
  const percentChange = startAmount > 0
    ? ((endAmount - startAmount) / startAmount) * 100
    : 0;

  return { absoluteChange, percentChange, startAmount, endAmount, period };
}

/**
 * 자산 변화율 계산 (DB 조회 포함)
 */
export async function calculateAssetChange(
  userId: string,
  period: HistoryPeriod = "30d"
): Promise<AssetChange | null> {
  const snapshots = await getSnapshotHistory(userId, period);
  return calculateChangeFromSnapshots(snapshots, period);
}

// =========================================
// 차트 데이터 가공
// =========================================

/**
 * 날짜 문자열 → 차트 표시용 (MM/DD)
 */
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 빠진 날짜를 직전 값으로 채우기
 * 7d, 30d 기간에서만 적용 (90d 이상은 데이터가 많아 불필요)
 */
function fillMissingDates(points: ChartDataPoint[]): ChartDataPoint[] {
  if (points.length < 2) return points;

  const filled: ChartDataPoint[] = [];
  const oneDay = 24 * 60 * 60 * 1000;

  for (let i = 0; i < points.length; i++) {
    filled.push(points[i]);

    if (i < points.length - 1) {
      const currentDate = new Date(points[i].date).getTime();
      const nextDate = new Date(points[i + 1].date).getTime();
      const gapDays = Math.round((nextDate - currentDate) / oneDay);

      // 1일 초과 차이가 있으면 빈 날짜 채우기
      for (let d = 1; d < gapDays; d++) {
        const filledDate = new Date(currentDate + d * oneDay);
        const dateStr = filledDate.toISOString().split("T")[0];
        filled.push({
          ...points[i],
          date: dateStr,
          displayDate: formatDisplayDate(dateStr),
        });
      }
    }
  }

  return filled;
}

/**
 * 차트 렌더링에 최적화된 데이터 반환
 * 서버에서 가공 완료 → 클라이언트는 그대로 렌더링
 */
export async function getChartData(
  userId: string,
  period: HistoryPeriod = "30d"
): Promise<ChartResponse> {
  const snapshots = await getSnapshotHistory(userId, period);

  // 스냅샷 → 차트 데이터 포인트 변환
  const chartData: ChartDataPoint[] = snapshots.map((s) => ({
    date: s.date,
    displayDate: formatDisplayDate(s.date),
    total: s.totalAmount,
    stock: s.stockAmount,
    property: s.propertyAmount,
    deposit: s.depositAmount,
  }));

  // 7d, 30d에서만 빈 날짜 채우기
  const shouldFill = period === "7d" || period === "30d";
  const finalData = shouldFill ? fillMissingDates(chartData) : chartData;

  // 변화율 계산
  const change = calculateChangeFromSnapshots(snapshots, period);

  return { chartData: finalData, change };
}
