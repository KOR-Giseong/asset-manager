import { auth as getServerSession } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 정지된 사용자 중 해제 신청한 목록 반환
export async function GET() {
  const session = await getServerSession();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  const users = await prisma.user.findMany({
    where: { suspended: true, suspendedAppeal: { not: null } },
    select: {
      id: true,
      nickname: true,
      suspendedReason: true,
      suspendedAppeal: true,
      email: true,
    },
    orderBy: { nickname: "asc" },
  });
  return NextResponse.json({ users });
}

// (선택) 해제 처리 API는 기존 unsuspendUser 사용
