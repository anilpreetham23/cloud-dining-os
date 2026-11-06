"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  UtensilsCrossed,
  ChefHat,
  ShoppingBag,
  Check,
  Plus,
  Minus,
  Sparkles,
  Clock,
  ArrowRight,
  Store,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import {
  getStoredTenants,
  getRestaurantMenu,
  createGuestOrder,
} from "@/lib/tenantStore";
import { TenantRestaurant, RestaurantMenuItem } from "@/lib/types";

function GuestOrderContent() {
  const searchParams = useSearchParams();
  const restParam = searchParams.get("restaurant") || searchParams.get("rest") || "";
  const tableParam = searchParams.get("table") || "1";

  const [tenant, setTenant] = useState<TenantRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<RestaurantMenuItem[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [guestName, setGuestName] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<{ orderNumber: string; total: number } | null>(null);

  useEffect(() => {
    const tenants = getStoredTenants();
    const found =
      tenants.find((t) => t.id === restParam || t.slug === restParam) ||
      tenants[1] ||
      tenants[0];
    if (found) {
      setTenant(found);
      setMenuItems(getRestaurantMenu(found.id));
    }
  }, [restParam]);

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#070c16] flex items-center justify-center text-slate-400 font-mono text-sm">
        Locating Dining Table...
      </div>
    );
  }

  const themeColor = tenant.brand_color || "#D4AF37";

  const categories = [
    "all",
    ...Array.from(new Set(menuItems.map((m) => m.category))),
  ];

  const filteredItems = menuItems.filter((item) => {
    if (selectedCat === "all") return true;
    return item.category === selectedCat;
  });

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

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    const items = cartItems.map((c) => ({
      id: c.id,
      name: c.name,
      price: c.price,
      quantity: c.quantity,
    }));

    const order = createGuestOrder(
      tenant.id,
      Number(tableParam),
      guestName.trim() || `Table ${tableParam} Guest`,
      items
    );

    setPlacedOrder({ orderNumber: order.order_number, total: order.total });
    setCart({});
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3.5 shadow-xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg text-slate-950 shadow-md ring-1 ring-white/20"
              style={{ backgroundColor: themeColor }}
            >
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white font-serif leading-tight">{tenant.name}</h1>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>{tenant.city}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Kitchen Open
                </span>
              </div>
            </div>
          </div>

          {/* Table Badge */}
          <div
            className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-md"
            style={{
              backgroundColor: `rgba(212, 175, 55, 0.1)`,
              borderColor: themeColor,
            }}
          >
            <span className="text-[10px] text-slate-400 uppercase font-mono">Table</span>
            <span className="font-mono font-black text-sm text-white" style={{ color: themeColor }}>
              #{tableParam}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 pb-28 space-y-5">
        {/* Placed Order Success Banner */}
        {placedOrder && (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 shadow-xl space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Order Sent to Kitchen!</h2>
            </div>
            <p className="text-xs text-slate-300">
              Your ticket <strong className="font-mono text-amber-300">#{placedOrder.orderNumber}</strong> has been received at the Kitchen Display Screen (KDS) for Table {tableParam}. Chefs are now preparing your feast!
            </p>
            <div className="pt-2 flex items-center justify-between text-xs font-mono text-emerald-400 border-t border-emerald-500/20">
              <span>Billed Total: ₹{placedOrder.total}</span>
              <button
                onClick={() => setPlacedOrder(null)}
                className="underline hover:text-white cursor-pointer"
              >
                Order More Items
              </button>
            </div>
          </div>
        )}

        {/* Hero Welcome Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono border"
                style={{
                  backgroundColor: `rgba(212, 175, 55, 0.1)`,
                  borderColor: themeColor,
                  color: themeColor,
                }}
              >
                Digital Dining Pass
              </span>
              <h2 className="text-xl font-bold font-serif text-white mt-2">Welcome to Table {tableParam}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Browse our curated menu, customize dishes, and order directly from your smartphone.
              </p>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const isSelected = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                style={
                  isSelected
                    ? { backgroundColor: themeColor, color: "#060a12" }
                    : {}
                }
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize shrink-0 transition cursor-pointer ${
                  isSelected
                    ? "font-bold shadow-md"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {cat === "all" ? "All Specialties" : cat}
              </button>
            );
          })}
        </div>

        {/* Dishes List */}
        <div className="space-y-3">
          {filteredItems.map((dish) => {
            const qtyInCart = cart[dish.id] || 0;

            return (
              <div
                key={dish.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md flex items-start justify-between gap-3 hover:border-slate-700 transition"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        dish.dietary === "veg" ? "bg-emerald-400" : "bg-red-400"
                      }`}
                      title={dish.dietary === "veg" ? "Vegetarian" : "Non-Vegetarian"}
                    />
                    <h3 className="text-sm font-bold text-white">{dish.name}</h3>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{dish.description}</p>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="font-mono font-bold text-sm" style={{ color: themeColor }}>
                      ₹{dish.price}
                    </span>
                    {dish.prep_time_minutes && (
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> {dish.prep_time_minutes} mins
                      </span>
                    )}
                  </div>
                </div>

                {/* Add / Adjust Controls */}
                <div className="shrink-0 self-center">
                  {!dish.is_available ? (
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      Sold Out
                    </span>
                  ) : qtyInCart === 0 ? (
                    <button
                      onClick={() => addToCart(dish.id)}
                      style={{
                        backgroundColor: `rgba(212, 175, 55, 0.15)`,
                        borderColor: themeColor,
                        color: themeColor,
                      }}
                      className="px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 hover:brightness-125 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      <button
                        onClick={() => removeFromCart(dish.id)}
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-mono font-bold text-xs text-white">
                        {qtyInCart}
                      </span>
                      <button
                        onClick={() => addToCart(dish.id)}
                        style={{ backgroundColor: themeColor }}
                        className="w-7 h-7 rounded-lg text-slate-950 flex items-center justify-center font-bold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-3 shadow-2xl">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-400">
                Table {tableParam} • {totalItemCount} items selected
              </div>
              <div className="text-lg font-bold font-serif" style={{ color: themeColor }}>
                ₹{cartTotal.toLocaleString("en-IN")}
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              style={{ backgroundColor: themeColor }}
              className="px-5 py-2.5 rounded-xl text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg cursor-pointer hover:brightness-110"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Review Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Review Cart Drawer / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white font-serif">Table #{tableParam} Dining Order</h3>
                <p className="text-xs text-slate-400">Confirm dishes to send straight to the kitchen</p>
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

              <div className="pt-4 space-y-2">
                <label className="block text-xs font-medium text-slate-300">
                  Guest Name / Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh • Medium spicy, extra lemons"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Order Calculation */}
              <div className="pt-4 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST & Service Charge</span>
                  <span className="font-mono text-emerald-400">Included</span>
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
                onClick={handlePlaceOrder}
                style={{ backgroundColor: themeColor }}
                className="w-full py-3 rounded-xl text-slate-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-xl hover:brightness-110 cursor-pointer"
              >
                <ChefHat className="w-4 h-4" />
                <span>Fire Order to Kitchen (Table #{tableParam})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuestOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#060a12] flex items-center justify-center text-slate-400 font-mono text-sm">
          Loading Table Menu...
        </div>
      }
    >
      <GuestOrderContent />
    </Suspense>
  );
}
