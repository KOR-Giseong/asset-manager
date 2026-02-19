import { auth as getServerSession } from "@/auth";
import { prisma } from "@/lib/prisma";
// authOptions 불필요

export async function getAdminReports() {
  const session = await getServerSession();
  if (!session || session.user.role !== "ADMIN") throw new Error("권한 없음");
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, nickname: true } },
      post: { select: { id: true, title: true, author: { select: { id: true, nickname: true, suspended: true } } } },
      comment: { select: { id: true, content: true, author: { select: { id: true, nickname: true, suspended: true } } } },
    },
  });
  // 신고 대상 유저 추출
  return reports.map((r) => ({
    id: r.id,
    reason: r.reason,
    createdAt: r.createdAt,
    status: r.status,
    reporter: r.reporter,
    post: r.post ? { id: r.post.id, title: r.post.title } : undefined,
    comment: r.comment ? { id: r.comment.id, content: r.comment.content } : undefined,
    reportedUser: r.post
      ? r.post.author
      : r.comment
      ? r.comment.author
      : { id: "", nickname: "", suspended: false },
    screenshotUrl: r.screenshotUrl ?? null,
  }));
}


export async function suspendUser(userId: string, reason: string) {
  const session = await getServerSession();
  if (!session || session.user.role !== "ADMIN") throw new Error("권한 없음");
  await prisma.user.update({ where: { id: userId }, data: { suspended: true, suspendedReason: reason } });
}


export async function unsuspendUser(userId: string) {
  const session = await getServerSession();
  if (!session || session.user.role !== "ADMIN") throw new Error("권한 없음");
  await prisma.user.update({ where: { id: userId }, data: { suspended: false, suspendedReason: null, suspendedAppeal: null } });
}
