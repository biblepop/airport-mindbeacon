import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 마음등대 | 인천국제공항",
  description: "AI가 먼저 찾아가는, 세계 최초 능동형 심리안전 케어 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body className="font-pretendard antialiased bg-airport-bg text-airport-black">
        {children}
      </body>
    </html>
  );
}
