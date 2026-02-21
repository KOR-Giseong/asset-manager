import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 관리자: 전체 문의 목록
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { nickname: true, email: true } },
      answers: { select: { id: true } },
    },
  });

  return NextResponse.json(inquiries);
}
