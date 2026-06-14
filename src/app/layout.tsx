import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NativeInit from "@/components/NativeInit";

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
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "VoltZW",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0e14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body>
        <NativeInit />
        {children}
      </body>
    </html>
  );
}
