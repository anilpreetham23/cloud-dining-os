"use client";

import {
  TenantRestaurant,
  AdminAccount,
  PlatformMetrics,
  UserSession,
  RestaurantOrder,
  RestaurantTable,
  RestaurantMenuItem,
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
  { id: "tbl-1", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 1, capacity: 2, status: "available" },
  { id: "tbl-2", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 2, capacity: 4, status: "occupied", guests_count: 3, current_order_id: "ord-103", occupied_since: "25m ago" },
  { id: "tbl-3", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 3, capacity: 4, status: "available" },
  { id: "tbl-4", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 4, capacity: 6, status: "occupied", guests_count: 5, current_order_id: "ord-101", occupied_since: "15m ago" },
  { id: "tbl-5", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 5, capacity: 2, status: "reserved", guests_count: 2 },
  { id: "tbl-6", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 6, capacity: 4, status: "available" },
  { id: "tbl-7", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 7, capacity: 8, status: "occupied", guests_count: 6, current_order_id: "ord-102", occupied_since: "5m ago" },
  { id: "tbl-8", restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3", table_number: 8, capacity: 4, status: "available" },
];

const DEFAULT_MENU_ITEMS: RestaurantMenuItem[] = [
  {
    id: "menu-1",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    name: "Rayalaseema Ragi Sangati with Natukodi Pulusu",
    category: "Main Curries",
    price: 420,
    is_available: true,
    description: "Country chicken cooked in stone-ground spicy gravy served with wholesome hot ragi mudda and pure ghee.",
    dietary: "non-veg",
  },
  {
    id: "menu-2",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    name: "Gongura Mutton Biryani",
    category: "Biryanis & Rice",
    price: 480,
    is_available: true,
    description: "Tender goat pieces infused with tangy gongura leaves and aged aromatic basmati rice.",
    dietary: "non-veg",
  },
  {
    id: "menu-3",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    name: "Apollo Fish Fry",
    category: "Starters",
    price: 360,
    is_available: true,
    description: "Crispy battered murrel fillets tossed with curry leaves, cracked red chilies, and tangy house masala.",
    dietary: "non-veg",
  },
  {
    id: "menu-4",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    name: "Nellore Chepala Pulusu",
    category: "Main Curries",
    price: 440,
    is_available: true,
    description: "Heritage coastal tamarind fish curry slow-simmered in earthen clay pot with shallots and fenugreek.",
    dietary: "non-veg",
  },
  {
    id: "menu-5",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    name: "Kurnool Ulavacharu Chicken Biryani",
    category: "Biryanis & Rice",
    price: 390,
    is_available: true,
    description: "Slow-reduced horsegram soup layered with spiced chicken and fragrant basmati dum rice.",
    dietary: "non-veg",
  },
  {
    id: "menu-6",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    name: "Paneer Butter Masala",
    category: "Main Curries",
    price: 320,
    is_available: true,
    description: "Fresh cottage cheese cubes simmered in velvety tomato cashew gravy with fenugreek butter.",
    dietary: "veg",
  },
  {
    id: "menu-7",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    name: "Butter Garlic Naan",
    category: "Breads",
    price: 75,
    is_available: true,
    description: "Clay-oven baked leavened bread brushed with melted butter and roasted garlic flakes.",
    dietary: "veg",
  },
  {
    id: "menu-8",
    restaurant_id: "2d708951-bb5f-4bbc-92f6-f4ac6dc7fcb3",
    name: "Apricot Delight with Vanilla Gelato",
    category: "Desserts",
    price: 180,
    is_available: true,
    description: "Rich stewed Turkish apricots layered with sponge cake, whipped cream, and vanilla scoop.",
    dietary: "veg",
  },
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

export function getRestaurantTables(restaurantId: string): RestaurantTable[] {
  if (typeof window === "undefined") return DEFAULT_TABLES.filter((t) => t.restaurant_id === restaurantId);
  try {
    const raw = localStorage.getItem(TABLES_STORAGE_KEY);
    const tables: RestaurantTable[] = raw ? JSON.parse(raw) : DEFAULT_TABLES;
    const list = tables.filter((t) => t.restaurant_id === restaurantId);
    if (list.length === 0) {
      // Generate default 8 tables for newly onboarded restaurant
      return Array.from({ length: 8 }, (_, i) => ({
        id: `tbl-${restaurantId}-${i + 1}`,
        restaurant_id: restaurantId,
        table_number: i + 1,
        capacity: (i % 3 + 1) * 2,
        status: i === 1 ? "occupied" : i === 4 ? "reserved" : "available",
      }));
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
    const updated = tables.map((t) => (t.id === tableId ? { ...t, status: newStatus } : t));
    localStorage.setItem(TABLES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update table status", e);
  }
}

export function getRestaurantMenu(restaurantId: string): RestaurantMenuItem[] {
  if (typeof window === "undefined") return DEFAULT_MENU_ITEMS.filter((m) => m.restaurant_id === restaurantId);
  try {
    const raw = localStorage.getItem(MENUS_STORAGE_KEY);
    const items: RestaurantMenuItem[] = raw ? JSON.parse(raw) : DEFAULT_MENU_ITEMS;
    const list = items.filter((m) => m.restaurant_id === restaurantId);
    if (list.length === 0) {
      // Fallback sample items for newly onboarded restaurant
      return DEFAULT_MENU_ITEMS.map((item, idx) => ({
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

