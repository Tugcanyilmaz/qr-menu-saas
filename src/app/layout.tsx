import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QR Menü SaaS — Ücretsiz Dijital QR Menü",
  description: "İşletmeniz için dakikalar içinde ücretsiz dijital QR menü oluşturun.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">
        {/* Navbar daha önce hiç eklenmemişti; çıkış butonu bu yüzden görünmüyordu */}
        <Navbar />
        {children}
      </body>
    </html>
  );
}
