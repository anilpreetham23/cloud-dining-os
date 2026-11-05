"use client";

import { TenantRestaurant, AdminAccount, PlatformMetrics } from "./types";
import { supabase } from "./supabase";

const TENANTS_STORAGE_KEY = "restocloud_tenants_v1";
const ADMINS_STORAGE_KEY = "restocloud_admins_v1";

export const INITIAL_TENANTS: TenantRestaurant[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Lumière Fine Dining",
    slug: "lumiere",
    city: "Hyderabad, Telangana",
    address: "Road No. 36, Jubilee Hills",
    phone: "+91 98765 43210",
    email: "concierge@lumiere.com",
    tier: "Enterprise",
    status: "active",
    created_at: "2026-09-21T09:19:03.237Z",
    admin_count: 2,
    monthly_orders: 482,
    monthly_revenue: 1245000,
    primary_admin: {
      name: "Chef Vikramaditya",
      email: "admin@lumiere.com",
    },
  },
  {
    id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    name: "Sri Divya Family Restaurant",
    slug: "sri-divya-family-restaurant",
    city: "Kurnool, Andhra Pradesh",
    address: "Near Old Bus Stand, Main Road",
    phone: "9346543338",
    email: "kurnool@sridivya.com",
    tier: "Growth",
    status: "active",
    created_at: "2026-09-25T06:21:29.576Z",
    admin_count: 1,
    monthly_orders: 620,
    monthly_revenue: 890000,
    primary_admin: {
      name: "Divya Teja",
      email: "kurnool@sridivya.com",
    },
  },
  {
    id: "e4e07d59-0530-4d5c-8553-b00f05f08217",
    name: "VPD Retreat & Resort",
    slug: "vpd-retreat",
    city: "Bengaluru, Karnataka",
    address: "Sarjapur Outer Ring Road",
    phone: "1234567890",
    email: "jchbzxnx2@gmail.com",
    tier: "Growth",
    status: "active",
    created_at: "2026-11-04T05:11:41.550Z",
    admin_count: 1,
    monthly_orders: 195,
    monthly_revenue: 430000,
    primary_admin: {
      name: "V.P. Dhananjaya",
      email: "admin@vpdretreat.com",
    },
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    name: "Hyderabad Chefs Multi-Cuisine",
    slug: "hyderabad-chefs",
    city: "Madhapur, Hyderabad",
    address: "Hitech City Main Road, Cyber Towers",
    phone: "+91 94401 23456",
    email: "contact@hyderabadchefs.com",
    tier: "Enterprise",
    status: "active",
    created_at: "2026-10-12T14:30:00.000Z",
    admin_count: 2,
    monthly_orders: 780,
    monthly_revenue: 1650000,
    primary_admin: {
      name: "Suresh Reddy",
      email: "admin@hyderabadchefs.com",
    },
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    name: "Dakshin Tiffins Express",
    slug: "dakshin-tiffins",
    city: "Gachibowli, Hyderabad",
    address: "DLF Cyber City Food Court",
    phone: "+91 98850 99887",
    email: "orders@dakshintiffins.com",
    tier: "Starter",
    status: "active",
    created_at: "2026-10-28T11:15:00.000Z",
    admin_count: 1,
    monthly_orders: 1120,
    monthly_revenue: 620000,
    primary_admin: {
      name: "Anand Murthy",
      email: "admin@dakshintiffins.com",
    },
  },
];

