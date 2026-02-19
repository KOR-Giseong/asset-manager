import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth as getServerSession } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }
  const { reportId } = await req.json();
  if (!reportId) return NextResponse.json({ error: "reportId required" }, { status: 400 });
  try {
    await prisma.report.update({ where: { id: reportId }, data: { status: "RESOLVED" } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
