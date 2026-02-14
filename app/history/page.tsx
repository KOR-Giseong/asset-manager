"use client";

// =========================================
// 자산 히스토리 페이지
// =========================================

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SidebarLayout } from "@/components/layout";
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
      <div className="container max-w-5xl py-6">
        <header className="mb-6 pl-12 md:pl-0">
          <h1 className="text-xl font-bold sm:text-2xl">자산 히스토리</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            날짜별 자산 변동 추이를 확인하세요.
          </p>
        </header>

        <AssetTrendChart />
      </div>
    </SidebarLayout>
  );
}
