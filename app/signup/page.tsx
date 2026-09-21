"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { Sprout, CheckCircle2, Shield, ArrowRight, Sparkles, Building2, Microscope, Tractor } from "lucide-react";

type RoleType = "FARMER" | "EXPERT" | "GOVT" | "ADMIN";

interface RoleOption {
  id: RoleType;
  title: string;
  hindiTitle: string;
  description: string;
  targetUrl: string;
  icon: React.ReactNode;
}

const ROLES: RoleOption[] = [
  {
    id: "FARMER",
    title: "Farmer",
    hindiTitle: "किसान",
    description: "Hyperlocal weather alerts, crop diagnostics, and soil telemetry",
    targetUrl: "/",
    icon: <Tractor className="w-5 h-5" />,
  },
  {
    id: "EXPERT",
    title: "Agronomist",
    hindiTitle: "कृषि वैज्ञानिक",
    description: "Triage crop disease cases, verify scans, and issue ICAR prescriptions",
    targetUrl: "/expert",
    icon: <Microscope className="w-5 h-5" />,
  },
  {
    id: "GOVT",
    title: "Govt Official",
    hindiTitle: "कृषि विभाग",
    description: "State & district GIS radar, adoption analytics, and subsidy tracking",
    targetUrl: "/dashboard",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: "ADMIN",
    title: "Administrator",
    hindiTitle: "सिस्टम व्यवस्थापक",
    description: "Manage Qdrant vector DB, RAG documents, and system telemetry",
    targetUrl: "/admin",
    icon: <Shield className="w-5 h-5" />,
  },
];

export default function SignUpPage() {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const [selectedRole, setSelectedRole] = useState<RoleType>("FARMER");
  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleSelectRole = (role: RoleType) => {
    setSelectedRole(role);
    document.cookie = `kisanloop_selected_role=${role}; path=/; max-age=604800; SameSite=Lax`;
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] dark:bg-[#121814] text-[#111814] dark:text-zinc-100 font-sans antialiased flex flex-col justify-between selection:bg-emerald-100 dark:selection:bg-emerald-950 overflow-x-hidden w-full">
      {/* Universal Header Bar */}
      <header className="w-full bg-white dark:bg-[#18221B] border-b border-[#e5ece7] dark:border-white/10 px-4 sm:px-6 lg:px-12 py-3 flex items-center justify-between shadow-2xs">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#eef4ee] dark:bg-[#214E34]/30 border border-[#d2ded5] dark:border-[#214E34] flex items-center justify-center text-[#1b4332] dark:text-emerald-400 shadow-2xs shrink-0">
            <Sprout className="w-5 h-5 text-[#1b4332] dark:text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg text-[#111814] dark:text-white tracking-tight">
                KisanLoop
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ebf7eb] dark:bg-emerald-950 text-[#1b4332] dark:text-emerald-400 border border-[#d2ded5] dark:border-emerald-800">
                v2.5
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#608570] dark:text-emerald-400/80 hidden sm:inline">
              Action &amp; Outcome Layer for Digital Agriculture
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-[#1b4332] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Already have an account? Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 max-w-[1080px] w-full mx-auto px-4 py-6 sm:py-10 flex flex-col items-center">
        {/* Step Indicator Header */}
        <div className="text-center mb-6 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/70 text-[#1b4332] dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2 border border-emerald-200 dark:border-emerald-800/60">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Step 1: Choose Your Account Type</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111814] dark:text-white tracking-tight">
            Create Your KisanLoop Account
          </h1>
          <p className="text-xs sm:text-sm text-[#608570] dark:text-zinc-400 mt-1">
            Select your agricultural persona. After registering, you will be automatically routed to your workspace.
          </p>
        </div>

        {/* 4 Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full mb-6">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleSelectRole(role.id)}
                className={`text-left p-4 rounded-2xl border-2 transition-all duration-150 flex flex-col justify-between relative cursor-pointer group ${
                  isSelected
                    ? "bg-white dark:bg-[#1a251e] border-emerald-600 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                    : "bg-white/80 dark:bg-[#151d18] border-[#e2ebe4] dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-800/80 hover:bg-white dark:hover:bg-[#18221b] shadow-2xs"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950 text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
                <div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      isSelected
                        ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400"
                    }`}
                  >
                    {role.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm sm:text-base text-[#111814] dark:text-white">
                      {role.title}
                    </h3>
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                      ({role.hindiTitle})
                    </span>
                  </div>
                  <p className="text-[11px] text-[#608570] dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {role.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0f4f1] dark:border-white/5 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
                    Redirects to: <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{role.targetUrl}</span>
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sign-Up Container */}
        <div className="w-full max-w-2xl bg-white dark:bg-[#18221B] rounded-3xl border border-[#e2ebe4] dark:border-white/10 p-5 sm:p-7 shadow-sm">
          {/* Active Persona Banner */}
          <div className="bg-[#f4f8f5] dark:bg-[#1e2a22] rounded-2xl p-4 border border-[#d6e5d9] dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                {activeRoleConfig.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    Target Workspace:
                  </span>
                  <span className="font-black text-sm text-[#111814] dark:text-white">
                    {activeRoleConfig.title} ({activeRoleConfig.hindiTitle})
                  </span>
                </div>
                <p className="text-[11px] text-[#608570] dark:text-zinc-400">
                  New registration will be configured for {activeRoleConfig.title} privileges.
                </p>
              </div>
            </div>

            <div className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-[#141c16] text-emerald-700 dark:text-emerald-400 border border-[#d6e5d9] dark:border-white/10 shrink-0">
              Destination: {activeRoleConfig.targetUrl}
            </div>
          </div>

          {clerkPubKey ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8 text-xs text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Loading Sign Up Form...
                </div>
              }
            >
              <div className="overflow-hidden border border-[#e2ebe4] dark:border-white/10 rounded-2xl">
                <SignUp
                  routing="hash"
                  signInUrl="/login"
                  fallbackRedirectUrl={activeRoleConfig.targetUrl}
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0 rounded-2xl",
                    },
                  }}
                />
              </div>
            </Suspense>
          ) : (
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border text-center text-xs text-muted-foreground">
              Please configure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local
            </div>
          )}
        </div>
      </main>

      {/* Universal Footer */}
      <footer className="w-full bg-white dark:bg-[#18221B] border-t border-[#e5ece7] dark:border-white/10 px-4 sm:px-6 py-3.5 text-center text-xs text-[#608570] dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between max-w-[1080px] mx-auto gap-2">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="font-bold text-[#111814] dark:text-white">KisanLoop Ecosystem</span>
          <span>&bull; Identity &amp; Advisory Access</span>
        </div>
        <div className="flex items-center gap-4 font-semibold text-[11px] sm:text-xs">
          <Link href="/" className="hover:underline">Farmer UI (/)</Link>
          <Link href="/expert" className="hover:underline">Expert (/expert)</Link>
          <Link href="/dashboard" className="hover:underline">Govt (/dashboard)</Link>
          <Link href="/admin" className="hover:underline">Admin (/admin)</Link>
        </div>
      </footer>
    </div>
  );
}
