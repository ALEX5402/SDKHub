import { NextRequest } from "next/server";
import { turso, initDatabase } from "@/lib/turso";
import { syncUpstream } from "@/lib/sync";
import { jsonResponse, handleOptions } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(req: NextRequest) {
  try {
    await initDatabase();
    
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const version = searchParams.get("version");
    const os = searchParams.get("os");
    const arch = searchParams.get("arch");
    
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const conditions: string[] = [];
    const args: any[] = [];

    if (name) {
      if (name.toLowerCase() === "system-images") {
        conditions.push("name LIKE ?");
        args.push("system-images;%");
      } else if (name.toLowerCase() === "add-ons") {
        conditions.push("name LIKE ?");
        args.push("add-ons;%");
      } else {
        conditions.push("name = ?");
        args.push(name.toLowerCase());
      }
    }
    if (version) {
      conditions.push("version = ?");
      args.push(version);
    }
    if (os) {
      conditions.push("os = ?");
      args.push(os.toLowerCase());
    }
    if (arch) {
      conditions.push("arch = ?");
      args.push(arch.toLowerCase());
    }

    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    // Check if the overall tools table is completely empty
    const globalCountRes = await turso.execute("SELECT COUNT(*) as total FROM tools");
    const globalTotal = Number(globalCountRes.rows[0]?.total || 0);

    if (globalTotal === 0) {
      console.log("Database tools table is empty. Running initial sync worker...");
      await syncUpstream();
    }

    // Count query with filters
    const countRes = await turso.execute({
      sql: `SELECT COUNT(*) as total FROM tools ${whereClause}`,
      args
    });
    const total = Number(countRes.rows[0]?.total || 0);

    // Items query
    const itemsRes = await turso.execute({
      sql: `SELECT * FROM tools ${whereClause} ORDER BY name ASC, version DESC, os ASC, arch ASC LIMIT ? OFFSET ?`,
      args: [...args, limit, skip]
    });

    const cleanItems = itemsRes.rows.map(item => ({
      name: item.name as string,
      version: item.version as string,
      os: item.os as string,
      arch: item.arch as string,
      downloadUrl: item.downloadUrl as string,
      checksum: item.checksum as string,
      sizeBytes: Number(item.sizeBytes),
      lastUpdated: new Date(Number(item.lastUpdated)).toISOString(),
    }));

    return jsonResponse({
      success: true,
      data: cleanItems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error: any) {
    return jsonResponse({
      success: false,
      error: error.message || "Internal Server Error"
    }, 500);
  }
}
