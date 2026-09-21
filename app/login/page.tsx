"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sprout,
  CheckCircle2,
  Shield,
  ArrowRight,
  UserCheck,
  Sparkles,
  Building2,
  Microscope,
  Tractor,
} from "lucide-react";

type RoleType = "FARMER" | "EXPERT" | "GOVT" | "ADMIN";

interface RoleOption {
  id: RoleType;
  title: string;
  hindiTitle: string;
  description: string;
  targetUrl: string;
  icon: React.ReactNode;
  defaultUser: {
    name: string;
    email: string;
    subtitle: string;
  };
}

const ROLES: RoleOption[] = [
  {
    id: "FARMER",
    title: "Farmer",
    hindiTitle: "किसान",
    description: "Hyperlocal weather, diagnostics & soil telemetry",
    targetUrl: "/",
    icon: <Tractor className="w-4 h-4" />,
    defaultUser: {
      name: "Ravi Kumar",
      email: "ravi.kumar@kisanloop.org",
      subtitle: "Plot IR-64, Namkum, Ranchi",
    },
  },
  {
    id: "EXPERT",
    title: "Agronomist",
    hindiTitle: "कृषि वैज्ञानिक",
    description: "Triage disease scans & issue ICAR prescriptions",
    targetUrl: "/expert",
    icon: <Microscope className="w-4 h-4" />,
    defaultUser: {
      name: "Dr. K. Patel",
      email: "dr.patel@kvk-ranchi.org",
      subtitle: "Senior Pathologist, KVK Ranchi",
    },
  },
  {
    id: "GOVT",
    title: "Govt Official",
    hindiTitle: "कृषि विभाग",
    description: "State & district GIS radar & subsidy tracking",
    targetUrl: "/dashboard",
    icon: <Building2 className="w-4 h-4" />,
    defaultUser: {
      name: "Ramesh Kumar (DAO)",
      email: "dao.ranchi@jharkhand.gov.in",
      subtitle: "District Agriculture Officer",
    },
  },
  {
    id: "ADMIN",
    title: "Administrator",
    hindiTitle: "व्यवस्थापक",
    description: "Qdrant vector DB, RAG docs & system telemetry",
    targetUrl: "/admin",
    icon: <Shield className="w-4 h-4" />,
    defaultUser: {
      name: "System Admin",
      email: "admin@kisanloop.org",
      subtitle: "HQ Systems Engineering",
    },
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>("FARMER");
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<RoleType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleQuickLogin = async (roleToLogin: RoleType = selectedRole) => {
    setLoading(true);
    setLoadingRole(roleToLogin);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleToLogin }),
      });

      const data = await res.json();
      if (data.success && data.data?.redirectUrl) {
        // Store selected role in cookie for persistence
        document.cookie = `kisanloop_selected_role=${roleToLogin}; path=/; max-age=604800; SameSite=Lax`;
        window.location.href = data.data.redirectUrl;
      } else {
        setErrorMsg(data.error?.message || "Login failed. Please try again.");
        setLoading(false);
        setLoadingRole(null);
      }
    } catch (err: any) {
      console.error("Quick login error:", err);
      setErrorMsg("Network error occurred during sign-in.");
      setLoading(false);
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] dark:bg-[#121814] text-[#111814] dark:text-zinc-100 font-sans antialiased flex flex-col justify-between selection:bg-emerald-100 dark:selection:bg-emerald-950 overflow-x-hidden w-full">
      {/* Top Header Bar */}
      <header className="w-full bg-white dark:bg-[#18221B] border-b border-[#e5ece7] dark:border-white/10 px-3 sm:px-6 lg:px-10 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#eef4ee] dark:bg-[#214E34]/30 border border-[#d2ded5] dark:border-[#214E34] flex items-center justify-center text-[#1b4332] dark:text-emerald-400 shadow-2xs shrink-0">
            <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-[#1b4332] dark:text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm sm:text-base text-[#111814] dark:text-white tracking-tight">
                KisanLoop
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#ebf7eb] dark:bg-emerald-950 text-[#1b4332] dark:text-emerald-400 border border-[#d2ded5] dark:border-emerald-800">
                v2.5
              </span>
            </div>
            <span className="text-[10px] text-[#608570] dark:text-emerald-400/80 hidden sm:inline font-medium">
              Action &amp; Outcome Layer for Digital Agriculture
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/50 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Test Accounts Enabled</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 max-w-[960px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-8 flex flex-col items-center justify-center">
        {/* Step Indicator Header */}
        <div className="text-center mb-4 sm:mb-6 max-w-lg">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 text-[#1b4332] dark:text-emerald-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1.5 border border-emerald-200 dark:border-emerald-800/60">
            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Select Persona &amp; Enter Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#111814] dark:text-white tracking-tight">
            Role-Based Access Portal
          </h1>
          <p className="text-[11px] sm:text-xs text-[#608570] dark:text-zinc-400 mt-1">
            Choose your role below to launch the verified test environment with simulated telemetry and datasets.
          </p>
        </div>

        {/* 4 Compact Role Selection Cards (2x2 on Mobile, 4x1 on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full mb-4 sm:mb-6">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRole(role.id);
                }}
                className={`text-left p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-150 flex flex-col justify-between relative cursor-pointer group ${
                  isSelected
                    ? "bg-white dark:bg-[#1a251e] border-emerald-600 dark:border-emerald-500 shadow-sm ring-2 ring-emerald-500/20"
                    : "bg-white/80 dark:bg-[#151d18] border-[#e2ebe4] dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-800/80 hover:bg-white dark:hover:bg-[#18221b] shadow-2xs"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 fill-emerald-100 dark:fill-emerald-950 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <div>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mb-2 ${
                      isSelected
                        ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
                    }`}
                  >
                    {role.icon}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-xs sm:text-sm text-[#111814] dark:text-white leading-tight">
                      {role.title}
                    </h3>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                      {role.hindiTitle}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#608570] dark:text-zinc-400 mt-1 line-clamp-2 leading-snug">
                    {role.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#f0f4f1] dark:border-white/5 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-500">
                    {role.targetUrl}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    {isSelected ? "Active" : "Select"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Center Container */}
        <div className="w-full max-w-xl bg-white dark:bg-[#18221B] rounded-2xl sm:rounded-3xl border border-[#e2ebe4] dark:border-white/10 p-4 sm:p-6 shadow-xs">
          {/* Active Persona Banner */}
          <div className="bg-[#f4f8f5] dark:bg-[#1e2a22] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#d6e5d9] dark:border-emerald-800/40 flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs shrink-0">
                {activeRoleConfig.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-[#111814] dark:text-white truncate">
                    {activeRoleConfig.defaultUser.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                    {activeRoleConfig.title}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#608570] dark:text-zinc-400 truncate">
                  {activeRoleConfig.defaultUser.subtitle} &bull; {activeRoleConfig.defaultUser.email}
                </p>
              </div>
            </div>

            <div className="text-[10px] sm:text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-white dark:bg-[#141c16] text-emerald-700 dark:text-emerald-400 border border-[#d6e5d9] dark:border-white/10 shrink-0 hidden sm:block">
              {activeRoleConfig.targetUrl}
            </div>
          </div>

          {errorMsg && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Primary Action Button */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin(selectedRole)}
              className="w-full py-3 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-[#1b4332] hover:bg-[#143326] text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading && loadingRole === selectedRole ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entering {activeRoleConfig.title} Workspace...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-300" />
                  <span>Enter as {activeRoleConfig.title} ({activeRoleConfig.hindiTitle})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick 1-Click Launch Grid */}
            <div className="pt-3 border-t border-[#f0f4f1] dark:border-white/5">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2 text-center">
                Or Instant 1-Click Launch:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {ROLES.map((r) => (
                  <button
                    key={`direct-${r.id}`}
                    type="button"
                    disabled={loading}
                    onClick={() => handleQuickLogin(r.id)}
                    className="py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl border border-[#d6e5d9] dark:border-white/10 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-[10px] sm:text-[11px] font-bold text-[#111814] dark:text-zinc-200 transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    {loading && loadingRole === r.id ? (
                      <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{r.title}</span>
                        <ArrowRight className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Universal Footer */}
      <footer className="w-full bg-white dark:bg-[#18221B] border-t border-[#e5ece7] dark:border-white/10 px-4 sm:px-6 py-2.5 sm:py-3 text-center text-xs text-[#608570] dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between max-w-[960px] mx-auto gap-2">
        <div className="flex items-center gap-2 text-[10px] sm:text-[11px]">
          <span className="font-bold text-[#111814] dark:text-white">KisanLoop Ecosystem</span>
          <span>&bull; Verified Digital Agronomy Engine</span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-[10px] sm:text-[11px]">
          <Link href="/" className="hover:underline text-emerald-700 dark:text-emerald-400">Farmer</Link>
          <Link href="/expert" className="hover:underline text-teal-700 dark:text-teal-400">Expert</Link>
          <Link href="/dashboard" className="hover:underline text-amber-700 dark:text-amber-400">Govt</Link>
          <Link href="/admin" className="hover:underline text-blue-700 dark:text-blue-400">Admin</Link>
        </div>
      </footer>
    </div>
  );
}
