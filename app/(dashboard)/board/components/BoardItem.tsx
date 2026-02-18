"use client";
import { FC } from "react";

interface BoardItemProps {
  post: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    authorId: string;
    isMine?: boolean;
  };
  isAdmin?: boolean;
  userId?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const BoardItem: FC<BoardItemProps> = ({ post, isAdmin, userId, onEdit, onDelete }) => {
  const canModify = isAdmin || post.isMine || post.authorId === userId;

  return (
    <div className="border rounded p-4 flex justify-between items-center">
      <div>
        <span className="font-bold mr-2">{post.title}</span>
        <span className="text-xs text-muted-foreground">
          {new Date(post.createdAt).toLocaleDateString("ko-KR")}
        </span>
      </div>
      {canModify && (
        <div className="flex gap-2">
          <button className="text-xs text-primary underline" onClick={() => onEdit?.(post.id)}>수정</button>
          <button className="text-xs text-destructive underline" onClick={() => onDelete?.(post.id)}>삭제</button>
        </div>
      )}
    </div>
  );
};
