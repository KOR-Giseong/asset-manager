import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, password, nickname } = await req.json();

    // 입력 검증
    if (!email || !password || !nickname) {
      return NextResponse.json({ error: "모든 항목을 입력해주세요." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "올바른 이메일 형식이 아닙니다." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "비밀번호는 8자 이상이어야 합니다." }, { status: 400 });
    }
    if (nickname.length < 2 || nickname.length > 16) {
      return NextResponse.json({ error: "닉네임은 2~16자여야 합니다." }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9가-힣]+$/.test(nickname)) {
      return NextResponse.json({ error: "닉네임은 한글, 영문, 숫자만 사용 가능합니다." }, { status: 400 });
    }

    // 이메일 중복 확인
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      // 미인증 계정이면 삭제 후 재가입 허용
      if (!existingEmail.emailVerified) {
        await prisma.verificationToken.deleteMany({ where: { identifier: email } });
        await prisma.user.delete({ where: { email } });
      } else {
        return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 409 });
      }
    }

    // 닉네임 중복 확인
    const existingNickname = await prisma.user.findUnique({ where: { nickname } });
    if (existingNickname) {
      return NextResponse.json({ error: "이미 사용 중인 닉네임입니다." }, { status: 409 });
    }

    // 비밀번호 해시 + 유저 생성
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        name: nickname,
        emailVerified: null,
        role: "USER",
      },
    });

    // 이메일 인증 토큰 생성 (24시간 유효)
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 기존 토큰 삭제 후 새 토큰 저장
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    // 인증 메일 발송
    await sendVerificationEmail(email, token);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
