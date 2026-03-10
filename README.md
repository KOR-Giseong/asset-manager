<div align="center">

# 💰 Asset Manager

**주식 · 부동산 · 예적금을 한 곳에서 관리하는 개인 자산 관리 플랫폼**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?style=flat-square&logo=vercel)](https://asset-ly.com)

**[🌐 asset-ly.com](https://asset-ly.com)** · [🐛 이슈 리포트](https://github.com/KOR-Giseong/asset-manager/issues)

</div>

---

## 📌 프로젝트 소개

내 자산이 어디에 얼마나 있는지 한눈에 파악하기 어려우셨나요?
Asset Manager는 주식, 부동산, 예적금을 통합 관리하고, **세금 시뮬레이션**과 **현금흐름 분석**까지 제공하는 개인 자산 관리 웹앱입니다.

---

## ✨ 주요 기능

### 📊 자산 대시보드
- 총 자산 현황 및 카테고리별(주식·부동산·예적금) 비중 차트
- Yahoo Finance / Upbit API 연동으로 실시간 시세 갱신
- 자산 목록 테이블 및 빠른 메뉴

### 📈 자산 히스토리
- 날짜별 자산 스냅샷 자동 기록 (1일 1회)
- 기간별 추이 차트 (7일 / 30일 / 90일 / 1년 / 전체)
- 기간 내 자산 변화율 및 절대값 표시

### 🏠 부동산 관리
- 부동산 유형: 아파트 · 빌라 · 오피스텔 · 상가 · 토지 · 기타
- 계약 형태: 자가 · 전세 · 월세 · 전세 놓음 · 월세 놓음
- **투자 지표 자동 계산:**
  - 순자산(Equity) = 현재 시세 - (대출 + 임대 보증금)
  - 현금흐름 = 계약 유형별 수입/지출 합산
  - ROI = (연 순수익 / 실투자금) × 100
  - LTV = (대출 / 시세) × 100 — 70% 이상 경고, 80% 이상 위험
  - 계약 만기 D-Day (90일 이내 경고)
- 포트폴리오 요약 (총 시세 · 총 순자산 · 평균 LTV · 월별 현금흐름)

### 💸 현금흐름 캘린더
- 월별 예정 현금흐름을 캘린더로 시각화
- 월세 수입 (임대 부동산 기준, 매월 25일)
- 배당금 (심볼별 배당 주기 자동 판별 — 월배당 / 분기 / 반기 / 연간)
- 예적금 이자 (연 3%, 월말 입금)

### 🧾 세금 & 절세 시뮬레이터 (2026년 세법 기준)
- **종합소득세** — 근로소득공제 + 임대소득 + 누진세율 + 지방소득세
- **부동산 취득세** — 주택 수 · 조정대상지역 · 생애최초 감면 반영
- **부동산 양도세** — 1세대 1주택 비과세 · 장기보유특별공제(최대 80%) · 다주택 중과세
- **해외주식 양도세** — 손익통산 후 기본공제 250만원 차감, 22% 과세
- **건강보험료** — 직장인 기본료 + 소득월액보험료
- **ISA/IRP 절세** — 비과세 한도 및 세액공제 효과 분석
- 절세 전/후 비교 차트 제공

### 🔐 계정 & 보안
- Google OAuth 소셜 로그인
- 이메일 / 비밀번호 자격증명 로그인
- **이메일 2FA (TOTP)** — 로그인 시 6자리 OTP 발송 (유효기간 10분)
- OTP 만료 시 자동 로그아웃 처리
- 비밀번호 찾기 / 재설정 이메일 발송
- 계정 정지 / 탈퇴 24시간 유예 (재로그인으로 철회 가능)

### ⚙️ 개인화 설정
- 기준 통화 선택 (KRW · USD · JPY)
- 언어 설정 (한국어 · English · 日本語)
- 프라이버시 모드 (금액 블러 처리)
- 알림 활성화 / 비활성화
- 자산 데이터 CSV 내보내기 / 초기화

### 📢 커뮤니티 게시판
- 자유 · 정보 · 질문 · 제안 태그
- 댓글 · 좋아요 · 신고 · 익명 게시 지원
- 공지사항 / 패치노트 관리 (관리자)

### 🛠 관리자 패널
- 사용자 신고 관리 및 계정 정지 / 해제
- 1:1 고객 문의 답변

---

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 · shadcn/ui (Radix UI) |
| **Auth** | NextAuth v5 (Google OAuth · Credentials) |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL (Supabase) |
| **Email** | Resend |
| **Chart** | Recharts |
| **Form** | React Hook Form |
| **External API** | Yahoo Finance 2 (주식) · Upbit (암호화폐) |
| **Push** | Web Push (웹 푸시 알림) |
| **Storage** | AWS S3 |
| **Deploy** | Vercel · 커스텀 도메인 |

---

## 🏗 아키텍처

```
app/
├── (dashboard)/          # 인증된 사용자 레이아웃
│   ├── page.tsx          # 자산 대시보드
│   ├── history/          # 자산 히스토리
│   ├── cashflow/         # 현금흐름 캘린더
│   ├── property/         # 부동산 관리
│   ├── tax/              # 세금 시뮬레이터
│   ├── board/            # 커뮤니티 게시판
│   ├── settings/         # 사용자 설정
│   └── admin/            # 관리자 패널
├── actions/              # Server Actions (API 대체)
├── api/                  # Route Handlers
├── login / register /    # 인증 페이지
└── verify-2fa/           # 2FA 인증 페이지

services/                 # 비즈니스 로직
├── taxService.ts         # 세금 계산 엔진
├── propertyService.ts    # 부동산 투자 지표
├── historyService.ts     # 자산 스냅샷 관리
├── cashFlowService.ts    # 현금흐름 계산
├── price-service.ts      # 외부 시세 API
└── userService.ts        # 사용자 관리

repositories/             # DB 접근 추상화 (Repository 패턴)
├── asset-repository.ts
├── property-repository.ts
├── user-repository.ts
└── board-repository.ts
```

---

## 🚀 로컬 실행

### 1. 저장소 클론

```bash
git clone https://github.com/KOR-Giseong/asset-manager.git
cd asset-manager
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

`.env` 파일을 생성하고 아래 항목을 채워주세요:

```env
# Database (Supabase)
DATABASE_URL=

# NextAuth
AUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Resend (이메일)
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. DB 마이그레이션

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인하세요.

---

## 📄 라이선스

MIT License © 2025 [KOR-Giseong](https://github.com/KOR-Giseong)
