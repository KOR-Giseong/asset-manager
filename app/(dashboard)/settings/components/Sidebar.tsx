"use client";
import { FC } from "react";
import { cn } from "@/lib/utils";
import { User, Palette, Database, Info } from "lucide-react";

const categories = [
  { key: "account", label: "계정", icon: User },
  { key: "personalize", label: "개인화", icon: Palette },
  { key: "data", label: "알림/데이터", icon: Database },
  { key: "info", label: "정보", icon: Info },
];

interface SidebarProps {
  selected: string;
  onSelect: (key: string) => void;
}

export const Sidebar: FC<SidebarProps> = ({ selected, onSelect }) => (
  <>
    {/* 모바일: 상단 수평 스크롤 탭바 (sticky + 햄버거 여백) */}
    <div className="md:hidden sticky top-0 z-30 flex overflow-x-auto border-b bg-background/95 backdrop-blur-sm shrink-0 pl-14 pr-2 gap-1 py-2 scrollbar-hide">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selected === cat.key;
        return (
          <button
            key={cat.key}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0",
              isSelected
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => onSelect(cat.key)}
          >
            <Icon size={14} />
            {cat.label}
          </button>
        );
      })}
    </div>

    {/* 데스크탑: 세로 사이드바 */}
    <aside className="hidden md:flex w-52 border-r h-full flex-col py-4 bg-background shrink-0">
      <p className="px-4 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        설정
      </p>
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selected === cat.key;
        return (
          <button
            key={cat.key}
            className={cn(
              "flex items-center gap-3 text-left px-4 py-2.5 mx-2 rounded-lg transition-colors text-sm",
              isSelected
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            onClick={() => onSelect(cat.key)}
          >
            <Icon size={16} className={cn(isSelected ? "text-primary" : "text-muted-foreground")} />
            {cat.label}
          </button>
        );
      })}
    </aside>
  </>
);
