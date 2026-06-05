import { NextRequest } from "next/server";
import { turso, initDatabase } from "@/lib/turso";
import { jsonResponse, handleOptions } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    await initDatabase();

    // 1. Total count
    const totalRes = await turso.execute("SELECT COUNT(*) as total FROM download_stats");
    const totalDownloads = Number(totalRes.rows[0]?.total || 0);

    // 2. Top tools
    const topRes = await turso.execute(`
      SELECT name as _id, COUNT(*) as count 
      FROM download_stats 
      GROUP BY name 
      ORDER BY count DESC 
      LIMIT 10
    `);
    const topTools = topRes.rows.map(row => ({
      _id: row._id as string,
      count: Number(row.count)
    }));

    // 3. Platform OS breakdown
    const osRes = await turso.execute(`
      SELECT os as _id, COUNT(*) as count 
      FROM download_stats 
      GROUP BY os 
      ORDER BY count DESC
    `);
    const osBreakdown = osRes.rows.map(row => ({
      _id: row._id as string,
      count: Number(row.count)
    }));

    // 4. Platform Arch breakdown
    const archRes = await turso.execute(`
      SELECT arch as _id, COUNT(*) as count 
      FROM download_stats 
      GROUP BY arch 
      ORDER BY count DESC
    `);
    const archBreakdown = archRes.rows.map(row => ({
      _id: row._id as string,
      count: Number(row.count)
    }));

    // 5. Daily trends (past 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trendsRes = await turso.execute({
      sql: `
        SELECT strftime('%Y-%m-%d', timestamp / 1000, 'unixepoch') as _id, COUNT(*) as count
        FROM download_stats
        WHERE timestamp >= ?
        GROUP BY _id
        ORDER BY _id ASC
      `,
      args: [thirtyDaysAgo.getTime()]
    });
    
    const trends = trendsRes.rows.map(row => ({
      _id: row._id as string,
      count: Number(row.count)
    }));

    // Fallback Mock data for visual rendering on blank databases
    const resultTopTools = topTools.length > 0 ? topTools : [
      { _id: "ndk", count: 124 },
      { _id: "cmake", count: 85 },
      { _id: "build-tools", count: 62 },
      { _id: "platform-tools", count: 48 },
    ];

    const resultOsBreakdown = osBreakdown.length > 0 ? osBreakdown : [
      { _id: "linux", count: 180 },
      { _id: "macosx", count: 95 },
      { _id: "windows", count: 44 },
    ];

    const resultArchBreakdown = archBreakdown.length > 0 ? archBreakdown : [
      { _id: "x86_64", count: 210 },
      { _id: "arm64", count: 109 },
    ];

    let resultTrends = trends;
    if (trends.length === 0) {
      const mockTrends = [];
      for (let i = 14; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = Math.floor(15 + Math.sin(i * 0.5) * 8 + Math.random() * 5);
        mockTrends.push({ _id: dateStr, count });
      }
      resultTrends = mockTrends;
    }

    return jsonResponse({
      success: true,
      data: {
        totalDownloads: totalDownloads || 319,
        topTools: resultTopTools,
        osBreakdown: resultOsBreakdown,
        archBreakdown: resultArchBreakdown,
        trends: resultTrends
      }
    });
  } catch (error: any) {
    return jsonResponse({
      success: false,
      error: error.message || "Internal Server Error"
    }, 500);
  }
}
