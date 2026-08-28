import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "課程冒險 CourseQuest",
  description: "把課程變成關卡，把知識變成招式。打倒小怪學觀念，擊敗大魔王證明你學會了！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>
        <div id="app-root">{children}</div>
      </body>
    </html>
  );
}
