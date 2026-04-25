export type UserRole = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export type ServiceCategory =
  | 'Beauty'
  | 'Cleaning'
  | 'Repairs'
  | 'Plumbing'
  | 'Electrical'
  | 'Painting'
  | 'Pest Control'
  | 'Appliance Repair'
  | 'Wellness'
  | 'AC Repair';

export interface Service {
  id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  base_price: number;
  duration_minutes: number;
  thumbnail_url: string;
  is_active: boolean;
  avg_rating?: number;
  total_reviews?: number;
  badge?: 'Top Rated' | 'New' | 'Popular';
}

export interface Provider {
  id: string;
  user_id: string;
  name: string;
  bio: string;
  avatar_url: string;
  experience_years: number;
  avg_rating: number;
  total_reviews: number;
  skills: string[];
  is_verified: boolean;
  location: { lat: number; lng: number };
  city: string;
}

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Rejected'
  | 'Pro Assigned'
  | 'On the Way'
  | 'Arrived'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string | null;
  service_id: string;
  address_id: string | null;
  scheduled_at: string;
  address?: Address;
  status: BookingStatus;
  total_price: number;
  otp?: string;
  created_at: string;
  service?: Service;
  provider?: Provider;
}

export interface ProviderAvailability {
  id: string;
  provider_id: string;
  day_of_week: number;
  time_slot: string;
  is_available: boolean;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer?: { full_name: string; avatar_url?: string };
}

export type AddressLabel = 'Home' | 'Work' | 'Other';

export interface Address {
  id: string;
  user_id: string;
  label: AddressLabel;
  line1: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
  is_default: boolean;
}

export interface BookingSlot {
  time: string;
  available: boolean;
}

export interface TimeSlot {
  label: string;
  value: string;
}
