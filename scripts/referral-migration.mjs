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

if (!databaseUrl) {
  console.error("DATABASE_URL not found in .env");
  process.exit(1);
}

const sql = neon(databaseUrl);

console.log("🚀 Starting HostOps Referral System Migration...\n");

try {
  // ── 1. owners table mein owner_number add karo ──
  await sql`ALTER TABLE owners ADD COLUMN IF NOT EXISTS owner_number SERIAL`;
  console.log("✅ owners.owner_number added");

  // ── 2. owners table mein referred_by_agent add karo ──
  await sql`ALTER TABLE owners ADD COLUMN IF NOT EXISTS referred_by_agent_id INTEGER`;
  console.log("✅ owners.referred_by_agent_id added");

  // ── 3. payment_history table confirm/create ──
  await sql`
    CREATE TABLE IF NOT EXISTS payment_history (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
      razorpay_order_id VARCHAR(255),
      razorpay_payment_id VARCHAR(255) UNIQUE,
      plan VARCHAR(50),
      billing_type VARCHAR(20),
      amount NUMERIC(10,2) DEFAULT 0,
      status VARCHAR(20) DEFAULT 'success',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅ payment_history table ready");

  // ── 4. referral_agents table ──
  await sql`
    CREATE TABLE IF NOT EXISTS referral_agents (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      referral_code VARCHAR(20) NOT NULL UNIQUE,
      upi_id VARCHAR(255),
      bank_account VARCHAR(50),
      bank_ifsc VARCHAR(20),
      bank_name VARCHAR(100),
      bank_holder_name VARCHAR(255),
      total_earnings NUMERIC(10,2) DEFAULT 0,
      total_paid NUMERIC(10,2) DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅ referral_agents table created");

  // ── 5. referral_leads table ──
  await sql`
    CREATE TABLE IF NOT EXISTS referral_leads (
      id SERIAL PRIMARY KEY,
      agent_id INTEGER NOT NULL REFERENCES referral_agents(id) ON DELETE CASCADE,
      prospect_email VARCHAR(255) NOT NULL,
      prospect_name VARCHAR(255),
      owner_id INTEGER REFERENCES owners(id),
      plan_name VARCHAR(50),
      plan_amount NUMERIC(10,2),
      billing_type VARCHAR(20),
      commission_percent NUMERIC(5,2) DEFAULT 0,
      commission_amount NUMERIC(10,2) DEFAULT 0,
      status VARCHAR(30) DEFAULT 'pending',
      payment_status VARCHAR(20) DEFAULT 'unpaid',
      paid_at TIMESTAMPTZ,
      payment_note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      onboarded_at TIMESTAMPTZ,
      UNIQUE(prospect_email, agent_id)
    )
  `;
  console.log("✅ referral_leads table created");

  // ── 6. referral_payouts table (teri payment tracking) ──
  await sql`
    CREATE TABLE IF NOT EXISTS referral_payouts (
      id SERIAL PRIMARY KEY,
      agent_id INTEGER NOT NULL REFERENCES referral_agents(id) ON DELETE CASCADE,
      lead_id INTEGER NOT NULL REFERENCES referral_leads(id) ON DELETE CASCADE,
      amount NUMERIC(10,2) NOT NULL,
      payment_method VARCHAR(20) DEFAULT 'upi',
      transaction_ref VARCHAR(255),
      note TEXT,
      paid_by_admin BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅ referral_payouts table created");

  // ── 7. Indexes ──
  await sql`CREATE INDEX IF NOT EXISTS idx_referral_agents_code ON referral_agents(referral_code)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_referral_leads_agent ON referral_leads(agent_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_referral_leads_email ON referral_leads(prospect_email)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_referral_leads_owner ON referral_leads(owner_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_referral_leads_status ON referral_leads(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_owners_referred_by ON owners(referred_by_agent_id)`;
  console.log("✅ All indexes created");

  // ── 8. Verify — sab tables ka count ──
  const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `;
  console.log("\n📊 Tables in database:");
  tables.forEach(t => console.log("   -", t.table_name));

  // ── 9. owners table ke actual columns ──
  const ownerCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'owners' 
    ORDER BY ordinal_position
  `;
  console.log("\n📋 owners table columns:");
  ownerCols.forEach(c => console.log(`   - ${c.column_name} (${c.data_type})`));

  console.log("\n🎉 Migration completed successfully! Zero existing data affected.");

} catch (error) {
  console.error("❌ Migration failed:", error.message);
  process.exit(1);
}
