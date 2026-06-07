export type PropertyType = "hotel" | "hostel" | "dorm" | "guesthouse";
export type RoomType = "dorm" | "private" | "deluxe" | "family";
export type BedType = "upper" | "lower" | "normal";
export type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "partial" | "refunded";
export type PaymentMethod = "upi" | "cash" | "card" | "bank_transfer";
export type BookingSource = "direct" | "walk_in" | "airbnb" | "booking_com" | "goibibo" | "makemytrip" | "hostelworld" | "other";
export type IDType = "aadhar" | "passport" | "driving_license" | "voter_id";

export interface Owner {
  id: number;
  name: string;
  email: string;
  subscription_plan: string;
  created_at: string;
}

export interface Property {
  id: number;
  owner_id: number;
  name: string;
  type: PropertyType;
  address: string;
  city: string;
  state: string;
  pincode: string | null;
  contact: string | null;
  email: string | null;
  description: string | null;
  check_in_time: string;
  check_out_time: string;
  amenities: string[] | null;
  policies: string | null;
  google_map_link: string | null;
  upi_id: string | null;
  photos: string[] | null;
  status: "active" | "inactive";
  total_beds: number;
  created_at: string;
}

export interface Room {
  id: number;
  property_id: number;
  name: string;
  type: RoomType;
  capacity: number;
  price_per_night: number;
  status: "available" | "maintenance" | "inactive";
  created_at: string;
}

export interface Bed {
  id: number;
  room_id: number;
  bed_number: string;
  bed_type: BedType | null;
  price_per_night: number;
  status: "available" | "occupied" | "maintenance";
  created_at: string;
}

export interface Guest {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  country: string;
  address: string | null;
  id_type: IDType | null;
  id_number: string | null;
  notes: string | null;
  total_stays: number;
  total_spent: number;
  last_visit: string | null;
  created_at: string;
}

export interface Booking {
  id: number;
  booking_code: string;
  property_id: number;
  room_id: number | null;
  bed_id: number | null;
  guest_id: number | null;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  check_in: string;
  check_out: string;
  number_of_guests: number;
  amount: number;
  discount: number;
  final_amount: number;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  booking_source: BookingSource;
  special_requests: string | null;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
}

export interface Payment {
  id: number;
  booking_id: number;
  guest_name: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalProperties: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  revenueToday: number;
  revenueMonth: number;
  checkinsToday: number;
  checkoutsToday: number;
  recentBookings: {
    id: number;
    booking_code: string;
    guest_name: string;
    property_name: string;
    check_in: string;
    check_out: string;
    status: BookingStatus;
  }[];
  todaysCheckins: {
    id: number;
    guest_name: string;
    property_name: string;
    check_in: string;
    status: BookingStatus;
  }[];
  todaysCheckouts: {
    id: number;
    guest_name: string;
    property_name: string;
    check_out: string;
    status: BookingStatus;
  }[];
  properties: Property[];
}
