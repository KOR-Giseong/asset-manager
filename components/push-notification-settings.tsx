import { usePush } from "@/components/push-context";
import { triggerPushNotification } from "@/lib/push-notification";

export const PushNotificationSettings = () => {
  const { permission, subscribe } = usePush();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span>푸시 알림 권한: </span>
        <span className="font-semibold">{permission}</span>
        {permission !== "granted" && (
          <button
            className="px-3 py-1 rounded bg-blue-500 text-white"
            onClick={subscribe}
          >
            알림 허용 요청
          </button>
        )}
      </div>
      <button
        className="px-3 py-1 rounded bg-green-500 text-white"
        onClick={() =>
          triggerPushNotification({
            title: "테스트 알림",
            body: "푸시 알림이 정상 동작합니다.",
          })
        }
        disabled={permission !== "granted"}
      >
        알림 테스트
      </button>
    </div>
  );
};
