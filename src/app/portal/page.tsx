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
} from "lucide-react";
import {
  getActiveSession,
  clearActiveSession,
  getStoredTenants,
  getStoredAdmins,
  getRestaurantOrders,
  updateOrderStatus,
  getRestaurantTables,
  updateTableStatus,
  getRestaurantMenu,
  toggleMenuItemAvailability,
  updateMenuItemPrice,
} from "@/lib/tenantStore";
import {
  UserSession,
  TenantRestaurant,
  AdminAccount,
  RestaurantOrder,
  RestaurantTable,
  RestaurantMenuItem,
} from "@/lib/types";

export default function RestaurantAdminPortal() {
  const router = useRouter();

  // Session state
  const [session, setSession] = useState<UserSession | null>(null);
  const [tenant, setTenant] = useState<TenantRestaurant | null>(null);
  const [adminsList, setAdminsList] = useState<AdminAccount[]>([]);

  // Active Tab: orders | kds | tables | menu | staff | sales
  const [activeTab, setActiveTab] = useState<"orders" | "kds" | "tables" | "menu" | "staff" | "sales">("orders");

  // Operational states
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [menuItems, setMenuItems] = useState<RestaurantMenuItem[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [menuSearch, setMenuSearch] = useState<string>("");
  const [menuCatFilter, setMenuCatFilter] = useState<string>("all");

  // Edit price modal state
  const [editingPriceItem, setEditingPriceItem] = useState<{ id: string; name: string; price: number } | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<number>(0);

  // Load session & restaurant data
  useEffect(() => {
    const active = getActiveSession();
    if (!active) {
      router.replace("/login");
      return;
    }
    setSession(active);

    const tenants = getStoredTenants();
    // If restaurant admin, find their restaurant. If super admin in preview, use assigned restaurant or first one.
    const restId = active.restaurantId || tenants[1]?.id || tenants[0]?.id;
    const foundTenant = tenants.find((t) => t.id === restId) || tenants[1];
    setTenant(foundTenant);

    if (foundTenant) {
      const allAdmins = getStoredAdmins();
      setAdminsList(allAdmins.filter((a) => a.restaurant_id === foundTenant.id));
      loadRestaurantData(foundTenant.id);
    }
  }, [router]);

  const loadRestaurantData = (restId: string) => {
    setOrders(getRestaurantOrders(restId));
    setTables(getRestaurantTables(restId));
    setMenuItems(getRestaurantMenu(restId));
  };

  const handleStatusChange = (orderId: string, newStatus: RestaurantOrder["status"]) => {
    updateOrderStatus(orderId, newStatus);
    if (tenant) {
      setOrders(getRestaurantOrders(tenant.id));
    }
  };

  const handleTableStatus = (tableId: string, newStatus: RestaurantTable["status"]) => {
    updateTableStatus(tableId, newStatus);
    if (tenant) {
      setTables(getRestaurantTables(tenant.id));
    }
  };

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

  const handleLogout = () => {
    clearActiveSession();
    router.replace("/login");
  };

  const handleExitPreview = () => {
    if (session?.isSuperAdminPreview) {
      // Revert back to Super Admin session
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

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "all") return true;
    return o.status === orderFilter;
  });

  // Filtered menu
  const filteredMenu = menuItems.filter((item) => {
    const matchesCat = menuCatFilter === "all" || item.category === menuCatFilter;
    const matchesQuery = item.name.toLowerCase().includes(menuSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Today's summary stats
  const totalRevenueToday = orders.reduce((acc, o) => acc + o.total, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== "paid").length;
  const occupiedTablesCount = tables.filter((t) => t.status === "occupied").length;

  return (
    <div className="min-h-screen bg-[#070c16] text-slate-100 flex flex-col font-sans">
      {/* Super Admin Preview Alert Banner */}
      {session.isSuperAdminPreview && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>
              SUPER ADMIN VIEW: Bobby (Platform Head) is inspecting{" "}
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
          {/* Restaurant Profile */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold text-xl shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg font-bold text-white font-serif tracking-tight">{tenant.name}</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Outlet
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{tenant.city}</span>
                <span>•</span>
                <span className="text-amber-400 font-medium">Logged in as {session.name}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Today&apos;s Billed:</span>
              <span className="font-bold text-amber-400">₹{totalRevenueToday.toLocaleString("en-IN")}</span>
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

      {/* Navigation Sub-Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "orders", label: "Live Orders & Billing", icon: Receipt, badge: activeOrdersCount },
            { id: "kds", label: "Kitchen Display (KDS)", icon: ChefHat, badge: orders.filter((o) => o.status === "preparing").length },
            { id: "tables", label: "Floor & Table Grid", icon: LayoutGrid, badge: `${occupiedTablesCount}/${tables.length}` },
            { id: "menu", label: "Menu & Stock Availability", icon: UtensilsCrossed },
            { id: "staff", label: "Admin & Staff Seats", icon: Users, badge: adminsList.length },
            { id: "sales", label: "Today's Sales & Register", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition cursor-pointer ${
                  isActive
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? "bg-slate-950 text-amber-300" : "bg-slate-800 text-slate-300 border border-slate-700"
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
                {["all", "new", "preparing", "ready", "served", "paid"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-medium transition cursor-pointer ${
                      orderFilter === st
                        ? "bg-amber-400 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
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
                            <span className="font-mono text-xs font-bold text-amber-400">
                              #{order.order_number}
                            </span>
                            <div className="text-sm font-bold text-white mt-0.5">
                              Table {order.table_number} • {order.customer_name}
                            </div>
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
                                <strong className="text-amber-400 mr-1.5">{item.quantity}x</strong>
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
                          <span className="font-serif font-bold text-amber-400 text-base">
                            ₹{order.total.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* State transitions */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {order.status === "new" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "preparing")}
                              className="col-span-2 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <ChefHat className="w-4 h-4" />
                              Send to Kitchen
                            </button>
                          )}
                          {order.status === "preparing" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "ready")}
                              className="col-span-2 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Mark Ready to Serve
                            </button>
                          )}
                          {order.status === "ready" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "served")}
                              className="col-span-2 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <UtensilsCrossed className="w-4 h-4" />
                              Mark Served at Table
                            </button>
                          )}
                          {order.status === "served" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "paid")}
                              className="col-span-2 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Receipt className="w-4 h-4" />
                              Settle & Print Bill
                            </button>
                          )}
                          {order.status === "paid" && (
                            <div className="col-span-2 py-1.5 text-center text-xs font-semibold text-slate-500 bg-slate-950 rounded-xl">
                              Bill Settled ({order.payment_method || "UPI"})
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
        {/* TAB 2: KITCHEN DISPLAY SYSTEM (KDS)                         */}
        {/* ========================================================== */}
        {activeTab === "kds" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-amber-400" />
                  Live Kitchen KDS Screen
                </h2>
                <p className="text-xs text-slate-400">
                  Cook-friendly real-time ticket display for head chef and station leads.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>Station 1: Biryani & Tandoor Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {orders
                .filter((o) => o.status === "new" || o.status === "preparing")
                .map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black font-mono text-amber-400">
                            T-{order.table_number}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">#{order.order_number}</span>
                        </div>
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500/20 text-amber-300">
                          {order.created_at}
                        </span>
                      </div>

                      <div className="space-y-3 py-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-sm"
                          >
                            <span className="font-semibold text-white">
                              <span className="text-amber-400 font-bold mr-2 text-base">{item.quantity}x</span>
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
        {/* TAB 3: FLOOR & TABLE GRID                                  */}
        {/* ========================================================== */}
        {activeTab === "tables" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white">Dining Floor & Table Grid</h2>
                <p className="text-xs text-slate-400">
                  Live occupancy, seating capacity, and table billing status.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
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
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
              {tables.map((tbl) => {
                const borderMap: Record<string, string> = {
                  available: "border-emerald-500/30 bg-emerald-950/10",
                  occupied: "border-rose-500/40 bg-rose-950/20",
                  reserved: "border-amber-500/30 bg-amber-950/10",
                };
                const badgeMap: Record<string, string> = {
                  available: "bg-emerald-500/20 text-emerald-400",
                  occupied: "bg-rose-500/20 text-rose-300 font-bold",
                  reserved: "bg-amber-500/20 text-amber-300",
                };

                return (
                  <div
                    key={tbl.id}
                    className={`rounded-2xl border p-4 shadow-lg flex flex-col justify-between transition ${
                      borderMap[tbl.status]
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-xl font-black text-white">
                          Table {tbl.table_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase ${badgeMap[tbl.status]}`}>
                          {tbl.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        Capacity: {tbl.capacity} Pax
                        {tbl.guests_count && <span> • {tbl.guests_count} Guests seated</span>}
                      </div>
                      {tbl.occupied_since && (
                        <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Seated {tbl.occupied_since}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-800/60 grid grid-cols-2 gap-1.5 text-[11px]">
                      {tbl.status === "available" ? (
                        <button
                          onClick={() => handleTableStatus(tbl.id, "occupied")}
                          className="col-span-2 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold cursor-pointer"
                        >
                          Seat Walk-In
                        </button>
                      ) : (
                        <button
                          onClick={() => handleTableStatus(tbl.id, "available")}
                          className="col-span-2 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold cursor-pointer"
                        >
                          Clear & Reset Table
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 4: MENU & STOCK MANAGEMENT                             */}
        {/* ========================================================== */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold font-serif text-white">Menu & Live Inventory Controls</h2>
                <p className="text-xs text-slate-400">
                  Toggle items in-stock or 86&apos;d (sold out) and adjust live pricing instantly.
                </p>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search dish..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={menuCatFilter}
                  onChange={(e) => setMenuCatFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Categories</option>
                  <option value="Starters">Starters</option>
                  <option value="Biryanis & Rice">Biryanis & Rice</option>
                  <option value="Main Curries">Main Curries</option>
                  <option value="Breads">Breads</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>
            </div>

            {/* Menu Items Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Dish Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Price (INR)</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4 text-right">Quick Action</th>
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
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 text-sm">
                        ₹{item.price}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.is_available ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Available in Kitchen
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            86&apos;d / Sold Out
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStock(item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
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
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                        >
                          Edit Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                      className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: STAFF & ADMIN SEATS                                 */}
        {/* ========================================================== */}
        {activeTab === "staff" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold font-serif text-white">Active Restaurant Admins</h2>
              <p className="text-xs text-slate-400">
                Staff accounts authorized to access {tenant.name}&apos;s back-office console.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminsList.map((adm) => (
                <div
                  key={adm.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold font-serif">
                      {adm.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{adm.name}</div>
                      <div className="text-xs text-slate-400">{adm.email}</div>
                      <div className="text-[10px] text-amber-400/80 mt-1 uppercase font-mono">
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

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-3">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Need new Admin Logins or Password Resets?</strong>
                <p className="text-amber-300/80 mt-0.5">
                  Platform credential creation is managed centrally by Bobby (Platform Super Admin). Request your
                  store manager to contact Bobby or support@clouddining.com to issue additional seat vouchers.
                </p>
              </div>
            </div>
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
                <div className="text-2xl font-bold font-serif text-amber-400">
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
      </main>
    </div>
  );
}
