"use client";

import React, { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type RoleKey = "user" | "expert" | "government" | "admin";

interface RoleMeta {
  key: RoleKey;
  apiRole: "FARMER" | "EXPERT" | "GOVT" | "ADMIN";
  labelEn: string;
  labelHi: string;
  icon: string;
  badge: string;
  title: string;
  desc: string;
  features: string[];
}

const ROLES: Record<RoleKey, RoleMeta> = {
  user: {
    key: "user",
    apiRole: "FARMER",
    labelEn: "User / Farmer",
    labelHi: "किसान",
    icon: "person",
    badge: "Farmer Onboarding",
    title: "Direct Action & Daily Farm Recommendations",
    desc: "Join thousands of smallholders receiving actionable, feasibility-checked recommendations calibrated to satellite radar and soil tests.",
    features: [
      "Daily Simple View & 1-Action-a-Day priority",
      "Cadastral 3-Zone soil & moisture mapping",
      "Voice guidance with 1-tap KVK agronomist connect",
    ],
  },
  expert: {
    key: "expert",
    apiRole: "EXPERT",
    labelEn: "Agronomist",
    labelHi: "कृषि वैज्ञानिक",
    icon: "psychology",
    badge: "Expert Verification",
    title: "Differential Diagnosis & Agronomic Escalation",
    desc: "Register your institutional KVK or University credentials to triage field observations and prescribe approved agrochemical protocols.",
    features: [
      "Low-AI-confidence anomaly triage queue",
      "ICAR & State POP approved formulary prescription",
      "Direct audio/SMS broadcast to farmer cluster",
    ],
  },
  government: {
    key: "government",
    apiRole: "GOVT",
    labelEn: "Government",
    labelHi: "कृषि विभाग",
    icon: "account_balance",
    badge: "State Agriculture Officer",
    title: "Epidemiological Surveillance & Action Funnel",
    desc: "Access district intelligence dashboards to monitor input stockouts, climate resilience compliance, and pest alert maps.",
    features: [
      "Real-time adoption funnel (Recommended → Verified)",
      "Hyperlocal barrier analytics (38% input stockouts)",
      "District-level cadastral risk zoning & export",
    ],
  },
  admin: {
    key: "admin",
    apiRole: "ADMIN",
    labelEn: "Admin",
    labelHi: "एडमिन",
    icon: "settings_suggest",
    badge: "System Administration",
    title: "RAG Ingestion, PostGIS Schemas & AI Guardrails",
    desc: "Register administrator credentials to maintain vector embeddings, PostGIS spatial data, and model confidence thresholds.",
    features: [
      "RAG Document Ingestion & Chunking pipeline",
      "Dynamic PostGIS geometry column mapper",
      "Model confidence slider & Demo state reset",
    ],
  },
};

function SignUpForm() {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<RoleKey>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<"hi" | "en">("hi");
  const [lang, setLang] = useState<"en" | "hi">("en");

  // Farmer specifics
  const [state, setState] = useState("Jharkhand");
  const [district, setDistrict] = useState("Ranchi");
  const [village, setVillage] = useState("Namkum");
  const [plotArea, setPlotArea] = useState("1.2");
  const [cropName, setCropName] = useState("धान (IR-64)");
  const [irrigationType, setIrrigationType] = useState("Rainfed");
  const [soilType, setSoilType] = useState("Loamy");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeConfig = ROLES[selectedRole];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role: activeConfig.apiRole,
          preferredLanguage,
          state,
          district,
          village,
          plotArea: parseFloat(plotArea) || 1.0,
          cropName,
          irrigationType,
          soilType,
        }),
      });

      const json = await res.json();
      if (json.success) {
        router.push(json.data.redirectUrl || "/");
        router.refresh();
      } else {
        setError(json.error?.message || "Registration failed. Please check your information.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] dark:bg-[#121814] text-[#111814] dark:text-zinc-100 font-sans antialiased flex flex-col justify-between selection:bg-emerald-100 dark:selection:bg-emerald-950">
      {/* Universal Header Bar matching Stitch */}
      <header className="w-full bg-white dark:bg-[#18221B] border-b border-[#e5ece7] dark:border-white/10 px-6 lg:px-12 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eef4ee] dark:bg-[#214E34]/30 border border-[#d2ded5] dark:border-[#214E34] flex items-center justify-center text-[#1b4332] dark:text-emerald-400 shadow-xs">
              <svg fill="currentColor" height="22px" viewBox="0 0 256 256" width="22px" xmlns="http://www.w3.org/2000/svg">
                <path d="M228.92,49.69a8,8,0,0,0-6.86-1.45C170.81,59.39,128,88.75,102.73,130.68A96.2,96.2,0,0,0,40,120a8,8,0,0,0-8,8,88.1,88.1,0,0,0,88,88,8,8,0,0,0,8-8,96.2,96.2,0,0,0-10.68-62.73C159.25,120,188.61,77.19,230.24,26.06A8,8,0,0,0,228.92,49.69Z"></path>
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-[#111814] dark:text-white tracking-tight">KisanLoop</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ebf7eb] dark:bg-emerald-950 text-[#1b4332] dark:text-emerald-400 border border-[#d2ded5] dark:border-emerald-800">
                  v2.5 LIVE
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#608570] dark:text-emerald-400/80">
                Action &amp; Outcome Layer for Digital Agriculture
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#f4f7f5] dark:bg-zinc-800/60 border border-[#e5ece7] dark:border-white/10 rounded-lg p-1 text-xs">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded transition font-medium ${
                lang === "en"
                  ? "bg-white dark:bg-zinc-900 text-[#111814] dark:text-white font-bold shadow-xs"
                  : "text-[#608570] dark:text-zinc-400"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLang("hi")}
              className={`px-2.5 py-1 rounded transition font-medium ${
                lang === "hi"
                  ? "bg-white dark:bg-zinc-900 text-[#111814] dark:text-white font-bold shadow-xs"
                  : "text-[#608570] dark:text-zinc-400"
              }`}
            >
              हिन्दी
            </button>
          </div>

          <Link
            href="/login"
            className="text-xs font-semibold text-[#1b4332] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Have an account?</span>
            <span className="font-bold">Sign In</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </header>

      {/* Main Split Authentication Frame */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 py-8 md:py-12 flex flex-col justify-center">
        {/* Role Switcher */}
        <div className="w-full max-w-2xl mx-auto mb-8">
          <div className="text-center mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#608570] dark:text-emerald-400">
              Create New Account / नया खाता
            </span>
            <h1 className="text-2xl font-extrabold text-[#111814] dark:text-white tracking-tight mt-0.5">
              {lang === "hi" ? "किसानलूप में शामिल हों" : "Join the KisanLoop Network"}
            </h1>
            <p className="text-xs text-[#608570] dark:text-zinc-400 mt-1">
              Select your organization role to configure your dedicated workspace
            </p>
          </div>

          {/* 4 Role Pill Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#edf2ee] dark:bg-[#18221B] p-1.5 rounded-2xl border border-[#dce6dc] dark:border-white/10">
            {(Object.keys(ROLES) as RoleKey[]).map((key) => {
              const r = ROLES[key];
              const isSelected = selectedRole === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedRole(key)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-white dark:bg-[#214E34] text-[#1b4332] dark:text-white font-bold shadow-md border-[#d2ded5] dark:border-emerald-600"
                      : "text-[#608570] dark:text-zinc-400 hover:text-[#111814] dark:hover:text-white border-transparent"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{r.icon}</span>
                  <span>{lang === "hi" ? r.labelHi : r.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Auth Card Container */}
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-[#18221B] rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Contextual Role Showcase */}
          <div className="md:col-span-5 bg-gradient-to-b from-[#f4f8f5] to-[#ebf3ed] dark:from-[#151e18] dark:to-[#121814] p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#e2ebe4] dark:border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-[#d2ded5] dark:border-white/10 shadow-2xs mb-4">
                <span className="w-2 h-2 rounded-full bg-[#1b4332] dark:bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-bold text-[#1b4332] dark:text-emerald-300 uppercase tracking-wider">
                  {activeConfig.badge}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#111814] dark:text-white tracking-tight leading-snug">
                {activeConfig.title}
              </h3>
              <p className="text-xs text-[#526458] dark:text-zinc-300 mt-2 leading-relaxed">
                {activeConfig.desc}
              </p>

              <div className="mt-6 space-y-2.5 text-xs text-[#334237] dark:text-zinc-300">
                {activeConfig.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-sm text-[#1b4332] dark:text-emerald-400 mt-0.5">
                      check_circle
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#d8e3da] dark:border-white/10 text-xs text-[#608570] dark:text-zinc-400 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#1b4332] dark:text-emerald-400">verified_user</span>
              <span>ICAR Compliant Agronomic Protocol</span>
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#edf2ee] dark:border-white/10">
                <div className="flex items-center gap-1 bg-[#f0f4f1] dark:bg-zinc-800 p-1 rounded-xl border border-[#e0eae2] dark:border-white/10">
                  <Link
                    href="/login"
                    className="px-4 py-1.5 rounded-lg text-xs font-medium text-[#608570] dark:text-zinc-400 hover:text-[#111814] dark:hover:text-white transition cursor-pointer"
                  >
                    Sign In
                  </Link>
                  <span className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-900 text-[#111814] dark:text-white shadow-xs">
                    Create Account
                  </span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111814] dark:text-zinc-200 block">
                    Full Name / पूरा नाम
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ravi Kumar"
                      className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-0 text-foreground dark:text-white transition-colors"
                    />
                    <span className="material-symbols-outlined text-sm text-[#717972] dark:text-zinc-400 absolute left-3 top-3">
                      badge
                    </span>
                  </div>
                </div>

                {/* Email / Mobile */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111814] dark:text-zinc-200 block">
                    Email Address / ईमेल
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ravi.kumar@kisanloop.org"
                      className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-0 text-foreground dark:text-white transition-colors"
                    />
                    <span className="material-symbols-outlined text-sm text-[#717972] dark:text-zinc-400 absolute left-3 top-3">
                      mail
                    </span>
                  </div>
                </div>

                {/* Password & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111814] dark:text-zinc-200 block">
                      Password / पासवर्ड
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs py-2.5 pl-9 pr-10 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-0 text-foreground dark:text-white transition-colors"
                      />
                      <span className="material-symbols-outlined text-sm text-[#717972] dark:text-zinc-400 absolute left-3 top-3">
                        lock
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#717972] dark:text-zinc-400 hover:text-[#111814] dark:hover:text-white"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111814] dark:text-zinc-200 block">
                      Preferred Language / भाषा
                    </label>
                    <div className="relative">
                      <select
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value as "hi" | "en")}
                        className="w-full text-xs py-2.5 pl-9 pr-3 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-0 text-foreground dark:text-white transition-colors"
                      >
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="en">English (English)</option>
                      </select>
                      <span className="material-symbols-outlined text-sm text-[#717972] dark:text-zinc-400 absolute left-3 top-3">
                        translate
                      </span>
                    </div>
                  </div>
                </div>

                {/* Farmer Agricultural Farm Configuration */}
                {selectedRole === "user" && (
                  <div className="p-4 rounded-2xl bg-[#f4f8f5] dark:bg-[#151e18] border border-[#d2ded5] dark:border-white/10 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1b4332] dark:text-emerald-400">
                      <span className="material-symbols-outlined text-sm">yard</span>
                      <span>Cadastral Farm Plot Details / खेत का विवरण</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-[#608570] dark:text-zinc-400 block mb-0.5">
                          State / राज्य
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#608570] dark:text-zinc-400 block mb-0.5">
                          District / जिला
                        </label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#608570] dark:text-zinc-400 block mb-0.5">
                          Village / गाँव
                        </label>
                        <input
                          type="text"
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-[#608570] dark:text-zinc-400 block mb-0.5">
                          Crop Variety / फसल
                        </label>
                        <input
                          type="text"
                          value={cropName}
                          onChange={(e) => setCropName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#608570] dark:text-zinc-400 block mb-0.5">
                          Plot Area (Acres) / एकड़
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={plotArea}
                          onChange={(e) => setPlotArea(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-[#608570] dark:text-zinc-400 block mb-0.5">
                          Irrigation / सिंचाई
                        </label>
                        <select
                          value={irrigationType}
                          onChange={(e) => setIrrigationType(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white"
                        >
                          <option value="Rainfed">Rainfed (वर्षा आधारित)</option>
                          <option value="Borewell">Borewell (बोरवेल)</option>
                          <option value="Canal">Canal (नहर)</option>
                          <option value="Drip">Drip Irrigation (ड्रिप)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#608570] dark:text-zinc-400 block mb-0.5">
                          Soil Type / मिट्टी का प्रकार
                        </label>
                        <select
                          value={soilType}
                          onChange={(e) => setSoilType(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white"
                        >
                          <option value="Loamy">Loamy (दोमट)</option>
                          <option value="Clayey">Clayey (चिकनी)</option>
                          <option value="Sandy">Sandy (बलुई)</option>
                          <option value="Red Laterite">Red Laterite (लाल लेटेराइट)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1b4332] hover:bg-[#143326] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                      <span>Creating Account & Provisioning Node...</span>
                    </span>
                  ) : (
                    <>
                      <span>Complete Registration &amp; Launch</span>
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-6 text-center text-[11px] text-[#717972] dark:text-zinc-400">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#1b4332] dark:text-emerald-400 hover:underline">
                Sign In here
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="w-full bg-white dark:bg-[#18221B] border-t border-[#e5ece7] dark:border-white/10 px-6 py-4 text-center text-xs text-[#608570] dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between max-w-[1240px] mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#111814] dark:text-white">KisanLoop Ecosystem</span>
          <span>• Single Sign-On Portal (User, Agronomist, Government, Admin)</span>
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0 font-medium">
          <Link href="/login" className="hover:underline">
            Farmer UI
          </Link>
          <Link href="/expert" className="hover:underline">
            Expert Portal
          </Link>
          <Link href="/dashboard" className="hover:underline">
            Govt Dashboard
          </Link>
          <Link href="/admin" className="hover:underline">
            Admin Console
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8faf8] dark:bg-[#121814]">
          <div className="flex items-center gap-3 text-xs font-semibold text-[#1b4332] animate-pulse">
            <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
            <span>Loading KisanLoop Signup...</span>
          </div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
