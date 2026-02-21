import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 만료된 인증 토큰 조회
  const expiredTokens = await prisma.verificationToken.findMany({
    where: { expires: { lt: new Date() } },
  });

  const expiredEmails = expiredTokens.map((t) => t.identifier);

  let deletedUsers = 0;
  if (expiredEmails.length > 0) {
    // 미인증 + 토큰 만료된 유저 삭제
    const result = await prisma.user.deleteMany({
      where: {
        email: { in: expiredEmails },
        emailVerified: null,
      },
    });
    deletedUsers = result.count;

    // 만료된 토큰 삭제
    await prisma.verificationToken.deleteMany({
      where: { expires: { lt: new Date() } },
    });
  }

  return NextResponse.json({ ok: true, deletedUsers });
}
