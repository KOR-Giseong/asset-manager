import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/icons/google-logo";

export function LoginButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("google", { redirectTo: "/" });
      }}
    >
      <Button type="submit" className="w-full gap-3" size="lg">
        <GoogleLogo className="h-5 w-5" />
        Google 계정으로 로그인
      </Button>
    </form>
  );
}
