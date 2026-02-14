"use client";

// =========================================
// 부동산 요약 카드
// =========================================
// 대시보드에서 부동산 포트폴리오 요약만 보여주고,
// 상세 관리는 /property 페이지로 유도합니다.
// =========================================

import Link from "next/link";
import { Building2, ArrowRight, TrendingUp, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatKRW } from "@/lib/format";
import type { PortfolioSummary } from "@/types/property";

// =========================================
// 타입 정의
// =========================================

interface PropertySummaryCardProps {
  summary: PortfolioSummary;
  propertyCount: number;
}

// =========================================
// 요약 항목 컴포넌트
// =========================================

interface SummaryItemProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

function SummaryItem({ label, value, icon: Icon, colorClass }: SummaryItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`rounded-lg p-2 ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{formatKRW(value)}</p>
      </div>
    </div>
  );
}

// =========================================
// 메인 컴포넌트
// =========================================

export function PropertySummaryCard({
  summary,
  propertyCount,
}: PropertySummaryCardProps) {
  // 부동산이 없는 경우
  if (propertyCount === 0) {
    return (
      <Card className="border-border/60 border-dashed shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="mb-4 rounded-full bg-emerald-500/10 p-4">
            <Building2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">부동산 관리</h3>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            부동산 자산을 등록하고 관리해보세요
          </p>
          <Button asChild variant="outline">
            <Link href="/property">
              부동산 등록하기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Building2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg">부동산 포트폴리오</CardTitle>
              <CardDescription>
                {propertyCount}개 부동산 보유 중
              </CardDescription>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/property">
              상세 관리
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryItem
            label="총 시세"
            value={summary.totalCurrentValue}
            icon={Building2}
            colorClass="bg-emerald-500/10 text-emerald-500"
          />
          <SummaryItem
            label="순자산 (Equity)"
            value={summary.totalEquity}
            icon={Wallet}
            colorClass="bg-blue-500/10 text-blue-500"
          />
          <SummaryItem
            label="월 현금흐름"
            value={summary.totalMonthlyCashFlow}
            icon={TrendingUp}
            colorClass="bg-amber-500/10 text-amber-500"
          />
        </div>
      </CardContent>
    </Card>
  );
}
