"use client";

// =========================================
// 세금 & 절세 마스터 센터 메인 컴포넌트
// =========================================

import { useState, useTransition } from "react";
import {
  Wallet,
  Calculator,
  Building2,
  TrendingUp,
  HeartPulse,
  ShieldCheck,
  Save,
  Check,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IsaIrpCalculator } from "./isa-irp-calculator";
import { IncomeTaxCalculator } from "./income-tax-calculator";
import { PropertyTaxCalculator } from "./property-tax-calculator";
import { ForeignStockTaxCalculator } from "./foreign-stock-tax-calculator";
import { HealthInsuranceCalculator } from "./health-insurance-calculator";
import { TaxComparisonChart } from "./tax-comparison-chart";
import { TaxPieChart } from "./tax-pie-chart";
import { generateTotalTaxReport, generateComparisonChartData, generatePieChartData } from "@/services/taxService";
import { updateAnnualSalary } from "@/app/actions/tax-actions";
import type { TotalTaxReport, TaxComparisonData, TaxPieData } from "@/types/tax";
import { formatKRW } from "@/lib/format";

// =========================================
// 타입 정의
// =========================================

interface TaxCenterProps {
  initialData: {
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
  };
}

type TabId = "isa-irp" | "income" | "property" | "foreign-stock" | "health";

