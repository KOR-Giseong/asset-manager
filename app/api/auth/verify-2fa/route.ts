import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "인증 정보가 없습니다." }, { status: 401 });
  }

  if (!session.user.twoFactorPending) {
    return NextResponse.json({ error: "2FA 인증이 필요하지 않습니다." }, { status: 400 });
  }

  const { code } = await req.json();
  if (!code || typeof code !== "string" || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "올바른 6자리 코드를 입력해주세요." }, { status: 400 });
  }

  const tfToken = await prisma.twoFactorToken.findFirst({
    where: { email: session.user.email },
  });

  if (!tfToken) {
    return NextResponse.json({ error: "인증 코드가 없습니다. 다시 로그인해주세요." }, { status: 400 });
  }

  if (tfToken.expires < new Date()) {
    await prisma.twoFactorToken.delete({ where: { id: tfToken.id } });
    return NextResponse.json({ error: "인증 코드가 만료되었습니다. 다시 로그인해주세요." }, { status: 400 });
  }

  if (tfToken.token !== code) {
    return NextResponse.json({ error: "인증 코드가 일치하지 않습니다." }, { status: 400 });
  }

  // 토큰 삭제 (1회용)
  await prisma.twoFactorToken.delete({ where: { id: tfToken.id } });

  return NextResponse.json({ ok: true });
}
