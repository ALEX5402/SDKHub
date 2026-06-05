"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Search, 
  Download, 
  Cpu, 
  Layers, 
  Globe, 
  RefreshCw, 
  Check, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  Server,
  Info,
  Archive,
  Box,
  Settings,
  Monitor,
  HardDrive,
  Terminal
} from "lucide-react";

interface Tool {
  name: string;
  version: string;
  os: string;
  arch: string;
  downloadUrl: string;
  checksum: string;
  sizeBytes: number;
  lastUpdated: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOS, setSelectedOS] = useState("all");
  const [selectedArch, setSelectedArch] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    { id: "all", label: "All Packages", icon: Box },
    { id: "ndk", label: "NDK", icon: Cpu },
    { id: "cmake", label: "CMake", icon: Terminal },
    { id: "build-tools", label: "Build Tools", icon: Settings },
    { id: "platform-tools", label: "Platform Tools", icon: Layers },
    { id: "platforms", label: "SDK Platforms", icon: Monitor },
    { id: "system-images", label: "System Images", icon: Globe },
    { id: "add-ons", label: "SDK Add-ons", icon: HardDrive },
  ];

  const getToolIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.startsWith("ndk")) return Cpu;
    if (lowercaseName.startsWith("cmake")) return Terminal;
    if (lowercaseName.startsWith("build-tools")) return Settings;
    if (lowercaseName.startsWith("platform-tools")) return Layers;
    if (lowercaseName.startsWith("platforms")) return Monitor;
    if (lowercaseName.startsWith("system-images")) return Globe;
    if (lowercaseName.startsWith("add-ons")) return HardDrive;
    return Server;
  };

  const formatToolName = (n: string) => {
    if (n.startsWith("system-images;")) {
      const parts = n.split(";");
      const apiLevel = parts[1] ? parts[1].toUpperCase() : "";
      const type = parts[2]
        ? parts[2]
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "";
      return `System Image (${apiLevel}) - ${type}`;
    }
    if (n.startsWith("add-ons;")) {
      const parts = n.split(";");
      const type = parts[1]
        ? parts[1]
            .replace("addon-", "")
            .replace(/_/g, " ")
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "";
      return `SDK Add-on - ${type}`;
    }
    return n;
  };

  const fetchTools = async () => {
    setLoading(true);
    try {
      let url = `/api/tools?page=${currentPage}&limit=10`;
      
      if (selectedCategory !== "all") {
        url += `&name=${selectedCategory}`;
      }
      
      if (searchTerm) {
        url += `&q=${encodeURIComponent(searchTerm)}`;
      }

      if (selectedOS !== "all") {
        url += `&os=${selectedOS}`;
      }
      if (selectedArch !== "all") {
        url += `&arch=${selectedArch}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTools(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to load tools", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [currentPage, selectedCategory, selectedOS, selectedArch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTools();
  };

  const handleCopyChecksum = (checksum: string, index: number) => {
    navigator.clipboard.writeText(checksum);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0 || !bytes) return "Unknown Size";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-[#1E293B]/60 bg-gradient-to-b from-[#0D1324] to-[#070A13] px-6 py-8 md:px-10 md:py-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.06),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_80%,rgba(59,130,246,0.06),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1E293B/15_1px,transparent_1px),linear-gradient(to_bottom,#1E293B/15_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] opacity-20"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>INDEX SYNCHRONIZED</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl leading-tight">
              SDKHub <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">SDK & NDK</span> Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              A lightning-fast, developer-oriented interface to inspect, query, and download Android system images, compilers, and tools directly from Google CDNs.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-900">
              <div className="flex items-center space-x-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>SQLite Store</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Fast Direct Links</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Rest API</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="glass-panel rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-2xl relative overflow-hidden font-mono text-xs text-slate-300">
              <div className="absolute top-0 right-0 left-0 h-7 bg-slate-900/40 border-b border-slate-850 flex items-center justify-between px-4">
                <div className="flex space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500/80"></span>
                  <span className="w-2 h-2 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80"></span>
                </div>
                <span className="text-[9px] text-slate-500 font-semibold tracking-wider">sdk-telemetry-console</span>
              </div>
              <div className="mt-4 space-y-2.5 pt-2 leading-relaxed text-[11px]">
                <div className="flex items-center space-x-2 text-slate-500">
                  <span>$</span>
                  <span className="text-emerald-400 font-semibold">curl -I /api/tools?name=cmake</span>
                </div>
                <div className="text-slate-400">
                  HTTP/2 200 OK<br />
                  content-type: application/json<br />
                  x-backend: LibSQL SQLite Engine
                </div>
                <div className="border-t border-slate-850 my-2 pt-2"></div>
                <div className="flex items-center space-x-2 text-slate-500">
                  <span>$</span>
                  <span className="text-cyan-400 font-semibold">sdkmanager --install "ndk;26"</span>
                </div>
                <div className="text-emerald-400/90 flex items-center space-x-1.5">
                  <span className="inline-block animate-pulse text-emerald-400">●</span>
                  <span>Redirecting to Google repository... [OK]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`flex flex-col items-center justify-center text-center p-3.5 rounded-xl border transition-all duration-300 relative group overflow-hidden ${
                isSelected
                  ? "bg-gradient-to-b from-[#10B981]/15 to-[#3B82F6]/5 border-emerald-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.15)]"
                  : "bg-[#0D1324]/40 border-slate-800/80 hover:border-slate-700/80 hover:bg-[#0D1324]/80 hover:-translate-y-0.5"
              }`}
            >
              {isSelected && (
                <span className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-400 to-cyan-400 animate-pulse"></span>
              )}
              <div className={`p-2 rounded-lg mb-2 transition-all duration-300 ${
                isSelected 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-slate-950 text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-900"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-[11px] font-bold font-mono tracking-tight transition-colors duration-300 ${
                isSelected ? "text-emerald-400" : "text-slate-300 group-hover:text-white"
              }`}>
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters & Table Wrapper */}
      <div className="bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-2xl p-5 space-y-5 backdrop-blur-md">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 items-stretch">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by keyword (e.g. ndk, cmake, system-images)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#05070F] border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/15 transition-all"
            />
          </div>

          {/* OS Filter */}
          <div className="w-full md:w-48 relative">
            <select
              value={selectedOS}
              onChange={(e) => {
                setSelectedOS(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#05070F] border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/15 cursor-pointer appearance-none"
            >
              <option value="all" className="bg-[#05070F] text-slate-300">All Platforms</option>
              <option value="windows" className="bg-[#05070F] text-slate-300">Windows</option>
              <option value="macosx" className="bg-[#05070F] text-slate-300">macOS</option>
              <option value="linux" className="bg-[#05070F] text-slate-300">Linux</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <span className="text-[10px]">▼</span>
            </div>
          </div>

          {/* Architecture Filter */}
          <div className="w-full md:w-48 relative">
            <select
              value={selectedArch}
              onChange={(e) => {
                setSelectedArch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#05070F] border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/15 cursor-pointer appearance-none"
            >
              <option value="all" className="bg-[#05070F] text-slate-300">All CPU Arch</option>
              <option value="x86_64" className="bg-[#05070F] text-slate-300">x86_64 (64-bit)</option>
              <option value="arm64" className="bg-[#05070F] text-slate-300">arm64 (Apple Silicon/ARM)</option>
              <option value="x86" className="bg-[#05070F] text-slate-300">x86 (32-bit)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <span className="text-[10px]">▼</span>
            </div>
          </div>

          <button
            type="submit"
            className="glow-btn bg-emerald-500 hover:bg-emerald-400 text-[#05070F] font-bold text-xs rounded-xl py-2.5 px-6 transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95"
          >
            Find
          </button>
        </form>

        {/* Tools Listing Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
              <span className="text-xs text-slate-500 font-mono">Querying database...</span>
            </div>
          ) : tools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-2 border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
              <Archive className="h-8 w-8 text-slate-600 mb-1" />
              <span className="text-xs font-semibold text-slate-400 font-mono">No matching records found</span>
              <span className="text-[10px] text-slate-600 font-mono">Try modifying search tags or category tab</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#1E293B]/60 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-3 w-[40%]">Package Reference</th>
                  <th className="py-3.5 px-3 w-[15%]">Version</th>
                  <th className="py-3.5 px-3 w-[10%]">Platform</th>
                  <th className="py-3.5 px-3 w-[10%]">Arch</th>
                  <th className="py-3.5 px-3 w-[10%]">Size</th>
                  <th className="py-3.5 px-3 w-[15%]">Checksum</th>
                  <th className="py-3.5 px-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {tools.map((tool, idx) => {
                  const ToolIcon = getToolIcon(tool.name);
                  return (
                    <tr key={idx} className="group hover:bg-[#0D1324]/20 transition-all duration-200">
                      <td className="py-3.5 px-3">
                        <Link 
                          href={`/tools/${tool.name}/${tool.version}`}
                          className="flex items-center space-x-3.5"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 border border-slate-850 group-hover:border-emerald-500/30 transition-all duration-300">
                            <ToolIcon className="h-4 w-4 text-emerald-400/90 group-hover:text-emerald-300 transition-colors" />
                          </div>
                          <div className="truncate">
                            <span className="font-bold text-white group-hover:text-emerald-400 transition-all text-xs truncate block max-w-[280px] sm:max-w-[360px]" title={tool.name}>
                              {formatToolName(tool.name)}
                            </span>
                          </div>
                        </Link>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300 text-xs font-mono">{tool.version}</td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold font-mono tracking-wider border capitalize ${
                          tool.os === "windows"
                            ? "bg-blue-500/5 text-blue-400 border-blue-500/20"
                            : tool.os === "macosx"
                            ? "bg-violet-500/5 text-violet-400 border-violet-500/20"
                            : tool.os === "linux"
                            ? "bg-amber-500/5 text-amber-400 border-amber-500/20"
                            : "bg-slate-500/5 text-slate-400 border-slate-500/20"
                        }`}>
                          <Globe className="h-2.5 w-2.5 mr-1" />
                          {tool.os}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold font-mono tracking-wider border uppercase ${
                          tool.arch === "arm64"
                            ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                            : tool.arch === "x86_64"
                            ? "bg-cyan-500/5 text-cyan-400 border-cyan-500/20"
                            : "bg-slate-500/5 text-slate-400 border-slate-500/20"
                        }`}>
                          <Cpu className="h-2.5 w-2.5 mr-1" />
                          {tool.arch}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-400 text-xs font-mono">{formatBytes(tool.sizeBytes)}</td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] font-mono text-slate-600 truncate max-w-[90px] xl:max-w-[130px]" title={tool.checksum}>
                            {tool.checksum}
                          </span>
                          <button
                            onClick={() => handleCopyChecksum(tool.checksum, idx)}
                            className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-900 transition-colors"
                            title="Copy Checksum"
                          >
                            {copiedIndex === idx ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex justify-end items-center space-x-2">
                          <Link
                            href={`/tools/${tool.name}/${tool.version}`}
                            className="inline-flex h-7 w-7 items-center justify-center p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-md border border-transparent hover:border-slate-800 transition-all"
                            title="Package Inspector"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </Link>
                          <a
                            href={`/api/tools/download?name=${tool.name}&version=${tool.version}&os=${tool.os}&arch=${tool.arch}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-[#05070F] p-1.5 font-bold transition-all border border-emerald-500/20 shadow-sm"
                            title="Fetch Archive"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Section */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800/60 pt-4">
            <span className="text-[11px] text-slate-500 font-mono">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total items)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="inline-flex items-center space-x-1 border border-slate-800 bg-[#05070F] hover:bg-slate-900 rounded-lg px-3 py-1.5 text-[11px] font-bold font-mono text-slate-400 disabled:opacity-40 disabled:hover:bg-[#05070F] transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>
              <button
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                className="inline-flex items-center space-x-1 border border-slate-800 bg-[#05070F] hover:bg-slate-900 rounded-lg px-3 py-1.5 text-[11px] font-bold font-mono text-slate-400 disabled:opacity-40 disabled:hover:bg-[#05070F] transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
