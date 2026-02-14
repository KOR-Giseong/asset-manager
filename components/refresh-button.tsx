"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { refreshPrices } from "@/app/actions/asset-actions";
import { handleActionResult, toastMessages } from "@/lib/toast-helpers";

export function RefreshButton() {
  const [isRefreshing, startRefresh] = useTransition();

  function handleRefresh() {
    startRefresh(async () => {
      const result = await refreshPrices();
      handleActionResult(result, {
        success: toastMessages.asset.refresh.success,
        error: toastMessages.asset.refresh.error,
      });
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      {isRefreshing ? "업데이트 중..." : "시세 업데이트"}
    </Button>
  );
}
