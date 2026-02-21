import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
            <h1 className="text-2xl font-bold text-foreground">서비스 이용약관</h1>
            <p className="mt-2 text-sm text-muted-foreground">최종 업데이트: 2026년 1월 1일</p>
          </div>

          <Section title="제1조 (목적)">
            <p>
              본 약관은 Asset Manager(이하 &quot;서비스&quot;)가 제공하는 개인 자산 관리 서비스의 이용과 관련하여
              서비스와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </Section>

          <Section title="제2조 (정의)">
            <ul className="list-disc pl-5 space-y-1">
              <li>&quot;서비스&quot;란 Asset Manager가 제공하는 자산 관리, 세금 계산, 현금흐름 관리 등 일체의 기능을 말합니다.</li>
              <li>&quot;이용자&quot;란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.</li>
              <li>&quot;계정&quot;이란 Google OAuth를 통해 생성된 이용자 식별 정보를 말합니다.</li>
            </ul>
          </Section>

          <Section title="제3조 (약관의 효력 및 변경)">
            <p>
              본 약관은 서비스 화면에 게시하거나 이용자에게 공지함으로써 효력을 발생합니다.
              서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일 이내에 효력이 발생합니다.
            </p>
          </Section>

          <Section title="제4조 (회원가입 및 계정)">
            <ul className="list-disc pl-5 space-y-1">
              <li>서비스는 Google 계정을 통한 소셜 로그인 방식으로 회원가입을 제공합니다.</li>
              <li>이용자는 자신의 계정 정보를 안전하게 관리할 의무가 있습니다.</li>
              <li>타인의 정보를 도용하여 서비스를 이용하는 행위는 금지됩니다.</li>
            </ul>
          </Section>

          <Section title="제5조 (서비스 이용)">
            <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>타인의 명예를 손상시키거나 불이익을 주는 행위</li>
              <li>음란, 폭력적이거나 공서양속에 반하는 정보를 게시하는 행위</li>
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>서비스를 상업적 목적으로 무단 이용하는 행위</li>
              <li>타인의 개인정보를 수집·저장·공개하는 행위</li>
            </ul>
          </Section>

          <Section title="제6조 (서비스 이용 제한)">
            <p>
              서비스는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해한 경우,
              사전 통보 없이 해당 이용자의 서비스 이용을 제한하거나 계정을 정지·삭제할 수 있습니다.
            </p>
          </Section>

          <Section title="제7조 (계정 탈퇴)">
            <ul className="list-disc pl-5 space-y-1">
              <li>이용자는 언제든지 설정 메뉴를 통해 탈퇴를 신청할 수 있습니다.</li>
              <li>탈퇴 신청 후 24시간의 유예기간이 부여되며, 이 기간 내 재로그인 시 탈퇴가 자동 취소됩니다.</li>
              <li>유예기간 경과 후 계정 및 모든 관련 데이터는 영구 삭제됩니다.</li>
            </ul>
          </Section>

          <Section title="제8조 (면책사항)">
            <ul className="list-disc pl-5 space-y-1">
              <li>서비스에서 제공하는 자산 계산 및 세금 정보는 참고용이며, 투자 또는 세무 조언이 아닙니다.</li>
              <li>서비스는 천재지변, 시스템 장애 등 불가항력적 사유로 인한 서비스 중단에 대해 책임지지 않습니다.</li>
              <li>이용자가 서비스 내 게시한 정보의 정확성에 대해 서비스는 책임지지 않습니다.</li>
            </ul>
          </Section>

          <Section title="제9조 (지적재산권)">
            <p>
              서비스 내 콘텐츠, 디자인, 로고 등에 대한 지적재산권은 서비스에 귀속됩니다.
              이용자는 서비스를 통해 얻은 정보를 서비스의 사전 동의 없이 복제, 배포, 상업적으로 이용할 수 없습니다.
            </p>
          </Section>

          <Section title="제10조 (준거법 및 관할)">
            <p>
              본 약관은 대한민국 법률에 따라 해석되며, 서비스 이용과 관련한 분쟁은 관할 법원에서 해결합니다.
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
