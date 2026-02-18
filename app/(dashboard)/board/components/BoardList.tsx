"use client";
import { FC } from "react";
import { BoardItem } from "./BoardItem";
import { PostTag } from "@/types/board";

interface SerializedPost {
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
}

interface BoardListProps {
  posts: SerializedPost[];
  isAdmin?: boolean;
  userId?: string;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const BoardList: FC<BoardListProps> = ({ posts, isAdmin, userId, onEdit, onDelete }) => (
  <div className="space-y-2">
    {posts.map((post) => (
      <BoardItem
        key={post.id}
        post={post}
        isAdmin={isAdmin}
        userId={userId}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </div>
);
