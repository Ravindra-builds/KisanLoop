"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppIcon from "@/components/shared/AppIcon";
import { ProfileSetupModal } from "@/components/shared/ProfileSetupModal";

interface CaseItem {
  id: string;
  farmerName: string;
  village: string;
  plotId: string;
  crop: string;
  growthStage: string;
  suspectedPathogen: string;
  aiConfidence: number;
  severity: "high" | "medium" | "low";
  type: "low-ai" | "pathogen" | "escalation" | "dispatched";
  status: "PENDING" | "APPROVED" | "OVERRIDDEN" | "FOLLOW_UP";
  reportedTime: string;
  imageUrl: string;
  ndviImageUrl: string;
  farmerAudioNote?: string;
  weatherWarning?: string;
  diffOptions: { name: string; probability: number; rationale: string }[];
}

const INITIAL_CASES: CaseItem[] = [
  {
    id: "KL-024",
    farmerName: "Ravi Kumar (रवि कुमार)",
    village: "Namkum, Ranchi",
    plotId: "Plot 2 (2.4 ac)",
    crop: "धान (IR-64 Paddy)",
    growthStage: "Day 38 • Active Tillering",
    suspectedPathogen: "Leaf Blast (Pyricularia oryzae)",
    aiConfidence: 68,
    severity: "high",
    type: "low-ai",
    status: "PENDING",
    reportedTime: "24m ago",
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
    ndviImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    weatherWarning: "85% Rain probability in 24h (42mm). High humidity favors blast spore release.",
    farmerAudioNote: "रवि कुमार: पत्तों पर भूरे रंग के नाव जैसे धब्बे दिख रहे हैं, क्या यह झुलसा रोग है?",
    diffOptions: [
      { name: "Leaf Blast (Pyricularia oryzae)", probability: 68, rationale: "Spindle-shaped lesions with grayish centers and dark brown margins." },
      { name: "Brown Spot (Bipolaris oryzae)", probability: 22, rationale: "Circular to oval spots with dark brown halos, typical in nutrient-leached sandy soils." },
      { name: "Bacterial Leaf Streak", probability: 10, rationale: "Interveinal translucent lesions, ruled out by lack of bacterial oozing." },
    ],
  },
  {
    id: "KL-025",
    farmerName: "Sunita Devi (सुनीता देवी)",
    village: "Kanke Block, Ranchi",
    plotId: "Plot 4 (1.8 ac)",
    crop: "मक्का (Ganga-5 Hybrid)",
    growthStage: "Knee-high (V6 stage)",
    suspectedPathogen: "Fall Armyworm (Spodoptera frugiperda)",
    aiConfidence: 91,
    severity: "high",
    type: "pathogen",
    status: "PENDING",
    reportedTime: "1h ago",
    imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80",
    ndviImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    weatherWarning: "Dry spells followed by light showers creating pest surge condition.",
    diffOptions: [
      { name: "Fall Armyworm (Spodoptera frugiperda)", probability: 91, rationale: "Shot-hole whorl feeding and abundant coarse frass confirmed." },
      { name: "Stem Borer (Chilo partellus)", probability: 9, rationale: "Deadheart symptom absent, primarily whorl damage." },
    ],
  },
  {
    id: "KL-026",
    farmerName: "Mahadev Oraon (महादेव उरांव)",
    village: "Ratu Block, Ranchi",
    plotId: "Plot 1 (0.9 ac)",
    crop: "टमाटर (Swarna Sampatti)",
    growthStage: "Flowering & Early Fruit",
    suspectedPathogen: "Early Blight (Alternaria solani)",
    aiConfidence: 74,
    severity: "medium",
    type: "escalation",
    status: "PENDING",
    reportedTime: "3h ago",
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80",
    ndviImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    diffOptions: [
      { name: "Early Blight (Alternaria solani)", probability: 74, rationale: "Target-board concentric rings visible on lower older leaves." },
      { name: "Septoria Leaf Spot", probability: 26, rationale: "Tiny circular spots with speckled pycnidia centers." },
    ],
  },
  {
    id: "KL-027",
    farmerName: "Anil Munda (अनिल मुंडा)",
    village: "Ormanjhi Block, Ranchi",
    plotId: "Plot 3 (3.1 ac)",
    crop: "आलू (Kufri Pukhraj)",
    growthStage: "Tuber Initiation",
    suspectedPathogen: "Bacterial Wilt (Ralstonia)",
    aiConfidence: 86,
    severity: "high",
    type: "pathogen",
    status: "APPROVED",
    reportedTime: "5h ago",
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80",
    ndviImageUrl: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80",
    diffOptions: [
      { name: "Bacterial Wilt (Ralstonia)", probability: 86, rationale: "Rapid diurnal wilting of leaves without chlorosis; vascular browning confirmed." },
    ],
  },
];

