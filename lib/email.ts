import { Resend } from "resend";

export async function sendVerificationEmail(email: string, token: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const link = `${BASE_URL}/api/auth/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "[Asset Manager] 이메일 인증을 완료해주세요",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">이메일 인증</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
          아래 버튼을 클릭하면 이메일 인증이 완료되고 서비스를 이용하실 수 있습니다.<br/>
          링크는 <strong>24시간</strong> 동안 유효합니다.
        </p>
        <a href="${link}"
           style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
          이메일 인증하기
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
          본인이 요청하지 않았다면 이 메일을 무시하세요.
        </p>
      </div>
    `,
  });
}

export async function sendTwoFactorEmail(email: string, code: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "[Asset Manager] 로그인 인증 코드",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">로그인 인증 코드</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
          아래 6자리 코드를 입력해 로그인을 완료하세요.<br/>
          코드는 <strong>10분</strong> 동안 유효합니다.
        </p>
        <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#111827;text-align:center;padding:16px 0;">${code}</div>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
          본인이 요청하지 않았다면 즉시 비밀번호를 변경하세요.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const link = `${BASE_URL}/reset-password?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "[Asset Manager] 비밀번호 재설정 링크",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;border-radius:12px;border:1px solid #e5e7eb;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">비밀번호 재설정</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
          아래 버튼을 클릭해 새 비밀번호를 설정하세요.<br/>
          링크는 <strong>1시간</strong> 동안 유효합니다.
        </p>
        <a href="${link}"
           style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">
          비밀번호 재설정하기
        </a>
        <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
          본인이 요청하지 않았다면 이 메일을 무시하세요.
        </p>
      </div>
    `,
  });
}
