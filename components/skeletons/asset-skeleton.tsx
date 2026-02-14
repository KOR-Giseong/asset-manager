"use client";

// =========================================
// 자산 테이블 스켈레톤 (로딩 상태)
// =========================================

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton, SkeletonTableRow } from "@/components/ui/skeleton";

interface AssetTableSkeletonProps {
  /** 표시할 행 수 */
  rows?: number;
}

export function AssetTableSkeleton({ rows = 5 }: AssetTableSkeletonProps) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        {/* 테이블 헤더 */}
        <div className="flex items-center gap-4 border-b border-border pb-3 mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        {/* 테이블 본문 */}
        <div className="space-y-1">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={6} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// =========================================
// 자산 카테고리 카드 스켈레톤
// =========================================

export function AssetCategorySkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-1.5 flex-1 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// =========================================
// 대시보드 헤더 스켈레톤
// =========================================

export function DashboardHeaderSkeleton() {
  return (
    <div className="mb-6 grid gap-6 lg:grid-cols-2">
      {/* 총 자산 카드 */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-16" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>

      {/* 차트 카드 */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Skeleton circle className="h-[200px] w-[200px]" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton circle className="h-3 w-3" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =========================================
// 전체 대시보드 스켈레톤
// =========================================

export function DashboardSkeleton({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton circle className="h-9 w-9" />
          </div>
        </div>

        <DashboardHeaderSkeleton />
        <div className="mb-6">
          <AssetCategorySkeleton />
        </div>
        <AssetTableSkeleton rows={5} />
        {children}
      </div>
    </div>
  );
}
