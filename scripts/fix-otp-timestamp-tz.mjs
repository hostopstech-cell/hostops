import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
const databaseUrl = envContent
  .split("\n")
  .find((line) => line.startsWith("DATABASE_URL="))
  ?.slice("DATABASE_URL=".length)
  .trim()
  .replace(/^["']|["']$/g, "");

const sql = neon(databaseUrl);

try {
  await sql`ALTER TABLE owners ALTER COLUMN otp_expires_at TYPE TIMESTAMPTZ`;
  console.log("✅ otp_expires_at converted to TIMESTAMPTZ");
} catch (e) {
  console.error("Error:", e.message);
}
