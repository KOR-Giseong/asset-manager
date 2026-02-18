"use client";
import { FC } from "react";
import { cn } from "@/lib/utils";

const categories = [
  { key: "notice", label: "공지사항" },
  { key: "patch", label: "패치노트" },
  { key: "free", label: "자유게시판" },
];

interface BoardCategoryTabsProps {
  selected: string;
  onSelect: (key: string) => void;
  isAdmin?: boolean;
}

export const BoardCategoryTabs: FC<BoardCategoryTabsProps> = ({ selected, onSelect, isAdmin }) => (
  <div className="flex gap-2 mb-4">
    {categories.map((cat) => (
      (cat.key === "free" || isAdmin) && (
        <button
          key={cat.key}
          className={cn(
            "px-4 py-2 rounded transition",
            selected === cat.key ? "bg-primary text-white" : "bg-muted text-muted-foreground"
          )}
          onClick={() => onSelect(cat.key)}
        >
          {cat.label}
        </button>
      )
    ))}
  </div>
);
