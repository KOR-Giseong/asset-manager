# 폴더/파일 구조 가이드 (Settings, Board, Admin)

## 1. app/
- settings/
  - page.tsx                // 설정 메인 페이지
  - components/
    - AccountSettings.tsx    // 계정(닉네임, 로그아웃, 탈퇴)
    - PersonalizeSettings.tsx// 개인화(통화, 언어, 잔액숨김)
    - DataSettings.tsx       // 데이터(알림, 내보내기, 초기화)
    - InfoSettings.tsx       // 정보(버전, 공지)
    - DangerZoneModal.tsx    // 위험 작업(초기화, 탈퇴)
    - Sidebar.tsx            // 좌측 카테고리
- board/
  - page.tsx                // 통합 게시판 메인
  - components/
    - BoardList.tsx         // 게시글/공지/패치노트 리스트
    - BoardEditor.tsx       // 글쓰기/수정
    - BoardItem.tsx         // 게시글/공지/패치노트 단일 항목
    - BoardCategoryTabs.tsx // 카테고리 탭(공지/패치/자유)
    - BoardStickyNotice.tsx // 상단 고정 공지/패치노트
    - BoardComment.tsx      // 댓글(확장용)

## 2. actions/
- settings.ts                // 설정 관련 서버 액션
- board.ts                   // 게시판 관련 서버 액션

## 3. repositories/
- user-repository.ts         // User 관련 DB 접근
- post-repository.ts         // Post 관련 DB 접근
- notice-repository.ts       // Notice 관련 DB 접근

## 4. services/
- userService.ts             // User 비즈니스 로직
- boardService.ts            // 게시판(글/공지/패치) 비즈니스 로직

## 5. types/
- user.ts                    // User 타입
- board.ts                   // Post/Notice 타입

---
- 각 컴포넌트는 재사용성/역할별로 분리
- 서버 액션은 인증/권한 체크 후 DB/서비스 계층 호출
- DB 접근은 repository, 비즈니스 로직은 service에 분리
- 타입은 types/에 통합 관리
