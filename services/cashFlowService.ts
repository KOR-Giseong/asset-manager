// =========================================
// 현금흐름 서비스
// =========================================
// 부동산 월세, 주식 배당금 등 현금 유입 계산
// =========================================

import { prisma } from "@/lib/prisma";
import type { Property } from "@/types/property";

// =========================================
// 타입 정의
// =========================================

export interface CashFlowEvent {
  id: string;
  date: Date;
  type: "rent" | "dividend" | "interest";
  category: string;
  source: string;
  amount: number;
  description: string;
}

export interface DailyCashFlow {
  date: string; // YYYY-MM-DD
  events: CashFlowEvent[];
  totalAmount: number;
}

export interface MonthlyCashFlowSummary {
  month: string; // YYYY-MM
  totalRent: number;
  totalDividend: number;
  totalInterest: number;
  totalCashFlow: number;
  events: CashFlowEvent[];
  dailyMap: Map<string, DailyCashFlow>;
}

// =========================================
// 월세 입금일 기본값 (매월 25일)
// =========================================

const DEFAULT_RENT_DAY = 25;

// =========================================
// 부동산 월세 현금흐름 계산
// =========================================

/**
 * 부동산에서 발생하는 월세 수입 계산
 * 임대 중인 부동산(RENTAL_JEONSE, RENTAL_MONTHLY)의 월세 수입
 */
export function calculateRentCashFlow(
  properties: Property[],
  year: number,
  month: number
): CashFlowEvent[] {
  const events: CashFlowEvent[] = [];

  for (const property of properties) {
    // 월세 놓은 부동산만 처리
    if (property.contractType !== "RENTAL_MONTHLY") continue;
    if (property.monthlyRent <= 0) continue;

    // 월세 입금일 (기본 25일)
    const rentDay = DEFAULT_RENT_DAY;
    const eventDate = new Date(year, month - 1, rentDay);

    events.push({
      id: `rent-${property.id}-${year}-${month}`,
      date: eventDate,
      type: "rent",
      category: "부동산",
      source: property.name,
      amount: property.monthlyRent,
      description: `${property.name} 월세`,
    });
  }

  return events;
}

// =========================================
// 주식 배당금 현금흐름 계산 (예시 데이터)
// =========================================

// 대표적인 한국 주식 배당 스케줄 (예시)
const DIVIDEND_SCHEDULES: Record<string, { months: number[]; rate: number }> = {
  // 월별 배당 ETF (예: TIGER 미국배당다우존스)
  "MONTHLY_ETF": { months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], rate: 0.003 },
  // 분기 배당 (예: 삼성전자)
  "005930.KS": { months: [3, 6, 9, 12], rate: 0.02 },
  // 반기 배당 (예: SK하이닉스)
  "000660.KS": { months: [6, 12], rate: 0.01 },
  // 연간 배당 (일반 주식)
  "ANNUAL": { months: [12], rate: 0.015 },
};

/**
 * 주식 배당금 계산
 * 심볼이 없거나 배당 스케줄이 없는 경우 연간 배당으로 가정
 */
export async function calculateDividendCashFlow(
  userId: string,
  year: number,
  month: number
): Promise<CashFlowEvent[]> {
  const events: CashFlowEvent[] = [];

  const stocks = await prisma.asset.findMany({
    where: {
      userId,
      type: "주식",
    },
  });

  for (const stock of stocks) {
    const symbol = stock.symbol || "ANNUAL";
    const schedule = DIVIDEND_SCHEDULES[symbol] || DIVIDEND_SCHEDULES["ANNUAL"];

    // 해당 월에 배당이 있는지 확인
    if (!schedule.months.includes(month)) continue;

    const value = stock.currentPrice > 0 ? stock.currentPrice : stock.amount;
    const dividendAmount = Math.round(value * schedule.rate);

    if (dividendAmount <= 0) continue;

    // 배당 지급일 (보통 월 중순)
    const paymentDay = 15;
    const eventDate = new Date(year, month - 1, paymentDay);

    events.push({
      id: `dividend-${stock.id}-${year}-${month}`,
      date: eventDate,
      type: "dividend",
      category: "주식",
      source: stock.name,
      amount: dividendAmount,
      description: `${stock.name} 배당금`,
    });
  }

  return events;
}

