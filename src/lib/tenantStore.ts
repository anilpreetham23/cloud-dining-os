"use client";

import {
  TenantRestaurant,
  AdminAccount,
  PlatformMetrics,
  UserSession,
  RestaurantOrder,
  RestaurantTable,
  RestaurantMenuItem,
  RestaurantInventoryItem,
  RestaurantStaff,
} from "./types";
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
    const parsed: TenantRestaurant[] = JSON.parse(raw);
    const existingIds = new Set(parsed.map((t) => t.id));
    const missing = INITIAL_TENANTS.filter((t) => !existingIds.has(t.id));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
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
    const parsed: AdminAccount[] = JSON.parse(raw);
    const existingEmails = new Set(parsed.map((a) => a.email.toLowerCase()));
    const missing = INITIAL_ADMINS.filter((a) => !existingEmails.has(a.email.toLowerCase()));
    if (missing.length > 0) {
      const merged = [...parsed, ...missing];
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
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

export function formatCredentialVoucher(admin: AdminAccount, customUrl?: string): string {
  const loginUrl = customUrl || "https://cloud-dining-os.vercel.app/login";
  return `======================================================
🍽️ CLOUDDINING OS — RESTAURANT ACCESS PASS
======================================================
Restaurant: ${admin.restaurant_name}
Assigned Seat: ${admin.name}
Role: ${admin.role.toUpperCase()} (Full Back-Office & Kitchen KDS Access)

👉 Direct Partner Login Link:
${loginUrl}

🔑 Login Credentials:
Email / Username: ${admin.email}
Temporary Password: ${admin.password}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Getting Started:
1. Open the login link above in your browser.
2. Sign in with your assigned email and password.
3. Access your Live Table Floor, Kitchen KDS, and Menu.
4. For security, update your password after your first login.

Issued by: Bobby (Platform Super Admin)
Platform Support: support@clouddining.com
======================================================`;
}

// ----------------------------------------------------
// SESSION & AUTHENTICATION MANAGEMENT
// ----------------------------------------------------
const SESSION_KEY = "clouddining_active_session";

export function getActiveSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setActiveSession(session: UserSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save session", e);
  }
}

export function clearActiveSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

function verifyAdminPassword(
  storedPass: string | undefined,
  inputPass: string,
  adminEmail: string
): boolean {
  if (!inputPass) return false;
  const cleanInput = inputPass.trim();

  // 1. Direct or case-insensitive match against stored password
  if (
    storedPass &&
    (storedPass === cleanInput || storedPass.toLowerCase() === cleanInput.toLowerCase())
  ) {
    return true;
  }

  // 2. Resilient demo credentials aliases
  const e = adminEmail.toLowerCase();
  if (e === "kurnool@sridivya.com" || e.includes("sridivya")) {
    const valid = [
      "sridivyaadmin2026",
      "sridivya@2026",
      "sridivya2026",
      "sridivyaadmin",
      "admin2026",
    ];
    return valid.includes(cleanInput.toLowerCase());
  }

  if (e === "admin@hyderabadchefs.com" || e.includes("hyderabadchefs")) {
    const valid = ["chefadmin2026", "hyderabadchefs2026", "chef2026", "admin2026"];
    return valid.includes(cleanInput.toLowerCase());
  }

  if (e === "admin@lumiere.com" || e.includes("lumiere")) {
    const valid = ["lumiereadmin2026", "lumiere2026", "admin2026"];
    return valid.includes(cleanInput.toLowerCase());
  }

  if (
    e === "admin@vpdretreat.com" ||
    e === "jchbzxnx2@gmail.com" ||
    e.includes("vpdretreat")
  ) {
    const valid = ["vpdadmin2026", "vpdretreat2026", "admin2026"];
    return valid.includes(cleanInput.toLowerCase());
  }

  return false;
}

export function authenticateUser(
  emailInput: string,
  passInput: string
): { success: boolean; session?: UserSession; error?: string } {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPass = passInput.trim();

  // 1. Check Super Admin (Bobby)
  const superAdminEmails = [
    "bobby@clouddining.com",
    "bobby@gmail.com",
    "superadmin@clouddining.com",
    "superadmin@restocloud.com",
    "admin@clouddining.com",
  ];

  if (
    superAdminEmails.includes(cleanEmail) &&
    (cleanPass === "SuperAdmin2026" || cleanPass.toLowerCase() === "superadmin2026")
  ) {
    const session: UserSession = {
      role: "SUPER_ADMIN",
      name: "Bobby (Platform Head)",
      email: cleanEmail,
      loginTime: new Date().toISOString(),
    };
    setActiveSession(session);
    return { success: true, session };
  }

  // 2. Check Restaurant Admins
  const allAdmins = getStoredAdmins();
  const matchedAdmin = allAdmins.find((a) => a.email.toLowerCase() === cleanEmail);

  if (matchedAdmin) {
    if (matchedAdmin.status === "inactive") {
      return {
        success: false,
        error: "This restaurant admin account is currently paused. Please contact Bobby (Super Admin).",
      };
    }

    if (verifyAdminPassword(matchedAdmin.password, cleanPass, matchedAdmin.email)) {
      const session: UserSession = {
        role: "RESTAURANT_ADMIN",
        name: matchedAdmin.name,
        email: matchedAdmin.email,
        adminId: matchedAdmin.id,
        restaurantId: matchedAdmin.restaurant_id,
        restaurantName: matchedAdmin.restaurant_name,
        adminRole: matchedAdmin.role,
        loginTime: new Date().toISOString(),
      };
      setActiveSession(session);
      return { success: true, session };
    } else {
      return {
        success: false,
        error: "Incorrect password for this restaurant account. Check your voucher or use SriDivyaAdmin2026.",
      };
    }
  }

  return {
    success: false,
    error: "No account found matching this email. Please check your spelling or contact Bobby (Super Admin).",
  };
}

