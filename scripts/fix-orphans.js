const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function fix() {
  console.log("Fixing orphan data...");

  // Delete bookings whose property no longer exists
  const b1 = await sql`
    DELETE FROM bookings
    WHERE property_id NOT IN (SELECT id FROM properties)
    RETURNING id
  `;
  console.log(`Deleted ${b1.length} orphan bookings (no property)`);

  // Null out room_id on bookings where room no longer exists
  const b2 = await sql`
    UPDATE bookings
    SET room_id = NULL, bed_id = NULL
    WHERE room_id IS NOT NULL
      AND room_id NOT IN (SELECT id FROM rooms)
    RETURNING id
  `;
  console.log(`Fixed ${b2.length} bookings with missing room`);

  // Delete beds whose room no longer exists
  const beds = await sql`
    DELETE FROM beds
    WHERE room_id NOT IN (SELECT id FROM rooms)
    RETURNING id
  `;
  console.log(`Deleted ${beds.length} orphan beds`);

  // Delete rooms whose property no longer exists
  const rooms = await sql`
    DELETE FROM rooms
    WHERE property_id NOT IN (SELECT id FROM properties)
    RETURNING id
  `;
  console.log(`Deleted ${rooms.length} orphan rooms`);

  console.log("✅ Done! Database is clean.");
}

fix().catch(console.error);
