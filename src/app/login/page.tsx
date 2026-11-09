"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  KeyRound,
  UtensilsCrossed,
} from "lucide-react";
import { authenticateUser } from "@/lib/tenantStore";

export default function UniversalLoginPage() {
  const router = useRouter();

  // Inputs are strictly un-prefilled with placeholders as requested by Bobby
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const checkCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockOn(e.getModifierState("CapsLock"));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);
    setPasswordError(null);

    let hasValidationError = false;
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Email Format Validation
    if (!cleanEmail) {
      setEmailError("Email address is required.");
      hasValidationError = true;
    } else if (!emailRegex.test(cleanEmail)) {
      setEmailError("Please enter a valid email format (e.g. kurnool@sridivya.com).");
      hasValidationError = true;
    }

    // 2. Password Validation
    if (!password) {
      setPasswordError("Password is required.");
      hasValidationError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      hasValidationError = true;
    }

    if (hasValidationError) return;

    setLoading(true);

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
    }, 350);
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setEmailError(null);
    setPasswordError(null);
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

        {/* Quick Link to Customer Ordering Portal */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border border-amber-500/30 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-bold text-white text-xs block">Looking to order food?</span>
              <span className="text-[11px] text-amber-300">Browse menus &amp; order takeaway</span>
            </div>
          </div>
          <Link
            href="/explore"
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer shrink-0"
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div>
                <div className="font-semibold">{error}</div>
                <div className="text-[11px] text-red-300/80 mt-1">
                  Tip: Check the &ldquo;Partner Credentials Reference&rdquo; sheet below for exact details.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="e.g. kurnool@sridivya.com or bobby@clouddining.com"
                  className={`w-full bg-slate-950 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                    emailError
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                      : "border-slate-700/80 focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/70"
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Password / Security Key
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Case-sensitive
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onKeyDown={checkCapsLock}
                  onKeyUp={checkCapsLock}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="Enter your assigned password"
                  className={`w-full bg-slate-950 border rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition ${
                    passwordError
                      ? "border-red-500 focus:border-red-500 ring-1 ring-red-500/50"
                      : "border-slate-700/80 focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/70"
                  }`}
                />
                {/* Eye Mask Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {passwordError && (
                <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passwordError}</span>
                </p>
              )}

              {capsLockOn && (
                <p className="text-[11px] text-amber-300 mt-1.5 flex items-center gap-1 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>⚠️ Caps Lock is ON — Passwords are case-sensitive.</span>
                </p>
              )}
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

          {/* Collapsible Partner Credentials Reference Sheet */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Partner Logins & Passwords Reference</span>
              </div>
              {showCheatSheet ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showCheatSheet && (
              <div className="mt-3 space-y-2 text-xs">
                {/* Super Admin */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      Bobby (Super Admin Head)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Email: <strong className="text-white">bobby@clouddining.com</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Pass: <strong className="text-amber-300">SuperAdmin2026</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFillDemo("bobby@clouddining.com", "SuperAdmin2026")}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] hover:bg-amber-300 transition cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>

                {/* Sri Divya */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-emerald-400" />
                      Sri Divya Family Restaurant
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Email: <strong className="text-white">kurnool@sridivya.com</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Pass: <strong className="text-amber-300">SriDivyaAdmin2026</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFillDemo("kurnool@sridivya.com", "SriDivyaAdmin2026")}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-semibold text-[11px] hover:bg-slate-700 transition cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>

                {/* Hyderabad Chefs */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-blue-400" />
                      Hyderabad Chefs Multi-Cuisine
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Email: <strong className="text-white">admin@hyderabadchefs.com</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Pass: <strong className="text-amber-300">ChefAdmin2026</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFillDemo("admin@hyderabadchefs.com", "ChefAdmin2026")}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-semibold text-[11px] hover:bg-slate-700 transition cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>

                {/* VPD Retreat */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-purple-400" />
                      VPD Retreat & Resort
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Email: <strong className="text-white">admin@vpdretreat.com</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Pass: <strong className="text-amber-300">VpdAdmin2026</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFillDemo("admin@vpdretreat.com", "VpdAdmin2026")}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-semibold text-[11px] hover:bg-slate-700 transition cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>

                {/* Lumiere */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-amber-400" />
                      Lumière Fine Dining
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Email: <strong className="text-white">admin@lumiere.com</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Pass: <strong className="text-amber-300">LumiereAdmin2026</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFillDemo("admin@lumiere.com", "LumiereAdmin2026")}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-200 font-semibold text-[11px] hover:bg-slate-700 transition cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security watermark */}
        <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Role-Based Tenant Isolation • End-to-End Encrypted</span>
        </p>
      </div>
    </div>
  );
}
