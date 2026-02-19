"use client";
import { FC } from "react";
import { cn } from "@/lib/utils";

const allCategories = [
  { key: "free", label: "자유게시판", writeAdminOnly: false, myTab: false },
  { key: "notice", label: "공지사항", writeAdminOnly: true, myTab: false },
  { key: "patch", label: "패치노트", writeAdminOnly: true, myTab: false },
  { key: "mine", label: "내 글", writeAdminOnly: false, myTab: true },
  { key: "mycomments", label: "내 댓글", writeAdminOnly: false, myTab: true },
];

interface BoardCategoryTabsProps {
  selected: string;
  onSelect: (key: string) => void;
  isAdmin?: boolean;
  /** true면 내 글/내 댓글 탭 숨김 (에디터 내부에서 사용) */
  hideMyTabs?: boolean;
  /** true면 작성 모드 (관리자만 공지/패치 탭 노출) */
  writeMode?: boolean;
}

export const BoardCategoryTabs: FC<BoardCategoryTabsProps> = ({
  selected,
  onSelect,
  isAdmin,
  hideMyTabs = false,
  writeMode = false,
}) => {
  const visible = allCategories.filter((c) => {
    if (writeMode && c.writeAdminOnly && !isAdmin) return false;
    if (hideMyTabs && c.myTab) return false;
    return true;
  });

  return (
    <div className="flex gap-1 flex-nowrap pb-0.5">
      {visible.map((cat) => (
        <button
          key={cat.key}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap shrink-0",
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
