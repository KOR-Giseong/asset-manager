// =========================================
// 자산 히스토리 타입 정의
// =========================================

/** 스냅샷 저장 데이터 */
export interface AssetSnapshotData {
  totalAmount: number;
  stockAmount: number;
  propertyAmount: number;
  depositAmount: number;
}

/** 날짜가 포함된 스냅샷 조회 결과 */
export interface SnapshotWithDate {
  id: string;
  date: string; // YYYY-MM-DD
  totalAmount: number;
  stockAmount: number;
  propertyAmount: number;
  depositAmount: number;
}

/** 히스토리 조회 기간 */
export type HistoryPeriod = "7d" | "30d" | "90d" | "1y" | "all";

/** 차트 렌더링용 데이터 포인트 */
export interface ChartDataPoint {
  date: string;
  displayDate: string;
  total: number;
  stock: number;
  property: number;
  deposit: number;
}

/** 자산 변화율 */
export interface AssetChange {
  absoluteChange: number;
  percentChange: number;
  startAmount: number;
  endAmount: number;
}
