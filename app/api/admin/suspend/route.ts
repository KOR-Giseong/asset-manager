import { NextRequest, NextResponse } from "next/server";
import { suspendUser } from "@/actions/admin";

export async function POST(req: NextRequest) {
  const { userId, reason } = await req.json();
  if (!userId || !reason) return NextResponse.json({ error: "userId, reason required" }, { status: 400 });
  try {
    await suspendUser(userId, reason);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
