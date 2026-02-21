import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 내 문의 목록 조회
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const inquiries = await prisma.inquiry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      _count: { select: { answers: true } },
    },
  });

  return NextResponse.json(inquiries);
}

// 문의 작성
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, content } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "제목과 내용을 입력해주세요." }, { status: 400 });
  }
  if (title.length > 100) {
    return NextResponse.json({ error: "제목은 100자 이하로 입력해주세요." }, { status: 400 });
  }

  const inquiry = await prisma.inquiry.create({
    data: { userId: session.user.id, title: title.trim(), content: content.trim() },
  });

  return NextResponse.json(inquiry, { status: 201 });
}
