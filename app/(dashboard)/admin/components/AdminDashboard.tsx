"use client";

import { Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminReportList } from "./AdminReportList";
import { SuspendedAppealAdminList } from "./SuspendedAppealAdminList";
import { AdminInquiryList } from "./AdminInquiryList";

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

interface AdminDashboardProps {
  reports: Report[];
}

export function AdminDashboard({ reports }: AdminDashboardProps) {
  const pendingCount = reports.filter((r) => r.status === "PENDING").length;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 py-6 md:py-8 space-y-5">
      {/* 헤더 배너 */}
      <div className="rounded-xl border bg-gradient-to-br from-destructive/5 to-destructive/10 px-4 md:px-6 py-4 md:py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base md:text-lg font-bold mb-1">관리자 페이지</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              신고 내역 처리, 계정 정지 및 해제 신청을 관리합니다.
            </p>
          </div>
          <Shield size={28} className="text-destructive/30 shrink-0 mt-0.5 hidden sm:block" />
        </div>
      </div>

      {/* 탭 */}
      <Tabs defaultValue="reports">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="reports" className="flex-1 sm:flex-none gap-1.5">
            신고 내역
            {pendingCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold min-w-[18px] h-[18px] px-1">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="appeals" className="flex-1 sm:flex-none">
            정지 해제 신청
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="flex-1 sm:flex-none">
            1:1 문의
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4">
          <AdminReportList reports={reports} />
        </TabsContent>

        <TabsContent value="appeals" className="mt-4">
          <SuspendedAppealAdminList />
        </TabsContent>

        <TabsContent value="inquiries" className="mt-4">
          <AdminInquiryList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
