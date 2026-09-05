"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  FolderOpen,
  Globe2,
  ShieldAlert,
} from "lucide-react";
import { useLanguage } from "../shared/LanguageContext";
import { UserNav } from "../shared/UserNav";

export function AdminPortal() {
  const { language, setLanguage } = useLanguage();
  const [documents, setDocuments] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"knowledge" | "datasets">("knowledge");

  // Document upload state
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docUploadSuccess, setDocUploadSuccess] = useState<string | null>(null);

  // Dataset mapping state
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [datasetPreview, setDatasetPreview] = useState<any>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({
    name: "",
    latitude: "",
    longitude: "",
    crop_name: "",
    area_acres: "",
    irrigation_type: "",
  });
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const fetchLists = async () => {
    try {
      const [kRes, dRes] = await Promise.all([
        fetch("/api/knowledge").then((r) => r.json()),
        fetch("/api/datasets").then((r) => r.json()),
      ]);
      if (kRes.success) setDocuments(kRes.data);
      if (dRes.success) setDatasets(dRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setDocUploadSuccess(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/knowledge/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setDocUploadSuccess(
          `Document '${json.data.filename}' successfully parsed, chunked (${json.data.chunkCount} chunks) and indexed in Qdrant Vector Store!`
        );
        fetchLists();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDatasetInspect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDatasetFile(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/datasets/inspect", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setDatasetPreview(json.data);
        const autoMap: Record<string, string> = { ...mapping };
        json.data.headers.forEach((h: string) => {
          const lower = h.toLowerCase();
          if (lower.includes("name") || lower.includes("farmer")) autoMap["name"] = h;
          if (lower.includes("lat")) autoMap["latitude"] = h;
          if (lower.includes("lon") || lower.includes("lng")) autoMap["longitude"] = h;
          if (lower.includes("crop")) autoMap["crop_name"] = h;
          if (lower.includes("area") || lower.includes("acre")) autoMap["area_acres"] = h;
          if (lower.includes("irrig")) autoMap["irrigation_type"] = h;
        });
        setMapping(autoMap);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDatasetImport = async () => {
    if (!datasetFile || !datasetPreview) return;
    setImporting(true);
    try {
      const res = await fetch("/api/datasets/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: datasetFile.name.replace(/\.[^/.]+$/, ""),
          filename: datasetFile.name,
          rowCount: datasetPreview.totalRows,
          mapping,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setImportSuccess(
          `Dataset '${datasetFile.name}' with ${datasetPreview.totalRows} rows imported successfully!`
        );
        setDatasetFile(null);
        setDatasetPreview(null);
        fetchLists();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  const handleResetDemoData = async () => {
    if (confirm("Reset demo database to fresh initial state (Hero Farmer Ravi Kumar)?")) {
      try {
        const res = await fetch("/api/admin/reset-demo", { method: "POST" });
        if (res.ok) {
          alert("Demo database successfully reset!");
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Admin Dedicated Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-card border-r border-border h-screen sticky top-0 shrink-0 select-none">
        {/* Brand */}
        <div className="p-6 border-b flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-zinc-900 flex items-center justify-center text-white shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-foreground flex items-center gap-1.5">
              <span>Kisan</span>
              <span className="text-zinc-600 dark:text-zinc-400">DATA</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold tracking-wide">
              Knowledge & Datasets Engine
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-1.5 flex-1 overflow-y-auto text-xs">
          <div className="px-3 py-2 font-bold uppercase tracking-wider text-muted-foreground">
            Ingestion Controls
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("knowledge")}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${
              activeTab === "knowledge"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Research Docs (RAG)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("datasets")}
            className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${
              activeTab === "datasets"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Dataset Ingestion</span>
          </button>

          <div className="pt-4 border-t mt-4">
            <button
              type="button"
              onClick={handleResetDemoData}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {/* Admin Profile Badge */}
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
                    ? "bg-foreground text-background shadow-xs"
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
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground"
                }`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Admin Profile Badge & Sign Out */}
          <UserNav accentColor="zinc" />
        </div>
      </aside>

      {/* Mobile Header for Admin */}
      <header className="md:hidden sticky top-0 z-40 bg-card/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-white shadow-sm">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-foreground">
              Kisan<span className="text-zinc-500">DATA</span>
            </span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">
              Knowledge & Datasets
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetDemoData}
          className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-200"
        >
          Reset Demo
        </button>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Tab A: Knowledge Documents (RAG) */}
        {activeTab === "knowledge" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Upload Agronomic Practice Guidelines or Research</span>
              </h3>

              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOCX, TXT, CSV. Uploaded documents are parsed, chunked, and embedded into Qdrant vector storage to ground all farmer advisories.
              </p>

              <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl p-8 text-center bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
                <FolderOpen className="w-10 h-10 text-emerald-600 mx-auto" />
                <div>
                  <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2 transition">
                    <Upload className="w-4 h-4" />
                    <span>Choose Research Document</span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.csv"
                      className="hidden"
                      onChange={handleDocumentUpload}
                      disabled={uploadingDoc}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Automatic unpdf / mammoth / xlsx parsing & vector generation
                </p>
              </div>

              {uploadingDoc && (
                <div className="p-3 rounded-xl bg-muted text-center text-xs text-muted-foreground animate-pulse">
                  Parsing, chunking, and embedding document into vector store...
                </div>
              )}

              {docUploadSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{docUploadSuccess}</span>
                </div>
              )}
            </div>

            {/* Document Table */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground">
                Active Knowledge Documents in Qdrant Vector Index
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Title & Filename</th>
                      <th className="p-3">Format</th>
                      <th className="p-3">Vector Chunks</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {documents.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/20">
                        <td className="p-3">
                          <div className="font-bold text-foreground">{doc.title}</div>
                          <div className="text-[11px] text-muted-foreground">{doc.filename}</div>
                        </td>
                        <td className="p-3 font-semibold">{doc.fileType}</td>
                        <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">
                          {doc.chunkCount} Chunks
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {(doc.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 font-bold text-[10px]">
                            {doc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab B: Datasets Ingestion & Mapping */}
        {activeTab === "datasets" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span>Import Survey / Cadastral Dataset (CSV, XLSX, JSON)</span>
              </h3>

              <p className="text-xs text-muted-foreground">
                Supports flexible column headers from external government or survey systems without requiring rigid schemas.
              </p>

              {!datasetPreview ? (
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/20 space-y-3">
                  <Database className="w-10 h-10 text-muted-foreground mx-auto" />
                  <div>
                    <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md inline-flex items-center gap-2 transition">
                      <Upload className="w-4 h-4" />
                      <span>Choose CSV or XLSX Dataset</span>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls,.json"
                        className="hidden"
                        onChange={handleDatasetInspect}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Inspects headers and previews records before database import
                  </p>
                </div>
              ) : (
                <div className="space-y-4 border rounded-xl p-5 bg-muted/10">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        Map Columns for: {datasetFile?.name}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        Found {datasetPreview.totalRows} rows and {datasetPreview.headers.length} columns
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDatasetPreview(null);
                        setDatasetFile(null);
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Reset File
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    {[
                      { key: "name", label: "Farmer / Plot Name *", req: true },
                      { key: "latitude", label: "Latitude *", req: true },
                      { key: "longitude", label: "Longitude *", req: true },
                      { key: "crop_name", label: "Crop Name", req: false },
                      { key: "area_acres", label: "Area (Acres)", req: false },
                      { key: "irrigation_type", label: "Irrigation Type", req: false },
                    ].map((field) => (
                      <div key={field.key} className="space-y-1">
                        <label className="font-bold text-muted-foreground">
                          {field.label}
                        </label>
                        <select
                          value={mapping[field.key] || ""}
                          onChange={(e) =>
                            setMapping({ ...mapping, [field.key]: e.target.value })
                          }
                          className="w-full p-2 rounded-lg border bg-background text-foreground text-xs outline-none"
                        >
                          <option value="">-- Select Column --</option>
                          {datasetPreview.headers.map((h: string) => (
                            <option key={h} value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleDatasetImport}
                      disabled={importing || !mapping.name || !mapping.latitude || !mapping.longitude}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{importing ? "Importing Data..." : "Validate & Import Dataset"}</span>
                    </button>
                  </div>
                </div>
              )}

              {importSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}
            </div>

            {/* Imported Datasets Table */}
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm space-y-4">
              <h3 className="font-bold text-base text-foreground">
                Imported Datasets in System
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Dataset Name</th>
                      <th className="p-3">File Type</th>
                      <th className="p-3">Record Count</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {datasets.map((d) => (
                      <tr key={d.id} className="hover:bg-muted/20">
                        <td className="p-3">
                          <div className="font-bold text-foreground">{d.name}</div>
                          <div className="text-[11px] text-muted-foreground">{d.filename}</div>
                        </td>
                        <td className="p-3 font-semibold">{d.fileType}</td>
                        <td className="p-3 font-bold text-emerald-700 dark:text-emerald-400">
                          {d.rowCount} Rows
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 font-bold text-[10px]">
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
