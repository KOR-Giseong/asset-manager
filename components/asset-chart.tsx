"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatKRW } from "@/lib/format";
import type { ChartDataItem } from "@/types/asset";

interface AssetChartProps {
  data: ChartDataItem[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 text-sm shadow-md">
        <p className="font-medium text-card-foreground">{payload[0].name}</p>
        <p className="text-muted-foreground">{formatKRW(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export function AssetChart({ data }: AssetChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[150px] items-center justify-center text-xs text-muted-foreground sm:h-[200px] sm:text-sm">
        자산을 추가하면 비중 차트가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      {/* 차트 - 모바일에서 작게 */}
      <div className="h-[150px] w-[150px] shrink-0 sm:h-[200px] sm:w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* 범례 - 모바일에서 가로 배치 */}
      <div className="flex flex-wrap justify-center gap-3 sm:flex-col sm:gap-2">
        {data.map((item) => {
          const ratio = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={item.name} className="flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm">
              <div
                className="h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="text-muted-foreground">{ratio}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
