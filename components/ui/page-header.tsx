import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================
// PageHeader - 재사용 가능한 페이지 헤더 컴포넌트
// =========================================
// 모바일: 중앙 정렬, Sticky
// 데스크톱: 왼쪽 정렬

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;  // string → React.ReactNode
  icon?: LucideIcon;
  iconGradient?: string;
  iconColor?: string;
  iconTextColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  iconGradient,
  iconColor = "bg-primary/10",
  iconTextColor = "text-primary",
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        // Sticky positioning
        "sticky top-0 z-40",
        // 배경 및 블러
        "bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80",
        // 테두리 및 그림자
        "border-b border-border/40 shadow-sm",
        // 패딩: 모바일 왼쪽 여백(사이드바용) + 상하 패딩
        "py-4 pl-6 pr-4 sm:py-5 md:pl-0 md:pr-0",
        // 애니메이션
        "transition-all duration-200",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 sm:gap-4",
          // 모바일: 중앙 정렬 (flex-col로 세로 배치)
          "flex-col text-center md:flex-row md:text-left",
          // 데스크톱: justify-between (children이 있을 때)
          children && "md:justify-between"
        )}
      >
        {/* 아이콘 + 제목 영역 */}
        <div className="flex items-center gap-3 sm:gap-4">
          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg sm:h-12 sm:w-12",
                iconGradient
                  ? `bg-gradient-to-br ${iconGradient}`
                  : iconColor
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 sm:h-6 sm:w-6",
                  iconGradient ? "text-white" : iconTextColor
                )}
              />
            </div>
          )}

          {/* 제목 + 부제목 */}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* 우측 액션 영역 (버튼 등) */}
        {children && (
          <div className="mt-3 flex items-center gap-2 md:mt-0 md:gap-4">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
