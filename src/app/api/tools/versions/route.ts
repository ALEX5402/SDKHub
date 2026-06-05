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

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const os = searchParams.get("os");
    const arch = searchParams.get("arch");

    if (!name) {
      return jsonResponse({
        success: false,
        error: "Missing required parameter 'name'"
      }, 400);
    }

    const conditions = ["name = ?"];
    const args: any[] = [name.toLowerCase()];
    
    if (os) {
      conditions.push("os = ?");
      args.push(os.toLowerCase());
    }
    if (arch) {
      conditions.push("arch = ?");
      args.push(arch.toLowerCase());
    }

    const queryRes = await turso.execute({
      sql: `SELECT DISTINCT version FROM tools WHERE ${conditions.join(" AND ")}`,
      args
    });

    const versions = queryRes.rows.map(row => row.version as string);

    // Natural sort in descending order
    versions.sort((a, b) => {
      return b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' });
    });

    return jsonResponse({
      success: true,
      name,
      versions,
    });
  } catch (error: any) {
    return jsonResponse({
      success: false,
      error: error.message || "Internal Server Error"
    }, 500);
  }
}
