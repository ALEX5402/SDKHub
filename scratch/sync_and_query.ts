import { initDatabase, turso } from "../src/lib/turso";
import { syncUpstream } from "../src/lib/sync";
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
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      process.env[key] = val;
    }
  }
} catch (e) {
  console.warn("Failed to load .env file manually:", e);
}

async function main() {
  console.log("1. Initializing database schema...");
  await initDatabase();
  
  console.log("2. Running database sync upstream (this will fetch all 5 XML feeds concurrently)...");
  const syncRes = await syncUpstream();
  console.log("Sync output:", syncRes);

  console.log("\n3. Querying all system-images stored in SQLite...");
  const queryRes = await turso.execute({
    sql: "SELECT name, version, os, arch, downloadUrl FROM tools WHERE name LIKE 'system-images;%' LIMIT 10",
    args: []
  });

  console.log(`Found ${queryRes.rows.length} system images (sample of max 10):`);
  for (const row of queryRes.rows) {
    console.log(`- Name: ${row.name}`);
    console.log(`  Version: ${row.version}`);
    console.log(`  OS: ${row.os}`);
    console.log(`  Arch: ${row.arch}`);
    console.log(`  URL: ${row.downloadUrl}\n`);
  }

  const totalCount = await turso.execute("SELECT COUNT(*) as total FROM tools");
  console.log("Total tools in DB:", totalCount.rows[0]?.total);
}

main().catch(console.error);