// =========================================
// 예적금 이자 현금흐름 계산
// =========================================

export async function calculateInterestCashFlow(
  userId: string,
  year: number,
  month: number
): Promise<CashFlowEvent[]> {
  const events: CashFlowEvent[] = [];

  const deposits = await prisma.asset.findMany({
    where: {
      userId,
      type: "예적금",
    },
  });

  // 예적금은 보통 만기에 이자 지급, 연 3% 가정하여 월별로 분배
  for (const deposit of deposits) {
    const annualRate = 0.03; // 연 3% 가정
    const monthlyInterest = Math.round((deposit.amount * annualRate) / 12);

    if (monthlyInterest <= 0) continue;

    // 이자 지급일 (말일)
    const lastDay = new Date(year, month, 0).getDate();
    const eventDate = new Date(year, month - 1, lastDay);

    events.push({
      id: `interest-${deposit.id}-${year}-${month}`,
      date: eventDate,
      type: "interest",
      category: "예적금",
      source: deposit.name,
      amount: monthlyInterest,
      description: `${deposit.name} 이자`,
    });
  }

  return events;
}

// =========================================
// 월간 현금흐름 요약
// =========================================

export async function getMonthlyCashFlow(
  userId: string,
  year: number,
  month: number,
  properties: Property[]
): Promise<MonthlyCashFlowSummary> {
  // 각 유형별 현금흐름 계산
  const rentEvents = calculateRentCashFlow(properties, year, month);
  const dividendEvents = await calculateDividendCashFlow(userId, year, month);
  const interestEvents = await calculateInterestCashFlow(userId, year, month);

  // 모든 이벤트 합치기
  const allEvents = [...rentEvents, ...dividendEvents, ...interestEvents];

  // 총액 계산
  const totalRent = rentEvents.reduce((sum, e) => sum + e.amount, 0);
  const totalDividend = dividendEvents.reduce((sum, e) => sum + e.amount, 0);
  const totalInterest = interestEvents.reduce((sum, e) => sum + e.amount, 0);
  const totalCashFlow = totalRent + totalDividend + totalInterest;

  // 날짜별 그룹핑
  const dailyMap = new Map<string, DailyCashFlow>();

  for (const event of allEvents) {
    const dateKey = event.date.toISOString().split("T")[0];

    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        date: dateKey,
        events: [],
        totalAmount: 0,
      });
    }

    const daily = dailyMap.get(dateKey)!;
    daily.events.push(event);
    daily.totalAmount += event.amount;
  }

  return {
    month: `${year}-${String(month).padStart(2, "0")}`,
    totalRent,
    totalDividend,
    totalInterest,
    totalCashFlow,
    events: allEvents,
    dailyMap,
  };
}

// =========================================
// 특정 날짜의 현금흐름 조회
// =========================================

export function getCashFlowByDate(
  summary: MonthlyCashFlowSummary,
  date: Date
): DailyCashFlow | null {
  const dateKey = date.toISOString().split("T")[0];
  return summary.dailyMap.get(dateKey) || null;
}

// =========================================
// 연간 현금흐름 요약
// =========================================

export async function getYearlyCashFlowSummary(
  userId: string,
  year: number,
  properties: Property[]
): Promise<{
  year: number;
  totalCashFlow: number;
  monthlyBreakdown: { month: number; total: number }[];
}> {
  const monthlyBreakdown: { month: number; total: number }[] = [];
  let totalCashFlow = 0;

  for (let month = 1; month <= 12; month++) {
    const monthly = await getMonthlyCashFlow(userId, year, month, properties);
    monthlyBreakdown.push({ month, total: monthly.totalCashFlow });
    totalCashFlow += monthly.totalCashFlow;
  }

  return {
    year,
    totalCashFlow,
    monthlyBreakdown,
  };
}
