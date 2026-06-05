import { createClient } from "@libsql/client";

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || "file:local.db";
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || "";

console.log("Initializing Turso client with database URL:", TURSO_DATABASE_URL);

export const turso = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN,
});

let dbInitialized = false;

export async function initDatabase() {
  if (dbInitialized) return;

  try {
    // 1. Create tools table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS tools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        os TEXT NOT NULL,
        arch TEXT NOT NULL,
        downloadUrl TEXT NOT NULL,
        checksum TEXT NOT NULL,
        sizeBytes INTEGER NOT NULL,
        lastUpdated INTEGER NOT NULL,
        UNIQUE(name, version, os, arch)
      );
    `);

    // 2. Create sync_logs table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS sync_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        status TEXT NOT NULL,
        message TEXT NOT NULL
      );
    `);

    // 3. Create download_stats table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS download_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        os TEXT NOT NULL,
        arch TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        ip TEXT NOT NULL,
        userAgent TEXT NOT NULL
      );
    `);

    // 4. Create users table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        role TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      );
    `);

    dbInitialized = true;
    console.log("Turso database tables initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Turso database tables:", error);
  }
}
