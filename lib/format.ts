// =========================================
// 금액 포맷팅 유틸리티
// =========================================

/**
 * 원화 기본 포맷 (Intl.NumberFormat)
 * @example formatKRW(1000000) => "₩1,000,000"
 */
export function formatKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * 숫자를 한글 단위로 포맷팅 (원, 만, 억, 조)
 * @example formatKRWWithUnit(123456789) => "1억 2,345만 6,789원"
 * @example formatKRWWithUnit(50000000) => "5,000만원"
 */
export function formatKRWWithUnit(
  value: number | null | undefined,
  options: {
    /** 0원일 때 표시할 텍스트 */
    zeroText?: string;
    /** 소수점 이하 자릿수 (기본: 0) */
    decimals?: number;
    /** 접미사 (기본: "원") */
    suffix?: string;
    /** 양수일 때 + 표시 여부 */
    showPlus?: boolean;
    /** 간소화 모드: 억 단위 이상만 한글로 */
    compact?: boolean;
  } = {}
): string {
  const {
    zeroText = "0원",
    suffix = "원",
    showPlus = false,
    compact = false,
  } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return zeroText;
  }

  if (value === 0) {
    return zeroText;
  }

  const isNegative = value < 0;
  const absValue = Math.abs(value);

  const jo = Math.floor(absValue / 1_000_000_000_000); // 조
  const eok = Math.floor((absValue % 1_000_000_000_000) / 100_000_000); // 억
  const man = Math.floor((absValue % 100_000_000) / 10_000); // 만
  const won = Math.floor(absValue % 10_000); // 원

  const parts: string[] = [];

  // 간소화 모드: 억 이상만 한글로
  if (compact && absValue >= 100_000_000) {
    const eokValue = absValue / 100_000_000;
    const formatted = eokValue >= 10
      ? Math.floor(eokValue).toLocaleString("ko-KR")
      : eokValue.toFixed(1);
    const prefix = isNegative ? "-" : showPlus ? "+" : "";
    return `${prefix}${formatted}억${suffix}`;
  }

  if (jo > 0) {
    parts.push(`${jo.toLocaleString("ko-KR")}조`);
  }
  if (eok > 0) {
    parts.push(`${eok.toLocaleString("ko-KR")}억`);
  }
  if (man > 0) {
    parts.push(`${man.toLocaleString("ko-KR")}만`);
  }
  if (won > 0 || parts.length === 0) {
    // 1만 미만이거나, 정확히 떨어지지 않는 경우
    if (won > 0 || parts.length === 0) {
      parts.push(`${won.toLocaleString("ko-KR")}`);
    }
  }

  const prefix = isNegative ? "-" : showPlus ? "+" : "";
  return `${prefix}${parts.join(" ")}${suffix}`;
}

/**
 * 간단한 억 단위 포맷터
 * @example formatBillions(350000000) => "3.5억원"
 */
export function formatBillions(value: number | null | undefined): string {
  if (!value || value === 0) return "0원";

  if (value >= 100_000_000) {
    const billions = value / 100_000_000;
    return `${billions % 1 === 0 ? billions : billions.toFixed(1)}억원`;
  }

  if (value >= 10_000) {
    const manwon = value / 10_000;
    return `${manwon % 1 === 0 ? manwon.toLocaleString() : manwon.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}만원`;
  }

  return `${value.toLocaleString()}원`;
}

/**
 * 차트 Y축용 간소화 포맷터 (억/만 단위)
 * @example formatYAxis(350000000) => "3.5억"
 * @example formatYAxis(50000) => "5만"
 */
export function formatYAxis(value: number): string {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1)}억`;
  }
  if (value >= 10_000) {
    return `${(value / 10_000).toFixed(0)}만`;
  }
  return value.toLocaleString();
}
