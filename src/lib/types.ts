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
  customer_name: string;
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
  status: "available" | "occupied" | "reserved";
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
