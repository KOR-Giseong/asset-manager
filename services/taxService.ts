// =========================================
// 세금 계산 서비스
// =========================================
// 세율/한도 등 상수는 TaxConfig에서 관리합니다.
// 새 세법 적용 시 lib/tax-config.ts만 수정하면 됩니다.

import type {
  TaxConfig,
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
  TotalTaxReport,
  TotalTaxReportInput,
  TaxComparisonData,
  TaxPieData,
  MultiHomeAcquisitionTaxConfig,
  MultiHomeCapitalGainsConfig,
  HousingCount,
} from "@/types/tax";
import { 
  DEFAULT_TAX_CONFIG, 
  DEFAULT_MULTI_HOME_ACQUISITION_TAX,
  DEFAULT_MULTI_HOME_CAPITAL_GAINS,
} from "@/lib/tax-config";

// =========================================
// ISA/IRP 절세 계산
// =========================================

export function calculateIsaIrpBenefit(
  input: IsaIrpInput,
  config: TaxConfig = DEFAULT_TAX_CONFIG
): IsaIrpResult {
  const { annualSalary, isaDeposit, irpDeposit, expectedReturn } = input;
  const { limits } = config;

  // IRP 세액공제율: 기준 연봉 이하 16.5%, 초과 13.2%
  const irpDeductionRate =
    annualSalary <= limits.irpLowIncomeThreshold
      ? limits.irpDeductionRateLow
      : limits.irpDeductionRateHigh;

  // IRP 세액공제 한도
  const irpMaxDeduction = Math.min(irpDeposit, limits.irpMaxDeposit);
  const irpDeduction = irpMaxDeduction * irpDeductionRate;

  // ISA 비과세 한도: 일반 vs 서민형
  const isaNonTaxableLimit =
    annualSalary <= limits.lowIncomeSalaryThreshold
      ? limits.isaNonTaxableLowIncome
      : limits.isaNonTaxableGeneral;

  // ISA 예상 수익
  const isaExpectedProfit = isaDeposit * (expectedReturn / 100);

  // ISA 절세 효과
  let isaTaxSaved = 0;
  if (isaExpectedProfit <= isaNonTaxableLimit) {
    isaTaxSaved = isaExpectedProfit * limits.isaNormalTaxRate;
  } else {
    const nonTaxableSaving = isaNonTaxableLimit * limits.isaNormalTaxRate;
    const separateTaxSaving =
      (isaExpectedProfit - isaNonTaxableLimit) *
      (limits.isaNormalTaxRate - limits.isaSeparateTaxRate);
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

export function calculateIncomeTax(
  input: IncomeTaxInput,
  config: TaxConfig = DEFAULT_TAX_CONFIG
): IncomeTaxResult {
  const { annualSalary, rentalIncome, otherIncome } = input;
  const { limits } = config;

  // 1. 근로소득 계산
  const salaryDeduction = calculateSalaryDeduction(annualSalary);
  const netSalary = Math.max(0, annualSalary - salaryDeduction);

  // 2. 임대소득 계산
  const rentalDeduction = rentalIncome * limits.rentalExpenseRate;
  const netRental = rentalIncome - rentalDeduction;

  // 3. 종합소득금액
  const totalIncome = netSalary + netRental + otherIncome;

  // 4. 소득공제
  const basicDeduction = limits.basicDeduction;
  const taxableIncome = Math.max(0, totalIncome - basicDeduction);

  // 5. 세율 적용
  let calculatedTax = 0;
  let taxBracket = "";

  for (const bracket of config.incomeTaxBrackets) {
    if (taxableIncome > bracket.min) {
      calculatedTax = taxableIncome * bracket.rate - bracket.deduction;
      taxBracket = `${(bracket.rate * 100).toFixed(0)}%`;
    }
  }

  // 6. 지방소득세
  const localTax = calculatedTax * limits.localTaxRate;
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

/**
 * 1주택자 취득세율 계산 (가격별 세분화)
 */
function getOneHomeTaxRate(purchasePrice: number): number {
  if (purchasePrice <= 600_000_000) return 0.01;    // 6억 이하 1%
  if (purchasePrice <= 900_000_000) return 0.02;    // 6~9억 2%
  return 0.03;                                       // 9억 초과 3%
}

/**
 * 다주택자 취득세율 계산
 */
function getMultiHomeTaxRate(
  housingCount: HousingCount,
  isRegulatedArea: boolean,
  purchasePrice: number,
  multiHomeConfig: MultiHomeAcquisitionTaxConfig = DEFAULT_MULTI_HOME_ACQUISITION_TAX
): { rate: number; isHeavyTax: boolean; reason: string } {
  // 1주택자
  if (housingCount === 1) {
    return {
      rate: getOneHomeTaxRate(purchasePrice),
      isHeavyTax: false,
      reason: "",
    };
  }

  // 조정대상지역
  if (isRegulatedArea) {
    if (housingCount === 2) {
      return {
        rate: multiHomeConfig.regulated.twoHome,  // 8%
        isHeavyTax: true,
        reason: "조정대상지역 2주택",
      };
    }
    // 3주택 이상
    return {
      rate: multiHomeConfig.regulated.threeHome,  // 12%
      isHeavyTax: true,
      reason: "조정대상지역 3주택 이상",
    };
  }

  // 비조정대상지역
  if (housingCount === 2) {
    // 2주택은 1주택과 동일한 세율
    return {
      rate: getOneHomeTaxRate(purchasePrice),
      isHeavyTax: false,
      reason: "",
    };
  }
  
  // 3주택 이상
  return {
    rate: multiHomeConfig.nonRegulated.threeHome,  // 8%
    isHeavyTax: true,
    reason: "비조정지역 3주택 이상",
  };
}

export function calculatePropertyAcquisitionTax(
  input: PropertyAcquisitionTaxInput,
  config: TaxConfig = DEFAULT_TAX_CONFIG,
  multiHomeConfig: MultiHomeAcquisitionTaxConfig = DEFAULT_MULTI_HOME_ACQUISITION_TAX
): PropertyAcquisitionTaxResult {
  const { purchasePrice, housingCount, isRegulatedArea, isLifeFirstHome, area } = input;
  const { limits } = config;

  // 1. 취득세율 결정 (주택 수/조정지역 반영)
  const { rate: acquisitionTaxRate, isHeavyTax, reason: heavyTaxReason } = 
    getMultiHomeTaxRate(housingCount, isRegulatedArea, purchasePrice, multiHomeConfig);

  // 2. 기본 취득세 계산
  let acquisitionTax = purchasePrice * acquisitionTaxRate;

  // 3. 생애최초 주택 감면 적용 (1주택, 12억 이하, 200만원 한도)
  let lifeFirstHomeReduction = 0;
  if (
    housingCount === 1 && 
    isLifeFirstHome && 
    purchasePrice <= limits.lifeFirstHomePriceLimit
  ) {
    lifeFirstHomeReduction = Math.min(acquisitionTax, limits.lifeFirstHomeReductionLimit);
    acquisitionTax = acquisitionTax - lifeFirstHomeReduction;
  }

  // 4. 지방교육세 (감면 후 취득세 기준)
  const localEducationTax = acquisitionTax * limits.localEducationTaxRate;

  // 5. 농어촌특별세 (85㎡ 초과 시)
  const specialTax =
    area > limits.specialTaxAreaThreshold
      ? acquisitionTax * limits.specialTaxRate
      : 0;

  const totalTax = acquisitionTax + localEducationTax + specialTax;

  return {
    acquisitionTax,
    acquisitionTaxRate,
    localEducationTax,
    specialTax,
    totalTax,
    lifeFirstHomeReduction,
    isHeavyTax,
    heavyTaxReason,
  };
}

// =========================================
// 부동산 양도세 계산
// =========================================

/**
 * 장기보유특별공제율 계산 (1세대 1주택)
 * 실제 세법: 보유기간 연 4%(최대 40%) + 거주기간 연 4%(최대 40%) = 최대 80%
 */
function calculateLongTermDeductionRate(
  holdingYears: number,
  residenceYears: number,
  config: TaxConfig
): { total: number; holding: number; residence: number } {
  const ltConfig = config.longTermDeductionConfig;

  // 보유기간 공제율 계산
  let holdingRate = 0;
  if (holdingYears >= ltConfig.holdingMinYears) {
    const applicableYears = Math.min(holdingYears, ltConfig.holdingMaxYears);
    holdingRate = Math.min(
      applicableYears * ltConfig.holdingRatePerYear,
      ltConfig.holdingMaxRate
    );
  }

  // 거주기간 공제율 계산
  let residenceRate = 0;
  if (residenceYears >= ltConfig.residenceMinYears) {
    const applicableYears = Math.min(residenceYears, ltConfig.residenceMaxYears);
    residenceRate = Math.min(
      applicableYears * ltConfig.residenceRatePerYear,
      ltConfig.residenceMaxRate
    );
  }

  // 합계 (최대 80%)
  const totalRate = Math.min(holdingRate + residenceRate, ltConfig.totalMaxRate);

  return {
    total: totalRate,
    holding: holdingRate,
    residence: residenceRate,
  };
}

/**
 * 다주택자 양도세 중과세율 및 장특공 제한 계산
 */
function getMultiHomeCapitalGainsInfo(
  housingCount: HousingCount,
  isRegulatedArea: boolean,
  holdingYears: number,
  residenceYears: number,
  config: TaxConfig,
  multiHomeConfig: MultiHomeCapitalGainsConfig = DEFAULT_MULTI_HOME_CAPITAL_GAINS
): {
  surtaxRate: number;
  isHeavyTax: boolean;
  heavyTaxReason: string;
  longTermDeductionRate: number;
  holdingDeductionRate: number;
  residenceDeductionRate: number;
  canApplyLongTermDeduction: boolean;
} {
  // 1주택자: 비과세/장특공 혜택
  if (housingCount === 1) {
    const rates = calculateLongTermDeductionRate(holdingYears, residenceYears, config);
    return {
      surtaxRate: 0,
      isHeavyTax: false,
      heavyTaxReason: "",
      longTermDeductionRate: rates.total,
      holdingDeductionRate: rates.holding,
      residenceDeductionRate: rates.residence,
      canApplyLongTermDeduction: holdingYears >= 3,
    };
  }

  // 조정대상지역 다주택자
  if (isRegulatedArea) {
    const surtaxRate = housingCount === 2
      ? multiHomeConfig.regulated.twoHomeSurtax    // +20%p
      : multiHomeConfig.regulated.threeHomeSurtax; // +30%p
    
    return {
      surtaxRate,
      isHeavyTax: true,
      heavyTaxReason: housingCount === 2 
        ? "조정대상지역 2주택" 
        : "조정대상지역 3주택 이상",
      longTermDeductionRate: 0,
      holdingDeductionRate: 0,
      residenceDeductionRate: 0,
      canApplyLongTermDeduction: false, // 장특공 배제
    };
  }

  // 비조정대상지역 다주택자: 일반 장특공 적용 (연 2%, 최대 30%)
  let generalLongTermRate = 0;
  if (holdingYears >= 3) {
    for (const item of config.longTermDeductionRates) {
      if (holdingYears >= item.years) {
        generalLongTermRate = item.rate;
      }
    }
    // 최대 30% 제한
    generalLongTermRate = Math.min(generalLongTermRate, multiHomeConfig.longTermDeduction.nonRegulatedMultiHomeMaxRate);
  }

  return {
    surtaxRate: 0, // 비조정지역은 중과 없음
    isHeavyTax: false,
    heavyTaxReason: "",
    longTermDeductionRate: generalLongTermRate,
    holdingDeductionRate: generalLongTermRate,
    residenceDeductionRate: 0,
    canApplyLongTermDeduction: holdingYears >= 3,
  };
}

export function calculatePropertyCapitalGainsTax(
  input: PropertyCapitalGainsTaxInput,
  config: TaxConfig = DEFAULT_TAX_CONFIG,
  multiHomeConfig: MultiHomeCapitalGainsConfig = DEFAULT_MULTI_HOME_CAPITAL_GAINS
): PropertyCapitalGainsTaxResult {
  const { purchasePrice, salePrice, holdingYears, residenceYears, housingCount, isRegulatedArea, acquisitionCost } = input;
  const { limits } = config;
  const isOneHome = housingCount === 1;

  // 기본 결과 템플릿 (양도차익 없음/비과세용)
  const emptyResult = (isTaxExempt: boolean, exemptReason: string): PropertyCapitalGainsTaxResult => ({
    gain: salePrice - purchasePrice - acquisitionCost,
    taxableGain: 0,
    longTermDeduction: 0,
    longTermDeductionRate: 0,
    holdingDeductionRate: 0,
    residenceDeductionRate: 0,
    basicDeduction: 0,
    taxableIncome: 0,
    calculatedTax: 0,
    localTax: 0,
    totalTax: 0,
    isTaxExempt,
    exemptReason,
    surtaxRate: 0,
    isHeavyTax: false,
    heavyTaxReason: "",
  });

  // 1. 양도차익 계산
  const gain = salePrice - purchasePrice - acquisitionCost;

  if (gain <= 0) {
    return emptyResult(false, "양도차익 없음");
  }

  // 2. 1세대 1주택 비과세 체크 (12억 이하 + 2년 이상 보유)
  if (
    isOneHome &&
    salePrice <= limits.oneHomeTaxExemptLimit &&
    holdingYears >= limits.oneHomeMinHoldingYears
  ) {
    return emptyResult(
      true,
      `1세대 1주택 비과세 (${(limits.oneHomeTaxExemptLimit / 100_000_000).toFixed(0)}억 이하, ${limits.oneHomeMinHoldingYears}년 이상 보유)`
    );
  }

  // 3. 비과세 한도 초과 시 초과분에 대해서만 과세 (1주택자만)
  let taxableGain = gain;
  if (
    isOneHome &&
    salePrice > limits.oneHomeTaxExemptLimit &&
    holdingYears >= limits.oneHomeMinHoldingYears
  ) {
    const taxableRatio = (salePrice - limits.oneHomeTaxExemptLimit) / salePrice;
    taxableGain = gain * taxableRatio;
  }

  // 4. 다주택자 중과/장특공 정보 조회
  const multiHomeInfo = getMultiHomeCapitalGainsInfo(
    housingCount, isRegulatedArea, holdingYears, residenceYears, config, multiHomeConfig
  );

  // 5. 장기보유특별공제 적용
  const longTermDeductionRate = multiHomeInfo.longTermDeductionRate;
  const holdingDeductionRate = multiHomeInfo.holdingDeductionRate;
  const residenceDeductionRate = multiHomeInfo.residenceDeductionRate;
  const longTermDeduction = taxableGain * longTermDeductionRate;
  const afterLongTermDeduction = taxableGain - longTermDeduction;

  // 6. 기본공제
  const basicDeduction = limits.capitalGainsBasicDeduction;
  const taxableIncome = Math.max(0, afterLongTermDeduction - basicDeduction);

  // 7. 세율 적용 (다주택 중과 포함)
  let calculatedTax = 0;
  for (const bracket of config.capitalGainsTaxBrackets) {
    if (taxableIncome > bracket.min) {
      calculatedTax = taxableIncome * bracket.rate - bracket.deduction;
    }
  }

  // 8. 다주택 중과세 추가 (조정지역)
  if (multiHomeInfo.isHeavyTax && multiHomeInfo.surtaxRate > 0) {
    // 기본세율 누진공제 적용 후 + 중과세율분 추가
    const surtax = taxableIncome * multiHomeInfo.surtaxRate;
    calculatedTax = calculatedTax + surtax;
  }

  // 9. 지방소득세
  const localTax = calculatedTax * limits.localTaxRate;
  const totalTax = calculatedTax + localTax;

  return {
    gain,
    taxableGain,
    longTermDeduction,
    longTermDeductionRate,
    holdingDeductionRate,
    residenceDeductionRate,
    basicDeduction,
    taxableIncome,
    calculatedTax,
    localTax,
    totalTax,
    isTaxExempt: false,
    surtaxRate: multiHomeInfo.surtaxRate,
    isHeavyTax: multiHomeInfo.isHeavyTax,
    heavyTaxReason: multiHomeInfo.heavyTaxReason,
  };
}

// =========================================
// 해외주식 양도세 계산
// =========================================

export function calculateForeignStockTax(
  input: ForeignStockTaxInput,
  config: TaxConfig = DEFAULT_TAX_CONFIG
): ForeignStockTaxResult {
  const { totalGain, totalLoss } = input;
  const { limits } = config;

  // 1. 순수익 계산 (손익통산)
  const netGain = Math.max(0, totalGain - totalLoss);

  // 2. 기본공제
  const basicDeduction = limits.foreignStockBasicDeduction;

  // 3. 과세대상 수익
  const taxableGain = Math.max(0, netGain - basicDeduction);

  // 4. 세율
  const taxRate = limits.foreignStockTaxRate;
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
  input: HealthInsuranceInput,
  config: TaxConfig = DEFAULT_TAX_CONFIG
): HealthInsuranceResult {
  const { annualSalary, rentalIncome, dividendIncome, otherIncome } = input;
  const { limits } = config;

  // 1. 기본 직장인 건보료 (본인 부담분 50%)
  const monthlySalary = annualSalary / 12;
  const baseSalaryInsurance = monthlySalary * config.healthInsuranceRate * 0.5;
  const longTermCare = baseSalaryInsurance * config.longTermCareRate;
  const salaryInsurance = baseSalaryInsurance + longTermCare;

  // 2. 소득월액보험료 (근로 외 소득 기준 초과 시)
  const nonSalaryIncome = rentalIncome + dividendIncome + otherIncome;
  const threshold = limits.healthInsuranceNonSalaryThreshold;

  let excessIncome = 0;
  let additionalInsurance = 0;
  const additionalInsuranceRate = config.incomeMonthlyInsuranceRate;

  if (nonSalaryIncome > threshold) {
    excessIncome = nonSalaryIncome - threshold;
    const monthlyExcess = excessIncome / 12;
    additionalInsurance = monthlyExcess * additionalInsuranceRate * 0.5;
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
  input: TotalTaxReportInput,
  config: TaxConfig = DEFAULT_TAX_CONFIG
): TotalTaxReport {
  const {
    annualSalary,
    rentalIncome,
    propertyValue,
    stockValue,
    foreignStockGain,
    isaDeposit = 0,
    irpDeposit = 0,
  } = input;

  // 1. 종합소득세 계산 (절세 전)
  const incomeTaxBefore = calculateIncomeTax(
    { annualSalary, rentalIncome, otherIncome: 0 },
    config
  );

  // 2. 건강보험료 계산
  const healthInsurance = calculateHealthInsurance(
    {
      annualSalary,
      rentalIncome,
      dividendIncome: stockValue * 0.02,
      otherIncome: 0,
    },
    config
  );

  // 3. 해외주식 양도세 계산
  const foreignStockTax = calculateForeignStockTax(
    { totalGain: foreignStockGain, totalLoss: 0 },
    config
  );

  // 4. ISA/IRP 절세 효과 계산
  const isaIrpBenefit = calculateIsaIrpBenefit(
    { annualSalary, isaDeposit, irpDeposit, expectedReturn: 5 },
    config
  );

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
