"use client";

// =========================================
// 세금 비중 파이 차트
// =========================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { TaxPieData } from "@/types/tax";
import { formatKRW } from "@/lib/format";

// =========================================
// 타입 정의
// =========================================

interface TaxPieChartProps {
  data: TaxPieData[];
  totalAssets: number;
}

// =========================================
// 커스텀 툴팁
// =========================================

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; color: string } }> }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-sm font-medium">{data.name}</span>
        </div>
        <p className="mt-1 text-lg font-bold">{formatKRW(data.value)}</p>
      </div>
    );
  }
  return null;
}

// =========================================
// 커스텀 라벨
// =========================================

interface LabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

function renderCustomLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: LabelProps) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-medium sm:text-xs"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

// =========================================
// 메인 컴포넌트
// =========================================

export function TaxPieChart({ data, totalAssets }: TaxPieChartProps) {
  // 세금 비율 계산
  const taxData = data.find((d) => d.name === "총 세금");
  const taxRatio = taxData ? (taxData.value / totalAssets) * 100 : 0;

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base">자산 대비 세금 비중</CardTitle>
        <CardDescription className="text-[10px] sm:text-xs">
          전체 자산 중 세금이 차지하는 비율
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="flex flex-col items-center">
          <div className="h-[200px] w-full sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius="80%"
                  innerRadius="40%"
                  dataKey="value"
                  strokeWidth={2}
                  stroke="hsl(var(--background))"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 범례 */}
          <div className="mt-2 flex flex-wrap justify-center gap-4 sm:mt-4">
            {data.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-muted-foreground">{entry.name}</span>
                <span className="text-xs font-medium">{formatKRW(entry.value)}</span>
              </div>
            ))}
          </div>

          {/* 요약 정보 */}
          <div className="mt-4 w-full rounded-lg border border-border/50 bg-muted/30 p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">총 자산</p>
                <p className="text-sm font-bold sm:text-base">{formatKRW(totalAssets)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground sm:text-xs">세금 비율</p>
                <p className={`text-sm font-bold sm:text-base ${
                  taxRatio > 10 ? "text-red-500" : taxRatio > 5 ? "text-amber-500" : "text-emerald-500"
                }`}>
                  {taxRatio.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
