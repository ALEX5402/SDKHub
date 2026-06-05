import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { turso, initDatabase } from "@/lib/turso";

export const dynamic = "force-dynamic";
import { 
  ArrowLeft, 
  Download, 
  Cpu, 
  Globe, 
  Calendar, 
  ShieldCheck, 
  HardDrive,
  ExternalLink,
  ChevronRight,
  Server
} from "lucide-react";

interface ToolDoc {
  name: string;
  version: string;
  os: string;
  arch: string;
  downloadUrl: string;
  checksum: string;
  sizeBytes: number;
  lastUpdated: Date;
}

interface PageProps {
  params: Promise<{ name: string; version: string }>;
}

function formatBytes(bytes: number) {
  if (bytes === 0 || !bytes) return "Unknown Size";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default async function ToolDetailsPage({ params }: PageProps) {
  await initDatabase();
  const { name, version } = await params;

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const origin = `${protocol}://${host}`;

  const decodedName = decodeURIComponent(name);
  const decodedVersion = decodeURIComponent(version);

  // Fetch all matching packages for different OS/architectures from SQLite
  const queryRes = await turso.execute({
    sql: "SELECT * FROM tools WHERE name = ? AND version = ?",
    args: [decodedName.toLowerCase(), decodedVersion]
  });

  const packages = queryRes.rows.map(row => ({
    name: row.name as string,
    version: row.version as string,
    os: row.os as string,
    arch: row.arch as string,
    downloadUrl: row.downloadUrl as string,
    checksum: row.checksum as string,
    sizeBytes: Number(row.sizeBytes),
    lastUpdated: new Date(Number(row.lastUpdated))
  })) as ToolDoc[];

  if (packages.length === 0) {
    notFound();
  }

  const formatToolName = (n: string) => {
    if (n.startsWith("system-images;")) {
      const parts = n.split(";");
      const apiLevel = parts[1] ? parts[1].toUpperCase() : "";
      const type = parts[2]
        ? parts[2]
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
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
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "";
      return `SDK Add-on - ${type}`;
    }
    return n;
  };

  const displayName = formatToolName(decodedName);
  const lastUpdated = packages[0].lastUpdated;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-mono text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-300">{displayName}</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-500">{decodedVersion}</span>
      </nav>

      {/* Hero header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-2xl gap-4 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 border border-slate-850">
            <Server className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">{displayName}</h1>
            <p className="text-slate-400 text-xs font-mono mt-0.5">Version: {decodedVersion}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "Recently"}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Package architecture variations */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">Platform Variations</h2>
          <div className="space-y-3">
            {packages.map((pkg, idx) => (
              <div 
                key={idx} 
                className="bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-xl p-5 hover:border-emerald-500/35 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-3 flex-1">
                  {/* OS & Arch Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold font-mono tracking-wider border capitalize ${
                      pkg.os === "windows"
                        ? "bg-blue-500/5 text-blue-400 border-blue-500/25"
                        : pkg.os === "macosx"
                        ? "bg-violet-500/5 text-violet-400 border-violet-500/25"
                        : pkg.os === "linux"
                        ? "bg-amber-500/5 text-amber-400 border-amber-500/25"
                        : "bg-slate-500/5 text-slate-400 border-slate-500/25"
                    }`}>
                      <Globe className="h-3 w-3 mr-1" />
                      {pkg.os}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold font-mono tracking-wider border uppercase ${
                      pkg.arch === "arm64"
                        ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/25"
                        : pkg.arch === "x86_64"
                        ? "bg-cyan-500/5 text-cyan-400 border-cyan-500/25"
                        : "bg-slate-500/5 text-slate-400 border-slate-500/25"
                    }`}>
                      <Cpu className="h-3 w-3 mr-1" />
                      {pkg.arch}
                    </span>
                  </div>

                  {/* Size and SHA details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-slate-500" />
                      <span>{formatBytes(pkg.sizeBytes)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
                      <span className="truncate max-w-[200px]" title={pkg.checksum}>
                        SHA-256: <code className="font-mono text-slate-300">{pkg.checksum}</code>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <a
                    href={`/api/tools/download?name=${pkg.name}&version=${pkg.version}&os=${pkg.os}&arch=${pkg.arch}`}
                    className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-2 glow-btn bg-emerald-500 hover:bg-emerald-400 text-[#05070F] font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Copy-paste Command line info */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">Programmatic Access</h2>
          <div className="bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-xl p-5 space-y-4 backdrop-blur-md">
            <p className="text-xs font-mono text-slate-450 leading-relaxed">
              Use `curl` or `wget` to download this package version directly inside your build pipelines or script managers.
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono block">Curl Command Example</span>
              <div className="bg-[#05070F] rounded-lg p-3 border border-slate-800/80 overflow-x-auto relative">
                <code className="text-[10px] font-mono text-emerald-400/90 whitespace-nowrap block leading-relaxed">
                  curl -L -o "{packages[0].name}.zip" \<br />
                  &nbsp;&nbsp;"{origin}/api/tools/download?name={packages[0].name}&version={packages[0].version}&os={packages[0].os}&arch={packages[0].arch}"
                </code>
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-4 text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>Redirects & CORS Enabled</span>
              <Link href="/docs" className="text-slate-400 hover:text-white flex items-center space-x-1">
                <span>API Docs</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to search list</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
