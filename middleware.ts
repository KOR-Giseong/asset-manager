import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth;

  if (!session) return NextResponse.next();

  const url = req.nextUrl.clone();

  if (session.user.suspended) {
    url.pathname = "/suspended";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (session.user.twoFactorPending) {
    url.pathname = "/verify-2fa";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/board/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api/|login|register|verify-email|forgot-password|reset-password|suspended|verify-2fa).*)",
  ],
};