interface TabConfig {
  id: TabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const TABS: TabConfig[] = [
  { id: "isa-irp", label: "절세 전략 (ISA/IRP)", shortLabel: "ISA/IRP", icon: ShieldCheck, color: "text-violet-500" },
  { id: "income", label: "종합소득세", shortLabel: "소득세", icon: Calculator, color: "text-blue-500" },
  { id: "property", label: "부동산 세금", shortLabel: "부동산", icon: Building2, color: "text-emerald-500" },
  { id: "foreign-stock", label: "해외주식 양도세", shortLabel: "해외주식", icon: TrendingUp, color: "text-amber-500" },
  { id: "health", label: "건보료 시뮬레이션", shortLabel: "건보료", icon: HeartPulse, color: "text-rose-500" },
];

// =========================================
// 메인 컴포넌트
// =========================================

export function TaxCenter({ initialData }: TaxCenterProps) {
  const [activeTab, setActiveTab] = useState<TabId>("isa-irp");
  const [annualSalary, setAnnualSalary] = useState(
    initialData.savedAnnualSalary || 60_000_000 // DB 저장값 또는 기본값 6천만원
  );
  const [isaDeposit, setIsaDeposit] = useState(10_000_000);
  const [irpDeposit, setIrpDeposit] = useState(7_000_000);
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(!!initialData.savedAnnualSalary);
  const [hasChanges, setHasChanges] = useState(false);

  // 연봉 변경 핸들러 (변경 감지)
  function handleSalaryChange(value: number) {
    setAnnualSalary(value);
    setHasChanges(true);
    setIsSaved(false);
  }

  // 연봉 저장 핸들러
  function handleSaveSalary() {
    startTransition(async () => {
      const result = await updateAnnualSalary(annualSalary);
      if (result.success) {
        setIsSaved(true);
        setHasChanges(false);
      }
    });
  }

  // 종합 세금 리포트 생성
  const taxReport: TotalTaxReport = generateTotalTaxReport(
    annualSalary,
    initialData.rentalIncome,
    initialData.propertyValue,
    initialData.stockValue,
    initialData.foreignStockValue * 0.1, // 예상 수익 10%
    isaDeposit,
    irpDeposit
  );

  // 차트 데이터
  const comparisonData: TaxComparisonData[] = generateComparisonChartData(taxReport);
  const pieData: TaxPieData[] = generatePieChartData(
    initialData.totalAssets,
    taxReport.afterOptimization.totalTax
  );

  // 탭 렌더링
  function renderTabContent() {
    switch (activeTab) {
      case "isa-irp":
        return (
          <IsaIrpCalculator
            annualSalary={annualSalary}
            onAnnualSalaryChange={handleSalaryChange}
            isaDeposit={isaDeposit}
            onIsaDepositChange={setIsaDeposit}
            irpDeposit={irpDeposit}
            onIrpDepositChange={setIrpDeposit}
          />
        );
      case "income":
        return (
          <IncomeTaxCalculator
            annualSalary={annualSalary}
            onAnnualSalaryChange={handleSalaryChange}
            rentalIncome={initialData.rentalIncome}
          />
        );
      case "property":
        return (
          <PropertyTaxCalculator
            propertyPurchasePrice={initialData.propertyPurchasePrice}
          />
        );
      case "foreign-stock":
        return (
          <ForeignStockTaxCalculator
            foreignStockValue={initialData.foreignStockValue}
          />
        );
      case "health":
        return (
          <HealthInsuranceCalculator
            annualSalary={annualSalary}
            onAnnualSalaryChange={handleSalaryChange}
            rentalIncome={initialData.rentalIncome}
            dividendIncome={initialData.dividendIncome}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6">
      {/* 연봉 저장 영역 */}
      <Card className="border-border/60">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <Wallet className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">기준 연봉 (세전)</p>
                <p className="text-lg font-bold">{formatKRW(annualSalary)}</p>
              </div>
            </div>
            <button
              onClick={handleSaveSalary}
              disabled={isPending || (isSaved && !hasChanges)}
              className={`
                flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all
                ${
                  isSaved && !hasChanges
                    ? "bg-emerald-500/10 text-emerald-500"
                    : hasChanges
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-muted text-muted-foreground"
                }
                disabled:cursor-not-allowed disabled:opacity-50
              `}
            >
              {isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span className="hidden sm:inline">저장 중...</span>
                </>
              ) : isSaved && !hasChanges ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">저장됨</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">연봉 저장</span>
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 요약 카드 */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 sm:h-10 sm:w-10">
                <Calculator className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground sm:text-xs">절세 전 세금</p>
                <p className="truncate text-sm font-bold text-red-500 sm:text-lg">
                  {formatKRW(taxReport.beforeOptimization.totalTax)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 sm:h-10 sm:w-10">
                <ShieldCheck className="h-4 w-4 text-emerald-500 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground sm:text-xs">절세 후 세금</p>
                <p className="truncate text-sm font-bold text-emerald-500 sm:text-lg">
                  {formatKRW(taxReport.afterOptimization.totalTax)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 sm:h-10 sm:w-10">
                <Wallet className="h-4 w-4 text-violet-500 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground sm:text-xs">절세 효과</p>
                <p className="truncate text-sm font-bold text-violet-500 sm:text-lg">
                  {formatKRW(taxReport.totalSaving)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 sm:h-10 sm:w-10">
                <TrendingUp className="h-4 w-4 text-blue-500 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground sm:text-xs">실효세율</p>
                <p className="truncate text-sm font-bold text-blue-500 sm:text-lg">
                  {taxReport.incomeTax.effectiveRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 영역 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TaxComparisonChart data={comparisonData} />
        <TaxPieChart data={pieData} totalAssets={initialData.totalAssets} />
      </div>

      {/* 탭 네비게이션 */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">세금 계산기</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            각 항목별 세금을 계산하고 절세 전략을 확인하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {/* 탭 버튼 */}
          <div className="mb-4 flex gap-1 overflow-x-auto rounded-lg bg-muted/50 p-1 sm:mb-6 sm:gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-medium transition-all
                    sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm
                    ${
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    }
                  `}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4 ${isActive ? tab.color : ""}`} />
                  <span className="hidden truncate sm:inline">{tab.label}</span>
                  <span className="truncate sm:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* 탭 컨텐츠 */}
          <div className="min-h-[400px]">{renderTabContent()}</div>
        </CardContent>
      </Card>
    </div>
  );
}
