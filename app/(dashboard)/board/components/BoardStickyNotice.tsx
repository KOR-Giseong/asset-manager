"use client";
import { FC } from "react";
import { NoticeType } from "@/types/board";

interface BoardStickyNoticeProps {
  notices: Array<{
    id: string;
    title: string;
    content: string;
    type: NoticeType;
    createdAt: string;
  }>;
  isAdmin?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const BoardStickyNotice: FC<BoardStickyNoticeProps> = ({ notices, isAdmin, onEdit, onDelete }) => (
  <div className="mb-6">
    {notices.map((notice) => (
      <div key={notice.id} className="border-l-4 border-primary bg-muted p-4 mb-2 flex justify-between items-center">
        <div>
          <span className="font-bold mr-2">[{notice.type === "NOTICE" ? "공지" : "패치"}]</span>
          <span>{notice.title}</span>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button className="text-xs text-primary underline" onClick={() => onEdit?.(notice.id)}>수정</button>
            <button className="text-xs text-destructive underline" onClick={() => onDelete?.(notice.id)}>삭제</button>
          </div>
        )}
      </div>
    ))}
  </div>
);
