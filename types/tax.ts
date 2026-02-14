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
// 세금 설정 타입 (연도별 교체 가능)
// =========================================

/** 장기보유특별공제율 */
export interface LongTermDeductionRate {
  years: number;
  rate: number;
}

/** 세법별 한도/기준값 */
export interface TaxLimits {
  irpMaxDeposit: number;                    // IRP 최대 납입액 (900만원)
  isaMaxDeposit: number;                    // ISA 최대 납입액 (2,000만원)
  isaNonTaxableGeneral: number;             // ISA 비과세 한도 - 일반 (200만원)
  isaNonTaxableLowIncome: number;           // ISA 비과세 한도 - 서민형 (400만원)
  lowIncomeSalaryThreshold: number;         // ISA 서민형 기준 연봉 (5,000만원)
  irpLowIncomeThreshold: number;            // IRP 세액공제율 기준 연봉 (5,500만원)
  irpDeductionRateHigh: number;             // IRP 세액공제율 - 고소득 (13.2%)
  irpDeductionRateLow: number;              // IRP 세액공제율 - 저소득 (16.5%)
  isaNormalTaxRate: number;                 // ISA 일반과세율 (15.4%)
  isaSeparateTaxRate: number;               // ISA 분리과세율 (9.9%)
  oneHomeTaxExemptLimit: number;            // 1주택 비과세 기준 (12억원)
  oneHomeMinHoldingYears: number;           // 1주택 비과세 최소 보유기간 (2년)
  basicDeduction: number;                   // 기본공제 (150만원)
  capitalGainsBasicDeduction: number;       // 양도소득 기본공제 (250만원)
  foreignStockBasicDeduction: number;       // 해외주식 기본공제 (250만원)
  foreignStockTaxRate: number;              // 해외주식 양도세율 (22%)
  localTaxRate: number;                     // 지방소득세율 (10%)
  healthInsuranceNonSalaryThreshold: number; // 건보료 추가부과 기준 (2,000만원)
  rentalExpenseRate: number;                // 임대소득 필요경비율 (50%)
  localEducationTaxRate: number;            // 지방교육세율 (10%)
  specialTaxRate: number;                   // 농어촌특별세율 (10%)
  specialTaxAreaThreshold: number;          // 농어촌특별세 면적 기준 (85㎡)
  lifeFirstHomeExemptPriceLimit: number;    // 생애최초 취득세 면제 가격 한도 (6억원)
  lifeFirstHomeExemptAreaLimit: number;     // 생애최초 취득세 면제 면적 한도 (85㎡)
}

/** 연도별 세금 설정 (세율, 구간, 한도 통합) */
export interface TaxConfig {
  year: number;
  incomeTaxBrackets: TaxBracket[];
  capitalGainsTaxBrackets: TaxBracket[];
  longTermDeductionRates: LongTermDeductionRate[];
  healthInsuranceRate: number;
  longTermCareRate: number;
  incomeMonthlyInsuranceRate: number;
  limits: TaxLimits;
}

// =========================================
// 세금 센터 초기 데이터 (서버 → 클라이언트)
// =========================================

/** 세금 페이지에 전달되는 자산 요약 데이터 */
export interface TaxInitialData {
  propertyValue: number;
  propertyPurchasePrice: number;
  rentalIncome: number;
  stockValue: number;
  foreignStockValue: number;
  depositValue: number;
  dividendIncome: number;
  interestIncome: number;
  totalAssets: number;
  savedAnnualSalary: number | null;
}

/** 종합 세금 리포트 생성용 통합 입력 */
export interface TotalTaxReportInput {
  annualSalary: number;
  rentalIncome: number;
  propertyValue: number;
  stockValue: number;
  foreignStockGain: number;
  isaDeposit?: number;
  irpDeposit?: number;
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

/** 세율 구간 (종합소득세, 양도소득세 공통) */
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

/** 세금 내역 항목 (절세 전/후 비교용) */
export interface TaxBreakdown {
  incomeTax: number;
  healthInsurance: number;
  foreignStockTax: number;
}

/** 절세 전략별 절감액 */
export interface TaxSavingStrategies {
  isaIrpSaving: number;
  rentalDeductionSaving: number;
  otherSaving: number;
}

export interface TotalTaxReport {
  input: Pick<TotalTaxReportInput, "annualSalary" | "rentalIncome" | "propertyValue" | "stockValue" | "foreignStockGain">;
  
  // 세금 항목별 결과
  incomeTax: IncomeTaxResult;
  healthInsurance: HealthInsuranceResult;
  
  // 절세 전/후 비교
  beforeOptimization: {
    totalTax: number;
    breakdown: TaxBreakdown;
  };

  afterOptimization: {
    totalTax: number;
    breakdown: TaxBreakdown;
    strategies: TaxSavingStrategies;
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
