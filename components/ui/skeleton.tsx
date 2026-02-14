import { cn } from "@/lib/utils";

// =========================================
// 범용 Skeleton 컴포넌트
// =========================================

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 원형 스켈레톤 여부 */
  circle?: boolean;
}

/**
 * 로딩 상태를 표시하는 범용 스켈레톤 컴포넌트
 * @example
 * // 기본 사용
 * <Skeleton className="h-4 w-[200px]" />
 * 
 * // 원형 아바타
 * <Skeleton circle className="h-10 w-10" />
 */
export function Skeleton({ className, circle, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        circle ? "rounded-full" : "rounded-md",
        className
      )}
      {...props}
    />
  );
}

// =========================================
// 프리셋 스켈레톤 컴포넌트들
// =========================================

/** 텍스트 라인 스켈레톤 */
export function SkeletonText({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-4 w-full", className)} {...props} />;
}

/** 제목 스켈레톤 */
export function SkeletonTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-6 w-3/4", className)} {...props} />;
}

/** 아바타 스켈레톤 */
export function SkeletonAvatar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton circle className={cn("h-10 w-10", className)} {...props} />;
}

/** 버튼 스켈레톤 */
export function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-9 w-24 rounded-md", className)} {...props} />;
}

/** 카드 스켈레톤 */
export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card p-6 shadow-sm",
        className
      )}
      {...props}
    >
      <div className="space-y-3">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

/** 테이블 행 스켈레톤 */
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-border/50 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === 0 ? "w-32" : i === columns - 1 ? "w-16" : "w-24"
          )}
        />
      ))}
    </div>
  );
}

/** 그리드 아이템 스켈레톤 */
export function SkeletonGridItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card p-4 shadow-sm space-y-3",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <Skeleton circle className="h-10 w-10" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
