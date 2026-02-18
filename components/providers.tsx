"use client";

// =========================================
// 앱 전역 프로바이더
// =========================================

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { PrivacyModeProvider } from "@/components/privacy-mode-context";
import { PushProvider } from "@/components/push-context";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <PrivacyModeProvider>
        <PushProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </PushProvider>
      </PrivacyModeProvider>
    </SessionProvider>
  );
}
