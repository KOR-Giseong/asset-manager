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
  onSubmit: (data: { title: string; content: string; type?: NoticeType; category: string }) => void;
}

export const BoardEditor: FC<BoardEditorProps> = ({ initial, isAdmin, onSubmit }) => {
  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [category, setCategory] = useState(initial?.category || "free");

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit({ title, content, type: category === "notice" ? "NOTICE" : category === "patch" ? "PATCH" : undefined, category });
      }}
      className="space-y-4"
    >
      <BoardCategoryTabs selected={category} onSelect={setCategory} isAdmin={isAdmin} />
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="제목" required />
      <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="내용" rows={6} required />
      <Button type="submit">{initial?.id ? "수정" : "등록"}</Button>
    </form>
  );
};
