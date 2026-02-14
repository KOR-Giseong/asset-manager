"use client";

// =========================================
// 부동산 세금 계산기 (취득세 / 양도세)
// =========================================

import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, Info, Home, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  calculatePropertyAcquisitionTax,
  calculatePropertyCapitalGainsTax,
} from "@/services/taxService";
import { formatKRW } from "@/lib/format";

// =========================================
// 타입 정의
// =========================================

interface PropertyTaxCalculatorProps {
  propertyPurchasePrice: number;
}

type TabType = "acquisition" | "capital-gains";

// =========================================
// 메인 컴포넌트
// =========================================

export function PropertyTaxCalculator({
  propertyPurchasePrice,
}: PropertyTaxCalculatorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("acquisition");

  // 취득세 입력
  const [purchasePrice, setPurchasePrice] = useState(propertyPurchasePrice || 600_000_000);
  const [isFirstHome, setIsFirstHome] = useState(true);
  const [isLifeFirstHome, setIsLifeFirstHome] = useState(false);
  const [area, setArea] = useState(85);

  // 양도세 입력
  const [salePrice, setSalePrice] = useState(800_000_000);
  const [holdingYears, setHoldingYears] = useState(3);
  const [isOneHome, setIsOneHome] = useState(true);
  const [acquisitionCost, setAcquisitionCost] = useState(20_000_000);

  // 취득세 계산
  const acquisitionResult = useMemo(() => {
    return calculatePropertyAcquisitionTax({
      purchasePrice,
      isFirstHome,
      isLifeFirstHome,
      area,
    });
  }, [purchasePrice, isFirstHome, isLifeFirstHome, area]);

  // 양도세 계산
  const capitalGainsResult = useMemo(() => {
    return calculatePropertyCapitalGainsTax({
      purchasePrice: propertyPurchasePrice || purchasePrice,
      salePrice,
      holdingYears,
      isOneHome,
      acquisitionCost,
    });
  }, [propertyPurchasePrice, purchasePrice, salePrice, holdingYears, isOneHome, acquisitionCost]);

  // 입력값 파싱
  function parseNumber(value: string): number {
    const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
    return isNaN(num) ? 0 : num;
  }

  return (
    <div className="space-y-6">
      {/* 탭 전환 */}
      <div className="flex gap-2 rounded-lg bg-muted/50 p-1">
        <button
          onClick={() => setActiveTab("acquisition")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
            activeTab === "acquisition"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          취득세 계산
        </button>
        <button
          onClick={() => setActiveTab("capital-gains")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
            activeTab === "capital-gains"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          양도세 계산
        </button>
      </div>

      {/* 취득세 계산기 */}
      {activeTab === "acquisition" && (
        <div className="space-y-6">
          {/* 안내 메시지 */}
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 sm:p-4">
            <Info className="h-5 w-5 shrink-0 text-emerald-500" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground sm:text-sm">
                부동산 취득세 계산 (2026년 기준)
              </p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                1주택자 기준 취득세율: 6억 이하 1%, 6~9억 2%, 9억 초과 3%.
                생애최초 주택은 취득세 면제 혜택이 있습니다.
              </p>
            </div>
          </div>

          {/* 입력 폼 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchase-price" className="text-xs sm:text-sm">
                매수가격
              </Label>
              <div className="relative">
                <Input
                  id="purchase-price"
                  type="text"
                  value={purchasePrice.toLocaleString()}
                  onChange={(e) => setPurchasePrice(parseNumber(e.target.value))}
                  className="pr-8 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  원
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-xs sm:text-sm">
                전용면적 (m²)
              </Label>
              <Input
                id="area"
                type="number"
                value={area}
                onChange={(e) => setArea(parseInt(e.target.value) || 0)}
                className="text-sm"
              />
            </div>
          </div>

          {/* 체크박스 옵션 */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={isFirstHome}
                onChange={(e) => setIsFirstHome(e.target.checked)}
                className="rounded border-border"
              />
              1주택자
            </label>
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={isLifeFirstHome}
                onChange={(e) => setIsLifeFirstHome(e.target.checked)}
                className="rounded border-border"
              />
              생애최초 주택
            </label>
          </div>

          {/* 결과 */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground sm:text-xs">취득세</p>
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {formatKRW(acquisitionResult.acquisitionTax)}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  세율: {(acquisitionResult.acquisitionTaxRate * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground sm:text-xs">지방교육세</p>
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {formatKRW(acquisitionResult.localEducationTax)}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  취득세의 10%
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground sm:text-xs">농어촌특별세</p>
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {formatKRW(acquisitionResult.specialTax)}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {area > 85 ? "85㎡ 초과" : "해당 없음"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground sm:text-xs">총 취득세</p>
                <p className="text-lg font-bold text-red-500 sm:text-xl">
                  {formatKRW(acquisitionResult.totalTax)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 양도세 계산기 */}
      {activeTab === "capital-gains" && (
        <div className="space-y-6">
          {/* 안내 메시지 */}
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 sm:p-4">
            <Info className="h-5 w-5 shrink-0 text-amber-500" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground sm:text-sm">
                부동산 양도세 계산 (2026년 기준)
              </p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                1세대 1주택 12억 이하, 2년 이상 보유 시 비과세.
                장기보유특별공제는 3년 이상 보유 시 최대 80%까지 적용됩니다.
              </p>
            </div>
          </div>

          {/* 입력 폼 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="buy-price" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Home className="h-3.5 w-3.5 text-blue-500" />
                매수가격
              </Label>
              <div className="relative">
                <Input
                  id="buy-price"
                  type="text"
                  value={(propertyPurchasePrice || purchasePrice).toLocaleString()}
                  onChange={(e) => setPurchasePrice(parseNumber(e.target.value))}
                  disabled={propertyPurchasePrice > 0}
                  className="pr-8 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  원
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sell-price" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
                예상 매도가격
              </Label>
              <div className="relative">
                <Input
                  id="sell-price"
                  type="text"
                  value={salePrice.toLocaleString()}
                  onChange={(e) => setSalePrice(parseNumber(e.target.value))}
                  className="pr-8 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  원
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="holding" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Calendar className="h-3.5 w-3.5 text-violet-500" />
                보유기간 (년)
              </Label>
              <Input
                id="holding"
                type="number"
                value={holdingYears}
                onChange={(e) => setHoldingYears(parseInt(e.target.value) || 0)}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost" className="text-xs sm:text-sm">
                취득부대비용
              </Label>
              <div className="relative">
                <Input
                  id="cost"
                  type="text"
                  value={acquisitionCost.toLocaleString()}
                  onChange={(e) => setAcquisitionCost(parseNumber(e.target.value))}
                  className="pr-8 text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  원
                </span>
              </div>
            </div>
          </div>

          {/* 체크박스 */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={isOneHome}
                onChange={(e) => setIsOneHome(e.target.checked)}
                className="rounded border-border"
              />
              1세대 1주택
            </label>
          </div>

          {/* 비과세 여부 표시 */}
          {capitalGainsResult.isTaxExempt && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                🎉 비과세 대상입니다!
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {capitalGainsResult.exemptReason}
              </p>
            </div>
          )}

          {/* 결과 */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground sm:text-xs">양도차익</p>
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {formatKRW(capitalGainsResult.gain)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground sm:text-xs">장기보유특별공제</p>
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {formatKRW(capitalGainsResult.longTermDeduction)}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  공제율: {(capitalGainsResult.longTermDeductionRate * 100).toFixed(0)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground sm:text-xs">과세표준</p>
                <p className="text-lg font-bold text-foreground sm:text-xl">
                  {formatKRW(capitalGainsResult.taxableIncome)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground sm:text-xs">총 양도세</p>
                <p className="text-lg font-bold text-red-500 sm:text-xl">
                  {formatKRW(capitalGainsResult.totalTax)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 장기보유특별공제율 안내 */}
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">보유기간</th>
                  <th className="px-3 py-2 text-center font-medium">공제율 (1세대 1주택)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { years: "3년", rate: "24%" },
                  { years: "4년", rate: "32%" },
                  { years: "5년", rate: "40%" },
                  { years: "6년", rate: "48%" },
                  { years: "7년", rate: "56%" },
                  { years: "8년", rate: "64%" },
                  { years: "9년", rate: "72%" },
                  { years: "10년 이상", rate: "80%" },
                ].map((row, index) => (
                  <tr
                    key={row.years}
                    className={
                      (index === 0 && holdingYears >= 3 && holdingYears < 4) ||
                      (index === 1 && holdingYears >= 4 && holdingYears < 5) ||
                      (index === 2 && holdingYears >= 5 && holdingYears < 6) ||
                      (index === 3 && holdingYears >= 6 && holdingYears < 7) ||
                      (index === 4 && holdingYears >= 7 && holdingYears < 8) ||
                      (index === 5 && holdingYears >= 8 && holdingYears < 9) ||
                      (index === 6 && holdingYears >= 9 && holdingYears < 10) ||
                      (index === 7 && holdingYears >= 10)
                        ? "bg-primary/5"
                        : ""
                    }
                  >
                    <td className="px-3 py-2">{row.years}</td>
                    <td className="px-3 py-2 text-center font-medium">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
