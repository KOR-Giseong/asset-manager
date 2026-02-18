"use client";

import { formatKRW } from "@/lib/format";
import { Sensitive } from "@/components/sensitive";

export function FormattedCurrency({ value }: { value: number }) {
  return <Sensitive>{formatKRW(value)}</Sensitive>;
}
