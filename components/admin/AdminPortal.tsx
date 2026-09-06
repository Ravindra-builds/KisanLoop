"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppIcon from "@/components/shared/AppIcon";
import { ProfileSetupModal } from "@/components/shared/ProfileSetupModal";

interface DocItem {
  id: string;
  title: string;
  category: string;
  fileSize: string;
  chunks: number;
  qdrantIndexed: boolean;
  uploadedAt: string;
}

const INITIAL_DOCS: DocItem[] = [
  {
    id: "doc-001",
    title: "ICAR Package of Practices for Rice (Eastern Region 2024)",
    category: "ICAR POP Guidelines",
    fileSize: "4.2 MB",
    chunks: 142,
    qdrantIndexed: true,
    uploadedAt: "2 days ago",
  },
  {
    id: "doc-002",
    title: "Birsa Agricultural University - Kharif Disease Surveillance Protocol",
    category: "State Agronomic Guidelines",
    fileSize: "2.8 MB",
    chunks: 86,
    qdrantIndexed: true,
    uploadedAt: "4 days ago",
  },
  {
    id: "doc-003",
    title: "Pesticide Formulations & Maximum Residue Limits (MRL 2024)",
    category: "Regulatory Agrochemicals",
    fileSize: "1.6 MB",
    chunks: 54,
    qdrantIndexed: true,
    uploadedAt: "1 week ago",
  },
  {
    id: "doc-004",
    title: "Namkum Micro-Watershed Soil Nitrogen & Organic Carbon Survey",
    category: "Soil Telemetry Datasets",
    fileSize: "5.1 MB",
    chunks: 210,
    qdrantIndexed: true,
    uploadedAt: "2 weeks ago",
  },
];

