// =========================================
// 부동산 서비스 - 투자 지표 계산 엔진
// =========================================

import type {
  Property,
  EquityInfo,
  CashFlowInfo,
  ROIInfo,
  LTVInfo,
  PropertyInvestmentSummary,
  ContractType,
} from "@/types/property";

// =========================================
// 상수
// =========================================

const LTV_WARNING_THRESHOLD = 70;  // LTV 경고 기준 (%)
const LTV_DANGER_THRESHOLD = 80;   // LTV 위험 기준 (%)
const EXPIRY_WARNING_DAYS = 90;    // 계약 만기 경고 (일)

// =========================================
// 순자산 (Equity) 계산
// =========================================

export function calculateEquity(property: Property): EquityInfo {
  const { currentPrice, loanPrincipal, deposit, contractType } = property;

  // 임대인(전세/월세 놓음)인 경우: 보증금은 부채
  // 임차인(전세/월세)인 경우: 보증금은 내가 걸어둔 자산이므로 부채 아님
  const isLandlord = contractType === "RENTAL_JEONSE" || contractType === "RENTAL_MONTHLY";
  
  // 총 부채 = 대출 + (임대인인 경우 보증금)
  const totalLiability = loanPrincipal + (isLandlord ? deposit : 0);
  
  // 순자산 = 시세 - 총 부채
  const equity = currentPrice - totalLiability;

  return { equity, totalLiability };
}

// =========================================
// 현금흐름 (Cash Flow) 계산
// =========================================

export function calculateCashFlow(property: Property): CashFlowInfo {
  const { loanPrincipal, loanInterestRate, monthlyRent, maintenanceFee, contractType } = property;

  // 월 대출이자 = 대출원금 × (연이율 / 12 / 100)
  const monthlyLoanInterest = loanPrincipal * (loanInterestRate / 12 / 100);

  let monthlyCashFlow: number;

  // 계약 유형에 따른 현금흐름 계산
  switch (contractType) {
    case "OWNED":
      // 자가: 지출만 있음 (대출이자 + 관리비)
      monthlyCashFlow = -(monthlyLoanInterest + maintenanceFee);
      break;

    case "JEONSE":
    case "MONTHLY":
      // 임차인: 월세 + 관리비 지출
      monthlyCashFlow = -(monthlyRent + maintenanceFee);
      break;

    case "RENTAL_JEONSE":
      // 전세 놓음: 현금 수입 없음, 대출이자만 지출
      monthlyCashFlow = -monthlyLoanInterest;
      break;

    case "RENTAL_MONTHLY":
      // 월세 놓음: 월세 수입 - 대출이자 - 관리비(공용)
      monthlyCashFlow = monthlyRent - monthlyLoanInterest - maintenanceFee;
      break;

    default:
      monthlyCashFlow = 0;
  }

  const annualCashFlow = monthlyCashFlow * 12;

  return { monthlyCashFlow, annualCashFlow, monthlyLoanInterest };
}

// =========================================
// 수익률 (ROI) 계산
// =========================================

export function calculateROI(property: Property): ROIInfo {
  const { purchasePrice, acquisitionCost, loanPrincipal, deposit, contractType } = property;

  // 임대인인지 확인
  const isLandlord = contractType === "RENTAL_JEONSE" || contractType === "RENTAL_MONTHLY";

  // 실투자금 계산
  // 임대인: 매수가 + 부대비용 - 대출 - 받은 보증금
  // 자가: 매수가 + 부대비용 - 대출
  const actualInvestment = purchasePrice + acquisitionCost - loanPrincipal - (isLandlord ? deposit : 0);

  // 연 순수익 계산 (현금흐름 기반)
  const cashFlow = calculateCashFlow(property);
  const annualNetIncome = cashFlow.annualCashFlow;

  // ROI = (연 순수익 / 실투자금) × 100
  const roi = actualInvestment > 0 ? (annualNetIncome / actualInvestment) * 100 : 0;

  return { actualInvestment, annualNetIncome, roi };
}

