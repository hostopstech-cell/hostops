-- HostOps schema (run via npm run db:init)

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS beds CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS owners CASCADE;

CREATE TABLE owners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  subscription_plan VARCHAR(50) DEFAULT 'trial',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('hotel', 'hostel', 'dorm', 'guesthouse')),
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10),
  contact VARCHAR(20),
  email VARCHAR(255),
  description TEXT,
  check_in_time VARCHAR(10) DEFAULT '14:00',
  check_out_time VARCHAR(10) DEFAULT '11:00',
  amenities TEXT[],
  policies TEXT,
  google_map_link TEXT,
  upi_id VARCHAR(255),
  photos TEXT[],
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  total_beds INTEGER NOT NULL CHECK (total_beds > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('dorm', 'private', 'deluxe', 'family')),
  capacity INTEGER NOT NULL DEFAULT 1,
  price_per_night NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE beds (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_number VARCHAR(20) NOT NULL,
  bed_type VARCHAR(20) CHECK (bed_type IN ('upper', 'lower', 'normal')),
  price_per_night NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE guests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  country VARCHAR(100) DEFAULT 'India',
  address TEXT,
  id_type VARCHAR(50) CHECK (id_type IN ('aadhar', 'passport', 'driving_license', 'voter_id')),
  id_number VARCHAR(100),
  notes TEXT,
  total_stays INTEGER DEFAULT 0,
  total_spent NUMERIC(10, 2) DEFAULT 0,
  last_visit DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE NOT NULL,
  property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_id INTEGER REFERENCES rooms(id),
  bed_id INTEGER REFERENCES beds(id),
  guest_id INTEGER REFERENCES guests(id),
  guest_name VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(20),
  guest_email VARCHAR(255),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  number_of_guests INTEGER DEFAULT 1,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) DEFAULT 0,
  final_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) CHECK (payment_method IN ('upi', 'cash', 'card', 'bank_transfer')),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('paid', 'pending', 'partial', 'refunded')),
  booking_source VARCHAR(50) DEFAULT 'direct' CHECK (booking_source IN ('direct', 'walk_in', 'airbnb', 'booking_com', 'goibibo', 'makemytrip', 'hostelworld', 'other')),
  special_requests TEXT,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (check_out > check_in)
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL,
  method VARCHAR(50) CHECK (method IN ('upi', 'cash', 'card', 'bank_transfer')),
  status VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'partial', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_owner_id ON properties(owner_id);
CREATE INDEX idx_rooms_property_id ON rooms(property_id);
CREATE INDEX idx_beds_room_id ON beds(room_id);
CREATE INDEX idx_guests_phone ON guests(phone);
CREATE INDEX idx_bookings_property_id ON bookings(property_id);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_code ON bookings(booking_code);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
