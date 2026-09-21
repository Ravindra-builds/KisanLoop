"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import AppIcon from "@/components/shared/AppIcon";
import { ProfileSetupModal } from "@/components/shared/ProfileSetupModal";
import { ProfileAvatar, ProfileAvatarPickerModal } from "@/components/shared/ProfileAvatarPicker";
import { useAppLogout } from "@/lib/auth/useAppLogout";

const AgriculturalMap = dynamic(() => import("@/components/dashboard/AgriculturalMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full rounded-2xl bg-muted/40 border flex items-center justify-center text-xs text-muted-foreground animate-pulse">
      Loading Agricultural GIS Map...
    </div>
  ),
});

interface BlockData {
  name: string;
  totalPlots: number;
  aarRate: number;
  primaryRisk: string;
  status: "CRITICAL" | "ATTENTION" | "OPTIMAL";
  completedActions: number;
}

const BLOCKS_DATA: BlockData[] = [
  { name: "Namkum Block", totalPlots: 1420, aarRate: 68.4, primaryRisk: "Leaf Blast Spore Surge", status: "CRITICAL", completedActions: 970 },
  { name: "Kanke Block", totalPlots: 1180, aarRate: 72.1, primaryRisk: "Fall Armyworm Spotting", status: "ATTENTION", completedActions: 850 },
  { name: "Ratu Block", totalPlots: 940, aarRate: 61.5, primaryRisk: "Nitrogen Leaching Post-Rain", status: "ATTENTION", completedActions: 580 },
  { name: "Ormanjhi Block", totalPlots: 820, aarRate: 76.8, primaryRisk: "Optimal Soil Moisture", status: "OPTIMAL", completedActions: 630 },
  { name: "Bero Block", totalPlots: 460, aarRate: 59.2, primaryRisk: "Borewell Water Salinity", status: "CRITICAL", completedActions: 270 },
];

