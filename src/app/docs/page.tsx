"use client";

import { useState, useEffect } from "react";
import { 
  Terminal, 
  ChevronRight, 
  Code, 
  Copy, 
  Check, 
  Globe, 
  ExternalLink 
} from "lucide-react";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  summary: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: string;
  curlExample: string;
  responseExample: string;
}

export default function DocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const endpoints: Endpoint[] = [
    {
      method: "GET",
      path: "/api/tools",
      summary: "List available SDK tools/packages",
      description: "Retrieve all tools with optional filtering by type/name, OS, version, and architecture. Supports paginated results.",
      parameters: [
        { name: "name", type: "string", required: false, description: "Filter by category name (e.g. ndk, cmake, build-tools)" },
        { name: "version", type: "string", required: false, description: "Filter by exact version number" },
        { name: "os", type: "string", required: false, description: "Filter by OS compatibility (windows, macosx, linux)" },
        { name: "arch", type: "string", required: false, description: "Filter by target CPU architecture (x86_64, arm64, x86)" },
        { name: "q", type: "string", required: false, description: "General keyword query to search across name and version (e.g. 26.2.11394342)" },
        { name: "page", type: "integer", required: false, description: "Page index (starts at 1, defaults to 1)" },
        { name: "limit", type: "integer", required: false, description: "Items per page (max 100, defaults to 20)" },
      ],
      curlExample: `curl "http://localhost:3000/api/tools?name=cmake&os=linux"`,
      responseExample: `{
  "success": true,
  "data": [
    {
      "name": "cmake",
      "version": "3.22.1",
      "os": "linux",
      "arch": "x86_64",
      "downloadUrl": "https://dl.google.com/android/repository/cmake-3.22.1-linux-x86_64.zip",
      "checksum": "a394e3e41e7044e1dba2e89ff5187479451eabf01fb78af6dfcb131a6481ee6620",
      "sizeBytes": 82194829,
      "lastUpdated": "2026-06-05T18:10:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}`
    },
    {
      method: "GET",
      path: "/api/tools/versions",
      summary: "Get available versions of a tool",
      description: "List all unique versions available for a tool by name, optionally filtered by platform and architecture.",
      parameters: [
        { name: "name", type: "string", required: true, description: "Category name (e.g. ndk, cmake)" },
        { name: "os", type: "string", required: false, description: "Filter by OS target" },
        { name: "arch", type: "string", required: false, description: "Filter by CPU architecture" },
      ],
      curlExample: `curl "http://localhost:3000/api/tools/versions?name=ndk&os=macosx"`,
      responseExample: `{
  "success": true,
  "name": "ndk",
  "versions": [
    "26.1.10909125",
    "25.2.9519653"
  ]
}`
    },
    {
      method: "GET",
      path: "/api/tools/download",
      summary: "Download a tool package",
      description: "Logs the download statistics and redirects the client directly to the raw Google CDN zip package.",
      parameters: [
        { name: "name", type: "string", required: true, description: "Name of the tool (e.g. ndk)" },
        { name: "version", type: "string", required: true, description: "Version string (e.g. 26.1.10909125)" },
        { name: "os", type: "string", required: true, description: "Target OS (windows, macosx, linux)" },
        { name: "arch", type: "string", required: true, description: "Target architecture (x86_64, arm64)" },
      ],
      curlExample: `curl -L -o "ndk.zip" "http://localhost:3000/api/tools/download?name=ndk&version=26.1.10909125&os=macosx&arch=arm64"`,
      responseExample: `HTTP/1.1 302 Found\nLocation: https://dl.google.com/android/repository/android-ndk-r26b-darwin.zip`
    },
    {
      method: "GET",
      path: "/api/stats",
      summary: "Get download metrics & telemetry summary",
      description: "Returns aggregated statistics counts grouped by name, operating system, CPU architecture, and daily download frequency.",
      curlExample: `curl "http://localhost:3000/api/stats"`,
      responseExample: `{
  "success": true,
  "data": {
    "totalDownloads": 319,
    "topTools": [
      { "_id": "ndk", "count": 124 },
      { "_id": "cmake", "count": 85 }
    ],
    "osBreakdown": [
      { "_id": "linux", "count": 180 },
      { "_id": "macosx", "count": 95 }
    ],
    "archBreakdown": [
      { "_id": "x86_64", "count": 210 },
      { "_id": "arm64", "count": 109 }
    ],
    "trends": [
      { "_id": "2026-06-05", "count": 25 }
    ]
  }
}`
    },
    {
      method: "POST",
      path: "/api/admin/sync",
      summary: "Manually force sync repositories",
      description: "Triggers the worker to fetch index feeds from Google CDN and update database records. Protected by Bearer token or username/password body credentials.",
      requestBody: `{
  "username": "admin",
  "password": "yourpassword"
}`,
      curlExample: `curl -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"password"}' "http://localhost:3000/api/admin/sync"`,
      responseExample: `{
  "success": true,
  "message": "Successfully synced 237 tools metadata.",
  "count": 237,
  "logs": [
    {
      "timestamp": "2026-06-05T18:10:00.000Z",
      "status": "success",
      "message": "Successfully synced 237 tools metadata."
    }
  ]
}`
    }
  ];

  const [origin, setOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleCopy = (text: string, idx: number) => {
    const adjustedText = text.replace("http://localhost:3000", origin);
    navigator.clipboard.writeText(adjustedText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Table of contents sidebar */}
      <div className="hidden lg:block space-y-3">
        <div className="sticky top-24 space-y-4 bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-2xl p-4 backdrop-blur-md">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">APIs Overview</h3>
          <nav className="flex flex-col space-y-1.5">
            {endpoints.map((ep, idx) => (
              <a
                key={idx}
                href={`#endpoint-${idx}`}
                className="flex items-center space-x-2 py-1 text-slate-400 hover:text-emerald-400 transition-colors group"
              >
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold font-mono border ${
                  ep.method === "GET" 
                    ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/15" 
                    : "bg-blue-500/5 text-blue-400 border-blue-500/15"
                }`}>
                  {ep.method}
                </span>
                <span className="font-mono text-[10px] truncate max-w-[120px]">{ep.path}</span>
              </a>
            ))}
          </nav>
          
          <div className="pt-3.5 border-t border-slate-800/80">
            <a
              href="/api/docs"
              target="_blank"
              className="inline-flex items-center space-x-1.5 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
            >
              <span>Raw OpenAPI Spec</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main docs contents */}
      <div className="lg:col-span-3 space-y-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">API Reference Documentation</h1>
          <p className="text-slate-400 text-xs font-mono mt-2 leading-relaxed">
            Every action performed in the user interface is fully supported by our REST API. CORS headers are enabled globally to allow programmatic downloads and metadata querying from external build scripts or CLI pipelines.
          </p>
        </div>

        <div className="space-y-8">
          {endpoints.map((ep, idx) => (
            <div 
              key={idx} 
              id={`endpoint-${idx}`}
              className="bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-2xl p-6 scroll-mt-24 space-y-5 backdrop-blur-md hover:border-slate-800 transition-all duration-300"
            >
              {/* Header: Badge & Method */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${
                    ep.method === "GET" 
                      ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20" 
                      : "bg-blue-500/5 text-blue-400 border-blue-500/20"
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-xs font-bold font-mono text-white sm:text-sm">{ep.path}</code>
                </div>
                <span className="text-[10px] font-mono font-semibold text-slate-500">{ep.summary}</span>
              </div>

              {/* Description */}
              <p className="text-xs font-mono text-slate-400 leading-relaxed">{ep.description}</p>

              {/* Parameters Table */}
              {ep.parameters && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Query Parameters</h4>
                  <div className="overflow-x-auto border border-slate-800/40 rounded-xl bg-slate-950/20">
                    <table className="w-full text-left text-[11px] border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-[#05070F]/50 border-b border-slate-850 text-slate-500 font-bold font-mono">
                          <th className="py-2 px-3 font-semibold">Name</th>
                          <th className="py-2 px-3 font-semibold">Type</th>
                          <th className="py-2 px-3 font-semibold">Requirement</th>
                          <th className="py-2 px-3 font-semibold">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 font-mono">
                        {ep.parameters.map((param, pIdx) => (
                          <tr key={pIdx} className="hover:bg-slate-900/10">
                            <td className="py-2 px-3 font-bold text-slate-300">{param.name}</td>
                            <td className="py-2 px-3 text-slate-500">{param.type}</td>
                            <td className="py-2 px-3">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                                param.required 
                                  ? "bg-red-500/5 text-red-400 border-red-500/10" 
                                  : "bg-slate-900 text-slate-500 border-slate-800"
                              }`}>
                                {param.required ? "REQUIRED" : "OPTIONAL"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-400">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Request Body Info */}
              {ep.requestBody && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">JSON Request Body</h4>
                  <div className="bg-[#05070F] rounded-xl border border-slate-800/60 p-4 overflow-x-auto font-mono text-xs text-blue-400">
                    <pre>{ep.requestBody}</pre>
                  </div>
                </div>
              )}

              {/* Request Example */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">CURL Request Example</h4>
                  <button
                    onClick={() => handleCopy(ep.curlExample, idx)}
                    className="inline-flex items-center space-x-1 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-[#05070F] rounded-xl border border-slate-800/60 p-4 overflow-x-auto font-mono text-xs text-emerald-400/90 relative">
                  <pre>{ep.curlExample.replace("http://localhost:3000", origin)}</pre>
                </div>
              </div>

              {/* Response Example */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">JSON Response Schema</h4>
                <div className="bg-[#05070F] rounded-xl border border-slate-800/60 p-4 overflow-x-auto font-mono text-xs text-slate-300">
                  <pre>{ep.responseExample}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
