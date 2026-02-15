# Asset Manager - AI Assistant 지침

> 이 문서는 Claude Code와 GitHub Copilot 모두에서 참조됩니다.
> Mac/Windows 환경에서 작업 시 이 문서를 통해 컨텍스트를 공유합니다.

---

## 프로젝트 정보
- **Repo**: https://github.com/KOR-Giseong/asset-manager.git
- **Stack**: Next.js 14, Prisma, NextAuth (Google login), Tailwind CSS, shadcn/ui
- **Branch**: main
- **환경**: Windows (주 개발), Mac (보조)

---

## 사용자 선호사항
- "깃허브에 올려줘" = auto commit + push to main
- 커밋 메시지는 한국어로 작성
- 대화 언어: 한국어
- **주 코딩 도구**: GitHub Copilot (일반 코드 작성)
- **Claude/Copilot 용도**: 리팩터링, 스파게티 코드 정리, 복잡한 작업, 중요한 아키텍처 변경
- 요청 시 다른 AI가 작성한 코드가 있을 수 있음을 항상 인지할 것

---

## 코딩 컨벤션
- **컴포넌트**: React FC, 화살표 함수 사용
- **스타일**: Tailwind CSS 클래스 우선
- **상태관리**: React Hook 기반
- **API**: Server Actions 패턴 사용 (`app/actions/`)
- **DB**: Prisma ORM, Repository 패턴 (`repositories/`)
- **서비스 레이어**: 비즈니스 로직 분리 (`services/`)

---

## 현재 진행 중인 작업
<!-- 작업을 시작할 때 여기에 기록하고, 완료되면 "완료된 작업"으로 이동 -->

_현재 진행 중인 작업 없음_

---

## 완료된 작업
<!-- 날짜와 함께 완료된 작업 기록 -->

- (초기 설정) 프로젝트 기본 구조 완성

---

## 알려진 이슈 / TODO
<!-- 해결해야 할 문제나 향후 작업 -->

_현재 등록된 이슈 없음_

---

## 아키텍처 결정 사항
<!-- 중요한 설계 결정을 기록 -->

- Repository 패턴으로 DB 접근 추상화
- Server Actions로 API 대체
- 세금 계산 로직 별도 서비스로 분리 (`taxService.ts`)

---

## 세션 간 메모
<!-- Mac ↔ Windows 간 전달 사항, 임시 메모 -->

_전달 사항 없음_
