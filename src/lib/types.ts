export type SubscriptionTier = "Starter" | "Growth" | "Enterprise";

export type TenantStatus = "active" | "onboarding" | "suspended";

export type AdminRole = "owner" | "manager" | "staff";

export interface AdminAccount {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  status: "active" | "inactive";
  password?: string;
  created_at: string;
  last_login?: string;
}

export interface TenantRestaurant {
  id: string;
  name: string;
  slug: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  tier: SubscriptionTier;
  status: TenantStatus;
  logo_url?: string;
  created_at: string;
  admin_count?: number;
  monthly_orders?: number;
  monthly_revenue?: number;
  primary_admin?: {
    name: string;
    email: string;
  };
  // Custom Profile & Branding
  tagline?: string;
  brand_color?: string; // hex code e.g. #D4AF37
  gstin?: string;
  service_charge_pct?: number;
  gst_pct?: number;
  floors?: string[]; // e.g. ["Ground Floor", "1st Floor - AC Dining", "Rooftop Terrace"]
  opening_hours?: string;
}

export interface PlatformMetrics {
  total_restaurants: number;
  active_restaurants: number;
  total_admins: number;
  total_orders: number;
  gross_merchandise_value: number;
  active_kds_screens: number;
}

export interface RestaurantOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface RestaurantOrder {
  id: string;
  restaurant_id: string;
  order_number: string;
  table_number: number;
  floor?: string;
  customer_name: string;
  customer_phone?: string;
  order_type?: "dine_in" | "takeaway";
  source?: "qr_scan" | "customer_portal" | "pos";
  notes?: string;
  estimated_pickup_minutes?: number;
  items: RestaurantOrderItem[];
  total: number;
  status: "new" | "preparing" | "ready" | "served" | "paid";
  created_at: string;
  payment_method?: "UPI" | "Card" | "Cash";
}

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  table_number: number;
  capacity: number;
  floor: string; // e.g. "Ground Floor", "1st Floor", "Rooftop"
  section?: string;
  status: "available" | "occupied" | "reserved" | "cleaning";
  guests_count?: number;
  current_order_id?: string;
  occupied_since?: string;
}

export interface RestaurantMenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  category: "Starters" | "Biryanis & Rice" | "Main Curries" | "Breads" | "Desserts" | "Beverages";
  price: number;
  is_available: boolean;
  description: string;
  dietary?: "veg" | "non-veg";
  prep_time_minutes?: number;
}

export interface RestaurantInventoryItem {
  id: string;
  restaurant_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: "kg" | "g" | "ltr" | "ml" | "pieces" | "packets" | "boxes";
  reorder_level: number;
  cost_per_unit: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
  last_restocked?: string;
}

export interface RestaurantStaff {
  id: string;
  restaurant_id: string;
  name: string;
  role: "Waiter" | "Kitchen Chef" | "Cashier" | "Floor Captain" | "Store Manager";
  phone: string;
  email?: string;
  pin?: string;
  shift: "Morning" | "Evening" | "Full Day";
  status: "active" | "on_break" | "inactive";
  assigned_floor?: string;
}

export interface UserSession {
  role: "SUPER_ADMIN" | "RESTAURANT_ADMIN";
  name: string;
  email: string;
  adminId?: string;
  restaurantId?: string;
  restaurantName?: string;
  adminRole?: AdminRole;
  isSuperAdminPreview?: boolean;
  loginTime: string;
}
