<div align="center">

# 💰 Asset Manager

**개인 자산을 한눈에 관리하는 스마트 자산 관리 플랫폼**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?style=flat-square&logo=vercel)](https://asset-ly.com)

[🌐 라이브 데모](https://asset-ly.com) · [🐛 이슈 리포트](https://github.com/KOR-Giseong/asset-manager/issues)

</div>

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 📊 **자산 대시보드** | 전체 자산 현황을 한눈에 시각화 |
| 🏠 **부동산 관리** | 보유 부동산 등록 및 시세 추적 |
| 💸 **현금흐름 추적** | 수입/지출 트랜잭션 관리 |
| 📈 **자산 히스토리** | 자산 변동 이력 및 스냅샷 기록 |
| 🧾 **세금 계산** | 연봉 기반 세금 자동 계산 |
| 🔒 **이중 인증(2FA)** | 이메일 OTP 기반 보안 강화 |
| 🌐 **다국어 / 다통화** | 언어 및 기준 통화 설정 |
| 🔕 **프라이버시 모드** | 민감 금액 정보 블러 처리 |
| 📢 **공지사항 & 커뮤니티** | 자유게시판, 댓글, 좋아요 |
| 🛠️ **관리자 패널** | 사용자 관리, 제재, 문의 답변 |

---

## 🛠 기술 스택

```
Frontend   Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui
Backend    Server Actions · NextAuth v5 · Prisma ORM
Database   PostgreSQL (Supabase)
Auth       Google OAuth · 이메일/비밀번호 · 이메일 2FA (Resend)
Deploy     Vercel · 커스텀 도메인 (asset-ly.com)
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

`.env` 파일을 생성하고 아래 변수를 입력하세요:

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_APP_URL=
```

### 4. DB 마이그레이션

```bash
npx prisma migrate dev
```

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인하세요.

---

## 📁 프로젝트 구조

```
asset-manager/
├── app/
│   ├── (dashboard)/       # 인증 후 메인 레이아웃
│   │   ├── property/      # 부동산 관리
│   │   ├── cashflow/      # 현금흐름
│   │   ├── history/       # 자산 히스토리
│   │   ├── tax/           # 세금 계산
│   │   ├── board/         # 커뮤니티 게시판
│   │   ├── settings/      # 사용자 설정
│   │   └── admin/         # 관리자 패널
│   ├── actions/           # Server Actions
│   └── api/               # API Routes
├── repositories/          # DB 접근 레이어 (Repository 패턴)
├── services/              # 비즈니스 로직
├── prisma/                # DB 스키마 & 마이그레이션
└── components/            # 공통 UI 컴포넌트
```

---

## 📄 라이선스

MIT License © 2025 [KOR-Giseong](https://github.com/KOR-Giseong)
