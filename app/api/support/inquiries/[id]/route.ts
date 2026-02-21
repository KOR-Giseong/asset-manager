import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// 문의 상세 조회 (본인 문의만)
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const inquiry = await prisma.inquiry.findFirst({
    where: { id, userId: session.user.id },
    include: {
      answers: {
        include: { admin: { select: { nickname: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(inquiry);
}
