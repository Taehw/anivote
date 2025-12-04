import type { Metadata } from "next";
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

export const metadata = {
  title: '🏆 애니vote - 애니 명장면 투표 순위', // 카톡에 뜨는 제목
  description: '최애 애니메이션 명장면을 뽑는 실시간 투표 서비스', // 카톡에 뜨는 설명
  // OG 이미지 설정
  openGraph: {
    title: '🏆 애니vote - 지금 투표하세요!',
    description: '최애 애니메이션 명장면을 뽑는 실시간 투표 서비스',
    url: 'https://anivote.vercel.app/', // 네 서비스 주소
    siteName: '애니vote',
    images: [
      {
        url: 'https://anivote.vercel.app/og_image.jpeg', // 👈 1단계에서 넣은 이미지 주소
        width: 1200,
        height: 536,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
