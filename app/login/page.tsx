"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Stethoscope,
  Building2,
  ShieldCheck,
  Mail,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Fingerprint,
  MessageSquare,
  Sprout,
  MapPin,
  Languages,
} from "lucide-react";
import { TEST_USERS, getDefaultRedirectForRole } from "@/lib/auth/constants";

type RoleKey = "user" | "expert" | "government" | "admin";

interface RoleMeta {
  key: RoleKey;
  labelEn: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  title: string;
  desc: string;
  features: string[];
  targetScreen: string;
  targetPath: string;
  defaultEmail: string;
  defaultPass: string;
  identityLabel: string;
  identityPlaceholder: string;
  identityIcon: React.ComponentType<{ className?: string }>;
  extraLabel: string;
  extraDefault: string;
  extraIcon: React.ComponentType<{ className?: string }>;
}

const ROLES: Record<RoleKey, RoleMeta> = {
  user: {
    key: "user",
    labelEn: "User / Farmer",
    labelHi: "किसान",
    icon: User,
    badge: "User / Farmer Portal",
    title: "Direct Action & Daily Farm Recommendations",
    desc: "Access 5-second daily instructions, Zone B weather risk checks, photo diagnosis, and voice guidance in Hindi or English.",
    features: [
      "Daily Simple View & 1-Action-a-Day priority",
      "Cadastral 3-Zone soil & moisture mapping",
      "Voice guidance with 1-tap KVK agronomist connect",
    ],
    targetScreen: "Farmer Simple & Map View (/)",
    targetPath: "/",
    defaultEmail: "ravi.kumar@kisanloop.org",
    defaultPass: "Farmer@123",
    identityLabel: "Mobile Number / Email",
    identityPlaceholder: "+91 98765 43210 or ravi.kumar@kisanloop.org",
    identityIcon: Smartphone,
    extraLabel: "Farm Village & Plot ID",
    extraDefault: "Namkum, Ranchi (Plot 2 - 2.4 ac)",
    extraIcon: MapPin,
  },
  expert: {
    key: "expert",
    labelEn: "Agronomist",
    labelHi: "कृषि वैज्ञानिक",
    icon: Stethoscope,
    badge: "Expert Triage Portal",
    title: "Differential Diagnosis & Agronomic Escalation",
    desc: "Review low-confidence AI alerts (<85%), verify leaf blights, inspect RGB/NDVI drone imagery, and dispatch verified formulations to farmers.",
    features: [
      "Low-AI-confidence anomaly triage queue",
      "ICAR & State POP approved formulary prescription",
      "Direct audio/SMS broadcast to farmer cluster",
    ],
    targetScreen: "Expert Triage & Decision Panel (/expert)",
    targetPath: "/expert",
    defaultEmail: "dr.patel@kvk-ranchi.org",
    defaultPass: "Expert@123",
    identityLabel: "Official Agronomist Email / ID",
    identityPlaceholder: "dr.patel@kvk-ranchi.org",
    identityIcon: Mail,
    extraLabel: "KVK Center & Specialization",
    extraDefault: "KVK Ranchi - Plant Pathology Unit",
    extraIcon: Building2,
  },
  government: {
    key: "government",
    labelEn: "Government",
    labelHi: "कृषि विभाग",
    icon: Building2,
    badge: "Government Intelligence Dashboard",
    title: "Epidemiological Surveillance & Action Funnel",
    desc: "Monitor district-wide advisory adoption, tracking completed actions, input barrier analysis (stockouts/cost), and GIS disease outbreak hotspots.",
    features: [
      "Real-time adoption funnel (Recommended → Verified)",
      "Hyperlocal barrier analytics (38% input stockouts)",
      "District-level cadastral risk zoning & export",
    ],
    targetScreen: "Govt & Extension Dashboard (/dashboard)",
    targetPath: "/dashboard",
    defaultEmail: "dao.ranchi@jharkhand.gov.in",
    defaultPass: "Govt@123",
    identityLabel: "Government Officer Email",
    identityPlaceholder: "dao.ranchi@jharkhand.gov.in",
    identityIcon: Mail,
    extraLabel: "Department & Jurisdiction",
    extraDefault: "Dept of Agriculture - Chota Nagpur Division",
    extraIcon: Building2,
  },
  admin: {
    key: "admin",
    labelEn: "Admin",
    labelHi: "एडमिन",
    icon: ShieldCheck,
    badge: "Admin & Knowledge Portal",
    title: "RAG Ingestion, PostGIS Schemas & AI Guardrails",
    desc: "Manage Qdrant vector embeddings, upload ICAR research papers, lint PostGIS spatial cadastres, and configure autonomous execution confidence thresholds.",
    features: [
      "RAG Document Ingestion & Chunking pipeline",
      "Dynamic PostGIS geometry column mapper",
      "Model confidence slider & Demo state reset",
    ],
    targetScreen: "Admin & Knowledge Portal (/admin)",
    targetPath: "/admin",
    defaultEmail: "admin@kisanloop.org",
    defaultPass: "Admin@123",
    identityLabel: "System Administrator Username / Email",
    identityPlaceholder: "admin@kisanloop.org",
    identityIcon: Mail,
    extraLabel: "Cluster Node / Security Key",
    extraDefault: "Ranchi Cluster Primary Node (v2.5)",
    extraIcon: KeyRound,
  },
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [selectedRole, setSelectedRole] = useState<RoleKey>("user");
  const [email, setEmail] = useState(ROLES.user.defaultEmail);
  const [password, setPassword] = useState(ROLES.user.defaultPass);
  const [extraField, setExtraField] = useState(ROLES.user.extraDefault);
  const [showPassword, setShowPassword] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; icon?: string } | null>(null);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("kisanloop-lang");
      if (savedLang === "hi" || savedLang === "en") {
        setLang(savedLang);
      }
    } catch {}
  }, []);

  const changeLang = (newLang: "en" | "hi") => {
    setLang(newLang);
    try {
      localStorage.setItem("kisanloop-lang", newLang);
    } catch {}
  };

  const activeConfig = ROLES[selectedRole];
  const ActiveRoleIcon = activeConfig.icon;
  const IdentityIcon = activeConfig.identityIcon;
  const ExtraIcon = activeConfig.extraIcon;

  const triggerToast = (msg: string) => {
    setToast({ message: msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRoleSelect = (key: RoleKey) => {
    setSelectedRole(key);
    const cfg = ROLES[key];
    setEmail(cfg.defaultEmail);
    setPassword(cfg.defaultPass);
    setExtraField(cfg.extraDefault);
    setError(null);
  };

  const handleQuickFill = () => {
    setEmail(activeConfig.defaultEmail);
    setPassword(activeConfig.defaultPass);
    setExtraField(activeConfig.extraDefault);
    triggerToast(`Demo credentials applied for ${activeConfig.labelEn}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (json.success) {
        triggerToast(`Welcome back ${json.data.user?.name || ""}! Redirecting...`);
        const dest = from !== "/login" && from !== "/" ? from : activeConfig.targetPath;
        setTimeout(() => {
          router.push(dest);
          router.refresh();
        }, 300);
      } else {
        setError(json.error?.message || "Login failed. Please verify your credentials.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] dark:bg-[#121814] text-[#111814] dark:text-zinc-100 font-sans antialiased flex flex-col justify-between selection:bg-emerald-100 dark:selection:bg-emerald-950 overflow-x-hidden w-full">
      {/* Universal Header Bar matching Stitch */}
      <header className="w-full bg-white dark:bg-[#18221B] border-b border-[#e5ece7] dark:border-white/10 px-3.5 sm:px-6 lg:px-12 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#eef4ee] dark:bg-[#214E34]/30 border border-[#d2ded5] dark:border-[#214E34] flex items-center justify-center text-[#1b4332] dark:text-emerald-400 shadow-2xs shrink-0">
              <Sprout className="w-5 h-5 text-[#1b4332] dark:text-emerald-400" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-base sm:text-lg text-[#111814] dark:text-white tracking-tight truncate">
                  KisanLoop
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full bg-[#ebf7eb] dark:bg-emerald-950 text-[#1b4332] dark:text-emerald-400 border border-[#d2ded5] dark:border-emerald-800 shrink-0">
                  v2.5 LIVE
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#608570] dark:text-emerald-400/80 truncate hidden sm:inline">
                Action &amp; Outcome Layer for Digital Agriculture
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Language Selector */}
          <div className="flex items-center bg-[#f4f7f5] dark:bg-zinc-800/60 border border-[#e5ece7] dark:border-white/10 rounded-lg p-0.5 sm:p-1 text-xs">
            <button
              type="button"
              onClick={() => changeLang("en")}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[11px] sm:text-xs transition font-semibold ${
                lang === "en"
                  ? "bg-white dark:bg-zinc-900 text-[#111814] dark:text-white shadow-2xs"
                  : "text-[#608570] dark:text-zinc-400"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => changeLang("hi")}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[11px] sm:text-xs transition font-semibold ${
                lang === "hi"
                  ? "bg-white dark:bg-zinc-900 text-[#111814] dark:text-white shadow-2xs"
                  : "text-[#608570] dark:text-zinc-400"
              }`}
            >
              हिन्दी
            </button>
          </div>

          <Link
            href="/signup"
            className="text-xs font-bold text-[#1b4332] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span className="hidden sm:inline">Need account?</span>
            <span>Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Split Authentication Frame */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-10 flex flex-col justify-center">
        {/* Role Switcher Segment (4 Distinct Roles) */}
        <div className="w-full max-w-2xl mx-auto mb-5 sm:mb-7">
          <div className="text-center mb-2.5 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#608570] dark:text-emerald-400">
              Select Access Role / भूमिका चुनें
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-0.5">
              {lang === "hi" ? "किसानलूप में आपका स्वागत है" : "Welcome Back to KisanLoop"}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#608570] dark:text-zinc-400 mt-0.5">
              Choose your portal role to sign in to your dedicated workspace
            </p>
          </div>

          {/* 4 Role Pill Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 bg-[#edf2ee] dark:bg-[#18221B] p-1 rounded-2xl border border-[#dce6dc] dark:border-white/10">
            {(Object.keys(ROLES) as RoleKey[]).map((key) => {
              const r = ROLES[key];
              const isSelected = selectedRole === key;
              const IconComp = r.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRoleSelect(key)}
                  className={`flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 rounded-xl text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-white dark:bg-[#214E34] text-[#1b4332] dark:text-white font-bold shadow-sm border-[#d2ded5] dark:border-emerald-600"
                      : "text-[#608570] dark:text-zinc-400 hover:text-[#111814] dark:hover:text-white border-transparent"
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span className="truncate">{lang === "hi" ? r.labelHi : r.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="w-full max-w-lg mx-auto bg-white dark:bg-[#18221B] rounded-2xl sm:rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xl overflow-hidden p-5 sm:p-7 md:p-8">
          <div>
            {/* Header inside form */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#edf2ee] dark:border-white/10 gap-2">
              <div className="flex items-center gap-1 bg-[#f0f4f1] dark:bg-zinc-800 p-1 rounded-xl border border-[#e0eae2] dark:border-white/10 text-xs">
                <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg font-bold bg-white dark:bg-zinc-900 text-[#111814] dark:text-white shadow-2xs">
                  Sign In
                </span>
                <Link
                  href="/signup"
                  className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg font-medium text-[#608570] dark:text-zinc-400 hover:text-[#111814] dark:hover:text-white transition"
                >
                  Register
                </Link>
              </div>

              <button
                  type="button"
                  onClick={handleQuickFill}
                  className="text-[10px] sm:text-[11px] font-bold text-[#1b4332] dark:text-emerald-400 hover:bg-[#ebf7eb] dark:hover:bg-white/5 px-2.5 py-1.5 rounded-lg border border-[#d2ded5] dark:border-white/10 transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Quick-Fill Demo</span>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                {/* Identity Input */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111814] dark:text-zinc-200 flex justify-between">
                    <span>{activeConfig.identityLabel}</span>
                    <span className="text-[10px] sm:text-[11px] font-normal text-[#608570] dark:text-zinc-400">
                      Pre-filled for 1-click
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeConfig.identityPlaceholder}
                      className="w-full text-xs sm:text-sm py-2.5 pl-10 pr-3 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332] text-foreground dark:text-white transition-colors"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-muted-foreground">
                      <IdentityIcon className="w-4 h-4 text-[#608570] dark:text-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Role Specific Extra Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111814] dark:text-zinc-200 block">
                    {activeConfig.extraLabel}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={extraField}
                      onChange={(e) => setExtraField(e.target.value)}
                      className="w-full text-xs sm:text-sm py-2.5 pl-10 pr-3 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332] text-foreground dark:text-white transition-colors"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-muted-foreground">
                      <ExtraIcon className="w-4 h-4 text-[#608570] dark:text-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Password / PIN */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#111814] dark:text-zinc-200">
                      Password / Security PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => triggerToast("OTP code transmitted to your mobile number")}
                      className="text-[10px] sm:text-[11px] text-[#1b4332] dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                    >
                      Forgot PIN?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs sm:text-sm py-2.5 pl-10 pr-10 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332] text-foreground dark:text-white transition-colors font-mono"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-muted-foreground">
                      <Lock className="w-4 h-4 text-[#608570] dark:text-zinc-400" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#717972] dark:text-zinc-400 hover:text-foreground cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Offline Local Node Sync Toggle */}
                <div className="pt-1 flex items-center justify-between text-xs text-[#526458] dark:text-zinc-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-[#d2ded5] text-[#1b4332] focus:ring-0"
                    />
                    <span className="text-[11px]">Keep offline session synced</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-[#1b4332] dark:text-emerald-400 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Local Edge Ready
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1b4332] hover:bg-[#143326] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Authenticating securely...</span>
                    </span>
                  ) : (
                    <>
                      <span>Log In as {activeConfig.labelEn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Fast Access with AgriStack / SMS */}
              <div className="mt-4 pt-3.5 border-t border-[#edf2ee] dark:border-white/10 text-center">
                <span className="text-[10px] sm:text-[11px] text-[#717972] dark:text-zinc-400 uppercase font-bold tracking-wider">
                  Or fast access with
                </span>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => triggerToast("Authenticating via AgriStack farmer consent...")}
                    className="py-2 px-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 hover:bg-[#f8faf8] dark:hover:bg-white/5 text-xs font-semibold text-[#111814] dark:text-zinc-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4 text-[#1b4332] dark:text-emerald-400 shrink-0" />
                    <span className="truncate">AgriStack / e-KYC</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerToast("OTP code transmitted to your mobile number")}
                    className="py-2 px-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 hover:bg-[#f8faf8] dark:hover:bg-white/5 text-xs font-semibold text-[#111814] dark:text-zinc-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-[#1b4332] dark:text-emerald-400 shrink-0" />
                    <span className="truncate">Direct SMS OTP</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 text-center text-[10px] sm:text-[11px] text-[#717972] dark:text-zinc-400 leading-tight">
              By continuing, you agree to KisanLoop’s{" "}
              <a href="#" className="underline text-[#1b4332] dark:text-emerald-400">
                Advisory Protocol
              </a>{" "}
              and ICAR Agronomic Standards.
            </div>
          </div>
      </main>

      {/* Footer Navigation */}
      <footer className="w-full bg-white dark:bg-[#18221B] border-t border-[#e5ece7] dark:border-white/10 px-4 sm:px-6 py-3 text-center text-xs text-[#608570] dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between max-w-[1100px] mx-auto gap-2">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="font-bold text-[#111814] dark:text-white">KisanLoop Ecosystem</span>
          <span>• Single Sign-On</span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-[11px] sm:text-xs">
          <button type="button" onClick={() => handleRoleSelect("user")} className="hover:underline cursor-pointer">
            Farmer UI
          </button>
          <button type="button" onClick={() => handleRoleSelect("expert")} className="hover:underline cursor-pointer">
            Expert
          </button>
          <button type="button" onClick={() => handleRoleSelect("government")} className="hover:underline cursor-pointer">
            Govt
          </button>
          <button type="button" onClick={() => handleRoleSelect("admin")} className="hover:underline cursor-pointer">
            Admin
          </button>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111814] text-white px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8faf8] dark:bg-[#121814]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1b4332] animate-pulse">
            <div className="w-4 h-4 border-2 border-[#1b4332] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading KisanLoop Login...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
