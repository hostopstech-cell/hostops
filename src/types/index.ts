export type PropertyType = "hotel" | "hostel" | "dorm" | "guesthouse";

export interface Owner {
  id: number;
  name: string;
  email: string;
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
  total_beds: number;
  created_at: string;
}

export interface Booking {
  id: number;
  property_id: number;
  guest_name: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  beds: number;
  amount: string;
  status: string;
  created_at: string;
}

export interface DashboardStats {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  occupancyRate: number;
  revenueToday: number;
  revenueMonth: number;
  todaysCheckins: {
    id: number;
    guest_name: string;
    property_name: string;
    beds: number;
    check_in: string;
    status: string;
  }[];
  properties: Property[];
}
