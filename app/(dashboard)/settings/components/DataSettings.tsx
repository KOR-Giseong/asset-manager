"use client";
import { FC } from "react";
import { usePush } from "@/components/push-context";
import { triggerPushNotification } from "@/lib/push-notification";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Download, RotateCcw, Send } from "lucide-react";

interface DataSettingsProps {
  allowNotifications: boolean;
  onChange: (data: { allowNotifications?: boolean }) => void;
  onExport: () => void;
  onReset: () => void;
}

export const DataSettings: FC<DataSettingsProps> = (props) => (
  <DataSettingsInner {...props} />
);

const DataSettingsInner: FC<DataSettingsProps> = ({ allowNotifications, onChange, onExport, onReset }) => {
  const { permission, subscribe } = usePush();

  return (
    <div className="space-y-8 max-w-lg">
      {/* 알림 섹션 */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">알림</h3>
        <p className="text-xs text-muted-foreground mb-4">푸시 알림 수신 방식을 설정합니다.</p>
        <div className="space-y-2">
          <div className="rounded-lg border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-muted">
                <Bell size={15} className="text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">푸시 알림 받기</p>
                <p className="text-xs text-muted-foreground">
                  권한 상태: <span className="font-medium">{permission}</span>
                </p>
              </div>
            </div>
            <Switch
              checked={allowNotifications}
              onCheckedChange={(v: boolean) => onChange({ allowNotifications: v })}
            />
          </div>

          {permission !== "granted" && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellOff size={15} className="text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-700 dark:text-amber-300">브라우저 알림 권한이 필요합니다.</p>
              </div>
              <Button size="sm" variant="outline" onClick={subscribe} className="text-xs h-7 border-amber-300">
                권한 요청
              </Button>
            </div>
          )}

          {permission === "granted" && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs text-muted-foreground"
                onClick={() =>
                  triggerPushNotification({
                    title: "테스트 알림",
                    body: "푸시 알림이 정상 동작합니다.",
                  })
                }
              >
                <Send size={12} />
                알림 테스트
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 데이터 섹션 */}
      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">데이터</h3>
        <p className="text-xs text-muted-foreground mb-4">데이터를 내보내거나 초기화할 수 있습니다.</p>
        <div className="space-y-2">
          <div className="rounded-lg border px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">CSV 내보내기</p>
              <p className="text-xs text-muted-foreground">자산 및 거래 내역을 CSV 파일로 저장합니다.</p>
            </div>
            <Button variant="outline" size="sm" onClick={onExport} className="gap-1.5">
              <Download size={14} />
              내보내기
            </Button>
          </div>
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">전체 초기화</p>
              <p className="text-xs text-muted-foreground">모든 자산/이력 데이터가 삭제됩니다.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={onReset} className="gap-1.5">
              <RotateCcw size={14} />
              초기화
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