export const INITIAL_ADMINS: AdminAccount[] = [
  {
    id: "adm-001",
    restaurant_id: "00000000-0000-0000-0000-000000000001",
    restaurant_name: "Lumière Fine Dining",
    name: "Chef Vikramaditya (Admin 1)",
    email: "admin@lumiere.com",
    phone: "+91 98765 43210",
    role: "owner",
    status: "active",
    password: "LumiereAdmin2026",
    created_at: "2026-09-21T09:20:00.000Z",
    last_login: "Today, 10:45 AM",
  },
  {
    id: "adm-002",
    restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    restaurant_name: "Hyderabad Chefs Multi-Cuisine",
    name: "Suresh Reddy (Admin 2)",
    email: "admin@hyderabadchefs.com",
    phone: "+91 94401 23456",
    role: "owner",
    status: "active",
    password: "ChefAdmin2026",
    created_at: "2026-10-12T14:35:00.000Z",
    last_login: "Yesterday, 04:12 PM",
  },
  {
    id: "adm-003",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    restaurant_name: "Sri Divya Family Restaurant",
    name: "Divya Teja (Admin 3)",
    email: "kurnool@sridivya.com",
    phone: "9346543338",
    role: "owner",
    status: "active",
    password: "SriDivyaAdmin2026",
    created_at: "2026-09-25T06:30:00.000Z",
    last_login: "2 days ago",
  },
  {
    id: "adm-004",
    restaurant_id: "e4e07d59-0530-4d5c-8553-b00f05f08217",
    restaurant_name: "VPD Retreat & Resort",
    name: "V.P. Dhananjaya (Admin 4)",
    email: "admin@vpdretreat.com",
    phone: "1234567890",
    role: "owner",
    status: "active",
    password: "VpdAdmin2026",
    created_at: "2026-11-04T05:15:00.000Z",
    last_login: "Today, 08:30 AM",
  },
  {
    id: "adm-005",
    restaurant_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    restaurant_name: "Dakshin Tiffins Express",
    name: "Anand Murthy (Admin 5)",
    email: "admin@dakshintiffins.com",
    phone: "+91 98850 99887",
    role: "owner",
    status: "active",
    password: "DakshinAdmin2026",
    created_at: "2026-10-28T11:20:00.000Z",
    last_login: "3 days ago",
  },
];

export function getStoredTenants(): TenantRestaurant[] {
  if (typeof window === "undefined") return INITIAL_TENANTS;
  try {
    const raw = localStorage.getItem(TENANTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(INITIAL_TENANTS));
      return INITIAL_TENANTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_TENANTS;
  }
}

export function saveStoredTenants(tenants: TenantRestaurant[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
  } catch (e) {
    console.error("Failed to save tenants to localStorage", e);
  }
}

export function getStoredAdmins(): AdminAccount[] {
  if (typeof window === "undefined") return INITIAL_ADMINS;
  try {
    const raw = localStorage.getItem(ADMINS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(INITIAL_ADMINS));
      return INITIAL_ADMINS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ADMINS;
  }
}

export function saveStoredAdmins(admins: AdminAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
  } catch (e) {
    console.error("Failed to save admins to localStorage", e);
  }
}

export async function syncWithSupabase(): Promise<TenantRestaurant[]> {
  try {
    const { data: dbRestaurants } = await supabase
      .from("restaurants")
      .select("id, name, slug, status, email, phone, created_at")
      .order("created_at", { ascending: false });

    const localTenants = getStoredTenants();
    if (!dbRestaurants || dbRestaurants.length === 0) return localTenants;

    const merged = [...localTenants];
    dbRestaurants.forEach((dbR) => {
      const exists = merged.find((t) => t.id === dbR.id || t.slug === dbR.slug);
      if (!exists) {
        merged.push({
          id: dbR.id,
          name: dbR.name,
          slug: dbR.slug,
          city: "Telangana / AP",
          phone: dbR.phone || "+91 90000 00000",
          email: dbR.email || `contact@${dbR.slug}.com`,
          tier: "Growth",
          status: (dbR.status as any) || "active",
          created_at: dbR.created_at || new Date().toISOString(),
          admin_count: 1,
          monthly_orders: 150,
          monthly_revenue: 350000,
        });
      }
    });

    saveStoredTenants(merged);
    return merged;
  } catch (e) {
    console.warn("Supabase fetch fallback to local store:", e);
    return getStoredTenants();
  }
}

export async function createTenantWithAdmin(
  tenantData: {
    name: string;
    slug: string;
    city: string;
    address?: string;
    phone?: string;
    email?: string;
    tier: "Starter" | "Growth" | "Enterprise";
  },
  adminData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: "owner" | "manager";
  }
): Promise<{ ok: boolean; tenant: TenantRestaurant; admin: AdminAccount; error?: string }> {
  try {
    const tenantId = `tenant-${Date.now()}`;
    const newTenant: TenantRestaurant = {
      id: tenantId,
      name: tenantData.name.trim(),
      slug: tenantData.slug.trim().toLowerCase(),
      city: tenantData.city.trim(),
      address: tenantData.address?.trim(),
      phone: tenantData.phone?.trim() || adminData.phone?.trim(),
      email: tenantData.email?.trim() || adminData.email.trim(),
      tier: tenantData.tier,
      status: "active",
      created_at: new Date().toISOString(),
      admin_count: 1,
      monthly_orders: 0,
      monthly_revenue: 0,
      primary_admin: {
        name: adminData.name.trim(),
        email: adminData.email.trim().toLowerCase(),
      },
    };

    const adminId = `adm-${Date.now()}`;
    const newAdmin: AdminAccount = {
      id: adminId,
      restaurant_id: tenantId,
      restaurant_name: tenantData.name.trim(),
      name: adminData.name.trim(),
      email: adminData.email.trim().toLowerCase(),
      phone: adminData.phone?.trim() || tenantData.phone?.trim(),
      role: adminData.role,
      status: "active",
      password: adminData.password,
      created_at: new Date().toISOString(),
      last_login: "Not logged in yet",
    };

    const currentTenants = getStoredTenants();
    const currentAdmins = getStoredAdmins();

    saveStoredTenants([newTenant, ...currentTenants]);
    saveStoredAdmins([newAdmin, ...currentAdmins]);

    try {
      await supabase.from("restaurants").insert({
        name: newTenant.name,
        slug: newTenant.slug,
        status: "active",
        phone: newTenant.phone,
        email: newTenant.email,
      });
    } catch {
      // Ignored for offline/demo robustness
    }

    return { ok: true, tenant: newTenant, admin: newAdmin };
  } catch (err: any) {
    return { ok: false, tenant: {} as any, admin: {} as any, error: err?.message || "Failed to create tenant" };
  }
}

