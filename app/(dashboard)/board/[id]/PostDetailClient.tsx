"use client";

import { FC, useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MessageSquare, CornerDownRight, Flag, Trash2, HelpCircle } from "lucide-react";
import { addComment, removeComment, reportPost, reportComment } from "@/actions/board";
import { PostTag } from "@/types/board";
import { cn } from "@/lib/utils";

interface Author {
  id: string;
  nickname: string;
}

interface SerializedReply {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: Author;
  isAnonymous?: boolean;
}

interface SerializedComment {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author: Author;
  isAnonymous?: boolean;
  children: SerializedReply[];
}

interface SerializedPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  authorId: string;
  tag?: PostTag;
  isAnonymous?: boolean;
  author: Author;
  comments: SerializedComment[];
}

interface PostDetailClientProps {
  post: SerializedPost;
  currentUserId: string;
  isAdmin: boolean;
}

// 이름 표시 헬퍼
function displayName(
  authorNickname: string,
  authorId: string,
  isAnonymous: boolean | undefined,
  currentUserId: string
): string {
  if (!isAnonymous) return authorNickname;
  return authorId === currentUserId ? "익명 (나)" : "익명";
}

const TAG_BADGE: Record<PostTag, { label: string; cls: string }> = {
  FREE: { label: "자유글", cls: "bg-muted text-muted-foreground" },
  INFO: { label: "정보공유", cls: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400" },
  QUESTION: { label: "질문", cls: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400" },
  SUGGESTION: { label: "건의", cls: "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400" },
};

// 신고 모달
function ReportModal({
  onConfirm,
  onClose,
}: {
  onConfirm: (reason: string, file?: File | null) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-xl border shadow-lg p-6 w-full max-w-sm space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Flag size={15} className="text-destructive" />
          신고 사유를 입력하세요
        </h3>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="신고 사유 (스팸, 욕설, 허위정보 등)"
          rows={3}
        />
        <div>
          <label className="block text-xs font-medium mb-1">첨부 스크린샷 (선택)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs"
          />
          {previewUrl && (
            <div className="mt-2 rounded border max-h-32 mx-auto overflow-hidden flex justify-center">
              <Image
                src={previewUrl}
                alt="미리보기"
                width={256}
                height={128}
                style={{ objectFit: "contain", maxHeight: 128, width: "auto", height: "auto" }}
                unoptimized
              />
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            취소
          </Button>
          <Button
            variant="destructive"
            size="sm"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim(), file)}
          >
            신고
          </Button>
        </div>
      </div>
    </div>
  );
}

export const PostDetailClient: FC<PostDetailClientProps> = ({
  post,
  currentUserId,
  isAdmin,
}) => {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // 정지된 유저면 즉시 로그아웃 및 안내
  useEffect(() => {
    if (status === "authenticated" && session?.user?.suspended) {
      alert("정지된 계정입니다. 관리자에게 문의하세요.");
      signOut({ callbackUrl: "/suspended" });
    }
  }, [session, status]);

  // 정지된 유저인데 아직 차단이 안된 경우(토큰 만료 전) 새로고침 안내 배너
  const [showRefreshBanner, setShowRefreshBanner] = useState(false);
  useEffect(() => {
    if (status === "authenticated" && session?.user?.suspended === true) {
      // 이미 차단된 경우는 제외(위 useEffect에서 signOut)
      // 만약 미들웨어에서 차단이 안 됐다면(토큰 만료 전) 안내
      setShowRefreshBanner(true);
    } else {
      setShowRefreshBanner(false);
    }
  }, [session, status]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportTarget, setReportTarget] = useState<
    { type: "post"; id: string } | { type: "comment"; id: string } | null
  >(null);

  const tag = post.tag ?? "FREE";
  const isQuestion = tag === "QUESTION";

  const totalCount = post.comments.reduce(
    (acc, c) => acc + 1 + c.children.length,
    0
  );

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(post.id, commentText.trim(), undefined, isAnonymous);
      setCommentText("");
      setIsAnonymous(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(post.id, replyText.trim(), parentId, isAnonymous);
      setReplyText("");
      setReplyTo(null);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    await removeComment(commentId, post.id);
    router.refresh();
  };

  const handleReport = async (reason: string, file?: File | null) => {
    if (!reportTarget) return;
    let screenshotUrl: string | undefined = undefined;
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/report-upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) screenshotUrl = data.url;
      }
      if (reportTarget.type === "post") {
        await reportPost(reportTarget.id, reason, screenshotUrl);
      } else {
        await reportComment(reportTarget.id, reason, screenshotUrl);
      }
      alert("신고가 접수되었습니다.");
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "신고 중 오류가 발생했습니다.");
    } finally {
      setReportTarget(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-6 md:py-8 space-y-5 md:space-y-6">
      {showRefreshBanner && (
        <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive text-destructive text-sm text-center font-semibold">
          계정이 정지되었습니다. <span className="underline cursor-pointer" onClick={() => update()}>새로고침</span> 후 이용해 주세요.
        </div>
      )}
      {/* 신고 모달 */}
      {reportTarget && (
        <ReportModal
          onConfirm={handleReport}
          onClose={() => setReportTarget(null)}
        />
      )}

      {/* 뒤로가기 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/board")}
        className="gap-1.5 -ml-2 text-muted-foreground"
      >
        <ArrowLeft size={14} />
        목록으로
      </Button>

      {/* 게시글 */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            {tag !== "FREE" && (
              <span className={cn("border rounded-full px-2 py-0.5 text-xs font-medium", TAG_BADGE[tag].cls)}>
                {TAG_BADGE[tag].label}
              </span>
            )}
            <h1 className="text-xl font-bold leading-snug">{post.title}</h1>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {displayName(post.author.nickname, post.authorId, post.isAnonymous, currentUserId)}
              </span>
              <span>·</span>
              <span>
                {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {post.authorId !== currentUserId && (
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => setReportTarget({ type: "post", id: post.id })}
              >
                <Flag size={12} />
                신고
              </button>
            )}
          </div>
        </div>
        <div className="border-t pt-4 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      </div>

      {/* 댓글/답변 섹션 */}
      <div className="space-y-3">
        <div className={cn("flex items-center gap-1.5 text-sm font-semibold", isQuestion && "text-amber-600 dark:text-amber-400")}>
          {isQuestion ? <HelpCircle size={15} /> : <MessageSquare size={15} />}
          {isQuestion ? `답변 ${totalCount}` : `댓글 ${totalCount}`}
        </div>

        {post.comments.length === 0 && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            {isQuestion
              ? "아직 답변이 없습니다. 첫 답변을 달아보세요!"
              : "아직 댓글이 없습니다. 첫 댓글을 남겨보세요!"}
          </p>
        )}

        {post.comments.map((comment) => {
          const canDeleteComment =
            isAdmin || comment.authorId === currentUserId;
          const name = displayName(
            comment.author.nickname,
            comment.authorId,
            comment.isAnonymous,
            currentUserId
          );

          return (
            <div key={comment.id} className="space-y-2">
              {/* 댓글/답변 */}
              <div className={cn("rounded-lg border bg-card p-4", isQuestion && "border-amber-200/60 dark:border-amber-800/40")}>
                <div className="flex items-center gap-1.5 text-xs mb-2">
                  <span className="font-medium">{name}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      onClick={() =>
                        setReplyTo(replyTo === comment.id ? null : comment.id)
                      }
                    >
                      {isQuestion ? "대댓글" : "답글"}
                    </button>
                    {comment.authorId !== currentUserId && (
                      <button
                        className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() =>
                          setReportTarget({ type: "comment", id: comment.id })
                        }
                      >
                        <Flag size={11} />
                        신고
                      </button>
                    )}
                    {canDeleteComment && (
                      <button
                        className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 size={11} />
                        삭제
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>

              {/* 대댓글 */}
              {comment.children.length > 0 && (
                <div className="ml-6 space-y-2">
                  {comment.children.map((reply) => {
                    const canDeleteReply =
                      isAdmin || reply.authorId === currentUserId;
                    const replyName = displayName(
                      reply.author.nickname,
                      reply.authorId,
                      reply.isAnonymous,
                      currentUserId
                    );
                    return (
                      <div
                        key={reply.id}
                        className="rounded-lg border bg-muted/30 p-4 flex gap-3"
                      >
                        <CornerDownRight
                          size={13}
                          className="mt-0.5 shrink-0 text-muted-foreground"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-xs mb-1">
                            <span className="font-medium">{replyName}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleDateString(
                                "ko-KR"
                              )}
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                              {reply.authorId !== currentUserId && (
                                <button
                                  className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                                  onClick={() =>
                                    setReportTarget({
                                      type: "comment",
                                      id: reply.id,
                                    })
                                  }
                                >
                                  <Flag size={11} />
                                  신고
                                </button>
                              )}
                              {canDeleteReply && (
                                <button
                                  className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                                  onClick={() => handleDeleteComment(reply.id)}
                                >
                                  <Trash2 size={11} />
                                  삭제
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 답글 입력창 */}
              {replyTo === comment.id && (
                <div className="ml-6 space-y-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="답글을 입력하세요..."
                    rows={2}
                    className="text-sm"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded"
                      />
                      익명으로 작성
                    </label>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyText("");
                        }}
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        disabled={submitting || !replyText.trim()}
                        onClick={() => handleReply(comment.id)}
                      >
                        답글 등록
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 댓글/답변 입력 */}
        <div className="rounded-xl border bg-card p-4 space-y-3 mt-2">
          {/* 작성 가이드 안내문구 */}
          <div className="mb-2 p-3 rounded bg-muted/50 text-xs text-muted-foreground">
            ※ 작성 시 타인 비방, 욕설, 성희롱, 개인정보 노출, 불법 정보, 광고 등 금지. 위반 시 제재될 수 있습니다.
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {isQuestion ? "답변 작성" : "댓글 작성"}
          </p>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={isQuestion ? "답변을 입력하세요..." : "댓글을 입력하세요..."}
            rows={3}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded"
              />
              익명으로 작성
            </label>
            <Button
              disabled={submitting || !commentText.trim()}
              onClick={handleAddComment}
            >
              {isQuestion ? "답변 등록" : "등록"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
