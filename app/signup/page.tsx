"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Stethoscope,
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sprout,
  BadgeCheck,
  Languages,
} from "lucide-react";

type RoleKey = "user" | "expert" | "government" | "admin";

interface RoleMeta {
  key: RoleKey;
  apiRole: "FARMER" | "EXPERT" | "GOVT" | "ADMIN";
  labelEn: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string }>;
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
    icon: User,
    badge: "Farmer Onboarding",
    title: "Direct Action & Daily Farm Recommendations",
    desc: "Join smallholders receiving actionable recommendations calibrated to radar weather forecasts and soil tests.",
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
    icon: Stethoscope,
    badge: "Expert Verification",
    title: "Differential Diagnosis & Agronomic Escalation",
    desc: "Register institutional KVK or University credentials to triage field observations and prescribe approved agrochemical protocols.",
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
    icon: Building2,
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
    icon: ShieldCheck,
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
  const [preferredLanguage, setPreferredLanguage] = useState<"hi" | "en">("en");
  const [lang, setLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("kisanloop-lang");
      if (savedLang === "hi" || savedLang === "en") {
        setLang(savedLang);
        setPreferredLanguage(savedLang);
      }
    } catch {}
  }, []);

  const changeLang = (newLang: "en" | "hi") => {
    setLang(newLang);
    setPreferredLanguage(newLang);
    try {
      localStorage.setItem("kisanloop-lang", newLang);
    } catch {}
  };

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
  const ActiveRoleIcon = activeConfig.icon;

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
    <div className="min-h-screen bg-[#f8faf8] dark:bg-[#121814] text-[#111814] dark:text-zinc-100 font-sans antialiased flex flex-col justify-between selection:bg-emerald-100 dark:selection:bg-emerald-950 overflow-x-hidden w-full">
      {/* Header */}
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
            href="/login"
            className="text-xs font-bold text-[#1b4332] dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Have account?</span>
            <span className="font-bold">Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Split Authentication Frame */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 md:py-10 flex flex-col justify-center">
        {/* Role Switcher */}
        <div className="w-full max-w-2xl mx-auto mb-5 sm:mb-7">
          <div className="text-center mb-2.5 sm:mb-3">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#608570] dark:text-emerald-400">
              Create New Account / नया खाता
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-0.5">
              {lang === "hi" ? "किसानलूप में शामिल हों" : "Join the KisanLoop Network"}
            </h1>
            <p className="text-[11px] sm:text-xs text-[#608570] dark:text-zinc-400 mt-0.5">
              Select your organization role to configure your dedicated workspace
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
                  onClick={() => setSelectedRole(key)}
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
        <div className="w-full max-w-xl mx-auto bg-white dark:bg-[#18221B] rounded-2xl sm:rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xl overflow-hidden p-5 sm:p-7 md:p-8">
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[#edf2ee] dark:border-white/10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4f8f5] dark:bg-white/5 border border-[#d2ded5] dark:border-white/10 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#1b4332] dark:bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#1b4332] dark:text-emerald-300 uppercase tracking-wider">
                  {activeConfig.badge}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#f0f4f1] dark:bg-zinc-800 p-1 rounded-xl border border-[#e0eae2] dark:border-white/10 text-xs">
                <Link
                  href="/login"
                  className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg font-medium text-[#608570] dark:text-zinc-400 hover:text-[#111814] dark:hover:text-white transition"
                >
                  Sign In
                </Link>
                <span className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg font-bold bg-white dark:bg-zinc-900 text-[#111814] dark:text-white shadow-2xs">
                  Create Account
                </span>
              </div>
            </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111814] dark:text-zinc-200 block">
                    Full Name / पूरा नाम
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ravi Kumar"
                      className="w-full text-xs sm:text-sm py-2.5 pl-10 pr-3 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332] text-foreground dark:text-white transition-colors"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-muted-foreground">
                      <User className="w-4 h-4 text-[#608570] dark:text-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#111814] dark:text-zinc-200 block">
                    Email Address / ईमेल
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ravi.kumar@kisanloop.org"
                      className="w-full text-xs sm:text-sm py-2.5 pl-10 pr-3 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332] text-foreground dark:text-white transition-colors"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-muted-foreground">
                      <Mail className="w-4 h-4 text-[#608570] dark:text-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Password & Language */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111814] dark:text-zinc-200 block">
                      Password / पासवर्ड
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs sm:text-sm py-2.5 pl-10 pr-10 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332] text-foreground dark:text-white transition-colors font-mono"
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-muted-foreground">
                        <Lock className="w-4 h-4 text-[#608570] dark:text-zinc-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#717972] dark:text-zinc-400 hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#111814] dark:text-zinc-200 block">
                      Preferred Language / भाषा
                    </label>
                    <div className="relative flex items-center">
                      <select
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value as "hi" | "en")}
                        className="w-full text-xs sm:text-sm py-2.5 pl-10 pr-3 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-[#fafcfa] dark:bg-zinc-900/60 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#1b4332] focus:ring-1 focus:ring-[#1b4332] text-foreground dark:text-white transition-colors"
                      >
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="en">English (English)</option>
                      </select>
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none text-muted-foreground">
                        <Languages className="w-4 h-4 text-[#608570] dark:text-zinc-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Farmer Agricultural Farm Configuration */}
                {selectedRole === "user" && (
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#f4f8f5] dark:bg-[#151e18] border border-[#d2ded5] dark:border-white/10 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1b4332] dark:text-emerald-400">
                      <MapPin className="w-4 h-4" />
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
                          <option value="Rainfed">Rainfed (वर्षा)</option>
                          <option value="Borewell">Borewell (बोरवेल)</option>
                          <option value="Canal">Canal (नहर)</option>
                          <option value="Drip">Drip (ड्रिप)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-[#608570] dark:text-zinc-400 block mb-0.5">
                          Soil Type / मिट्टी
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
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#1b4332] hover:bg-[#143326] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Creating Account &amp; Provisioning Node...</span>
                    </span>
                  ) : (
                    <>
                      <span>Complete Registration &amp; Launch</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-4 sm:mt-6 text-center text-[10px] sm:text-[11px] text-[#717972] dark:text-zinc-400 leading-tight">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#1b4332] dark:text-emerald-400 hover:underline">
                Sign In here
              </Link>
            </div>
          </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-[#18221B] border-t border-[#e5ece7] dark:border-white/10 px-4 sm:px-6 py-3 text-center text-xs text-[#608570] dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between max-w-[1100px] mx-auto gap-2">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="font-bold text-[#111814] dark:text-white">KisanLoop Ecosystem</span>
          <span>• Single Sign-On</span>
        </div>
        <div className="flex items-center gap-3 font-semibold text-[11px] sm:text-xs">
          <Link href="/login" className="hover:underline">Farmer</Link>
          <Link href="/expert" className="hover:underline">Expert</Link>
          <Link href="/dashboard" className="hover:underline">Govt</Link>
          <Link href="/admin" className="hover:underline">Admin</Link>
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
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1b4332] animate-pulse">
            <div className="w-4 h-4 border-2 border-[#1b4332] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading KisanLoop Signup...</span>
          </div>
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
