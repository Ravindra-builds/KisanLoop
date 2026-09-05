"use client";

import React, { useState } from "react";
import { AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../shared/LanguageContext";

interface AdoptionBarrierModalProps {
  actionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdoptionBarrierModal({
  actionId,
  isOpen,
  onClose,
  onSuccess,
}: AdoptionBarrierModalProps) {
  const { language } = useLanguage();
  const [selectedReason, setSelectedReason] = useState<string>("INPUT_UNAVAILABLE");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const barrierOptions = [
    {
      id: "INPUT_UNAVAILABLE",
      labelHi: "स्थानीय दुकान में दवा / खाद उपलब्ध नहीं है",
      labelEn: "Agri-input or medicine unavailable locally",
    },
    {
      id: "TOO_EXPENSIVE",
      labelHi: "लागत बहुत अधिक है (पैसे की कमी)",
      labelEn: "Cost is too high (working capital constraint)",
    },
    {
      id: "NO_LABOUR",
      labelHi: "मजदूर नहीं मिल रहे हैं",
      labelEn: "Labour is not available",
    },
    {
      id: "NO_EQUIPMENT",
      labelHi: "छिड़काव / कृषि उपकरण उपलब्ध नहीं है",
      labelEn: "Sprayer or equipment unavailable",
    },
    {
      id: "DIDNT_UNDERSTAND",
      labelHi: "सलाह समझ नहीं आई",
      labelEn: "Could not understand the instructions",
    },
    {
      id: "TIMING_ISSUE",
      labelHi: "समय या मौसम अनुकूल नहीं था",
      labelEn: "Timing or weather window passed",
    },
    {
      id: "OTHER",
      labelHi: "अन्य कारण",
      labelEn: "Other reason",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/actions/${actionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "NOT_POSSIBLE",
          barrierType: selectedReason,
          notes,
        }),
      });
      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error("Failed to record barrier:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-card rounded-2xl p-6 shadow-2xl border border-border">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-6 h-6" />
            <h3 className="font-bold text-lg text-foreground">
              {language === "hi"
                ? "आप यह कदम क्यों नहीं उठा सके?"
                : "Why couldn't you complete this action?"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mt-3">
          {language === "hi"
            ? "आपकी वास्तविक बाधा जानने से व्यवस्था आपको बेहतर और सुलभ विकल्प दे सकेगी।"
            : "Recording your real constraint helps KisanLoop offer feasible local alternatives."}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {barrierOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  selectedReason === opt.id
                    ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-medium"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  name="barrierReason"
                  value={opt.id}
                  checked={selectedReason === opt.id}
                  onChange={() => setSelectedReason(opt.id)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm">
                  {language === "hi" ? opt.labelHi : opt.labelEn}
                </span>
              </label>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              {language === "hi"
                ? "अतिरिक्त विवरण (वैकल्पिक):"
                : "Additional Details (Optional):"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                language === "hi"
                  ? "जैसे: पास की दुकान में यह दवा खत्म थी..."
                  : "e.g., Local market had run out of this fungicide..."
              }
              className="w-full text-sm rounded-xl border border-input p-3 bg-background focus:ring-2 focus:ring-amber-500 outline-none"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-muted-foreground hover:bg-muted"
            >
              {language === "hi" ? "रद्द करें" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-md flex items-center gap-2 transition"
            >
              {isSubmitting ? (
                <span>दर्ज हो रहा है...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === "hi" ? "बाधा दर्ज करें" : "Submit Barrier"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