export function AdminPortal() {
  const [activeTab, setActiveTab] = useState<"rag" | "datasets" | "guardrails" | "simulator">("rag");
  const [documents, setDocuments] = useState<DocItem[]>(INITIAL_DOCS);
  const [searchQuery, setSearchQuery] = useState("");
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [modelProvider, setModelProvider] = useState("gemini-2.0-flash");
  const [vectorCount, setVectorCount] = useState(18450);

  // File Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modals & Reset
  const [showClusterModal, setShowClusterModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; icon: string } | null>(null);

  // Profile & Role State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [adminName, setAdminName] = useState("Dr. A. Verma");
  const [adminDesignation, setAdminDesignation] = useState("Agronomy Systems Lead");
  const [adminDepartment, setAdminDepartment] = useState("KisanLoop Core Platform");
  const [userRole, setUserRole] = useState<"FARMER" | "EXPERT" | "GOVT" | "ADMIN">("ADMIN");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data?.user) {
          const u = res.data.user;
          if (u.name && u.name !== "Farmer") setAdminName(u.name);
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

  // Upload simulated / API upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(15);

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(timer);
          setTimeout(() => {
            setUploading(false);
            setUploadProgress(0);
            const newDoc: DocItem = {
              id: `doc-${Date.now().toString().slice(-4)}`,
              title: file.name.replace(/\.[^/.]+$/, ""),
              category: "ICAR POP Guidelines",
              fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              chunks: Math.floor(Math.random() * 80) + 40,
              qdrantIndexed: true,
              uploadedAt: "Just now",
            };
            setDocuments((prevDocs) => [newDoc, ...prevDocs]);
            setVectorCount((v) => v + newDoc.chunks * 12);
            triggerToast(
              "Document Ingested",
              `${file.name} chunked into ${newDoc.chunks} passages and synced to Qdrant.`,
              "upload_file"
            );
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleResetDemoState = async () => {
    setResetting(true);
    try {
      await fetch("/api/admin/reset-demo", { method: "POST" }).catch(() => null);
      triggerToast(
        "System State Reset",
        "Deterministic test baseline restored for Ravi Kumar (Plot 2, Namkum).",
        "restart_alt"
      );
    } finally {
      setResetting(false);
      setShowResetModal(false);
    }
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-[#f1fcf1] dark:bg-[#121814] text-[#141e17] dark:text-zinc-100 min-h-screen font-sans antialiased selection:bg-emerald-100 dark:selection:bg-emerald-950 w-full overflow-x-hidden">
      <div className="max-w-[1380px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 w-full overflow-x-hidden">
        {/* ==================================================================== */}
        {/* TOP SHARED ADMIN NAVIGATION BAR                                      */}
        {/* ==================================================================== */}
        <header className="flex flex-wrap items-center justify-between border-b border-[#eaf0ed] dark:border-white/10 pb-4 mb-4 gap-4">
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#214e34] text-white flex items-center justify-center shadow-xs">
                <AppIcon name="settings_suggest" className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-[#111814] dark:text-white tracking-tight">KisanLoop</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ebf7eb] dark:bg-emerald-950 text-[#1b4332] dark:text-emerald-400 border border-[#d2ded5] dark:border-emerald-800">
                    ENGINE ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-[#608570] dark:text-zinc-400 font-medium">
                  RAG Pipeline, PostGIS Schemas &amp; AI Guardrails
                </p>
              </div>
            </Link>

            {/* Global Search Input */}
            <div className="relative w-full sm:w-auto sm:min-w-[200px]">
              <AppIcon name="search" className="w-4 h-4 text-[#608570] absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search docs, vector chunks, tables..."
                className="w-full text-xs py-2 pl-9 pr-3 rounded-xl border border-[#dce6dc] dark:border-white/10 bg-[#eaf0ed] dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#214e34] focus:ring-0 text-foreground dark:text-white transition"
              />
            </div>
          </div>

          {/* Action Bar & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Top Navigation Links */}
            <div className="hidden xl:flex items-center gap-1 bg-[#eaf0ed] dark:bg-zinc-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("rag")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "rag"
                    ? "bg-white dark:bg-zinc-900 text-[#214e34] dark:text-white shadow-xs"
                    : "text-[#608570] hover:text-[#111814] dark:hover:text-white"
                }`}
              >
                Knowledge RAG
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("datasets")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "datasets"
                    ? "bg-white dark:bg-zinc-900 text-[#214e34] dark:text-white shadow-xs"
                    : "text-[#608570] hover:text-[#111814] dark:hover:text-white"
                }`}
              >
                Datasets &amp; PostGIS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("guardrails")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "guardrails"
                    ? "bg-white dark:bg-zinc-900 text-[#214e34] dark:text-white shadow-xs"
                    : "text-[#608570] hover:text-[#111814] dark:hover:text-white"
                }`}
              >
                Model Guardrails
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("simulator")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === "simulator"
                    ? "bg-white dark:bg-zinc-900 text-[#214e34] dark:text-white shadow-xs"
                    : "text-[#608570] hover:text-[#111814] dark:hover:text-white"
                }`}
              >
                Telemetry &amp; Logs
              </button>
            </div>

            {/* Topology Pill */}
            <button
              type="button"
              onClick={() => setShowClusterModal(true)}
              className="px-3 py-2 bg-[#eaf0ed] dark:bg-zinc-800 hover:bg-[#dce6dc] rounded-xl text-xs font-bold text-[#111814] dark:text-white transition cursor-pointer"
            >
              Ranchi Cluster (v2.5)
            </button>

            {/* Reset Demo State Trigger */}
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs font-bold transition cursor-pointer"
              title="Reset mock and demo state"
            >
              <AppIcon name="restart_alt" className="w-4 h-4" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Admin Lead Profile */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-[#eaf0ed] dark:border-white/10">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#111814] dark:text-white">{adminName}</span>
                <span className="text-[10px] text-[#608570] dark:text-zinc-400 font-semibold">
                  {adminDesignation}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#214e34] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {adminName
                  .split(" ")
                  .filter(Boolean)
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "AD"}
              </div>
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

            {/* Dedicated Universal Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-[#dce6dc] dark:border-white/10 hover:border-red-200 text-xs font-bold shadow-xs transition cursor-pointer"
              title="Log out of Admin Portal"
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
            onClick={() => setActiveTab("rag")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "rag"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Knowledge RAG
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("datasets")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "datasets"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Datasets &amp; PostGIS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guardrails")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "guardrails"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Model Guardrails
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === "simulator"
                ? "bg-[#214e34] text-white shadow-xs"
                : "bg-white dark:bg-zinc-800 text-[#608570] dark:text-zinc-300 border border-[#dce6dc] dark:border-white/10"
            }`}
          >
            Telemetry &amp; Logs
          </button>
        </div>

        {/* ==================================================================== */}
        {/* PLATFORM TELEMETRY BANNER                                            */}
        {/* ==================================================================== */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#d6e1da] dark:border-white/10 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs md:text-sm font-bold text-[#111814] dark:text-white">
                Platform Microservices: All Subsystems Operational
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#ebf7eb] text-[#05371f] dark:bg-emerald-950 dark:text-emerald-300">
                Isolated Root Domain
              </span>
            </div>
            <p className="text-[11px] md:text-xs text-[#608570] dark:text-zinc-400">
              Neon Postgres (Connected, 14ms) • Qdrant Vector Cloud ({vectorCount.toLocaleString()} Vectors, 9ms) • Upstash Redis (Synced) • Inngest Runners (4 Active)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowClusterModal(true)}
            className="self-start sm:self-center px-3 py-1.5 bg-[#214e34] hover:bg-[#163624] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            Cluster Topology
          </button>
        </div>

        {/* ==================================================================== */}
        {/* 4 KPI METRIC CARDS                                                   */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#608570] dark:text-zinc-400">
                Indexed Research Docs
              </span>
              <AppIcon name="library_books" className="w-4 h-4 text-[#214e34]" />
            </div>
            <p className="text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-1">
              {documents.length + 138} Papers
            </p>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              ICAR &amp; State POPs
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#608570] dark:text-zinc-400">
                Qdrant Vector Chunks
              </span>
              <AppIcon name="hub" className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-1">
              {vectorCount.toLocaleString()}
            </p>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              1536-dim • Cosine Indexed
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#608570] dark:text-zinc-400">
                Cadastral PostGIS Sets
              </span>
              <AppIcon name="map" className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-1">28 Layers</p>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              Chota Nagpur Spatial
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#608570] dark:text-zinc-400">
                Engine Uptime
              </span>
              <AppIcon name="bolt" className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-1">99.9%</p>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              4 Runners Active
            </span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* WORKSPACE TAB 1: KNOWLEDGE RAG PIPELINE                              */}
        {/* ==================================================================== */}
        {activeTab === "rag" && (
          <div className="space-y-6">
            {/* Dropzone for Guidelines */}
            <div className="p-8 rounded-3xl bg-white dark:bg-[#18221B] border-2 border-dashed border-[#dce6dc] dark:border-white/15 text-center space-y-3 relative overflow-hidden">
              <input
                type="file"
                accept=".pdf,.docx,.txt,.xml"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="w-14 h-14 rounded-2xl bg-[#ebf7eb] dark:bg-zinc-800 text-[#214e34] dark:text-emerald-400 flex items-center justify-center mx-auto">
                <AppIcon name="upload_file" className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-[#111814] dark:text-white">
                Upload ICAR Research Paper or State Package of Practices (POP)
              </h3>
              <p className="text-xs text-[#608570] dark:text-zinc-400 max-w-md mx-auto">
                Drag &amp; drop PDF, DOCX, or XML files. The document is automatically parsed, text-chunked with 20% semantic overlap, embedded, and indexed into Qdrant Cloud.
              </p>

              {uploading && (
                <div className="max-w-xs mx-auto space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Chunking &amp; Vectorizing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#214e34] transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Ingested Documents Ledger */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#111814] dark:text-white tracking-tight">
                    Ingested Agricultural Knowledge Documents ({filteredDocs.length})
                  </h3>
                  <p className="text-xs text-[#608570] dark:text-zinc-400">
                    Live citations referenced by KisanLoop Voice AI and Recommendation Engine
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#f0f4f1] dark:divide-white/10">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-[#ebf7eb] dark:bg-zinc-800 text-[#214e34] dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <AppIcon name="description" className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-[#111814] dark:text-white truncate">
                          {doc.title}
                        </div>
                        <div className="text-[11px] text-[#608570] dark:text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>{doc.category}</span>
                          <span>•</span>
                          <span>{doc.fileSize}</span>
                          <span>•</span>
                          <span className="text-[#214e34] dark:text-emerald-400 font-semibold font-mono">
                            {doc.chunks} Chunks
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Qdrant Synced
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* WORKSPACE TAB 2: DATASETS & POSTGIS                                  */}
        {/* ==================================================================== */}
        {activeTab === "datasets" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-5">
            <div>
              <h3 className="text-base font-black text-[#111814] dark:text-white tracking-tight">
                PostGIS Spatial Cadastre &amp; Field Telemetry Tables
              </h3>
              <p className="text-xs text-[#608570] dark:text-zinc-400">
                Spatial geometry columns verified via ST_Geometry for smallholder farm boundaries
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#f4f8f5] dark:bg-zinc-900 border space-y-2">
                <div className="font-bold text-xs text-[#214e34] dark:text-emerald-400">fields (PostGIS)</div>
                <div className="text-[11px] text-[#608570] space-y-1">
                  <div>• geometry (Polygon, 4326)</div>
                  <div>• farm_id (Foreign Key)</div>
                  <div>• zone_label (Zone A, B, C)</div>
                </div>
                <div className="text-xs font-black text-emerald-700">4,820 Polygons Active</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#f4f8f5] dark:bg-zinc-900 border space-y-2">
                <div className="font-bold text-xs text-[#214e34] dark:text-emerald-400">satellite_observations</div>
                <div className="text-[11px] text-[#608570] space-y-1">
                  <div>• sentinel2_ndvi (Float)</div>
                  <div>• cloud_cover_pct (Float)</div>
                  <div>• acquired_at (Timestamp)</div>
                </div>
                <div className="text-xs font-black text-emerald-700">Daily Sentinel-2 Sync</div>
              </div>

              <div className="p-4 rounded-2xl bg-[#f4f8f5] dark:bg-zinc-900 border space-y-2">
                <div className="font-bold text-xs text-[#214e34] dark:text-emerald-400">adoption_barriers</div>
                <div className="text-[11px] text-[#608570] space-y-1">
                  <div>• category (Stockout / Labor / Cost)</div>
                  <div>• reported_at (Timestamp)</div>
                  <div>• resolution_status (Text)</div>
                </div>
                <div className="text-xs font-black text-amber-700">2,850 Barriers Tracked</div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* WORKSPACE TAB 3: MODEL GUARDRAILS                                    */}
        {/* ==================================================================== */}
        {activeTab === "guardrails" && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-black text-[#111814] dark:text-white tracking-tight">
                AI Guardrails &amp; Human-in-the-Loop Escalation Rules
              </h3>
              <p className="text-xs text-[#608570] dark:text-zinc-400">
                Calibrate thresholds where autonomous AI advisory must yield to human agronomist review
              </p>
            </div>

            <div className="max-w-xl space-y-5">
              <div className="p-4 bg-[#f4f8f5] dark:bg-zinc-900 rounded-2xl border space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span>Autonomous Execution Confidence Threshold</span>
                  <span className="text-[#214e34] dark:text-emerald-400 font-mono text-base">
                    {confidenceThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="95"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-[#214e34]"
                />
                <p className="text-[11px] text-[#608570] leading-tight">
                  Any AI vision diagnosis with confidence score below <strong>{confidenceThreshold}%</strong> is automatically diverted to the <strong>Expert Triage Portal</strong> (KVK Ranchi) for mandatory agronomist sign-off.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#111814] dark:text-white block">
                  Primary Agronomic Foundation Model
                </label>
                <select
                  value={modelProvider}
                  onChange={(e) => setModelProvider(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border bg-white dark:bg-zinc-900 text-xs font-bold text-[#111814] dark:text-white"
                >
                  <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Primary RAG Engine)</option>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Pathology Reasoning)</option>
                  <option value="local-mistral">Local Offline Mistral 7B (Edge Node Fallback)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => triggerToast("Guardrails Updated", `Threshold saved at ${confidenceThreshold}%.`, "save")}
                className="px-5 py-2.5 bg-[#214e34] hover:bg-[#163624] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Save Guardrail Configurations
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* WORKSPACE TAB 4: TELEMETRY & LOGS + SYSTEM RESET                     */}
        {/* ==================================================================== */}
        {activeTab === "simulator" && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-[#18221B] border border-[#e2ebe4] dark:border-white/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-[#111814] dark:text-white tracking-tight">
                    Real-Time Microservices Event Ledger
                  </h3>
                  <p className="text-xs text-[#608570] dark:text-zinc-400">
                    Live stream from Inngest background jobs, Qdrant vectors, and radar weather updates
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <AppIcon name="restart_alt" className="w-4 h-4" />
                  <span>Reset All Demo State</span>
                </button>
              </div>

              <div className="bg-[#111814] text-emerald-400 p-4 rounded-2xl font-mono text-xs space-y-2 max-h-72 overflow-y-auto">
                <div>[10:14:02 UTC] [INNGEST] job:daily-radar-scan status:COMPLETED plots:4820</div>
                <div>[10:14:08 UTC] [QDRANT] collection:icar_guidelines search:1536dim query:"leaf blast fungicide" latency:8ms</div>
                <div>[10:14:15 UTC] [POSTGIS] query:ST_Contains(zone_b, point) farmer:Ravi_Kumar match:TRUE</div>
                <div>[10:14:22 UTC] [FEASIBILITY] gate:weather_window rainfall_48h:42mm status:ALERT_HOLDOFF</div>
                <div>[10:14:30 UTC] [EXPERT_TRIAGE] case:KL-024 escalated confidence:68% target:dr.patel</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: CLUSTER TOPOLOGY ARCHITECTURE                               */}
      {/* ==================================================================== */}
      {showClusterModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#18221B] rounded-3xl max-w-md w-full p-4 sm:p-6 border border-[#d2ded5] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-[#214e34] dark:text-emerald-400">
                Ranchi Cluster Architecture (v2.5)
              </span>
              <button
                type="button"
                onClick={() => setShowClusterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <AppIcon name="close" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-[#608570] dark:text-zinc-300 leading-relaxed">
              <div className="p-3 bg-[#ebf7eb] dark:bg-zinc-900 rounded-xl border space-y-1">
                <div className="font-bold text-[#214e34] dark:text-emerald-400">Primary Database:</div>
                <div>Neon Serverless PostgreSQL with PostGIS extension (US East / AWS)</div>
              </div>
              <div className="p-3 bg-[#ebf7eb] dark:bg-zinc-900 rounded-xl border space-y-1">
                <div className="font-bold text-[#214e34] dark:text-emerald-400">Vector Engine:</div>
                <div>Qdrant Cloud (Managed Vector Cluster, 1536-dim Cosine distance)</div>
              </div>
              <div className="p-3 bg-[#ebf7eb] dark:bg-zinc-900 rounded-xl border space-y-1">
                <div className="font-bold text-[#214e34] dark:text-emerald-400">Distributed Cache:</div>
                <div>Upstash Redis REST interface (Session tokens &amp; telemetry caching)</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowClusterModal(false)}
                className="px-4 py-2 bg-[#214e34] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: RESET DEMO STATE CONFIRMATION                               */}
      {/* ==================================================================== */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#18221B] rounded-3xl max-w-sm w-full p-4 sm:p-6 border border-red-200 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-red-600 font-bold text-base">
              <AppIcon name="warning" className="w-5 h-5 text-red-600" />
              <span>Reset Demo State?</span>
            </div>

            <p className="text-xs text-[#608570] dark:text-zinc-300 leading-relaxed">
              This will restore all action ledgers, barrier observations, and expert cases back to the clean demonstration baseline for <strong>Ravi Kumar</strong> (Namkum, Ranchi).
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleResetDemoState}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
              >
                {resetting ? "Resetting..." : "Yes, Reset Everything"}
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
          name: adminName,
          role: userRole,
          designation: adminDesignation,
          department: adminDepartment,
        }}
        onSaved={(data) => {
          if (data?.user?.name) setAdminName(data.user.name);
          if (data?.user?.role) setUserRole(data.user.role);
          if (data?.user?.designation) setAdminDesignation(data.user.designation);
        }}
      />
    </div>
  );
}
