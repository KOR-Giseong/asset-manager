"use client";

// =========================================
// 세금 비교 막대 차트
// =========================================

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { TaxComparisonData } from "@/types/tax";
import { formatKRW } from "@/lib/format";

// =========================================
// 타입 정의
// =========================================

interface TaxComparisonChartProps {
  data: TaxComparisonData[];
}

// =========================================
// 커스텀 툴팁
// =========================================

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; color: string; name: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur">
        <p className="mb-2 text-sm font-semibold">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{formatKRW(entry.value)}</span>
            </div>
          ))}
          {payload.length === 2 && (
            <div className="mt-2 border-t border-border/50 pt-2">
              <span className="text-xs text-emerald-500 font-medium">
                절세: {formatKRW(payload[0].value - payload[1].value)}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

// =========================================
// 메인 컴포넌트
// =========================================

export function TaxComparisonChart({ data }: TaxComparisonChartProps) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base">세금 비교 (절세 전/후)</CardTitle>
        <CardDescription className="text-[10px] sm:text-xs">
          절세 전략 적용 전후 세금 비교
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
              barCategoryGap="20%"
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                tickFormatter={(value) => {
                  if (value >= 10000) {
                    return `${(value / 10000).toFixed(0)}만`;
                  }
                  return value.toString();
                }}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
              <Bar
                dataKey="before"
                name="절세 전"
                fill="#ef4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
              <Bar
                dataKey="after"
                name="절세 후"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                maxBarSize={50}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
