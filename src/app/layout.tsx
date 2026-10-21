import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VisiTrack — Suivi des visites médicales",
  description: "Application de planification et de suivi des tournées de visiteur médical — projet de Papa Cheikh Ndiaye.",
  keywords: ["visite médicale", "CRM", "tournées", "pharma", "Next.js", "dashboard"],
  authors: [{ name: "Papa Cheikh Ndiaye" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "VisiTrack — Suivi des visites médicales",
    description: "Planification des tournées, suivi des clients et reporting d'activité.",
    siteName: "VisiTrack",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
