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

async function main() {
  console.log("Triggering database sync upstream...");
  const res = await syncUpstream();
  console.log(`Sync Result:`, res);
}

main().catch(console.error);
