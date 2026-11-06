"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  ChefHat,
  Receipt,
  LayoutGrid,
  UtensilsCrossed,
  Users,
  TrendingUp,
  LogOut,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  ShieldAlert,
  ArrowLeft,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Flame,
  Check,
  Search,
  Plus,
  Trash2,
  Settings,
  Eye,
  EyeOff,
  Boxes,
  PackageCheck,
  AlertTriangle,
  Layers,
  Palette,
  Shield,
  X,
  UserPlus,
  MapPin,
  Mail,
  Percent,
  Sliders,
  SlidersHorizontal,
  UserCheck,
  Lock,
  KeyRound,
} from "lucide-react";
import {
  getActiveSession,
  clearActiveSession,
  getStoredTenants,
  getStoredAdmins,
  getRestaurantOrders,
  updateOrderStatus,
  getRestaurantFloors,
  getRestaurantTables,
  updateTableStatus,
  addRestaurantTable,
  deleteRestaurantTable,
  getRestaurantMenu,
  addRestaurantMenuItem,
  deleteRestaurantMenuItem,
  toggleMenuItemAvailability,
  updateMenuItemPrice,
  getRestaurantInventory,
  addRestaurantInventoryItem,
  adjustInventoryStock,
  deleteInventoryItem,
  getRestaurantStaff,
  addRestaurantStaff,
  updateRestaurantStaff,
  deleteRestaurantStaff,
  changeAdminPassword,
  updateRestaurantProfile,
} from "@/lib/tenantStore";
import {
  UserSession,
  TenantRestaurant,
  AdminAccount,
  RestaurantOrder,
  RestaurantTable,
  RestaurantMenuItem,
  RestaurantInventoryItem,
  RestaurantStaff,
} from "@/lib/types";

// ====================================================
// RGB & THEME UTILITIES
// ====================================================
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = (hex || "#D4AF37").replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 212, g: 175, b: 55 }; // Default Imperial Gold
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v || 0)));
  const toHex = (c: number) => clamp(c).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getContrastTextColor(r: number, g: number, b: number): string {
  // WCAG relative luminance formula
  const y = (299 * r + 587 * g + 114 * b) / 1000;
  return y > 155 ? "#060b13" : "#ffffff";
}

function getPasswordStrength(pass: string): { label: string; color: string; score: number } {
  if (!pass) return { label: "", color: "bg-slate-700", score: 0 };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { label: "Weak (min 6 chars)", color: "bg-rose-500", score: 1 };
  if (score <= 3) return { label: "Medium", color: "bg-amber-400", score: 2 };
  return { label: "Strong", color: "bg-emerald-400", score: 3 };
}

// Curated luxury preset themes
const LUXURY_THEMES = [
  { name: "Imperial Gold", hex: "#D4AF37", r: 212, g: 175, b: 55 },
  { name: "Emerald Jade", hex: "#10B981", r: 16, g: 185, b: 129 },
  { name: "Cyber Amber", hex: "#F59E0B", r: 245, g: 158, b: 11 },
  { name: "Royal Sapphire", hex: "#3B82F6", r: 59, g: 130, b: 246 },
  { name: "Ruby Crimson", hex: "#EF4444", r: 239, g: 68, b: 68 },
  { name: "Amethyst Violet", hex: "#8B5CF6", r: 139, g: 92, b: 246 },
  { name: "Electric Teal", hex: "#06B6D4", r: 6, g: 182, b: 212 },
  { name: "Rose Quartz", hex: "#F43F5E", r: 244, g: 63, b: 94 },
  { name: "Neon Lime", hex: "#84CC16", r: 132, g: 204, b: 22 },
  { name: "Deep Indigo", hex: "#6366F1", r: 99, g: 102, b: 241 },
];

