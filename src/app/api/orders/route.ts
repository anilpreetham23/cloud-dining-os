import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Global in-memory cache shared across API calls on the server
interface CloudOrderRecord {
  id: string;
  restaurant_id: string;
  order_number: string;
  table_number: number;
  floor?: string;
  customer_name: string;
  customer_phone?: string;
  order_type: "dine_in" | "takeaway";
  source: "qr_scan" | "customer_portal" | "pos";
  notes?: string;
  estimated_pickup_minutes?: number;
  items: { id?: string; name: string; price: number; quantity: number }[];
  total: number;
  status: "new" | "preparing" | "ready" | "served" | "paid";
  created_at: string;
  timestamp: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __clouddining_orders: CloudOrderRecord[] | undefined;
}

if (!globalThis.__clouddining_orders) {
  globalThis.__clouddining_orders = [];
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurant_id");
  const since = searchParams.get("since") ? Number(searchParams.get("since")) : 0;

  const allOrders = globalThis.__clouddining_orders || [];

  let filtered = allOrders;
  if (restaurantId) {
    filtered = filtered.filter((o) => o.restaurant_id === restaurantId);
  }
  if (since > 0) {
    filtered = filtered.filter((o) => o.timestamp > since);
  }

  return NextResponse.json(
    {
      success: true,
      orders: filtered,
      total_count: (globalThis.__clouddining_orders || []).length,
      server_time: Date.now(),
    },
    { headers: CORS_HEADERS }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      restaurant_id,
      table_number,
      floor,
      customer_name,
      customer_phone,
      order_type = "dine_in",
      source,
      notes = "",
      items = [],
      total,
    } = body;

    if (!restaurant_id || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing restaurant_id or items" },
        { status: 400 }
      );
    }

    const calculatedTotal =
      total !== undefined
        ? total
        : items.reduce(
            (sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1),
            0
          );

    const randomNum = Math.floor(100 + Math.random() * 900).toString();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newOrder: CloudOrderRecord = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      restaurant_id,
      order_number: randomNum,
      table_number: order_type === "takeaway" ? 0 : Number(table_number || 1),
      floor: floor || (order_type === "takeaway" ? "Takeaway Counter" : "Ground Floor"),
      customer_name: customer_name || (order_type === "takeaway" ? "Takeaway Guest" : `Table ${table_number || 1} Guest`),
      customer_phone: customer_phone || "",
      order_type: order_type === "takeaway" ? "takeaway" : "dine_in",
      source: source || (order_type === "takeaway" ? "customer_portal" : "qr_scan"),
      notes: notes || "",
      estimated_pickup_minutes: order_type === "takeaway" ? 25 : undefined,
      items: items.map((it: any) => ({
        id: it.id || it.name,
        name: it.name || it.title || "Dish Item",
        price: Number(it.price || 0),
        quantity: Number(it.quantity || it.qty || 1),
      })),
      total: calculatedTotal,
      status: "new",
      created_at: timeStr,
      timestamp: Date.now(),
    };

    // Store in global memory so any polling client gets it immediately
    if (!globalThis.__clouddining_orders) {
      globalThis.__clouddining_orders = [];
    }
    globalThis.__clouddining_orders.unshift(newOrder);

    // Keep server memory capped at last 500 orders
    if (globalThis.__clouddining_orders.length > 500) {
      globalThis.__clouddining_orders = globalThis.__clouddining_orders.slice(0, 500);
    }

    // Try Supabase RPC sync in background (non-blocking)
    try {
      const p_items = items.map((it: any) => ({
        id: it.id || it.name,
        title: it.name || it.title || "Dish Item",
        price: Number(it.price || 0),
        qty: Number(it.quantity || it.qty || 1),
      }));

      const noteText =
        order_type === "takeaway"
          ? `takeaway: ${notes || "Pickup"}`
          : `dine-in Table #${table_number || 1}: ${notes || "In-person"}`;

      // Non-blocking background trigger to Supabase
      (async () => {
        try {
          const { data, error } = await supabase.rpc("place_public_online_order", {
            p_restaurant_id: restaurant_id,
            p_customer_name: newOrder.customer_name,
            p_email: "guest@clouddining.com",
            p_phone: customer_phone || "9999999999",
            p_notes: noteText,
            p_items,
          });
          if (error) {
            console.warn("Supabase RPC background sync note:", error.message);
          } else {
            console.log("Supabase RPC synced order:", data?.order_number);
          }
        } catch (e: any) {
          console.warn("Supabase RPC call failed:", e?.message);
        }
      })();
    } catch (sbErr) {
      console.warn("Supabase background attempt failed:", sbErr);
    }

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
      },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error("Failed to process order:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { order_id, status } = await request.json();
    if (!order_id || !status) {
      return NextResponse.json(
        { success: false, error: "Missing order_id or status" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    if (globalThis.__clouddining_orders) {
      globalThis.__clouddining_orders = globalThis.__clouddining_orders.map((o) =>
        o.id === order_id ? { ...o, status } : o
      );
    }

    return NextResponse.json({ success: true, order_id, status }, { headers: CORS_HEADERS });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e?.message || "Failed to update order" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
