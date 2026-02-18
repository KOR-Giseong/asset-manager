"use client";
import { FC } from "react";
import Link from "next/link";
import { MessageSquare, UserRound } from "lucide-react";

interface BoardItemProps {
  post: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    authorId: string;
    authorNickname?: string;
    isMine?: boolean;
    isAnonymous?: boolean;
    commentCount?: number;
  };
  isAdmin?: boolean;
  userId?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const BoardItem: FC<BoardItemProps> = ({ post, isAdmin, userId, onEdit, onDelete }) => {
  const canModify = isAdmin || post.isMine || post.authorId === userId;
  const displayName =
    post.isAnonymous
      ? post.isMine
        ? "익명 (나)"
        : "익명"
      : (post.authorNickname ?? "알 수 없음");

  return (
    <div className="border rounded-lg px-4 py-3 flex items-center justify-between hover:bg-muted/40 transition-colors group">
      <Link href={`/board/${post.id}`} className="flex-1 min-w-0 mr-4 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
            {post.title}
          </span>
          {post.commentCount != null && post.commentCount > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0">
              <MessageSquare size={11} />
              {post.commentCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <UserRound size={11} />
          <span>{displayName}</span>
          <span>·</span>
          <span>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</span>
        </div>
      </Link>

      {canModify && (
        <div className="flex gap-2 shrink-0">
          <button
            className="text-xs text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              onEdit?.(post.id);
            }}
          >
            수정
          </button>
          <button
            className="text-xs text-destructive hover:underline"
            onClick={(e) => {
              e.preventDefault();
              onDelete?.(post.id);
            }}
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
};
