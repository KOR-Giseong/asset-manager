import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* 뒤로가기 */}
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          로그인으로 돌아가기
        </Link>

        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">개인정보 처리방침</h1>
            <p className="mt-2 text-sm text-muted-foreground">최종 업데이트: 2026년 1월 1일</p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Asset Manager(이하 &quot;서비스&quot;)는 이용자의 개인정보를 중요시하며,
            「개인정보 보호법」 등 관련 법령을 준수합니다.
            본 방침은 서비스가 수집하는 개인정보의 종류, 이용 목적, 보유 기간 및 이용자의 권리에 대해 안내합니다.
          </p>

          <Section title="1. 수집하는 개인정보 항목">
            <p>서비스는 Google OAuth 로그인을 통해 다음 정보를 수집합니다.</p>
            <table className="mt-3 w-full text-xs border border-border rounded-lg overflow-hidden">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-foreground">항목</th>
                  <th className="px-4 py-2 text-left font-medium text-foreground">수집 방법</th>
                  <th className="px-4 py-2 text-left font-medium text-foreground">필수 여부</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-4 py-2">이름, 이메일 주소</td>
                  <td className="px-4 py-2">Google OAuth 인증</td>
                  <td className="px-4 py-2">필수</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">프로필 사진 URL</td>
                  <td className="px-4 py-2">Google OAuth 인증</td>
                  <td className="px-4 py-2">선택</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">자산 정보 (직접 입력)</td>
                  <td className="px-4 py-2">이용자 직접 입력</td>
                  <td className="px-4 py-2">선택</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">게시글, 댓글</td>
                  <td className="px-4 py-2">이용자 직접 입력</td>
                  <td className="px-4 py-2">선택</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="2. 개인정보 수집 및 이용 목적">
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 식별 및 서비스 로그인 처리</li>
              <li>개인 맞춤형 자산 관리 서비스 제공</li>
              <li>서비스 이용 관련 공지 및 안내</li>
              <li>부정 이용 방지 및 서비스 보안 유지</li>
            </ul>
          </Section>

          <Section title="3. 개인정보 보유 및 이용 기간">
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 탈퇴 시까지 보유합니다.</li>
              <li>
                탈퇴 신청 후 <strong className="text-foreground">24시간의 유예기간</strong> 동안 데이터가 보관되며,
                유예기간 경과 후 즉시 삭제됩니다.
              </li>
              <li>단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보유합니다.</li>
            </ul>
          </Section>

          <Section title="4. 개인정보의 제3자 제공">
            <p>
              서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 이용자가 사전에 동의한 경우 또는 법령에 의한 경우에는 예외로 합니다.
            </p>
            <div className="mt-3 rounded-lg bg-muted/50 px-4 py-3 text-xs">
              <p className="font-medium text-foreground mb-1">Google (제3자 서비스)</p>
              <p>Google OAuth 인증 과정에서 Google의 개인정보처리방침이 적용됩니다.</p>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Google 개인정보처리방침 보기 →
              </a>
            </div>
          </Section>

          <Section title="5. 개인정보 처리 위탁">
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-foreground">수탁업체</th>
                    <th className="px-4 py-2 text-left font-medium text-foreground">위탁 업무</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-2">Neon (Neon Inc.)</td>
                    <td className="px-4 py-2">데이터베이스 저장 및 관리</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Vercel Inc.</td>
                    <td className="px-4 py-2">서버 호스팅 및 서비스 운영</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="6. 이용자의 권리">
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>개인정보 열람 요청</li>
              <li>개인정보 정정·삭제 요청</li>
              <li>개인정보 처리 정지 요청</li>
              <li>계정 탈퇴 (설정 메뉴에서 직접 처리 가능)</li>
            </ul>
          </Section>

          <Section title="7. 쿠키 및 세션">
            <p>
              서비스는 로그인 상태 유지를 위해 세션 쿠키를 사용합니다.
              브라우저 설정에서 쿠키를 거부할 수 있으나, 이 경우 로그인 등 서비스 이용에 제한이 생길 수 있습니다.
            </p>
          </Section>

          <Section title="8. 개인정보 보호책임자">
            <p>
              개인정보 관련 문의, 불만 처리, 피해 구제 등에 관한 사항은 아래로 연락하시기 바랍니다.
            </p>
            <div className="mt-3 rounded-lg bg-muted/50 px-4 py-3 text-xs space-y-1">
              <p><span className="text-foreground font-medium">서비스명:</span> Asset Manager</p>
              <p><span className="text-foreground font-medium">문의:</span> 서비스 내 게시판을 통해 문의하실 수 있습니다.</p>
            </div>
          </Section>

          <Section title="9. 개인정보처리방침 변경">
            <p>
              본 방침은 법령, 정부 지침 또는 서비스 정책 변경에 따라 수정될 수 있으며,
              변경 시 서비스 내 공지를 통해 안내합니다.
            </p>
          </Section>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-xs text-muted-foreground">
          © 2026 Asset Manager. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
}
