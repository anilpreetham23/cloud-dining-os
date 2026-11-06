"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  UtensilsCrossed,
  ChefHat,
  ShoppingBag,
  Check,
  Plus,
  Minus,
  Clock,
  ArrowRight,
  Store,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  MapPin,
  Phone,
  Star,
  ExternalLink,
  QrCode,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag as BagIcon,
} from "lucide-react";
import {
  getStoredTenants,
  getRestaurantMenu,
  createTakeawayOrder,
} from "@/lib/tenantStore";
import { TenantRestaurant, RestaurantMenuItem, RestaurantOrder } from "@/lib/types";

function CustomerMarketplaceContent() {
  const searchParams = useSearchParams();
  const initialRestSlug = searchParams.get("restaurant") || "";

  const [tenants, setTenants] = useState<TenantRestaurant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<RestaurantMenuItem[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Cart State
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [cookingNotes, setCookingNotes] = useState<string>("");
  const [placedOrder, setPlacedOrder] = useState<RestaurantOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    const list = getStoredTenants();
    setTenants(list);

    if (initialRestSlug) {
      const target = list.find((t) => t.id === initialRestSlug || t.slug === initialRestSlug);
      if (target) {
        handleSelectRestaurant(target);
      }
    }
  }, [initialRestSlug]);

  const handleSelectRestaurant = (tenant: TenantRestaurant) => {
    setSelectedTenant(tenant);
    setMenuItems(getRestaurantMenu(tenant.id));
    setCart({});
    setSelectedCategory("all");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToDirectory = () => {
    setSelectedTenant(null);
    setCart({});
    setPlacedOrder(null);
  };

  const cities = ["all", ...Array.from(new Set(tenants.map((t) => t.city.split(",")[0].trim())))];

  // Filtering Restaurants
  const filteredTenants = tenants.filter((t) => {
    const matchesCity = selectedCity === "all" || t.city.toLowerCase().includes(selectedCity.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tagline && t.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCity && matchesSearch;
  });

  // Cart Handlers
  const addToCart = (itemId: string) => {
    setCart((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      if (next[itemId] > 1) {
        next[itemId] -= 1;
      } else {
        delete next[itemId];
      }
      return next;
    });
  };

  const cartItemIds = Object.keys(cart);
  const cartItems = cartItemIds
    .map((id) => {
      const item = menuItems.find((m) => m.id === id);
      return item ? { ...item, quantity: cart[id] } : null;
    })
    .filter(Boolean) as (RestaurantMenuItem & { quantity: number })[];

  const cartSubtotal = cartItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const gstAmount = Math.round(cartSubtotal * 0.05);
  const cartTotal = cartSubtotal + gstAmount;
  const totalItemCount = cartItems.reduce((sum, it) => sum + it.quantity, 0);

  const handleConfirmTakeawayOrder = async () => {
    if (!selectedTenant || cartItems.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please provide your Name and Mobile Phone Number for the takeaway pickup ticket.");
      return;
    }

    setIsSubmitting(true);
    try {
      const items = cartItems.map((c) => ({
        id: c.id,
        name: c.name,
        price: c.price,
        quantity: c.quantity,
      }));

      const order = createTakeawayOrder(
        selectedTenant.id,
        customerName.trim(),
        customerPhone.trim(),
        items,
        cookingNotes.trim()
      );

      setPlacedOrder(order);
      setCart({});
      setIsCartOpen(false);
    } catch (e) {
      console.error("Order submission failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    "all",
    ...Array.from(new Set(menuItems.map((m) => m.category))),
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchesDiet =
      dietaryFilter === "all" ||
      (dietaryFilter === "veg" && item.dietary === "veg") ||
      (dietaryFilter === "non-veg" && item.dietary === "non-veg");
    const matchesDishSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesDiet && matchesDishSearch;
  });

  const themeColor = selectedTenant?.brand_color || "#D4AF37";

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Global Customer Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              onClick={handleBackToDirectory}
              className="flex items-center gap-2.5 text-white group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold font-serif tracking-tight text-white block leading-tight">
                  CloudDining
                </span>
                <span className="text-[10px] text-amber-400 font-mono tracking-widest uppercase block">
                  Customer Portal &amp; Marketplace
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Link to Back Office for Admins */}
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition"
            >
              <span>Back-Office Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Cart Trigger Button */}
            {selectedTenant && totalItemCount > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                style={{ backgroundColor: themeColor }}
                className="px-3.5 py-1.5 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/10 hover:brightness-110 cursor-pointer animate-pulse"
              >
                <BagIcon className="w-4 h-4" />
                <span>{totalItemCount} Items</span>
                <span>•</span>
                <span>₹{cartTotal}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main View Area */}
      {!selectedTenant ? (
        /* ============================================================ */
        /* VIEW 1: MULTI-RESTAURANT DISCOVERY DIRECTORY               */
        /* ============================================================ */
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 space-y-8">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-3">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Multi-Tenant Dining &amp; Takeaway Network
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white font-serif leading-tight">
                Order Takeaway or Scan at the Table from Leading Outlets
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Browse official partner menus, order self-pickup takeaway food, or scan the unique table QR code when dining in-person.
              </p>
            </div>

            {/* Quick Search & City Filters Bar */}
            <div className="relative z-10 mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search restaurants, dishes, cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* City Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <span className="text-[11px] text-slate-400 uppercase font-mono mr-1">City:</span>
                {cities.map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setSelectedCity(ct)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium capitalize transition cursor-pointer ${
                      selectedCity === ct
                        ? "bg-amber-400 text-slate-950 font-bold shadow-md"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {ct}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Restaurant Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-serif text-white">Partner Restaurants</h2>
                <p className="text-xs text-slate-400">
                  Select an outlet to order online takeaway or view its in-person table menu.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                {filteredTenants.length} Outlets Live
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenants.map((tenant) => {
                const restColor = tenant.brand_color || "#D4AF37";
                return (
                  <div
                    key={tenant.id}
                    className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header Strip */}
                      <div
                        className="h-3 w-full"
                        style={{ backgroundColor: restColor }}
                      />

                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Accepting Takeaway
                            </span>
                            <h3 className="text-lg font-bold text-white font-serif mt-1.5 group-hover:text-amber-400 transition">
                              {tenant.name}
                            </h3>
                          </div>
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 shadow-md shrink-0"
                            style={{ backgroundColor: restColor }}
                          >
                            <Store className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Location & Details */}
                        <div className="space-y-1.5 text-xs text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{tenant.address || tenant.city}</span>
                          </div>
                          {tenant.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{tenant.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-amber-400" /> 4.9
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> 20-25m Prep
                            </span>
                          </div>
                        </div>

                        {tenant.tagline && (
                          <p className="text-xs text-slate-400 italic line-clamp-2 pt-1 border-t border-slate-800">
                            &quot;{tenant.tagline}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Dual Action Buttons */}
                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSelectRestaurant(tenant)}
                        style={{ backgroundColor: restColor }}
                        className="w-full py-2.5 rounded-xl text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 transition cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order Takeaway</span>
                      </button>

                      <Link
                        href={`/order?restaurant=${tenant.id}&table=1`}
                        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-400" />
                        <span>Table QR Dine-In</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      ) : (
        /* ============================================================ */
        /* VIEW 2: SPECIFIC RESTAURANT MENU & TAKEAWAY ORDERING        */
        /* ============================================================ */
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 pb-28 space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToDirectory}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl cursor-pointer transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Restaurants</span>
            </button>

            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Direct Kitchen Sync Active
            </span>
          </div>

          {/* Restaurant Brand Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <div
              className="absolute top-0 left-0 right-0 h-2.5"
              style={{ backgroundColor: themeColor }}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg shrink-0"
                  style={{ backgroundColor: themeColor }}
                >
                  <Store className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
                      {selectedTenant.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400 text-slate-950">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedTenant.address || selectedTenant.city}</span>
                    <span>•</span>
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedTenant.phone}</span>
                  </p>
                  {selectedTenant.tagline && (
                    <p className="text-xs text-slate-400 italic">
                      &quot;{selectedTenant.tagline}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Order Mode Badge */}
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex sm:flex-col items-center justify-between gap-1 text-right">
                <span className="text-[10px] uppercase font-mono text-slate-400">Order Mode</span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" /> Takeaway &amp; Pickup
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Ready in 20-25m</span>
              </div>
            </div>
          </div>

          {/* Placed Order Success Modal */}
          {placedOrder && (
            <div className="p-6 rounded-3xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Takeaway Order Received!
                    </h3>
                    <p className="text-xs text-emerald-300">
                      Sent directly to {selectedTenant.name}&apos;s Back-Office &amp; Kitchen Display.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPlacedOrder(null)}
                  className="p-1 rounded-lg hover:bg-emerald-900/50 text-emerald-400 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Order Ticket</span>
                  <span className="font-mono text-base font-bold text-amber-400">
                    #{placedOrder.order_number}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Customer</span>
                  <span className="font-bold text-white truncate block">
                    {placedOrder.customer_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Total Billed</span>
                  <span className="font-mono font-bold text-white">
                    ₹{placedOrder.total}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono">Pickup ETA</span>
                  <span className="font-bold text-emerald-400">
                    ~25 Minutes
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1">
                <p className="text-slate-300 text-xs">
                  📍 Pickup address: <strong className="text-white">{selectedTenant.address || selectedTenant.city}</strong>
                </p>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setPlacedOrder(null)}
                    style={{ backgroundColor: themeColor }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-950 font-bold text-xs hover:brightness-110 cursor-pointer shadow-md"
                  >
                    Place Another Order
                  </button>
                  <button
                    onClick={handleBackToDirectory}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs cursor-pointer"
                  >
                    Browse Other Restaurants
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Category Tabs & Dietary Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5">
                {categories.map((cat) => {
                  const isSel = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={isSel ? { backgroundColor: themeColor, color: "#060a12" } : {}}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition cursor-pointer ${
                        isSel
                          ? "font-bold shadow-md"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Dietary Filter */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setDietaryFilter("all")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    dietaryFilter === "all" ? "bg-slate-800 text-white font-bold" : "text-slate-400"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDietaryFilter("veg")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                    dietaryFilter === "veg" ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-slate-400"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Veg
                </button>
                <button
                  onClick={() => setDietaryFilter("non-veg")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 cursor-pointer ${
                    dietaryFilter === "non-veg" ? "bg-red-500/20 text-red-400 font-bold" : "text-slate-400"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  Non-Veg
                </button>
              </div>
            </div>
          </div>

          {/* Dishes List */}
          <div className="space-y-3">
            {filteredMenuItems.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500">
                <ChefHat className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-medium">No dishes match the selected filter.</p>
              </div>
            ) : (
              filteredMenuItems.map((item) => {
                const qty = cart[item.id] || 0;
                const isVeg = item.dietary === "veg";

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-4 transition shadow-md"
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        {/* Veg / Non-Veg Indicator */}
                        <div
                          className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center p-0.5 ${
                            isVeg ? "border-emerald-500" : "border-red-500"
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              isVeg ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                        </div>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                      <div className="font-mono text-sm font-bold text-amber-300">
                        ₹{item.price}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="shrink-0">
                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(item.id)}
                          style={{ backgroundColor: themeColor }}
                          className="px-4 py-2 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 cursor-pointer transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 p-1 rounded-xl">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold w-6 text-center text-white">
                            {qty}
                          </span>
                          <button
                            onClick={() => addToCart(item.id)}
                            style={{ backgroundColor: themeColor }}
                            className="w-7 h-7 rounded-lg text-slate-950 font-bold flex items-center justify-center hover:brightness-110 cursor-pointer transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      )}

      {/* Floating Bottom Cart Bar for Active Outlet */}
      {selectedTenant && totalItemCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
          <button
            onClick={() => setIsCartOpen(true)}
            style={{ backgroundColor: themeColor }}
            className="w-full p-4 rounded-2xl text-slate-950 font-bold shadow-2xl flex items-center justify-between hover:brightness-105 transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-950/20 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs uppercase font-mono block leading-none">
                  Takeaway Cart
                </span>
                <span className="text-sm font-bold">
                  {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base">₹{cartTotal}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Slide-Over / Modal */}
      {isCartOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  Takeaway Order • {selectedTenant.name}
                </h3>
                <p className="text-xs text-slate-400">Self-pickup order sent straight to kitchen</p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-slate-800/60">
              {cartItems.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">
                      ₹{item.price} x {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item.id)}
                      style={{ backgroundColor: themeColor }}
                      className="w-6 h-6 rounded-md text-slate-950 flex items-center justify-center text-xs font-bold"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Customer Contact & Pickup Details */}
              <div className="pt-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Your Full Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh Reddy"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Mobile Phone (For Pickup SMS Alert) <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Cooking Instructions / Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra spicy, pack raita separately"
                    value={cookingNotes}
                    onChange={(e) => setCookingNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Billing Summary */}
              <div className="pt-4 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (5%)</span>
                  <span className="font-mono text-slate-300">₹{gstAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Takeaway Packaging Fee</span>
                  <span className="font-mono text-emerald-400 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Grand Total</span>
                  <span className="font-serif font-bold text-base" style={{ color: themeColor }}>
                    ₹{cartTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80">
              <button
                disabled={isSubmitting}
                onClick={handleConfirmTakeawayOrder}
                style={{ backgroundColor: themeColor }}
                className="w-full py-3.5 rounded-xl text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-xl hover:brightness-110 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Transmitting to Kitchen...</span>
                ) : (
                  <>
                    <ChefHat className="w-4 h-4" />
                    <span>Confirm &amp; Place Takeaway Order (₹{cartTotal})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerMarketplacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060a12] flex items-center justify-center text-slate-400 font-mono text-sm">
          Loading CloudDining Marketplace...
        </div>
      }
    >
      <CustomerMarketplaceContent />
    </Suspense>
  );
}
