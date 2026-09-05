"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  X,
  CheckCircle,
  CloudRain,
  Activity,
  Layers,
  ShieldAlert,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "../shared/LanguageContext";
import { formatDateTime } from "@/lib/utils";

interface PassportModalProps {
  recommendationId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RecommendationPassportModal({
  recommendationId,
  isOpen,
  onClose,
}: PassportModalProps) {
  const { language } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !recommendationId) return;
    setLoading(true);
    fetch(`/api/recommendations/${recommendationId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [isOpen, recommendationId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-green-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-300" />
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {language === "hi"
                  ? "सिफारिश पासपोर्ट (Action Passport)"
                  : "Recommendation Passport"}
              </h3>
              <p className="text-xs text-emerald-200">
                Traceable Agronomic Decision Record • ID: {recommendationId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-foreground">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground animate-pulse">
              पासपोर्ट लोड हो रहा है... (Loading passport details...)
            </div>
          ) : !data ? (
            <div className="py-8 text-center text-red-500">
              No passport data found for this recommendation.
            </div>
          ) : (
            <>
              {/* What was recommended */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                    {language === "hi" ? "सलाह / कदम" : "What Was Recommended"}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100">
                    Confidence: {(data.recommendation.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>
                <h4 className="font-extrabold text-base text-foreground mt-1">
                  {data.recommendation.title}
                </h4>
                <p className="text-sm text-foreground/90 mt-1">
                  {data.recommendation.actionSummary}
                </p>
              </div>

              {/* Why */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "hi" ? "कारण और संदर्भ" : "Why It Was Recommended"}
                </span>
                <p className="text-sm text-foreground/90 mt-1 bg-muted/40 p-3 rounded-xl border">
                  {data.recommendation.reason}
                </p>
              </div>

              {/* Evidence Considered */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "hi" ? "साक्ष्य और डेटा स्रोत" : "Evidence & Telemetry Considered"}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {data.evidence && data.evidence.length > 0 ? (
                    data.evidence.map((ev: any) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-xl border bg-background text-xs space-y-1 shadow-sm"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                          {ev.evidenceType === "WEATHER" && <CloudRain className="w-3.5 h-3.5" />}
                          {ev.evidenceType === "SOIL" && <Layers className="w-3.5 h-3.5" />}
                          {ev.evidenceType === "VISION" && <Activity className="w-3.5 h-3.5" />}
                          {ev.evidenceType === "KNOWLEDGE_DOC" && <FileText className="w-3.5 h-3.5" />}
                          <span>{ev.title}</span>
                        </div>
                        <p className="text-muted-foreground">{ev.details}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No specific evidence records linked.</p>
                  )}
                </div>
              </div>

              {/* Action Taken */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {language === "hi" ? "किसान द्वारा की गई कार्रवाई" : "Farmer Action Status"}
                </span>
                <div className="mt-2 p-3 rounded-xl border flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className={`w-5 h-5 ${
                        data.action?.status === "COMPLETED"
                          ? "text-emerald-600"
                          : data.action?.status === "NOT_POSSIBLE"
                          ? "text-amber-600"
                          : "text-blue-500"
                      }`}
                    />
                    <div>
                      <div className="text-sm font-bold">
                        {data.action?.status || "PENDING"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.action?.notes || "Action pending confirmation by farmer."}
                      </div>
                    </div>
                  </div>
                  {data.action?.completedAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(data.action.completedAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Outcome Measured */}
              {data.outcome && (
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    <span>{language === "hi" ? "मापा गया परिणाम" : "Measured Outcome"}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Preserved Impact:</span>
                      <span className="font-bold text-sm text-foreground">
                        {data.outcome.yieldImpact || "+5% Yield Protection"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Water Conserved:</span>
                      <span className="font-bold text-sm text-foreground">
                        {data.outcome.waterSavedLiters?.toLocaleString()} Liters
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Expert Review */}
              {data.expertReview && (
                <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40">
                  <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs uppercase tracking-wider">
                    <UserCheck className="w-4 h-4" />
                    <span>{language === "hi" ? "कृषि विशेषज्ञ सत्यापन" : "Expert Review"}</span>
                  </div>
                  <div className="mt-1 text-xs">
                    <span className="font-semibold text-foreground">
                      Status: {data.expertReview.status}
                    </span>
                    <p className="text-muted-foreground mt-0.5">
                      {data.expertReview.expertNotes}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-muted/40 border-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-foreground text-background font-medium text-sm hover:opacity-90"
          >
            {language === "hi" ? "बंद करें" : "Close Passport"}
          </button>
        </div>
      </div>
    </div>
  );
}
