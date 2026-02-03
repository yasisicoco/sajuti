import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rawAppUrl =
  typeof process.env.NEXT_PUBLIC_APP_URL === "string" &&
  process.env.NEXT_PUBLIC_APP_URL.length > 0
    ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "").trim()
    : "";

const appUrl = rawAppUrl || null;

function getMetadataBase(): URL | undefined {
  if (!appUrl) return undefined;
  try {
    const url =
      appUrl.startsWith("http://") || appUrl.startsWith("https://")
        ? appUrl
        : `https://${appUrl}`;
    return new URL(url);
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "MBTI × 사주 궁합",
  description:
    "모임을 만들고 친구를 불러서 MBTI·사주 궁합을 한눈에 보세요. 엔터테인먼트 참고용.",
  openGraph: {
    title: "MBTI × 사주 궁합 — 우리 궁합 한번 볼래?",
    description:
      "모임을 만들고 친구를 초대하면 MBTI 궁합과 사주 궁합을 한눈에 볼 수 있어요. 참여한 사람끼리 궁합 등급과 상세 해석까지!",
    type: "website",
    locale: "ko_KR",
    url: appUrl ?? undefined,
    siteName: "MBTI × 사주 궁합",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "MBTI × 사주 궁합",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MBTI × 사주 궁합 — 우리 궁합 한번 볼래?",
    description:
      "모임을 만들고 친구를 초대하면 MBTI·사주 궁합을 한눈에 볼 수 있어요.",
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e9d5ff" },
    { media: "(prefers-color-scheme: dark)", color: "#2e1065" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
