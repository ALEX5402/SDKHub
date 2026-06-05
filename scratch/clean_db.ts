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
  console.log(`Connecting to database at: ${TURSO_DATABASE_URL}`);
  
  const tables = ["tools", "sync_logs", "download_stats", "users"];
  
  for (const table of tables) {
    try {
      console.log(`Clearing table: ${table}...`);
      // Use DELETE FROM to empty records while preserving the table schema
      await turso.execute(`DELETE FROM ${table}`);
      console.log(`Successfully cleared ${table}.`);
    } catch (err: any) {
      if (err.message && err.message.includes("no such table")) {
        console.log(`Table '${table}' does not exist yet (skipping cleanup).`);
      } else {
        console.error(`Error clearing table ${table}:`, err.message || err);
      }
    }
  }
  console.log("\nDatabase cleanup complete.");
}

main().catch(console.error);

