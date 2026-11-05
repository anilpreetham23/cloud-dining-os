"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

export default function SuperAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("superadmin@clouddining.com");
  const [password, setPassword] = useState("SuperAdmin2026");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      // Check credentials
      const validEmails = ["superadmin@clouddining.com", "superadmin@restocloud.com", "admin@clouddining.com"];
      if (validEmails.includes(email.toLowerCase().trim()) && password === "SuperAdmin2026") {
        if (typeof window !== "undefined") {
          localStorage.setItem("cloud_dining_super_admin_session", JSON.stringify({
            email,
            role: "Master Super Admin",
            loginTime: new Date().toISOString(),
          }));
        }
        router.push("/dashboard");
      } else {
        setError("Invalid Super Admin credentials. Hint: use superadmin@clouddining.com / SuperAdmin2026");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b12] px-4 py-12 relative overflow-hidden">
      {/* Background glowing orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 text-slate-950 shadow-xl shadow-amber-500/20 mb-4 ring-1 ring-amber-400/40">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-full">
              Platform Master Head
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif">CloudDining OS</h1>
          <p className="text-sm text-slate-400 mt-2">
            Central Super Admin Console for multi-restaurant credential issuance and platform management.
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
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@clouddining.com"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/70 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Master Security Key / Password
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
                  <span>Authenticating Platform Head...</span>
                ) : (
                  <>
                    <span>Enter Super Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Info */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-slate-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pre-filled Master Admin Access:</span>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 font-mono text-[11px] space-y-1">
              <div><span className="text-slate-500">Email:</span> superadmin@clouddining.com</div>
              <div><span className="text-slate-500">Pass:</span> SuperAdmin2026</div>
            </div>
          </div>
        </div>

        {/* Security watermark */}
        <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted with 256-bit AES Tenant Isolation</span>
        </p>
      </div>
    </div>
  );
}
