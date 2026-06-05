import { NextRequest } from "next/server";
import { turso, initDatabase } from "@/lib/turso";
import { syncUpstream } from "@/lib/sync";
import { jsonResponse, handleOptions } from "@/lib/api-response";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    
    const authHeader = req.headers.get("authorization");
    let isAuthorized = false;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const secret = process.env.ADMIN_SECRET || "admin123";
      if (token === secret) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      try {
        const body = await req.json();
        const { username, password } = body;

        if (username && password) {
          // Query user from SQLite
          const userRes = await turso.execute({
            sql: "SELECT * FROM users WHERE username = ? LIMIT 1",
            args: [username]
          });
          const user = userRes.rows[0];

          if (user) {
            const passwordMatch = await bcrypt.compare(password, user.passwordHash as string);
            if (passwordMatch && user.role === "admin") {
              isAuthorized = true;
            }
          } else {
            // Register first user as admin if table is empty
            const countRes = await turso.execute("SELECT COUNT(*) as total FROM users");
            const count = Number(countRes.rows[0]?.total || 0);
            
            if (count === 0 && username === "admin") {
              const salt = await bcrypt.genSalt(10);
              const passwordHash = await bcrypt.hash(password, salt);
              
              await turso.execute({
                sql: "INSERT INTO users (username, passwordHash, role, createdAt) VALUES (?, ?, ?, ?)",
                args: [username, passwordHash, "admin", new Date().getTime()]
              });
              isAuthorized = true;
            }
          }
        }
      } catch (e) {
        // Skip JSON auth if invalid body
      }
    }

    if (!isAuthorized) {
      return jsonResponse({
        success: false,
        error: "Unauthorized. Provide correct credentials or Bearer token."
      }, 401);
    }

    // Trigger sync upstream
    console.log("Triggering manual sync from admin API...");
    const result = await syncUpstream();

    // Fetch the latest sync logs
    const latestLogsRes = await turso.execute("SELECT * FROM sync_logs ORDER BY timestamp DESC LIMIT 5");
    const latestLogs = latestLogsRes.rows.map(row => ({
      timestamp: new Date(Number(row.timestamp)).toISOString(),
      status: row.status as string,
      message: row.message as string
    }));

    return jsonResponse({
      success: result.success,
      message: result.message,
      count: result.count,
      logs: latestLogs
    });

  } catch (error: any) {
    return jsonResponse({
      success: false,
      error: error.message || "Internal Server Error"
    }, 500);
  }
}
