"use client";

import { useState, useEffect } from "react";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement, 
  LineElement, 
  Filler, 
  ArcElement 
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { 
  TrendingUp, 
  Globe, 
  Cpu, 
  RefreshCw, 
  Activity 
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
  ArcElement
);

interface StatsData {
  totalDownloads: number;
  topTools: Array<{ _id: string; count: number }>;
  osBreakdown: Array<{ _id: string; count: number }>;
  archBreakdown: Array<{ _id: string; count: number }>;
  trends: Array<{ _id: string; count: number }>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch statistics data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <RefreshCw className="h-6 w-6 text-emerald-400 animate-spin" />
        <span className="text-xs text-slate-500 font-mono">Aggregating telemetry logs...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-40 text-slate-400 font-mono text-xs">
        Failed to load statistics report.
      </div>
    );
  }

  // Line Chart Configuration (Trends)
  const lineChartData = {
    labels: stats.trends.map(t => t._id),
    datasets: [
      {
        fill: true,
        label: "Downloads",
        data: stats.trends.map(t => t.count),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.05)",
        tension: 0.3,
        pointBackgroundColor: "rgb(16, 185, 129)",
        pointHoverRadius: 6,
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { padding: 12, cornerRadius: 8, bodyFont: { family: "var(--font-jetbrains-mono)" } }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748B", font: { size: 10, family: "var(--font-jetbrains-mono)" } }
      },
      y: {
        grid: { color: "rgba(30, 41, 59, 0.3)" },
        ticks: { color: "#64748B", font: { size: 10, family: "var(--font-jetbrains-mono)" } }
      }
    }
  };

  // Bar Chart Configuration (Top Tools)
  const barChartData = {
    labels: stats.topTools.map(t => t._id.toUpperCase()),
    datasets: [
      {
        label: "Downloads",
        data: stats.topTools.map(t => t.count),
        backgroundColor: "rgba(6, 182, 212, 0.7)",
        borderColor: "rgb(6, 182, 212)",
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { padding: 12, cornerRadius: 8, bodyFont: { family: "var(--font-jetbrains-mono)" } }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748B", font: { size: 10, family: "var(--font-jetbrains-mono)" } }
      },
      y: {
        grid: { color: "rgba(30, 41, 59, 0.3)" },
        ticks: { color: "#64748B", font: { size: 10, family: "var(--font-jetbrains-mono)" } }
      }
    }
  };

  // Doughnut Chart Configuration (OS Breakdown)
  const osDoughnutData = {
    labels: stats.osBreakdown.map(o => o._id),
    datasets: [
      {
        data: stats.osBreakdown.map(o => o.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
        ],
        borderColor: "#05070F",
        borderWidth: 2,
      }
    ]
  };

  // Doughnut Chart Configuration (Arch Breakdown)
  const archDoughnutData = {
    labels: stats.archBreakdown.map(a => a._id),
    datasets: [
      {
        data: stats.archBreakdown.map(a => a.count),
        backgroundColor: [
          "rgba(139, 92, 246, 0.7)",
          "rgba(6, 182, 212, 0.7)",
        ],
        borderColor: "#05070F",
        borderWidth: 2,
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { 
          color: "#94A3B8", 
          boxWidth: 10, 
          font: { size: 10, family: "var(--font-jetbrains-mono)" },
          padding: 14
        }
      }
    }
  };

  // Compute key highlights
  const topOS = stats.osBreakdown[0]?._id || "none";
  const topArch = stats.archBreakdown[0]?._id || "none";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Analytics & Telemetry</h1>
        <p className="text-slate-400 text-xs font-mono mt-1">Real-time aggregate download trends and platform usage statistics.</p>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-2xl p-5 flex items-center space-x-4 hover:border-emerald-500/30 transition-all duration-300 backdrop-blur-md">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-bold font-mono uppercase tracking-wider">Total Downloads Logged</span>
            <span className="text-2xl font-extrabold text-white mt-1 font-mono tracking-tight">{stats.totalDownloads}</span>
          </div>
        </div>

        <div className="bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-2xl p-5 flex items-center space-x-4 hover:border-blue-500/30 transition-all duration-300 backdrop-blur-md">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-bold font-mono uppercase tracking-wider">Most Active OS</span>
            <span className="text-2xl font-extrabold text-white mt-1 capitalize font-mono tracking-tight">{topOS}</span>
          </div>
        </div>

        <div className="bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-2xl p-5 flex items-center space-x-4 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-md">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 border border-purple-500/20">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block font-bold font-mono uppercase tracking-wider">Most Active CPU Arch</span>
            <span className="text-2xl font-extrabold text-white mt-1 font-mono tracking-tight">{topArch}</span>
          </div>
        </div>
      </div>

      {/* Line Chart Grid */}
      <div className="bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-2xl p-5 space-y-4 backdrop-blur-md relative overflow-hidden">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">Daily Download Volumes</h2>
          <span className="inline-flex items-center text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono tracking-wide">
            <TrendingUp className="h-3 w-3 mr-1" />
            Active Syncs
          </span>
        </div>
        <div className="h-72 w-full relative">
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

      {/* Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Tools Bar Chart */}
        <div className="lg:col-span-2 bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-2xl p-5 space-y-4 backdrop-blur-md">
          <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">Top Packages Requested</h2>
          <div className="h-60 w-full relative">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Platform Breakdown Donuts */}
        <div className="bg-[#0D1324]/30 border border-[#1E293B]/60 rounded-2xl p-5 space-y-5 backdrop-blur-md">
          <h2 className="text-sm font-bold font-mono text-white uppercase tracking-wider">Platform Breakdown</h2>
          <div className="grid grid-cols-2 gap-4 h-52">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-500 font-bold font-mono uppercase tracking-wider mb-2">OS Target</span>
              <div className="w-full h-full relative">
                <Doughnut data={osDoughnutData} options={doughnutOptions} />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-500 font-bold font-mono uppercase tracking-wider mb-2">CPU Arch</span>
              <div className="w-full h-full relative">
                <Doughnut data={archDoughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
