"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Sprout,
  MessageSquare,
  Camera,
  CheckSquare,
  Globe2,
  Droplets,
  CloudRain,
  Bug,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  Layers,
  Thermometer,
  ShieldAlert,
  User,
} from "lucide-react";
import { useLanguage } from "../shared/LanguageContext";
import { AudioPlayer } from "../shared/AudioPlayer";
import { AdoptionBarrierModal } from "./AdoptionBarrierModal";
import { RecommendationPassportModal } from "./RecommendationPassportModal";
import { CropDiagnosisCard } from "./CropDiagnosisCard";
import { VoiceAssistant } from "./VoiceAssistant";
import { UserNav } from "../shared/UserNav";

type FarmerTab = "home" | "my-farm" | "ask" | "check-crop" | "actions";

export function FarmerPortal() {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<FarmerTab>("home");
  const [farmState, setFarmState] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [outcomes, setOutcomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [barrierActionId, setBarrierActionId] = useState<string | null>(null);
  const [passportRecId, setPassportRecId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchFarmerData = async () => {
    try {
      setLoading(true);
      const [stateRes, recsRes, actsRes, outsRes] = await Promise.all([
        fetch("/api/farm-state?farmId=farm_ravi_01").then((r) => r.json()),
        fetch("/api/recommendations?farmId=farm_ravi_01").then((r) => r.json()),
        fetch("/api/actions?farmerId=frm_ravi").then((r) => r.json()),
        fetch("/api/outcomes?farmId=farm_ravi_01").then((r) => r.json()),
      ]);

      if (stateRes.success) setFarmState(stateRes.data);
      if (recsRes.success) setRecommendations(recsRes.data);
      if (actsRes.success) setActions(actsRes.data);
      if (outsRes.success) setOutcomes(outsRes.data);
    } catch (err) {
      console.error("Failed to load farmer data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const handleMarkDone = async (actionId: string) => {
    try {
      const res = await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (res.ok) {
        setSuccessToast(
          language === "hi"
            ? "शाबाश! आपका कदम दर्ज कर लिया गया है।"
            : "Great job! Your action has been confirmed."
        );
        setTimeout(() => setSuccessToast(null), 4000);
        fetchFarmerData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    {
      id: "home" as FarmerTab,
      labelHi: "आज का काम",
      labelEn: "Today's Action",
      icon: Home,
    },
    {
      id: "my-farm" as FarmerTab,
      labelHi: "मेरा खेत",
      labelEn: "My Farm",
      icon: Sprout,
    },
    {
      id: "ask" as FarmerTab,
      labelHi: "किसान मित्र AI",
      labelEn: "Ask AI",
      icon: MessageSquare,
    },
    {
      id: "check-crop" as FarmerTab,
      labelHi: "फसल जांच",
      labelEn: "Check Crop",
      icon: Camera,
    },
    {
      id: "actions" as FarmerTab,
      labelHi: "कदम और परिणाम",
      labelEn: "Actions & Outcomes",
      icon: CheckSquare,
    },
  ];

  const todayRec = recommendations[0];
  const relatedAction = todayRec
    ? actions.find((a) => a.recommendationId === todayRec.id) || actions[0]
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 1. DESKTOP & TABLET SIDEBAR (md & lg screens)                 */}
      {/* ============================================================ */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-card border-r border-border h-screen sticky top-0 shrink-0 select-none">
        {/* Brand */}
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-foreground flex items-center gap-1.5">
              <span>Kisan</span>
              <span className="text-emerald-600">LOOP</span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold tracking-wide">
              {language === "hi" ? "किसान साथी ऐप" : "Farmer Companion"}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all text-left ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 translate-x-1"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                <span>{language === "hi" ? item.labelHi : item.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Panel: Language & Farmer Profile Card */}
        <div className="p-4 border-t bg-muted/20 space-y-3">
          {/* Language Toggle */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "भाषा" : "Language"}</span>
            </span>
            <div className="flex items-center bg-muted rounded-xl p-0.5 border text-xs">
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  language === "hi"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  language === "en"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Farmer Identity Badge & Sign Out */}
          <UserNav accentColor="emerald" />
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE TOP BAR (< md screens)                             */}
      {/* ============================================================ */}
      <header className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-foreground">
              Kisan<span className="text-emerald-600">LOOP</span>
            </span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">
              रवि कुमार • 1.2 एकड़ धान
            </span>
          </div>
        </div>

        {/* Quick Language Toggle */}
        <div className="flex items-center bg-muted rounded-xl p-0.5 border text-xs">
          <button
            type="button"
            onClick={() => setLanguage("hi")}
            className={`px-2 py-0.5 rounded-lg font-bold transition ${
              language === "hi"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            हिन्दी
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-2 py-0.5 rounded-lg font-bold transition ${
              language === "en"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            EN
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. MAIN CONTENT AREA (Scrollable, padded for mobile bottom)   */}
      {/* ============================================================ */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full pb-24 md:pb-8 space-y-6">
        {/* ==================== TAB 1: HOME ==================== */}
        {activeTab === "home" && (
          <div className="space-y-6 animate-fade-in">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-emerald-700 via-green-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-emerald-300 font-semibold text-xs uppercase tracking-wider">
                      नामकुम, रांची (झारखंड) • Namkum, Ranchi
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black mt-1">
                      {language === "hi" ? "नमस्ते, रवि कुमार 👋" : "Namaste, Ravi Kumar 👋"}
                    </h1>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-right">
                    <span className="text-[11px] text-emerald-200 block">
                      {language === "hi" ? "फसल और क्षेत्रफल" : "Crop & Plot Size"}
                    </span>
                    <span className="font-extrabold text-sm sm:text-base">
                      धान (IR-64) • 1.2 एकड़
                    </span>
                  </div>
                </div>

                {/* Vital Farm Signals */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                      <Sprout className="w-4 h-4 text-emerald-300" />
                      <span>{t("cropHealth")}</span>
                    </div>
                    <div className="font-black text-base sm:text-lg mt-1 text-white">
                      {language === "hi" ? "उत्कृष्ट (Good)" : "Healthy"}
                    </div>
                    <div className="text-[10px] text-emerald-200/80">NDVI: 0.72</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                      <Droplets className="w-4 h-4 text-cyan-300" />
                      <span>{t("soilMoisture")}</span>
                    </div>
                    <div className="font-black text-base sm:text-lg mt-1 text-white">
                      {language === "hi" ? "पर्याप्त (68%)" : "Adequate (68%)"}
                    </div>
                    <div className="text-[10px] text-emerald-200/80">No deficit</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                    <div className="flex items-center gap-1.5 text-xs text-amber-200 font-medium">
                      <CloudRain className="w-4 h-4 text-amber-300" />
                      <span>{t("weatherRisk")}</span>
                    </div>
                    <div className="font-black text-base sm:text-lg mt-1 text-amber-300">
                      {language === "hi" ? "उच्च (High Rain)" : "High Rain"}
                    </div>
                    <div className="text-[10px] text-amber-200/80">85% Rain Tomorrow (42mm)</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
                    <div className="flex items-center gap-1.5 text-xs text-purple-200 font-medium">
                      <Bug className="w-4 h-4 text-purple-300" />
                      <span>{t("pestRisk")}</span>
                    </div>
                    <div className="font-black text-base sm:text-lg mt-1 text-white">
                      {language === "hi" ? "मध्यम (Moderate)" : "Moderate"}
                    </div>
                    <div className="text-[10px] text-purple-200/80">Leaf Blast Watch</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Recommended Action Card */}
            {todayRec && (
              <div className="bg-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 shadow-lg space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                      {t("todayAction")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <AudioPlayer
                      textToSpeak={`${todayRec.title}। ${todayRec.reason}। ${todayRec.actionSummary}`}
                      language={language}
                    />
                    <button
                      type="button"
                      onClick={() => setPassportRecId(todayRec.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-foreground transition flex items-center gap-1 border"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t("recommendationPassport")}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-black text-foreground">
                    {todayRec.title}
                  </h2>
                  <p className="text-base sm:text-lg text-foreground/90 font-medium leading-relaxed bg-muted/30 p-4 rounded-2xl border">
                    {todayRec.reason}
                  </p>
                  <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{todayRec.actionSummary}</span>
                  </div>
                </div>

                {/* Farmer Action Buttons */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => relatedAction && handleMarkDone(relatedAction.id)}
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{t("done")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => relatedAction && setBarrierActionId(relatedAction.id)}
                    className="w-full py-4 px-6 rounded-2xl border-2 border-border hover:border-amber-500 bg-background hover:bg-amber-50/50 text-foreground font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <XCircle className="w-5 h-5 text-amber-600" />
                    <span>{t("couldNotDo")}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Quick Access to Voice & Vision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setActiveTab("ask")}
                className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-emerald-500 cursor-pointer transition space-y-2"
              >
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <MessageSquare className="w-5 h-5" />
                  <span>{language === "hi" ? "आवाज से पूछें (Voice Assistant)" : "Ask by Voice"}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "hi"
                    ? "क्या मुझे आज सिंचाई करनी चाहिए? बोलकर पूछें..."
                    : "Should I irrigate today? Ask by speaking..."}
                </p>
              </div>

              <div
                onClick={() => setActiveTab("check-crop")}
                className="p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-emerald-500 cursor-pointer transition space-y-2"
              >
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <Camera className="w-5 h-5" />
                  <span>{language === "hi" ? "पत्ती की तस्वीर जांचें (Scan Leaf)" : "Check Crop Health"}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === "hi"
                    ? "रोग या धब्बों की फोटो खींचकर तुरंत AI निदान प्राप्त करें।"
                    : "Take a photo to diagnose leaf blast or pest symptoms."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: MY FARM ==================== */}
        {activeTab === "my-farm" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-foreground">
                  {language === "hi" ? "रवि कुमार का खेत (My Farm Details)" : "Ravi's Farm Profile"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Parcel A • Namkum, Ranchi, Jharkhand
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                1.2 Acres (एकड़)
              </span>
            </div>

            {/* Farm Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">वर्तमान फसल (Crop)</span>
                <div className="text-lg font-black text-foreground">धान (Paddy IR-64)</div>
                <div className="text-xs text-emerald-600 font-medium">वानस्पतिक अवस्था (Vegetative Stage)</div>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">मिट्टी का प्रकार (Soil Type)</span>
                <div className="text-lg font-black text-foreground">लाल रेतीली दोमट (Red Sandy Loam)</div>
                <div className="text-xs text-muted-foreground">pH: 6.4 • कार्बन: 0.62%</div>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-1">
                <span className="text-xs font-semibold text-muted-foreground">सिंचाई प्रणाली (Irrigation)</span>
                <div className="text-lg font-black text-foreground">वर्षा आधारित एवं तालाब (Rainfed & Pond)</div>
                <div className="text-xs text-cyan-600 font-medium">मृदा नमी: 68.5% (पर्याप्त)</div>
              </div>
            </div>

            {/* Soil Test Metrics */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>{language === "hi" ? "मृदा स्वास्थ्य और पोषक तत्व (Soil Health)" : "Soil Health Telemetry"}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-xl bg-muted/40 border">
                  <span className="text-xs text-muted-foreground block">नाइट्रोजन (N)</span>
                  <span className="text-lg font-black text-foreground">125 kg/ha</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">मध्यम (Medium)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border">
                  <span className="text-xs text-muted-foreground block">फास्फोरस (P)</span>
                  <span className="text-lg font-black text-foreground">42 kg/ha</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">पर्याप्त (Adequate)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border">
                  <span className="text-xs text-muted-foreground block">पोटाश (K)</span>
                  <span className="text-lg font-black text-foreground">58 kg/ha</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">सामान्य (Normal)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-muted/40 border">
                  <span className="text-xs text-muted-foreground block">मृदा pH मान</span>
                  <span className="text-lg font-black text-foreground">6.4</span>
                  <span className="text-[10px] text-emerald-600 block font-semibold">आदर्श (Ideal for Rice)</span>
                </div>
              </div>
            </div>

            {/* Satellite NDVI Monitoring */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-600" />
                  <span>{language === "hi" ? "उपग्रह फसल हरियाली निगरानी (Sentinel-2 NDVI)" : "Satellite Crop Monitoring"}</span>
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  0.72 NDVI
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Sentinel-2 मल्टी-स्पेक्ट्रल इमेजरी के अनुसार आपके खेत में धान का चंदवा (Canopy) बहुत अच्छी स्थिति में है और पौधों में प्रकाश संश्लेषण सक्रिय है।
              </p>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: ASK AI ==================== */}
        {activeTab === "ask" && (
          <div className="space-y-6 animate-fade-in">
            <VoiceAssistant />
          </div>
        )}

        {/* ==================== TAB 4: CHECK CROP ==================== */}
        {activeTab === "check-crop" && (
          <div className="space-y-6 animate-fade-in">
            <CropDiagnosisCard onDiagnosisComplete={fetchFarmerData} />
          </div>
        )}

        {/* ==================== TAB 5: ACTIONS & OUTCOMES ==================== */}
        {activeTab === "actions" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                {language === "hi" ? "कदम और परिणाम (Actions & Outcomes)" : "Actions & Measured Outcomes"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Tracking feasibility, adoption confirmation, and real field outcomes
              </p>
            </div>

            {/* Actions List */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground">
                {language === "hi" ? "कार्रवाई इतिहास (Action History)" : "Action History"}
              </h3>

              <div className="space-y-3">
                {actions.map((act) => (
                  <div
                    key={act.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-muted/20 gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{act.title}</h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            act.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : act.status === "NOT_POSSIBLE"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {act.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{act.notes || act.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {act.recommendationId && (
                        <button
                          type="button"
                          onClick={() => setPassportRecId(act.recommendationId)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-background hover:bg-muted text-foreground"
                        >
                          {language === "hi" ? "पासपोर्ट देखें" : "View Passport"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Outcomes Measured */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground">
                {language === "hi" ? "सत्यापित परिणाम (Verified Outcomes)" : "Verified Field Outcomes"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {outcomes.map((out) => (
                  <div key={out.id} className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
                    <div className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">
                      {out.yieldImpact || "+8% Yield Protection"}
                    </div>
                    <p className="text-muted-foreground">{out.afterState}</p>
                    <div className="pt-2 border-t border-emerald-200/60 flex justify-between font-bold text-foreground">
                      <span>Water Conserved: {out.waterSavedLiters?.toLocaleString()} L</span>
                      <span>Cost Saved: ₹{out.costSavingsInr?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================ */}
      {/* 4. MOBILE BOTTOM NAVIGATION BAR (< md screens)               */}
      {/* ============================================================ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border shadow-xl flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? "text-emerald-600 font-extrabold scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-emerald-600" : ""}`} />
              <span className="text-[10px] tracking-tight">
                {language === "hi" ? item.labelHi.split(" ")[0] : item.labelEn.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Adoption Barrier Modal */}
      {barrierActionId && (
        <AdoptionBarrierModal
          actionId={barrierActionId}
          isOpen={!!barrierActionId}
          onClose={() => setBarrierActionId(null)}
          onSuccess={fetchFarmerData}
        />
      )}

      {/* Recommendation Passport Modal */}
      {passportRecId && (
        <RecommendationPassportModal
          recommendationId={passportRecId}
          isOpen={!!passportRecId}
          onClose={() => setPassportRecId(null)}
        />
      )}
    </div>
  );
}