export function GovernmentDashboard() {
  const [activeModule, setActiveModule] = useState<"overview" | "funnel" | "barriers" | "gis-map" | "outcomes" | "profile">("overview");
  const [selectedDistrict, setSelectedDistrict] = useState("Ranchi District (18 Blocks)");
  const [selectedSeason, setSelectedSeason] = useState("Kharif Season 2024");
  const [selectedBlock, setSelectedBlock] = useState<BlockData>(BLOCKS_DATA[0]);
  const [mandateTarget, setMandateTarget] = useState(70);
  const [currentAAR, setCurrentAAR] = useState(64.2);

  // Profile & Role Switcher State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [officialName, setOfficialName] = useState("Dr. S. K. Tirkey");
  const [officialDesignation, setOfficialDesignation] = useState("Joint Director Agriculture");
  const [officialDepartment, setOfficialDepartment] = useState("Ranchi District Agriculture Office");
  const [officialEmail, setOfficialEmail] = useState("jtdir.agri.ranchi@jharkhand.gov.in");
  const [officialPhone, setOfficialPhone] = useState("+91 94311 88201");
  const [officialEmployeeId, setOfficialEmployeeId] = useState("JH-AGRI-DIR-1082");
  const [officialDistrict, setOfficialDistrict] = useState("Ranchi");
  const [officialState, setOfficialState] = useState("Jharkhand");
  const [officialOfficeAddress, setOfficialOfficeAddress] = useState("District Agriculture Office, Krishi Bhawan, Kanke Road, Ranchi - 834008");
  const [officialJurisdiction, setOfficialJurisdiction] = useState("18 Blocks • South Chota Nagpur Division");
  const [officialSchemes, setOfficialSchemes] = useState("PM-KISAN, NFSM, Soil Health Card, RKVY");
  const [savingProfile, setSavingProfile] = useState(false);
  const [userRole, setUserRole] = useState<"FARMER" | "EXPERT" | "GOVT" | "ADMIN">("GOVT");
  const [officialAvatar, setOfficialAvatar] = useState("icon:landmark");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.user) {
          const u = res.data.user;
          if (u.name && u.name !== "Farmer") setOfficialName(u.name);
          if (u.email) setOfficialEmail(u.email);
          if (u.role) setUserRole(u.role);
          if (u.avatar) setOfficialAvatar(u.avatar);
          if (res.data.isProfileComplete === false) {
            setShowProfileModal(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveGovtProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "GOVT",
          name: officialName,
          phone: officialPhone,
          designation: officialDesignation,
          department: officialDepartment,
          district: officialDistrict,
          state: officialState,
          avatar: officialAvatar,
        }),
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Official Profile Saved", "Directorate profile and credentials updated successfully.", "verified");
      } else {
        triggerToast("Save Error", data.error || "Failed to update profile.", "error");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("Error", "Network error saving profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  // Modals & Popups
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; icon: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  const triggerToast = (title: string, message: string, icon = "check_circle") => {
    setToast({ title, message, icon });
    setTimeout(() => setToast(null), 3800);
  };

  const { logout: handleLogout } = useAppLogout();

  const handleExportBrief = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setShowExportModal(false);
      triggerToast(
        "Brief Exported",
        "Ranchi_District_Agronomic_Brief_Kharif2024.pdf compiled and downloaded.",
        "download"
      );
    }, 1500);
  };

  return (
    <div className="bg-[#f1fcf1] dark:bg-[#121814] text-[#141e17] dark:text-zinc-100 min-h-screen font-sans flex antialiased selection:bg-emerald-100 dark:selection:bg-emerald-950 w-full overflow-x-hidden">
      {/* ==================================================================== */}
      {/* LEFT GLOBAL COMMAND SIDEBAR                                          */}
      {/* ==================================================================== */}
      <aside className="w-64 bg-white dark:bg-[#18221B] border-r border-[#dce6dc] dark:border-white/10 flex flex-col justify-between shrink-0 hidden md:flex z-20">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-[#e5ece7] dark:border-white/10 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="KisanLoop"
                className="w-9 h-9 object-contain rounded-xl shadow-xs shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="flex flex-col">
                <span className="font-black text-base text-[#05371f] dark:text-emerald-400 tracking-tight leading-none">
                  KisanLoop
                </span>
                <span className="text-[10px] text-[#4f6351] dark:text-zinc-400 font-semibold tracking-wide mt-0.5">
                  Govt &amp; Extension
                </span>
              </div>
            </Link>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-[#ebf7eb] dark:bg-emerald-950 text-[#05371f] dark:text-emerald-400 rounded-full border border-[#d2ded5] dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
            <div className="text-[10px] uppercase font-bold text-[#4f6351] dark:text-zinc-400 px-3 py-1.5 tracking-wider">
              Decision Modules
            </div>

            <button
              type="button"
              onClick={() => setActiveModule("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeModule === "overview"
                  ? "bg-[#214e34] text-white shadow-xs"
                  : "text-[#4f6351] dark:text-zinc-300 hover:bg-[#eaf0ed] dark:hover:bg-zinc-800"
              }`}
            >
              <AppIcon name="dashboard" className="w-6 h-6" />
              <span>Overview &amp; KPIs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule("funnel")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeModule === "funnel"
                  ? "bg-[#214e34] text-white shadow-xs"
                  : "text-[#4f6351] dark:text-zinc-300 hover:bg-[#eaf0ed] dark:hover:bg-zinc-800"
              }`}
            >
              <AppIcon name="conversion_path" className="w-6 h-6" />
              <span>Adoption Funnel</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule("barriers")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeModule === "barriers"
                  ? "bg-[#214e34] text-white shadow-xs"
                  : "text-[#4f6351] dark:text-zinc-300 hover:bg-[#eaf0ed] dark:hover:bg-zinc-800"
              }`}
            >
              <AppIcon name="block" className="w-6 h-6" />
              <span>Barrier Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule("gis-map")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeModule === "gis-map"
                  ? "bg-[#214e34] text-white shadow-xs"
                  : "text-[#4f6351] dark:text-zinc-300 hover:bg-[#eaf0ed] dark:hover:bg-zinc-800"
              }`}
            >
              <AppIcon name="map" className="w-6 h-6" />
              <span>PostGIS Hotspot Map</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule("outcomes")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeModule === "outcomes"
                  ? "bg-[#214e34] text-white shadow-xs"
                  : "text-[#4f6351] dark:text-zinc-300 hover:bg-[#eaf0ed] dark:hover:bg-zinc-800"
              }`}
            >
              <AppIcon name="verified_user" className="w-6 h-6" />
              <span>Verified Outcomes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveModule("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                activeModule === "profile"
                  ? "bg-[#214e34] text-white shadow-xs"
                  : "text-[#4f6351] dark:text-zinc-300 hover:bg-[#eaf0ed] dark:hover:bg-zinc-800"
              }`}
            >
              <AppIcon name="person" className="w-6 h-6" />
              <span>Official Profile</span>
            </button>

            {/* Mandate Target Card */}
            <div className="pt-4 mt-4 border-t border-[#e2ebe4] dark:border-white/10">
              <div className="p-3 bg-[#ebf7eb] dark:bg-[#151e18] rounded-xl border border-[#d2ded5] dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#05371f] dark:text-emerald-400 uppercase tracking-wider">
                    North Star Mandate
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTargetModal(true)}
                    className="p-1 text-slate-500 hover:text-black dark:hover:text-white cursor-pointer"
                    title="Adjust Mandate Target"
                  >
                    <AppIcon name="tune" className="w-5 h-5 text-xs" />
                  </button>
                </div>
                <div className="text-xs font-semibold text-[#141e17] dark:text-zinc-200">
                  Target AAR: <strong className="text-[#05371f] dark:text-emerald-400">{mandateTarget}%</strong>
                </div>
                <div className="w-full h-1.5 bg-[#dce6dc] dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#05371f] dark:bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(currentAAR / mandateTarget) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#4f6351] dark:text-zinc-400">
                  <span>Current: {currentAAR}%</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">+8.6% vs SMS</span>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Sidebar Bottom: Official Profile & Logout */}
        <div className="p-3.5 border-t border-[#e5ece7] dark:border-white/10 bg-white dark:bg-[#18221B] space-y-2.5">
          <div className="flex items-center justify-between px-2 py-1 bg-[#ebf7eb] dark:bg-zinc-900 rounded-lg text-[10px] font-semibold text-[#05371f] dark:text-emerald-400 border border-[#d2ded5] dark:border-white/10">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              AgriStack e-KYC
            </span>
            <button
              type="button"
              onClick={() => setShowSyncModal(true)}
              className="text-secondary hover:underline cursor-pointer"
            >
              Ranchi Dept
            </button>
          </div>

          <div
            onClick={() => setActiveModule("profile")}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[#ebf7eb] dark:hover:bg-zinc-800 cursor-pointer transition"
            title="View & Edit Official Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-[#05371f] text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {officialName
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "GO"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-[#141e17] dark:text-white truncate">
                {officialName}
              </span>
              <span className="text-[10px] text-[#4f6351] dark:text-zinc-400 truncate">
                {officialDesignation}
              </span>
            </div>
          </div>

          {/* Sidebar Universal Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-red-200 dark:border-red-900/40"
          >
            <AppIcon name="logout" className="w-4 h-4" />
            <span>Logout from Govt Desk</span>
          </button>
        </div>
      </aside>

      {/* ==================================================================== */}
      {/* MAIN WORK SURFACE                                                    */}
      {/* ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Top Header Bar */}
        <header className="h-16 px-3 sm:px-6 bg-white dark:bg-[#18221B] border-b border-[#e5ece7] dark:border-white/10 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-2xs w-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm sm:text-base md:text-lg text-[#05371f] dark:text-emerald-400 leading-tight truncate">
                  District Agriculture Decision Center
                </h1>
                <span className="px-2 py-0.5 bg-[#cfe6cf] dark:bg-zinc-800 text-[#183323] dark:text-emerald-300 rounded text-[10px] sm:text-[11px] font-bold shrink-0">
                  {selectedDistrict}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#4f6351] dark:text-zinc-400 truncate hidden sm:block">
                18 Blocks Covered • 4,820 Active Cadastral Plots Monitored
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Season Selector */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#ebf7eb] dark:bg-zinc-800 rounded-xl text-xs font-semibold text-[#05371f] dark:text-zinc-200 border border-[#d2ded5] dark:border-white/10">
              <AppIcon name="calendar_today" className="w-4 h-4  text-[#4f6351]" />
              <span>{selectedSeason}</span>
            </div>

            {/* Export Brief Button */}
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 bg-[#05371f] hover:bg-[#163624] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <AppIcon name="picture_as_pdf" className="w-4 h-4" />
              <span className="hidden sm:inline">Export District Brief</span>
              <span className="sm:hidden">Brief</span>
            </button>

            {/* Official Profile Avatar Button */}
            <div
              onClick={() => setActiveModule("profile")}
              className="flex items-center gap-2 pl-2 border-l border-[#eaf0ed] dark:border-white/10 cursor-pointer hover:opacity-85 transition"
              title="View & Edit Official Profile"
            >
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#141e17] dark:text-white leading-tight">{officialName}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">{officialDesignation}</span>
              </div>
              <ProfileAvatar
                avatar={officialAvatar}
                role="GOVT"
                name={officialName}
                size="sm"
              />
            </div>

            {/* Quick Header Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl border border-red-200 text-xs font-bold shadow-xs transition-all cursor-pointer hover:shadow-sm"
              title="Logout from Government Desk"
            >
              <AppIcon name="logout" className="w-4 h-4 text-red-600" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Tabs for Small Screens */}
        <div className="md:hidden flex items-center gap-1.5 overflow-x-auto px-3 py-2 bg-white dark:bg-[#18221B] border-b border-[#e5ece7] dark:border-white/10 scrollbar-none w-full">
          <button
            type="button"
            onClick={() => setActiveModule("overview")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeModule === "overview"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-[#f1fcf1] dark:bg-zinc-800 text-[#4f6351] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Overview &amp; KPIs
          </button>
          <button
            type="button"
            onClick={() => setActiveModule("funnel")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeModule === "funnel"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-[#f1fcf1] dark:bg-zinc-800 text-[#4f6351] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Adoption Funnel
          </button>
          <button
            type="button"
            onClick={() => setActiveModule("barriers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeModule === "barriers"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-[#f1fcf1] dark:bg-zinc-800 text-[#4f6351] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Barrier Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveModule("gis-map")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeModule === "gis-map"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-[#f1fcf1] dark:bg-zinc-800 text-[#4f6351] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Hotspot Map
          </button>
          <button
            type="button"
            onClick={() => setActiveModule("outcomes")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeModule === "outcomes"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-[#f1fcf1] dark:bg-zinc-800 text-[#4f6351] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Field Outcomes
          </button>
          <button
            type="button"
            onClick={() => setActiveModule("profile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeModule === "profile"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-[#f1fcf1] dark:bg-zinc-800 text-[#4f6351] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Official Profile
          </button>
        </div>

        {/* Content Body */}
        <main className="p-3.5 sm:p-6 md:p-8 max-w-[1320px] mx-auto w-full space-y-6 overflow-x-hidden">
          {/* ================================================================= */}
          {/* MODULE 1: OVERVIEW & 4 KPI BENCHMARKS                             */}
          {/* ================================================================= */}
          {(activeModule === "overview" || activeModule === "outcomes") && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Actionable Advisory Rate Gauge */}
                <div className="p-5 bg-white dark:bg-[#18221B] rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f6351] dark:text-zinc-400 block">
                      Actionable Advisory Rate (AAR)
                    </span>
                    <div className="text-3xl font-black text-[#05371f] dark:text-white tracking-tight">
                      {currentAAR}%
                    </div>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block">
                      +52.2% over generic SMS
                    </span>
                  </div>

                  {/* Circular Gauge SVG */}
                  <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-[#e0ebe0] dark:text-zinc-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#05371f] dark:text-emerald-400 transition-all duration-1000"
                        strokeDasharray={`${currentAAR}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <AppIcon name="speed" className="w-6 h-6  text-[#05371f] dark:text-emerald-400 absolute" />
                  </div>
                </div>

                {/* KPI 2: Verified Actions Completed */}
                <div className="p-5 bg-white dark:bg-[#18221B] rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f6351] dark:text-zinc-400">
                      Actions Verified Done
                    </span>
                    <AppIcon name="check_circle" className="w-4 h-4  text-[#05371f] dark:text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-[#141e17] dark:text-white tracking-tight">
                    5,100
                  </div>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block">
                    84.2% adoption in 48h window
                  </span>
                </div>

                {/* KPI 3: Input Barrier Rate */}
                <div className="p-5 bg-white dark:bg-[#18221B] rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f6351] dark:text-zinc-400">
                      Input Barrier Rate
                    </span>
                    <AppIcon name="report_problem" className="w-4 h-4  text-amber-600" />
                  </div>
                  <div className="text-3xl font-black text-[#141e17] dark:text-white tracking-tight">
                    28.4%
                  </div>
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold block">
                    38% Chemical stockout in retail
                  </span>
                </div>

                {/* KPI 4: Conserved Groundwater */}
                <div className="p-5 bg-white dark:bg-[#18221B] rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f6351] dark:text-zinc-400">
                      Conserved Groundwater
                    </span>
                    <AppIcon name="water_drop" className="w-4 h-4  text-blue-600" />
                  </div>
                  <div className="text-3xl font-black text-[#141e17] dark:text-white tracking-tight">
                    1.8M L
                  </div>
                  <span className="text-[11px] text-blue-700 dark:text-blue-400 font-bold block">
                    240 pump hours spared (rain forecast)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 2: ADOPTION FUNNEL                                         */}
          {/* ================================================================= */}
          {(activeModule === "overview" || activeModule === "funnel") && (
            <div className="p-6 bg-white dark:bg-[#18221B] rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#141e17] dark:text-white tracking-tight">
                    Closed-Loop Advisory Adoption Funnel
                  </h3>
                  <p className="text-xs text-[#4f6351] dark:text-zinc-400">
                    Measuring friction from automated AI generation through verified field implementation
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ebf7eb] text-[#05371f] border border-[#d2ded5]">
                  41.1% End-to-End Execution
                </span>
              </div>

              {/* 4-Stage Funnel Bars */}
              <div className="space-y-3.5">
                {/* Stage 1 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#141e17] dark:text-white">
                      1. Generated &amp; Radar Verified (ICAR Protocols)
                    </span>
                    <span className="font-mono text-[#05371f] dark:text-emerald-400">12,400 (100%)</span>
                  </div>
                  <div className="w-full h-3 bg-[#e0ebe0] dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#05371f] dark:bg-emerald-600 rounded-full w-full"></div>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#141e17] dark:text-white">
                      2. Delivered &amp; Audio Opened by Smallholder
                    </span>
                    <span className="font-mono text-[#05371f] dark:text-emerald-400">9,820 (79.2%)</span>
                  </div>
                  <div className="w-full h-3 bg-[#e0ebe0] dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#214e34] dark:bg-emerald-500 rounded-full w-[79.2%]"></div>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#141e17] dark:text-white">
                      3. Feasibility Confirmed (Labor, Rain Window, Stock)
                    </span>
                    <span className="font-mono text-[#05371f] dark:text-emerald-400">7,950 (64.1%)</span>
                  </div>
                  <div className="w-full h-3 bg-[#e0ebe0] dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#4f6351] dark:bg-emerald-400 rounded-full w-[64.1%]"></div>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#141e17] dark:text-white">
                      4. Verified Actioned &amp; Outcome Registered
                    </span>
                    <span className="font-mono text-[#05371f] dark:text-emerald-400">5,100 (41.1%)</span>
                  </div>
                  <div className="w-full h-3 bg-[#e0ebe0] dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 dark:bg-emerald-300 rounded-full w-[41.1%]"></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#f1fcf1] dark:bg-zinc-900/50 rounded-2xl border border-[#d2ded5] text-xs text-[#4f6351] dark:text-zinc-400 flex items-center justify-between">
                <span>
                  💡 <strong>Drop-off Insight:</strong> Largest loss occurs between Feasibility Check and Action (2,850 farmers cited chemical stockouts in village cooperative stores).
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModule("barriers")}
                  className="text-[#05371f] dark:text-emerald-400 font-bold hover:underline shrink-0 ml-3"
                >
                  Analyze Barriers →
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 3: HYPERLOCAL BARRIER ANALYTICS                            */}
          {/* ================================================================= */}
          {(activeModule === "overview" || activeModule === "barriers") && (
            <div className="p-6 bg-white dark:bg-[#18221B] rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#141e17] dark:text-white tracking-tight">
                    Hyperlocal Smallholder Barrier Analytics
                  </h3>
                  <p className="text-xs text-[#4f6351] dark:text-zinc-400">
                    Why farmers could not execute recommended actions (collected via "What stopped you?" modal)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => triggerToast("Intervention Plan", "Department subsidy notification drafted for Namkum.", "send")}
                  className="px-3.5 py-1.5 bg-[#05371f] hover:bg-[#163624] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Issue Input Subsidy Rake
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Input Stockout in Local Kendra</span>
                      <span className="text-red-600 font-mono">38.2% (1,088 cases)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full w-[38.2%]"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Formulation Cost Exceeded Budget</span>
                      <span className="text-amber-600 font-mono">26.4% (752 cases)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[26.4%]"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Labor Shortage during 48h Window</span>
                      <span className="text-blue-600 font-mono">18.1% (516 cases)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-[18.1%]"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Fear of Washout from Cloudburst</span>
                      <span className="text-emerald-600 font-mono">11.5% (328 cases)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[11.5%]"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span>Other / Tenancy Restrictions</span>
                      <span className="text-slate-500 font-mono">5.8% (166 cases)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full w-[5.8%]"></div>
                    </div>
                  </div>
                </div>

                {/* Remedial Action Box */}
                <div className="p-4 bg-[#ebf7eb] dark:bg-zinc-900/60 rounded-2xl border border-[#d2ded5] dark:border-white/10 space-y-3">
                  <div className="font-bold text-xs text-[#05371f] dark:text-emerald-400 flex items-center gap-1.5">
                    <AppIcon name="inventory" className="w-4 h-4" />
                    <span>Policy Recommendation for Ranchi Extension</span>
                  </div>
                  <p className="text-xs text-[#4f6351] dark:text-zinc-300 leading-relaxed">
                    Tricyclazole 75 WP stockout in 6 Primary Agricultural Credit Societies (PACS) in Namkum. Direct intervention required: reroute 400 kg buffer supply from central warehouse to restore feasibility for 1,088 smallholders.
                  </p>
                  <button
                    type="button"
                    onClick={() => triggerToast("Rake Dispatched", "Emergency buffer consignment allocated to Namkum PACS.", "local_shipping")}
                    className="w-full py-2 bg-[#05371f] hover:bg-[#163624] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Reroute Buffer Stock to Namkum PACS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 4: POSTGIS HOTSPOT MAP & BLOCK TABLE                       */}
          {/* ================================================================= */}
          {(activeModule === "overview" || activeModule === "gis-map") && (
            <div className="p-6 bg-white dark:bg-[#18221B] rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-[#141e17] dark:text-white tracking-tight">
                    Cadastral PostGIS Disease &amp; Weather Hotspot Map
                  </h3>
                  <p className="text-xs text-[#4f6351] dark:text-zinc-400">
                    High-resolution spatial clustering across Ranchi's 18 administrative blocks
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Select Block:</span>
                  <select
                    value={selectedBlock.name}
                    onChange={(e) => {
                      const b = BLOCKS_DATA.find((x) => x.name === e.target.value);
                      if (b) setSelectedBlock(b);
                    }}
                    className="px-2.5 py-1.5 bg-[#ebf7eb] dark:bg-zinc-800 rounded-xl text-xs font-bold border border-[#d2ded5] text-[#05371f] dark:text-white"
                  >
                    {BLOCKS_DATA.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} ({b.totalPlots} Plots)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Interactive Agricultural GIS Map */}
              <div className="w-full">
                <AgriculturalMap />
              </div>

              {/* Block Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {BLOCKS_DATA.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => setSelectedBlock(b)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedBlock.name === b.name
                        ? "border-[#05371f] bg-[#ebf7eb] dark:bg-zinc-800 shadow-xs"
                        : "border-[#e2ebe4] bg-white dark:bg-zinc-900 hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-xs font-bold text-[#141e17] dark:text-white truncate">{b.name}</div>
                    <div className="text-[11px] text-[#4f6351] dark:text-zinc-400 mt-0.5">{b.totalPlots} Plots</div>
                    <div className="mt-2 flex items-center justify-between text-xs font-black">
                      <span className="text-[#05371f] dark:text-emerald-400">{b.aarRate}% AAR</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                          b.status === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : b.status === "ATTENTION"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODULE 5: OFFICIAL PROFILE & GOVERNANCE DESK                      */}
          {/* ================================================================= */}
          {activeModule === "profile" && (
            <div className="space-y-6">
              {/* Top Official Banner Card */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ProfileAvatar
                      avatar={officialAvatar}
                      role="GOVT"
                      name={officialName}
                      size="xl"
                      showBadge={true}
                      onClick={() => setShowAvatarModal(true)}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-black text-[#141e17] dark:text-white">{officialName}</h2>
                      <button
                        type="button"
                        onClick={() => setShowAvatarModal(true)}
                        className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <AppIcon name="photo_camera" className="w-3.5 h-3.5" />
                        <span>Change Icon / Avatar</span>
                      </button>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                        Authorized Gazetted Officer (Class-I)
                      </span>
                    </div>
                    <p className="text-xs text-[#4f6351] dark:text-zinc-300 font-semibold">{officialDesignation}</p>
                    <div className="flex items-center gap-3 text-xs text-[#4f6351] dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <AppIcon name="domain" className="w-3.5 h-3.5 text-[#05371f] dark:text-emerald-400" />
                        {officialDepartment}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <AppIcon name="badge" className="w-3.5 h-3.5 text-[#05371f] dark:text-emerald-400" />
                        Emp ID: {officialEmployeeId}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#ebf7eb] dark:bg-zinc-800 hover:bg-[#dce6dc] text-[#05371f] dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <AppIcon name="switch_account" className="w-4 h-4" />
                    <span>Switch Role</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGovtProfile}
                    disabled={savingProfile}
                    className="px-5 py-2 rounded-xl bg-[#05371f] hover:bg-[#163624] text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <AppIcon name="save" className={`w-4 h-4 ${savingProfile ? "animate-spin" : ""}`} />
                    <span>{savingProfile ? "Saving Profile..." : "Save Profile"}</span>
                  </button>
                </div>
              </div>

              {/* Administrative Impact Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f6351] dark:text-zinc-400">Jurisdiction</span>
                    <AppIcon name="map" className="w-4 h-4 text-[#05371f] dark:text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-[#141e17] dark:text-white tracking-tight mt-1">18 Blocks</p>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Ranchi District</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f6351] dark:text-zinc-400">Registered Farmers</span>
                    <AppIcon name="groups" className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-[#141e17] dark:text-white tracking-tight mt-1">18,420+</p>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">AgriStack e-KYC linked</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f6351] dark:text-zinc-400">Active DBT Schemes</span>
                    <AppIcon name="payments" className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-black text-[#141e17] dark:text-white tracking-tight mt-1">4 Schemes</p>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">PM-KISAN &amp; NFSM</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#4f6351] dark:text-zinc-400">Advisory AAR</span>
                    <AppIcon name="speed" className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-[#141e17] dark:text-white tracking-tight mt-1">{currentAAR}%</p>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">+52.2% vs baseline</span>
                </div>
              </div>

              {/* 2-Column Editable Official Profile Form */}
              <form onSubmit={handleSaveGovtProfile} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Official Administrative Details */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#eaf0ed] dark:border-white/10 pb-3">
                    <AppIcon name="account_balance" className="w-5 h-5 text-[#05371f] dark:text-emerald-400" />
                    <h3 className="font-bold text-sm text-[#141e17] dark:text-white">Official Administrative Profile</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">Official Officer Full Name</label>
                      <input
                        type="text"
                        value={officialName}
                        onChange={(e) => setOfficialName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none"
                        placeholder="e.g. Dr. S. K. Tirkey"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">Official Designation / Rank</label>
                        <input
                          type="text"
                          value={officialDesignation}
                          onChange={(e) => setOfficialDesignation(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none"
                          placeholder="Joint Director Agriculture"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">Employee ID / Service Code</label>
                        <input
                          type="text"
                          value={officialEmployeeId}
                          onChange={(e) => setOfficialEmployeeId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none font-mono"
                          placeholder="JH-AGRI-DIR-1082"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">Department / Directorate</label>
                      <input
                        type="text"
                        value={officialDepartment}
                        onChange={(e) => setOfficialDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none"
                        placeholder="Ranchi District Agriculture Office, Dept of Agri"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">Jurisdictional Division &amp; Scope</label>
                      <input
                        type="text"
                        value={officialJurisdiction}
                        onChange={(e) => setOfficialJurisdiction(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none"
                        placeholder="18 Blocks • South Chota Nagpur Division"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column: Contact & Office Location */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#eaf0ed] dark:border-white/10 pb-3">
                    <AppIcon name="location_city" className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-sm text-[#141e17] dark:text-white">Headquarters &amp; Contact Information</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">Official Gov Email</label>
                        <input
                          type="email"
                          value={officialEmail}
                          onChange={(e) => setOfficialEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none"
                          placeholder="officer@jharkhand.gov.in"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">Official Desk Hotline</label>
                        <input
                          type="tel"
                          value={officialPhone}
                          onChange={(e) => setOfficialPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none"
                          placeholder="+91 94311 88201"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">District Headquarters</label>
                        <input
                          type="text"
                          value={officialDistrict}
                          onChange={(e) => setOfficialDistrict(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none"
                          placeholder="Ranchi"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">State</label>
                        <input
                          type="text"
                          value={officialState}
                          onChange={(e) => setOfficialState(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none"
                          placeholder="Jharkhand"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">Office Physical Address</label>
                      <input
                        type="text"
                        value={officialOfficeAddress}
                        onChange={(e) => setOfficialOfficeAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none"
                        placeholder="District Agriculture Office, Krishi Bhawan, Kanke Road..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#141e17] dark:text-zinc-200 mb-1">Assigned DBT Subsidy &amp; Extension Mandates</label>
                      <input
                        type="text"
                        value={officialSchemes}
                        onChange={(e) => setOfficialSchemes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-slate-50/50 dark:bg-zinc-900 text-xs font-medium focus:ring-2 focus:ring-[#05371f] outline-none"
                        placeholder="PM-KISAN, NFSM, Soil Health Card, RKVY"
                      />
                    </div>

                    <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40 text-[11px] text-[#05371f] dark:text-emerald-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AppIcon name="security" className="w-3.5 h-3.5" />
                        AgriStack e-KYC &amp; Direct Benefit Transfer Authentication
                      </div>
                      <p className="text-[10px] text-[#4f6351] dark:text-zinc-400">
                        This administrative account is linked to the Jharkhand e-Samarth portal and authorized to validate input barrier allocations and DBT subsidy disbursements.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Submit Actions */}
                <div className="lg:col-span-2 flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModule("overview")}
                    className="px-4 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/10 text-xs font-bold text-[#4f6351] dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition cursor-pointer"
                  >
                    ← Back to Overview
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 rounded-xl bg-[#05371f] hover:bg-[#163624] text-white text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <AppIcon name="check" className={`w-4 h-4 ${savingProfile ? "animate-spin" : ""}`} />
                    <span>{savingProfile ? "Saving Profile..." : "Save Official Profile Changes"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: EXPORT BRIEF MODAL                                          */}
      {/* ==================================================================== */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18221B] rounded-3xl max-w-md w-full p-6 border border-[#d2ded5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#05371f] dark:text-emerald-400 font-black text-base">
                <AppIcon name="picture_as_pdf" className="w-5 h-5" />
                <span>Export District Agronomic Brief</span>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <AppIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#4f6351] dark:text-zinc-300 leading-relaxed">
              Generate a formatted PDF executive summary for the Directorate of Agriculture, Government of Jharkhand, containing 48-hour adoption rates, barrier hotspots, and chemical buffer statuses.
            </p>

            <div className="p-3 bg-[#ebf7eb] dark:bg-zinc-900 rounded-xl border text-xs space-y-1">
              <div className="font-bold text-[#05371f] dark:text-emerald-400">Included Datasets:</div>
              <ul className="list-disc list-inside text-slate-600 dark:text-zinc-400 text-[11px] space-y-0.5">
                <li>Actionable Advisory Rate (64.2% across 18 blocks)</li>
                <li>Input Barrier Breakdown (38.2% chemical stockout)</li>
                <li>Namkum Cadastral Blast Spore Risk Maps</li>
                <li>Conserved Irrigation Water Ledger (1.8M Liters)</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={exporting}
                onClick={handleExportBrief}
                className="px-4 py-2 bg-[#05371f] hover:bg-[#163624] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <AppIcon name="progress_activity" className="w-4 h-4  animate-spin" />
                    <span>Compiling PDF...</span>
                  </>
                ) : (
                  <>
                    <AppIcon name="download" className="w-4 h-4" />
                    <span>Download Official PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: ADJUST TARGET MANDATE                                       */}
      {/* ==================================================================== */}
      {showTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#18221B] rounded-3xl max-w-sm w-full p-6 border border-[#d2ded5] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-[#05371f] dark:text-emerald-400">
                Adjust Directorate Target
              </span>
              <button
                type="button"
                onClick={() => setShowTargetModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <AppIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#4f6351] dark:text-zinc-300">
              Set target Actionable Advisory Rate for Kharif 2024 (Baseline generic SMS benchmark is 12%).
            </p>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>AAR Goal</span>
                <span className="text-[#05371f] font-mono text-base">{mandateTarget}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={mandateTarget}
                onChange={(e) => setMandateTarget(Number(e.target.value))}
                className="w-full accent-[#05371f]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTargetModal(false);
                  triggerToast("Mandate Saved", `Target set to ${mandateTarget}% AAR.`, "tune");
                }}
                className="px-4 py-2 bg-[#05371f] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Save New Mandate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Popover */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141e17] text-white px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-3 animate-bounce">
          <AppIcon name={toast.icon} className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="font-bold">{toast.title}</div>
            <div className="text-slate-300 text-[11px]">{toast.message}</div>
          </div>
        </div>
      )}

      {/* Profile Setup / Role Switcher Modal */}
      <ProfileSetupModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialData={{
          name: officialName,
          role: userRole,
          designation: officialDesignation,
          department: officialDepartment,
          avatar: officialAvatar,
        }}
        onSaved={(data) => {
          if (data?.user?.name) setOfficialName(data.user.name);
          if (data?.user?.role) setUserRole(data.user.role);
          if (data?.user?.designation) setOfficialDesignation(data.user.designation);
          if (data?.user?.avatar) setOfficialAvatar(data.user.avatar);
        }}
      />

      {/* Profile Avatar / Icon Studio Modal */}
      <ProfileAvatarPickerModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={officialAvatar}
        role="GOVT"
        userName={officialName}
        onSelectAvatar={(newAvatar) => {
          setOfficialAvatar(newAvatar);
          // Persist to backend
          fetch("/api/auth/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: "GOVT",
              name: officialName,
              phone: officialPhone,
              designation: officialDesignation,
              department: officialDepartment,
              district: officialDistrict,
              state: officialState,
              avatar: newAvatar,
            }),
          }).catch(console.error);
          triggerToast("Avatar Updated", "Official profile icon/avatar updated.", "verified");
        }}
      />
    </div>
  );
}
