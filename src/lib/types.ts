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