export function createAdminAccount(
  restaurantId: string,
  restaurantName: string,
  adminData: {
    name: string;
    email: string;
    phone?: string;
    role: "owner" | "manager" | "staff";
    password: string;
  }
): { ok: boolean; admin: AdminAccount; error?: string } {
  try {
    const currentAdmins = getStoredAdmins();
    const currentTenants = getStoredTenants();

    if (currentAdmins.some((a) => a.email.toLowerCase() === adminData.email.trim().toLowerCase())) {
      return { ok: false, admin: {} as any, error: "An admin account with this email already exists." };
    }

    const newAdmin: AdminAccount = {
      id: `adm-${Date.now()}`,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      name: adminData.name.trim(),
      email: adminData.email.trim().toLowerCase(),
      phone: adminData.phone?.trim(),
      role: adminData.role,
      status: "active",
      password: adminData.password,
      created_at: new Date().toISOString(),
      last_login: "Credentials Generated",
    };

    saveStoredAdmins([newAdmin, ...currentAdmins]);

    const updatedTenants = currentTenants.map((t) => {
      if (t.id === restaurantId) {
        return { ...t, admin_count: (t.admin_count || 1) + 1 };
      }
      return t;
    });
    saveStoredTenants(updatedTenants);

    return { ok: true, admin: newAdmin };
  } catch (e: any) {
    return { ok: false, admin: {} as any, error: e?.message || "Error creating admin account" };
  }
}

export function resetAdminPassword(adminId: string, newPass: string): boolean {
  try {
    const admins = getStoredAdmins();
    const updated = admins.map((a) => (a.id === adminId ? { ...a, password: newPass } : a));
    saveStoredAdmins(updated);
    return true;
  } catch {
    return false;
  }
}

export function toggleAdminStatus(adminId: string): boolean {
  try {
    const admins = getStoredAdmins();
    const updated = admins.map((a) =>
      a.id === adminId ? { ...a, status: (a.status === "active" ? "inactive" : "active") as "active" | "inactive" } : a
    );
    saveStoredAdmins(updated);
    return true;
  } catch {
    return false;
  }
}

export function getPlatformMetrics(tenants: TenantRestaurant[], admins: AdminAccount[]): PlatformMetrics {
  const activeTenants = tenants.filter((t) => t.status === "active");
  const totalOrders = tenants.reduce((acc, t) => acc + (t.monthly_orders || 0), 0);
  const totalRevenue = tenants.reduce((acc, t) => acc + (t.monthly_revenue || 0), 0);

  return {
    total_restaurants: tenants.length,
    active_restaurants: activeTenants.length,
    total_admins: admins.length,
    total_orders: totalOrders,
    gross_merchandise_value: totalRevenue,
    active_kds_screens: activeTenants.length * 2,
  };
}

export function formatCredentialVoucher(admin: AdminAccount, backofficeUrl: string): string {
  return `========================================
🏢 RESTAURANT CLOUD OS — ADMIN ACCESS VOUCHER
========================================
Restaurant: ${admin.restaurant_name}
Assigned Admin: ${admin.name}
Role: ${admin.role.toUpperCase()} (Full Back-Office & KDS Access)
Login Email: ${admin.email}
Temporary Password: ${admin.password}

👉 Direct Back-Office Access Link:
${backofficeUrl}

Please sign in and change your password upon initial setup.
========================================`;
}
