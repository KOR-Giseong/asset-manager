// =========================================
// 세금 계산 서비스 (2026년 세법 기준)
// =========================================

import type {
  IsaIrpInput,
  IsaIrpResult,
  IncomeTaxInput,
  IncomeTaxResult,
  PropertyAcquisitionTaxInput,
  PropertyAcquisitionTaxResult,
  PropertyCapitalGainsTaxInput,
  PropertyCapitalGainsTaxResult,
  ForeignStockTaxInput,
  ForeignStockTaxResult,
  HealthInsuranceInput,
  HealthInsuranceResult,
  TaxBracket,
  TotalTaxReport,
  TaxComparisonData,
  TaxPieData,
} from "@/types/tax";

// =========================================
// 2026년 세율 상수
// =========================================

// 종합소득세 세율 구간 (2026년)
const INCOME_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 14_000_000, rate: 0.06, deduction: 0 },
  { min: 14_000_000, max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { min: 50_000_000, max: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { min: 88_000_000, max: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { min: 300_000_000, max: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { min: 500_000_000, max: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { min: 1_000_000_000, max: Infinity, rate: 0.45, deduction: 65_940_000 },
];

// 양도소득세 세율 구간 (2026년)
const CAPITAL_GAINS_TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 14_000_000, rate: 0.06, deduction: 0 },
  { min: 14_000_000, max: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { min: 50_000_000, max: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { min: 88_000_000, max: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { min: 150_000_000, max: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { min: 300_000_000, max: 500_000_000, rate: 0.40, deduction: 25_940_000 },
  { min: 500_000_000, max: Infinity, rate: 0.42, deduction: 35_940_000 },
];

// 장기보유특별공제율 (1세대 1주택)
const LONG_TERM_DEDUCTION_RATES: { years: number; rate: number }[] = [
  { years: 3, rate: 0.24 }, // 3년: 24%
  { years: 4, rate: 0.32 }, // 4년: 32%
  { years: 5, rate: 0.40 }, // 5년: 40%
  { years: 6, rate: 0.48 }, // 6년: 48%
  { years: 7, rate: 0.56 }, // 7년: 56%
  { years: 8, rate: 0.64 }, // 8년: 64%
  { years: 9, rate: 0.72 }, // 9년: 72%
  { years: 10, rate: 0.80 }, // 10년 이상: 80%
];

// 건강보험료율 (2026년 예상)
const HEALTH_INSURANCE_RATE = 0.0709; // 7.09%
const LONG_TERM_CARE_RATE = 0.1295; // 장기요양보험료율 12.95%
const INCOME_MONTHLY_INSURANCE_RATE = 0.0709; // 소득월액보험료율

// =========================================
// ISA/IRP 절세 계산
// =========================================

export function calculateIsaIrpBenefit(input: IsaIrpInput): IsaIrpResult {
  const { annualSalary, isaDeposit, irpDeposit, expectedReturn } = input;

  // IRP 세액공제율: 연봉 5,500만원 이하 16.5%, 초과 13.2%
  const irpDeductionRate = annualSalary <= 55_000_000 ? 0.165 : 0.132;
  
  // IRP 세액공제 한도: 900만원
  const irpMaxDeduction = Math.min(irpDeposit, 9_000_000);
  const irpDeduction = irpMaxDeduction * irpDeductionRate;

  // ISA 비과세 한도: 일반 200만원, 서민형 400만원 (연봉 5,000만원 이하)
  const isaNonTaxableLimit = annualSalary <= 50_000_000 ? 4_000_000 : 2_000_000;
  
  // ISA 예상 수익
  const isaExpectedProfit = isaDeposit * (expectedReturn / 100);
  
  // ISA 절세 효과: 비과세 한도 내 수익은 비과세, 초과분은 9.9% 분리과세
  // 일반 과세 시 15.4% vs 분리과세 9.9% = 5.5% 절세
  let isaTaxSaved = 0;
  if (isaExpectedProfit <= isaNonTaxableLimit) {
    // 전액 비과세
    isaTaxSaved = isaExpectedProfit * 0.154; // 일반과세 시 납부할 세금
  } else {
    // 비과세분 + 분리과세 절세분
    const nonTaxableSaving = isaNonTaxableLimit * 0.154;
    const separateTaxSaving = (isaExpectedProfit - isaNonTaxableLimit) * (0.154 - 0.099);
    isaTaxSaved = nonTaxableSaving + separateTaxSaving;
  }

  return {
    irpDeduction,
    irpDeductionRate,
    isaNonTaxableLimit,
    isaTaxSaved,
    totalTaxSaved: irpDeduction + isaTaxSaved,
  };
}

// =========================================
// 근로소득공제 계산
// =========================================

function calculateSalaryDeduction(salary: number): number {
  if (salary <= 5_000_000) {
    return salary * 0.7;
  } else if (salary <= 15_000_000) {
    return 3_500_000 + (salary - 5_000_000) * 0.4;
  } else if (salary <= 45_000_000) {
    return 7_500_000 + (salary - 15_000_000) * 0.15;
  } else if (salary <= 100_000_000) {
    return 12_000_000 + (salary - 45_000_000) * 0.05;
  } else {
    return 14_750_000 + (salary - 100_000_000) * 0.02;
  }
}

// =========================================
// 종합소득세 계산
// =========================================

export function calculateIncomeTax(input: IncomeTaxInput): IncomeTaxResult {
  const { annualSalary, rentalIncome, otherIncome } = input;

  // 1. 근로소득 계산
  const salaryDeduction = calculateSalaryDeduction(annualSalary);
  const netSalary = Math.max(0, annualSalary - salaryDeduction);

  // 2. 임대소득 계산 (분리과세 or 종합과세)
  // 연 2,000만원 이하: 분리과세 선택 가능 (필요경비 50% 인정)
  // 여기서는 종합과세 기준으로 계산 (필요경비 50%)
  const rentalDeduction = rentalIncome * 0.5;
  const netRental = rentalIncome - rentalDeduction;

  // 3. 종합소득금액
  const totalIncome = netSalary + netRental + otherIncome;

  // 4. 소득공제 (기본공제 150만원)
  const basicDeduction = 1_500_000;
  const taxableIncome = Math.max(0, totalIncome - basicDeduction);

  // 5. 세율 적용
  let calculatedTax = 0;
  let taxBracket = "";
  
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      calculatedTax = taxableIncome * bracket.rate - bracket.deduction;
      taxBracket = `${(bracket.rate * 100).toFixed(0)}%`;
    }
  }

  // 6. 지방소득세 (10%)
  const localTax = calculatedTax * 0.1;
  const totalTax = calculatedTax + localTax;

  // 7. 실효세율
  const effectiveRate = totalIncome > 0 ? (totalTax / totalIncome) * 100 : 0;

  return {
    grossSalary: annualSalary,
    salaryDeduction,
    netSalary,
    grossRental: rentalIncome,
    rentalDeduction,
    netRental,
    totalIncome,
    basicDeduction,
    taxableIncome,
    calculatedTax,
    taxBracket,
    effectiveRate,
    localTax,
    totalTax,
  };
}

// =========================================
// 부동산 취득세 계산
// =========================================

export function calculatePropertyAcquisitionTax(
  input: PropertyAcquisitionTaxInput
): PropertyAcquisitionTaxResult {
  const { purchasePrice, isFirstHome, isLifeFirstHome, area } = input;

  let acquisitionTaxRate: number;

  // 1주택자 취득세율 (2026년)
  if (isLifeFirstHome && purchasePrice <= 600_000_000 && area <= 85) {
    // 생애최초 주택: 취득세 면제 (6억 이하, 85㎡ 이하)
    acquisitionTaxRate = 0;
  } else if (isFirstHome) {
    // 1주택자 취득 시
    if (purchasePrice <= 600_000_000) {
      acquisitionTaxRate = 0.01; // 1%
    } else if (purchasePrice <= 900_000_000) {
      acquisitionTaxRate = 0.02; // 2%
    } else {
      acquisitionTaxRate = 0.03; // 3%
    }
  } else {
    // 다주택자 (기본 세율)
    acquisitionTaxRate = 0.04; // 4% (조정대상지역 추가 중과 제외)
  }

  const acquisitionTax = purchasePrice * acquisitionTaxRate;
  
  // 지방교육세: 취득세의 10%
  const localEducationTax = acquisitionTax * 0.1;
  
  // 농어촌특별세: 전용 85㎡ 초과 시 취득세의 10%
  const specialTax = area > 85 ? acquisitionTax * 0.1 : 0;

  const totalTax = acquisitionTax + localEducationTax + specialTax;

  return {
    acquisitionTax,
    acquisitionTaxRate,
    localEducationTax,
    specialTax,
    totalTax,
  };
}

// =========================================
// 부동산 양도세 계산
// =========================================

export function calculatePropertyCapitalGainsTax(
  input: PropertyCapitalGainsTaxInput
): PropertyCapitalGainsTaxResult {
  const { purchasePrice, salePrice, holdingYears, isOneHome, acquisitionCost } = input;

  // 1. 양도차익 계산
  const gain = salePrice - purchasePrice - acquisitionCost;
  
  if (gain <= 0) {
    return {
      gain,
      taxableGain: 0,
      longTermDeduction: 0,
      longTermDeductionRate: 0,
      basicDeduction: 0,
      taxableIncome: 0,
      calculatedTax: 0,
      localTax: 0,
      totalTax: 0,
      isTaxExempt: false,
      exemptReason: "양도차익 없음",
    };
  }

  // 2. 1세대 1주택 비과세 체크 (12억 이하, 2년 이상 보유)
  if (isOneHome && salePrice <= 1_200_000_000 && holdingYears >= 2) {
    return {
      gain,
      taxableGain: 0,
      longTermDeduction: 0,
      longTermDeductionRate: 0,
      basicDeduction: 0,
      taxableIncome: 0,
      calculatedTax: 0,
      localTax: 0,
      totalTax: 0,
      isTaxExempt: true,
      exemptReason: "1세대 1주택 비과세 (12억 이하, 2년 이상 보유)",
    };
  }

  // 3. 12억 초과 시 초과분에 대해서만 과세
  let taxableGain = gain;
  if (isOneHome && salePrice > 1_200_000_000 && holdingYears >= 2) {
    // 12억 초과분 비율만 과세
    const taxableRatio = (salePrice - 1_200_000_000) / salePrice;
    taxableGain = gain * taxableRatio;
  }

  // 4. 장기보유특별공제 (1세대 1주택, 3년 이상 보유)
  let longTermDeductionRate = 0;
  if (isOneHome && holdingYears >= 3) {
    for (const item of LONG_TERM_DEDUCTION_RATES) {
      if (holdingYears >= item.years) {
        longTermDeductionRate = item.rate;
      }
    }
  }
  
  const longTermDeduction = taxableGain * longTermDeductionRate;
  const afterLongTermDeduction = taxableGain - longTermDeduction;

  // 5. 기본공제 (250만원)
  const basicDeduction = 2_500_000;
  const taxableIncome = Math.max(0, afterLongTermDeduction - basicDeduction);

  // 6. 세율 적용
  let calculatedTax = 0;
  for (const bracket of CAPITAL_GAINS_TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      calculatedTax = taxableIncome * bracket.rate - bracket.deduction;
    }
  }

  // 7. 지방소득세 (10%)
  const localTax = calculatedTax * 0.1;
  const totalTax = calculatedTax + localTax;

  return {
    gain,
    taxableGain,
    longTermDeduction,
    longTermDeductionRate,
    basicDeduction,
    taxableIncome,
    calculatedTax,
    localTax,
    totalTax,
    isTaxExempt: false,
  };
}

// =========================================
// 해외주식 양도세 계산
// =========================================

export function calculateForeignStockTax(
  input: ForeignStockTaxInput
): ForeignStockTaxResult {
  const { totalGain, totalLoss } = input;

  // 1. 순수익 계산 (손익통산)
  const netGain = Math.max(0, totalGain - totalLoss);

  // 2. 기본공제 (250만원)
  const basicDeduction = 2_500_000;

  // 3. 과세대상 수익
  const taxableGain = Math.max(0, netGain - basicDeduction);

  // 4. 세율: 22% (양도세 20% + 지방소득세 2%)
  const taxRate = 0.22;
  const totalTax = taxableGain * taxRate;

  return {
    netGain,
    basicDeduction,
    taxableGain,
    taxRate,
    totalTax,
  };
}

// =========================================
// 건강보험료 계산
// =========================================

export function calculateHealthInsurance(
  input: HealthInsuranceInput
): HealthInsuranceResult {
  const { annualSalary, rentalIncome, dividendIncome, otherIncome } = input;

  // 1. 기본 직장인 건보료 (본인 부담분 50%)
  const monthlySalary = annualSalary / 12;
  const baseSalaryInsurance = (monthlySalary * HEALTH_INSURANCE_RATE * 0.5);
  const longTermCare = baseSalaryInsurance * LONG_TERM_CARE_RATE;
  const salaryInsurance = baseSalaryInsurance + longTermCare;

  // 2. 소득월액보험료 (근로 외 소득 2,000만원 초과 시)
  const nonSalaryIncome = rentalIncome + dividendIncome + otherIncome;
  const threshold = 20_000_000; // 연 2,000만원

  let excessIncome = 0;
  let additionalInsurance = 0;
  const additionalInsuranceRate = INCOME_MONTHLY_INSURANCE_RATE;

  if (nonSalaryIncome > threshold) {
    excessIncome = nonSalaryIncome - threshold;
    // 소득월액보험료: 초과분의 월할 × 보험료율
    const monthlyExcess = excessIncome / 12;
    additionalInsurance = monthlyExcess * additionalInsuranceRate * 0.5; // 본인 부담 50%
  }

  // 3. 총 건보료
  const totalMonthlyInsurance = salaryInsurance + additionalInsurance;
  const totalAnnualInsurance = totalMonthlyInsurance * 12;

  return {
    salaryInsurance,
    excessIncome,
    additionalInsurance,
    additionalInsuranceRate,
    totalMonthlyInsurance,
    totalAnnualInsurance,
  };
}

// =========================================
// 종합 세금 리포트 생성
// =========================================

export function generateTotalTaxReport(
  annualSalary: number,
  rentalIncome: number,
  propertyValue: number,
  stockValue: number,
  foreignStockGain: number,
  isaDeposit: number = 0,
  irpDeposit: number = 0
): TotalTaxReport {
  // 1. 종합소득세 계산 (절세 전)
  const incomeTaxBefore = calculateIncomeTax({
    annualSalary,
    rentalIncome,
    otherIncome: 0,
  });

  // 2. 건강보험료 계산
  const healthInsurance = calculateHealthInsurance({
    annualSalary,
    rentalIncome,
    dividendIncome: stockValue * 0.02, // 예상 배당수익률 2%
    otherIncome: 0,
  });

  // 3. 해외주식 양도세 계산
  const foreignStockTax = calculateForeignStockTax({
    totalGain: foreignStockGain,
    totalLoss: 0,
  });

  // 4. ISA/IRP 절세 효과 계산
  const isaIrpBenefit = calculateIsaIrpBenefit({
    annualSalary,
    isaDeposit,
    irpDeposit,
    expectedReturn: 5, // 예상 수익률 5%
  });

  // 5. 절세 전 총 세금
  const beforeTotal =
    incomeTaxBefore.totalTax +
    healthInsurance.totalAnnualInsurance +
    foreignStockTax.totalTax;

  // 6. 절세 후 총 세금
  const afterIncomeTax = Math.max(0, incomeTaxBefore.totalTax - isaIrpBenefit.irpDeduction);
  const afterTotal =
    afterIncomeTax +
    healthInsurance.totalAnnualInsurance +
    foreignStockTax.totalTax -
    isaIrpBenefit.isaTaxSaved;

  return {
    input: {
      annualSalary,
      rentalIncome,
      propertyValue,
      stockValue,
      foreignStockGain,
    },
    incomeTax: incomeTaxBefore,
    healthInsurance,
    beforeOptimization: {
      totalTax: beforeTotal,
      breakdown: {
        incomeTax: incomeTaxBefore.totalTax,
        healthInsurance: healthInsurance.totalAnnualInsurance,
        foreignStockTax: foreignStockTax.totalTax,
      },
    },
    afterOptimization: {
      totalTax: afterTotal,
      breakdown: {
        incomeTax: afterIncomeTax,
        healthInsurance: healthInsurance.totalAnnualInsurance,
        foreignStockTax: Math.max(0, foreignStockTax.totalTax - isaIrpBenefit.isaTaxSaved),
      },
      strategies: {
        isaIrpSaving: isaIrpBenefit.totalTaxSaved,
        rentalDeductionSaving: 0,
        otherSaving: 0,
      },
    },
    totalSaving: beforeTotal - afterTotal,
  };
}

// =========================================
// 차트 데이터 생성
// =========================================

export function generateComparisonChartData(
  report: TotalTaxReport
): TaxComparisonData[] {
  return [
    {
      category: "종합소득세",
      before: report.beforeOptimization.breakdown.incomeTax,
      after: report.afterOptimization.breakdown.incomeTax,
    },
    {
      category: "건강보험료",
      before: report.beforeOptimization.breakdown.healthInsurance,
      after: report.afterOptimization.breakdown.healthInsurance,
    },
    {
      category: "해외주식 양도세",
      before: report.beforeOptimization.breakdown.foreignStockTax,
      after: report.afterOptimization.breakdown.foreignStockTax,
    },
  ];
}

export function generatePieChartData(
  totalAssets: number,
  totalTax: number
): TaxPieData[] {
  return [
    { name: "순자산", value: totalAssets - totalTax, color: "#22c55e" },
    { name: "총 세금", value: totalTax, color: "#ef4444" },
  ];
}

// =========================================
// 유틸리티 함수
// =========================================

export function formatTaxRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function formatTaxAmount(amount: number): string {
  if (amount >= 100_000_000) {
    return `${(amount / 100_000_000).toFixed(1)}억원`;
  } else if (amount >= 10_000) {
    return `${(amount / 10_000).toFixed(0)}만원`;
  }
  return `${amount.toLocaleString()}원`;
}
