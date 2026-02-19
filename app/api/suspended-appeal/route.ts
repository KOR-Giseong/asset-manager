import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, appeal } = await req.json();
  if (!userId || !appeal) {
    return NextResponse.json({ error: "userId, appeal required" }, { status: 400 });
  }

  // 본인 계정의 해제 신청만 허용
  if (session.user.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.user.update({ where: { id: userId }, data: { suspendedAppeal: appeal } });
  return NextResponse.json({ ok: true });
}
