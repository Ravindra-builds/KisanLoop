"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Building2,
  TrendingUp,
  Users,
  Target,
  ShieldCheck,
  Droplets,
  Coins,
  AlertTriangle,
  ArrowUpRight,
  MapPin,
  BarChart3,
  Layers,
  Globe2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from "recharts";
import { useLanguage } from "../shared/LanguageContext";
import { UserNav } from "../shared/UserNav";

const AgriculturalMap = dynamic(() => import("./AgriculturalMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-2xl bg-muted/40 border flex items-center justify-center text-xs text-muted-foreground animate-pulse">
      Loading GIS Map...
    </div>
  ),
});

export function GovernmentDashboard() {
  const { language, setLanguage, t } = useLanguage();
  const [metrics, setMetrics] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [barriers, setBarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/overview").then((r) => r.json()),
      fetch("/api/dashboard/adoption").then((r) => r.json()),
      fetch("/api/dashboard/barriers").then((r) => r.json()),
    ])
      .then(([mRes, fRes, bRes]) => {
        if (mRes.success) setMetrics(mRes.data);
        if (fRes.success) setFunnel(fRes.data);
        if (bRes.success) setBarriers(bRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const funnelColors = ["#10b981", "#059669", "#047857", "#065f46", "#064e3b"];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Government Dedicated Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-card border-r border-border h-screen sticky top-0 shrink-0 select-none">
        {/* Brand */}
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-foreground flex items-center gap-1.5">
              <span>Kisan</span>
              <span className="text-blue-600">GOVT</span>
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold tracking-wide">
              District Agri Extension Desk
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto text-xs">
          <div className="px-3 py-2 font-bold uppercase tracking-wider text-muted-foreground">
            Regional Telemetry & KPIs
          </div>

          <div className="space-y-1">
            <a
              href="#kpis"
              className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800/40"
            >
              <Target className="w-4 h-4 text-blue-600" />
              <span>Primary KPI (AAR 74%)</span>
            </a>

            <a
              href="#funnel"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground font-semibold transition"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Adoption Funnel</span>
            </a>

            <a
              href="#barriers"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground font-semibold transition"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Barrier Distribution</span>
            </a>

            <a
              href="#gis-map"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground font-semibold transition"
            >
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>Spatial Risk Hotspots</span>
            </a>
          </div>
        </div>

        {/* Official Identity Badge */}
        <div className="p-4 border-t bg-muted/20 space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Language</span>
            </span>
            <div className="flex items-center bg-muted rounded-xl p-0.5 border text-xs">
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  language === "hi"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                HI
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 rounded-lg font-bold transition ${
                  language === "en"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Official Identity Badge & Sign Out */}
          <UserNav accentColor="blue" />
        </div>
      </aside>

      {/* Mobile Header for Govt */}
      <header className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-foreground">
              Kisan<span className="text-blue-600">GOVT</span>
            </span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">
              Ranchi Agri Extension
            </span>
          </div>
        </div>

        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
          AAR 74%
        </span>
      </header>

      {/* Main Analytics Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
          <div>
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
              <Building2 className="w-6 h-6" />
              <h1 className="text-2xl font-black text-foreground">
                {language === "hi"
                  ? "जिला कृषि प्रसार एवं अंगीकरण पटल"
                  : "District Agricultural Extension & Adoption Intelligence"}
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Region: <strong className="text-foreground">Ranchi District (Eastern Plateau & Hills Zone)</strong> • Closing the Last-Mile Action Loop
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300">
            Official Pilot Coverage: 1,450 Farm Plots
          </div>
        </div>

        {/* Primary KPI Highlights */}
        {metrics && (
          <div id="kpis" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-600 to-green-800 text-white rounded-2xl p-5 shadow-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-emerald-200 tracking-wider">
                  Primary KPI
                </span>
                <Target className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="text-3xl font-black">{metrics.actionableAdvisoryRate}%</div>
              <div className="text-xs text-emerald-100 font-medium">
                {t("actionableAdvisoryRate")}
              </div>
              <div className="text-[11px] text-emerald-200/80 pt-1 border-t border-emerald-500/40">
                Verified actions / eligible recommendations
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase font-bold tracking-wider">
                  Farmer Adoption Rate
                </span>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-foreground">{metrics.adoptionRate}%</div>
              <div className="text-xs text-muted-foreground">
                {metrics.completedActions} of {metrics.totalRecommendations} actions completed
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold pt-1 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+14% vs conventional SMS broadcast</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase font-bold tracking-wider">
                  Conserved Groundwater
                </span>
                <Droplets className="w-5 h-5 text-cyan-600" />
              </div>
              <div className="text-3xl font-black text-foreground">
                {(metrics.totalWaterSavedLiters / 100000).toFixed(1)} Lakh L
              </div>
              <div className="text-xs text-muted-foreground">
                Through precision rainfall hold advisories
              </div>
              <div className="text-[11px] text-cyan-600 font-semibold pt-1">
                Avoided pumping electricity waste
              </div>
            </div>

            <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase font-bold tracking-wider">
                  Farmer Capital Saved
                </span>
                <Coins className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-foreground">
                ₹{(metrics.totalCostSavedInr / 100000).toFixed(2)} Lakh
              </div>
              <div className="text-xs text-muted-foreground">
                Saved in diesel pumping & chemical costs
              </div>
              <div className="text-[11px] text-amber-600 font-semibold pt-1">
                Across registered pilot plots
              </div>
            </div>
          </div>
        )}

        {/* Charts: Funnel & Barriers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Adoption Funnel */}
          <div id="funnel" className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground">
                  {language === "hi" ? "कार्रवाई फनल (Action Adoption Funnel)" : "Adoption Intelligence Funnel"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  From Intelligence Delivered to Verified Field Outcome
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                5 Stages
              </span>
            </div>

            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnel} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {funnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={funnelColors[index % funnelColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Barrier Breakdown */}
          <div id="barriers" className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground">
                  {language === "hi" ? "अंगीकरण बाधा विश्लेषण (Adoption Barriers)" : "Adoption Barrier Analysis"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Why Farmers Couldn't Execute Recommended Actions
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-800">
                Direct Feedback
              </span>
            </div>

            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barriers} margin={{ top: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="reason"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#f59e0b" radius={[8, 8, 0, 0]} name="% of Farmers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* GIS Hotspots */}
        <div id="gis-map" className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
                <MapPin className="w-5 h-5" />
                <h3 className="font-bold text-base text-foreground">
                  {language === "hi" ? "भू-स्थानिक कृषि जोखिम नक्शा (GIS Map)" : "Regional Crop Risk & Pilot Farm GIS"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ranchi district plots, IMD heavy rainfall warning contour, and live field status
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Monsoon Rain Alert Zone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-muted-foreground">Hero Pilot: Ravi Kumar</span>
              </div>
            </div>
          </div>

          <AgriculturalMap />
        </div>
      </main>
    </div>
  );
}
