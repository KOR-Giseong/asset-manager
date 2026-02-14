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
        <CardHeader className="pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 sm:h-10 sm:w-10">
              <CalendarDays className="h-4 w-4 text-purple-500 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base sm:text-lg">현금흐름 캘린더</CardTitle>
              <CardDescription className="hidden text-xs sm:block sm:text-sm">
                예정된 현금 유입을 확인하세요
              </CardDescription>
            </div>
          </div>

          {/* 월간 요약 */}
          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-3 lg:grid-cols-4">
            <div className="rounded-lg border border-border/50 bg-muted/30 p-2 sm:p-3">
              <p className="text-[10px] text-muted-foreground sm:text-xs">월세 수입</p>
              <p className="text-sm font-bold text-emerald-500 sm:text-lg">
                {formatKRW(summary.totalRent)}
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-2 sm:p-3">
              <p className="text-[10px] text-muted-foreground sm:text-xs">배당금</p>
              <p className="text-sm font-bold text-blue-500 sm:text-lg">
                {formatKRW(summary.totalDividend)}
              </p>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/30 p-2 sm:p-3">
              <p className="text-[10px] text-muted-foreground sm:text-xs">이자</p>
              <p className="text-sm font-bold text-amber-500 sm:text-lg">
                {formatKRW(summary.totalInterest)}
              </p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-2 sm:p-3">
              <p className="text-[10px] text-muted-foreground sm:text-xs">총 유입</p>
              <p className="text-sm font-bold text-primary sm:text-lg">
                {formatKRW(summary.totalCashFlow)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-3 sm:px-6">
          {/* 월 네비게이션 */}
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <Button variant="ghost" size="icon" onClick={goToPreviousMonth} className="h-8 w-8 sm:h-10 sm:w-10">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <h3 className="text-base font-semibold sm:text-lg">
              {currentYear}년 {currentMonth}월
            </h3>
            <Button variant="ghost" size="icon" onClick={goToNextMonth} className="h-8 w-8 sm:h-10 sm:w-10">
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* 요일 헤더 */}
          <div className="mb-1 grid grid-cols-7 gap-0.5 sm:mb-2 sm:gap-1">
            {WEEKDAYS.map((day, index) => (
              <div
                key={day}
                className={`py-1 text-center text-[10px] font-medium sm:py-2 sm:text-xs ${
                  index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-muted-foreground"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 달력 그리드 */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
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
                    relative aspect-square rounded-md p-0.5 text-xs transition-all sm:rounded-lg sm:p-1 sm:text-sm
                    ${hasEvents ? "cursor-pointer border hover:border-primary hover:bg-accent" : "cursor-default border-transparent"}
                    ${isToday ? "border border-primary bg-primary/5" : ""}
                  `}
                >
                  <span
                    className={`
                      absolute left-0.5 top-0.5 text-[10px] font-medium sm:left-1 sm:top-1 sm:text-xs
                      ${index % 7 === 0 ? "text-red-500" : index % 7 === 6 ? "text-blue-500" : "text-foreground"}
                    `}
                  >
                    {day}
                  </span>

                  {hasEvents && (
                    <div className="absolute bottom-0.5 left-0.5 right-0.5 flex flex-col gap-0.5 sm:bottom-1 sm:left-1 sm:right-1">
                      {events.slice(0, 1).map((event) => {
                        const colors = TYPE_COLORS[event.type];
                        return (
                          <div
                            key={event.id}
                            className={`truncate rounded px-0.5 py-0.5 text-[8px] font-medium sm:px-1 sm:text-[10px] ${colors.bg} ${colors.text}`}
                          >
                            <span className="hidden sm:inline">{formatKRW(event.amount).replace("원", "")}</span>
                            <span className="sm:hidden">{(event.amount / 10000).toFixed(0)}</span>
                          </div>
                        );
                      })}
                      {events.length > 1 && (
                        <span className="text-[8px] text-muted-foreground sm:text-[10px]">
                          +{events.length - 1}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* 범례 */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-border/50 pt-3 sm:mt-4 sm:gap-4 sm:pt-4">
            {Object.entries(TYPE_COLORS).map(([type, colors]) => {
              const Icon = TYPE_ICONS[type];
              const label = type === "rent" ? "월세" : type === "dividend" ? "배당금" : "이자";
              return (
                <div key={type} className="flex items-center gap-1">
                  <div className={`rounded p-0.5 sm:p-1 ${colors.bg}`}>
                    <Icon className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${colors.text}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground sm:text-xs">{label}</span>
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
