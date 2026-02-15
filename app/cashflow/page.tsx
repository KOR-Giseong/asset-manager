"use client";

// =========================================
// 현금흐름 캘린더 페이지
// =========================================

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2, Calendar } from "lucide-react";
import { SidebarLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
import { CashFlowCalendar } from "@/components/cashflow";
import { fetchMonthlyCashFlow } from "@/app/actions/cashflow-actions";
import type { MonthlyCashFlowSummary } from "@/services/cashFlowService";

// =========================================
// 메인 페이지 컴포넌트
// =========================================

export default function CashFlowPage() {
  const { data: session, status } = useSession();
  const [summary, setSummary] = useState<MonthlyCashFlowSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);

  // 인증 확인
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  // 데이터 로드
  useEffect(() => {
    async function loadCashFlow() {
      setLoading(true);
      const result = await fetchMonthlyCashFlow(currentYear, currentMonth);
      if (result.success && result.data) {
        setSummary(result.data);
      }
      setLoading(false);
    }

    if (session?.user) {
      loadCashFlow();
    }
  }, [session, currentYear, currentMonth]);

  // 월 변경 핸들러
  function handleMonthChange(year: number, month: number) {
    setCurrentYear(year);
    setCurrentMonth(month);
  }

  // 로딩 상태
  if (status === "loading" || loading) {
    return (
      <SidebarLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  // 인증되지 않은 경우
  if (!session) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen">
        <PageHeader
          title="현금흐름 캘린더"
          subtitle={<>월세, 배당금, 이자 등 예정된 현금 유입을<br />캘린더에서 확인하세요.</>}
          icon={Calendar}
          iconColor="bg-blue-500/10"
          iconTextColor="text-blue-500"
        />

        <div className="container max-w-5xl px-4 py-6">
          {summary && (
            <CashFlowCalendar
              summary={summary}
              onMonthChange={handleMonthChange}
              currentYear={currentYear}
              currentMonth={currentMonth}
            />
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}
