import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMonthlyCashFlow } from "@/services/cashFlowService";
import { sendPushNotification } from "@/lib/server-push";
import type { Property } from "@/types/property";

// KST 오늘 날짜를 YYYY-MM-DD 포맷으로 반환
function getKSTDateString(offsetDays = 0): string {
  const now = new Date();
  // UTC+9 보정
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000 + offsetDays * 24 * 60 * 60 * 1000);
  return kst.toISOString().split("T")[0];
}

function formatAmount(amount: number): string {
  if (amount >= 100_000_000) return `${(amount / 100_000_000).toFixed(1)}억원`;
  if (amount >= 10_000) return `${Math.round(amount / 10_000)}만원`;
  return `${amount.toLocaleString()}원`;
}

const TYPE_LABEL: Record<string, string> = {
  rent: "월세",
  dividend: "배당금",
  interest: "이자",
};

export async function GET(req: NextRequest) {
  // Vercel Cron 또는 직접 호출 시 시크릿 검증
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStr = getKSTDateString(0);
  const in7DaysStr = getKSTDateString(7);

  const today = new Date(todayStr);
  const in7Days = new Date(in7DaysStr);

  // 알림 허용 + 구독 정보 있는 사용자 조회
  const users = await prisma.user.findMany({
    where: {
      allowNotifications: true,
      pushSubscriptions: { some: {} },
    },
    include: {
      pushSubscriptions: true,
      properties: true,
    },
  });

  let totalSent = 0;
  const expiredEndpoints: string[] = [];

  for (const user of users) {
    const properties = user.properties.map((p) => ({
      ...p,
      propertyType: p.propertyType as Property["propertyType"],
      contractType: p.contractType as Property["contractType"],
    }));

    // 이번 달과 다음 달 이벤트 모두 수집 (월 경계 7일 커버)
    const [currentSummary, nextSummary] = await Promise.all([
      getMonthlyCashFlow(user.id, today.getFullYear(), today.getMonth() + 1, properties),
      getMonthlyCashFlow(
        user.id,
        in7Days.getFullYear(),
        in7Days.getMonth() + 1,
        properties
      ),
    ]);

    const allEvents = [
      ...currentSummary.events,
      // 다음 달 이벤트 중복 제거 (같은 달이면 이미 포함)
      ...(in7Days.getMonth() !== today.getMonth() ? nextSummary.events : []),
    ];

    // 오늘 이벤트
    const todayEvents = allEvents.filter((e) => {
      const d = e.date instanceof Date ? e.date : new Date(e.date);
      return d.toISOString().split("T")[0] === todayStr;
    });

    // 7일 후 이벤트
    const upcomingEvents = allEvents.filter((e) => {
      const d = e.date instanceof Date ? e.date : new Date(e.date);
      return d.toISOString().split("T")[0] === in7DaysStr;
    });

    // 알림 전송
    for (const sub of user.pushSubscriptions) {
      // 오늘 이벤트 알림
      for (const event of todayEvents) {
        const ok = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          {
            title: `📅 오늘 ${TYPE_LABEL[event.type] ?? "수입"} 예정`,
            body: `${event.source} ${TYPE_LABEL[event.type]} ${formatAmount(event.amount)} 입금 예정`,
            url: "/cashflow",
            tag: `today-${event.id}`,
          }
        );
        if (ok) totalSent++;
        else expiredEndpoints.push(sub.endpoint);
      }

      // 7일 후 이벤트 알림
      for (const event of upcomingEvents) {
        const ok = await sendPushNotification(
          { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
          {
            title: `🔔 7일 후 ${TYPE_LABEL[event.type] ?? "수입"} 예정`,
            body: `${event.source} ${TYPE_LABEL[event.type]} ${formatAmount(event.amount)} — ${in7DaysStr.slice(5).replace("-", "/")} 예정`,
            url: "/cashflow",
            tag: `week-${event.id}`,
          }
        );
        if (ok) totalSent++;
        else expiredEndpoints.push(sub.endpoint);
      }
    }
  }

  // 만료된 구독 정리
  if (expiredEndpoints.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: expiredEndpoints } },
    });
  }

  return NextResponse.json({
    ok: true,
    date: todayStr,
    usersChecked: users.length,
    notificationsSent: totalSent,
    expiredCleaned: expiredEndpoints.length,
  });
}
