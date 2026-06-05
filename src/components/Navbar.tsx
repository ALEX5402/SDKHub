"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Download, Database, LineChart, Terminal, Github } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Browse SDKs", icon: Database },
    { href: "/stats", label: "Analytics", icon: LineChart },
    { href: "/docs", label: "API Reference", icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E293B]/60 bg-[#05070F]/75 backdrop-blur-lg">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-emerald-400 p-[1px] shadow-md shadow-emerald-500/5 transition-all duration-300 group-hover:shadow-emerald-500/20 group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#05070F]">
                  <Download className="h-4.5 w-4.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                    SDK<span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Hub</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 border ${
                      isActive
                        ? "bg-[#0D1324] text-emerald-400 border-[#1E293B] shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]"
                        : "text-slate-400 border-transparent hover:bg-slate-900/50 hover:border-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-300"}`} />
                    <span className="font-mono text-xs">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="h-4 w-[1px] bg-slate-800/80 hidden md:block"></div>

            <a
              href="https://github.com/ALEX5402/SDKHub"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-[#0D1324]/40 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-300 transition-all duration-300 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:-translate-y-0.5 shadow-sm font-mono"
            >
              <Github className="h-3.5 w-3.5" />
              <span>Edit this page</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
