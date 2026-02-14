// =========================================
// 반응형 디자인 유틸리티
// =========================================
// 모바일 퍼스트 반응형 클래스 및 상수 정의
// 모든 컴포넌트에서 일관된 반응형 스타일 적용
// =========================================

// =========================================
// 브레이크포인트 (Tailwind 기본값 기준)
// =========================================
// sm: 640px, md: 768px, lg: 1024px, xl: 1280px

// =========================================
// 터치 친화적 최소 사이즈 (44px 권장)
// =========================================

export const TOUCH_TARGET = {
  minHeight: "min-h-[44px]",
  minWidth: "min-w-[44px]",
  padding: "p-3", // 12px
} as const;

// =========================================
// 반응형 간격 (Spacing)
// =========================================

export const RESPONSIVE_SPACING = {
  // 컨테이너 패딩
  containerPadding: "px-4 sm:px-6 lg:px-8",
  // 섹션 간격
  sectionGap: "gap-4 sm:gap-6",
  // 카드 내부 패딩
  cardPadding: "p-4 sm:p-6",
  // 그리드 간격
  gridGap: "gap-3 sm:gap-4 lg:gap-6",
} as const;

// =========================================
// 반응형 텍스트 크기
// =========================================

export const RESPONSIVE_TEXT = {
  // 페이지 타이틀
  pageTitle: "text-xl sm:text-2xl lg:text-3xl",
  // 섹션 타이틀
  sectionTitle: "text-base sm:text-lg",
  // 금액 (큰)
  amountLarge: "text-2xl sm:text-3xl lg:text-4xl",
  // 금액 (중간)
  amountMedium: "text-lg sm:text-xl lg:text-2xl",
  // 금액 (작은)
  amountSmall: "text-sm sm:text-base",
  // 본문
  body: "text-sm sm:text-base",
  // 캡션
  caption: "text-xs sm:text-sm",
} as const;

// =========================================
// 반응형 그리드 레이아웃
// =========================================

export const RESPONSIVE_GRID = {
  // 2컬럼 → 1컬럼 (모바일)
  cols2: "grid-cols-1 sm:grid-cols-2",
  // 3컬럼 → 1컬럼 (모바일)
  cols3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  // 4컬럼 → 2컬럼 (모바일)
  cols4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
  // 통계 카드용 (4컬럼 → 2컬럼)
  statCards: "grid-cols-2 sm:grid-cols-4",
} as const;

// =========================================
// 반응형 Flex 레이아웃
// =========================================

export const RESPONSIVE_FLEX = {
  // 가로 → 세로 (모바일)
  rowToCol: "flex-col sm:flex-row",
  // 세로 → 가로 (md 이상)
  colToRow: "flex-col md:flex-row",
  // 아이템 정렬
  centerBetween: "items-start sm:items-center justify-between",
} as const;

// =========================================
// 텍스트 생략 처리
// =========================================

export const TRUNCATE = {
  // 한 줄 생략
  single: "truncate",
  // 두 줄 생략
  twoLines: "line-clamp-2",
  // 세 줄 생략
  threeLines: "line-clamp-3",
} as const;

// =========================================
// 반응형 테이블 → 카드 전환
// =========================================

export const RESPONSIVE_TABLE = {
  // 테이블 (md 이상에서만 표시)
  tableWrapper: "hidden md:block",
  // 카드 리스트 (모바일에서만 표시)
  cardList: "block md:hidden",
} as const;

// =========================================
// 차트 컨테이너 높이
// =========================================

export const CHART_HEIGHT = {
  small: "h-[200px] sm:h-[250px]",
  medium: "h-[250px] sm:h-[300px]",
  large: "h-[300px] sm:h-[350px] lg:h-[400px]",
} as const;

// =========================================
// 버튼 크기
// =========================================

export const BUTTON_SIZE = {
  // 터치 친화적 기본 버튼
  touch: "h-11 px-4 sm:h-10 sm:px-4",
  // 아이콘 버튼
  icon: "h-11 w-11 sm:h-10 sm:w-10",
} as const;

// =========================================
// 헬퍼 함수: 클래스 조합
// =========================================

/**
 * 여러 클래스를 공백으로 연결
 * undefined/null/false 값은 필터링
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// =========================================
// 금액 포맷팅 (모바일용 축약)
// =========================================

/**
 * 모바일에서 긴 금액을 축약
 * @example formatCompactAmount(123456789) => "1.2억"
 */
export function formatCompactAmount(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억`;
  }
  if (value >= 10000000) {
    return `${(value / 10000).toFixed(0)}만`;
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}만`;
  }
  return value.toLocaleString("ko-KR");
}
