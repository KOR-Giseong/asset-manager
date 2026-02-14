"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface AssetChartProps {
  data: { name: string; value: number; color: string }[];
}

function formatKRW(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
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
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        자산을 추가하면 비중 차트가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="h-[200px] w-[200px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
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
      <div className="flex flex-col gap-2">
        {data.map((item) => {
          const ratio = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-foreground font-medium">{item.name}</span>
              <span className="text-muted-foreground">{ratio}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
