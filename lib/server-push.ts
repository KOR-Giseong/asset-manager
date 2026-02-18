import webpush from "web-push";

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export interface PushSubscriptionKeys {
  endpoint: string;
  p256dh: string;
  auth: string;
}

function initVapid() {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export async function sendPushNotification(
  subscription: PushSubscriptionKeys,
  payload: PushPayload
): Promise<boolean> {
  initVapid();
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: unknown) {
    // 410 Gone: 구독 만료됨 (정상적으로 처리)
    if (err instanceof Error && "statusCode" in err && (err as { statusCode: number }).statusCode === 410) {
      return false; // 호출부에서 DB 정리
    }
    console.error("[push] 전송 실패:", err);
    return false;
  }
}

export async function sendPushToMany(
  subscriptions: PushSubscriptionKeys[],
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;
  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const ok = await sendPushNotification(sub, payload);
      if (ok) sent++;
      else failed++;
    })
  );
  return { sent, failed };
}
