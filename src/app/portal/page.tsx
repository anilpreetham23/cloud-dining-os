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
  SlidersHorizontal,
  Lock,
  KeyRound,
  Sun,
  Moon,
  QrCode,
  Printer,
  Download,
  Copy,
  ExternalLink,
  Scan,
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

  // Lighting Mode (Dark / Light Theme Toggle)
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

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

  // Table QR Scanner Modals
  const [selectedQrTable, setSelectedQrTable] = useState<RestaurantTable | null>(null);
  const [isBatchQrOpen, setIsBatchQrOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

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

  // Load session, lighting mode & restaurant data
  useEffect(() => {
    // Read saved lighting mode (dark / light)
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("clouddining_theme_mode") as "dark" | "light" | null;
      if (savedMode === "light" || savedMode === "dark") {
        setThemeMode(savedMode);
      }
    }

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

  // Toggle Dark / Light Mode
  const toggleThemeMode = () => {
    const next = themeMode === "dark" ? "light" : "dark";
    setThemeMode(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("clouddining_theme_mode", next);
    }
  };

  // RGB Theme Handlers
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

  // QR Code Helpers
  const getTableOrderingUrl = (tableNumber: number) => {
    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : "https://cloud-dining-os.vercel.app";
    return `${origin}/order?restaurant=${tenant?.id || ""}&table=${tableNumber}`;
  };

  const getTableQrCodeImg = (tableNumber: number, size = 300) => {
    const url = getTableOrderingUrl(tableNumber);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&margin=12&format=svg`;
  };

  const copyTableLink = (tableNumber: number) => {
    const url = getTableOrderingUrl(tableNumber);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
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

  // Theme helper variables
  const isDark = themeMode === "dark";
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
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? "bg-[#070c16] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
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
      <header
        className={`border-b sticky top-0 z-30 backdrop-blur-md px-6 py-3.5 transition-colors duration-300 ${
          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white/90 border-slate-200 shadow-sm"
        }`}
      >
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
                <h1
                  className={`text-lg font-bold font-serif tracking-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {tenant.name}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Outlet
                </span>
                {tenant.tagline && (
                  <span
                    className={`hidden lg:inline text-xs italic ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    — {tenant.tagline}
                  </span>
                )}
              </div>
              <div
                className={`text-xs flex items-center gap-2 mt-0.5 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                <span>{tenant.city}</span>
                <span>•</span>
                <span style={{ color: themeColor }} className="font-medium">
                  Logged in as {session.name}
                </span>
                {tenant.gstin && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-[11px]">GSTIN: {tenant.gstin}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics, Theme Toggle & Actions */}
          <div className="flex items-center gap-3">
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs ${
                isDark
                  ? "bg-slate-950/80 border-slate-800 text-slate-400"
                  : "bg-slate-100 border-slate-200 text-slate-600"
              }`}
            >
              <span>Today&apos;s Revenue:</span>
              <span className="font-bold font-mono" style={{ color: themeColor }}>
                ₹{totalRevenueToday.toLocaleString("en-IN")}
              </span>
            </div>

            {/* LIGHT / DARK THEME TOGGLE SWITCH */}
            <button
              onClick={toggleThemeMode}
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border shadow-sm ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-800 text-amber-400 border-slate-700/60"
                  : "bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-300"
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 animate-spin-slow" /> : <Moon className="w-4 h-4" />}
              <span className="text-xs font-semibold hidden md:inline">
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            </button>

            <button
              onClick={() => tenant && loadRestaurantData(tenant.id)}
              title="Refresh Data"
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-Tabs */}
      <div
        className={`border-b px-6 py-2.5 transition-colors duration-300 ${
          isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-slate-100/90 border-slate-200"
        }`}
      >
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
                    : isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-slate-950/20 text-current"
                        : isDark
                        ? "bg-slate-800 text-slate-300 border border-slate-700"
                        : "bg-slate-200 text-slate-700 border border-slate-300"
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
                <h2 className={`text-xl font-bold font-serif ${isDark ? "text-white" : "text-slate-900"}`}>
                  Live Dining Orders
                </h2>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Manage tickets, table service status, and bill settlement in real time.
                </p>
              </div>

              {/* Status Filter Pills */}
              <div
                className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                {["all", "new", "preparing", "ready", "served", "paid"].map((st) => {
                  const isSel = orderFilter === st;
                  return (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      style={isSel ? { backgroundColor: themeColor, color: contrastText } : {}}
                      className={`px-3 py-1.5 rounded-lg capitalize font-medium transition cursor-pointer ${
                        isSel
                          ? "font-bold shadow-sm"
                          : isDark
                          ? "text-slate-400 hover:text-white"
                          : "text-slate-600 hover:text-slate-900"
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
                <div
                  className={`col-span-full py-16 text-center rounded-2xl border ${
                    isDark
                      ? "text-slate-500 bg-slate-900/40 border-slate-800"
                      : "text-slate-500 bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <Receipt className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                  <p className="text-sm font-medium">No active orders matching &quot;{orderFilter}&quot;</p>
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const statusColors: Record<string, string> = {
                    new: "bg-blue-500/10 text-blue-500 border-blue-500/30",
                    preparing: "bg-amber-500/10 text-amber-500 border-amber-500/30",
                    ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
                    served: "bg-purple-500/10 text-purple-500 border-purple-500/30",
                    paid: isDark
                      ? "bg-slate-800 text-slate-400 border-slate-700"
                      : "bg-slate-100 text-slate-600 border-slate-200",
                  };

                  return (
                    <div
                      key={order.id}
                      className={`border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition ${
                        isDark
                          ? "bg-slate-900 border-slate-800 hover:border-slate-700"
                          : "bg-white border-slate-200 hover:border-slate-300 shadow-md"
                      }`}
                    >
                      <div>
                        {/* Order Header */}
                        <div
                          className={`flex items-center justify-between pb-3 border-b mb-3 ${
                            isDark ? "border-slate-800/80" : "border-slate-200"
                          }`}
                        >
                          <div>
                            <span className="font-mono text-xs font-bold" style={{ color: themeColor }}>
                              #{order.order_number}
                            </span>
                            <div
                              className={`text-sm font-bold mt-0.5 ${
                                isDark ? "text-white" : "text-slate-900"
                              }`}
                            >
                              Table {order.table_number} • {order.customer_name}
                            </div>
                            {order.floor && (
                              <div
                                className={`text-[10px] font-mono mt-0.5 ${
                                  isDark ? "text-slate-400" : "text-slate-500"
                                }`}
                              >
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
                              <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                                <strong style={{ color: themeColor }} className="mr-1.5">
                                  {item.quantity}x
                                </strong>
                                {item.name}
                              </span>
                              <span
                                className={`font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}
                              >
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer & Actions */}
                      <div className={`pt-3 border-t ${isDark ? "border-slate-800/80" : "border-slate-200"}`}>
                        <div className="flex items-center justify-between text-sm mb-3">
                          <span
                            className={`text-xs flex items-center gap-1 ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {order.created_at}
                          </span>
                          <span className="font-serif font-bold text-base" style={{ color: themeColor }}>
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
                            <div
                              className={`col-span-2 py-2 rounded-xl text-emerald-500 text-center font-mono text-xs flex items-center justify-center gap-1 ${
                                isDark ? "bg-slate-800/80" : "bg-emerald-50 border border-emerald-200"
                              }`}
                            >
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
                <h2 className={`text-xl font-bold font-serif flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                  <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
                  Live Kitchen Display Screen (KDS)
                </h2>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Real-time ticket dispatch for chefs and line cooks at {tenant.name}.
                </p>
              </div>
              <div
                className={`text-xs font-mono px-3 py-1.5 rounded-xl font-bold border ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}
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
                    className={`border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl flex flex-col justify-between ${
                      isDark ? "bg-slate-900/95" : "bg-white"
                    }`}
                  >
                    <div>
                      <div
                        className={`flex items-center justify-between pb-3 border-b ${
                          isDark ? "border-slate-800" : "border-slate-200"
                        }`}
                      >
                        <div>
                          <span className="text-xs font-mono font-bold text-amber-500">
                            Ticket #{order.order_number}
                          </span>
                          <h3 className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                            Table {order.table_number}
                          </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-600 border border-amber-500/40 flex items-center gap-1">
                          <Flame className="w-3 h-3 animate-bounce" />
                          On Fire
                        </span>
                      </div>

                      <div className="py-4 space-y-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between p-2 rounded-xl border ${
                              isDark
                                ? "bg-slate-950/60 border-slate-800/80 text-white"
                                : "bg-slate-50 border-slate-200 text-slate-900"
                            }`}
                          >
                            <span className="text-sm font-bold flex items-center gap-2">
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
        {/* TAB 3: FLOOR & TABLE GRID (WITH TABLE QR SCANNERS)         */}
        {/* ========================================================== */}
        {activeTab === "tables" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl font-bold font-serif ${isDark ? "text-white" : "text-slate-900"}`}>
                  Dining Floor & Table Grid
                </h2>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Live seating occupancy, multi-floor controls, and unique table QR scanners.
                </p>
              </div>

              {/* Action Buttons: Batch Print All QR Scanners & Add Table */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsBatchQrOpen(true)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer shadow-sm ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                      : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300"
                  }`}
                >
                  <Printer className="w-4 h-4 text-amber-500" />
                  <span>Batch Print QR Standees</span>
                </button>

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
            <div
              className={`flex items-center gap-2 border-b pb-3 overflow-x-auto ${
                isDark ? "border-slate-800" : "border-slate-200"
              }`}
            >
              <span
                className={`text-xs flex items-center gap-1.5 mr-2 shrink-0 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
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
                    : isDark
                    ? "text-slate-400 hover:text-white bg-slate-900/60"
                    : "text-slate-600 hover:text-slate-900 bg-slate-200/60"
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
                        : isDark
                        ? "text-slate-400 hover:text-white bg-slate-900/60"
                        : "text-slate-600 hover:text-slate-900 bg-slate-200/60"
                    }`}
                  >
                    {flr} ({count})
                  </button>
                );
              })}
            </div>

            {/* Status Legend */}
            <div
              className={`flex flex-wrap items-center gap-4 text-xs p-3 rounded-xl border ${
                isDark
                  ? "bg-slate-900/40 border-slate-800 text-slate-300"
                  : "bg-white border-slate-200 text-slate-700 shadow-sm"
              }`}
            >
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
                  available: isDark
                    ? "border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-500"
                    : "border-emerald-500/50 bg-emerald-50/70 hover:border-emerald-500",
                  occupied: isDark
                    ? "border-rose-500/50 bg-rose-950/20 hover:border-rose-500"
                    : "border-rose-500/50 bg-rose-50/70 hover:border-rose-500",
                  reserved: isDark
                    ? "border-amber-500/40 bg-amber-950/10 hover:border-amber-500"
                    : "border-amber-500/50 bg-amber-50/70 hover:border-amber-500",
                  cleaning: isDark
                    ? "border-cyan-500/40 bg-cyan-950/10 hover:border-cyan-400"
                    : "border-cyan-500/50 bg-cyan-50/70 hover:border-cyan-400",
                };
                const badgeMap: Record<string, string> = {
                  available: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
                  occupied: "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 font-bold",
                  reserved: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30",
                  cleaning: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30",
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
                        <span className={`font-mono text-xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                          Table {tbl.table_number}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase ${badgeMap[tbl.status]}`}>
                            {tbl.status}
                          </span>
                          <button
                            onClick={() => handleDeleteTable(tbl.id, tbl.table_number)}
                            title="Delete Table"
                            className="p-1 text-slate-400 hover:text-red-500 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className={`text-xs space-y-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        <div className="flex items-center justify-between">
                          <span>
                            Capacity: <strong className={isDark ? "text-slate-200" : "text-slate-900"}>{tbl.capacity} Pax</strong>
                          </span>
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
                          <div className="text-[11px]">
                            Section: <span className={isDark ? "text-slate-300" : "text-slate-800"}>{tbl.section}</span>
                          </div>
                        )}
                        {tbl.guests_count && (
                          <div className="text-[11px] text-rose-500 font-semibold">
                            • {tbl.guests_count} Guests seated
                          </div>
                        )}
                        {tbl.occupied_since && (
                          <div className="text-[10px] text-amber-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {tbl.occupied_since}
                          </div>
                        )}
                      </div>

                      {/* UNIQUE TABLE QR SCANNER BUTTON */}
                      <div className="pt-3 mt-3 border-t border-dashed border-slate-700/60 dark:border-slate-800">
                        <button
                          onClick={() => setSelectedQrTable(tbl)}
                          className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer shadow-sm ${
                            isDark
                              ? "bg-slate-950 hover:bg-slate-800 text-amber-400 border-amber-400/30"
                              : "bg-white hover:bg-amber-50 text-amber-700 border-amber-500/40"
                          }`}
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>View Table QR Standee</span>
                        </button>
                      </div>
                    </div>

                    {/* Table Status Switchers */}
                    <div className="pt-3 mt-3 border-t border-slate-700/40 dark:border-slate-800/60">
                      <div className="text-[10px] uppercase font-mono mb-1.5 text-slate-400">Change Status:</div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        <button
                          onClick={() => handleTableStatus(tbl.id, "available")}
                          className={`py-1 rounded-lg border font-semibold transition cursor-pointer ${
                            tbl.status === "available"
                              ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20"
                          }`}
                        >
                          Available
                        </button>
                        <button
                          onClick={() => handleTableStatus(tbl.id, "occupied")}
                          className={`py-1 rounded-lg border font-semibold transition cursor-pointer ${
                            tbl.status === "occupied"
                              ? "bg-rose-500 text-white border-rose-400 font-bold"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/20 hover:bg-rose-500/20"
                          }`}
                        >
                          Occupied
                        </button>
                        <button
                          onClick={() => handleTableStatus(tbl.id, "reserved")}
                          className={`py-1 rounded-lg border font-semibold transition cursor-pointer ${
                            tbl.status === "reserved"
                              ? "bg-amber-400 text-slate-950 border-amber-300 font-bold"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20"
                          }`}
                        >
                          Reserved
                        </button>
                        <button
                          onClick={() => handleTableStatus(tbl.id, "cleaning")}
                          className={`py-1 rounded-lg border font-semibold transition cursor-pointer ${
                            tbl.status === "cleaning"
                              ? "bg-cyan-400 text-slate-950 border-cyan-300 font-bold"
                              : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/20 hover:bg-cyan-500/20"
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

            {/* ========================================================== */}
            {/* MODAL 1: INDIVIDUAL TABLE QR SCANNER STANDEE              */}
            {/* ========================================================== */}
            {selectedQrTable && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                <div
                  className={`border rounded-2xl sm:rounded-3xl max-w-sm w-full max-h-[90vh] flex flex-col p-4 sm:p-5 shadow-2xl relative animate-scaleIn my-auto ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <button
                    onClick={() => setSelectedQrTable(null)}
                    className={`absolute right-3 top-3 p-1 rounded-full transition cursor-pointer z-10 ${
                      isDark ? "hover:bg-slate-800 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className="overflow-y-auto pr-0.5 space-y-3">
                    {/* Standee Header */}
                    <div className="text-center space-y-0.5 pb-2.5 border-b border-slate-700/40 dark:border-slate-800/80">
                      <div
                        className="w-9 h-9 rounded-xl mx-auto flex items-center justify-center font-bold text-base shadow-sm mb-1"
                        style={{ backgroundColor: themeColor, color: contrastText }}
                      >
                        <Store className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold font-serif leading-tight">{tenant.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{tenant.tagline || tenant.city}</p>
                    </div>

                    {/* Table Badge & QR Standee Box */}
                    <div className="text-center space-y-2">
                      <div
                        className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border"
                        style={{
                          backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.15)`,
                          borderColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.35)`,
                          color: themeColor,
                        }}
                      >
                        TABLE #{selectedQrTable.table_number}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {selectedQrTable.floor} • {selectedQrTable.section || "Main Dining"} ({selectedQrTable.capacity} Pax)
                      </div>

                      {/* Scannable QR Code - Compact & Perfectly Fitted to Screen */}
                      <div className="p-2.5 bg-white rounded-xl border-2 border-slate-200 shadow-sm inline-block mx-auto">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getTableQrCodeImg(selectedQrTable.table_number, 200)}
                          alt={`QR Code for Table ${selectedQrTable.table_number}`}
                          className="w-32 h-32 sm:w-36 sm:h-36 mx-auto object-contain block"
                        />
                        <div className="text-[9px] font-mono font-bold text-slate-600 mt-1 tracking-wide">
                          SCAN TO ORDER AT TABLE
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-400 max-w-[240px] mx-auto leading-tight">
                        Point phone camera to browse digital menu and fire tickets to kitchen.
                      </p>
                    </div>

                    {/* Actions Toolbar */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-700/40 dark:border-slate-800/80">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => window.print()}
                          className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border transition ${
                            isDark
                              ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                          }`}
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-500" />
                          <span>Print Standee</span>
                        </button>

                        <button
                          onClick={() => copyTableLink(selectedQrTable.table_number)}
                          className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border transition ${
                            isDark
                              ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                          }`}
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
                        </button>
                      </div>

                      <a
                        href={getTableOrderingUrl(selectedQrTable.table_number)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ backgroundColor: themeColor, color: contrastText }}
                        className="w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:brightness-110"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Test Scan / Open Guest Menu</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================== */}
            {/* MODAL 2: BATCH PRINT ALL TABLE QR SCANNERS                */}
            {/* ========================================================== */}
            {isBatchQrOpen && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
                <div
                  className={`border rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col p-4 sm:p-5 shadow-2xl relative ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/40 dark:border-slate-800">
                    <div>
                      <h3 className="text-base font-bold font-serif flex items-center gap-2">
                        <Printer className="w-4 h-4 text-amber-500" />
                        Batch Print Table QR Standees — {tenant.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Printable standee cards for all {tables.length} tables to place in acrylic table tents.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        style={{ backgroundColor: themeColor, color: contrastText }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print All Sheets</span>
                      </button>
                      <button
                        onClick={() => setIsBatchQrOpen(false)}
                        className="p-1 rounded-lg hover:bg-slate-800/40 text-slate-400 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Batch Cards Grid */}
                  <div className="flex-1 overflow-y-auto py-4 grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1">
                    {tables.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl bg-white text-slate-900 border-2 border-slate-300 text-center space-y-1.5 shadow-sm"
                      >
                        <div className="font-serif font-black text-[10px] text-slate-700 tracking-wider uppercase truncate">
                          {tenant.name}
                        </div>
                        <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-xs font-bold">
                          TABLE #{t.table_number}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {t.floor} • {t.section}
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getTableQrCodeImg(t.table_number, 140)}
                          alt={`QR Table ${t.table_number}`}
                          className="w-24 h-24 mx-auto my-0.5 object-contain"
                        />
                        <div className="text-[9px] font-bold tracking-wider text-slate-600 uppercase">
                          Scan to Order
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal: Add Table */}
            {isAddTableOpen && (
              <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <div
                  className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <h3 className="text-base font-bold flex items-center gap-2">
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
                        <label className="block text-xs font-medium mb-1">Table Number</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={newTable.table_number}
                          onChange={(e) => setNewTable({ ...newTable, table_number: Number(e.target.value) })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm font-mono ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Capacity (Pax)</label>
                        <select
                          value={newTable.capacity}
                          onChange={(e) => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
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
                      <label className="block text-xs font-medium mb-1">Floor Placement</label>
                      <select
                        value={newTable.floor}
                        onChange={(e) => setNewTable({ ...newTable, floor: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 text-sm ${
                          isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      >
                        {floors.map((flr) => (
                          <option key={flr} value={flr}>{flr}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Section / Ambience Zone</label>
                      <input
                        type="text"
                        placeholder="e.g. Window Deck, AC Family Hall, Patio"
                        value={newTable.section}
                        onChange={(e) => setNewTable({ ...newTable, section: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 text-sm ${
                          isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
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
                <h2 className={`text-xl font-bold font-serif ${isDark ? "text-white" : "text-slate-900"}`}>
                  Menu & Live Inventory Controls
                </h2>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Manage dishes, real-time pricing, dietary tags, and raw material stock levels.
                </p>
              </div>

              {/* Sub-tabs: Dishes vs Raw Stock */}
              <div
                className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}
              >
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
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
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
                      : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
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
                <div
                  className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border ${
                    isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search dish..."
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                        className={`border rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 ${
                          isDark
                            ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500"
                            : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                    </div>

                    <select
                      value={menuCatFilter}
                      onChange={(e) => setMenuCatFilter(e.target.value)}
                      className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 ${
                        isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
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
                <div
                  className={`border rounded-2xl overflow-hidden shadow-xl ${
                    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}
                >
                  <table className="w-full text-left text-xs">
                    <thead
                      className={`border-b uppercase font-mono text-[11px] ${
                        isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      <tr>
                        <th className="py-3.5 px-4">Dish Name</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Prep Time</th>
                        <th className="py-3.5 px-4">Price (INR)</th>
                        <th className="py-3.5 px-4">Kitchen Stock</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-slate-800/80" : "divide-slate-200"}`}>
                      {filteredMenu.map((item) => (
                        <tr
                          key={item.id}
                          className={`transition ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}
                        >
                          <td className="py-3.5 px-4">
                            <div className={`font-semibold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
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
                            <span
                              className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                                isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                            {item.prep_time_minutes || 15} mins
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-sm" style={{ color: themeColor }}>
                            ₹{item.price}
                          </td>
                          <td className="py-3.5 px-4">
                            {item.is_available ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                                Available
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/30">
                                86&apos;d / Sold Out
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleToggleStock(item.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                                item.is_available
                                  ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30"
                                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30"
                              }`}
                            >
                              {item.is_available ? "Mark Sold Out" : "Mark Available"}
                            </button>
                            <button
                              onClick={() => {
                                setEditingPriceItem(item);
                                setNewPriceValue(item.price);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] cursor-pointer ${
                                isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                              }`}
                            >
                              Edit Price
                            </button>
                            <button
                              onClick={() => handleDeleteDish(item.id, item.name)}
                              title="Delete Dish"
                              className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition cursor-pointer"
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
                <div
                  className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border ${
                    isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search ingredient / item..."
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        className={`border rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 ${
                          isDark
                            ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500"
                            : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                    </div>

                    <select
                      value={inventoryCatFilter}
                      onChange={(e) => setInventoryCatFilter(e.target.value)}
                      className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400 ${
                        isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
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
                <div
                  className={`border rounded-2xl overflow-hidden shadow-xl ${
                    isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}
                >
                  <table className="w-full text-left text-xs">
                    <thead
                      className={`border-b uppercase font-mono text-[11px] ${
                        isDark ? "bg-slate-950 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
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
                    <tbody className={`divide-y ${isDark ? "divide-slate-800/80" : "divide-slate-200"}`}>
                      {filteredInventory.map((item) => {
                        const statusBadge =
                          item.status === "in_stock"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : item.status === "low_stock"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/30";

                        return (
                          <tr
                            key={item.id}
                            className={`transition ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}
                          >
                            <td className={`py-3.5 px-4 font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                              {item.name}
                              {item.last_restocked && (
                                <div className="text-[10px] text-slate-400 font-normal">
                                  Restocked: {item.last_restocked}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${
                                  isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-sm" style={{ color: themeColor }}>
                              {item.quantity} {item.unit}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-400">
                              {item.reorder_level} {item.unit}
                            </td>
                            <td className={`py-3.5 px-4 font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>
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
                                  className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center cursor-pointer ${
                                    isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  -5
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(item.id, -1)}
                                  title="Consume 1 unit"
                                  className={`w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center cursor-pointer ${
                                    isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  -1
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(item.id, 1)}
                                  title="Add 1 unit"
                                  className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() => handleAdjustStock(item.id, 5)}
                                  title="Add 5 units"
                                  className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 font-mono font-bold text-xs flex items-center justify-center cursor-pointer"
                                >
                                  +5
                                </button>
                                <button
                                  onClick={() => handleDeleteInventory(item.id, item.name)}
                                  title="Remove item"
                                  className="p-1.5 text-slate-400 hover:text-red-500 transition cursor-pointer"
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
                <div
                  className={`border rounded-2xl p-6 max-w-sm w-full shadow-2xl ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <h3 className="text-base font-bold mb-1">Update Item Price</h3>
                  <p className="text-xs text-slate-400 mb-4">{editingPriceItem.name}</p>

                  <div className="mb-4">
                    <label className="block text-xs font-medium mb-1.5">New Price (INR ₹)</label>
                    <input
                      type="number"
                      value={newPriceValue}
                      onChange={(e) => setNewPriceValue(Number(e.target.value))}
                      className={`w-full border rounded-xl px-3 py-2 text-sm font-mono ${
                        isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
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
                <div
                  className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <h3 className="text-base font-bold flex items-center gap-2">
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
                      <label className="block text-xs font-medium mb-1">Dish Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Gongura Mamsam, Hyderabadi Dum Biryani"
                        value={newDish.name}
                        onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 text-sm ${
                          isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Category</label>
                        <select
                          value={newDish.category}
                          onChange={(e) => setNewDish({ ...newDish, category: e.target.value as any })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
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
                        <label className="block text-xs font-medium mb-1">Price (₹ INR)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={newDish.price}
                          onChange={(e) => setNewDish({ ...newDish, price: Number(e.target.value) })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm font-mono ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Dietary Classification</label>
                        <select
                          value={newDish.dietary}
                          onChange={(e) => setNewDish({ ...newDish, dietary: e.target.value as any })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        >
                          <option value="veg">Vegetarian (Green)</option>
                          <option value="non-veg">Non-Vegetarian (Red)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Prep Time (mins)</label>
                        <input
                          type="number"
                          min={1}
                          value={newDish.prep_time_minutes}
                          onChange={(e) => setNewDish({ ...newDish, prep_time_minutes: Number(e.target.value) })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm font-mono ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1">Description / Ingredients</label>
                      <textarea
                        rows={2}
                        placeholder="Key spices, taste profile, and allergen notes..."
                        value={newDish.description}
                        onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 text-xs ${
                          isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
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
                <div
                  className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <h3 className="text-base font-bold flex items-center gap-2">
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
                      <label className="block text-xs font-medium mb-1">Raw Ingredient / Material</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Basmati Rice, Chicken Curry Cut, Pure Ghee"
                        value={newInventory.name}
                        onChange={(e) => setNewInventory({ ...newInventory, name: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 text-sm ${
                          isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Category</label>
                        <select
                          value={newInventory.category}
                          onChange={(e) => setNewInventory({ ...newInventory, category: e.target.value })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        >
                          <option value="Meat & Seafood">Meat & Seafood</option>
                          <option value="Grains & Spices">Grains & Spices</option>
                          <option value="Dairy & Oils">Dairy & Oils</option>
                          <option value="Produce">Produce</option>
                          <option value="Packaging">Packaging</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Unit of Measurement</label>
                        <select
                          value={newInventory.unit}
                          onChange={(e) => setNewInventory({ ...newInventory, unit: e.target.value as any })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
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
                        <label className="block text-xs font-medium mb-1">Stock Qty</label>
                        <input
                          type="number"
                          required
                          value={newInventory.quantity}
                          onChange={(e) => setNewInventory({ ...newInventory, quantity: Number(e.target.value) })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm font-mono ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Reorder Level</label>
                        <input
                          type="number"
                          required
                          value={newInventory.reorder_level}
                          onChange={(e) => setNewInventory({ ...newInventory, reorder_level: Number(e.target.value) })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm font-mono ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Cost / Unit (₹)</label>
                        <input
                          type="number"
                          required
                          value={newInventory.cost_per_unit}
                          onChange={(e) => setNewInventory({ ...newInventory, cost_per_unit: Number(e.target.value) })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm font-mono ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
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
                <h2 className={`text-xl font-bold font-serif ${isDark ? "text-white" : "text-slate-900"}`}>
                  Staff Seats & Outlet Crew
                </h2>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
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
              <h3 className="text-sm font-bold uppercase tracking-wider font-mono mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: themeColor }} /> Authorized Back-Office Admins
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminsList.map((adm) => (
                  <div
                    key={adm.id}
                    className={`border rounded-2xl p-5 shadow-xl flex items-center justify-between ${
                      isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                    }`}
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
                        <div className={`font-semibold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                          {adm.name}
                        </div>
                        <div className="text-xs text-slate-400">{adm.email}</div>
                        <div
                          className="text-[10px] mt-1 uppercase font-mono font-medium"
                          style={{ color: themeColor }}
                        >
                          Role: {adm.role} • Status: {adm.status}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                      Authorized
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section B: Operating Floor & Kitchen Staff */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" /> Floor & Kitchen Crew ({staffList.length})
                </h3>

                {/* Filter */}
                <select
                  value={staffRoleFilter}
                  onChange={(e) => setStaffRoleFilter(e.target.value)}
                  className={`border rounded-xl px-3 py-1.5 text-xs ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-300 text-slate-900"
                  }`}
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
                    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
                    on_break: "bg-amber-500/10 text-amber-500 border-amber-500/30",
                    inactive: "bg-rose-500/10 text-rose-500 border-rose-500/30",
                  };

                  return (
                    <div
                      key={staff.id}
                      className={`border rounded-2xl p-4 shadow-xl flex flex-col justify-between transition ${
                        isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
                            {staff.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusColors[staff.status]}`}>
                            {staff.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className={`text-xs space-y-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          <div className="font-semibold" style={{ color: themeColor }}>
                            {staff.role}
                          </div>
                          <div>Phone: <span className="font-mono">{staff.phone}</span></div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span>Shift: <strong>{staff.shift}</strong></span>
                            <span>Floor: <strong>{staff.assigned_floor || "Ground"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className={`pt-3 mt-3 border-t flex items-center justify-between text-xs ${isDark ? "border-slate-800/80" : "border-slate-200"}`}>
                        <button
                          onClick={() => handleToggleStaffStatus(staff.id, staff.status)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] cursor-pointer ${
                            isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          Change Status
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id, staff.name)}
                          className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
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
                <div
                  className={`border rounded-2xl p-6 max-w-md w-full shadow-2xl ${
                    isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <h3 className="text-base font-bold flex items-center gap-2">
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
                      <label className="block text-xs font-medium mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={newStaff.name}
                        onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                        className={`w-full border rounded-xl px-3 py-2 text-sm ${
                          isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Operational Role</label>
                        <select
                          value={newStaff.role}
                          onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as any })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        >
                          <option value="Waiter">Waiter / Server</option>
                          <option value="Kitchen Chef">Kitchen Chef / Cook</option>
                          <option value="Cashier">Cashier & POS</option>
                          <option value="Floor Captain">Floor Captain</option>
                          <option value="Store Manager">Store Manager</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={newStaff.phone}
                          onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Shift</label>
                        <select
                          value={newStaff.shift}
                          onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value as any })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
                        >
                          <option value="Morning">Morning Shift (10 AM - 4 PM)</option>
                          <option value="Evening">Evening Shift (4 PM - 11:30 PM)</option>
                          <option value="Full Day">Full Day Shift</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium mb-1">Assigned Floor</label>
                        <select
                          value={newStaff.assigned_floor}
                          onChange={(e) => setNewStaff({ ...newStaff, assigned_floor: e.target.value })}
                          className={`w-full border rounded-xl px-3 py-2 text-sm ${
                            isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                          }`}
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
              <h2 className={`text-xl font-bold font-serif ${isDark ? "text-white" : "text-slate-900"}`}>
                Daily Register & Revenue Breakdown
              </h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                End-of-day register balancing and payment method analytics for {tenant.name}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="text-xs text-slate-400 mb-1">Gross Sales Today</div>
                <div className="text-2xl font-bold font-serif" style={{ color: themeColor }}>
                  ₹{totalRevenueToday.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-emerald-500 mt-1">↑ 18% vs yesterday</div>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="text-xs text-slate-400 mb-1">Total Tables Billed</div>
                <div className={`text-2xl font-bold font-mono ${isDark ? "text-white" : "text-slate-900"}`}>
                  {orders.length} Orders
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Average Turn Time: 42 mins</div>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
                }`}
              >
                <div className="text-xs text-slate-400 mb-1">Average Order Value (AOV)</div>
                <div className={`text-2xl font-bold font-mono ${isDark ? "text-white" : "text-slate-900"}`}>
                  ₹{orders.length > 0 ? Math.round(totalRevenueToday / orders.length) : 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Fine Dining Standard</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 7: ACCOUNT, PASSWORD, LIGHT/DARK & RGB THEME STUDIO   */}
        {/* ========================================================== */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className={`text-xl font-bold font-serif flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                  <SlidersHorizontal className="w-5 h-5" style={{ color: themeColor }} />
                  Account & Interface Settings
                </h2>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Toggle Light/Dark mode, personalize your RGB theme accent, change admin password, and update business details.
                </p>
              </div>

              {/* Current Active Theme Pill */}
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs shadow-sm ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <span className="text-slate-400">Current Theme:</span>
                <span
                  className="w-3.5 h-3.5 rounded-full ring-1 ring-white/50"
                  style={{ backgroundColor: themeColor }}
                />
                <span className={`font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  {themeColor.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  rgb({themeRgb.r}, {themeRgb.g}, {themeRgb.b})
                </span>
              </div>
            </div>

            {/* LIGHT THEME VS DARK THEME TOGGLE CARD */}
            <div
              className={`border rounded-2xl p-6 shadow-xl space-y-4 ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center transition-colors"
                    style={{
                      backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.15)`,
                      borderColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.35)`,
                      color: themeColor,
                    }}
                  >
                    {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Lighting Theme Mode
                    </h3>
                    <p className="text-xs text-slate-400">Choose between Midnight Dark Mode or Daylight Light Mode</p>
                  </div>
                </div>

                <span
                  className="text-xs font-mono font-bold uppercase px-3 py-1 rounded-full border"
                  style={{
                    backgroundColor: `rgba(${themeRgb.r}, ${themeRgb.g}, ${themeRgb.b}, 0.15)`,
                    borderColor: themeColor,
                    color: themeColor,
                  }}
                >
                  Active: {isDark ? "Dark Theme" : "Light Theme"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dark Mode Card */}
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode("dark");
                    if (typeof window !== "undefined") localStorage.setItem("clouddining_theme_mode", "dark");
                  }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                    isDark
                      ? "border-amber-400 bg-slate-950/80 shadow-lg ring-2 ring-amber-400/20"
                      : "border-slate-300 bg-slate-900 text-white hover:border-slate-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 border border-slate-800 flex items-center justify-center shrink-0">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Midnight Dark Theme</span>
                      {isDark && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Deep slate black canvas with warm ambient glow. Ideal for fine dining and evening services.
                    </p>
                  </div>
                </button>

                {/* Light Mode Card */}
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode("light");
                    if (typeof window !== "undefined") localStorage.setItem("clouddining_theme_mode", "light");
                  }}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3.5 ${
                    !isDark
                      ? "border-amber-500 bg-amber-50/50 shadow-lg ring-2 ring-amber-500/20"
                      : "border-slate-700 bg-white text-slate-900 hover:border-slate-600 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <div className={`text-sm font-bold flex items-center gap-2 ${!isDark ? "text-slate-900" : "text-slate-900"}`}>
                      <span>Daylight Light Theme</span>
                      {!isDark && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Crisp, high-contrast white & slate palette. Perfect for bright cashier desks and day bistros.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ============================================ */}
              {/* CARD 1: ADMIN SECURITY & PASSWORD CHANGE    */}
              {/* ============================================ */}
              <div
                className={`border rounded-2xl p-6 shadow-xl space-y-5 ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
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
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        Admin Account & Security
                      </h3>
                      <p className="text-xs text-slate-400">Change your login password</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {session.role}
                  </span>
                </div>

                {/* Logged in admin account identity badge */}
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    isDark ? "bg-slate-950/70 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Logged-in Administrator:</span>
                    <span className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{session.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Account Email:</span>
                    <span className="font-mono text-amber-500">{session.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Managed Outlet:</span>
                    <span className={isDark ? "text-slate-200" : "text-slate-800"}>{tenant.name}</span>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        required
                        placeholder="Enter current password (or voucher password)"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`w-full border rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-amber-400 ${
                          isDark
                            ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500"
                            : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                        }`}
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

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium">New Password</label>
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
                        className={`w-full border rounded-xl pl-3 pr-10 py-2.5 text-xs focus:outline-none focus:border-amber-400 ${
                          isDark
                            ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500"
                            : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {newPassword && (
                      <div className="mt-1.5 flex gap-1 h-1">
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-slate-800"}`} />
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-slate-800"}`} />
                        <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-slate-800"}`} />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-amber-400 ${
                        isDark
                          ? "bg-slate-950 border-slate-700 text-white placeholder-slate-500"
                          : "bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400"
                      }`}
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
              <div
                className={`border rounded-2xl p-6 shadow-xl space-y-5 ${
                  isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
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
                      <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                        RGB Interface Theme Studio
                      </h3>
                      <p className="text-xs text-slate-400">Select any color code via RGB sliders or hex</p>
                    </div>
                  </div>
                  <span
                    className="w-4 h-4 rounded-full ring-2 ring-white/60 shadow"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>

                {themeSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{themeSuccess}</span>
                  </div>
                )}

                {/* Live Color Input & Swatch Header */}
                <div
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}
                >
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
                        className={`w-24 border rounded-lg px-2 py-0.5 text-xs text-center font-mono font-bold uppercase focus:outline-none focus:border-amber-400 ${
                          isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 uppercase font-mono">RGB Value:</span>
                      <span className="font-mono font-semibold">
                        rgb({themeRgb.r}, {themeRgb.g}, {themeRgb.b})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 Interactive RGB Sliders */}
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-red-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" /> Red Channel (R)
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={255}
                        value={themeRgb.r}
                        onChange={(e) => handleRgbSlider("r", Number(e.target.value))}
                        className={`w-14 border rounded px-1.5 py-0.5 text-xs font-mono text-center ${
                          isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={themeRgb.r}
                      onChange={(e) => handleRgbSlider("r", Number(e.target.value))}
                      className="w-full accent-red-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-emerald-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Green Channel (G)
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={255}
                        value={themeRgb.g}
                        onChange={(e) => handleRgbSlider("g", Number(e.target.value))}
                        className={`w-14 border rounded px-1.5 py-0.5 text-xs font-mono text-center ${
                          isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={themeRgb.g}
                      onChange={(e) => handleRgbSlider("g", Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-blue-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> Blue Channel (B)
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={255}
                        value={themeRgb.b}
                        onChange={(e) => handleRgbSlider("b", Number(e.target.value))}
                        className={`w-14 border rounded px-1.5 py-0.5 text-xs font-mono text-center ${
                          isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={255}
                      value={themeRgb.b}
                      onChange={(e) => handleRgbSlider("b", Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-700 rounded-lg appearance-none"
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
                              ? "border-amber-400 bg-slate-800 shadow-lg scale-105"
                              : isDark
                              ? "border-slate-800 bg-slate-950 hover:border-slate-700"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full shadow" style={{ backgroundColor: th.hex }} />
                          <span className="text-[9px] font-medium truncate w-full">{th.name.split(" ")[0]}</span>
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
                    <span>Live Theme Preview:</span>
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

            {/* CARD 3: RESTAURANT PROFILE & BUSINESS DETAILS */}
            <div
              className={`border rounded-2xl p-6 shadow-xl space-y-5 ${
                isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
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
                    <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      Restaurant Profile & Commercial Identity
                    </h3>
                    <p className="text-xs text-slate-400">Configure outlet display name, tagline, address & GSTIN</p>
                  </div>
                </div>
              </div>

              {profileSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Restaurant Display Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs ${
                        isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">Tagline / Brand Slogan</label>
                    <input
                      type="text"
                      placeholder="e.g. Authentic Rayalaseema & Coastal Cuisine"
                      value={profileTagline}
                      onChange={(e) => setProfileTagline(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs ${
                        isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-mono ${
                        isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">City / Region</label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs ${
                        isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">GSTIN / Tax ID</label>
                    <input
                      type="text"
                      placeholder="37ABCDE1234F1Z5"
                      value={profileGstin}
                      onChange={(e) => setProfileGstin(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-mono uppercase ${
                        isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Full Street Address</label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs ${
                      isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Service Charge %</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={profileServiceCharge}
                      onChange={(e) => setProfileServiceCharge(Number(e.target.value))}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-mono ${
                        isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1">GST %</label>
                    <input
                      type="number"
                      min={0}
                      max={28}
                      value={profileGst}
                      onChange={(e) => setProfileGst(Number(e.target.value))}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-mono ${
                        isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border ${
                    isDark
                      ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300"
                  }`}
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
