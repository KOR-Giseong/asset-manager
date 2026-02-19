"use client";

import { FC, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ReportDetailModal } from "./ReportDetailModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Ban, CheckCircle2, FileText, MessageSquare, User } from "lucide-react";

interface Report {
  id: string;
  reason: string;
  createdAt: string;
  status: string;
  reporter: { id: string; nickname: string };
  post?: { id: string; title: string };
  comment?: { id: string; content: string };
  reportedUser: { id: string; nickname: string; suspended: boolean };
  screenshotUrl?: string | null;
}

interface AdminReportListProps {
  reports: Report[];
}

const STATUS_CONFIG = {
  PENDING: { label: "처리 대기", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  RESOLVED: { label: "처리 완료", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  REJECTED: { label: "반려", className: "bg-muted text-muted-foreground" },
};

export const AdminReportList: FC<AdminReportListProps> = ({ reports: initialReports }) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reports, setReports] = useState(initialReports);
  const [suspendDialog, setSuspendDialog] = useState<{ userId: string; open: boolean }>({ userId: "", open: false });
  const [suspendReason, setSuspendReason] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSuspend = async (userId: string, reason: string) => {
    setLoadingId(userId);
    await fetch("/api/admin/suspend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, reason }),
    });
    setSuspendDialog({ userId: "", open: false });
    setSuspendReason("");
    setLoadingId(null);
    setReports((prev) =>
      prev.map((r) =>
        r.reportedUser.id === userId
          ? { ...r, reportedUser: { ...r.reportedUser, suspended: true } }
          : r
      )
    );
  };

  const handleUnsuspend = async (userId: string) => {
    setLoadingId(userId);
    await fetch("/api/admin/unsuspend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setLoadingId(null);
    setReports((prev) =>
      prev.map((r) =>
        r.reportedUser.id === userId
          ? { ...r, reportedUser: { ...r.reportedUser, suspended: false } }
          : r
      )
    );
  };

  const handleResolve = async (reportId: string) => {
    setLoadingId(reportId);
    await fetch("/api/admin/resolve-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId }),
    });
    setLoadingId(null);
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: "RESOLVED" } : r))
    );
  };

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 size={40} className="text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">처리할 신고가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((r) => {
        const statusCfg = STATUS_CONFIG[r.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
        const isPost = !!r.post;
        const targetLabel = isPost
          ? r.post!.title
          : r.comment?.content
          ? r.comment.content.slice(0, 30) + (r.comment.content.length > 30 ? "…" : "")
          : "댓글";

        return (
          <div
            key={r.id}
            className="rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            {/* 카드 상단 */}
            <div className="px-4 pt-4 pb-3 flex items-start gap-3">
              {/* 아이콘 */}
              <div className="shrink-0 mt-0.5">
                <div className="rounded-lg bg-destructive/10 p-2">
                  <AlertTriangle size={16} className="text-destructive" />
                </div>
              </div>

              {/* 본문 */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* 상태 + 날짜 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                  <Badge variant="outline" className="text-[11px] px-2 py-0.5 gap-1">
                    {isPost ? <FileText size={10} /> : <MessageSquare size={10} />}
                    {isPost ? "게시글" : "댓글"}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground ml-auto">
                    {new Date(r.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>

                {/* 신고자 → 피신고자 */}
                <div className="flex items-center gap-1.5 text-sm">
                  <User size={12} className="text-muted-foreground shrink-0" />
                  <span className="font-medium">{r.reporter.nickname}</span>
                  <span className="text-muted-foreground text-xs">→</span>
                  <span className="text-muted-foreground text-xs">
                    <span className="font-medium text-foreground">{r.reportedUser.nickname}</span>
                    {r.reportedUser.suspended && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] text-destructive font-semibold">
                        <Ban size={9} /> 정지됨
                      </span>
                    )}
                  </span>
                </div>

                {/* 신고 대상 */}
                <p className="text-xs text-muted-foreground truncate">
                  <span className="font-medium text-foreground">대상: </span>
                  {targetLabel}
                </p>

                {/* 신고 사유 */}
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">사유: </span>
                  {r.reason}
                </p>

                {/* 스크린샷 미리보기 */}
                {r.screenshotUrl && (
                  <div className="rounded-lg border overflow-hidden mt-2 max-h-28 flex justify-center bg-muted/30">
                    <Image
                      src={r.screenshotUrl}
                      alt="첨부 스크린샷"
                      width={256}
                      height={112}
                      className="object-contain max-h-28 w-auto h-auto"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 카드 하단 액션 */}
            <div className="px-4 pb-3 flex items-center gap-2 border-t pt-3">
              {r.reportedUser.suspended ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  disabled={loadingId === r.reportedUser.id}
                  onClick={() => handleUnsuspend(r.reportedUser.id)}
                >
                  정지 해제
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs h-7"
                  disabled={loadingId === r.reportedUser.id}
                  onClick={() => setSuspendDialog({ userId: r.reportedUser.id, open: true })}
                >
                  <Ban size={11} className="mr-1" />
                  계정 정지
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7"
                onClick={() => setSelectedReport(r)}
              >
                상세보기
              </Button>
              {r.status === "PENDING" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs h-7 ml-auto"
                  disabled={loadingId === r.id}
                  onClick={() => handleResolve(r.id)}
                >
                  <CheckCircle2 size={11} className="mr-1" />
                  처리 완료
                </Button>
              )}
            </div>
          </div>
        );
      })}

      {/* 정지 사유 다이얼로그 */}
      <Dialog
        open={suspendDialog.open}
        onOpenChange={(open) => setSuspendDialog((v) => ({ ...v, open }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ban size={16} className="text-destructive" />
              계정 정지 사유 입력
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="정지 사유를 입력하세요 (사용자에게 표시됩니다)"
            className="min-h-[100px]"
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setSuspendDialog({ userId: "", open: false });
                setSuspendReason("");
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              disabled={!suspendReason.trim()}
              onClick={() => handleSuspend(suspendDialog.userId, suspendReason)}
            >
              계정 정지
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 신고 상세 모달 */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
};
