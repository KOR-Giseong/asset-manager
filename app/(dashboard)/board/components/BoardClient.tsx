"use client";

import { FC, useState, useMemo } from "react";
import Link from "next/link";
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
  togglePinNotice,
} from "@/actions/board";
import type { NoticeType, PostTag } from "@/types/board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PenSquare, Search, MessageSquare, ExternalLink, Pin, PinOff } from "lucide-react";

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

interface SerializedNotice {
  id: string;
  title: string;
  content: string;
  type: NoticeType;
  isPinned: boolean;
  createdAt: string;
  authorId: string;
  authorNickname?: string;
}

interface SerializedMyComment {
  id: string;
  content: string;
  createdAt: string;
  postId: string;
  postTitle: string;
  isAnonymous?: boolean;
}

interface BoardClientProps {
  notices: SerializedNotice[];
  posts: SerializedPost[];
  myComments: SerializedMyComment[];
  isAdmin: boolean;
  userId: string;
}

export const BoardClient: FC<BoardClientProps> = ({
  notices,
  posts,
  myComments,
  isAdmin,
  userId,
}) => {
  const [category, setCategory] = useState("free");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<{
    id?: string;
    title?: string;
    content?: string;
    category?: string;
    type?: NoticeType;
    tag?: PostTag;
    isPinned?: boolean;
  } | null>(null);

  const pinnedNotices = useMemo(() => notices.filter((n) => n.isPinned), [notices]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = category === "mine" ? posts.filter((p) => p.isMine) : posts;
    if (!q) return base;
    return base.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }, [posts, category, searchQuery]);

  const filteredNotices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return notices;
    return notices.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
    );
  }, [notices, searchQuery]);

  const handleSubmit = async (data: {
    title: string;
    content: string;
    type?: NoticeType;
    category: string;
    tag?: PostTag;
    isAnonymous?: boolean;
    isPinned?: boolean;
  }) => {
    if (editing?.id) {
      if (data.category === "free") {
        await editPost(editing.id, { title: data.title, content: data.content, tag: data.tag });
      } else {
        await editNotice(editing.id, {
          title: data.title,
          content: data.content,
          type: data.type!,
          isPinned: data.isPinned,
        });
      }
    } else {
      if (data.category === "free") {
        await writePost({
          title: data.title,
          content: data.content,
          tag: data.tag,
          isAnonymous: data.isAnonymous,
        });
      } else {
        await writeNotice({
          title: data.title,
          content: data.content,
          type: data.type!,
          isPinned: data.isPinned,
        });
      }
    }
    setShowEditor(false);
    setEditing(null);
  };

  const handleEditPost = (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (post) {
      setEditing({ id, title: post.title, content: post.content, category: "free", tag: post.tag });
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
        isPinned: notice.isPinned,
      });
      setShowEditor(true);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await removeNotice(id);
  };

  const handleTogglePin = async (id: string, current: boolean) => {
    await togglePinNotice(id, !current);
  };

  const isWritableCategory =
    category === "free" ||
    (isAdmin && (category === "notice" || category === "patch"));
  const isMyTab = category === "mine" || category === "mycomments";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-6 md:py-8 space-y-4 md:space-y-5">
      {/* 헤더 배너 */}
      <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base md:text-lg font-bold mb-1">게시판</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              모든 정보를 게시판을 통해 자유롭게 공유해보세요!
              <br className="hidden sm:block" />
              <span className="hidden sm:inline">질문, 정보 공유, 자산 관리 팁 등 무엇이든 환영합니다.</span>
            </p>
          </div>
          <PenSquare size={28} className="text-primary/30 shrink-0 mt-0.5 hidden sm:block" />
        </div>
      </div>

      {/* 탭 + 글쓰기 버튼 */}
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
          <BoardCategoryTabs
            selected={category}
            onSelect={(key) => {
              setCategory(key);
              setShowEditor(false);
              setEditing(null);
              setSearchQuery("");
            }}
            isAdmin={isAdmin}
          />
        </div>
        {isWritableCategory && (
          <Button
            size="sm"
            variant={showEditor ? "ghost" : "default"}
            className="shrink-0"
            onClick={() => {
              setEditing(null);
              setShowEditor((v) => !v);
            }}
          >
            {showEditor ? "취소" : "글쓰기"}
          </Button>
        )}
      </div>

      {/* 에디터 */}
      {showEditor && (
        <BoardEditor
          initial={editing ?? undefined}
          isAdmin={isAdmin}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowEditor(false);
            setEditing(null);
          }}
        />
      )}

      {/* 검색창 (내 탭 제외) */}
      {!isMyTab && (
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="제목 또는 내용으로 검색"
            className="pl-8 text-sm"
          />
        </div>
      )}

      {/* 공지사항 / 패치노트 탭 */}
      {(category === "notice" || category === "patch") && (
        <div className="space-y-2">
          {filteredNotices
            .filter((n) =>
              category === "notice" ? n.type === "NOTICE" : n.type === "PATCH"
            )
            .map((notice) => (
              <div
                key={notice.id}
                className="border rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-primary">
                      [{notice.type === "NOTICE" ? "공지" : "패치"}]
                    </span>
                    {notice.isPinned && (
                      <Pin size={12} className="text-primary" />
                    )}
                    <span className="text-sm font-medium">{notice.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex gap-2 shrink-0 items-center">
                    <button
                      className={`text-xs transition-colors ${notice.isPinned ? "text-primary hover:text-primary/70" : "text-muted-foreground hover:text-primary"}`}
                      title={notice.isPinned ? "자유게시판 고정 해제" : "자유게시판 상단에 고정"}
                      onClick={() => handleTogglePin(notice.id, notice.isPinned)}
                    >
                      {notice.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button
                      className="text-xs text-primary hover:underline"
                      onClick={() => handleEditNotice(notice.id)}
                    >
                      수정
                    </button>
                    <button
                      className="text-xs text-destructive hover:underline"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
          {filteredNotices.filter((n) =>
            category === "notice" ? n.type === "NOTICE" : n.type === "PATCH"
          ).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery ? "검색 결과가 없습니다." : "게시글이 없습니다."}
            </p>
          )}
        </div>
      )}

      {/* 자유게시판 / 내 글 탭 */}
      {(category === "free" || category === "mine") && (
        <div className="space-y-3">
          {/* 고정 공지 (자유게시판 탭에서만 표시) */}
          {category === "free" && pinnedNotices.length > 0 && (
            <div className="space-y-1.5">
              {pinnedNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 flex items-center gap-2"
                >
                  <Pin size={12} className="text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">
                        [{notice.type === "NOTICE" ? "공지" : "패치"}]
                      </span>
                      <span className="text-sm font-medium truncate">{notice.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      className="text-xs text-primary hover:text-primary/70 shrink-0"
                      title="고정 해제"
                      onClick={() => handleTogglePin(notice.id, notice.isPinned)}
                    >
                      <PinOff size={13} />
                    </button>
                  )}
                </div>
              ))}
              <div className="border-b" />
            </div>
          )}

          {category === "free" && (
            <BoardStickyNotice
              notices={notices}
              isAdmin={isAdmin}
              onEdit={handleEditNotice}
              onDelete={handleDeleteNotice}
            />
          )}
          {filteredPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery
                ? "검색 결과가 없습니다."
                : category === "mine"
                ? "작성한 글이 없습니다."
                : "아직 게시글이 없습니다. 첫 글을 남겨보세요!"}
            </p>
          ) : (
            <BoardList
              posts={filteredPosts}
              isAdmin={isAdmin}
              userId={userId}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
            />
          )}
        </div>
      )}

      {/* 내 댓글 탭 */}
      {category === "mycomments" && (
        <div className="space-y-2">
          {myComments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              작성한 댓글이 없습니다.
            </p>
          ) : (
            myComments.map((c) => (
              <Link
                key={c.id}
                href={`/board/${c.postId}`}
                className="flex items-start justify-between rounded-lg border px-4 py-3 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary font-medium mb-1 flex items-center gap-1 truncate">
                    <MessageSquare size={11} />
                    {c.postTitle}
                  </p>
                  <p className="text-sm text-foreground truncate">
                    {c.isAnonymous ? "(익명) " : ""}
                    {c.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(c.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <ExternalLink
                  size={13}
                  className="shrink-0 mt-1 ml-3 text-muted-foreground group-hover:text-foreground transition-colors"
                />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};
