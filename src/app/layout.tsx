import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDKHub - Android SDK & NDK Manager",
  description: "Web interface and API for Android NDK, SDK platform, build-tools, and CMake versions on SDKHub.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} h-full antialiased dark`}
      suppressHydrationWarning={true}
    >
      <body className="min-h-full flex flex-col bg-[#070A13] text-[#E2E8F0] selection:bg-emerald-500/30 selection:text-emerald-300">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="w-full border-t border-[#1E293B] bg-[#070A13] py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p>© {new Date().getFullYear()} SDKHub (Inspired by fdroid tools). All rights reserved.</p>
            <div className="flex space-x-4">
              <Link href="/docs" className="hover:text-slate-300 transition-colors">API Docs</Link>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">Fast CDN Downloads direct from Google Repositories</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
