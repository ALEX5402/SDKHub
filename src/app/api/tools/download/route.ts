import { NextRequest, NextResponse } from "next/server";
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
    const version = searchParams.get("version");
    const os = searchParams.get("os");
    const arch = searchParams.get("arch");

    if (!name || !version || !os || !arch) {
      return jsonResponse({
        success: false,
        error: "Missing required query parameters: 'name', 'version', 'os', 'arch' are all required."
      }, 400);
    }

    // Query tool package from SQLite
    const queryRes = await turso.execute({
      sql: "SELECT * FROM tools WHERE name = ? AND version = ? AND os = ? AND arch = ? LIMIT 1",
      args: [name.toLowerCase(), version, os.toLowerCase(), arch.toLowerCase()]
    });

    const tool = queryRes.rows[0];

    if (!tool) {
      return jsonResponse({
        success: false,
        error: `Tool packaging not found for name=${name}, version=${version}, os=${os}, arch=${arch}`
      }, 404);
    }

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Insert statistics into SQLite
    await turso.execute({
      sql: `
        INSERT INTO download_stats (name, version, os, arch, timestamp, ip, userAgent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        name.toLowerCase(),
        version,
        os.toLowerCase(),
        arch.toLowerCase(),
        new Date().getTime(),
        ip,
        userAgent
      ]
    });

    // Redirect to CDN
    return NextResponse.redirect(tool.downloadUrl as string);
  } catch (error: any) {
    return jsonResponse({
      success: false,
      error: error.message || "Internal Server Error"
    }, 500);
  }
}
