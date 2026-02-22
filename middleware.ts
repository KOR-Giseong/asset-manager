import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token) return NextResponse.next();

  if (token.suspended) {
    const url = req.nextUrl.clone();
    url.pathname = "/suspended";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 2FA 인증 대기 중인 경우 /verify-2fa 로 강제 이동
  if (token.twoFactorPending) {
    const url = req.nextUrl.clone();
    url.pathname = "/verify-2fa";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // /verify-2fa 와 공개 페이지(/login 등)는 제외, 나머지 앱 라우트 전체 적용
  matcher: [
    "/board/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api/|login|register|verify-email|forgot-password|reset-password|suspended|verify-2fa).*)",
  ],
};
