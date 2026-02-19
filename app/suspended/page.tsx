import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SuspendedAppealForm } from "./suspended-appeal-form";

export default async function SuspendedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const reason = session.user.suspendedReason || "사유 미기재";
  const userId = session.user.id;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 max-w-md w-full text-center border">
        <h1 className="text-2xl font-bold mb-4 text-destructive">게시판 이용이 불가능합니다</h1>
        <p className="mb-4 text-muted-foreground">
          본 계정은 관리자에 의해 게시판 이용이 제한되었습니다.
          <br />
          <span className="font-semibold text-destructive">정지 사유: {reason}</span>
        </p>
        <SuspendedAppealForm userId={userId} />
        <a href="/" className="text-primary underline mt-6 inline-block text-sm">
          대시보드로 이동
        </a>
      </div>
    </div>
  );
}
