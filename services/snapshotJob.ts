// =========================================
// 스냅샷 배치 작업 (Cron Job)
// =========================================
// Vercel Cron 또는 외부 스케줄러에서 호출
// =========================================

import { prisma } from "@/lib/prisma";
import { createAssetSnapshot, hasSnapshotToday } from "@/services/historyService";
import type { SnapshotJobResult } from "@/types/history";

/**
 * 일일 스냅샷 배치 작업
 * 모든 유저에 대해 오늘 스냅샷이 없으면 생성
 *
 * @returns 실행 결과 요약 (성공/스킵/실패 카운트)
 *
 * @example
 * // Vercel Cron API Route에서 사용
 * export async function GET() {
 *   const result = await runDailySnapshotJob();
 *   return Response.json(result);
 * }
 */
export async function runDailySnapshotJob(): Promise<SnapshotJobResult> {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  const result: SnapshotJobResult = {
    total: users.length,
    success: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  for (const user of users) {
    try {
      const alreadyExists = await hasSnapshotToday(user.id);

      if (alreadyExists) {
        result.skipped++;
        continue;
      }

      await createAssetSnapshot(user.id);
      result.success++;
    } catch (error) {
      result.failed++;
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(`user ${user.id}: ${message}`);
    }
  }

  return result;
}
