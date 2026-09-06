"use client";

import React, { useState, useEffect } from "react";
import AppIcon from "@/components/shared/AppIcon";

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    name?: string;
    role?: "FARMER" | "EXPERT" | "GOVT" | "ADMIN";
    phone?: string;
    state?: string;
    district?: string;
    village?: string;
    farmName?: string;
    acres?: number | string;
    irrigationType?: string;
    soilType?: string;
    designation?: string;
    department?: string;
  };
  onSaved?: (updatedData: any) => void;
}

export function ProfileSetupModal({
  isOpen,
  onClose,
  initialData,
  onSaved,
}: ProfileSetupModalProps) {
  const [selectedRole, setSelectedRole] = useState<"FARMER" | "EXPERT" | "GOVT" | "ADMIN">("FARMER");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Jharkhand");
  const [district, setDistrict] = useState("Ranchi");
  const [village, setVillage] = useState("Namkum");

  // Farmer specific
  const [farmName, setFarmName] = useState("");
  const [acres, setAcres] = useState("1.5");
  const [irrigationType, setIrrigationType] = useState("Rainfed");
  const [soilType, setSoilType] = useState("Loamy");

  // Expert / Govt specific
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (initialData) {
      if (initialData.role) setSelectedRole(initialData.role);
      if (initialData.name && initialData.name !== "Farmer") setName(initialData.name);
      if (initialData.phone) setPhone(initialData.phone);
      if (initialData.state) setState(initialData.state);
      if (initialData.district) setDistrict(initialData.district);
      if (initialData.village) setVillage(initialData.village);
      if (initialData.farmName) setFarmName(initialData.farmName);
      if (initialData.acres) setAcres(String(initialData.acres));
      if (initialData.irrigationType) setIrrigationType(initialData.irrigationType);
      if (initialData.soilType) setSoilType(initialData.soilType);
      if (initialData.designation) setDesignation(initialData.designation);
      if (initialData.department) setDepartment(initialData.department);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }

    setSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRole,
          name: name.trim(),
          phone: phone.trim(),
          state: state.trim(),
          district: district.trim(),
          village: village.trim(),
          farmName: farmName.trim() || `${name.trim()}'s Farm`,
          acres: parseFloat(acres) || 1.5,
          irrigationType,
          soilType,
          designation: designation.trim(),
          department: department.trim(),
        }),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to save profile");
      }

      if (onSaved) {
        onSaved(json.data);
      }

      onClose();

      // If user switched role, route to their role dashboard
      const currentPath = window.location.pathname;
      const roleHomeMap = {
        FARMER: "/",
        EXPERT: "/expert",
        GOVT: "/dashboard",
        ADMIN: "/admin",
      };
      const targetHome = roleHomeMap[selectedRole];
      if (targetHome && currentPath !== targetHome) {
        window.location.href = targetHome;
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  };

  const ROLES = [
    {
      id: "FARMER" as const,
      title: "Farmer (किसान)",
      icon: "agriculture",
      desc: "Plot-level advisories, feasibility checks, action verification",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      activeBorder: "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30",
    },
    {
      id: "EXPERT" as const,
      title: "Agronomist (कृषि वैज्ञानिक)",
      icon: "science",
      desc: "Review triage queue, calibrate prescriptions, blast surveillance",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      activeBorder: "border-amber-600 bg-amber-50/50 dark:bg-amber-950/30",
    },
    {
      id: "GOVT" as const,
      title: "Government (कृषि विभाग)",
      icon: "account_balance",
      desc: "District intelligence, AAR rate analytics, outbreak GIS radar",
      badgeColor: "bg-sky-100 text-sky-800 border-sky-300",
      activeBorder: "border-sky-600 bg-sky-50/50 dark:bg-sky-950/30",
    },
    {
      id: "ADMIN" as const,
      title: "Admin (सिस्टम प्रशासक)",
      icon: "settings_suggest",
      desc: "RAG knowledge base, Qdrant vectors, system telemetry",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      activeBorder: "border-purple-600 bg-purple-50/50 dark:bg-purple-950/30",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18221B] rounded-3xl border border-[#d2ded5] dark:border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between border-b border-[#e2ebe4] dark:border-white/10 pb-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#1b4332] dark:text-emerald-400">
              Identity &amp; Role Configuration / प्रोफ़ाइल सेटअप
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#111814] dark:text-white mt-1">
              Complete Your KisanLoop Profile
            </h2>
            <p className="text-xs text-[#608570] dark:text-zinc-400 mt-1">
              Choose your role and enter plot/institutional data for personalized intelligence.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <AppIcon name="close" className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selector Cards */}
          <div>
            <label className="block text-xs font-bold text-[#141e17] dark:text-white mb-2">
              Select Your Role in the Platform (अपनी भूमिका चुनें)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                    selectedRole === r.id
                      ? r.activeBorder
                      : "border-[#e2ebe4] dark:border-white/10 hover:border-slate-300 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#ebf7eb] dark:bg-emerald-950/50 text-[#1b4332] dark:text-emerald-400 shrink-0">
                    <AppIcon name={r.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-[#141e17] dark:text-white">{r.title}</div>
                    <div className="text-[11px] text-[#608570] dark:text-zinc-400 mt-0.5 leading-tight">{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Details */}
          <div className="space-y-4 pt-2 border-t border-[#e2ebe4] dark:border-white/10">
            <h4 className="text-xs font-bold text-[#141e17] dark:text-white uppercase tracking-wider">
              Personal Information (व्यक्तिगत विवरण)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-sm font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Phone Number (मोबाइल नंबर) {selectedRole === "FARMER" ? "*" : ""}
                </label>
                <input
                  type="tel"
                  required={selectedRole === "FARMER"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98321 44520"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-sm font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  State (राज्य)
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-sm font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  District (जिला)
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-sm font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Role-Specific Fields */}
          {selectedRole === "FARMER" && (
            <div className="space-y-4 pt-2 border-t border-[#e2ebe4] dark:border-white/10">
              <h4 className="text-xs font-bold text-[#141e17] dark:text-white uppercase tracking-wider">
                Farm &amp; Cadastral Land Configuration (खेत विवरण)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Village / Panchayat (गाँव / पंचायत)
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Namkum"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-sm font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Farm Name (खेत का नाम)
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. Namkum Field Parcel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-sm font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Total Land Holding (एकड़ में)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={acres}
                    onChange={(e) => setAcres(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-sm font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Irrigation Source (सिंचाई का साधन)
                  </label>
                  <select
                    value={irrigationType}
                    onChange={(e) => setIrrigationType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-sm font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
                  >
                    <option value="Rainfed">Rainfed (वर्षा आधारित)</option>
                    <option value="Borewell">Borewell (नलकूप / बोरवेल)</option>
                    <option value="Canal">Canal (नहर / नाला)</option>
                    <option value="Drip">Drip / Micro-Irrigation (टपक सिंचाई)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {(selectedRole === "EXPERT" || selectedRole === "GOVT" || selectedRole === "ADMIN") && (
            <div className="space-y-4 pt-2 border-t border-[#e2ebe4] dark:border-white/10">
              <h4 className="text-xs font-bold text-[#141e17] dark:text-white uppercase tracking-wider">
                Institutional Details (संस्थान व पद विवरण)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Designation / Title (पदनाम)
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder={
                      selectedRole === "EXPERT"
                        ? "e.g. Senior Agronomist / Plant Pathologist"
                        : "e.g. District Agriculture Officer"
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-sm font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Department / Institution (विभाग / संस्थान)
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder={
                      selectedRole === "EXPERT"
                        ? "e.g. KVK Ranchi / BAU Kanke"
                        : "e.g. Directorate of Agriculture, Jharkhand"
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-sm font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2ebe4] dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving to Neon DB...</span>
                </>
              ) : (
                <>
                  <AppIcon name="check" className="w-4 h-4" />
                  <span>Save &amp; Enter {selectedRole === "FARMER" ? "Farmer Portal" : selectedRole === "EXPERT" ? "Expert Console" : selectedRole === "GOVT" ? "Govt Dashboard" : "Admin Panel"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

