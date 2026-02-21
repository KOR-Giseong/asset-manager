import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 관리자: 문의 답변 작성
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "답변 내용을 입력해주세요." }, { status: 400 });

  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.inquiryAnswer.create({
      data: { inquiryId: id, adminId: session.user.id!, content: content.trim() },
    }),
    prisma.inquiry.update({
      where: { id },
      data: { status: "ANSWERED" },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
