import { NextRequest, NextResponse } from "next/server";
import { suspendUser } from "@/actions/admin";

export async function POST(req: NextRequest) {
  const { userId, reason } = await req.json();
  if (!userId || !reason) return NextResponse.json({ error: "userId, reason required" }, { status: 400 });
  try {
    await suspendUser(userId, reason);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