// ----------------------------------------------------
// RESTAURANT PORTAL SAMPLE DATA & LIVE CONTROLS
// ----------------------------------------------------
const ORDERS_STORAGE_KEY = "clouddining_orders_v1";
const TABLES_STORAGE_KEY = "clouddining_tables_v1";
const MENUS_STORAGE_KEY = "clouddining_menus_v1";

const DEFAULT_ORDERS: RestaurantOrder[] = [
  {
    id: "ord-101",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", // Sri Divya
    order_number: "SD-101",
    table_number: 4,
    customer_name: "Ramesh Naidu",
    items: [
      { name: "Rayalaseema Ragi Sangati with Natukodi Pulusu", quantity: 2, price: 420 },
      { name: "Gongura Mutton Biryani", quantity: 1, price: 480 },
      { name: "Sweet Lassi", quantity: 2, price: 90 },
    ],
    total: 1500,
    status: "preparing",
    created_at: "10 mins ago",
    payment_method: "UPI",
  },
  {
    id: "ord-102",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    order_number: "SD-102",
    table_number: 7,
    customer_name: "Sneha Reddy",
    items: [
      { name: "Kurnool Ulavacharu Chicken Biryani", quantity: 2, price: 390 },
      { name: "Apollo Fish Fry", quantity: 1, price: 360 },
      { name: "Fresh Lime Soda", quantity: 2, price: 70 },
    ],
    total: 1280,
    status: "new",
    created_at: "3 mins ago",
    payment_method: "UPI",
  },
  {
    id: "ord-103",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    order_number: "SD-099",
    table_number: 2,
    customer_name: "Venkat Rao",
    items: [
      { name: "Nellore Chepala Pulusu", quantity: 1, price: 440 },
      { name: "Steamed Ponni Rice", quantity: 2, price: 120 },
      { name: "Curd Rice & Pickle", quantity: 1, price: 140 },
    ],
    total: 820,
    status: "ready",
    created_at: "22 mins ago",
    payment_method: "Cash",
  },
  {
    id: "ord-201",
    restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", // Hyderabad Chefs
    order_number: "HC-405",
    table_number: 12,
    customer_name: "Mohammed Farooq",
    items: [
      { name: "Special Mutton Dum Biryani (Zafrani)", quantity: 2, price: 540 },
      { name: "Shahi Nizami Handi Paneer", quantity: 1, price: 380 },
      { name: "Rumali Roti (4 pcs)", quantity: 1, price: 160 },
      { name: "Double Ka Meetha", quantity: 2, price: 140 },
    ],
    total: 1900,
    status: "preparing",
    created_at: "14 mins ago",
    payment_method: "Card",
  },
];

