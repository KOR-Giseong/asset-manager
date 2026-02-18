"use client";
import { FC } from "react";
import { cn } from "@/lib/utils";

const allCategories = [
  { key: "free", label: "자유게시판", adminOnly: false },
  { key: "notice", label: "공지사항", adminOnly: true },
  { key: "patch", label: "패치노트", adminOnly: true },
  { key: "mine", label: "내 글", adminOnly: false },
  { key: "mycomments", label: "내 댓글", adminOnly: false },
];

interface BoardCategoryTabsProps {
  selected: string;
  onSelect: (key: string) => void;
  isAdmin?: boolean;
}

export const BoardCategoryTabs: FC<BoardCategoryTabsProps> = ({ selected, onSelect, isAdmin }) => {
  const visible = allCategories.filter((c) => !c.adminOnly || isAdmin);

  return (
    <div className="flex gap-1 flex-wrap">
      {visible.map((cat) => (
        <button
          key={cat.key}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
            selected === cat.key
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
          onClick={() => onSelect(cat.key)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};
