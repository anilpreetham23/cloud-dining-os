"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Store,
  Users,
  Plus,
  KeyRound,
  ExternalLink,
  Copy,
  Check,
  Search,
  Sparkles,
  TrendingUp,
  CreditCard,
  Building2,
  RefreshCw,
  LogOut,
  AlertCircle,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  MapPin,
  Flame,
  ArrowRight,
  Eye,
  EyeOff,
  SlidersHorizontal,
  X,
  UtensilsCrossed,
} from "lucide-react";

import {
  TenantRestaurant,
  AdminAccount,
  PlatformMetrics,
  SubscriptionTier,
  AdminRole,
  UserSession,
} from "@/lib/types";

import {
  getStoredTenants,
  getStoredAdmins,
  syncWithSupabase,
  createTenantWithAdmin,
  createAdminAccount,
  resetAdminPassword,
  toggleAdminStatus,
  getPlatformMetrics,
  formatCredentialVoucher,
  setActiveSession,
} from "@/lib/tenantStore";

export default function SuperAdminDashboardPage() {
  const router = useRouter();

  // Data states
  const [tenants, setTenants] = useState<TenantRestaurant[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    total_restaurants: 0,
    active_restaurants: 0,
    total_admins: 0,
    total_orders: 0,
    gross_merchandise_value: 0,
    active_kds_screens: 0,
  });

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<"restaurants" | "credentials">("restaurants");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>("all");

  // Modals state
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [selectedTenantForAdmins, setSelectedTenantForAdmins] = useState<TenantRestaurant | null>(null);
  const [voucherModalData, setVoucherModalData] = useState<{
    admin: AdminAccount;
    voucherText: string;
  } | null>(null);
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  // New Tenant Form state
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantSlug, setNewTenantSlug] = useState("");
  const [newTenantCity, setNewTenantCity] = useState("");
  const [newTenantPhone, setNewTenantPhone] = useState("");
  const [newTenantEmail, setNewTenantEmail] = useState("");
  const [newTenantTier, setNewTenantTier] = useState<SubscriptionTier>("Growth");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("ChefAdmin2026");
  const [onboardError, setOnboardError] = useState<string | null>(null);
  const [onboardSuccess, setOnboardSuccess] = useState<string | null>(null);
  const [isOnboardingLoading, setIsOnboardingLoading] = useState(false);

  // Add Admin Form state
  const [addAdminName, setAddAdminName] = useState("");
  const [addAdminEmail, setAddAdminEmail] = useState("");
  const [addAdminRole, setAddAdminRole] = useState<AdminRole>("owner");
  const [addAdminPassword, setAddAdminPassword] = useState("RestoAdmin2026");
  const [addAdminError, setAddAdminError] = useState<string | null>(null);
  const [addAdminSuccess, setAddAdminSuccess] = useState<string | null>(null);

  // Load and sync data on mount
  const refreshData = () => {
    const t = getStoredTenants();
    const a = getStoredAdmins();
    setTenants(t);
    setAdmins(a);
    setMetrics(getPlatformMetrics(t, a));
  };

  useEffect(() => {
    refreshData();
    syncWithSupabase().then(() => {
      refreshData();
    });
  }, []);

  const handleNameChange = (val: string) => {
    setNewTenantName(val);
    const slugified = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setNewTenantSlug(slugified);
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTier = selectedTierFilter === "all" || t.tier === selectedTierFilter;
    return matchesSearch && matchesTier;
  });

  const filteredAdmins = admins.filter((a) => {
    return (
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.restaurant_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);
    setOnboardSuccess(null);
    setIsOnboardingLoading(true);

    if (!newTenantName.trim() || !newTenantSlug.trim() || !newAdminEmail.trim()) {
      setOnboardError("Please fill in Restaurant Name, Slug, and Admin Email.");
      setIsOnboardingLoading(false);
      return;
    }

    const res = await createTenantWithAdmin(
      {
        name: newTenantName,
        slug: newTenantSlug,
        city: newTenantCity || "Hyderabad, Telangana",
        phone: newTenantPhone,
        email: newTenantEmail,
        tier: newTenantTier,
      },
      {
        name: newAdminName || `${newTenantName} Admin`,
        email: newAdminEmail,
        phone: newTenantPhone,
        password: newAdminPassword || "AdminPass2026",
        role: "owner",
      }
    );

    setIsOnboardingLoading(false);

    if (res.ok) {
      setOnboardSuccess(`Successfully onboarded "${res.tenant.name}" with primary admin ${res.admin.email}!`);
      refreshData();
      const backofficeUrl = "https://cloud-dining-os.vercel.app/login";
      setVoucherModalData({
        admin: res.admin,
        voucherText: formatCredentialVoucher(res.admin, backofficeUrl),
      });
      setNewTenantName("");
      setNewTenantSlug("");
      setNewTenantCity("");
      setNewTenantPhone("");
      setNewTenantEmail("");
      setNewAdminName("");
      setNewAdminEmail("");
      setIsOnboardModalOpen(false);
    } else {
      setOnboardError(res.error || "Failed to onboard restaurant.");
    }
  };

  const handleAddAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError(null);
    setAddAdminSuccess(null);

    if (!selectedTenantForAdmins) return;
    if (!addAdminName.trim() || !addAdminEmail.trim() || !addAdminPassword.trim()) {
      setAddAdminError("Name, Email, and Password are required.");
      return;
    }

    const res = createAdminAccount(selectedTenantForAdmins.id, selectedTenantForAdmins.name, {
      name: addAdminName,
      email: addAdminEmail,
      role: addAdminRole,
      password: addAdminPassword,
    });

    if (res.ok) {
      setAddAdminSuccess(`Admin account created for ${res.admin.email}!`);
      refreshData();
      const backofficeUrl = "https://cloud-dining-os.vercel.app/login";
      setVoucherModalData({
        admin: res.admin,
        voucherText: formatCredentialVoucher(res.admin, backofficeUrl),
      });
      setAddAdminName("");
      setAddAdminEmail("");
      setAddAdminPassword("RestoAdmin2026");
    } else {
      setAddAdminError(res.error || "Could not add admin.");
    }
  };

  const handleCopyVoucher = () => {
    if (!voucherModalData) return;
    navigator.clipboard.writeText(voucherModalData.voucherText);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2500);
  };

  const backofficeBaseUrl = "https://cloud-dining-os.vercel.app/login";

  const handleEnterConsole = (tenant: TenantRestaurant) => {
    const previewSession: UserSession = {
      role: "RESTAURANT_ADMIN",
      name: `Bobby (Previewing as Admin)`,
      email: "bobby@clouddining.com",
      restaurantId: tenant.id,
      restaurantName: tenant.name,
      isSuperAdminPreview: true,
      loginTime: new Date().toISOString(),
    };
    setActiveSession(previewSession);
    router.push("/portal");
  };

  return (
    <div className="min-h-screen bg-[#040814] text-slate-100 flex flex-col font-sans">
      {/* TOP MASTER HEADER */}
      <header className="sticky top-0 z-40 bg-[#070e24]/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand & Super Admin Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-lg">
              <div className="w-full h-full bg-[#050b1a] rounded-[10px] flex items-center justify-center font-serif text-amber-300 font-bold text-xl">
                C
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg text-white">
                  CloudDining<span className="text-amber-400">OS</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Super Admin Console
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Platform Head: Bobby
                </span>
                <span>•</span>
                <span>Master Multi-Tenant Credential Hub</span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              target="_blank"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Customer Marketplace</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Onboard Restaurant</span>
            </button>

            <Link
              href="/login"
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* PLATFORM EXECUTIVE METRICS STRIP */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#09122c]/80 border border-slate-800/80 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Partner Restaurants</span>
              <Store className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {metrics.total_restaurants}
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{metrics.active_restaurants} Active Outlets</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#09122c]/80 border border-slate-800/80 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Provisioned Admins</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {metrics.total_admins}
            </div>
            <div className="text-[11px] text-slate-400">
              Admin 1, Admin 2, Admin 3... Active
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#09122c]/80 border border-slate-800/80 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Monthly Network Orders</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {metrics.total_orders.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">
              Dine-In, Takeaway & Marketplace
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#09122c]/80 border border-slate-800/80 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Network GMV Volume</span>
              <CreditCard className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-300">
              ₹{(metrics.gross_merchandise_value / 100000).toFixed(2)}L
            </div>
            <div className="text-[11px] text-slate-400">
              Processed through Cloud POS
            </div>
          </div>
        </section>

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 p-1 bg-slate-900/80 rounded-2xl border border-slate-800 max-w-md">
            <button
              onClick={() => setActiveTab("restaurants")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "restaurants"
                  ? "bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Partner Outlets ({tenants.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("credentials")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "credentials"
                  ? "bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Admin Logins ({admins.length})</span>
            </button>
            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurants, admins..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            {activeTab === "restaurants" && (
              <select
                value={selectedTierFilter}
                onChange={(e) => setSelectedTierFilter(e.target.value)}
                className="py-2 px-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Plans</option>
                <option value="Starter">Starter</option>
                <option value="Growth">Growth</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            )}
          </div>
        </div>

        {/* TAB 1: RESTAURANT TENANTS DIRECTORY */}
        {activeTab === "restaurants" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">
                Multi-Restaurant Tenant Directory
              </h2>
              <p className="text-xs text-slate-400">
                Click <strong>Manage Admin Logins</strong> to issue credentials, or <strong>Launch Back-Office</strong> to access live KDS & POS.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTenants.map((t) => (
                <div
                  key={t.id}
                  className="p-6 rounded-3xl bg-[#09122c]/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl space-y-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-white group-hover:text-amber-300 transition-colors">
                          {t.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono">
                          slug: /{t.slug}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.tier === "Enterprise"
                            ? "bg-amber-500/10 text-amber-300 border border-amber-400/30"
                            : t.tier === "Growth"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : "bg-slate-700/30 text-slate-300 border border-slate-600/30"
                        }`}
                      >
                        {t.tier}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{t.city}</span>
                      </div>
                      {t.phone && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{t.phone}</span>
                        </div>
                      )}
                      {t.email && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate">{t.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-500">Monthly Orders</div>
                      <div className="font-bold text-white">
                        {t.monthly_orders ? t.monthly_orders.toLocaleString() : "0"} orders
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500">Assigned Admins</div>
                      <div className="font-bold text-amber-300">
                        {t.admin_count || 1} Admins
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedTenantForAdmins(t)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Manage Logins</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEnterConsole(t)}
                      title={`Open ${t.name} Live Console`}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Live Console</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: MASTER ADMIN CREDENTIAL CENTER */}
        {activeTab === "credentials" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-white">
                Master Admin Credentials Center
              </h2>
              <p className="text-xs text-slate-400">
                Manage login accounts across all partner restaurants. Click <strong>Share Handover Pass</strong> to generate a 1-click WhatsApp/Email voucher.
              </p>
            </div>

            <div className="bg-[#09122c]/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-6">Admin Name & Role</th>
                      <th className="py-4 px-6">Assigned Restaurant</th>
                      <th className="py-4 px-6">Login Email</th>
                      <th className="py-4 px-6">Active Password</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Handover Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredAdmins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-white text-sm">{adm.name}</div>
                          <div className="text-[10px] text-amber-300 uppercase font-mono tracking-wider">
                            {adm.role.toUpperCase()} (Scoped)
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-200">
                          {adm.restaurant_name}
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-300">
                          {adm.email}
                        </td>
                        <td className="py-4 px-6 font-mono">
                          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-amber-200 text-[11px]">
                            {adm.password || "••••••••"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            type="button"
                            onClick={() => {
                              toggleAdminStatus(adm.id);
                              refreshData();
                            }}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                              adm.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {adm.status}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setVoucherModalData({
                                admin: adm,
                                voucherText: formatCredentialVoucher(adm, backofficeBaseUrl),
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Share Handover Pass</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ONBOARD NEW RESTAURANT TENANT */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#09122c] border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Onboard New Partner Restaurant
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Provisions tenant in DB and issues primary Admin login
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOnboardModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Restaurant Name *
                </label>
                <input
                  type="text"
                  required
                  value={newTenantName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Hyderabad Chefs"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTenantSlug}
                    onChange={(e) => setNewTenantSlug(e.target.value.toLowerCase())}
                    placeholder="hyderabad-chefs"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Subscription Tier
                  </label>
                  <select
                    value={newTenantTier}
                    onChange={(e) => setNewTenantTier(e.target.value as SubscriptionTier)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Starter">Starter (1 POS)</option>
                    <option value="Growth">Growth (3 KDS)</option>
                    <option value="Enterprise">Enterprise (Unlimited)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-300">
                  Location / City *
                </label>
                <input
                  type="text"
                  required
                  value={newTenantCity}
                  onChange={(e) => setNewTenantCity(e.target.value)}
                  placeholder="e.g. Madhapur, Hyderabad"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Primary Admin 1 Credentials
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-400">
                        Admin Full Name
                      </label>
                      <input
                        type="text"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="Ramesh Kumar"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-400">
                        Admin Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="admin@hyderabadchefs.com"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-medium text-slate-400">
                        Initial Set Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewAdminPassword(`Chef${Math.floor(1000 + Math.random() * 9000)}`)}
                        className="text-[10px] text-amber-300 hover:underline"
                      >
                        Generate Random
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      placeholder="ChefAdmin2026"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              {onboardError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                  {onboardError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOnboardingLoading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  {isOnboardingLoading ? "Provisioning..." : "Provision & Issue Logins"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGE ADMIN LOGINS FOR SELECTED RESTAURANT */}
      {selectedTenantForAdmins && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#09122c] border border-slate-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    {selectedTenantForAdmins.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Manage Admin Logins & Issue Credentials
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTenantForAdmins(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Existing Assigned Admins:
              </div>
              <div className="space-y-2">
                {admins
                  .filter((a) => a.restaurant_id === selectedTenantForAdmins.id)
                  .map((adm) => (
                    <div
                      key={adm.id}
                      className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{adm.name}</span>
                          <span className="text-[10px] font-mono text-amber-300 px-1.5 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                            {adm.role.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-slate-400 font-mono text-[11px]">
                          {adm.email} • Pass:{" "}
                          <span className="text-amber-200">{adm.password}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setVoucherModalData({
                            admin: adm,
                            voucherText: formatCredentialVoucher(adm, backofficeBaseUrl),
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 transition"
                      >
                        Share Pass
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Issue Additional Admin Login (Admin 2, Admin 3...)</span>
              </div>

              <form onSubmit={handleAddAdminSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-400">
                      Admin Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addAdminName}
                      onChange={(e) => setAddAdminName(e.target.value)}
                      placeholder="e.g. Floor Manager"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-400">
                      Admin Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={addAdminEmail}
                      onChange={(e) => setAddAdminEmail(e.target.value)}
                      placeholder="manager@hyderabadchefs.com"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-400">
                      Access Role
                    </label>
                    <select
                      value={addAdminRole}
                      onChange={(e) => setAddAdminRole(e.target.value as AdminRole)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="owner">Restaurant Owner (Full KDS & POS)</option>
                      <option value="manager">Store Manager (Menu & Staff)</option>
                      <option value="staff">Floor Staff (Orders only)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-400">
                      Set Password *
                    </label>
                    <input
                      type="text"
                      required
                      value={addAdminPassword}
                      onChange={(e) => setAddAdminPassword(e.target.value)}
                      placeholder="RestoAdmin2026"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {addAdminError && (
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs">
                    {addAdminError}
                  </div>
                )}
                {addAdminSuccess && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
                    {addAdminSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-300 to-amber-500 text-slate-950 shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                >
                  Create & Generate Credential Pass
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SHAREABLE HANDOVER VOUCHER CARD */}
      {voucherModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#09122c] border border-amber-400/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setVoucherModalData(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-xl text-white">
                Official Admin Access Voucher
              </h3>
              <p className="text-xs text-slate-400">
                Ready to send via WhatsApp, Email, or SMS to the restaurant owner
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#040814] border border-amber-400/30 font-mono text-xs text-slate-300 space-y-3 shadow-inner">
              <div className="text-amber-300 font-bold border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>{voucherModalData.admin.restaurant_name}</span>
                <span className="text-[10px] uppercase bg-amber-400/20 px-2 py-0.5 rounded text-amber-200">
                  {voucherModalData.admin.role.toUpperCase()} ACCESS
                </span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div>
                  <span className="text-slate-500">Admin Name:</span>{" "}
                  <strong className="text-white">{voucherModalData.admin.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Login Email:</span>{" "}
                  <strong className="text-white">{voucherModalData.admin.email}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Temporary Password:</span>{" "}
                  <strong className="text-amber-300">{voucherModalData.admin.password}</strong>
                </div>
                <div className="pt-2 text-[11px] text-slate-400">
                  <span className="text-slate-500">Back-Office Login URL:</span>
                  <div className="text-amber-300 break-all mt-0.5">{backofficeBaseUrl}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCopyVoucher}
                className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow-xl hover:scale-102 transition-all cursor-pointer"
              >
                {copiedVoucher ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>1-Click Copy Credential Details</span>
                  </>
                )}
              </button>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(voucherModalData.voucherText)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <span>Direct Share on WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <p className="text-[11px] text-center text-slate-500">
                Clicking copy formats a clean message ready to paste directly into WhatsApp or email.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