const DEFAULT_TABLES: RestaurantTable[] = [
  // Sri Divya (Kurnool) - Multi Floor Tables
  { id: "tbl-sd-1", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 1, capacity: 2, floor: "Ground Floor", section: "Main Hall", status: "available" },
  { id: "tbl-sd-2", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 2, capacity: 4, floor: "Ground Floor", section: "Main Hall", status: "occupied", guests_count: 3, current_order_id: "ord-103", occupied_since: "25m ago" },
  { id: "tbl-sd-3", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 3, capacity: 4, floor: "Ground Floor", section: "Window Section", status: "available" },
  { id: "tbl-sd-4", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 4, capacity: 6, floor: "Ground Floor", section: "Courtyard", status: "occupied", guests_count: 5, current_order_id: "ord-101", occupied_since: "15m ago" },
  { id: "tbl-sd-5", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 5, capacity: 2, floor: "1st Floor - AC Family Dining", section: "Family Cabana", status: "reserved", guests_count: 2 },
  { id: "tbl-sd-6", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 6, capacity: 6, floor: "1st Floor - AC Family Dining", section: "Family Cabana", status: "available" },
  { id: "tbl-sd-7", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 7, capacity: 8, floor: "1st Floor - AC Family Dining", section: "Grand Banquet", status: "occupied", guests_count: 6, current_order_id: "ord-102", occupied_since: "5m ago" },
  { id: "tbl-sd-8", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 8, capacity: 4, floor: "Rooftop Terrace Lounge", section: "Open Air Starlight", status: "cleaning" },
  { id: "tbl-sd-9", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 9, capacity: 4, floor: "Rooftop Terrace Lounge", section: "Open Air Starlight", status: "available" },

  // Hyderabad Chefs - Multi Floor
  { id: "tbl-hc-1", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", table_number: 1, capacity: 4, floor: "Ground Floor", section: "Nizami Hall", status: "available" },
  { id: "tbl-hc-2", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", table_number: 12, capacity: 6, floor: "Ground Floor", section: "Nizami Hall", status: "occupied", guests_count: 4, current_order_id: "ord-201", occupied_since: "14m ago" },
  { id: "tbl-hc-3", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", table_number: 21, capacity: 8, floor: "1st Floor - AC Family Dining", section: "Zafrani Lounge", status: "reserved", guests_count: 6 },
  { id: "tbl-hc-4", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", table_number: 30, capacity: 4, floor: "Rooftop Terrace Lounge", section: "Sky View", status: "available" },

  // Lumiere
  { id: "tbl-lum-1", restaurant_id: "00000000-0000-0000-0000-000000000001", table_number: 1, capacity: 2, floor: "Ground Floor", section: "Royal Salon", status: "available" },
  { id: "tbl-lum-2", restaurant_id: "00000000-0000-0000-0000-000000000001", table_number: 2, capacity: 4, floor: "Ground Floor", section: "Awadhi Dining", status: "occupied", guests_count: 2 },
  { id: "tbl-lum-3", restaurant_id: "00000000-0000-0000-0000-000000000001", table_number: 10, capacity: 6, floor: "1st Floor - AC Family Dining", section: "Maharaja Suite", status: "available" },

  // VPD Retreat
  { id: "tbl-vpd-1", restaurant_id: "e4e07d59-0530-4d5c-8553-b00f05f08217", table_number: 1, capacity: 4, floor: "Ground Floor", section: "Woodfired Bistro", status: "available" },
  { id: "tbl-vpd-2", restaurant_id: "e4e07d59-0530-4d5c-8553-b00f05f08217", table_number: 5, capacity: 6, floor: "Rooftop Terrace Lounge", section: "Garden Deck", status: "occupied", guests_count: 4 },
];

const DEFAULT_MENU_ITEMS: RestaurantMenuItem[] = [
  // Sri Divya (Kurnool) - Rayalaseema & Coastal Cuisine
  { id: "menu-sd-1", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Rayalaseema Ragi Sangati with Natukodi Pulusu", category: "Main Curries", price: 420, is_available: true, description: "Desi country chicken slow-cooked in stone-ground fiery spices, served with steaming ragi mudda and pure ghee.", dietary: "non-veg", prep_time_minutes: 20 },
  { id: "menu-sd-2", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Gongura Mutton Biryani", category: "Biryanis & Rice", price: 480, is_available: true, description: "Tender goat pieces layered with tangy gongura leaves and aged aromatic basmati dum rice.", dietary: "non-veg", prep_time_minutes: 15 },
  { id: "menu-sd-3", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Apollo Fish Fry", category: "Starters", price: 360, is_available: true, description: "Crispy marinated murrel fish fillets tossed with curry leaves, cracked red chilies, and tangy house masala.", dietary: "non-veg", prep_time_minutes: 12 },
  { id: "menu-sd-4", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Nellore Chepala Pulusu", category: "Main Curries", price: 440, is_available: true, description: "Heritage coastal tamarind fish curry slow-simmered in an earthen clay pot with shallots and fenugreek.", dietary: "non-veg", prep_time_minutes: 25 },
  { id: "menu-sd-5", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Kurnool Ulavacharu Chicken Biryani", category: "Biryanis & Rice", price: 390, is_available: true, description: "Slow-reduced horsegram soup layered with spiced chicken and fragrant basmati dum rice.", dietary: "non-veg", prep_time_minutes: 15 },
  { id: "menu-sd-6", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Gutti Vankaya Kura", category: "Main Curries", price: 280, is_available: true, description: "Tender stuffed brinjals in a roasted peanut, sesame, and dry coconut gravy.", dietary: "veg", prep_time_minutes: 15 },
  { id: "menu-sd-7", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Butter Garlic Naan", category: "Breads", price: 75, is_available: true, description: "Clay-oven baked leavened bread brushed with melted butter and roasted garlic flakes.", dietary: "veg", prep_time_minutes: 8 },
  { id: "menu-sd-8", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Apricot Delight with Vanilla Gelato", category: "Desserts", price: 180, is_available: true, description: "Stewed Turkish apricots layered with sponge cake, whipped cream, and vanilla scoop.", dietary: "veg", prep_time_minutes: 5 },
  { id: "menu-sd-9", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Rayalaseema Spiced Buttermilk", category: "Beverages", price: 60, is_available: true, description: "Chilled fresh churned curd tempered with ginger, green chilies, and curry leaves.", dietary: "veg", prep_time_minutes: 3 },

  // Hyderabad Chefs - Authentic Hyderabadi & Mughlai
  { id: "menu-hc-1", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Special Mutton Dum Biryani (Zafrani)", category: "Biryanis & Rice", price: 540, is_available: true, description: "Old-city recipe pot dum biryani with tender lamb, saffron strands, and ghee.", dietary: "non-veg", prep_time_minutes: 15 },
  { id: "menu-hc-2", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Shahi Nizami Handi Paneer", category: "Main Curries", price: 380, is_available: true, description: "Cottage cheese cubes simmered with cashew cream, fenugreek, and whole spices.", dietary: "veg", prep_time_minutes: 15 },
  { id: "menu-hc-3", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Pathar Ka Gosht", category: "Starters", price: 460, is_available: true, description: "Thinly beaten lamb marinated in raw papaya and pot spices, seared over hot granite stone.", dietary: "non-veg", prep_time_minutes: 20 },
  { id: "menu-hc-4", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Hyderabadi Haleem with Fried Onions", category: "Main Curries", price: 380, is_available: true, description: "Slow-cooked cracked wheat, lentils, and tender shredded meat pounded to a silky texture.", dietary: "non-veg", prep_time_minutes: 10 },
  { id: "menu-hc-5", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Rumali Roti (4 pcs)", category: "Breads", price: 160, is_available: true, description: "Handkerchief-thin bread tossed over inverted kadhai.", dietary: "veg", prep_time_minutes: 6 },
  { id: "menu-hc-6", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Double Ka Meetha with Mawa", category: "Desserts", price: 140, is_available: true, description: "Deep-fried bread slices soaked in saffron milk and cardamom syrup, garnished with nuts.", dietary: "veg", prep_time_minutes: 5 },

  // Lumiere Fine Dining - Awadhi & Royal Indian
  { id: "menu-lum-1", restaurant_id: "00000000-0000-0000-0000-000000000001", name: "Galouti Kebab with Ulta Tawa Paratha", category: "Starters", price: 580, is_available: true, description: "Melt-in-mouth lamb medallions smoked with cloves, served on delicate saffron paratha.", dietary: "non-veg", prep_time_minutes: 18 },
  { id: "menu-lum-2", restaurant_id: "00000000-0000-0000-0000-000000000001", name: "Awadhi Dum Pukht Murgh Biryani", category: "Biryanis & Rice", price: 520, is_available: true, description: "Handi sealed with dough, slow cooked on embers with rose water and whole mace.", dietary: "non-veg", prep_time_minutes: 20 },
  { id: "menu-lum-3", restaurant_id: "00000000-0000-0000-0000-000000000001", name: "Dal Bukhara Slow-Simmered for 18h", category: "Main Curries", price: 390, is_available: true, description: "Whole black urad lentils overnight simmered with churned butter and Kashmiri chili.", dietary: "veg", prep_time_minutes: 10 },
  { id: "menu-lum-4", restaurant_id: "00000000-0000-0000-0000-000000000001", name: "Saffron Kulfi Falooda", category: "Desserts", price: 220, is_available: true, description: "House-made malai kulfi with vermicelli, basil seeds, and rose water reduction.", dietary: "veg", prep_time_minutes: 5 },

  // VPD Retreat - Woodfired Bistro
  { id: "menu-vpd-1", restaurant_id: "e4e07d59-0530-4d5c-8553-b00f05f08217", name: "Woodfired San Marzano Margherita Pizza", category: "Main Curries", price: 480, is_available: true, description: "Artisanal dough, buffalo mozzarella, fresh basil, and extra virgin olive oil.", dietary: "veg", prep_time_minutes: 15 },
  { id: "menu-vpd-2", restaurant_id: "e4e07d59-0530-4d5c-8553-b00f05f08217", name: "Truffle Wild Mushroom Risotto", category: "Biryanis & Rice", price: 540, is_available: true, description: "Carnaroli rice with porcini mushrooms, parmesan crisp, and black truffle oil.", dietary: "veg", prep_time_minutes: 20 },
  { id: "menu-vpd-3", restaurant_id: "e4e07d59-0530-4d5c-8553-b00f05f08217", name: "Smoked BBQ Chicken Wings", category: "Starters", price: 380, is_available: true, description: "Hickory-smoked wings glazed in spicy bourbon glaze with ranch dip.", dietary: "non-veg", prep_time_minutes: 15 },
  { id: "menu-vpd-4", restaurant_id: "e4e07d59-0530-4d5c-8553-b00f05f08217", name: "Classic Italian Tiramisu", category: "Desserts", price: 260, is_available: true, description: "Espresso soaked ladyfingers with mascarpone cream and Valrhona cocoa.", dietary: "veg", prep_time_minutes: 5 },
];

const INVENTORY_STORAGE_KEY = "clouddining_inventory_v1";

const DEFAULT_INVENTORY: RestaurantInventoryItem[] = [
  { id: "inv-1", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Aged Basmati Rice (Daawat Gold)", category: "Grains & Rice", quantity: 120, unit: "kg", reorder_level: 30, cost_per_unit: 140, status: "in_stock", last_restocked: "2 days ago" },
  { id: "inv-2", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Desi Country Chicken (Natukodi)", category: "Poultry & Meat", quantity: 18, unit: "kg", reorder_level: 25, cost_per_unit: 360, status: "low_stock", last_restocked: "Today, 7 AM" },
  { id: "inv-3", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Fresh Gongura Leaves (Organic)", category: "Fresh Produce", quantity: 12, unit: "kg", reorder_level: 8, cost_per_unit: 45, status: "in_stock", last_restocked: "Yesterday" },
  { id: "inv-4", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Pure Cow Ghee (A2 Bilona)", category: "Dairy & Oils", quantity: 6, unit: "ltr", reorder_level: 10, cost_per_unit: 850, status: "low_stock", last_restocked: "5 days ago" },
  { id: "inv-5", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Fresh Malai Paneer Blocks", category: "Dairy & Oils", quantity: 22, unit: "kg", reorder_level: 10, cost_per_unit: 320, status: "in_stock", last_restocked: "Today, 8 AM" },
  { id: "inv-6", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Murrel Fish Fillets (Cleaned)", category: "Poultry & Meat", quantity: 2, unit: "kg", reorder_level: 12, cost_per_unit: 480, status: "low_stock", last_restocked: "3 days ago" },
  { id: "inv-7", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Ragi Flour (Stone Ground)", category: "Grains & Rice", quantity: 40, unit: "kg", reorder_level: 15, cost_per_unit: 65, status: "in_stock", last_restocked: "4 days ago" },
  { id: "inv-8", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Guntur S10 Red Chillies", category: "Spices & Dry Goods", quantity: 25, unit: "kg", reorder_level: 10, cost_per_unit: 220, status: "in_stock", last_restocked: "1 week ago" },

  // Hyderabad Chefs
  { id: "inv-hc-1", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Royal Saffron Strands (Kashmir)", category: "Spices & Dry Goods", quantity: 150, unit: "g", reorder_level: 50, cost_per_unit: 280, status: "in_stock", last_restocked: "1 week ago" },
  { id: "inv-hc-2", restaurant_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890", name: "Tender Goat Mutton Legs", category: "Poultry & Meat", quantity: 38, unit: "kg", reorder_level: 20, cost_per_unit: 720, status: "in_stock", last_restocked: "Today" },
];

const STAFF_STORAGE_KEY = "clouddining_staff_v1";

const DEFAULT_STAFF: RestaurantStaff[] = [
  // Sri Divya Staff
  { id: "stf-sd-1", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Ravi Kumar", role: "Floor Captain", phone: "+91 94411 22334", pin: "1234", shift: "Full Day", status: "active", assigned_floor: "Ground Floor" },
  { id: "stf-sd-2", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Master Chef Subba Rao", role: "Kitchen Chef", phone: "+91 94411 99887", pin: "5566", shift: "Morning", status: "active", assigned_floor: "Ground Floor" },
  { id: "stf-sd-3", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Kalyan Varma", role: "Waiter", phone: "+91 94411 44556", pin: "2024", shift: "Evening", status: "active", assigned_floor: "1st Floor - AC Family Dining" },
  { id: "stf-sd-4", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Suresh Babu", role: "Cashier", phone: "+91 94411 77889", pin: "9900", shift: "Full Day", status: "active", assigned_floor: "Ground Floor" },
  { id: "stf-sd-5", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", name: "Madhu Latha", role: "Waiter", phone: "+91 94411 33445", pin: "1122", shift: "Morning", status: "on_break", assigned_floor: "Rooftop Terrace Lounge" },
];

export function getRestaurantOrders(restaurantId: string): RestaurantOrder[] {
  if (typeof window === "undefined") return DEFAULT_ORDERS.filter((o) => o.restaurant_id === restaurantId);
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: RestaurantOrder[] = raw ? JSON.parse(raw) : DEFAULT_ORDERS;
    return orders.filter((o) => o.restaurant_id === restaurantId);
  } catch {
    return DEFAULT_ORDERS.filter((o) => o.restaurant_id === restaurantId);
  }
}

export function updateOrderStatus(orderId: string, newStatus: RestaurantOrder["status"]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const orders: RestaurantOrder[] = raw ? JSON.parse(raw) : DEFAULT_ORDERS;
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update order status", e);
  }
}

// ----------------------------------------------------
// MULTI-FLOOR TABLE MANAGEMENT
// ----------------------------------------------------
export function getRestaurantFloors(restaurantId: string): string[] {
  const tenants = getStoredTenants();
  const target = tenants.find((t) => t.id === restaurantId);
  if (target?.floors && target.floors.length > 0) {
    return target.floors;
  }
  return ["Ground Floor", "1st Floor - AC Family Dining", "Rooftop Terrace Lounge"];
}

export function getRestaurantTables(restaurantId: string): RestaurantTable[] {
  if (typeof window === "undefined") return DEFAULT_TABLES.filter((t) => t.restaurant_id === restaurantId);
  try {
    const raw = localStorage.getItem(TABLES_STORAGE_KEY);
    const tables: RestaurantTable[] = raw ? JSON.parse(raw) : DEFAULT_TABLES;
    const list = tables.filter((t) => t.restaurant_id === restaurantId);
    if (list.length === 0) {
      const floors = getRestaurantFloors(restaurantId);
      const generated: RestaurantTable[] = [
        { id: `tbl-${restaurantId}-1`, restaurant_id: restaurantId, table_number: 1, capacity: 2, floor: floors[0], section: "Main Hall", status: "available" },
        { id: `tbl-${restaurantId}-2`, restaurant_id: restaurantId, table_number: 2, capacity: 4, floor: floors[0], section: "Main Hall", status: "occupied", guests_count: 3 },
        { id: `tbl-${restaurantId}-3`, restaurant_id: restaurantId, table_number: 3, capacity: 4, floor: floors[0], section: "Window Section", status: "available" },
        { id: `tbl-${restaurantId}-4`, restaurant_id: restaurantId, table_number: 4, capacity: 6, floor: floors[1] || floors[0], section: "Family AC", status: "reserved", guests_count: 4 },
        { id: `tbl-${restaurantId}-5`, restaurant_id: restaurantId, table_number: 5, capacity: 8, floor: floors[1] || floors[0], section: "Family AC", status: "available" },
        { id: `tbl-${restaurantId}-6`, restaurant_id: restaurantId, table_number: 6, capacity: 4, floor: floors[2] || floors[0], section: "Terrace Deck", status: "cleaning" },
      ];
      localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify([...tables, ...generated]));
      return generated;
    }
    return list;
  } catch {
    return DEFAULT_TABLES.filter((t) => t.restaurant_id === restaurantId);
  }
}

export function updateTableStatus(tableId: string, newStatus: RestaurantTable["status"]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(TABLES_STORAGE_KEY);
    const tables: RestaurantTable[] = raw ? JSON.parse(raw) : DEFAULT_TABLES;
    const updated = tables.map((t) => {
      if (t.id === tableId) {
        return {
          ...t,
          status: newStatus,
          guests_count: newStatus === "occupied" ? (t.guests_count || t.capacity) : undefined,
          occupied_since: newStatus === "occupied" ? "Just seated" : undefined,
        };
      }
      return t;
    });
    localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update table status", e);
  }
}

export function addRestaurantTable(
  restaurantId: string,
  tableData: {
    table_number: number;
    capacity: number;
    floor: string;
    section?: string;
  }
): RestaurantTable {
  const newTable: RestaurantTable = {
    id: `tbl-${restaurantId}-${Date.now()}`,
    restaurant_id: restaurantId,
    table_number: Number(tableData.table_number),
    capacity: Number(tableData.capacity),
    floor: tableData.floor,
    section: tableData.section || "Main Area",
    status: "available",
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(TABLES_STORAGE_KEY);
      const tables: RestaurantTable[] = raw ? JSON.parse(raw) : DEFAULT_TABLES;
      const updated = [...tables, newTable];
      localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to add table", e);
    }
  }
  return newTable;
}

export function deleteRestaurantTable(tableId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(TABLES_STORAGE_KEY);
    const tables: RestaurantTable[] = raw ? JSON.parse(raw) : DEFAULT_TABLES;
    const updated = tables.filter((t) => t.id !== tableId);
    localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete table", e);
  }
}

// ----------------------------------------------------
// MENU & DISH MANAGEMENT
// ----------------------------------------------------
export function getRestaurantMenu(restaurantId: string): RestaurantMenuItem[] {
  if (typeof window === "undefined") return DEFAULT_MENU_ITEMS.filter((m) => m.restaurant_id === restaurantId);
  try {
    const raw = localStorage.getItem(MENUS_STORAGE_KEY);
    const items: RestaurantMenuItem[] = raw ? JSON.parse(raw) : DEFAULT_MENU_ITEMS;
    const list = items.filter((m) => m.restaurant_id === restaurantId);
    if (list.length === 0) {
      // Fallback sample items for newly onboarded restaurant
      return DEFAULT_MENU_ITEMS.slice(0, 6).map((item, idx) => ({
        ...item,
        id: `menu-${restaurantId}-${idx + 1}`,
        restaurant_id: restaurantId,
      }));
    }
    return list;
  } catch {
    return DEFAULT_MENU_ITEMS.filter((m) => m.restaurant_id === restaurantId);
  }
}

export function addRestaurantMenuItem(
  restaurantId: string,
  itemData: {
    name: string;
    category: RestaurantMenuItem["category"];
    price: number;
    description: string;
    dietary: "veg" | "non-veg";
    prep_time_minutes?: number;
  }
): RestaurantMenuItem {
  const newItem: RestaurantMenuItem = {
    id: `menu-${Date.now()}`,
    restaurant_id: restaurantId,
    name: itemData.name.trim(),
    category: itemData.category,
    price: Number(itemData.price),
    description: itemData.description.trim(),
    dietary: itemData.dietary,
    prep_time_minutes: Number(itemData.prep_time_minutes) || 15,
    is_available: true,
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(MENUS_STORAGE_KEY);
      const items: RestaurantMenuItem[] = raw ? JSON.parse(raw) : DEFAULT_MENU_ITEMS;
      const updated = [newItem, ...items];
      localStorage.setItem(MENUS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to add menu item", e);
    }
  }
  return newItem;
}

export function deleteRestaurantMenuItem(itemId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(MENUS_STORAGE_KEY);
    const items: RestaurantMenuItem[] = raw ? JSON.parse(raw) : DEFAULT_MENU_ITEMS;
    const updated = items.filter((i) => i.id !== itemId);
    localStorage.setItem(MENUS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete menu item", e);
  }
}

export function toggleMenuItemAvailability(itemId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(MENUS_STORAGE_KEY);
    const items: RestaurantMenuItem[] = raw ? JSON.parse(raw) : DEFAULT_MENU_ITEMS;
    const updated = items.map((m) => (m.id === itemId ? { ...m, is_available: !m.is_available } : m));
    localStorage.setItem(MENUS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to toggle menu item", e);
  }
}

export function updateMenuItemPrice(itemId: string, newPrice: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(MENUS_STORAGE_KEY);
    const items: RestaurantMenuItem[] = raw ? JSON.parse(raw) : DEFAULT_MENU_ITEMS;
    const updated = items.map((m) => (m.id === itemId ? { ...m, price: newPrice } : m));
    localStorage.setItem(MENUS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update price", e);
  }
}

// ----------------------------------------------------
// INVENTORY & STOCK MANAGEMENT
// ----------------------------------------------------
export function getRestaurantInventory(restaurantId: string): RestaurantInventoryItem[] {
  if (typeof window === "undefined") return DEFAULT_INVENTORY.filter((i) => i.restaurant_id === restaurantId);
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    const items: RestaurantInventoryItem[] = raw ? JSON.parse(raw) : DEFAULT_INVENTORY;
    const list = items.filter((i) => i.restaurant_id === restaurantId);
    if (list.length === 0) {
      // Seed default items for this restaurant
      const seeded = DEFAULT_INVENTORY.slice(0, 5).map((item, idx) => ({
        ...item,
        id: `inv-${restaurantId}-${idx + 1}`,
        restaurant_id: restaurantId,
      }));
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify([...items, ...seeded]));
      return seeded;
    }
    return list;
  } catch {
    return DEFAULT_INVENTORY.filter((i) => i.restaurant_id === restaurantId);
  }
}

export function addRestaurantInventoryItem(
  restaurantId: string,
  itemData: {
    name: string;
    category: string;
    quantity: number;
    unit: RestaurantInventoryItem["unit"];
    reorder_level: number;
    cost_per_unit: number;
  }
): RestaurantInventoryItem {
  const status: RestaurantInventoryItem["status"] =
    itemData.quantity <= 0
      ? "out_of_stock"
      : itemData.quantity <= itemData.reorder_level
      ? "low_stock"
      : "in_stock";

  const newItem: RestaurantInventoryItem = {
    id: `inv-${Date.now()}`,
    restaurant_id: restaurantId,
    name: itemData.name.trim(),
    category: itemData.category.trim(),
    quantity: Number(itemData.quantity),
    unit: itemData.unit,
    reorder_level: Number(itemData.reorder_level),
    cost_per_unit: Number(itemData.cost_per_unit),
    status,
    last_restocked: "Just now",
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
      const items: RestaurantInventoryItem[] = raw ? JSON.parse(raw) : DEFAULT_INVENTORY;
      const updated = [newItem, ...items];
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to add inventory item", e);
    }
  }
  return newItem;
}

export function adjustInventoryStock(itemId: string, delta: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    const items: RestaurantInventoryItem[] = raw ? JSON.parse(raw) : DEFAULT_INVENTORY;
    const updated = items.map((item) => {
      if (item.id === itemId) {
        const newQty = Math.max(0, item.quantity + delta);
        const newStatus: RestaurantInventoryItem["status"] =
          newQty <= 0 ? "out_of_stock" : newQty <= item.reorder_level ? "low_stock" : "in_stock";
        return {
          ...item,
          quantity: newQty,
          status: newStatus,
          last_restocked: delta > 0 ? "Just restocked" : item.last_restocked,
        };
      }
      return item;
    });
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to adjust inventory", e);
  }
}

export function deleteInventoryItem(itemId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    const items: RestaurantInventoryItem[] = raw ? JSON.parse(raw) : DEFAULT_INVENTORY;
    const updated = items.filter((i) => i.id !== itemId);
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete inventory item", e);
  }
}

// ----------------------------------------------------
// STAFF & TEAM MANAGEMENT
// ----------------------------------------------------
export function getRestaurantStaff(restaurantId: string): RestaurantStaff[] {
  if (typeof window === "undefined") return DEFAULT_STAFF.filter((s) => s.restaurant_id === restaurantId);
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    const staffList: RestaurantStaff[] = raw ? JSON.parse(raw) : DEFAULT_STAFF;
    const list = staffList.filter((s) => s.restaurant_id === restaurantId);
    if (list.length === 0) {
      const seeded = DEFAULT_STAFF.map((s, idx) => ({
        ...s,
        id: `stf-${restaurantId}-${idx + 1}`,
        restaurant_id: restaurantId,
      }));
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify([...staffList, ...seeded]));
      return seeded;
    }
    return list;
  } catch {
    return DEFAULT_STAFF.filter((s) => s.restaurant_id === restaurantId);
  }
}

export function addRestaurantStaff(
  restaurantId: string,
  staffData: {
    name: string;
    role: RestaurantStaff["role"];
    phone: string;
    email?: string;
    pin?: string;
    shift: RestaurantStaff["shift"];
    assigned_floor?: string;
  }
): RestaurantStaff {
  const newStaff: RestaurantStaff = {
    id: `stf-${Date.now()}`,
    restaurant_id: restaurantId,
    name: staffData.name.trim(),
    role: staffData.role,
    phone: staffData.phone.trim(),
    email: staffData.email?.trim(),
    pin: staffData.pin || Math.floor(1000 + Math.random() * 9000).toString(),
    shift: staffData.shift,
    status: "active",
    assigned_floor: staffData.assigned_floor || "Ground Floor",
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STAFF_STORAGE_KEY);
      const list: RestaurantStaff[] = raw ? JSON.parse(raw) : DEFAULT_STAFF;
      const updated = [newStaff, ...list];
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to add staff member", e);
    }
  }
  return newStaff;
}

export function updateRestaurantStaff(staffId: string, updates: Partial<RestaurantStaff>): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    const list: RestaurantStaff[] = raw ? JSON.parse(raw) : DEFAULT_STAFF;
    const updated = list.map((s) => (s.id === staffId ? { ...s, ...updates } : s));
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update staff", e);
  }
}

export function deleteRestaurantStaff(staffId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    const list: RestaurantStaff[] = raw ? JSON.parse(raw) : DEFAULT_STAFF;
    const updated = list.filter((s) => s.id !== staffId);
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to delete staff", e);
  }
}

// ----------------------------------------------------
// PASSWORD CHANGE & CUSTOM PROFILE / BRANDING
// ----------------------------------------------------
export function changeAdminPassword(
  adminEmail: string,
  currentPass: string,
  newPass: string
): { success: boolean; error?: string } {
  if (!currentPass || !newPass) {
    return { success: false, error: "Current password and new password are required." };
  }
  if (newPass.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  const allAdmins = getStoredAdmins();
  const target = allAdmins.find((a) => a.email.toLowerCase() === adminEmail.toLowerCase().trim());
  if (!target) {
    return { success: false, error: "Admin account not found." };
  }

  // Validate current password (accepts match or demo aliases)
  if (!verifyAdminPassword(target.password, currentPass, target.email)) {
    return { success: false, error: "Incorrect current password. Please try again." };
  }

  const updatedAdmins = allAdmins.map((a) => (a.id === target.id ? { ...a, password: newPass.trim() } : a));
  saveStoredAdmins(updatedAdmins);
  return { success: true };
}

export function updateRestaurantProfile(
  restaurantId: string,
  updates: Partial<TenantRestaurant>
): { success: boolean; tenant?: TenantRestaurant; error?: string } {
  try {
    const tenants = getStoredTenants();
    let updatedTenant: TenantRestaurant | undefined;

    const updatedList = tenants.map((t) => {
      if (t.id === restaurantId) {
        updatedTenant = {
          ...t,
          ...updates,
          name: updates.name ? updates.name.trim() : t.name,
          city: updates.city ? updates.city.trim() : t.city,
          phone: updates.phone ? updates.phone.trim() : t.phone,
          email: updates.email ? updates.email.trim() : t.email,
          address: updates.address ? updates.address.trim() : t.address,
        };
        return updatedTenant;
      }
      return t;
    });

    saveStoredTenants(updatedList);

    // If active session belongs to this restaurant, update restaurantName in session
    const currentSession = getActiveSession();
    if (currentSession && currentSession.restaurantId === restaurantId && updatedTenant) {
      currentSession.restaurantName = updatedTenant.name;
      setActiveSession(currentSession);
    }

    return { success: true, tenant: updatedTenant };
  } catch (e: any) {
    return { success: false, error: e?.message || "Failed to update profile" };
  }
}


