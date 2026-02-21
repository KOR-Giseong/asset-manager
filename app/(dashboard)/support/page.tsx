"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Plus, X, MessageCircle, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Inquiry {
  id: string;
  title: string;
  status: "PENDING" | "ANSWERED";
  createdAt: string;
  _count?: { answers: number };
}

interface InquiryDetail extends Inquiry {
  content: string;
  answers: {
    id: string;
    content: string;
    createdAt: string;
    admin: { nickname: string };
  }[];
}

export default function SupportPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchInquiries = useCallback(async () => {
    const res = await fetch("/api/support/inquiries");
    const data = await res.json();
    setInquiries(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleToggle = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); setDetail(null); return; }
    setExpandedId(id);
    setDetailLoading(true);
    const res = await fetch(`/api/support/inquiries/${id}`);
    const data = await res.json();
    setDetail(data);
    setDetailLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/support/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "오류가 발생했습니다."); return; }
      setTitle(""); setContent(""); setShowForm(false);
      fetchInquiries();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-6 md:py-8 space-y-5">
      {/* 헤더 */}
      <div className="rounded-xl border bg-gradient-to-br from-blue-500/5 to-blue-500/10 px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base md:text-lg font-bold mb-1">고객센터</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              문의사항을 남기시면 관리자가 확인 후 답변드립니다.
            </p>
          </div>
          <MessageCircle size={28} className="text-blue-500/30 shrink-0 mt-0.5 hidden sm:block" />
        </div>
      </div>

      {/* 문의하기 버튼 / 폼 */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">새 문의 작성</h2>
            <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium">제목</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                placeholder="문의 제목을 입력해주세요"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">내용</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="문의 내용을 자세히 입력해주세요"
                rows={6}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); setError(""); }}>
              취소
            </Button>
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? "제출 중..." : "문의 제출"}
            </Button>
          </div>
        </form>
      ) : (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus size={15} />
          1:1 문의하기
        </Button>
      )}

      {/* 문의 목록 */}
      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">불러오는 중...</div>
      ) : inquiries.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <MessageCircle size={36} className="mx-auto text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">문의 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map((inq) => (
            <div key={inq.id} className="rounded-xl border bg-card overflow-hidden">
              <button
                type="button"
                onClick={() => handleToggle(inq.id)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-accent/50 transition-colors"
              >
                {inq.status === "ANSWERED" ? (
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                ) : (
                  <Clock size={16} className="text-amber-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{inq.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(inq.createdAt).toLocaleDateString("ko-KR")}
                    {" · "}
                    <span className={cn(
                      "font-medium",
                      inq.status === "ANSWERED" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    )}>
                      {inq.status === "ANSWERED" ? "답변 완료" : "답변 대기"}
                    </span>
                  </p>
                </div>
                {expandedId === inq.id ? <ChevronUp size={15} className="shrink-0 text-muted-foreground" /> : <ChevronDown size={15} className="shrink-0 text-muted-foreground" />}
              </button>

              {expandedId === inq.id && (
                <div className="border-t border-border px-4 py-4 space-y-4">
                  {detailLoading ? (
                    <p className="text-xs text-muted-foreground py-2">불러오는 중...</p>
                  ) : detail && (
                    <>
                      {/* 문의 내용 */}
                      <div className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">{detail.content}</div>

                      {/* 답변 */}
                      {detail.answers.length > 0 ? (
                        <div className="space-y-3">
                          {detail.answers.map((ans) => (
                            <div key={ans.id} className="rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-800/40 dark:bg-emerald-950/20 p-3">
                              <div className="flex items-center gap-1.5 mb-2">
                                <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                  관리자 답변
                                </span>
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {new Date(ans.createdAt).toLocaleDateString("ko-KR")}
                                </span>
                              </div>
                              <p className="text-sm whitespace-pre-wrap">{ans.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          아직 답변이 등록되지 않았습니다. 빠른 시일 내 답변드리겠습니다.
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
