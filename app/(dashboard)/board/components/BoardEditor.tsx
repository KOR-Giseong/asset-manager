"use client";
import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BoardCategoryTabs } from "./BoardCategoryTabs";
import { NoticeType, PostTag, POST_TAG_LABELS } from "@/types/board";
import { Pin } from "lucide-react";
import { cn } from "@/lib/utils";

const POST_TAGS: PostTag[] = ["FREE", "INFO", "QUESTION"];

const TAG_STYLES: Record<PostTag, string> = {
  FREE: "border-border text-muted-foreground",
  INFO: "border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400",
  QUESTION: "border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400",
};

interface BoardEditorProps {
  initial?: {
    id?: string;
    title?: string;
    content?: string;
    type?: NoticeType;
    category?: string;
    tag?: PostTag;
    isPinned?: boolean;
  };
  isAdmin?: boolean;
  onSubmit: (data: {
    title: string;
    content: string;
    type?: NoticeType;
    category: string;
    tag?: PostTag;
    isAnonymous?: boolean;
    isPinned?: boolean;
  }) => void;
  onCancel?: () => void;
}

export const BoardEditor: FC<BoardEditorProps> = ({ initial, isAdmin, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? "free");
  const [tag, setTag] = useState<PostTag>(initial?.tag ?? "FREE");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPinned, setIsPinned] = useState(initial?.isPinned ?? false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      type:
        category === "notice" ? "NOTICE" : category === "patch" ? "PATCH" : undefined,
      category,
      tag: category === "free" ? tag : undefined,
      isAnonymous: category === "free" ? isAnonymous : false,
      isPinned: category !== "free" ? isPinned : false,
    });
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      {/* hideMyTabs: 내 글/내 댓글 탭 숨김 */}
      <BoardCategoryTabs
        selected={category}
        onSelect={(key) => {
          setCategory(key);
          setIsPinned(false);
        }}
        isAdmin={isAdmin}
        hideMyTabs
      />
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 입력하세요"
          required
        />
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={6}
          required
        />

        {/* 자유게시판: 태그 선택 */}
        {category === "free" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground font-medium shrink-0">분야:</span>
            {POST_TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={cn(
                  "px-2.5 py-1 rounded-full border text-xs font-medium transition-colors",
                  tag === t
                    ? cn("bg-current/10", TAG_STYLES[t], "border-current opacity-100")
                    : "opacity-50 hover:opacity-80 border-border text-muted-foreground"
                )}
              >
                {POST_TAG_LABELS[t]}
              </button>
            ))}
          </div>
        )}

        {/* 공지/패치: 메인 고정 옵션 (어드민) */}
        {isAdmin && (category === "notice" || category === "patch") && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded border-input"
            />
            <Pin size={13} className={isPinned ? "text-primary" : ""} />
            자유게시판 상단에 고정 표시
          </label>
        )}

        {/* 자유게시판: 익명 옵션 */}
        {category === "free" && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none w-fit">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded border-input"
            />
            익명으로 작성
          </label>
        )}

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button type="submit">{initial?.id ? "수정" : "등록"}</Button>
        </div>
      </form>
    </div>
  );
};
