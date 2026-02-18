"use client";
import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { BoardCategoryTabs } from "./BoardCategoryTabs";
import { NoticeType } from "@/types/board";

interface BoardEditorProps {
  initial?: {
    id?: string;
    title?: string;
    content?: string;
    type?: NoticeType;
    category?: string;
  };
  isAdmin?: boolean;
  onSubmit: (data: {
    title: string;
    content: string;
    type?: NoticeType;
    category: string;
    isAnonymous?: boolean;
  }) => void;
  onCancel?: () => void;
}

export const BoardEditor: FC<BoardEditorProps> = ({ initial, isAdmin, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? "free");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      type:
        category === "notice" ? "NOTICE" : category === "patch" ? "PATCH" : undefined,
      category,
      isAnonymous: category === "free" ? isAnonymous : false,
    });
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <BoardCategoryTabs selected={category} onSelect={setCategory} isAdmin={isAdmin} />
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
