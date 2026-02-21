import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "이메일을 입력해주세요." }, { status: 400 });
    }

    // 보안: 존재 여부와 무관하게 성공 응답 (이메일 열거 공격 방지)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user?.password) {
      // 기존 토큰 삭제
      await prisma.passwordResetToken.deleteMany({ where: { email } });

      // 새 토큰 생성 (1시간 유효)
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.passwordResetToken.create({ data: { email, token, expires } });

      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[forgot-password]", e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
