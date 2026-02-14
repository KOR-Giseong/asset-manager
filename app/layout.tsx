import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "sonner";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "자산 관리 대시보드",
  description: "나의 자산 현황을 한눈에 관리하세요",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              classNames: {
                toast: "bg-card text-card-foreground border-border shadow-lg",
                title: "font-semibold",
                description: "text-muted-foreground",
                success: "border-emerald-500/20 bg-emerald-500/10",
                error: "border-red-500/20 bg-red-500/10",
                loading: "border-blue-500/20 bg-blue-500/10",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
