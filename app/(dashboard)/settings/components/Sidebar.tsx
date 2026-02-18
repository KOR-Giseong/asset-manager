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
  <aside className="w-52 border-r h-full flex flex-col py-4 bg-background shrink-0">
    <p className="px-4 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">설정</p>
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
);
