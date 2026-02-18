"use client";

import { FC, useState } from "react";
import { BoardCategoryTabs } from "./BoardCategoryTabs";
import { BoardStickyNotice } from "./BoardStickyNotice";
import { BoardList } from "./BoardList";
import { BoardEditor } from "./BoardEditor";
import {
  writePost,
  editPost,
  removePost,
  writeNotice,
  editNotice,
  removeNotice,
} from "@/actions/board";
import type { NoticeType } from "@/types/board";
import { Button } from "@/components/ui/button";

interface SerializedPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  isMine?: boolean;
}

interface SerializedNotice {
  id: string;
  title: string;
  content: string;
  type: NoticeType;
  createdAt: string;
  authorId: string;
}

interface BoardClientProps {
  notices: SerializedNotice[];
  posts: SerializedPost[];
  isAdmin: boolean;
  userId: string;
}

export const BoardClient: FC<BoardClientProps> = ({ notices, posts, isAdmin, userId }) => {
  const [category, setCategory] = useState("free");
  const [editing, setEditing] = useState<{
    id?: string;
    title?: string;
    content?: string;
    category?: string;
    type?: NoticeType;
  } | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    type?: NoticeType;
    category: string;
  }) => {
    if (editing?.id) {
      if (data.category === "free") {
        await editPost(editing.id, { title: data.title, content: data.content });
      } else {
        await editNotice(editing.id, {
          title: data.title,
          content: data.content,
          type: data.type!,
        });
      }
    } else {
      if (data.category === "free") {
        await writePost({ title: data.title, content: data.content });
      } else {
        await writeNotice({
          title: data.title,
          content: data.content,
          type: data.type!,
        });
      }
    }
    setShowEditor(false);
    setEditing(null);
  };

  const handleEditPost = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (post) {
      setEditing({ id, title: post.title, content: post.content, category: "free" });
      setShowEditor(true);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await removePost(id);
  };

  const handleEditNotice = (id: string) => {
    const notice = notices.find((n) => n.id === id);
    if (notice) {
      setEditing({
        id,
        title: notice.title,
        content: notice.content,
        category: notice.type === "NOTICE" ? "notice" : "patch",
        type: notice.type,
      });
      setShowEditor(true);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await removeNotice(id);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <BoardCategoryTabs selected={category} onSelect={setCategory} isAdmin={isAdmin} />
        <Button
          onClick={() => {
            setEditing(null);
            setShowEditor(!showEditor);
          }}
        >
          {showEditor ? "취소" : "글쓰기"}
        </Button>
      </div>

      {showEditor && (
        <div className="mb-6">
          <BoardEditor initial={editing ?? undefined} isAdmin={isAdmin} onSubmit={handleSubmit} />
        </div>
      )}

      <BoardStickyNotice
        notices={notices}
        isAdmin={isAdmin}
        onEdit={handleEditNotice}
        onDelete={handleDeleteNotice}
      />
      <BoardList
        posts={posts}
        isAdmin={isAdmin}
        userId={userId}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />
    </div>
  );
};
