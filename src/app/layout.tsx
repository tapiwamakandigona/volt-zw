import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "VoltZW — Track your ZESA electricity tokens",
  description:
    "VoltZW helps Zimbabweans track, manage and understand their ZESA prepaid electricity tokens. Never run out unexpectedly. Free token vault, tariff calculator, and outage map.",
  keywords: [
    "ZESA",
    "ZESA tokens",
    "electricity tokens Zimbabwe",
    "prepaid electricity Zimbabwe",
    "ZESA token tracker",
    "ZETDC",
    "load shedding Zimbabwe",
  ],
  authors: [{ name: "Tapiwa Makandigona" }],
  openGraph: {
    title: "VoltZW — Track your ZESA electricity tokens",
    description:
      "Track, manage and understand your ZESA prepaid electricity tokens. Never run out unexpectedly.",
    url: "https://zesa.tapiwa.me",
    siteName: "VoltZW",
    type: "website",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body>{children}</body>
    </html>
  );
}
