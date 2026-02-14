// =========================================
// 세금 & 절세 관련 타입 정의
// =========================================

// =========================================
// 공통 타입
// =========================================

export interface TaxCalculationResult {
  taxAmount: number;
  effectiveRate: number;
  description?: string;
}

// =========================================
// ISA/IRP 절세 관련
// =========================================

export interface IsaIrpInput {
  annualSalary: number; // 연봉
  isaDeposit: number; // ISA 납입액 (연 최대 2,000만원)
  irpDeposit: number; // IRP 납입액 (연 최대 900만원)
  expectedReturn: number; // 예상 수익률 (%)
}

export interface IsaIrpResult {
  // IRP 세액공제
  irpDeduction: number;
  irpDeductionRate: number; // 13.2% or 16.5%
  
  // ISA 비과세/분리과세 혜택
  isaNonTaxableLimit: number; // 비과세 한도 (200만원 or 400만원)
  isaTaxSaved: number; // ISA로 절감한 세금
  
  // 총 절세 효과
  totalTaxSaved: number;
}

// =========================================
// 종합소득세 관련
// =========================================

export interface IncomeTaxInput {
  annualSalary: number; // 근로소득 (연봉)
  rentalIncome: number; // 임대소득 (연간)
  otherIncome: number; // 기타소득
}

export interface IncomeTaxResult {
  // 근로소득
  grossSalary: number;
  salaryDeduction: number; // 근로소득공제
  netSalary: number;
  
  // 임대소득
  grossRental: number;
  rentalDeduction: number; // 필요경비 (분리과세 시 50%)
  netRental: number;
  
  // 종합소득
  totalIncome: number;
  basicDeduction: number; // 기본공제 (150만원)
  taxableIncome: number; // 과세표준
  
  // 세금
  calculatedTax: number; // 산출세액
  taxBracket: string; // 적용 세율 구간
  effectiveRate: number; // 실효세율
  localTax: number; // 지방소득세 (10%)
  totalTax: number; // 총 납부세액
}

// 2026년 종합소득세율 구간
export interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  deduction: number; // 누진공제액
}

// =========================================
// 부동산 세금 관련
// =========================================

export interface PropertyAcquisitionTaxInput {
  purchasePrice: number; // 매수가
  isFirstHome: boolean; // 1주택자 여부
  isLifeFirstHome: boolean; // 생애최초 주택 여부
  area: number; // 전용면적 (m²)
}

export interface PropertyAcquisitionTaxResult {
  acquisitionTax: number; // 취득세
  acquisitionTaxRate: number;
  localEducationTax: number; // 지방교육세
  specialTax: number; // 농어촌특별세
  totalTax: number;
}

export interface PropertyCapitalGainsTaxInput {
  purchasePrice: number; // 매수가
  salePrice: number; // 매도가
  holdingYears: number; // 보유기간 (년)
  isOneHome: boolean; // 1주택자 여부
  acquisitionCost: number; // 취득부대비용 (취득세, 중개수수료 등)
}

export interface PropertyCapitalGainsTaxResult {
  gain: number; // 양도차익
  taxableGain: number; // 과세대상 양도차익
  longTermDeduction: number; // 장기보유특별공제
  longTermDeductionRate: number;
  basicDeduction: number; // 기본공제 (250만원)
  taxableIncome: number; // 과세표준
  calculatedTax: number; // 산출세액
  localTax: number; // 지방소득세
  totalTax: number;
  isTaxExempt: boolean; // 비과세 여부
  exemptReason?: string;
}

// =========================================
// 해외주식 양도세 관련
// =========================================

export interface ForeignStockTaxInput {
  totalGain: number; // 해외주식 총 수익
  totalLoss: number; // 해외주식 총 손실
}

export interface ForeignStockTaxResult {
  netGain: number; // 순수익 (gain - loss)
  basicDeduction: number; // 기본공제 (250만원)
  taxableGain: number; // 과세대상 수익
  taxRate: number; // 22% (양도세 20% + 지방세 2%)
  totalTax: number;
}

// =========================================
// 건강보험료 관련
// =========================================

export interface HealthInsuranceInput {
  annualSalary: number; // 근로소득
  rentalIncome: number; // 임대소득
  dividendIncome: number; // 배당/이자소득
  otherIncome: number; // 기타 금융소득
}

export interface HealthInsuranceResult {
  // 기본 직장인 건보료
  salaryInsurance: number;
  
  // 소득월액보험료 (근로 외 소득 2000만원 초과 시)
  excessIncome: number; // 초과 소득
  additionalInsurance: number; // 추가 건보료
  additionalInsuranceRate: number;
  
  // 총 건보료
  totalMonthlyInsurance: number;
  totalAnnualInsurance: number;
}

// =========================================
// 종합 세금 리포트
// =========================================

export interface TotalTaxReport {
  // 입력값
  input: {
    annualSalary: number;
    rentalIncome: number;
    propertyValue: number;
    stockValue: number;
    foreignStockGain: number;
  };
  
  // 세금 항목별 결과
  incomeTax: IncomeTaxResult;
  healthInsurance: HealthInsuranceResult;
  
  // 절세 전/후 비교
  beforeOptimization: {
    totalTax: number;
    breakdown: {
      incomeTax: number;
      healthInsurance: number;
      foreignStockTax: number;
    };
  };
  
  afterOptimization: {
    totalTax: number;
    breakdown: {
      incomeTax: number;
      healthInsurance: number;
      foreignStockTax: number;
    };
    strategies: {
      isaIrpSaving: number;
      rentalDeductionSaving: number;
      otherSaving: number;
    };
  };
  
  totalSaving: number; // 총 절세 금액
}

// =========================================
// 차트용 데이터 타입
// =========================================

export interface TaxComparisonData {
  category: string;
  before: number;
  after: number;
}

export interface TaxPieData {
  name: string;
  value: number;
  color: string;
}
