"use client";

import { FC, useState, useMemo } from "react";
import Link from "next/link";
import { BoardCategoryTabs } from "./BoardCategoryTabs";
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
  toggleLike,
} from "@/actions/board";
import type { NoticeType, PostTag } from "@/types/board";
import { POST_TAG_LABELS } from "@/types/board";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PenSquare, Search, MessageSquare, ExternalLink, Pin, PinOff, TrendingUp, Flame, Heart } from "lucide-react";

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
  likeCount?: number;
  isLikedByMe?: boolean;
}

interface SerializedHotPost {
  id: string;
  title: string;
  isAnonymous: boolean;
  recentLikeCount: number;
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
  hotPosts: SerializedHotPost[];
  isAdmin: boolean;
  userId: string;
}

export const BoardClient: FC<BoardClientProps> = ({
  notices,
  posts,
  myComments,
  hotPosts,
  isAdmin,
  userId,
}) => {
  const [category, setCategory] = useState("free");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<PostTag | "ALL">("ALL");
  const [showEditor, setShowEditor] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
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
    let base = category === "mine" ? posts.filter((p) => p.isMine) : posts;
    if (selectedTag !== "ALL") base = base.filter((p) => (p.tag ?? "FREE") === selectedTag);
    if (!q) return base;
    return base.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }, [posts, category, searchQuery, selectedTag]);

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

  const handleToggleLike = async (id: string) => {
    await toggleLike(id);
  };

  const isWritableCategory =
    category === "free" ||
    (isAdmin && (category === "notice" || category === "patch"));
  const isMyTab = category === "mine" || category === "mycomments";

  return (
    <>
      {/* ── Sticky 탭바 ── */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-3xl mx-auto">
          {/* 모바일: pl-14로 햄버거 아이콘 여백 확보 / 데스크탑: px-0 */}
          <div className="flex items-center gap-2 px-4 md:px-0 py-2 pl-14 md:pl-0">
            <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
              <BoardCategoryTabs
                selected={category}
                onSelect={(key) => {
                  setCategory(key);
                  setShowEditor(false);
                  setEditing(null);
                  setSearchQuery("");
                  setSelectedTag("ALL");
                  setExpandedNoticeId(null);
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
        </div>
      </div>

      {/* ── 스크롤 콘텐츠 ── */}
      <div className="max-w-3xl mx-auto px-4 md:px-0 py-4 md:py-6 space-y-4">
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

        {/* 태그 필터 칩 (자유 / 내 글 탭에서만) */}
        {(category === "free" || category === "mine") && (() => {
          const base = category === "mine" ? posts.filter((p) => p.isMine) : posts;
          const TAG_FILTERS: { key: PostTag | "ALL"; label: string }[] = [
            { key: "ALL",        label: "전체" },
            { key: "FREE",       label: POST_TAG_LABELS.FREE },
            { key: "INFO",       label: POST_TAG_LABELS.INFO },
            { key: "QUESTION",   label: POST_TAG_LABELS.QUESTION },
            { key: "SUGGESTION", label: POST_TAG_LABELS.SUGGESTION },
          ];
          const CHIP_SELECTED: Record<string, string> = {
            ALL:        "bg-foreground text-background border-foreground",
            FREE:       "bg-muted text-foreground border-border font-semibold",
            INFO:       "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700",
            QUESTION:   "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700",
            SUGGESTION: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700",
          };
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              {TAG_FILTERS.map(({ key, label }) => {
                const count = key === "ALL"
                  ? base.length
                  : base.filter((p) => (p.tag ?? "FREE") === key).length;
                const isSelected = selectedTag === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedTag(key)}
                    className={cn(
                      "border rounded-full px-2.5 py-0.5 text-xs transition-colors",
                      isSelected
                        ? CHIP_SELECTED[key]
                        : "border-border text-muted-foreground hover:border-foreground/40 bg-background"
                    )}
                  >
                    {label}
                    <span className="ml-1 opacity-50">{count}</span>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* 공지사항 / 패치노트 탭 */}
        {(category === "notice" || category === "patch") && (
          <div className="space-y-2">
            {filteredNotices
              .filter((n) =>
                category === "notice" ? n.type === "NOTICE" : n.type === "PATCH"
              )
              .map((notice) => {
                const isExpanded = expandedNoticeId === notice.id;
                return (
                  <div key={notice.id} className="border rounded-lg overflow-hidden">
                    {/* 헤더 행 */}
                    <div
                      className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() =>
                        setExpandedNoticeId(isExpanded ? null : notice.id)
                      }
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-primary shrink-0">
                            [{notice.type === "NOTICE" ? "공지" : "업데이트"}]
                          </span>
                          {notice.isPinned && (
                            <Pin size={12} className="text-primary shrink-0" />
                          )}
                          <span className="text-sm font-medium truncate">{notice.title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {notice.authorNickname} · {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {isAdmin && (
                          <>
                            <button
                              className={`text-xs transition-colors ${notice.isPinned ? "text-primary hover:text-primary/70" : "text-muted-foreground hover:text-primary"}`}
                              title={notice.isPinned ? "자유게시판 고정 해제" : "자유게시판 상단에 고정"}
                              onClick={(e) => { e.stopPropagation(); handleTogglePin(notice.id, notice.isPinned); }}
                            >
                              {notice.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                            </button>
                            <button
                              className="text-xs text-primary hover:underline"
                              onClick={(e) => { e.stopPropagation(); handleEditNotice(notice.id); }}
                            >
                              수정
                            </button>
                            <button
                              className="text-xs text-destructive hover:underline"
                              onClick={(e) => { e.stopPropagation(); handleDeleteNotice(notice.id); }}
                            >
                              삭제
                            </button>
                          </>
                        )}
                        <span className="text-muted-foreground text-xs">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>
                    {/* 펼쳐진 내용 */}
                    {isExpanded && (
                      <div className="px-4 py-3 border-t bg-muted/20">
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
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
            {/* 인기 게시글 섹션 (자유게시판 탭에서만) */}
            {category === "free" && hotPosts.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-orange-500 dark:text-orange-400 flex items-center gap-1.5 px-0.5">
                  <TrendingUp size={12} />
                  인기 게시글
                  <span className="opacity-50 font-normal">24시간</span>
                </p>
                {hotPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/board/${post.id}`}
                    className="flex items-center gap-2 rounded-lg border border-orange-200/70 bg-orange-50/40 dark:border-orange-800/40 dark:bg-orange-950/20 px-4 py-2.5 hover:bg-orange-50/70 dark:hover:bg-orange-950/30 transition-colors"
                  >
                    <Flame size={12} className="text-orange-500 dark:text-orange-400 shrink-0" />
                    <span className="flex-1 text-sm font-medium truncate">{post.title}</span>
                    <span className="flex items-center gap-1 text-xs text-orange-500 dark:text-orange-400 shrink-0">
                      <Heart size={11} />
                      {post.recentLikeCount}
                    </span>
                  </Link>
                ))}
                <div className="border-b" />
              </div>
            )}

            {/* 고정 공지 (자유게시판 탭에서만 표시) */}
            {category === "free" && pinnedNotices.length > 0 && (
              <div className="space-y-1.5">
                {pinnedNotices.map((notice) => {
                  const isExpanded = expandedNoticeId === notice.id;
                  return (
                    <div
                      key={notice.id}
                      className="rounded-lg border border-primary/30 bg-primary/5 overflow-hidden"
                    >
                      <div
                        className="px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => setExpandedNoticeId(isExpanded ? null : notice.id)}
                      >
                        <Pin size={12} className="text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-primary">
                              [{notice.type === "NOTICE" ? "공지" : "업데이트"}]
                            </span>
                            <span className="text-sm font-medium truncate">{notice.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isAdmin && (
                            <button
                              className="text-xs text-primary hover:text-primary/70"
                              title="고정 해제"
                              onClick={(e) => { e.stopPropagation(); handleTogglePin(notice.id, notice.isPinned); }}
                            >
                              <PinOff size={13} />
                            </button>
                          )}
                          <span className="text-muted-foreground text-xs">{isExpanded ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-4 py-3 border-t border-primary/20 bg-primary/5">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{notice.content}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="border-b" />
              </div>
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
                onToggleLike={handleToggleLike}
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
    </>
  );
};
