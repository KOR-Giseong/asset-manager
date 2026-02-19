"use client";

import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FileText, MessageSquare, User, Calendar, AlertTriangle } from "lucide-react";

interface Report {
  status: string;
  reason: string;
  createdAt: string;
  screenshotUrl?: string;
  reporter?: { nickname: string };
  reportedUser?: { nickname: string };
  post?: { title: string };
  comment?: { content: string };
}

interface ReportDetailProps {
  report: Report;
  onClose: () => void;
}

export const ReportDetailModal: FC<ReportDetailProps> = ({ report, onClose }) => {
  const isPost = !!report.post?.title;
  const targetContent = isPost
    ? report.post.title
    : report.comment?.content ?? "댓글";

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <AlertTriangle size={16} className="text-destructive" />
            신고 상세 정보
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* 신고 유형 + 상태 */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-xs">
              {isPost ? <FileText size={10} /> : <MessageSquare size={10} />}
              {isPost ? "게시글 신고" : "댓글 신고"}
            </Badge>
            {report.status === "RESOLVED" && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs border-0">
                처리 완료
              </Badge>
            )}
            {report.status === "PENDING" && (
              <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs border-0">
                처리 대기
              </Badge>
            )}
          </div>

          {/* 신고 정보 */}
          <div className="rounded-xl border bg-muted/30 divide-y text-sm">
            <div className="flex items-start gap-3 px-3 py-2.5">
              <User size={13} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground font-medium mb-0.5">신고자</p>
                <p className="font-medium">{report.reporter?.nickname}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-3 py-2.5">
              <User size={13} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground font-medium mb-0.5">피신고자</p>
                <p className="font-medium">{report.reportedUser?.nickname}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 px-3 py-2.5">
              <Calendar size={13} className="text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] text-muted-foreground font-medium mb-0.5">신고일</p>
                <p>{new Date(report.createdAt).toLocaleString("ko-KR")}</p>
              </div>
            </div>
          </div>

          {/* 신고 대상 */}
          <div className="rounded-xl border bg-muted/30 px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground font-medium mb-1">신고 대상</p>
            <p className="text-sm">{targetContent}</p>
          </div>

          {/* 신고 사유 */}
          <div className="rounded-xl border bg-destructive/5 border-destructive/20 px-3 py-2.5">
            <p className="text-[11px] text-destructive font-semibold mb-1">신고 사유</p>
            <p className="text-sm">{report.reason}</p>
          </div>

          {/* 스크린샷 */}
          {report.screenshotUrl && (
            <div className="rounded-xl border overflow-hidden bg-muted/30">
              <p className="text-[11px] text-muted-foreground font-medium px-3 pt-2.5 mb-2">
                첨부 스크린샷
              </p>
              <img
                src={report.screenshotUrl}
                alt="첨부 스크린샷"
                className="w-full max-h-60 object-contain"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