// =========================================
// LTV (Loan to Value) 계산
// =========================================

export function calculateLTV(property: Property): LTVInfo {
  const { currentPrice, loanPrincipal } = property;

  // LTV = (대출원금 / 현재시세) × 100
  const ltv = currentPrice > 0 ? (loanPrincipal / currentPrice) * 100 : 0;

  return {
    ltv,
    isWarning: ltv >= LTV_WARNING_THRESHOLD && ltv < LTV_DANGER_THRESHOLD,
    isDanger: ltv >= LTV_DANGER_THRESHOLD,
  };
}

// =========================================
// 계약 만기 계산
// =========================================

export function calculateDaysUntilExpiry(contractEndDate: Date | null): number | null {
  if (!contractEndDate) return null;

  const now = new Date();
  const expiry = new Date(contractEndDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function isExpiryWarning(contractEndDate: Date | null): boolean {
  const days = calculateDaysUntilExpiry(contractEndDate);
  if (days === null) return false;
  return days > 0 && days <= EXPIRY_WARNING_DAYS;
}

// =========================================
// 통합 투자 요약
// =========================================

export function calculateInvestmentSummary(property: Property): PropertyInvestmentSummary {
  return {
    equity: calculateEquity(property),
    cashFlow: calculateCashFlow(property),
    roi: calculateROI(property),
    ltv: calculateLTV(property),
    daysUntilExpiry: calculateDaysUntilExpiry(property.contractEndDate),
    isExpiryWarning: isExpiryWarning(property.contractEndDate),
  };
}

// =========================================
// 전체 부동산 포트폴리오 통계
// =========================================

export interface PortfolioSummary {
  totalProperties: number;       // 총 부동산 수
  totalCurrentValue: number;     // 총 시가
  totalEquity: number;           // 총 순자산
  totalLiability: number;        // 총 부채
  totalMonthlyCashFlow: number;  // 총 월 현금흐름
  averageLTV: number;            // 평균 LTV
  expiringCount: number;         // 만기 임박 수
}

export function calculatePortfolioSummary(properties: Property[]): PortfolioSummary {
  if (properties.length === 0) {
    return {
      totalProperties: 0,
      totalCurrentValue: 0,
      totalEquity: 0,
      totalLiability: 0,
      totalMonthlyCashFlow: 0,
      averageLTV: 0,
      expiringCount: 0,
    };
  }

  let totalCurrentValue = 0;
  let totalEquity = 0;
  let totalLiability = 0;
  let totalMonthlyCashFlow = 0;
  let totalLTV = 0;
  let expiringCount = 0;

  for (const property of properties) {
    const equity = calculateEquity(property);
    const cashFlow = calculateCashFlow(property);
    const ltv = calculateLTV(property);

    totalCurrentValue += property.currentPrice;
    totalEquity += equity.equity;
    totalLiability += equity.totalLiability;
    totalMonthlyCashFlow += cashFlow.monthlyCashFlow;
    totalLTV += ltv.ltv;

    if (isExpiryWarning(property.contractEndDate)) {
      expiringCount++;
    }
  }

  return {
    totalProperties: properties.length,
    totalCurrentValue,
    totalEquity,
    totalLiability,
    totalMonthlyCashFlow,
    averageLTV: totalLTV / properties.length,
    expiringCount,
  };
}

// =========================================
// 유틸리티: 계약 유형 판별
// =========================================

export function isLandlord(contractType: ContractType): boolean {
  return contractType === "RENTAL_JEONSE" || contractType === "RENTAL_MONTHLY";
}

export function isTenant(contractType: ContractType): boolean {
  return contractType === "JEONSE" || contractType === "MONTHLY";
}

export function isOwner(contractType: ContractType): boolean {
  return contractType === "OWNED";
}
