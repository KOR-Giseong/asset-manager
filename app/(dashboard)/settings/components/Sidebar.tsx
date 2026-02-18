"use client";
import { FC } from "react";
import { cn } from "@/lib/utils";

const categories = [
  { key: "account", label: "계정" },
  { key: "personalize", label: "개인화" },
  { key: "data", label: "알림/데이터" },
  { key: "info", label: "정보" },
];

interface SidebarProps {
  selected: string;
  onSelect: (key: string) => void;
}

export const Sidebar: FC<SidebarProps> = ({ selected, onSelect }) => (
  <aside className="w-48 border-r h-full flex flex-col py-6 bg-background">
    {categories.map((cat) => (
      <button
        key={cat.key}
        className={cn(
          "text-left px-6 py-3 hover:bg-muted transition",
          selected === cat.key && "bg-muted font-bold"
        )}
        onClick={() => onSelect(cat.key)}
      >
        {cat.label}
      </button>
    ))}
  </aside>
);
