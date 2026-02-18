"use client";

// =========================================
// 자산 히스토리 페이지
// =========================================

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { AssetTrendChart } from "@/components/asset-trend-chart";

// =========================================
// 메인 페이지 컴포넌트
// =========================================

export default function HistoryPage() {
  const { data: session, status } = useSession();

  // 인증 확인
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  // 로딩 상태
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="자산 히스토리"
        subtitle="날짜별 자산 변동 추이를 확인하세요."
        icon={TrendingUp}
        iconColor="bg-green-500/10"
        iconTextColor="text-green-500"
      />

      <div className="container max-w-5xl px-4 py-6">
        <AssetTrendChart />
      </div>
    </div>
  );
}
