"use client";

import React, { useState } from "react";
import {
  Camera,
  Upload,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Leaf,
} from "lucide-react";
import { useLanguage } from "../shared/LanguageContext";
import { AudioPlayer } from "../shared/AudioPlayer";

interface CropDiagnosisCardProps {
  onDiagnosisComplete?: () => void;
}

export function CropDiagnosisCard({ onDiagnosisComplete }: CropDiagnosisCardProps) {
  const { language, t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null);

  const handleSimulateAnalysis = async () => {
    setAnalyzing(true);
    setDiagnosisResult(null);

    try {
      const res = await fetch("/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: "farm_ravi_01",
          cropName: "Paddy",
          imageBase64: "sample_leaf_blast_image",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setDiagnosisResult(json.data);
        if (onDiagnosisComplete) onDiagnosisComplete();
      }
    } catch (err) {
      console.error("Diagnosis error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-emerald-500/20 shadow-xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-foreground tracking-tight">
              {language === "hi"
                ? "फसल रोग पहचान (AI Vision Diagnosis)"
                : "Check Crop Health (AI Vision)"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === "hi"
                ? "स्मार्टफोन कैमरा से पत्ती स्कैन कर व्यावहारिक समाधान पाएं"
                : "Multimodal leaf symptom detection with expert escalation"}
            </p>
          </div>
        </div>

        <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 font-bold">
          Gemini Vision • PostGIS Geo-Tagged
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        {language === "hi"
          ? "पत्तियों पर धब्बे या कीट दिखाई देने पर फोटो लें। AI मॉडल लक्षण और व्यावहारिक समाधान तुरंत बताएगा।"
          : "Take a photo of diseased leaves. The vision model analyzes symptoms and checks treatment feasibility."}
      </p>

      {/* Upload / Test Button */}
      {!diagnosisResult && (
        <div className="border-2 border-dashed border-emerald-500/30 dark:border-emerald-500/20 rounded-3xl p-8 text-center space-y-4 bg-emerald-50/30 dark:bg-emerald-950/20 hover:bg-emerald-50/50 transition">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <Leaf className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <p className="font-extrabold text-base text-foreground">
              {language === "hi"
                ? "रवि कुमार के धान के पत्ते की जांच करें"
                : "Analyze Ravi's Paddy Leaf (Namkum, Ranchi)"}
            </p>
            <p className="text-xs text-muted-foreground">
              Simulates field camera capture for Leaf Blast (Pyricularia oryzae)
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimulateAnalysis}
            disabled={analyzing}
            className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {analyzing ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>{t("analyzing")}</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>
                  {language === "hi" ? "पत्ती की तस्वीर जांचें (Scan Leaf)" : "Scan Leaf Sample"}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Diagnosis Results Card */}
      {diagnosisResult && (
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-950/20 p-6 space-y-5 animate-fade-in shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-200 border border-amber-500/30">
                  {diagnosisResult.diagnosis.severity} Severity
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  AI Confidence: {(diagnosisResult.diagnosis.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <h4 className="font-black text-xl text-foreground mt-2">
                {diagnosisResult.diagnosis.pestOrDiseaseName}
              </h4>
            </div>

            <AudioPlayer
              textToSpeak={`${diagnosisResult.diagnosis.pestOrDiseaseName} पहचाना गया। ${diagnosisResult.diagnosis.recommendedImmediateAction}`}
              language={language}
            />
          </div>

          {/* Symptoms Tags */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground block">
              {language === "hi" ? "पहचाने गए लक्षण (Detected Symptoms):" : "Identified Symptoms:"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {diagnosisResult.diagnosis.symptoms.map((sym: string, i: number) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full bg-background border border-amber-500/20 text-foreground font-medium"
                >
                  • {sym}
                </span>
              ))}
            </div>
          </div>

          {/* Feasibility Validated Action */}
          <div className="p-4 rounded-2xl bg-card border border-emerald-500/30 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>
                {language === "hi"
                  ? "सुझाया गया व्यावहारिक कदम (Feasibility Checked for Ravi)"
                  : "Feasible Action (Checked for Ravi's Farm)"}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground leading-relaxed">
              {diagnosisResult.diagnosis.recommendedImmediateAction}
            </p>
          </div>

          {/* Expert Review Notification */}
          {diagnosisResult.diagnosis.requiresExpertReview && (
            <div className="flex items-center gap-3 text-xs text-purple-700 dark:text-purple-300 bg-purple-500/10 p-3.5 rounded-2xl border border-purple-500/20">
              <ShieldAlert className="w-5 h-5 shrink-0 text-purple-600" />
              <span className="leading-snug">
                {language === "hi"
                  ? "सुरक्षा नीति: 85% से कम विश्वास स्तर के कारण यह मामला KVK विशेषज्ञ (Dr. Patel) के पास सत्यापन हेतु भेजा गया है।"
                  : "AI Safety Protocol: Confidence under 85% auto-escalated to KVK Agronomist (Dr. Patel) for triage."}
              </span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setDiagnosisResult(null)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
            >
              {language === "hi" ? "दूसरा पत्ता स्कैन करें →" : "Scan another sample →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
