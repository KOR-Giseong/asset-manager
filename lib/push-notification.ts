/**
 * 클라이언트에서 푸시 알림을 트리거하는 함수
 * 실제 서비스에서는 서버에서 push API를 통해 전송해야 함
 * 테스트용으로 Notification API 사용
 */
export function triggerPushNotification({
  title = "알림",
  body = "메시지 내용",
  icon = "/icon.png",
  badge = "/badge.png"
}: {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
}) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  navigator.serviceWorker.getRegistration().then((reg) => {
    if (reg) {
      reg.showNotification(title, {
        body,
        icon,
        badge
      });
    }
  });
}
