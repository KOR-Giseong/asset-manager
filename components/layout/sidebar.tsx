"use client";

// =========================================
// 사이드바 컴포넌트
// =========================================
// 반응형 네비게이션 사이드바
// =========================================

import { useState, useEffect } from "react";
import { useUser } from "@/components/user-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  History,
  CalendarDays,
  Building2,
  Menu,
  X,
  ChevronLeft,
  Wallet,
  ShieldCheck,
  MessageSquare,
  Settings,
  HeadphonesIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// =========================================
// 메뉴 아이템 정의
// =========================================

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}


function getMenuItems(isAdmin: boolean): MenuItem[] {
  const items: MenuItem[] = [
    {
      id: "dashboard",
      label: "대시보드",
      href: "/",
      icon: LayoutDashboard,
      description: "자산 현황 요약",
    },
    {
      id: "history",
      label: "자산 히스토리",
      href: "/history",
      icon: History,
      description: "자산 변화 추이",
    },
    {
      id: "cashflow",
      label: "현금흐름 캘린더",
      href: "/cashflow",
      icon: CalendarDays,
      description: "월별 현금 유입",
    },
    {
      id: "property",
      label: "부동산 관리",
      href: "/property",
      icon: Building2,
      description: "부동산 포트폴리오",
    },
    {
      id: "tax",
      label: "세금/절세",
      href: "/tax",
      icon: ShieldCheck,
      description: "세금 계산 및 절세 전략",
    },
    {
      id: "board",
      label: "게시판",
      href: "/board",
      icon: MessageSquare,
      description: "자유게시판 및 공지사항",
    },
    {
      id: "settings",
      label: "설정",
      href: "/settings",
      icon: Settings,
      description: "계정 및 환경 설정",
    },
    {
      id: "support",
      label: "고객센터",
      href: "/support",
      icon: HeadphonesIcon,
      description: "1:1 문의하기",
    },
  ];
  if (isAdmin) {
    items.push({
      id: "admin",
      label: "관리자",
      href: "/admin",
      icon: ShieldCheck,
      description: "신고 관리 및 계정 정지",
    });
  }
  return items;
}

// =========================================
// 사이드바 컴포넌트
// =========================================

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useUser();
  const isAdmin = user?.role === "ADMIN";

  // 경로 변경 시 모바일 메뉴 닫기
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // ESC 키로 모바일 메뉴 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* 모바일 햄버거 버튼 */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(true)}
        aria-label="메뉴 열기"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* 모바일 오버레이 */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col border-r border-border bg-card transition-all duration-300",
          // 데스크탑
          isCollapsed ? "w-16" : "w-64",
          // 모바일
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        {/* 헤더 */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Asset Manager</span>
            </Link>
          )}
          
          {/* 데스크탑: 접기 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                isCollapsed && "rotate-180"
              )}
            />
          </Button>

          {/* 모바일: 닫기 버튼 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* 네비게이션 */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {getMenuItems(isAdmin).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span>{item.label}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground/70">
                        {item.description}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 푸터 */}
        {!isCollapsed && (
          <div className="border-t border-border p-4 space-y-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                이용약관
              </Link>
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                개인정보처리방침
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Asset Manager</p>
          </div>
        )}
      </aside>
    </>
  );
}

// =========================================
// 사이드바 레이아웃 래퍼
// =========================================

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* 메인 콘텐츠 영역 - 사이드바 너비만큼 마진 */}
      <main className="flex-1 pl-0 md:pl-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
