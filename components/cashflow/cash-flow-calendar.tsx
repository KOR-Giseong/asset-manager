"use client";

// =========================================
// 현금흐름 캘린더 컴포넌트
// =========================================

import { useState, useMemo } from "react";
import {
  CalendarDays,
  Building2,
  TrendingUp,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKRW } from "@/lib/format";
import { CashFlowDetailModal } from "./cash-flow-detail-modal";
import type { CashFlowEvent, MonthlyCashFlowSummary } from "@/services/cashFlowService";

// =========================================
// 타입 정의
// =========================================

interface CashFlowCalendarProps {
  summary: MonthlyCashFlowSummary;
  onMonthChange: (year: number, month: number) => void;
  currentYear: number;
  currentMonth: number;
}

// =========================================
// 요일 헤더
// =========================================

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// =========================================
// 캘린더 타입별 색상
// =========================================

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  rent: { bg: "bg-emerald-500/20", text: "text-emerald-600", border: "border-emerald-500/30" },
  dividend: { bg: "bg-blue-500/20", text: "text-blue-600", border: "border-blue-500/30" },
  interest: { bg: "bg-amber-500/20", text: "text-amber-600", border: "border-amber-500/30" },
};

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  rent: Building2,
  dividend: TrendingUp,
  interest: PiggyBank,
};

// =========================================
// 메인 컴포넌트
// =========================================

export function CashFlowCalendar({
  summary,
  onMonthChange,
  currentYear,
  currentMonth,
}: CashFlowCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 달력 데이터 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: (number | null)[] = [];

    // 이전 달 빈칸
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // 현재 달 날짜
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [currentYear, currentMonth]);

  // 날짜별 이벤트 가져오기
  function getEventsForDay(day: number): CashFlowEvent[] {
    const dateKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dailyFlow = summary.dailyMap.get(dateKey);
    return dailyFlow?.events || [];
  }

  // 날짜 클릭 핸들러
  function handleDayClick(day: number) {
    const events = getEventsForDay(day);
    if (events.length > 0) {
      setSelectedDate(new Date(currentYear, currentMonth - 1, day));
      setModalOpen(true);
    }
  }

  // 이전/다음 달 이동
  function goToPreviousMonth() {
    if (currentMonth === 1) {
      onMonthChange(currentYear - 1, 12);
    } else {
      onMonthChange(currentYear, currentMonth - 1);
    }
  }

  function goToNextMonth() {
    if (currentMonth === 12) {
      onMonthChange(currentYear + 1, 1);
    } else {
      onMonthChange(currentYear, currentMonth + 1);
    }
  }

  // 선택된 날짜의 이벤트
  const selectedEvents = selectedDate
    ? getEventsForDay(selectedDate.getDate())
    : [];

  return (
    <>
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <CalendarDays className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg">현금흐름 캘린더</CardTitle>
                <CardDescription>
                  예정된 현금 유입을 확인하세요
                </CardDescription>
              </div>
            </div>
          </div>

          {/* 월간 요약 */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">월세 수입</p>
              <p className="text-lg font-bold text-emerald-500">
                {formatKRW(summary.totalRent)}
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">배당금</p>
              <p className="text-lg font-bold text-blue-500">
                {formatKRW(summary.totalDividend)}
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">이자</p>
              <p className="text-lg font-bold text-amber-500">
                {formatKRW(summary.totalInterest)}
              </p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="text-xs text-muted-foreground">총 유입</p>
              <p className="text-lg font-bold text-primary">
                {formatKRW(summary.totalCashFlow)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 월 네비게이션 */}
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="text-lg font-semibold">
              {currentYear}년 {currentMonth}월
            </h3>
            <Button variant="ghost" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* 요일 헤더 */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day, index) => (
              <div
                key={day}
                className={`py-2 text-center text-xs font-medium ${
                  index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-muted-foreground"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const events = getEventsForDay(day);
              const hasEvents = events.length > 0;
              const isToday =
                new Date().getDate() === day &&
                new Date().getMonth() + 1 === currentMonth &&
                new Date().getFullYear() === currentYear;

              return (
                <button
                  key={`day-${day}`}
                  onClick={() => handleDayClick(day)}
                  disabled={!hasEvents}
                  className={`
                    relative aspect-square rounded-lg border p-1 text-sm transition-all
                    ${hasEvents ? "cursor-pointer hover:border-primary hover:bg-accent" : "cursor-default"}
                    ${isToday ? "border-primary bg-primary/5" : "border-transparent"}
                  `}
                >
                  <span
                    className={`
                      absolute left-1 top-1 text-xs font-medium
                      ${index % 7 === 0 ? "text-red-500" : index % 7 === 6 ? "text-blue-500" : "text-foreground"}
                    `}
                  >
                    {day}
                  </span>

                  {hasEvents && (
                    <div className="absolute bottom-1 left-1 right-1 flex flex-col gap-0.5">
                      {events.slice(0, 2).map((event) => {
                        const colors = TYPE_COLORS[event.type];
                        return (
                          <div
                            key={event.id}
                            className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${colors.bg} ${colors.text}`}
                          >
                            {formatKRW(event.amount).replace("원", "")}
                          </div>
                        );
                      })}
                      {events.length > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{events.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 범례 */}
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/50 pt-4">
            {Object.entries(TYPE_COLORS).map(([type, colors]) => {
              const Icon = TYPE_ICONS[type];
              const label = type === "rent" ? "월세" : type === "dividend" ? "배당금" : "이자";
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`rounded p-1 ${colors.bg}`}>
                    <Icon className={`h-3 w-3 ${colors.text}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 상세 모달 */}
      <CashFlowDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        date={selectedDate}
        events={selectedEvents}
      />
    </>
  );
}
