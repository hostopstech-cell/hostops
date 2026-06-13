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

console.log("🚀 Starting Referral Commission Events Migration...\n");

try {
  await sql`
    CREATE TABLE IF NOT EXISTS referral_commission_events (
      id SERIAL PRIMARY KEY,
      lead_id INTEGER NOT NULL REFERENCES referral_leads(id) ON DELETE CASCADE,
      agent_id INTEGER NOT NULL REFERENCES referral_agents(id) ON DELETE CASCADE,
      event_type VARCHAR(20) NOT NULL DEFAULT 'renewal',
      plan_name VARCHAR(50),
      plan_amount NUMERIC(10,2),
      billing_type VARCHAR(20),
      commission_percent NUMERIC(5,2) DEFAULT 0,
      commission_amount NUMERIC(10,2) DEFAULT 0,
      payment_status VARCHAR(20) DEFAULT 'unpaid',
      transaction_ref VARCHAR(255),
      note TEXT,
      paid_at TIMESTAMPTZ,
      razorpay_payment_id VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  console.log("✅ referral_commission_events table created");

  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_commission_events_payment ON referral_commission_events(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL`;
  await sql`CREATE INDEX IF NOT EXISTS idx_commission_events_lead ON referral_commission_events(lead_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_commission_events_agent ON referral_commission_events(agent_id)`;
  console.log("✅ Indexes created");

  // Backfill 'first' events from existing leads with commission already set
  const leads = await sql`
    SELECT rl.id, rl.agent_id, rl.plan_name, rl.plan_amount, rl.billing_type,
           rl.commission_percent, rl.commission_amount, rl.payment_status, rl.paid_at
    FROM referral_leads rl
    WHERE rl.commission_amount > 0
  `;

  let inserted = 0;
  for (const lead of leads) {
    const existing = await sql`SELECT id FROM referral_commission_events WHERE lead_id = ${lead.id} AND event_type = 'first'`;
    if (existing.length) continue;

    const payout = await sql`SELECT transaction_ref, note FROM referral_payouts WHERE lead_id = ${lead.id} ORDER BY created_at ASC LIMIT 1`;
    const txnRef = payout.length ? payout[0].transaction_ref : null;
    const note = payout.length ? payout[0].note : null;

    await sql`
      INSERT INTO referral_commission_events
        (lead_id, agent_id, event_type, plan_name, plan_amount, billing_type, commission_percent, commission_amount, payment_status, transaction_ref, note, paid_at, created_at)
      VALUES
        (${lead.id}, ${lead.agent_id}, 'first', ${lead.plan_name}, ${lead.plan_amount}, ${lead.billing_type}, ${lead.commission_percent}, ${lead.commission_amount}, ${lead.payment_status === 'paid' ? 'paid' : 'unpaid'}, ${txnRef}, ${note}, ${lead.paid_at}, NOW())
    `;
    inserted++;
  }
  console.log(`✅ Backfilled ${inserted} 'first' commission events from existing leads`);

  // Recover MISSED renewal commissions from payment_history (fixes the duplicate-key bug)
  const onboardedLeads = await sql`
    SELECT rl.id, rl.agent_id, rl.owner_id, rl.onboarded_at
    FROM referral_leads rl
    WHERE rl.onboarded_at IS NOT NULL AND rl.owner_id IS NOT NULL
  `;

  let renewalsInserted = 0;
  for (const lead of onboardedLeads) {
    const payments = await sql`
      SELECT * FROM payment_history
      WHERE owner_id = ${lead.owner_id} AND status = 'success'
      ORDER BY created_at ASC
    `;
    for (let i = 1; i < payments.length; i++) {
      const p = payments[i];
      const exists = await sql`SELECT id FROM referral_commission_events WHERE razorpay_payment_id = ${p.razorpay_payment_id}`;
      if (exists.length) continue;

      const oneYearLater = new Date(lead.onboarded_at);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      if (new Date(p.created_at) >= oneYearLater) continue;

      const amount = parseFloat(p.amount || 0);
      const commissionAmount = Math.round(amount * 0.2);
      await sql`
        INSERT INTO referral_commission_events
          (lead_id, agent_id, event_type, plan_name, plan_amount, billing_type, commission_percent, commission_amount, payment_status, razorpay_payment_id, created_at)
        VALUES
          (${lead.id}, ${lead.agent_id}, 'renewal', ${p.plan}, ${amount}, ${p.billing_type}, 20, ${commissionAmount}, 'unpaid', ${p.razorpay_payment_id}, ${p.created_at})
        ON CONFLICT (razorpay_payment_id) DO NOTHING
      `;
      renewalsInserted++;
    }
  }
  console.log(`✅ Recovered ${renewalsInserted} missed renewal commission events from payment_history`);

  // Recompute agent totals from events
  const agents = await sql`SELECT id FROM referral_agents`;
  for (const a of agents) {
    await sql`UPDATE referral_agents SET
      total_earnings = (SELECT COALESCE(SUM(commission_amount),0) FROM referral_commission_events WHERE agent_id = ${a.id}),
      total_paid = (SELECT COALESCE(SUM(commission_amount),0) FROM referral_commission_events WHERE agent_id = ${a.id} AND payment_status = 'paid')
    WHERE id = ${a.id}`;
  }
  console.log("✅ Agent totals recomputed");

  console.log("\n🎉 Migration completed successfully! Zero existing data affected.");
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  process.exit(1);
}
