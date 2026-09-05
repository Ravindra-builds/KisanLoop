"use client";

import React, { useState, useEffect } from "react";
import {
  Sprout,
  Droplets,
  CloudRain,
  Bug,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  FileCheck2,
  Calendar,
  Layers,
  Thermometer,
} from "lucide-react";
import { useLanguage } from "../shared/LanguageContext";
import { AudioPlayer } from "../shared/AudioPlayer";
import { AdoptionBarrierModal } from "./AdoptionBarrierModal";
import { RecommendationPassportModal } from "./RecommendationPassportModal";
import { CropDiagnosisCard } from "./CropDiagnosisCard";
import { VoiceAssistant } from "./VoiceAssistant";

export function FarmerHome() {
  const { language, t } = useLanguage();
  const [farmState, setFarmState] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [barrierActionId, setBarrierActionId] = useState<string | null>(null);
  const [passportRecId, setPassportRecId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchFarmData = async () => {
    try {
      setLoading(true);
      const [stateRes, recsRes, actsRes] = await Promise.all([
        fetch("/api/farm-state?farmId=farm_ravi_01").then((r) => r.json()),
        fetch("/api/recommendations?farmId=farm_ravi_01").then((r) => r.json()),
        fetch("/api/actions?farmerId=frm_ravi").then((r) => r.json()),
      ]);

      if (stateRes.success) setFarmState(stateRes.data);
      if (recsRes.success) setRecommendations(recsRes.data);
      if (actsRes.success) setActions(actsRes.data);
    } catch (err) {
      console.error("Failed to load farm data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmData();
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
        fetchFarmData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Find Today's Primary Hero Recommendation
  const todayRec = recommendations[0];
  const relatedAction = todayRec
    ? actions.find((a) => a.recommendationId === todayRec.id) || actions[0]
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Hero Welcome & Farm Context Banner */}
      <div className="bg-gradient-to-br from-emerald-700 via-green-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-6">
          <Sprout className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-300 font-semibold text-sm uppercase tracking-wider">
                  Namkum, Ranchi (झारखंड)
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1">
                {language === "hi" ? "नमस्ते, रवि कुमार 👋" : "Namaste, Ravi Kumar 👋"}
              </h1>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-right">
              <span className="text-xs text-emerald-200 block">
                {language === "hi" ? "फसल और क्षेत्रफल" : "Crop & Plot"}
              </span>
              <span className="font-extrabold text-base">
                धान (Paddy IR-64) • 1.2 एकड़
              </span>
            </div>
          </div>

          {/* Quick Vital Signals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                <Sprout className="w-4 h-4 text-emerald-300" />
                <span>{t("cropHealth")}</span>
              </div>
              <div className="font-black text-lg mt-1 text-white">
                {language === "hi" ? "उत्कृष्ट (Good)" : "Healthy"}
              </div>
              <div className="text-[11px] text-emerald-200/80">NDVI: 0.72 (Sentinel-2)</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
              <div className="flex items-center gap-1.5 text-xs text-emerald-200 font-medium">
                <Droplets className="w-4 h-4 text-cyan-300" />
                <span>{t("soilMoisture")}</span>
              </div>
              <div className="font-black text-lg mt-1 text-white">
                {language === "hi" ? "पर्याप्त (68%)" : "Adequate (68%)"}
              </div>
              <div className="text-[11px] text-emerald-200/80">No deficit</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
              <div className="flex items-center gap-1.5 text-xs text-amber-200 font-medium">
                <CloudRain className="w-4 h-4 text-amber-300" />
                <span>{t("weatherRisk")}</span>
              </div>
              <div className="font-black text-lg mt-1 text-amber-300">
                {language === "hi" ? "उच्च (High Rain)" : "High Rain"}
              </div>
              <div className="text-[11px] text-amber-200/80">85% Rain Tomorrow (42mm)</div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
              <div className="flex items-center gap-1.5 text-xs text-purple-200 font-medium">
                <Bug className="w-4 h-4 text-purple-300" />
                <span>{t("pestRisk")}</span>
              </div>
              <div className="font-black text-lg mt-1 text-white">
                {language === "hi" ? "मध्यम (Moderate)" : "Moderate"}
              </div>
              <div className="text-[11px] text-purple-200/80">Leaf Blast Watch</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero: Today's Action Card */}
      {todayRec && (
        <div className="bg-card rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 shadow-lg space-y-6 relative overflow-hidden">
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

          {/* Action Buttons (Large touch targets for mobile farmers) */}
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

      {/* Voice Assistant & Crop Diagnosis Cards in Two Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VoiceAssistant />
        <CropDiagnosisCard onDiagnosisComplete={fetchFarmData} />
      </div>

      {/* Additional Recommendations / Action History */}
      <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-foreground">
          {language === "hi" ? "हाल की सिफ़ारिशें और इतिहास" : "Recent Actions & History"}
        </h3>
        <div className="space-y-3">
          {actions.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-3.5 rounded-xl border bg-muted/20 hover:bg-muted/40 transition"
            >
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-foreground">{act.title}</h4>
                <p className="text-xs text-muted-foreground">{act.notes || act.description}</p>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  act.status === "COMPLETED"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                    : act.status === "NOT_POSSIBLE"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                }`}
              >
                {act.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Adoption Barrier Modal */}
      {barrierActionId && (
        <AdoptionBarrierModal
          actionId={barrierActionId}
          isOpen={!!barrierActionId}
          onClose={() => setBarrierActionId(null)}
          onSuccess={fetchFarmData}
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
