"use client";

// =========================================
// 부동산 세금 계산기 (취득세 / 양도세)
// =========================================

import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, Info, Home, Calendar, MapPin, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  calculatePropertyAcquisitionTax,
  calculatePropertyCapitalGainsTax,
} from "@/services/taxService";
import { formatKRW } from "@/lib/format";
import type { HousingCount } from "@/types/tax";

// =========================================
// 타입 정의
// =========================================

interface PropertyTaxCalculatorProps {
  propertyPurchasePrice: number;
}

type TabType = "acquisition" | "capital-gains";

// =========================================
// 주택 수 선택 컴포넌트 (재사용 가능)
// =========================================

interface HousingCountSelectorProps {
  value: HousingCount;
  onChange: (count: HousingCount) => void;
  label?: string;
}

function HousingCountSelector({ value, onChange, label = "주택 수" }: HousingCountSelectorProps) {
  const options: { value: HousingCount; label: string }[] = [
    { value: 1, label: "1주택" },
    { value: 2, label: "2주택" },
    { value: 3, label: "3주택+" },
  ];

  return (
    <div className="space-y-2">
      <Label className="text-xs sm:text-sm">{label}</Label>
      <div className="flex gap-1.5 sm:gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded-lg px-2 py-2 text-xs font-medium transition-all sm:px-3 sm:text-sm ${
              value === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// =========================================
// 조정지역 토글 컴포넌트 (재사용 가능)
// =========================================

interface RegulatedAreaToggleProps {
  value: boolean;
  onChange: (isRegulated: boolean) => void;
}

function RegulatedAreaToggle({ value, onChange }: RegulatedAreaToggleProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs sm:text-sm">지역 구분</Label>
      <div className="flex gap-1.5 sm:gap-2">
        <button
          onClick={() => onChange(false)}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all sm:px-3 sm:text-sm ${
            !value
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          비조정지역
        </button>
        <button
          onClick={() => onChange(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all sm:px-3 sm:text-sm ${
            value
              ? "bg-orange-500/10 text-orange-600 border border-orange-500/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          <AlertTriangle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          조정대상지역
        </button>
      </div>
    </div>
  );
}

// =========================================
// 메인 컴포넌트
// =========================================

export function PropertyTaxCalculator({
  propertyPurchasePrice,
}: PropertyTaxCalculatorProps) {
  const [activeTab, setActiveTab] = useState<TabType>("acquisition");

  // 공통 입력
  const [housingCount, setHousingCount] = useState<HousingCount>(1);
  const [isRegulatedArea, setIsRegulatedArea] = useState(false);

  // 취득세 입력
  const [purchasePrice, setPurchasePrice] = useState(propertyPurchasePrice || 600_000_000);
  const [isLifeFirstHome, setIsLifeFirstHome] = useState(false);
  const [area, setArea] = useState(85);

  // 양도세 입력
  const [salePrice, setSalePrice] = useState(800_000_000);
  const [holdingYears, setHoldingYears] = useState(3);
  const [residenceYears, setResidenceYears] = useState(2);
  const [acquisitionCost, setAcquisitionCost] = useState(20_000_000);

  // 취득세 계산
  const acquisitionResult = useMemo(() => {
    return calculatePropertyAcquisitionTax({
      purchasePrice,
      housingCount,
      isRegulatedArea,
      isLifeFirstHome,
      area,
    });
  }, [purchasePrice, housingCount, isRegulatedArea, isLifeFirstHome, area]);

  // 양도세 계산
  const capitalGainsResult = useMemo(() => {
    return calculatePropertyCapitalGainsTax({
      purchasePrice: propertyPurchasePrice || purchasePrice,
      salePrice,
      holdingYears,
      residenceYears,
      housingCount,
      isRegulatedArea,
      acquisitionCost,
    });
  }, [propertyPurchasePrice, purchasePrice, salePrice, holdingYears, residenceYears, housingCount, isRegulatedArea, acquisitionCost]);

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
                1주택: 6억↓1%, 6~9억 2%, 9억↑3%. 
                2주택(조정) 8%, 3주택+ 12%.
                생애최초 12억↓ 200만원 감면.
              </p>
            </div>
          </div>

          {/* 주택 수 및 지역 선택 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <HousingCountSelector
              value={housingCount}
              onChange={setHousingCount}
              label="취득 후 주택 수"
            />
            <RegulatedAreaToggle
              value={isRegulatedArea}
              onChange={setIsRegulatedArea}
            />
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

          {/* 생애최초 체크 (1주택만) */}
          {housingCount === 1 && (
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-xs sm:text-sm">
                <input
                  type="checkbox"
                  checked={isLifeFirstHome}
                  onChange={(e) => setIsLifeFirstHome(e.target.checked)}
                  className="rounded border-border"
                />
                생애최초 주택 (12억 이하 200만원 감면)
              </label>
            </div>
          )}

          {/* 중과세 경고 */}
          {acquisitionResult.isHeavyTax && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 sm:p-4">
              <p className="text-xs font-semibold text-orange-600 sm:text-sm">
                ⚠️ 중과세 적용: {acquisitionResult.heavyTaxReason}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                취득세율 {(acquisitionResult.acquisitionTaxRate * 100).toFixed(0)}% 적용
              </p>
            </div>
          )}

          {/* 생애최초 감면 안내 */}
          {isLifeFirstHome && acquisitionResult.lifeFirstHomeReduction && acquisitionResult.lifeFirstHomeReduction > 0 && (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 sm:p-4">
              <p className="text-xs font-semibold text-emerald-600 sm:text-sm">
                🎉 생애최초 주택 감면 적용!
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                취득세 {formatKRW(acquisitionResult.lifeFirstHomeReduction)} 감면 (200만원 한도)
              </p>
            </div>
          )}

          {/* 결과 */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-500/20 bg-blue-500/5 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[9px] text-muted-foreground sm:text-xs">취득세</p>
                <p className="text-sm font-bold text-foreground truncate sm:text-xl">
                  {formatKRW(acquisitionResult.acquisitionTax)}
                </p>
                <p className="mt-1 text-[9px] text-muted-foreground">
                  {(acquisitionResult.acquisitionTaxRate * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[9px] text-muted-foreground sm:text-xs">지방교육세</p>
                <p className="text-sm font-bold text-foreground truncate sm:text-xl">
                  {formatKRW(acquisitionResult.localEducationTax)}
                </p>
                <p className="mt-1 text-[9px] text-muted-foreground">
                  취득세의 10%
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 bg-amber-500/5 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[9px] text-muted-foreground sm:text-xs">농어촌특별세</p>
                <p className="text-sm font-bold text-foreground truncate sm:text-xl">
                  {formatKRW(acquisitionResult.specialTax)}
                </p>
                <p className="mt-1 text-[9px] text-muted-foreground">
                  {area > 85 ? "85㎡ 초과" : "해당 없음"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[9px] text-muted-foreground sm:text-xs">총 취득세</p>
                <p className="text-sm font-bold text-red-500 truncate sm:text-xl">
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
                1주택: 12억↓ 비과세, 장특공 최대 80%.
                2주택(조정) +20%p 중과, 3주택+ +30%p.
                조정지역 다주택은 장특공 배제.
              </p>
            </div>
          </div>

          {/* 주택 수 및 지역 선택 */}
          <div className="grid gap-4 sm:grid-cols-2">
            <HousingCountSelector
              value={housingCount}
              onChange={setHousingCount}
              label="양도 시점 주택 수"
            />
            <RegulatedAreaToggle
              value={isRegulatedArea}
              onChange={setIsRegulatedArea}
            />
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
              <Label htmlFor="residence" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Home className="h-3.5 w-3.5 text-rose-500" />
                거주기간 (년)
              </Label>
              <Input
                id="residence"
                type="number"
                value={residenceYears}
                onChange={(e) => setResidenceYears(parseInt(e.target.value) || 0)}
                className="text-sm"
                max={holdingYears}
              />
              <p className="text-[9px] text-muted-foreground">장특공 계산용</p>
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

          {/* 중과세 경고 (양도세) */}
          {capitalGainsResult.isHeavyTax && (
            <div className="space-y-2">
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 sm:p-4">
                <p className="text-xs font-semibold text-orange-600 sm:text-sm">
                  ⚠️ 중과세 적용: {capitalGainsResult.heavyTaxReason}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                  기본세율 + {(capitalGainsResult.surtaxRate * 100).toFixed(0)}%p 중과, 장기보유특별공제 배제
                </p>
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 sm:p-4">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 sm:text-xs">
                  💡 현재 다주택자 양도세 중과 유예 중 (~2026.5.9). 유예 기간 내 양도 시 기본세율 적용 및 장특공 가능.
                  위 금액은 유예 종료 후 기준입니다.
                </p>
              </div>
            </div>
          )}

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
            <Card className="border-blue-500/20 bg-blue-500/5 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[9px] text-muted-foreground sm:text-xs">양도차익</p>
                <p className="text-sm font-bold text-foreground truncate sm:text-xl">
                  {formatKRW(capitalGainsResult.gain)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[9px] text-muted-foreground sm:text-xs">장특공</p>
                <p className="text-sm font-bold text-foreground truncate sm:text-xl">
                  {formatKRW(capitalGainsResult.longTermDeduction)}
                </p>
                <p className="mt-1 text-[9px] text-muted-foreground">
                  {housingCount === 1 ? (
                    <>보유 {(capitalGainsResult.holdingDeductionRate * 100).toFixed(0)}% + 거주 {(capitalGainsResult.residenceDeductionRate * 100).toFixed(0)}%</>
                  ) : capitalGainsResult.isHeavyTax ? (
                    <>조정지역 다주택: 배제</>
                  ) : (
                    <>일반 {(capitalGainsResult.longTermDeductionRate * 100).toFixed(0)}%</>
                  )}
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-500/20 bg-amber-500/5 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[9px] text-muted-foreground sm:text-xs">과세표준</p>
                <p className="text-sm font-bold text-foreground truncate sm:text-xl">
                  {formatKRW(capitalGainsResult.taxableIncome)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/20 bg-red-500/5 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <p className="text-[9px] text-muted-foreground sm:text-xs">총 양도세</p>
                <p className="text-sm font-bold text-red-500 truncate sm:text-xl">
                  {formatKRW(capitalGainsResult.totalTax)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 장기보유특별공제율 안내 */}
          {housingCount === 1 ? (
            // 1주택자: 보유 + 거주 분리 공제
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 보유기간 공제율 */}
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-[10px] sm:text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-2 py-1.5 text-left font-medium" colSpan={2}>
                          📅 보유기간 공제 (연 4%, 최대 40%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { years: 3, label: "3년" },
                        { years: 5, label: "5년" },
                        { years: 7, label: "7년" },
                        { years: 10, label: "10년+" },
                      ].map((row) => {
                        const rate = Math.min(row.years * 4, 40);
                        const isActive = holdingYears >= row.years && 
                          (row.years === 10 || holdingYears < (row.years === 3 ? 5 : row.years === 5 ? 7 : 10));
                        return (
                          <tr key={row.label} className={isActive ? "bg-blue-50 dark:bg-blue-950/30" : ""}>
                            <td className="px-2 py-1.5">{row.label}</td>
                            <td className="px-2 py-1.5 text-right font-medium text-blue-600 dark:text-blue-400">{rate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* 거주기간 공제율 */}
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-[10px] sm:text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-2 py-1.5 text-left font-medium" colSpan={2}>
                          🏠 거주기간 공제 (연 4%, 최대 40%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {[
                        { years: 2, label: "2년" },
                        { years: 4, label: "4년" },
                        { years: 6, label: "6년" },
                        { years: 10, label: "10년+" },
                      ].map((row) => {
                        const rate = Math.min(row.years * 4, 40);
                        const isActive = residenceYears >= row.years && 
                          (row.years === 10 || residenceYears < (row.years === 2 ? 4 : row.years === 4 ? 6 : 10));
                        return (
                          <tr key={row.label} className={isActive ? "bg-green-50 dark:bg-green-950/30" : ""}>
                            <td className="px-2 py-1.5">{row.label}</td>
                            <td className="px-2 py-1.5 text-right font-medium text-green-600 dark:text-green-400">{rate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <p className="text-[10px] sm:text-xs text-muted-foreground text-center">
                💡 1세대1주택: 보유 최대 40% + 거주 최대 40% = <span className="font-semibold">최대 80%</span> 공제
              </p>
            </div>
          ) : (
            // 다주택자: 조정지역 여부에 따른 안내
            <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
              <p className="text-xs font-medium sm:text-sm">📋 다주택자 장기보유특별공제</p>
              {isRegulatedArea ? (
                <p className="mt-2 text-[10px] text-muted-foreground sm:text-xs">
                  조정대상지역 다주택자는 <span className="font-semibold text-orange-600">장기보유특별공제가 배제</span>됩니다.
                  양도차익 전액이 과세대상이 됩니다.
                </p>
              ) : (
                <p className="mt-2 text-[10px] text-muted-foreground sm:text-xs">
                  비조정지역 다주택자는 <span className="font-semibold text-blue-600">일반 장특공 (연 2%, 최대 30%)</span>가 적용됩니다.
                  현재 보유기간 {holdingYears}년 기준 공제율: {(capitalGainsResult.longTermDeductionRate * 100).toFixed(0)}%
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
