import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

// Read and parse env variables from .env manually
try {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env"), "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1];
      let val = match[2].trim();
      // Remove surrounding quotes if they exist
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  }
} catch (e) {
  console.warn("Failed to load .env file manually:", e);
}

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || "file:local.db";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || "";

const turso = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

async function main() {
  try {
    const totalCountRes = await turso.execute("SELECT COUNT(*) as total FROM tools");
    console.log("Total tools in DB:", totalCountRes.rows[0]?.total);

    const nameCountsRes = await turso.execute(`
      SELECT name, COUNT(*) as count 
      FROM tools 
      GROUP BY name 
      ORDER BY count DESC
    `);
    console.log("\nCounts per tool category:");
    for (const row of nameCountsRes.rows) {
      console.log(`- ${row.name}: ${row.count}`);
    }

    const latestSyncRes = await turso.execute(`
      SELECT * FROM sync_logs 
      ORDER BY timestamp DESC 
      LIMIT 3
    `);
    console.log("\nRecent Sync Logs:");
    for (const row of latestSyncRes.rows) {
      console.log(`- [${new Date(Number(row.timestamp)).toISOString()}] ${row.status}: ${row.message}`);
    }

  } catch (error) {
    console.error("Error querying database:", error);
  }
}

main().catch(console.error);
