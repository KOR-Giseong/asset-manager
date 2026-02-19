"use client";
import { FC } from "react";
import Link from "next/link";
import { MessageSquare, UserRound } from "lucide-react";
import { PostTag, POST_TAG_LABELS } from "@/types/board";
import { cn } from "@/lib/utils";

const TAG_BADGE_STYLES: Record<PostTag, string> = {
  FREE: "",
  INFO: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  QUESTION: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  SUGGESTION: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
};

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
    tag?: PostTag;
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

  const tag = post.tag ?? "FREE";

  return (
    <div className="border rounded-lg px-4 py-3 flex items-center justify-between hover:bg-muted/40 transition-colors group">
      <Link href={`/board/${post.id}`} className="flex-1 min-w-0 mr-4 space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          {tag !== "FREE" && (
            <span
              className={cn(
                "shrink-0 border rounded-full px-2 py-0.5 text-xs font-medium",
                TAG_BADGE_STYLES[tag]
              )}
            >
              {POST_TAG_LABELS[tag]}
            </span>
          )}
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
