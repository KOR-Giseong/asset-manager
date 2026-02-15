// =========================================
// 세금 설정 파일 (연도별 세법 상수)
// =========================================
// 새 세법이 적용되면 TAX_CONFIG_YYYY를 추가하고
// DEFAULT_TAX_CONFIG만 교체하면 됩니다.

import type { 
  TaxConfig, 
  MultiHomeAcquisitionTaxConfig, 
  MultiHomeCapitalGainsConfig 
} from "@/types/tax";

// =========================================
// 다주택자 취득세 설정 (2026년)
// =========================================

export const MULTI_HOME_ACQUISITION_TAX_2026: MultiHomeAcquisitionTaxConfig = {
  // 조정대상지역
  regulated: {
    twoHome: 0.08,      // 2주택 8%
    threeHome: 0.12,    // 3주택 이상 12%
  },
  // 비조정대상지역
  nonRegulated: {
    twoHome: 0,         // 2주택: 1주택과 동일 (가격별 1~3%)
    threeHome: 0.08,    // 3주택 8%
    fourPlusHome: 0.12, // 4주택 이상 12%
  },
};

// =========================================
// 다주택자 양도세 중과 설정 (2026년)
// =========================================

export const MULTI_HOME_CAPITAL_GAINS_2026: MultiHomeCapitalGainsConfig = {
  // 조정대상지역 중과세율 (기본세율에 추가)
  regulated: {
    twoHomeSurtax: 0.20,   // 2주택 +20%p
    threeHomeSurtax: 0.30, // 3주택 이상 +30%p
  },
  // 장기보유특별공제 제한
  longTermDeduction: {
    regulatedMultiHome: false,            // 조정지역 다주택: 배제
    nonRegulatedMultiHomeMaxRate: 0.30,   // 비조정지역 다주택: 일반 30%
  },
};

export const DEFAULT_MULTI_HOME_ACQUISITION_TAX = MULTI_HOME_ACQUISITION_TAX_2026;
export const DEFAULT_MULTI_HOME_CAPITAL_GAINS = MULTI_HOME_CAPITAL_GAINS_2026;

// =========================================
// 2026년 세금 설정
// =========================================

export const TAX_CONFIG_2026: TaxConfig = {
  year: 2026,

  // 종합소득세 세율 구간
  incomeTaxBrackets: [
    { min: 0, max: 14_000_000, rate: 0.06, deduction: 0 },
    { min: 14_000_000, max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
    { min: 50_000_000, max: 88_000_000, rate: 0.24, deduction: 5_760_000 },
    { min: 88_000_000, max: 150_000_000, rate: 0.35, deduction: 15_440_000 },
    { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_940_000 },
    { min: 300_000_000, max: 500_000_000, rate: 0.40, deduction: 25_940_000 },
    { min: 500_000_000, max: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
    { min: 1_000_000_000, max: Infinity, rate: 0.45, deduction: 65_940_000 },
  ],

  // 양도소득세 세율 구간 (종합소득세와 동일 8구간)
  capitalGainsTaxBrackets: [
    { min: 0, max: 14_000_000, rate: 0.06, deduction: 0 },
    { min: 14_000_000, max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
    { min: 50_000_000, max: 88_000_000, rate: 0.24, deduction: 5_760_000 },
    { min: 88_000_000, max: 150_000_000, rate: 0.35, deduction: 15_440_000 },
    { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_940_000 },
    { min: 300_000_000, max: 500_000_000, rate: 0.40, deduction: 25_940_000 },
    { min: 500_000_000, max: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
    { min: 1_000_000_000, max: Infinity, rate: 0.45, deduction: 65_940_000 },
  ],

  // 장기보유특별공제율 (비 1주택용 - 레거시)
  longTermDeductionRates: [
    { years: 3, rate: 0.06 },
    { years: 4, rate: 0.08 },
    { years: 5, rate: 0.10 },
    { years: 6, rate: 0.12 },
    { years: 7, rate: 0.14 },
    { years: 8, rate: 0.16 },
    { years: 9, rate: 0.18 },
    { years: 10, rate: 0.20 },
    { years: 11, rate: 0.22 },
    { years: 12, rate: 0.24 },
    { years: 13, rate: 0.26 },
    { years: 14, rate: 0.28 },
    { years: 15, rate: 0.30 },
  ],

  // 장기보유특별공제 설정 (1세대 1주택)
  // 실제 세법: 보유 연 4%(최대 40%) + 거주 연 4%(최대 40%) = 최대 80%
  longTermDeductionConfig: {
    holdingRatePerYear: 0.04,    // 보유기간 연 4%
    holdingMinYears: 3,          // 3년 이상 보유 시 적용
    holdingMaxYears: 10,         // 10년까지
    holdingMaxRate: 0.40,        // 최대 40%
    residenceRatePerYear: 0.04,  // 거주기간 연 4%
    residenceMinYears: 2,        // 2년 이상 거주 시 적용
    residenceMaxYears: 10,       // 10년까지
    residenceMaxRate: 0.40,      // 최대 40%
    totalMaxRate: 0.80,          // 합계 최대 80%
  },

  // 보험료율 (2026년)
  healthInsuranceRate: 0.0719,       // 7.09% → 7.19%
  longTermCareRate: 0.1314,          // 12.95% → 13.14%
  incomeMonthlyInsuranceRate: 0.0719,

  // 각종 한도 및 기준값
  limits: {
    irpMaxDeposit: 9_000_000,
    isaMaxDeposit: 40_000_000,          // 2,000만원 → 4,000만원
    isaNonTaxableGeneral: 5_000_000,    // 200만원 → 500만원
    isaNonTaxableLowIncome: 10_000_000, // 400만원 → 1,000만원
    lowIncomeSalaryThreshold: 50_000_000,
    irpLowIncomeThreshold: 55_000_000,
    irpDeductionRateHigh: 0.132,
    irpDeductionRateLow: 0.165,
    isaNormalTaxRate: 0.154,
    isaSeparateTaxRate: 0.099,
    oneHomeTaxExemptLimit: 1_200_000_000,
    oneHomeMinHoldingYears: 2,
    basicDeduction: 1_800_000,          // 150만원 → 180만원
    capitalGainsBasicDeduction: 2_500_000,
    foreignStockBasicDeduction: 2_500_000,
    foreignStockTaxRate: 0.22,
    localTaxRate: 0.10,
    healthInsuranceNonSalaryThreshold: 20_000_000,
    rentalExpenseRate: 0.50,
    localEducationTaxRate: 0.10,
    specialTaxRate: 0.10,
    specialTaxAreaThreshold: 85,
    lifeFirstHomePriceLimit: 1_200_000_000,   // 12억원 이하 주택
    lifeFirstHomeReductionLimit: 2_000_000,   // 200만원 한도 감면
  },
};

// 현재 적용 중인 세금 설정
export const DEFAULT_TAX_CONFIG = TAX_CONFIG_2026;
