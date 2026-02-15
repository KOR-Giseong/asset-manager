"use client";

// =========================================
// 부동산 관리 페이지
// =========================================

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Loader2, Building2 } from "lucide-react";
import { SidebarLayout } from "@/components/layout";
import { PageHeader } from "@/components/ui/page-header";
import { PropertyDashboard } from "@/components/property/property-dashboard";
import { getProperties } from "@/app/actions/property-actions";
import type { Property } from "@/types/property";

// =========================================
// 메인 페이지 컴포넌트
// =========================================

export default function PropertyPage() {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  // 인증 확인
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  // 데이터 로드
  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      const result = await getProperties();
      if (result) {
        setProperties(result);
      }
      setLoading(false);
    }

    if (session?.user) {
      loadProperties();
    }
  }, [session]);

  // 로딩 상태
  if (status === "loading" || loading) {
    return (
      <SidebarLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SidebarLayout>
    );
  }

  // 인증되지 않은 경우
  if (!session) {
    return null;
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen">
        <PageHeader
          title="부동산 관리"
          subtitle={<>보유 부동산을 통합 관리하고<br />현금흐름을 추적하세요.</>}
          icon={Building2}
          iconColor="bg-emerald-500/10"
          iconTextColor="text-emerald-500"
        />

        <div className="container max-w-5xl px-4 py-6">
          <PropertyDashboard properties={properties} />
        </div>
      </div>
    </SidebarLayout>
  );
}
