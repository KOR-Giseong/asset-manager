// =========================================
// 세금 설정 파일 (연도별 세법 상수)
// =========================================
// 새 세법이 적용되면 TAX_CONFIG_YYYY를 추가하고
// DEFAULT_TAX_CONFIG만 교체하면 됩니다.

import type { TaxConfig } from "@/types/tax";

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

  // 양도소득세 세율 구간
  capitalGainsTaxBrackets: [
    { min: 0, max: 14_000_000, rate: 0.06, deduction: 0 },
    { min: 14_000_000, max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
    { min: 50_000_000, max: 88_000_000, rate: 0.24, deduction: 5_760_000 },
    { min: 88_000_000, max: 150_000_000, rate: 0.35, deduction: 15_440_000 },
    { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_940_000 },
    { min: 300_000_000, max: 500_000_000, rate: 0.40, deduction: 25_940_000 },
    { min: 500_000_000, max: Infinity, rate: 0.42, deduction: 35_940_000 },
  ],

  // 장기보유특별공제율 (1세대 1주택)
  longTermDeductionRates: [
    { years: 3, rate: 0.24 },
    { years: 4, rate: 0.32 },
    { years: 5, rate: 0.40 },
    { years: 6, rate: 0.48 },
    { years: 7, rate: 0.56 },
    { years: 8, rate: 0.64 },
    { years: 9, rate: 0.72 },
    { years: 10, rate: 0.80 },
  ],

  // 보험료율
  healthInsuranceRate: 0.0709,
  longTermCareRate: 0.1295,
  incomeMonthlyInsuranceRate: 0.0709,

  // 각종 한도 및 기준값
  limits: {
    irpMaxDeposit: 9_000_000,
    isaMaxDeposit: 20_000_000,
    isaNonTaxableGeneral: 2_000_000,
    isaNonTaxableLowIncome: 4_000_000,
    lowIncomeSalaryThreshold: 50_000_000,
    irpLowIncomeThreshold: 55_000_000,
    irpDeductionRateHigh: 0.132,
    irpDeductionRateLow: 0.165,
    isaNormalTaxRate: 0.154,
    isaSeparateTaxRate: 0.099,
    oneHomeTaxExemptLimit: 1_200_000_000,
    oneHomeMinHoldingYears: 2,
    basicDeduction: 1_500_000,
    capitalGainsBasicDeduction: 2_500_000,
    foreignStockBasicDeduction: 2_500_000,
    foreignStockTaxRate: 0.22,
    localTaxRate: 0.10,
    healthInsuranceNonSalaryThreshold: 20_000_000,
    rentalExpenseRate: 0.50,
    localEducationTaxRate: 0.10,
    specialTaxRate: 0.10,
    specialTaxAreaThreshold: 85,
    lifeFirstHomeExemptPriceLimit: 600_000_000,
    lifeFirstHomeExemptAreaLimit: 85,
  },
};

// 현재 적용 중인 세금 설정
export const DEFAULT_TAX_CONFIG = TAX_CONFIG_2026;
