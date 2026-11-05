"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Store,
  Crown,
} from "lucide-react";
import { authenticateUser } from "@/lib/tenantStore";

export default function UniversalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("bobby@clouddining.com");
  const [password, setPassword] = useState("SuperAdmin2026");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const res = authenticateUser(email, password);

      if (res.success && res.session) {
        if (res.session.role === "SUPER_ADMIN") {
          router.push("/dashboard");
        } else {
          router.push("/portal");
        }
      } else {
        setError(res.error || "Invalid credentials. Please verify your email and password.");
        setLoading(false);
      }
    }, 400);
  };

  const fillQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060b13] px-4 py-12 relative overflow-hidden">
      {/* Background glowing ambient effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-slate-950 shadow-xl shadow-amber-500/20 mb-4 ring-1 ring-amber-400/40">
            <Store className="w-9 h-9" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Unified Access Portal
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif">CloudDining OS</h1>
          <p className="text-sm text-slate-400 mt-2">
            Centralized portal for Bobby (Super Admin) & Partner Restaurant Outlets
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@restaurant.com or bobby@clouddining.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/70 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Password / Security Key
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/70 transition"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold py-3 px-4 rounded-xl text-sm transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating Role & Routing...</span>
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Seat Selector */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Switch Account (Testing):</span>
            </div>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillQuickDemo("bobby@clouddining.com", "SuperAdmin2026")}
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold">Bobby (Super Admin)</div>
                    <div className="text-[10px] text-amber-400/70">bobby@clouddining.com</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase bg-amber-400/20 px-2 py-0.5 rounded">All Outlets</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo("kurnool@sridivya.com", "SriDivyaAdmin2026")}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-medium text-white">Sri Divya Family Restaurant</div>
                    <div className="text-[10px] text-slate-400">kurnool@sridivya.com (Admin 3)</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Partner</span>
              </button>

              <button
                type="button"
                onClick={() => fillQuickDemo("admin@hyderabadchefs.com", "ChefAdmin2026")}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-slate-300 transition text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="font-medium text-white">Hyderabad Chefs Multi-Cuisine</div>
                    <div className="text-[10px] text-slate-400">admin@hyderabadchefs.com (Admin 2)</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Partner</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Multi-Tenant Data Encryption & Role-Based Isolation Active</span>
        </p>
      </div>
    </div>
  );
}
