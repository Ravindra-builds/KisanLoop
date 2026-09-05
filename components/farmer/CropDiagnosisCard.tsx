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
    <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <Camera className="w-5 h-5" />
          <h3 className="font-bold text-lg text-foreground">
            {language === "hi"
              ? "फसल रोग पहचान (AI Vision Diagnosis)"
              : "Check Crop Health (AI Vision)"}
          </h3>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-semibold">
          Gemini / Demo Vision
        </span>
      </div>

      <p className="text-sm text-muted-foreground">
        {language === "hi"
          ? "पत्तियों पर धब्बे या कीट दिखाई देने पर फोटो लें। AI मॉडल लक्षण और व्यावहारिक समाधान तुरंत बताएगा।"
          : "Take a photo of diseased leaves. The vision model analyzes symptoms and checks treatment feasibility."}
      </p>

      {/* Upload / Test Button */}
      {!diagnosisResult && (
        <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl p-6 text-center space-y-3 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto text-emerald-600">
            <Camera className="w-6 h-6" />
          </div>

          <div>
            <p className="font-semibold text-sm text-foreground">
              {language === "hi"
                ? "रवि जी के धान के पत्ते की जांच करें"
                : "Analyze Ravi's Paddy Leaf (Demo Image)"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Simulates real-time smartphone photo diagnosis
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimulateAnalysis}
            disabled={analyzing}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
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
                  {language === "hi" ? "तस्वीर की जांच करें" : "Scan Leaf Sample"}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Diagnosis Results Card */}
      {diagnosisResult && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/20 p-5 space-y-4 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                  {diagnosisResult.diagnosis.severity} Severity
                </span>
                <span className="text-xs text-muted-foreground">
                  Confidence: {(diagnosisResult.diagnosis.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <h4 className="font-extrabold text-base text-foreground mt-1.5">
                {diagnosisResult.diagnosis.pestOrDiseaseName}
              </h4>
            </div>

            <AudioPlayer
              textToSpeak={`${diagnosisResult.diagnosis.pestOrDiseaseName} पहचाना गया। ${diagnosisResult.diagnosis.recommendedImmediateAction}`}
              language={language}
            />
          </div>

          {/* Symptoms */}
          <div className="text-xs text-muted-foreground space-y-1">
            <span className="font-semibold text-foreground block">
              {language === "hi" ? "पहचाने गए लक्षण:" : "Identified Symptoms:"}
            </span>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              {diagnosisResult.diagnosis.symptoms.map((sym: string, i: number) => (
                <li key={i}>{sym}</li>
              ))}
            </ul>
          </div>

          {/* Feasibility Validated Action */}
          <div className="p-3.5 rounded-xl bg-card border border-border space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wide">
              <CheckCircle className="w-4 h-4" />
              <span>
                {language === "hi"
                  ? "सुझाया गया व्यावहारिक कदम (Feasibility Checked)"
                  : "Feasible Action (Checked for Ravi's Farm)"}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {diagnosisResult.diagnosis.recommendedImmediateAction}
            </p>
          </div>

          {/* Expert Review Notification */}
          {diagnosisResult.diagnosis.requiresExpertReview && (
            <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 bg-purple-100/60 dark:bg-purple-950/40 p-2.5 rounded-lg border border-purple-200 dark:border-purple-800/40">
              <ShieldAlert className="w-4 h-4 shrink-0 text-purple-600" />
              <span>
                {language === "hi"
                  ? "सुरक्षा नीति: 85% से कम विश्वास स्तर के कारण यह मामला KVK विशेषज्ञ (Dr. Patel) के पास सत्यापन हेतु भेजा गया है।"
                  : "AI Safety: Case auto-escalated to KVK Agronomist (Dr. Patel) for verification."}
              </span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setDiagnosisResult(null)}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              {language === "hi" ? "दूसरा पत्ता स्कैन करें" : "Scan another sample"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
