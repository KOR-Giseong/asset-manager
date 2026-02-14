// =========================================
// Toast 헬퍼 유틸리티
// =========================================
// Server Action과 통합된 toast.promise 래퍼
// =========================================

import { toast } from "sonner";
import type { ExternalToast } from "sonner";

// =========================================
// 한글 금액 단위 포맷터
// =========================================

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
 * @example formatBillions(350000000) => "3.5억"
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

// =========================================
// Toast Promise 래퍼
// =========================================

type PromiseResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface ToastPromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

interface ToastPromiseOptions extends ExternalToast {
  /** Toast ID (중복 방지용) */
  id?: string;
}

/**
 * Server Action을 toast.promise로 감싸는 헬퍼
 * Promise 결과를 반환하며 toast로 상태를 표시합니다.
 * 
 * @example
 * toastPromise(
 *   addAsset(formData),
 *   {
 *     loading: "자산 추가 중...",
 *     success: "자산이 추가되었습니다",
 *     error: "자산 추가 실패"
 *   }
 * );
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: ToastPromiseMessages<T>,
  options?: ToastPromiseOptions
): void {
  toast.promise(promise, {
    loading: messages.loading,
    success: (data) => {
      if (typeof messages.success === "function") {
        return messages.success(data);
      }
      return messages.success;
    },
    error: (err) => {
      if (typeof messages.error === "function") {
        return messages.error(err);
      }
      // PromiseResult 형태의 에러 처리
      if (err && typeof err === "object" && "error" in err) {
        return (err as PromiseResult<unknown>).error || messages.error;
      }
      return messages.error;
    },
    ...options,
  });
}

/**
 * Server Action 결과를 처리하는 toast 헬퍼 (result.success 패턴)
 * 
 * @example
 * const result = await addAsset(formData);
 * handleActionResult(result, {
 *   success: "자산 추가 완료!",
 *   error: "추가 실패"
 * });
 */
export function handleActionResult<T>(
  result: PromiseResult<T>,
  messages: { success: string; error?: string },
  options?: ToastPromiseOptions
): boolean {
  if (result.success) {
    toast.success(messages.success, options);
    return true;
  } else {
    toast.error(result.error || messages.error || "오류가 발생했습니다", options);
    return false;
  }
}

// =========================================
// 미리 정의된 Toast 메시지
// =========================================

export const toastMessages = {
  asset: {
    add: {
      loading: "자산을 추가하고 있습니다...",
      success: "자산이 추가되었습니다",
      error: "자산 추가에 실패했습니다",
    },
    update: {
      loading: "자산을 수정하고 있습니다...",
      success: "자산이 수정되었습니다",
      error: "자산 수정에 실패했습니다",
    },
    delete: {
      loading: "자산을 삭제하고 있습니다...",
      success: "자산이 삭제되었습니다",
      error: "자산 삭제에 실패했습니다",
    },
    refresh: {
      loading: "시세를 갱신하고 있습니다...",
      success: "시세가 갱신되었습니다",
      error: "시세 갱신에 실패했습니다",
    },
  },
  property: {
    add: {
      loading: "부동산을 등록하고 있습니다...",
      success: "부동산이 등록되었습니다",
      error: "부동산 등록에 실패했습니다",
    },
    update: {
      loading: "부동산 정보를 수정하고 있습니다...",
      success: "부동산 정보가 수정되었습니다",
      error: "부동산 수정에 실패했습니다",
    },
    delete: {
      loading: "부동산을 삭제하고 있습니다...",
      success: "부동산이 삭제되었습니다",
      error: "부동산 삭제에 실패했습니다",
    },
    priceUpdate: {
      loading: "시세를 업데이트하고 있습니다...",
      success: "시세가 업데이트되었습니다",
      error: "시세 업데이트에 실패했습니다",
    },
  },
  auth: {
    login: {
      loading: "로그인 중...",
      success: "로그인되었습니다",
      error: "로그인에 실패했습니다",
    },
    logout: {
      loading: "로그아웃 중...",
      success: "로그아웃되었습니다",
      error: "로그아웃에 실패했습니다",
    },
  },
} as const;
