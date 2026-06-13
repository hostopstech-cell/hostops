import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(join(__dirname, "..", ".env"), "utf-8");
const databaseUrl = envContent.split("\n").find(l => l.startsWith("DATABASE_URL="))?.slice("DATABASE_URL=".length).trim().replace(/^["']|["']$/g, "");
const sql = neon(databaseUrl);

console.log("🔧 Fixing renewal commission recovery...\n");

try {
  // Drop conditional index, add plain unique index on razorpay_payment_id
  await sql`DROP INDEX IF EXISTS idx_commission_events_payment`;
  await sql`ALTER TABLE referral_commission_events ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255)`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_commission_events_payment_id ON referral_commission_events(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL`;
  console.log("✅ Index fixed");

  // Find all onboarded leads
  const leads = await sql`SELECT rl.id, rl.agent_id, rl.owner_id, rl.onboarded_at FROM referral_leads rl WHERE rl.onboarded_at IS NOT NULL AND rl.owner_id IS NOT NULL`;

  let inserted = 0;
  for (const lead of leads) {
    const payments = await sql`SELECT * FROM payment_history WHERE owner_id = ${lead.owner_id} AND status = 'success' ORDER BY created_at ASC`;
    
    for (let i = 1; i < payments.length; i++) {
      const p = payments[i];
      
      // Check if already exists by razorpay_payment_id
      const exists = await sql`SELECT id FROM referral_commission_events WHERE razorpay_payment_id = ${p.razorpay_payment_id}`;
      if (exists.length) continue;

      const oneYearLater = new Date(lead.onboarded_at);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      if (new Date(p.created_at) >= oneYearLater) continue;

      const amount = parseFloat(p.amount || 0);
      const commissionAmount = Math.round(amount * 0.2);

      await sql`INSERT INTO referral_commission_events (lead_id, agent_id, event_type, plan_name, plan_amount, billing_type, commission_percent, commission_amount, payment_status, razorpay_payment_id, created_at) VALUES (${lead.id}, ${lead.agent_id}, 'renewal', ${p.plan}, ${amount}, ${p.billing_type}, 20, ${commissionAmount}, 'unpaid', ${p.razorpay_payment_id}, ${p.created_at})`;
      inserted++;
      console.log(`  ✅ Renewal inserted: lead_id=${lead.id}, amount=₹${amount}, commission=₹${commissionAmount}`);
    }
  }
  console.log(`\n✅ ${inserted} renewal event(s) inserted`);

  // Recompute agent totals
  const agents = await sql`SELECT id FROM referral_agents`;
  for (const a of agents) {
    await sql`UPDATE referral_agents SET total_earnings = (SELECT COALESCE(SUM(commission_amount),0) FROM referral_commission_events WHERE agent_id = ${a.id}) WHERE id = ${a.id}`;
  }
  console.log("✅ Agent totals updated");

  // Show all events
  const events = await sql`SELECT ce.id, ce.event_type, ce.plan_amount, ce.commission_amount, ce.payment_status, ce.created_at FROM referral_commission_events ce ORDER BY ce.created_at`;
  console.log(`\n📊 All commission events (${events.length} total):`);
  events.forEach(e => console.log(`  - ${e.event_type} | ₹${e.plan_amount} | commission: ₹${e.commission_amount} | ${e.payment_status} | ${new Date(e.created_at).toLocaleDateString('en-IN')}`));

  console.log("\n🎉 Done!");
} catch (err) {
  console.error("❌ Error:", err.message);
}
