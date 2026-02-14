"use server";

// =========================================
// 자산 히스토리 Server Actions
// =========================================

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import * as userRepo from "@/repositories/user-repository";
import {
  createAssetSnapshot,
  getSnapshotHistory,
  getLatestSnapshot,
  calculateAssetChange,
  hasSnapshotToday,
  getChartData as getChartDataService,
} from "@/services/historyService";
import type {
  AssetSnapshotData,
  SnapshotWithDate,
  HistoryPeriod,
  AssetChange,
  ChartResponse,
} from "@/types/history";

// =========================================
// 타입 정의
// =========================================

interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// =========================================
// 유틸리티
// =========================================

async function getCurrentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;

    const existingUser = await userRepo.findUserById(session.user.id);
    if (!existingUser) {
      await userRepo.createUser({
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      });
    }

    return session.user.id;
  } catch (err) {
    console.error("[Session] auth() 호출 실패:", err);
    return null;
  }
}

// =========================================
// 스냅샷 생성 Actions
// =========================================

/**
 * 수동으로 스냅샷 생성
 */
export async function createManualSnapshot(): Promise<ActionResult<AssetSnapshotData>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const alreadyExists = await hasSnapshotToday(userId);
    if (alreadyExists) {
      return { success: false, error: "오늘 이미 스냅샷이 기록되어 있습니다." };
    }

    const snapshot = await createAssetSnapshot(userId);
    revalidatePath("/");

    return { success: true, data: snapshot };
  } catch (error) {
    console.error("[createManualSnapshot] Error:", error);
    return { success: false, error: "스냅샷 생성에 실패했습니다." };
  }
}

/**
 * 강제로 스냅샷 생성 (중복 허용)
 */
export async function forceCreateSnapshot(): Promise<ActionResult<AssetSnapshotData>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const snapshot = await createAssetSnapshot(userId);
    revalidatePath("/");

    return { success: true, data: snapshot };
  } catch (error) {
    console.error("[forceCreateSnapshot] Error:", error);
    return { success: false, error: "스냅샷 생성에 실패했습니다." };
  }
}

// =========================================
// 히스토리 조회 Actions
// =========================================

/**
 * 기간별 스냅샷 히스토리 조회
 */
export async function getHistory(
  period: HistoryPeriod = "30d"
): Promise<ActionResult<SnapshotWithDate[]>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const history = await getSnapshotHistory(userId, period);
    return { success: true, data: history };
  } catch (error) {
    console.error("[getHistory] Error:", error);
    return { success: false, error: "히스토리 조회에 실패했습니다." };
  }
}

/**
 * 최신 스냅샷 조회
 */
export async function getLatest(): Promise<ActionResult<SnapshotWithDate | null>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const latest = await getLatestSnapshot(userId);
    return { success: true, data: latest };
  } catch (error) {
    console.error("[getLatest] Error:", error);
    return { success: false, error: "최신 스냅샷 조회에 실패했습니다." };
  }
}

/**
 * 자산 변화율 조회
 */
export async function getAssetChangeRate(
  period: HistoryPeriod = "30d"
): Promise<ActionResult<AssetChange | null>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const change = await calculateAssetChange(userId, period);
    return { success: true, data: change };
  } catch (error) {
    console.error("[getAssetChangeRate] Error:", error);
    return { success: false, error: "변화율 계산에 실패했습니다." };
  }
}

/**
 * 차트 데이터 + 변화율 통합 조회
 * 서버에서 가공 완료된 데이터를 한 번에 반환
 */
export async function getChartDataAction(
  period: HistoryPeriod = "30d"
): Promise<ActionResult<ChartResponse>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const result = await getChartDataService(userId, period);
    return { success: true, data: result };
  } catch (error) {
    console.error("[getChartDataAction] Error:", error);
    return { success: false, error: "차트 데이터 조회에 실패했습니다." };
  }
}

/**
 * 오늘 스냅샷 존재 여부 확인
 */
export async function checkTodaySnapshot(): Promise<ActionResult<boolean>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const exists = await hasSnapshotToday(userId);
    return { success: true, data: exists };
  } catch (error) {
    console.error("[checkTodaySnapshot] Error:", error);
    return { success: false, error: "확인에 실패했습니다." };
  }
}
