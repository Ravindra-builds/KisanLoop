"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  Layers,
  Sparkles,
  Globe2,
  Stethoscope,
  BookOpen,
  Filter,
} from "lucide-react";
import { useLanguage } from "../shared/LanguageContext";
import { formatDateTime } from "@/lib/utils";
import { UserNav } from "../shared/UserNav";

export function ExpertPortal() {
  const { language, setLanguage } = useLanguage();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [expertNote, setExpertNote] = useState("");
  const [correctionDetails, setCorrectionDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/expert/cases");
      const json = await res.json();
      if (json.success) {
        setCases(json.data);
        if (json.data.length > 0 && !selectedCase) {
          setSelectedCase(json.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleReviewAction = async (action: "APPROVE" | "CORRECT" | "REQUEST_FOLLOW_UP") => {
    if (!selectedCase) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/expert/cases/${selectedCase.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: expertNote,
          correctionDetails: action === "CORRECT" ? correctionDetails : undefined,
          expertId: "usr_expert_patel",
        }),
      });

      if (res.ok) {
        setToastMessage(`Case ${selectedCase.id} successfully reviewed (${action}).`);
        setTimeout(() => setToastMessage(null), 3000);
        setExpertNote("");
        setCorrectionDetails("");
        fetchCases();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-8 z-50 bg-purple-600 text-white font-semibold text-sm px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Expert Dedicated Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-card border-r border-border h-screen sticky top-0 shrink-0 select-none">
        {/* Brand */}
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-foreground flex items-center gap-1.5">
              <span>Kisan</span>
              <span className="text-purple-600">EXPERT</span>
            </div>
            <p className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold tracking-wide">
              KVK Agronomy Review Desk
            </p>
          </div>
        </div>

        {/* Navigation / Case Queue Filter */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Escalated Cases Queue</span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-extrabold text-[10px]">
              {cases.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {cases.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCase(c)}
                className={`w-full text-left p-3 rounded-xl border transition text-xs space-y-1 ${
                  selectedCase?.id === c.id
                    ? "border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 shadow-xs"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    {c.farmer?.name || "Farmer"}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : c.status === "CORRECTED"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {c.recommendation?.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Expert Profile Badge */}
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
                    ? "bg-purple-600 text-white shadow-xs"
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
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Expert Profile Badge & Sign Out */}
          <UserNav accentColor="purple" />
        </div>
      </aside>

      {/* Mobile Header for Expert */}
      <header className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-foreground">
              Kisan<span className="text-purple-600">EXPERT</span>
            </span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">
              Dr. K. Patel • KVK Review
            </span>
          </div>
        </div>

        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900">
          {cases.length} Cases
        </span>
      </header>

      {/* Main Inspection Workspace */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        {selectedCase ? (
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-6 animate-fade-in">
            {/* Case Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Case Review #{selectedCase.id}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground mt-0.5">
                  {selectedCase.recommendation?.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-muted">
                  Village: {selectedCase.farmer?.village || "Namkum"}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-900">
                  Crop: Paddy (IR-64)
                </span>
              </div>
            </div>

            {/* Farmer & Plot Context */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/40 border">
                <span className="text-muted-foreground block">Farmer Identity:</span>
                <span className="font-bold text-foreground text-sm">
                  {selectedCase.farmer?.name} ({selectedCase.farmer?.phone})
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border">
                <span className="text-muted-foreground block">Plot Size & Soil:</span>
                <span className="font-bold text-foreground text-sm">
                  1.2 Acres • Red Sandy Loam
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border">
                <span className="text-muted-foreground block">Trigger Reason:</span>
                <span className="font-bold text-amber-600 text-sm">
                  Vision Confidence 78% (&lt;85%)
                </span>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>AI Perception Reasoning</span>
              </h4>
              <p className="text-sm p-4 rounded-xl bg-muted/30 border leading-relaxed text-foreground/90">
                {selectedCase.recommendation?.reason}
              </p>
            </div>

            {/* Telemetry & Citations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Sensor Telemetry & Verified Citations</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedCase.evidence && selectedCase.evidence.length > 0 ? (
                  selectedCase.evidence.map((ev: any) => (
                    <div key={ev.id} className="p-3.5 rounded-xl border bg-background space-y-1">
                      <div className="font-bold text-emerald-700">{ev.title}</div>
                      <p className="text-muted-foreground">{ev.details}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">ICAR Rice Guidelines (2024)</div>
                )}
              </div>
            </div>

            {/* Decision & Override Box */}
            <div className="p-6 rounded-2xl border-2 border-purple-500/30 bg-purple-50/20 space-y-4">
              <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Expert Decision & Agronomic Action</span>
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Agronomist Verification Notes:
                  </label>
                  <textarea
                    value={expertNote}
                    onChange={(e) => setExpertNote(e.target.value)}
                    placeholder="Add observations, diagnostic feedback or local spray dosage..."
                    className="w-full text-xs rounded-xl border border-input p-3 bg-background outline-none focus:ring-2 focus:ring-purple-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Alternative Prescription (Bypass Local Stockouts):
                  </label>
                  <input
                    type="text"
                    value={correctionDetails}
                    onChange={(e) => setCorrectionDetails(e.target.value)}
                    placeholder="e.g. Recommend NSKE 5% spray instead of chemical fungicide due to local availability..."
                    className="w-full text-xs rounded-xl border border-input p-2.5 bg-background outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReviewAction("REQUEST_FOLLOW_UP")}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-border bg-background hover:bg-muted text-foreground"
                  >
                    Request Field Visit
                  </button>

                  <button
                    type="button"
                    disabled={submitting || !correctionDetails.trim()}
                    onClick={() => handleReviewAction("CORRECT")}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50"
                  >
                    Correct Advisory
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleReviewAction("APPROVE")}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Recommendation</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center text-muted-foreground border rounded-2xl bg-card">
            Select an escalated case to begin agronomist verification.
          </div>
        )}
      </main>
    </div>
  );
}