export function ExpertPortal() {
  const [cases, setCases] = useState<CaseItem[]>(INITIAL_CASES);
  const [selectedCase, setSelectedCase] = useState<CaseItem>(INITIAL_CASES[0]);
  const [activeTab, setActiveTab] = useState<"all" | "low-ai" | "pathogen" | "escalation" | "dispatched">("low-ai");
  const [navSection, setNavSection] = useState<"queue" | "diagnostic" | "formulary" | "pathogen">("queue");
  const [searchQuery, setSearchQuery] = useState("");
  const [imageMode, setImageMode] = useState<"rgb" | "ndvi">("rgb");
  const [selectedFormulation, setSelectedFormulation] = useState("Tricyclazole 75 WP (Beam / Baan)");
  const [dosageInput, setDosageInput] = useState("0.6 g / Litre");
  const [waterVolumeInput, setWaterVolumeInput] = useState("200 L / Acre");
  const [expertNoteInput, setExpertNoteInput] = useState(
    "Wait 24 hours until IMD forecast heavy rains subside. Apply targeted knapsack spray on Zone B leaves in early morning."
  );

  // Loading & Processing States
  const [submittingAction, setSubmittingAction] = useState(false);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; icon: string } | null>(null);

  // Modals
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showPathogenMapModal, setShowPathogenMapModal] = useState(false);
  const [showAudioRecorderModal, setShowAudioRecorderModal] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);

  // Profile & Role State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [expertName, setExpertName] = useState("Dr. K. Patel");
  const [expertDesignation, setExpertDesignation] = useState("KVK Pathologist");
  const [expertDepartment, setExpertDepartment] = useState("KVK Ranchi Pathology");
  const [userRole, setUserRole] = useState<"FARMER" | "EXPERT" | "GOVT" | "ADMIN">("EXPERT");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.user) {
          const u = res.data.user;
          if (u.name && u.name !== "Farmer") setExpertName(u.name);
          if (u.role) setUserRole(u.role);
          if (res.data.isProfileComplete === false) {
            setShowProfileModal(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const triggerToast = (title: string, message: string, icon = "check_circle") => {
    setToast({ title, message, icon });
    setTimeout(() => setToast(null), 3800);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    window.location.href = "/login";
  };

  const syncOfflineCache = () => {
    setSyncingOffline(true);
    setTimeout(() => {
      setSyncingOffline(false);
      triggerToast("Offline Sync", "14 case models & 240 ICAR guidelines cached to device indexedDB.");
    }, 1200);
  };

  const handleReviewAction = async (action: "APPROVE" | "CORRECT" | "REQUEST_FOLLOW_UP") => {
    setSubmittingAction(true);
    try {
      // Call actual backend route
      const res = await fetch(`/api/expert/cases/${selectedCase.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          formulation: selectedFormulation,
          dosage: dosageInput,
          waterVolume: waterVolumeInput,
          notes: expertNoteInput,
          expertId: "dr.patel@kvk-ranchi.org",
        }),
      }).catch(() => null);

      // Optimistically update local case list
      const newStatus = action === "APPROVE" ? "APPROVED" : action === "CORRECT" ? "OVERRIDDEN" : "FOLLOW_UP";
      setCases((prev) =>
        prev.map((c) => (c.id === selectedCase.id ? { ...c, status: newStatus, type: "dispatched" } : c))
      );
      setSelectedCase((prev) => ({ ...prev, status: newStatus, type: "dispatched" }));

      if (action === "APPROVE") {
        triggerToast(
          "Advisory Dispatched",
          `Advisory #${selectedCase.id} sent directly to ${selectedCase.farmerName} via SMS & Audio Notification.`,
          "verified"
        );
      } else if (action === "CORRECT") {
        triggerToast(
          "Prescription Overridden",
          `AI recommendation replaced with verified POP protocol (${selectedFormulation}).`,
          "edit"
        );
      } else {
        triggerToast(
          "Field Sample Requested",
          `KVK extension agent dispatched to ${selectedCase.village} for leaf tissue swab.`,
          "call"
        );
      }
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filtered cases
  const filteredCases = cases.filter((c) => {
    const matchesTab = activeTab === "all" || c.type === activeTab || (activeTab === "dispatched" && c.status !== "PENDING");
    const matchesSearch =
      c.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.village.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="bg-[#f9fbfa] dark:bg-[#121814] text-[#111814] dark:text-zinc-100 min-h-screen font-sans antialiased selection:bg-emerald-100 dark:selection:bg-emerald-950 w-full overflow-x-hidden">
      <div className="max-w-[1380px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 w-full overflow-x-hidden">
        {/* ==================================================================== */}
        {/* TOP SHARED AGROTERRA EXPERT HEADER                                   */}
        {/* ==================================================================== */}
        <header className="flex flex-wrap items-center justify-between border-b border-[#eaf0ed] dark:border-white/10 pb-4 mb-4 gap-4">
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#214e34] text-white flex items-center justify-center shadow-xs">
                <AppIcon name="psychology" className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-[#111814] dark:text-white tracking-tight">KisanLoop</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ebf7eb] dark:bg-emerald-950 text-[#1b4332] dark:text-emerald-400 border border-[#d2ded5] dark:border-emerald-800">
                    EXPERT v4.8
                  </span>
                </div>
                <p className="text-[11px] text-[#608570] dark:text-zinc-400 font-medium">
                  Agronomic Triage &amp; Pathology Diagnostic Console
                </p>
              </div>
            </Link>

            {/* Search Input */}
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
              <AppIcon name="search" className="w-4 h-4  text-[#608570] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farmer, crop, plot ID..."
                className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-[#eaf0ed] dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#214e34] focus:ring-0 text-foreground dark:text-white transition"
              />
            </div>
          </div>

          {/* Navigation & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Nav Pill Group */}
            <div className="hidden xl:flex items-center gap-1 bg-[#eaf0ed] dark:bg-zinc-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setNavSection("queue")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  navSection === "queue"
                    ? "bg-white dark:bg-zinc-900 text-[#214e34] dark:text-white shadow-xs"
                    : "text-[#608570] hover:text-[#111814] dark:hover:text-white"
                }`}
              >
                Triage Queue
              </button>
              <button
                type="button"
                onClick={() => setNavSection("diagnostic")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  navSection === "diagnostic"
                    ? "bg-white dark:bg-zinc-900 text-[#214e34] dark:text-white shadow-xs"
                    : "text-[#608570] hover:text-[#111814] dark:hover:text-white"
                }`}
              >
                Differential Diagnostic
              </button>
              <button
                type="button"
                onClick={() => setNavSection("formulary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  navSection === "formulary"
                    ? "bg-white dark:bg-zinc-900 text-[#214e34] dark:text-white shadow-xs"
                    : "text-[#608570] hover:text-[#111814] dark:hover:text-white"
                }`}
              >
                ICAR Formulary
              </button>
              <button
                type="button"
                onClick={() => setShowPathogenMapModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#608570] hover:text-[#111814] dark:hover:text-white transition cursor-pointer"
              >
                Pathogen Map
              </button>
            </div>

            {/* Offline Sync Cache */}
            <button
              type="button"
              onClick={syncOfflineCache}
              disabled={syncingOffline}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#214e34] hover:bg-[#143722] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
            >
              <AppIcon name="sync" className={`w-4 h-4 ${syncingOffline ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{syncingOffline ? "Syncing..." : "Sync Offline"}</span>
            </button>

            {/* Emergency Alert Broadcast */}
            <button
              type="button"
              onClick={() => setShowEmergencyModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <AppIcon name="warning" className="w-4 h-4  animate-pulse" />
              <span className="hidden sm:inline">Emergency Alert</span>
              <span className="sm:hidden">Alert</span>
            </button>

            {/* ICAR Authenticated Doctor Info */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#eaf0ed] dark:border-white/10">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#111814] dark:text-white">{expertName}</span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-end gap-0.5">
                  <AppIcon name="verified" className="w-3 h-3" />
                  {expertDepartment}
                </span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80"
                alt={expertName}
                className="w-9 h-9 rounded-full object-cover border border-[#214e34] shadow-xs"
              />
            </div>

            {/* Role Switcher Badge */}
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#eaf0ed] dark:bg-zinc-800 hover:bg-[#dce6dc] text-[#214e34] dark:text-emerald-300 rounded-xl border border-[#dce6dc] dark:border-white/10 text-xs font-bold shadow-xs transition cursor-pointer"
              title="Change Role / Setup Profile"
            >
              <AppIcon name="manage_accounts" className="w-4 h-4" />
              <span>Role: {userRole}</span>
              <span className="text-[10px] underline font-normal">(Switch)</span>
            </button>

            {/* Dedicated Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-[#dce6dc] dark:border-white/10 hover:border-red-200 text-xs font-bold shadow-xs transition cursor-pointer"
              title="Log out of Expert Portal"
            >
              <AppIcon name="logout" className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Tabs for Small & Medium Screens */}
        <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto pb-2.5 mb-4 scrollbar-none">
          <button
            type="button"
            onClick={() => setNavSection("queue")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              navSection === "queue"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Triage Queue
          </button>
          <button
            type="button"
            onClick={() => setNavSection("diagnostic")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              navSection === "diagnostic"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Differential Diagnostic
          </button>
          <button
            type="button"
            onClick={() => setNavSection("formulary")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              navSection === "formulary"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            ICAR Formulary
          </button>
          <button
            type="button"
            onClick={() => setShowPathogenMapModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10 whitespace-nowrap transition cursor-pointer"
          >
            Pathogen Map
          </button>
        </div>

        {/* ==================================================================== */}
        {/* KPI METRIC CARDS                                                     */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#608570] dark:text-zinc-400">
                Escalated Queue
              </span>
              <AppIcon name="hourglass_top" className="w-4 h-4  text-[#214e34] dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-1">14 Pending</p>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">+2 received today</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#608570] dark:text-zinc-400">
                Avg Triage Latency
              </span>
              <AppIcon name="timer" className="w-4 h-4  text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-1">2.4 hrs</p>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">-1.6h within ICAR SLA</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#608570] dark:text-zinc-400">
                Triage Accuracy
              </span>
              <AppIcon name="verified" className="w-4 h-4  text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-1">98.6%</p>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">+0.4% this cycle</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#608570] dark:text-zinc-400">
                Bio-Savings Validated
              </span>
              <AppIcon name="savings" className="w-4 h-4  text-amber-600" />
            </div>
            <p className="text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-1">₹14.8 Lakhs</p>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              340 farmers protected
            </span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* QUEUE FILTER TABS                                                    */}
        {/* ==================================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 border-b border-[#eaf0ed] dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("low-ai")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "low-ai"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 hover:text-[#111814] border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            <AppIcon name="filter_center_focus" className="w-4 h-4" />
            <span>Low AI Confidence (&lt;85%)</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px]">
              6
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pathogen")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "pathogen"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 hover:text-[#111814] border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            <AppIcon name="coronavirus" className="w-4 h-4" />
            <span>High-Risk Pathogen</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-700 dark:text-red-300 text-[10px]">
              4
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("escalation")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "escalation"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 hover:text-[#111814] border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            <AppIcon name="contact_phone" className="w-4 h-4" />
            <span>Farmer Escalation</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px]">
              3
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("dispatched")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "dispatched"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 hover:text-[#111814] border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            <AppIcon name="check_circle" className="w-4 h-4" />
            <span>Approved &amp; Dispatched</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px]">
              28
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 hover:text-[#111814] border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            <span>All Cases ({cases.length})</span>
          </button>
        </div>

        {/* ==================================================================== */}
        {/* MAIN SPLIT TRIAGE WORKSPACE                                          */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Interactive Case Queue List */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#608570] dark:text-zinc-400">
                Incoming Observations ({filteredCases.length})
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Live stream</span>
            </div>

            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredCases.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#18221B] rounded-2xl border text-xs text-muted-foreground">
                  No cases found matching filter criteria.
                </div>
              ) : (
                filteredCases.map((c) => {
                  const isSelected = selectedCase.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCase(c)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#214e34] bg-white dark:bg-[#18221B] shadow-md ring-2 ring-[#214e34]/20"
                          : "border-[#e2ebe4] dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#214e34]/10 text-[#214e34] dark:text-emerald-300 font-mono">
                            #{c.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              c.severity === "high"
                                ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200"
                                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200"
                            }`}
                          >
                            {c.severity} priority
                          </span>
                        </div>
                        <span className="text-[11px] text-[#608570] dark:text-zinc-400 font-medium">
                          {c.reportedTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <img
                          src={c.imageUrl}
                          alt={c.suspectedPathogen}
                          className="w-14 h-14 rounded-xl object-cover border border-[#dce6dc] dark:border-white/10 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-[#111814] dark:text-white truncate">
                            {c.farmerName}
                          </div>
                          <div className="text-[11px] text-[#608570] dark:text-zinc-400 truncate">
                            {c.village} • {c.crop}
                          </div>
                          <div className="text-xs font-semibold text-red-700 dark:text-red-400 truncate mt-0.5">
                            {c.suspectedPathogen}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#f0f4f1] dark:border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                          <AppIcon name="psychology" className="w-3.5 h-3.5" />
                          {c.aiConfidence}% AI Confidence
                        </span>
                        <span
                          className={`font-bold ${
                            c.status === "APPROVED"
                              ? "text-emerald-600"
                              : c.status === "OVERRIDDEN"
                              ? "text-blue-600"
                              : "text-amber-600"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Case Deep-Dive Diagnostic & Prescription Panel */}
          <div className="lg:col-span-8 bg-white dark:bg-[#18221B] rounded-3xl border border-[#e2ebe4] dark:border-white/10 shadow-xl p-5 sm:p-7 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header Info Banner */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#eaf0ed] dark:border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-[#214e34] text-white text-xs font-mono font-bold">
                      Case #{selectedCase.id}
                    </span>
                    <h2 className="text-xl font-black text-[#111814] dark:text-white tracking-tight">
                      {selectedCase.suspectedPathogen}
                    </h2>
                  </div>
                  <p className="text-xs text-[#608570] dark:text-zinc-400 mt-1">
                    Submitted by <strong>{selectedCase.farmerName}</strong> • {selectedCase.village} ({selectedCase.plotId})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAudioRecorderModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dce6dc] dark:border-white/10 hover:bg-[#eaf0ed] text-xs font-bold text-[#111814] dark:text-white transition cursor-pointer"
                  >
                    <AppIcon name="mic" className="w-4 h-4  text-[#214e34] dark:text-emerald-400" />
                    <span>Attach Audio Voice Note</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPathogenMapModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dce6dc] dark:border-white/10 hover:bg-[#eaf0ed] text-xs font-bold text-[#111814] dark:text-white transition cursor-pointer"
                  >
                    <AppIcon name="map" className="w-4 h-4  text-blue-600" />
                    <span>Zone Map</span>
                  </button>
                </div>
              </div>

              {/* Leaf Inspection & NDVI Heatmap Dual View */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                <div className="md:col-span-5 space-y-2">
                  <div className="relative rounded-2xl overflow-hidden border border-[#dce6dc] dark:border-white/10 shadow-sm aspect-4/3 bg-black">
                    <img
                      src={imageMode === "rgb" ? selectedCase.imageUrl : selectedCase.ndviImageUrl}
                      alt="Crop specimen"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/60 backdrop-blur text-white text-[10px] font-bold uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      <span>{imageMode === "rgb" ? "RGB Optical Telemetry" : "NDVI Multispectral Heatmap"}</span>
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur p-0.5 rounded-lg border border-white/20">
                      <button
                        type="button"
                        onClick={() => setImageMode("rgb")}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                          imageMode === "rgb"
                            ? "bg-[#214e34] text-white shadow-2xs"
                            : "text-[#608570] hover:text-[#111814]"
                        }`}
                      >
                        RGB Optical
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode("ndvi")}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                          imageMode === "ndvi"
                            ? "bg-[#214e34] text-white shadow-2xs"
                            : "text-[#608570] hover:text-[#111814]"
                        }`}
                      >
                        NDVI Stress
                      </button>
                    </div>
                  </div>

                  {selectedCase.farmerAudioNote && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <AppIcon name="volume_up" className="w-4 h-4  text-amber-600 shrink-0 mt-0.5" />
                      <span className="italic">{selectedCase.farmerAudioNote}</span>
                    </div>
                  )}

                  {selectedCase.weatherWarning && (
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2">
                      <AppIcon name="rainy" className="w-4 h-4  text-blue-600 shrink-0 mt-0.5" />
                      <span>{selectedCase.weatherWarning}</span>
                    </div>
                  )}
                </div>

                {/* AI Differential Diagnosis Breakdown */}
                <div className="md:col-span-7 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#608570] dark:text-zinc-400 block">
                    Differential Diagnosis (Confidence &lt;85% Gate)
                  </span>

                  <div className="space-y-2">
                    {selectedCase.diffOptions.map((opt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-[#e2ebe4] dark:border-white/10 bg-[#fafcfa] dark:bg-zinc-900/40 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#111814] dark:text-white">{opt.name}</span>
                          <span
                            className={`font-mono font-black ${
                              opt.probability >= 60
                                ? "text-red-600 dark:text-red-400"
                                : opt.probability >= 20
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-slate-500"
                            }`}
                          >
                            {opt.probability}%
                          </span>
                        </div>

                        {/* Progress meter */}
                        <div className="w-full h-2 rounded-full bg-[#e5ece7] dark:bg-zinc-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              opt.probability >= 60
                                ? "bg-red-500"
                                : opt.probability >= 20
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                            style={{ width: `${opt.probability}%` }}
                          ></div>
                        </div>
                        <p className="text-[11px] text-[#608570] dark:text-zinc-400 leading-tight">
                          {opt.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Formulary Prescription & Feasibility Calibration */}
              <div className="p-4 rounded-2xl bg-[#f4f8f5] dark:bg-[#151e18] border border-[#d2ded5] dark:border-white/10 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#214e34] dark:text-emerald-400">
                    <AppIcon name="prescriptions" className="w-4 h-4" />
                    <span>State POP &amp; ICAR Approved Formulary Prescription</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                    POP Approved
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#608570] dark:text-zinc-400 block mb-1">
                      Target Formulation
                    </label>
                    <select
                      value={selectedFormulation}
                      onChange={(e) => setSelectedFormulation(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white focus:ring-1 focus:ring-[#214e34]"
                    >
                      <option value="Tricyclazole 75 WP (Beam / Baan)">Tricyclazole 75 WP (Beam)</option>
                      <option value="Kasugamycin 3% SL (Kasu-B)">Kasugamycin 3% SL</option>
                      <option value="Pseudomonas fluorescens 1.0% WP (Bio)">Pseudomonas fluorescens (Bio)</option>
                      <option value="Isoprothiolane 40% EC (Fuji-one)">Isoprothiolane 40% EC</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#608570] dark:text-zinc-400 block mb-1">
                      Calibrated Dosage
                    </label>
                    <input
                      type="text"
                      value={dosageInput}
                      onChange={(e) => setDosageInput(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white focus:ring-1 focus:ring-[#214e34]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#608570] dark:text-zinc-400 block mb-1">
                      Water Spray Volume
                    </label>
                    <input
                      type="text"
                      value={waterVolumeInput}
                      onChange={(e) => setWaterVolumeInput(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white focus:ring-1 focus:ring-[#214e34]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#608570] dark:text-zinc-400 block mb-1">
                    Agronomist Instructions to Farmer (Bilingual Voice/SMS)
                  </label>
                  <textarea
                    rows={2}
                    value={expertNoteInput}
                    onChange={(e) => setExpertNoteInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#d2ded5] dark:border-white/15 bg-white dark:bg-zinc-900 text-xs text-foreground dark:text-white focus:ring-1 focus:ring-[#214e34]"
                  />
                </div>
              </div>
            </div>

            {/* Decision Action Buttons with Processing State */}
            <div className="mt-6 pt-4 border-t border-[#eaf0ed] dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-[#608570] dark:text-zinc-400">
                  Status: <strong>{selectedCase.status}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleReviewAction("REQUEST_FOLLOW_UP")}
                  className="px-3.5 py-2.5 rounded-xl border border-[#dce6dc] dark:border-white/15 hover:bg-[#eaf0ed] dark:hover:bg-zinc-800 text-xs font-bold text-[#111814] dark:text-white transition cursor-pointer disabled:opacity-50"
                >
                  Request Field Sample
                </button>

                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleReviewAction("CORRECT")}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  Override &amp; Prescribe
                </button>

                <button
                  type="button"
                  disabled={submittingAction}
                  onClick={() => handleReviewAction("APPROVE")}
                  className="px-5 py-2.5 rounded-xl bg-[#214e34] hover:bg-[#163624] text-white text-xs font-bold shadow-md shadow-[#214e34]/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingAction ? (
                    <span className="flex items-center gap-1.5">
                      <AppIcon name="progress_activity" className="w-4 h-4  animate-spin" />
                      <span>Dispatching...</span>
                    </span>
                  ) : (
                    <>
                      <AppIcon name="send" className="w-[18px] h-[18px]" />
                      <span>Approve &amp; Dispatch Advisory</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: EMERGENCY ALERT BROADCAST                                   */}
      {/* ==================================================================== */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#18221B] rounded-3xl max-w-lg w-full p-4 sm:p-6 border border-red-200 dark:border-red-900/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-600 font-black text-lg">
                <AppIcon name="crisis_alert" className="w-7 h-7  animate-pulse" />
                <span>District Emergency Outbreak Alert</span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <AppIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#608570] dark:text-zinc-300 leading-relaxed">
              Broadcast an immediate high-priority pest warning to all <strong>4,820 registered paddy farmers</strong> in the Namkum and Kanke blocks via SMS, IVR automated voice call, and WhatsApp advisory push.
            </p>

            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 text-xs font-medium text-red-800 dark:text-red-300">
              ⚠️ Warning: This triggers automated siren notifications on farmer devices in accordance with District Disaster Management guidelines.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEmergencyModal(false);
                  triggerToast("Emergency Broadcast", "Alert sent to 4,820 smallholders in Namkum & Kanke.", "crisis_alert");
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Broadcast Siren Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: REGIONAL PATHOGEN MAP                                       */}
      {/* ==================================================================== */}
      {showPathogenMapModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#18221B] rounded-3xl max-w-2xl w-full p-4 sm:p-6 border border-[#dce6dc] dark:border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#214e34] dark:text-emerald-400 font-bold text-base">
                <AppIcon name="map" className="w-5 h-5" />
                <span>Regional Pathogen Surveillance Map (Ranchi District)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPathogenMapModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <AppIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[#dce6dc] bg-[#eef4ee] dark:bg-zinc-900 h-64 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 600 300">
                {/* Simulated GIS Blocks */}
                <path d="M50 50 L200 40 L230 180 L80 190 Z" fill="#d1e7d1" stroke="#214e34" strokeWidth="2" />
                <path d="M200 40 L420 30 L450 170 L230 180 Z" fill="#ffdad6" stroke="#ba1a1a" strokeWidth="2" />
                <path d="M230 180 L450 170 L410 280 L210 270 Z" fill="#ffdcc3" stroke="#c2410c" strokeWidth="2" />
                <path d="M80 190 L230 180 L210 270 L60 260 Z" fill="#d1e7d1" stroke="#214e34" strokeWidth="2" />

                <text x="110" y="120" fontSize="13" fontWeight="bold" fill="#214e34">Kanke Block (Safe)</text>
                <text x="270" y="100" fontSize="13" fontWeight="bold" fill="#ba1a1a">Namkum Block (Blast Hotspot)</text>
                <text x="260" y="230" fontSize="13" fontWeight="bold" fill="#c2410c">Ratu Block (Moderate)</text>
                <text x="90" y="235" fontSize="13" fontWeight="bold" fill="#214e34">Ormanjhi (Safe)</text>

                {/* Hotspot Pulsing dots */}
                <circle cx="310" cy="110" r="8" fill="#ba1a1a" className="animate-ping" opacity="0.6" />
                <circle cx="310" cy="110" r="5" fill="#ba1a1a" />
              </svg>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-bold">
                Namkum: 14 Active Outbreaks
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 font-bold">
                Ratu: 4 Observations
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold">
                Kanke: 0 Threshold Exceeded
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowPathogenMapModal(false)}
                className="px-4 py-2 rounded-xl bg-[#214e34] text-white text-xs font-bold cursor-pointer"
              >
                Close Map View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 3: AUDIO NOTE RECORDER                                         */}
      {/* ==================================================================== */}
      {showAudioRecorderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#18221B] rounded-3xl max-w-md w-full p-4 sm:p-6 border border-[#dce6dc] dark:border-white/10 shadow-2xl space-y-4 text-center max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#214e34] dark:text-emerald-400 font-bold text-base">
                <AppIcon name="mic" className="w-5 h-5" />
                <span>Record Voice Note to {selectedCase.farmerName}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAudioRecorderModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <AppIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <div className="py-8 flex flex-col items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (isRecordingAudio) {
                    setIsRecordingAudio(false);
                    setAudioRecorded(true);
                  } else {
                    setIsRecordingAudio(true);
                    setAudioRecorded(false);
                  }
                }}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  isRecordingAudio
                    ? "bg-red-500 text-white animate-pulse ring-8 ring-red-200"
                    : "bg-[#214e34] text-white hover:scale-105"
                }`}
              >
                <AppIcon name={isRecordingAudio ? "stop" : "mic"} className="w-9 h-9" />
              </button>

              <p className="text-xs text-[#608570] dark:text-zinc-300">
                {isRecordingAudio
                  ? "Recording doctor voice memo in Hindi (Speak now)..."
                  : audioRecorded
                  ? "Voice note captured (0:18s). Ready to attach."
                  : "Tap microphone to record personalized voice instruction in Hindi."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAudioRecorderModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-zinc-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!audioRecorded}
                onClick={() => {
                  setShowAudioRecorderModal(false);
                  triggerToast("Voice Note Attached", "Voice memo linked to prescription envelope.", "mic");
                }}
                className="px-4 py-2 rounded-xl bg-[#214e34] text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Attach Voice Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Popover */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111814] text-white px-4 py-3 rounded-2xl shadow-2xl text-xs flex items-center gap-3 animate-bounce">
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
          name: expertName,
          role: userRole,
          designation: expertDesignation,
          department: expertDepartment,
        }}
        onSaved={(data) => {
          if (data?.user?.name) setExpertName(data.user.name);
          if (data?.user?.role) setUserRole(data.user.role);
          if (data?.user?.designation) setExpertDesignation(data.user.designation);
        }}
      />
    </div>
  );
}
