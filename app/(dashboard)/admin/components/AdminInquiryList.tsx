"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface InquiryItem {
  id: string;
  title: string;
  content: string;
  status: "PENDING" | "ANSWERED";
  createdAt: string;
  user: { nickname: string; email: string | null };
  answers: { id: string }[];
}

export function AdminInquiryList() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    const res = await fetch("/api/admin/inquiries");
    const data = await res.json();
    setInquiries(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleAnswer = async (id: string) => {
    const content = answerMap[id]?.trim();
    if (!content) return;
    setSubmitting(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setAnswerMap((prev) => ({ ...prev, [id]: "" }));
        fetchInquiries();
      }
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <div className="text-center py-12 text-sm text-muted-foreground">불러오는 중...</div>;

  const pending = inquiries.filter((i) => i.status === "PENDING");
  const answered = inquiries.filter((i) => i.status === "ANSWERED");

  if (inquiries.length === 0) {
    return <div className="text-center py-16 text-sm text-muted-foreground">접수된 문의가 없습니다.</div>;
  }

  const renderItem = (inq: InquiryItem) => (
    <div key={inq.id} className="rounded-xl border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
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
            {inq.user.nickname} · {new Date(inq.createdAt).toLocaleDateString("ko-KR")}
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
          {/* 문의 내용 */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">{inq.content}</div>

          {/* 기존 답변 */}
          {inq.answers.length > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">이미 답변이 등록된 문의입니다.</p>
          )}

          {/* 답변 입력 */}
          {inq.status === "PENDING" && (
            <div className="space-y-2">
              <label className="text-xs font-medium">답변 작성</label>
              <textarea
                rows={4}
                value={answerMap[inq.id] ?? ""}
                onChange={(e) => setAnswerMap((prev) => ({ ...prev, [inq.id]: e.target.value }))}
                placeholder="답변 내용을 입력해주세요"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  disabled={!answerMap[inq.id]?.trim() || submitting === inq.id}
                  onClick={() => handleAnswer(inq.id)}
                >
                  {submitting === inq.id ? "제출 중..." : "답변 등록"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">대기 중 ({pending.length})</h3>
          {pending.map(renderItem)}
        </div>
      )}
      {answered.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">답변 완료 ({answered.length})</h3>
          {answered.map(renderItem)}
        </div>
      )}
    </div>
  );
}
