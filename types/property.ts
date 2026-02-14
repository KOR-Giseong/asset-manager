// =========================================
// 부동산 타입 정의
// =========================================

export type PropertyType =
  | "APARTMENT"   // 아파트
  | "VILLA"       // 빌라/다세대
  | "OFFICETEL"   // 오피스텔
  | "COMMERCIAL"  // 상가
  | "LAND"        // 토지
  | "OTHER";      // 기타

export type ContractType =
  | "OWNED"           // 자가 (소유)
  | "JEONSE"          // 전세 (임차인)
  | "MONTHLY"         // 월세 (임차인)
  | "RENTAL_JEONSE"   // 전세 놓음 (임대인)
  | "RENTAL_MONTHLY"; // 월세 놓음 (임대인)

// 부동산 기본 인터페이스
export interface Property {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // 기본 정보
  name: string;
  propertyType: PropertyType;
  contractType: ContractType;
  address: string;

  // 가격 정보
  purchasePrice: number;
  currentPrice: number;
  acquisitionCost: number;

  // 대출 정보
  loanPrincipal: number;
  loanInterestRate: number;

  // 임대 정보
  deposit: number;
  monthlyRent: number;
  maintenanceFee: number;

  // 계약 정보
  contractStartDate: Date | null;
  contractEndDate: Date | null;

  // 메모
  notes: string | null;

  // 관계
  userId: string;
}

// 부동산 생성 입력값
export interface CreatePropertyInput {
  name: string;
  propertyType: PropertyType;
  contractType: ContractType;
  address: string;
  purchasePrice: number;
  currentPrice: number;
  acquisitionCost?: number;
  loanPrincipal?: number;
  loanInterestRate?: number;
  deposit?: number;
  monthlyRent?: number;
  maintenanceFee?: number;
  contractStartDate?: Date | null;
  contractEndDate?: Date | null;
  notes?: string | null;
}

// 부동산 수정 입력값
export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  id: string;
}

// =========================================
// 계산된 투자 지표
// =========================================

// 순자산 (Equity)
export interface EquityInfo {
  equity: number;          // 순자산 = 시세 - (대출 + 전세보증금)
  totalLiability: number;  // 총 부채 = 대출 + 보증금
}

// 현금흐름 (Cash Flow)
export interface CashFlowInfo {
  monthlyCashFlow: number;      // 월 현금흐름 = 월세 - (대출이자 + 관리비)
  annualCashFlow: number;       // 연 현금흐름
  monthlyLoanInterest: number;  // 월 대출이자
}

// 수익률 (ROI)
export interface ROIInfo {
  actualInvestment: number;  // 실투자금 = 매수가 + 부대비용 - 대출 - 보증금
  annualNetIncome: number;   // 연 순수익
  roi: number;               // 수익률 (%)
}

// LTV (Loan to Value)
export interface LTVInfo {
  ltv: number;         // LTV 비율 (%)
  isWarning: boolean;  // 경고 여부 (70% 이상)
  isDanger: boolean;   // 위험 여부 (80% 이상)
}

// 통합 투자 요약
export interface PropertyInvestmentSummary {
  equity: EquityInfo;
  cashFlow: CashFlowInfo;
  roi: ROIInfo;
  ltv: LTVInfo;
  daysUntilExpiry: number | null;  // 계약 만기까지 남은 일수
  isExpiryWarning: boolean;        // 만기 3개월 미만 경고
}

// =========================================
// UI용 라벨 매핑
// =========================================

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTMENT: "아파트",
  VILLA: "빌라/다세대",
  OFFICETEL: "오피스텔",
  COMMERCIAL: "상가",
  LAND: "토지",
  OTHER: "기타",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  OWNED: "자가",
  JEONSE: "전세",
  MONTHLY: "월세",
  RENTAL_JEONSE: "전세 놓음",
  RENTAL_MONTHLY: "월세 놓음",
};

// 계약 유형별 색상
export const CONTRACT_TYPE_COLORS: Record<ContractType, string> = {
  OWNED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  JEONSE: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  MONTHLY: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  RENTAL_JEONSE: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  RENTAL_MONTHLY: "bg-pink-500/10 text-pink-500 border-pink-500/20",
};