export default function RestaurantAdminPortal() {
  const router = useRouter();

  // Session & Tenant state
  const [session, setSession] = useState<UserSession | null>(null);
  const [tenant, setTenant] = useState<TenantRestaurant | null>(null);
  const [adminsList, setAdminsList] = useState<AdminAccount[]>([]);

  // Navigation tab: orders | kds | tables | menu | staff | sales | settings
  const [activeTab, setActiveTab] = useState<
    "orders" | "kds" | "tables" | "menu" | "staff" | "sales" | "settings"
  >("orders");

  // Operational states
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [floors, setFloors] = useState<string[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [menuItems, setMenuItems] = useState<RestaurantMenuItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<RestaurantInventoryItem[]>([]);
  const [staffList, setStaffList] = useState<RestaurantStaff[]>([]);

  // Filter states
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [menuSubTab, setMenuSubTab] = useState<"dishes" | "inventory">("dishes");
  const [menuSearch, setMenuSearch] = useState<string>("");
  const [menuCatFilter, setMenuCatFilter] = useState<string>("all");
  const [inventorySearch, setInventorySearch] = useState<string>("");
  const [inventoryCatFilter, setInventoryCatFilter] = useState<string>("all");
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>("all");

  // Dynamic RGB Theme state
  const [themeColor, setThemeColor] = useState<string>("#D4AF37");
  const [themeRgb, setThemeRgb] = useState<{ r: number; g: number; b: number }>({ r: 212, g: 175, b: 55 });
  const [themeSuccess, setThemeSuccess] = useState<string>("");

  // Edit price modal state
  const [editingPriceItem, setEditingPriceItem] = useState<{ id: string; name: string; price: number } | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(0);

  // Modals
  const [isAddTableOpen, setIsAddTableOpen] = useState<boolean>(false);
  const [newTable, setNewTable] = useState<{ table_number: number; capacity: number; floor: string; section: string }>({
    table_number: 1,
    capacity: 4,
    floor: "",
    section: "Main Dining",
  });

  const [isAddDishOpen, setIsAddDishOpen] = useState<boolean>(false);
  const [newDish, setNewDish] = useState<{
    name: string;
    category: RestaurantMenuItem["category"];
    price: number;
    description: string;
    dietary: "veg" | "non-veg";
    prep_time_minutes: number;
  }>({
    name: "",
    category: "Main Curries",
    price: 350,
    description: "",
    dietary: "veg",
    prep_time_minutes: 15,
  });

  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState<boolean>(false);
  const [newInventory, setNewInventory] = useState<{
    name: string;
    category: string;
    quantity: number;
    unit: RestaurantInventoryItem["unit"];
    reorder_level: number;
    cost_per_unit: number;
  }>({
    name: "",
    category: "Grains & Spices",
    quantity: 20,
    unit: "kg",
    reorder_level: 5,
    cost_per_unit: 120,
  });

  const [isAddStaffOpen, setIsAddStaffOpen] = useState<boolean>(false);
  const [newStaff, setNewStaff] = useState<{
    name: string;
    role: RestaurantStaff["role"];
    phone: string;
    email: string;
    shift: RestaurantStaff["shift"];
    assigned_floor: string;
  }>({
    name: "",
    role: "Waiter",
    phone: "",
    email: "",
    shift: "Morning",
    assigned_floor: "Ground Floor",
  });

  // Settings & Profile Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [profileName, setProfileName] = useState("");
  const [profileTagline, setProfileTagline] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCity, setProfileCity] = useState("");
  const [profileGstin, setProfileGstin] = useState("");
  const [profileServiceCharge, setProfileServiceCharge] = useState(5);
  const [profileGst, setProfileGst] = useState(5);
  const [profileSuccess, setProfileSuccess] = useState("");

  // Load session & restaurant data
  useEffect(() => {
    const active = getActiveSession();
    if (!active) {
      router.replace("/login");
      return;
    }
    setSession(active);

    const tenants = getStoredTenants();
    const restId = active.restaurantId || tenants[1]?.id || tenants[0]?.id;
    const foundTenant = tenants.find((t) => t.id === restId) || tenants[1];
    setTenant(foundTenant);

    if (foundTenant) {
      const allAdmins = getStoredAdmins();
      setAdminsList(allAdmins.filter((a) => a.restaurant_id === foundTenant.id));
      loadRestaurantData(foundTenant.id);

      // Initialize theme color
      const initialColor = foundTenant.brand_color || "#D4AF37";
      setThemeColor(initialColor);
      setThemeRgb(hexToRgb(initialColor));

      // Initialize profile fields
      setProfileName(foundTenant.name || "");
      setProfileTagline(foundTenant.tagline || "");
      setProfilePhone(foundTenant.phone || "");
      setProfileEmail(foundTenant.email || foundTenant.primary_admin?.email || "");
      setProfileAddress(foundTenant.address || "");
      setProfileCity(foundTenant.city || "");
      setProfileGstin(foundTenant.gstin || "");
      setProfileServiceCharge(foundTenant.service_charge_pct || 5);
      setProfileGst(foundTenant.gst_pct || 5);
    }
  }, [router]);

  const loadRestaurantData = (restId: string) => {
    setOrders(getRestaurantOrders(restId));
    setTables(getRestaurantTables(restId));
    const flrs = getRestaurantFloors(restId);
    setFloors(flrs);
    if (!newTable.floor && flrs.length > 0) {
      setNewTable((prev) => ({ ...prev, floor: flrs[0] }));
    }
    if (!newStaff.assigned_floor && flrs.length > 0) {
      setNewStaff((prev) => ({ ...prev, assigned_floor: flrs[0] }));
    }
    setMenuItems(getRestaurantMenu(restId));
    setInventoryItems(getRestaurantInventory(restId));
    setStaffList(getRestaurantStaff(restId));
  };

  // ====================================================
  // RGB THEME HANDLERS
  // ====================================================
  const handleRgbSlider = (channel: "r" | "g" | "b", value: number) => {
    const nextRgb = { ...themeRgb, [channel]: Math.max(0, Math.min(255, Number(value))) };
    setThemeRgb(nextRgb);
    const nextHex = rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
    setThemeColor(nextHex);
  };

  const handleHexInput = (hexVal: string) => {
    setThemeColor(hexVal);
    if (/^#[0-9A-Fa-f]{6}$/.test(hexVal)) {
      setThemeRgb(hexToRgb(hexVal));
    }
  };

  const handleSelectPresetTheme = (theme: typeof LUXURY_THEMES[0]) => {
    setThemeColor(theme.hex);
    setThemeRgb({ r: theme.r, g: theme.g, b: theme.b });
  };

  const handleSaveTheme = () => {
    if (!tenant) return;
    const result = updateRestaurantProfile(tenant.id, {
      brand_color: themeColor,
    });
    if (result.success && result.tenant) {
      setTenant(result.tenant);
      setThemeSuccess(`RGB Theme (${themeColor}) applied and saved permanently!`);
      setTimeout(() => setThemeSuccess(""), 4500);
    }
  };

  // Orders handlers
  const handleStatusChange = (orderId: string, newStatus: RestaurantOrder["status"]) => {
    updateOrderStatus(orderId, newStatus);
    if (tenant) {
      setOrders(getRestaurantOrders(tenant.id));
    }
  };

  // Table handlers
  const handleTableStatus = (tableId: string, newStatus: RestaurantTable["status"]) => {
    updateTableStatus(tableId, newStatus);
    if (tenant) {
      setTables(getRestaurantTables(tenant.id));
    }
  };

  const handleCreateTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    addRestaurantTable(tenant.id, {
      table_number: Number(newTable.table_number),
      capacity: Number(newTable.capacity),
      floor: newTable.floor || floors[0] || "Ground Floor",
      section: newTable.section || "Main Dining",
    });
    setTables(getRestaurantTables(tenant.id));
    setIsAddTableOpen(false);
    setNewTable((prev) => ({ ...prev, table_number: prev.table_number + 1 }));
  };

  const handleDeleteTable = (tableId: string, tableNumber: number) => {
    if (confirm(`Are you sure you want to remove Table ${tableNumber}?`)) {
      deleteRestaurantTable(tableId);
      if (tenant) setTables(getRestaurantTables(tenant.id));
    }
  };

  // Menu handlers
  const handleToggleStock = (itemId: string) => {
    toggleMenuItemAvailability(itemId);
    if (tenant) {
      setMenuItems(getRestaurantMenu(tenant.id));
    }
  };

  const handleSavePrice = () => {
    if (editingPriceItem && tenant) {
      updateMenuItemPrice(editingPriceItem.id, Number(newPriceValue));
      setMenuItems(getRestaurantMenu(tenant.id));
      setEditingPriceItem(null);
    }
  };

  const handleCreateDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !newDish.name.trim()) return;
    addRestaurantMenuItem(tenant.id, {
      name: newDish.name,
      category: newDish.category,
      price: Number(newDish.price),
      description: newDish.description,
      dietary: newDish.dietary,
      prep_time_minutes: Number(newDish.prep_time_minutes),
    });
    setMenuItems(getRestaurantMenu(tenant.id));
    setIsAddDishOpen(false);
    setNewDish({
      name: "",
      category: "Main Curries",
      price: 350,
      description: "",
      dietary: "veg",
      prep_time_minutes: 15,
    });
  };

  const handleDeleteDish = (itemId: string, dishName: string) => {
    if (confirm(`Remove "${dishName}" from the menu?`)) {
      deleteRestaurantMenuItem(itemId);
      if (tenant) setMenuItems(getRestaurantMenu(tenant.id));
    }
  };

  // Inventory handlers
  const handleCreateInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !newInventory.name.trim()) return;
    addRestaurantInventoryItem(tenant.id, {
      name: newInventory.name,
      category: newInventory.category,
      quantity: Number(newInventory.quantity),
      unit: newInventory.unit,
      reorder_level: Number(newInventory.reorder_level),
      cost_per_unit: Number(newInventory.cost_per_unit),
    });
    setInventoryItems(getRestaurantInventory(tenant.id));
    setIsAddInventoryOpen(false);
    setNewInventory({
      name: "",
      category: "Grains & Spices",
      quantity: 20,
      unit: "kg",
      reorder_level: 5,
      cost_per_unit: 120,
    });
  };

  const handleAdjustStock = (itemId: string, delta: number) => {
    adjustInventoryStock(itemId, delta);
    if (tenant) {
      setInventoryItems(getRestaurantInventory(tenant.id));
    }
  };

  const handleDeleteInventory = (itemId: string, itemName: string) => {
    if (confirm(`Delete raw material "${itemName}" from inventory tracker?`)) {
      deleteInventoryItem(itemId);
      if (tenant) setInventoryItems(getRestaurantInventory(tenant.id));
    }
  };

  // Staff handlers
  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant || !newStaff.name.trim() || !newStaff.phone.trim()) return;
    addRestaurantStaff(tenant.id, {
      name: newStaff.name,
      role: newStaff.role,
      phone: newStaff.phone,
      email: newStaff.email,
      shift: newStaff.shift,
      assigned_floor: newStaff.assigned_floor,
    });
    setStaffList(getRestaurantStaff(tenant.id));
    setIsAddStaffOpen(false);
    setNewStaff({
      name: "",
      role: "Waiter",
      phone: "",
      email: "",
      shift: "Morning",
      assigned_floor: floors[0] || "Ground Floor",
    });
  };

  const handleToggleStaffStatus = (staffId: string, currentStatus: RestaurantStaff["status"]) => {
    const nextStatus: RestaurantStaff["status"] =
      currentStatus === "active" ? "on_break" : currentStatus === "on_break" ? "inactive" : "active";
    updateRestaurantStaff(staffId, { status: nextStatus });
    if (tenant) setStaffList(getRestaurantStaff(tenant.id));
  };

  const handleDeleteStaff = (staffId: string, staffName: string) => {
    if (confirm(`Remove staff member ${staffName}?`)) {
      deleteRestaurantStaff(staffId);
      if (tenant) setStaffList(getRestaurantStaff(tenant.id));
    }
  };

  // Settings & Profile handlers
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    const emailToUse = session?.email || tenant?.email || tenant?.primary_admin?.email || "";
    const result = changeAdminPassword(emailToUse, currentPassword, newPassword, tenant?.id);
    if (!result.success) {
      setPasswordError(result.error || "Failed to update password.");
    } else {
      setPasswordSuccess("Password successfully updated! You can now sign in with this new password.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setProfileSuccess("");

    const result = updateRestaurantProfile(tenant.id, {
      name: profileName.trim(),
      tagline: profileTagline.trim(),
      phone: profilePhone.trim(),
      address: profileAddress.trim(),
      city: profileCity.trim(),
      gstin: profileGstin.trim(),
      service_charge_pct: Number(profileServiceCharge),
      gst_pct: Number(profileGst),
      brand_color: themeColor,
    });

    if (result.success && result.tenant) {
      setTenant(result.tenant);
      setProfileSuccess("Restaurant business details saved successfully!");
      setTimeout(() => setProfileSuccess(""), 4000);
    }
  };

  const handleLogout = () => {
    clearActiveSession();
    router.replace("/login");
  };

  const handleExitPreview = () => {
    if (session?.isSuperAdminPreview) {
      const superSession: UserSession = {
        role: "SUPER_ADMIN",
        name: "Bobby (Platform Head)",
        email: "bobby@clouddining.com",
        loginTime: new Date().toISOString(),
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("clouddining_active_session", JSON.stringify(superSession));
      }
      router.push("/dashboard");
    }
  };

  if (!tenant || !session) {
    return (
      <div className="min-h-screen bg-[#060b13] flex items-center justify-center text-slate-400 font-mono text-sm">
        <RefreshCw className="w-5 h-5 animate-spin text-amber-400 mr-3" />
        Loading Restaurant Console...
      </div>
    );
  }

  // Dynamic contrast text for active theme
  const contrastText = getContrastTextColor(themeRgb.r, themeRgb.g, themeRgb.b);
  const passwordStrength = getPasswordStrength(newPassword);

  // Filtered lists
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "all") return true;
    return o.status === orderFilter;
  });

  const filteredTables = tables.filter((t) => {
    if (selectedFloor === "all") return true;
    return t.floor === selectedFloor;
  });

  const filteredMenu = menuItems.filter((item) => {
    const matchesCat = menuCatFilter === "all" || item.category === menuCatFilter;
    const matchesQuery = item.name.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredInventory = inventoryItems.filter((item) => {
    const matchesCat = inventoryCatFilter === "all" || item.category === inventoryCatFilter;
    const matchesQuery = item.name.toLowerCase().includes(inventorySearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredStaff = staffList.filter((s) => {
    if (staffRoleFilter === "all") return true;
    return s.role === staffRoleFilter || s.shift === staffRoleFilter;
  });

  // Today's summary stats
  const totalRevenueToday = orders.reduce((acc, o) => acc + o.total, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== "paid").length;
  const occupiedTablesCount = tables.filter((t) => t.status === "occupied").length;

  return (
    <div
      className="min-h-screen bg-[#070c16] text-slate-100 flex flex-col font-sans transition-colors duration-300"
      style={
        {
          "--theme-primary": themeColor,
          "--theme-rgb": `${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}`,
        } as React.CSSProperties
      }
    >
      {/* Super Admin Preview Alert Banner */}
      {session.isSuperAdminPreview && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              SUPER ADMIN COCKPIT VIEW: Bobby (Platform Head) is previewing{" "}
              <strong className="underline">{tenant.name}</strong>.
            </span>
          </div>
          <button
            onClick={handleExitPreview}
            className="bg-slate-950 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-slate-900 transition flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to Super Admin Cockpit
          </button>
        </div>
      )}

      {/* Top Main Navigation Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Restaurant Profile with Dynamic RGB Emblem */}
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg ring-1 transition-all duration-300"
              style={{
                backgroundColor: themeColor,
                color: contrastText,
                borderColor: themeColor,
                boxShadow: `0 0 20px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.35)`,
              }}
            >
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-white font-serif tracking-tight">{tenant.name}</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Outlet
                </span>
                {tenant.tagline && (
                  <span className="hidden lg:inline text-xs text-slate-400 italic">
                    — {tenant.tagline}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{tenant.city}</span>
                <span>•</span>
                <span style={{ color: themeColor }} className="font-medium">
                  Logged in as {session.name}
                </span>
                {tenant.gstin && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-400">GSTIN: {tenant.gstin}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Today&apos;s Revenue:</span>
              <span className="font-bold font-mono" style={{ color: themeColor }}>
                ₹{totalRevenueToday.toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={() => tenant && loadRestaurantData(tenant.id)}
              title="Refresh Data"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs with Dynamic Theme Highlights */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "orders", label: "Live Orders & Billing", icon: Receipt, badge: activeOrdersCount },
            { id: "kds", label: "Kitchen Display (KDS)", icon: ChefHat, badge: orders.filter((o) => o.status === "preparing").length },
            { id: "tables", label: "Floor & Table Grid", icon: LayoutGrid, badge: `${occupiedTablesCount}/${tables.length}` },
            { id: "menu", label: "Menu & Stock Inventory", icon: UtensilsCrossed, badge: `${menuItems.length} dishes` },
            { id: "staff", label: "Admin & Staff Seats", icon: Users, badge: staffList.length + adminsList.length },
            { id: "sales", label: "Today's Register", icon: TrendingUp },
            { id: "settings", label: "Account & Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={
                  isActive
                    ? {
                        backgroundColor: themeColor,
                        color: contrastText,
                        boxShadow: `0 4px 14px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.28)`,
                      }
                    : {}
                }
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition cursor-pointer ${
                  isActive
                    ? "font-bold shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-slate-950/20 text-current"
                        : "bg-slate-800 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {/* ========================================================== */}
        {/* TAB 1: LIVE ORDERS & BILLING                               */}
        {/* ========================================================== */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white">Live Dining Orders</h2>
                <p className="text-xs text-slate-400">
                  Manage tickets, table service status, and bill settlement in real time.
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                {["all", "new", "preparing", "ready", "served", "paid"].map((st) => {
                  const isSel = orderFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      style={isSel ? { backgroundColor: themeColor, color: contrastText } : {}}
                      className={`px-3 py-1.5 rounded-lg capitalize font-medium transition cursor-pointer ${
                        isSel ? "font-bold shadow-sm" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOrders.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                  <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm font-medium">No active orders matching &quot;{orderFilter}&quot;</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const statusColors: Record<string, string> = {
                    new: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                    preparing: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                    ready: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                    served: "bg-purple-500/10 text-purple-400 border-purple-500/30",
                    paid: "bg-slate-800 text-slate-400 border-slate-700",
                  };

                  return (
                    <div
                      key={order.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
                    >
                      <div>
                        {/* Order Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                          <div>
                            <span
                              className="font-mono text-xs font-bold"
                              style={{ color: themeColor }}
                            >
                              #{order.order_number}
                            </span>
                            <div className="text-sm font-bold text-white mt-0.5">
                              Table {order.table_number} • {order.customer_name}
                            </div>
                            {order.floor && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {order.floor}
                              </div>
                            )}
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              statusColors[order.status]
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 mb-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-slate-300">
                                <strong style={{ color: themeColor }} className="mr-1.5">
                                  {item.quantity}x
                                </strong>
                                {item.name}
                              </span>
                              <span className="font-mono text-slate-400">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer & Actions */}
                      <div className="pt-3 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {order.created_at}
                          </span>
                          <span
                            className="font-serif font-bold text-base"
                            style={{ color: themeColor }}
                          >
                            ₹{order.total.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* State transitions */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {order.status === "new" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "preparing")}
                              style={{
                                backgroundColor: themeColor,
                                color: contrastText,
                                boxShadow: `0 4px 12px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.2)`,
                              }}
                              className="col-span-2 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90"
                            >
                              <ChefHat className="w-4 h-4" />
                              Send to Kitchen
                            </button>
                          )}
                          {order.status === "preparing" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "ready")}
                              className="col-span-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                            >
                              <Check className="w-4 h-4" />
                              Mark Ready to Serve
                            </button>
                          )}
                          {order.status === "ready" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "served")}
                              className="col-span-2 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              Delivered to Table
                            </button>
                          )}
                          {order.status === "served" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "paid")}
                              style={{
                                backgroundColor: themeColor,
                                color: contrastText,
                                boxShadow: `0 4px 12px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.2)`,
                              }}
                              className="col-span-2 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90"
                            >
                              <Receipt className="w-4 h-4" />
                              Settle & Print Bill
                            </button>
                          )}
                          {order.status === "paid" && (
                            <div className="col-span-2 py-2 rounded-xl bg-slate-800/80 text-emerald-400 text-center font-mono text-xs flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Settled & Archived
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 2: KITCHEN DISPLAY SYSTEM (KDS)                       */}
        {/* ========================================================== */}
        {activeTab === "kds" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
                  Live Kitchen Display Screen (KDS)
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time ticket dispatch for chefs and line cooks at {tenant.name}.
                </p>
              </div>
              <div
                className="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-bold"
                style={{ color: themeColor }}
              >
                Active Fire Tickets: {orders.filter((o) => o.status === "preparing").length}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {orders
                .filter((o) => o.status === "new" || o.status === "preparing")
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-5 shadow-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            Ticket #{order.order_number}
                          </span>
                          <h3 className="text-lg font-black text-white">Table {order.table_number}</h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Flame className="w-3 h-3 animate-bounce" />
                          On Fire
                        </span>
                      </div>

                      <div className="py-4 space-y-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80"
                          >
                            <span className="text-sm font-bold text-white flex items-center gap-2">
                              <span
                                className="w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold"
                                style={{
                                  backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.2)`,
                                  color: themeColor,
                                }}
                              >
                                {item.quantity}
                              </span>
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 mt-2">
                      <button
                        onClick={() => handleStatusChange(order.id, "ready")}
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                      >
                        <Check className="w-5 h-5" />
                        Plate & Ding Order Ready
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 3: FLOOR & TABLE GRID (MULTI-FLOOR + STATUSES + ADD)    */}
        {/* ========================================================== */}
        {activeTab === "tables" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white">Dining Floor & Table Grid</h2>
                <p className="text-xs text-slate-400">
                  Multi-floor occupancy, seating capacity, table status transitions, and table layout.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAddTableOpen(true)}
                  style={{
                    backgroundColor: themeColor,
                    color: contrastText,
                    boxShadow: `0 4px 14px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.25)`,
                  }}
                  className="px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Table</span>
                </button>
              </div>
            </div>

            {/* Floor Tabs Selector */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mr-2 shrink-0">
                <Layers className="w-3.5 h-3.5" /> Floor:
              </span>
              <button
                onClick={() => setSelectedFloor("all")}
                style={
                  selectedFloor === "all"
                    ? { backgroundColor: themeColor, color: contrastText }
                    : {}
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                  selectedFloor === "all"
                    ? "font-bold shadow-md"
                    : "text-slate-400 hover:text-white bg-slate-900/60"
                }`}
              >
                All Floors ({tables.length})
              </button>
              {floors.map((flr) => {
                const count = tables.filter((t) => t.floor === flr).length;
                const isSelected = selectedFloor === flr;
                return (
                  <button
                    key={flr}
                    onClick={() => setSelectedFloor(flr)}
                    style={
                      isSelected
                        ? { backgroundColor: themeColor, color: contrastText }
                        : {}
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer ${
                      isSelected
                        ? "font-bold shadow-md"
                        : "text-slate-400 hover:text-white bg-slate-900/60"
                    }`}
                  >
                    {flr} ({count})
                  </button>
                );
              })}
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                Available ({tables.filter((t) => t.status === "available").length})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                Occupied ({tables.filter((t) => t.status === "occupied").length})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                Reserved ({tables.filter((t) => t.status === "reserved").length})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
                Cleaning / Reset ({tables.filter((t) => t.status === "cleaning").length})
              </span>
            </div>

            {/* Table Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTables.map((tbl) => {
                const borderMap: Record<string, string> = {
                  available: "border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-500",
                  occupied: "border-rose-500/50 bg-rose-950/20 hover:border-rose-500",
                  reserved: "border-amber-500/40 bg-amber-950/10 hover:border-amber-500",
                  cleaning: "border-cyan-500/40 bg-cyan-950/10 hover:border-cyan-400",
                };
                const badgeMap: Record<string, string> = {
                  available: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                  occupied: "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold",
                  reserved: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                  cleaning: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
                };

                return (
                  <div
                    key={tbl.id}
                    className={`rounded-2xl border p-4 shadow-xl flex flex-col justify-between transition relative group ${
                      borderMap[tbl.status]
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xl font-black text-white">
                          Table {tbl.table_number}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase ${badgeMap[tbl.status]}`}>
                            {tbl.status}
                          </span>
                          <button
                            onClick={() => handleDeleteTable(tbl.id, tbl.table_number)}
                            title="Delete Table"
                            className="p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-400 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span>Capacity: <strong className="text-slate-200">{tbl.capacity} Pax</strong></span>
                          <span
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.15)`,
                              color: themeColor,
                            }}
                          >
                            {tbl.floor}
                          </span>
                        </div>
                        {tbl.section && (
                          <div className="text-[11px] text-slate-400">
                            Section: <span className="text-slate-300">{tbl.section}</span>
                          </div>
                        )}
                        {tbl.guests_count && (
                          <div className="text-[11px] text-rose-300 font-semibold">
                            • {tbl.guests_count} Guests seated
                          </div>
                        )}
                        {tbl.occupied_since && (
                          <div className="text-[10px] text-amber-400/80 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {tbl.occupied_since}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Table Status Switchers */}
                    <div className="pt-3 mt-3 border-t border-slate-800/60">
                      <div className="text-[10px] text-slate-400 uppercase font-mono mb-1.5">Change Status:</div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <button
                          onClick={() => handleTableStatus(tbl.id, "available")}
                          className={`py-1 rounded-lg border font-semibold transition cursor-pointer ${
                            tbl.status === "available"
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                              : "bg-emerald-950/30 text-emerald-300 border-emerald-500/20 hover:bg-emerald-900/40"
                          }`}
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handleTableStatus(tbl.id, "occupied")}
                          className={`py-1 rounded-lg border font-semibold transition cursor-pointer ${
                            tbl.status === "occupied"
                              ? "bg-rose-500 text-white border-rose-400 font-bold"
                              : "bg-rose-950/30 text-rose-300 border-rose-500/20 hover:bg-rose-900/40"
                          }`}
                        >
                          Occupied
                        </button>
                        <button
                          onClick={() => handleTableStatus(tbl.id, "reserved")}
                          className={`py-1 rounded-lg border font-semibold transition cursor-pointer ${
                            tbl.status === "reserved"
                              ? "bg-amber-400 text-slate-950 border-amber-300 font-bold"
                              : "bg-amber-950/30 text-amber-300 border-amber-500/20 hover:bg-amber-900/40"
                          }`}
                        >
                          Reserved
                        </button>
                        <button
                          onClick={() => handleTableStatus(tbl.id, "cleaning")}
                          className={`py-1 rounded-lg border font-semibold transition cursor-pointer ${
                            tbl.status === "cleaning"
                              ? "bg-cyan-400 text-slate-950 border-cyan-300 font-bold"
                              : "bg-cyan-950/30 text-cyan-300 border-cyan-500/20 hover:bg-cyan-900/40"
                          }`}
                        >
                          Cleaning
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal: Add Table */}
            {isAddTableOpen && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5" style={{ color: themeColor }} />
                      Add Dining Table
                    </h3>
                    <button
                      onClick={() => setIsAddTableOpen(false)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateTable} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Table Number</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={newTable.table_number}
                          onChange={(e) => setNewTable({ ...newTable, table_number: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Seating Capacity (Pax)</label>
                        <select
                          value={newTable.capacity}
                          onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        >
                          <option value={2}>2 Pax (Couples)</option>
                          <option value={4}>4 Pax (Standard)</option>
                          <option value={6}>6 Pax (Family)</option>
                          <option value={8}>8 Pax (Large Group)</option>
                          <option value={12}>12 Pax (Party/Banquet)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Floor Placement</label>
                      <select
                        value={newTable.floor}
                        onChange={(e) => setNewTable({ ...newTable, floor: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      >
                        {floors.map((flr) => (
                          <option key={flr} value={flr}>{flr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Section / Ambience Zone</label>
                      <input
                        type="text"
                        placeholder="e.g. Window Deck, AC Family Hall, Patio"
                        value={newTable.section}
                        onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddTableOpen(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: themeColor,
                          color: contrastText,
                          boxShadow: `0 4px 14px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.25)`,
                        }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer hover:opacity-90"
                      >
                        Save & Deploy Table
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: MENU & RAW STOCK INVENTORY MANAGEMENT               */}
        {/* ========================================================== */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white">Menu & Live Inventory Controls</h2>
                <p className="text-xs text-slate-400">
                  Manage dishes, real-time pricing, dietary tags, and raw material stock levels.
                </p>
              </div>

              {/* Sub-tabs: Dishes vs Raw Stock */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setMenuSubTab("dishes")}
                  style={
                    menuSubTab === "dishes"
                      ? { backgroundColor: themeColor, color: contrastText }
                      : {}
                  }
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    menuSubTab === "dishes"
                      ? "shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  Dishes & Menu ({menuItems.length})
                </button>
                <button
                  onClick={() => setMenuSubTab("inventory")}
                  style={
                    menuSubTab === "inventory"
                      ? { backgroundColor: themeColor, color: contrastText }
                      : {}
                  }
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    menuSubTab === "inventory"
                      ? "shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  Raw Stock & Inventory ({inventoryItems.length})
                </button>
              </div>
            </div>

            {/* =================== SUBVIEW 1: DISHES =================== */}
            {menuSubTab === "dishes" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  {/* Search & Category Filter */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search dish..."
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <select
                      value={menuCatFilter}
                      onChange={(e) => setMenuCatFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="all">All Categories</option>
                      <option value="Starters">Starters</option>
                      <option value="Biryanis & Rice">Biryanis & Rice</option>
                      <option value="Main Curries">Main Curries</option>
                      <option value="Breads">Breads</option>
                      <option value="Desserts">Desserts</option>
                      <option value="Beverages">Beverages</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setIsAddDishOpen(true)}
                    style={{
                      backgroundColor: themeColor,
                      color: contrastText,
                      boxShadow: `0 4px 14px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.2)`,
                    }}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer hover:opacity-90"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Dish</span>
                  </button>
                </div>

                {/* Menu Items Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4">Dish Name</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Prep Time</th>
                        <th className="py-3.5 px-4">Price (INR)</th>
                        <th className="py-3.5 px-4">Kitchen Stock</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredMenu.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-white flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  item.dietary === "veg" ? "bg-emerald-400" : "bg-red-400"
                                }`}
                                title={item.dietary === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                              />
                              {item.name}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1">{item.description}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            {item.prep_time_minutes || 15} mins
                          </td>
                          <td
                            className="py-3.5 px-4 font-mono font-bold text-sm"
                            style={{ color: themeColor }}
                          >
                            ₹{item.price}
                          </td>
                          <td className="py-3.5 px-4">
                            {item.is_available ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                Available
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                86&apos;d / Sold Out
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleToggleStock(item.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                item.is_available
                                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}
                            >
                              {item.is_available ? "Mark Sold Out" : "Mark Available"}
                            </button>
                            <button
                              onClick={() => {
                                setEditingPriceItem(item);
                                setNewPriceValue(item.price);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                            >
                              Edit Price
                            </button>
                            <button
                              onClick={() => handleDeleteDish(item.id, item.name)}
                              title="Delete Dish"
                              className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* =================== SUBVIEW 2: RAW STOCK & INVENTORY =================== */}
            {menuSubTab === "inventory" && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  {/* Search & Category Filter */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search ingredient / item..."
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <select
                      value={inventoryCatFilter}
                      onChange={(e) => setInventoryCatFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="all">All Categories</option>
                      <option value="Meat & Seafood">Meat & Seafood</option>
                      <option value="Grains & Spices">Grains & Spices</option>
                      <option value="Dairy & Oils">Dairy & Oils</option>
                      <option value="Produce">Produce</option>
                      <option value="Packaging">Packaging</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setIsAddInventoryOpen(true)}
                    style={{
                      backgroundColor: themeColor,
                      color: contrastText,
                      boxShadow: `0 4px 14px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.2)`,
                    }}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer hover:opacity-90"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Raw Material</span>
                  </button>
                </div>

                {/* Inventory Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4">Raw Ingredient / Item</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Current Stock</th>
                        <th className="py-3.5 px-4">Reorder Level</th>
                        <th className="py-3.5 px-4">Cost / Unit</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Quick Stock Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {filteredInventory.map((item) => {
                        const statusBadge =
                          item.status === "in_stock"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : item.status === "low_stock"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30";

                        return (
                          <tr key={item.id} className="hover:bg-slate-800/40 transition">
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {item.name}
                              {item.last_restocked && (
                                <div className="text-[10px] text-slate-400 font-normal">
                                  Restocked: {item.last_restocked}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px]">
                                {item.category}
                              </span>
                            </td>
                            <td
                              className="py-3.5 px-4 font-mono font-bold text-sm"
                              style={{ color: themeColor }}
                            >
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-400">
                              {item.reorder_level} {item.unit}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300">
                              ₹{item.cost_per_unit}/{item.unit}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${statusBadge}`}>
                                {item.status.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleAdjustStock(item.id, -5)}
                                  title="Consume 5 units"
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                                >
                                  -5
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(item.id, -1)}
                                  title="Consume 1 unit"
                                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(item.id, 1)}
                                  title="Add 1 unit"
                                  className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(item.id, 5)}
                                  title="Add 5 units"
                                  className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() => handleDeleteInventory(item.id, item.name)}
                                  title="Remove item"
                                  className="p-1.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quick Price Edit Modal */}
            {editingPriceItem && (
              <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <h3 className="text-base font-bold text-white mb-1">Update Item Price</h3>
                  <p className="text-xs text-slate-400 mb-4">{editingPriceItem.name}</p>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">New Price (INR ₹)</label>
                    <input
                      type="number"
                      value={newPriceValue}
                      onChange={(e) => setNewPriceValue(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPriceItem(null)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePrice}
                      style={{ backgroundColor: themeColor, color: contrastText }}
                      className="flex-1 py-2 rounded-xl font-bold text-xs cursor-pointer hover:opacity-90"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Add New Dish */}
            {isAddDishOpen && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <UtensilsCrossed className="w-5 h-5" style={{ color: themeColor }} />
                      Add New Restaurant Dish
                    </h3>
                    <button
                      onClick={() => setIsAddDishOpen(false)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateDish} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Dish Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gongura Mamsam, Hyderabadi Dum Biryani"
                        value={newDish.name}
                        onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                        <select
                          value={newDish.category}
                          onChange={(e) => setNewDish({ ...newDish, category: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        >
                          <option value="Starters">Starters</option>
                          <option value="Biryanis & Rice">Biryanis & Rice</option>
                          <option value="Main Curries">Main Curries</option>
                          <option value="Breads">Breads</option>
                          <option value="Desserts">Desserts</option>
                          <option value="Beverages">Beverages</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Price (₹ INR)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={newDish.price}
                          onChange={(e) => setNewDish({ ...newDish, price: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Dietary Classification</label>
                        <select
                          value={newDish.dietary}
                          onChange={(e) => setNewDish({ ...newDish, dietary: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        >
                          <option value="veg">Vegetarian (Green)</option>
                          <option value="non-veg">Non-Vegetarian (Red)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Prep Time (mins)</label>
                        <input
                          type="number"
                          min={1}
                          value={newDish.prep_time_minutes}
                          onChange={(e) => setNewDish({ ...newDish, prep_time_minutes: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Description / Ingredients</label>
                      <textarea
                        rows={2}
                        placeholder="Key spices, taste profile, and allergen notes..."
                        value={newDish.description}
                        onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddDishOpen(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: themeColor,
                          color: contrastText,
                          boxShadow: `0 4px 14px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.25)`,
                        }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer hover:opacity-90"
                      >
                        Add to Menu
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: Add Raw Material */}
            {isAddInventoryOpen && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Boxes className="w-5 h-5" style={{ color: themeColor }} />
                      Add Raw Material to Inventory
                    </h3>
                    <button
                      onClick={() => setIsAddInventoryOpen(false)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateInventory} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Raw Ingredient / Material</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Basmati Rice, Chicken Curry Cut, Pure Ghee"
                        value={newInventory.name}
                        onChange={(e) => setNewInventory({ ...newInventory, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                        <select
                          value={newInventory.category}
                          onChange={(e) => setNewInventory({ ...newInventory, category: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        >
                          <option value="Meat & Seafood">Meat & Seafood</option>
                          <option value="Grains & Spices">Grains & Spices</option>
                          <option value="Dairy & Oils">Dairy & Oils</option>
                          <option value="Produce">Produce</option>
                          <option value="Packaging">Packaging</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Unit of Measurement</label>
                        <select
                          value={newInventory.unit}
                          onChange={(e) => setNewInventory({ ...newInventory, unit: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        >
                          <option value="kg">kg (Kilogram)</option>
                          <option value="g">g (Gram)</option>
                          <option value="ltr">ltr (Litre)</option>
                          <option value="ml">ml (Millilitre)</option>
                          <option value="pieces">pieces</option>
                          <option value="packets">packets</option>
                          <option value="boxes">boxes</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Stock Qty</label>
                        <input
                          type="number"
                          required
                          value={newInventory.quantity}
                          onChange={(e) => setNewInventory({ ...newInventory, quantity: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Reorder Level</label>
                        <input
                          type="number"
                          required
                          value={newInventory.reorder_level}
                          onChange={(e) => setNewInventory({ ...newInventory, reorder_level: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Cost / Unit (₹)</label>
                        <input
                          type="number"
                          required
                          value={newInventory.cost_per_unit}
                          onChange={(e) => setNewInventory({ ...newInventory, cost_per_unit: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddInventoryOpen(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: themeColor,
                          color: contrastText,
                          boxShadow: `0 4px 14px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.25)`,
                        }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer hover:opacity-90"
                      >
                        Add to Inventory
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: STAFF & ADMIN SEATS (FULL STAFF MANAGEMENT)          */}
        {/* ========================================================== */}
        {activeTab === "staff" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white">Staff Seats & Outlet Crew</h2>
                <p className="text-xs text-slate-400">
                  Manage waiters, kitchen line chefs, cashiers, and floor captains for {tenant.name}.
                </p>
              </div>

              <button
                onClick={() => setIsAddStaffOpen(true)}
                style={{
                  backgroundColor: themeColor,
                  color: contrastText,
                  boxShadow: `0 4px 14px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.25)`,
                }}
                className="px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer hover:opacity-90"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Staff Member</span>
              </button>
            </div>

            {/* Section A: Platform Back-Office Admins */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: themeColor }} /> Authorized Back-Office Admins
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminsList.map((adm) => (
                  <div
                    key={adm.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl border flex items-center justify-center font-bold font-serif"
                        style={{
                          backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.15)`,
                          borderColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.35)`,
                          color: themeColor,
                        }}
                      >
                        {adm.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{adm.name}</div>
                        <div className="text-xs text-slate-400">{adm.email}</div>
                        <div
                          className="text-[10px] mt-1 uppercase font-mono font-medium"
                          style={{ color: themeColor }}
                        >
                          Role: {adm.role} • Status: {adm.status}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Authorized
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section B: Operating Floor & Kitchen Staff */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> Floor & Kitchen Crew ({staffList.length})
                </h3>

                {/* Filter */}
                <select
                  value={staffRoleFilter}
                  onChange={(e) => setStaffRoleFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                >
                  <option value="all">All Roles & Shifts</option>
                  <option value="Waiter">Waiters</option>
                  <option value="Kitchen Chef">Kitchen Chefs</option>
                  <option value="Cashier">Cashiers</option>
                  <option value="Floor Captain">Floor Captains</option>
                  <option value="Store Manager">Store Managers</option>
                  <option value="Morning">Morning Shift</option>
                  <option value="Evening">Evening Shift</option>
                  <option value="Full Day">Full Day Shift</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStaff.map((staff) => {
                  const statusColors = {
                    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                    on_break: "bg-amber-500/10 text-amber-300 border-amber-500/30",
                    inactive: "bg-rose-500/10 text-rose-400 border-rose-500/30",
                  };

                  return (
                    <div
                      key={staff.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white text-sm">{staff.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[staff.status]}`}>
                            {staff.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="text-xs text-slate-400 space-y-1">
                          <div className="font-semibold" style={{ color: themeColor }}>
                            {staff.role}
                          </div>
                          <div>Phone: <span className="font-mono text-slate-300">{staff.phone}</span></div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span>Shift: <strong className="text-slate-300">{staff.shift}</strong></span>
                            <span>Floor: <strong className="text-slate-300">{staff.assigned_floor || "Ground"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleToggleStaffStatus(staff.id, staff.status)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                        >
                          Change Status
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id, staff.name)}
                          className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal: Add Staff Member */}
            {isAddStaffOpen && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5" style={{ color: themeColor }} />
                      Add Outlet Crew Member
                    </h3>
                    <button
                      onClick={() => setIsAddStaffOpen(false)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateStaff} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Operational Role</label>
                        <select
                          value={newStaff.role}
                          onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        >
                          <option value="Waiter">Waiter / Server</option>
                          <option value="Kitchen Chef">Kitchen Chef / Cook</option>
                          <option value="Cashier">Cashier & POS</option>
                          <option value="Floor Captain">Floor Captain</option>
                          <option value="Store Manager">Store Manager</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={newStaff.phone}
                          onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Shift</label>
                        <select
                          value={newStaff.shift}
                          onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value as any })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        >
                          <option value="Morning">Morning Shift (10 AM - 4 PM)</option>
                          <option value="Evening">Evening Shift (4 PM - 11:30 PM)</option>
                          <option value="Full Day">Full Day Shift</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">Assigned Floor</label>
                        <select
                          value={newStaff.assigned_floor}
                          onChange={(e) => setNewStaff({ ...newStaff, assigned_floor: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                        >
                          {floors.map((flr) => (
                            <option key={flr} value={flr}>{flr}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddStaffOpen(false)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          backgroundColor: themeColor,
                          color: contrastText,
                          boxShadow: `0 4px 14px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.25)`,
                        }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer hover:opacity-90"
                      >
                        Enroll Staff Member
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 6: TODAY'S SALES & REGISTER                            */}
        {/* ========================================================== */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-white">Daily Register & Revenue Breakdown</h2>
              <p className="text-xs text-slate-400">
                End-of-day register balancing and payment method analytics for {tenant.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Gross Sales Today</div>
                <div
                  className="text-2xl font-bold font-serif"
                  style={{ color: themeColor }}
                >
                  ₹{totalRevenueToday.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-emerald-400 mt-1">↑ 18% vs yesterday</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Total Tables Billed</div>
                <div className="text-2xl font-bold font-mono text-white">
                  {orders.length} Orders
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Average Turn Time: 42 mins</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">Average Order Value (AOV)</div>
                <div className="text-2xl font-bold font-mono text-white">
                  ₹{orders.length > 0 ? Math.round(totalRevenueToday / orders.length) : 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Fine Dining Standard</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 7: ACCOUNT, PASSWORD & RGB THEME CUSTOMIZER            */}
        {/* ========================================================== */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" style={{ color: themeColor }} />
                  Account & Interface Settings
                </h2>
                <p className="text-xs text-slate-400">
                  Update your admin security password, personalize your RGB theme accent, and manage restaurant details.
                </p>
              </div>

              {/* Current Active Theme Pill */}
              <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-2xl border border-slate-800 text-xs">
                <span className="text-slate-400">Current Theme:</span>
                <span
                  className="w-3.5 h-3.5 rounded-full ring-1 ring-white/50"
                  style={{ backgroundColor: themeColor }}
                />
                <span className="font-mono font-bold text-white">{themeColor.toUpperCase()}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  rgb({themeRgb.r}, {themeRgb.g}, {themeRgb.b})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ============================================ */}
              {/* CARD 1: ADMIN SECURITY & PASSWORD CHANGE    */}
              {/* ============================================ */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.15)`,
                        borderColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.35)`,
                        color: themeColor,
                      }}
                    >
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Admin Account & Security</h3>
                      <p className="text-xs text-slate-400">Change your login password</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {session.role}
                  </span>
                </div>

                {/* Logged in admin account identity badge */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Logged-in Administrator:</span>
                    <span className="font-bold text-white">{session.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Email:</span>
                    <span className="font-mono text-amber-300">{session.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Managed Outlet:</span>
                    <span className="text-slate-200">{tenant.name}</span>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        placeholder="Enter current password (or voucher password)"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-300">New Password</label>
                      {newPassword && (
                        <span className="text-[10px] text-slate-400">
                          Strength: <strong className="text-white">{passwordStrength.label}</strong>
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        required
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {newPassword && (
                      <div className="mt-1.5 flex gap-1 h-1">
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-slate-800"}`} />
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-slate-800"}`} />
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-slate-800"}`} />
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    style={{
                      backgroundColor: themeColor,
                      color: contrastText,
                      boxShadow: `0 4px 14px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.25)`,
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
                  >
                    <KeyRound className="w-4 h-4" />
                    Save & Update Admin Password
                  </button>
                </form>
              </div>

              {/* ============================================ */}
              {/* CARD 2: RGB THEME ENGINE & CUSTOMIZER       */}
              {/* ============================================ */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.15)`,
                        borderColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.35)`,
                        color: themeColor,
                      }}
                    >
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">RGB Interface Theme Studio</h3>
                      <p className="text-xs text-slate-400">Select any color code via RGB sliders or hex</p>
                    </div>
                  </div>
                  <span
                    className="w-4 h-4 rounded-full ring-2 ring-white/60 shadow"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>

                {themeSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{themeSuccess}</span>
                  </div>
                )}

                {/* Live Color Input & Swatch Header */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  {/* Native HTML5 Color Picker */}
                  <div className="relative">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => handleHexInput(e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                      title="Click to open color palette"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 uppercase font-mono">Hex Code:</span>
                      <input
                        type="text"
                        value={themeColor}
                        onChange={(e) => handleHexInput(e.target.value)}
                        placeholder="#D4AF37"
                        className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-center font-mono font-bold text-white focus:outline-none focus:border-amber-400 uppercase"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 uppercase font-mono">RGB Value:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        rgb({themeRgb.r}, {themeRgb.g}, {themeRgb.b})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 Interactive RGB Sliders */}
                <div className="space-y-3 pt-1">
                  {/* RED SLIDER */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-red-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Red Channel (R)
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={255}
                        value={themeRgb.r}
                        onChange={(e) => handleRgbSlider("r", Number(e.target.value))}
                        className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-center text-white"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={themeRgb.r}
                      onChange={(e) => handleRgbSlider("r", Number(e.target.value))}
                      className="w-full accent-red-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* GREEN SLIDER */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Green Channel (G)
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={255}
                        value={themeRgb.g}
                        onChange={(e) => handleRgbSlider("g", Number(e.target.value))}
                        className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-center text-white"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={themeRgb.g}
                      onChange={(e) => handleRgbSlider("g", Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>

                  {/* BLUE SLIDER */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-blue-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> Blue Channel (B)
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={255}
                        value={themeRgb.b}
                        onChange={(e) => handleRgbSlider("b", Number(e.target.value))}
                        className="w-14 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-center text-white"
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={themeRgb.b}
                      onChange={(e) => handleRgbSlider("b", Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
                    />
                  </div>
                </div>

                {/* Curated Luxury Preset Palettes */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase font-mono mb-2">
                    One-Click Luxury Palettes:
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {LUXURY_THEMES.map((th) => {
                      const isCurrent = themeColor.toLowerCase() === th.hex.toLowerCase();
                      return (
                        <button
                          key={th.hex}
                          type="button"
                          onClick={() => handleSelectPresetTheme(th)}
                          title={`${th.name} (${th.hex})`}
                          className={`p-2 rounded-xl text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                            isCurrent
                              ? "border-white bg-slate-800 shadow-lg scale-105"
                              : "border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900"
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full shadow"
                            style={{ backgroundColor: th.hex }}
                          />
                          <span className="text-[9px] font-medium text-slate-300 truncate w-full">
                            {th.name.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Preview Box */}
                <div
                  className="p-3.5 rounded-xl border space-y-2 transition-all duration-300"
                  style={{
                    backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.08)`,
                    borderColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.35)`,
                  }}
                >
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center justify-between">
                    <span>Live Interface Theme Preview:</span>
                    <span style={{ color: themeColor }}>Active Accent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      style={{ backgroundColor: themeColor, color: contrastText }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-md cursor-default"
                    >
                      Primary Button
                    </button>
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold border"
                      style={{
                        backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.15)`,
                        borderColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.4)`,
                        color: themeColor,
                      }}
                    >
                      Active Pill Badge
                    </span>
                    <span className="font-mono font-bold text-xs" style={{ color: themeColor }}>
                      ₹1,250
                    </span>
                  </div>
                </div>

                {/* Save Theme Button */}
                <button
                  type="button"
                  onClick={handleSaveTheme}
                  style={{
                    backgroundColor: themeColor,
                    color: contrastText,
                    boxShadow: `0 4px 16px rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.28)`,
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer hover:opacity-90"
                >
                  <Check className="w-4 h-4" />
                  Apply & Save Custom RGB Theme
                </button>
              </div>
            </div>

            {/* ============================================ */}
            {/* CARD 3: RESTAURANT PROFILE & BUSINESS DATA   */}
            {/* ============================================ */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.15)`,
                      borderColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.35)`,
                      color: themeColor,
                    }}
                  >
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Restaurant Profile & Commercial Identity</h3>
                    <p className="text-xs text-slate-400">Configure outlet display name, tagline, address & GSTIN</p>
                  </div>
                </div>
              </div>

              {profileSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Restaurant Display Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Tagline / Brand Slogan</label>
                    <input
                      type="text"
                      placeholder="e.g. Authentic Rayalaseema & Coastal Cuisine"
                      value={profileTagline}
                      onChange={(e) => setProfileTagline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">City / Region</label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">GSTIN / Tax ID</label>
                    <input
                      type="text"
                      placeholder="37ABCDE1234F1Z5"
                      value={profileGstin}
                      onChange={(e) => setProfileGstin(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Street Address</label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Service Charge %</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={profileServiceCharge}
                      onChange={(e) => setProfileServiceCharge(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">GST %</label>
                    <input
                      type="number"
                      min={0}
                      max={28}
                      value={profileGst}
                      onChange={(e) => setProfileGst(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <Check className="w-4 h-4" />
                  Save Restaurant Profile Details
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
