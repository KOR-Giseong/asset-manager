"use client";

// =========================================
// 현금흐름 상세 모달
// =========================================

import {
  Building2,
  TrendingUp,
  PiggyBank,
  Calendar,
  Banknote,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatKRW } from "@/lib/format";
import type { CashFlowEvent } from "@/services/cashFlowService";

// =========================================
// 타입 정의
// =========================================

interface CashFlowDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  events: CashFlowEvent[];
}

// =========================================
// 타입별 설정
// =========================================

const TYPE_CONFIG = {
  rent: {
    label: "월세",
    icon: Building2,
    badgeClass: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
    iconClass: "text-emerald-500",
  },
  dividend: {
    label: "배당금",
    icon: TrendingUp,
    badgeClass: "bg-blue-500/20 text-blue-600 border-blue-500/30",
    iconClass: "text-blue-500",
  },
  interest: {
    label: "이자",
    icon: PiggyBank,
    badgeClass: "bg-amber-500/20 text-amber-600 border-amber-500/30",
    iconClass: "text-amber-500",
  },
} as const;

// =========================================
// 상세 모달 컴포넌트
// =========================================

export function CashFlowDetailModal({
  open,
  onOpenChange,
  date,
  events,
}: CashFlowDetailModalProps) {
  if (!date) return null;

  const totalAmount = events.reduce((sum, event) => sum + event.amount, 0);

  // 날짜 포맷팅
  const formattedDate = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <DialogTitle>현금흐름 상세</DialogTitle>
          </div>
          <DialogDescription>{formattedDate}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* 이벤트 목록 */}
          <div className="space-y-3">
            {events.map((event) => {
              const config = TYPE_CONFIG[event.type];
              const Icon = config.icon;

              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                >
                  <div className={`rounded-lg bg-background p-2 shadow-sm`}>
                    <Icon className={`h-5 w-5 ${config.iconClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{event.source}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${config.badgeClass}`}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-green-500">
                      +{formatKRW(event.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 합계 */}
          {events.length > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                <span className="font-medium">총 유입</span>
              </div>
              <span className="text-xl font-bold text-primary">
                +{formatKRW(totalAmount)}
              </span>
            </div>
          )}

          {/* 빈 상태 */}
          {events.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              이 날에는 예정된 현금흐름이 없습니다.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
