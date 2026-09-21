"use client";

import React, { useState } from "react";
import {
  Sprout,
  Wheat,
  Tractor,
  Shovel,
  Trees,
  SunMedium,
  CloudRain,
  UserCheck,
  Microscope,
  FlaskConical,
  Stethoscope,
  BrainCircuit,
  GraduationCap,
  FileCheck2,
  Activity,
  Landmark,
  ShieldCheck,
  Award,
  Building2,
  Briefcase,
  FileBadge,
  Radar,
  SlidersHorizontal,
  Database,
  Terminal,
  Cpu,
  Shield,
  Workflow,
  Sparkles,
  Camera,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";

export type RoleType = "FARMER" | "EXPERT" | "GOVT" | "ADMIN";

export interface IconPreset {
  id: string;
  label: string;
  icon: LucideIcon;
  bgGradient: string;
  iconColor: string;
  borderColor: string;
}

export interface PhotoPreset {
  id: string;
  label: string;
  url: string;
}

export interface VectorPreset {
  id: string;
  label: string;
  url: string;
}

export const ROLE_ICON_PRESETS: Record<RoleType, IconPreset[]> = {
  FARMER: [
    {
      id: "icon:sprout",
      label: "Green Sprout (अंकुर)",
      icon: Sprout,
      bgGradient: "from-emerald-500 to-green-600",
      iconColor: "text-white",
      borderColor: "border-emerald-500",
    },
    {
      id: "icon:wheat",
      label: "Golden Wheat (गेहूँ/धान)",
      icon: Wheat,
      bgGradient: "from-amber-500 to-yellow-600",
      iconColor: "text-white",
      borderColor: "border-amber-500",
    },
    {
      id: "icon:tractor",
      label: "Tractor (ट्रैक्टर)",
      icon: Tractor,
      bgGradient: "from-blue-500 to-sky-600",
      iconColor: "text-white",
      borderColor: "border-blue-500",
    },
    {
      id: "icon:shovel",
      label: "Field Cultivator (जुताई)",
      icon: Shovel,
      bgGradient: "from-lime-600 to-emerald-700",
      iconColor: "text-white",
      borderColor: "border-lime-600",
    },
    {
      id: "icon:trees",
      label: "Agroforestry (बागवानी)",
      icon: Trees,
      bgGradient: "from-teal-600 to-emerald-800",
      iconColor: "text-white",
      borderColor: "border-teal-600",
    },
    {
      id: "icon:sun",
      label: "Kharif Sun (धूप/सौर)",
      icon: SunMedium,
      bgGradient: "from-orange-500 to-amber-600",
      iconColor: "text-white",
      borderColor: "border-orange-500",
    },
    {
      id: "icon:rain",
      label: "Monsoon Rain (वर्षा)",
      icon: CloudRain,
      bgGradient: "from-cyan-600 to-blue-700",
      iconColor: "text-white",
      borderColor: "border-cyan-600",
    },
    {
      id: "icon:user-check",
      label: "Verified Kisan (प्रमाणित किसान)",
      icon: UserCheck,
      bgGradient: "from-emerald-600 to-teal-700",
      iconColor: "text-white",
      borderColor: "border-emerald-600",
    },
  ],
  EXPERT: [
    {
      id: "icon:microscope",
      label: "Microscope / Pathology",
      icon: Microscope,
      bgGradient: "from-indigo-600 to-violet-700",
      iconColor: "text-white",
      borderColor: "border-indigo-500",
    },
    {
      id: "icon:flask",
      label: "Soil & Nutrient Lab",
      icon: FlaskConical,
      bgGradient: "from-teal-500 to-emerald-700",
      iconColor: "text-white",
      borderColor: "border-teal-500",
    },
    {
      id: "icon:stethoscope",
      label: "Plant Clinic Doctor",
      icon: Stethoscope,
      bgGradient: "from-rose-500 to-pink-700",
      iconColor: "text-white",
      borderColor: "border-rose-500",
    },
    {
      id: "icon:brain",
      label: "Agronomy Intelligence AI",
      icon: BrainCircuit,
      bgGradient: "from-purple-600 to-indigo-800",
      iconColor: "text-white",
      borderColor: "border-purple-500",
    },
    {
      id: "icon:grad",
      label: "ICAR Scientist / Ph.D.",
      icon: GraduationCap,
      bgGradient: "from-amber-600 to-orange-700",
      iconColor: "text-white",
      borderColor: "border-amber-500",
    },
    {
      id: "icon:file-check",
      label: "Prescription Validator",
      icon: FileCheck2,
      bgGradient: "from-blue-600 to-cyan-700",
      iconColor: "text-white",
      borderColor: "border-blue-500",
    },
    {
      id: "icon:activity",
      label: "Blast Surveillance",
      icon: Activity,
      bgGradient: "from-emerald-600 to-cyan-700",
      iconColor: "text-white",
      borderColor: "border-emerald-500",
    },
  ],
  GOVT: [
    {
      id: "icon:landmark",
      label: "Directorate / Ministry",
      icon: Landmark,
      bgGradient: "from-sky-600 to-blue-800",
      iconColor: "text-white",
      borderColor: "border-sky-500",
    },
    {
      id: "icon:shield-check",
      label: "State Enforcement",
      icon: ShieldCheck,
      bgGradient: "from-emerald-600 to-teal-800",
      iconColor: "text-white",
      borderColor: "border-emerald-500",
    },
    {
      id: "icon:award",
      label: "Gazette Agriculture Officer",
      icon: Award,
      bgGradient: "from-amber-500 to-yellow-700",
      iconColor: "text-white",
      borderColor: "border-amber-500",
    },
    {
      id: "icon:building",
      label: "District Collectorate",
      icon: Building2,
      bgGradient: "from-cyan-600 to-slate-800",
      iconColor: "text-white",
      borderColor: "border-cyan-500",
    },
    {
      id: "icon:briefcase",
      label: "Department Secretary",
      icon: Briefcase,
      bgGradient: "from-indigo-600 to-blue-900",
      iconColor: "text-white",
      borderColor: "border-indigo-500",
    },
    {
      id: "icon:file-badge",
      label: "PM-KISAN DBT Disbursal",
      icon: FileBadge,
      bgGradient: "from-green-600 to-emerald-800",
      iconColor: "text-white",
      borderColor: "border-green-500",
    },
    {
      id: "icon:radar",
      label: "District GIS Radar",
      icon: Radar,
      bgGradient: "from-purple-600 to-sky-800",
      iconColor: "text-white",
      borderColor: "border-purple-500",
    },
  ],
  ADMIN: [
    {
      id: "icon:shield",
      label: "System Security & Auth",
      icon: Shield,
      bgGradient: "from-purple-600 to-indigo-800",
      iconColor: "text-white",
      borderColor: "border-purple-500",
    },
    {
      id: "icon:sliders",
      label: "Telemetry & Config",
      icon: SlidersHorizontal,
      bgGradient: "from-violet-600 to-purple-800",
      iconColor: "text-white",
      borderColor: "border-violet-500",
    },
    {
      id: "icon:database",
      label: "Neon DB & Qdrant",
      icon: Database,
      bgGradient: "from-blue-600 to-indigo-800",
      iconColor: "text-white",
      borderColor: "border-blue-500",
    },
    {
      id: "icon:terminal",
      label: "DevOps & CLI",
      icon: Terminal,
      bgGradient: "from-emerald-600 to-teal-800",
      iconColor: "text-white",
      borderColor: "border-emerald-500",
    },
    {
      id: "icon:cpu",
      label: "Gemini AI Engine",
      icon: Cpu,
      bgGradient: "from-rose-600 to-amber-700",
      iconColor: "text-white",
      borderColor: "border-rose-500",
    },
    {
      id: "icon:workflow",
      label: "Inngest Event Pipelines",
      icon: Workflow,
      bgGradient: "from-cyan-600 to-blue-800",
      iconColor: "text-white",
      borderColor: "border-cyan-500",
    },
  ],
};

export const ROLE_PHOTO_PRESETS: Record<RoleType, PhotoPreset[]> = {
  FARMER: [
    {
      id: "photo:farmer-turban",
      label: "Kisan Lead (Turban)",
      url: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "photo:farmer-field",
      label: "Field Farmer",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "photo:farmer-woman",
      label: "SHG Leader (Woman Farmer)",
      url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "photo:farmer-elder",
      label: "Village Veteran Kisan",
      url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    },
  ],
  EXPERT: [
    {
      id: "photo:expert-dr-patel",
      label: "Dr. K. Patel (Agronomist)",
      url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "photo:expert-pathologist",
      label: "Plant Pathologist",
      url: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "photo:expert-scientist-female",
      label: "ICAR Lead Scientist",
      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "photo:expert-researcher",
      label: "Field Researcher",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
  ],
  GOVT: [
    {
      id: "photo:govt-officer-male",
      label: "District Agriculture Officer",
      url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "photo:govt-director-female",
      label: "Director of Agriculture",
      url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "photo:govt-secretary",
      label: "State Agriculture Secretary",
      url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    },
  ],
  ADMIN: [
    {
      id: "photo:admin-lead",
      label: "System Lead Architect",
      url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "photo:admin-dev",
      label: "Cloud Engineer",
      url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80",
    },
  ],
};

export const ROLE_VECTOR_PRESETS: Record<RoleType, VectorPreset[]> = {
  FARMER: [
    {
      id: "vector:farmer-ramesh",
      label: "Kisan Avatar 1",
      url: "https://api.dicebear.com/7.x/bottts/svg?seed=RameshKumar&backgroundColor=10b981",
    },
    {
      id: "vector:farmer-sunita",
      label: "Kisan Avatar 2",
      url: "https://api.dicebear.com/7.x/adventurer/svg?seed=SunitaDevi&backgroundColor=f59e0b",
    },
    {
      id: "vector:farmer-birsa",
      label: "Kisan Avatar 3",
      url: "https://api.dicebear.com/7.x/adventurer/svg?seed=BirsaMunda&backgroundColor=3b82f6",
    },
  ],
  EXPERT: [
    {
      id: "vector:expert-dr",
      label: "Doctor Avatar 1",
      url: "https://api.dicebear.com/7.x/bottts/svg?seed=DrPatel&backgroundColor=6366f1",
    },
    {
      id: "vector:expert-sci",
      label: "Scientist Avatar 2",
      url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Agronomist&backgroundColor=14b8a6",
    },
  ],
  GOVT: [
    {
      id: "vector:govt-off",
      label: "Official Avatar 1",
      url: "https://api.dicebear.com/7.x/bottts/svg?seed=GovtOfficer&backgroundColor=0284c7",
    },
    {
      id: "vector:govt-dir",
      label: "Official Avatar 2",
      url: "https://api.dicebear.com/7.x/adventurer/svg?seed=DistrictOfficer&backgroundColor=059669",
    },
  ],
  ADMIN: [
    {
      id: "vector:admin-sys",
      label: "Admin Avatar 1",
      url: "https://api.dicebear.com/7.x/bottts/svg?seed=SysAdmin&backgroundColor=9333ea",
    },
    {
      id: "vector:admin-core",
      label: "Admin Avatar 2",
      url: "https://api.dicebear.com/7.x/bottts/svg?seed=KisanLoopDev&backgroundColor=2563eb",
    },
  ],
};

// Size helper map
const SIZE_MAP = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
  "2xl": "w-28 h-28 text-4xl",
};

const ICON_SIZE_MAP = {
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
  "2xl": "w-14 h-14",
};

interface ProfileAvatarProps {
  avatar?: string;
  role?: RoleType;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  onClick?: () => void;
  showBadge?: boolean;
}

export function ProfileAvatar({
  avatar,
  role = "FARMER",
  name = "User",
  size = "md",
  className = "",
  onClick,
  showBadge = false,
}: ProfileAvatarProps) {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const iconSizeClasses = ICON_SIZE_MAP[size] || ICON_SIZE_MAP.md;

  // 1. Check if avatar is an icon ID (e.g., "icon:sprout")
  if (avatar && avatar.startsWith("icon:")) {
    const allIcons = ROLE_ICON_PRESETS[role] || ROLE_ICON_PRESETS.FARMER;
    const matched = allIcons.find((item) => item.id === avatar) || allIcons[0];
    const IconComp = matched.icon;

    return (
      <div
        onClick={onClick}
        className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br ${matched.bgGradient} ${sizeClasses} ${className} ${
          onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""
        } shadow-xs shrink-0 select-none`}
        title={`${name} (${matched.label})`}
      >
        <IconComp className={`${iconSizeClasses} ${matched.iconColor}`} />
        {showBadge && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shadow-xs border-2 border-white dark:border-zinc-900">
            ✓
          </span>
        )}
      </div>
    );
  }

  // 2. Check if avatar is a direct photo/vector image URL
  const imageUrl =
    avatar && (avatar.startsWith("http") || avatar.startsWith("data:") || avatar.startsWith("/"))
      ? avatar
      : null;

  if (imageUrl) {
    return (
      <div
        onClick={onClick}
        className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${sizeClasses} ${className} ${
          onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""
        } shrink-0`}
        title={name}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to role icon
            const defaultIcons = ROLE_ICON_PRESETS[role] || ROLE_ICON_PRESETS.FARMER;
            (e.target as HTMLElement).style.display = "none";
          }}
        />
        {showBadge && (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shadow-xs border-2 border-white dark:border-zinc-900">
            ✓
          </span>
        )}
      </div>
    );
  }

  // 3. Fallback: Role default icon
  const defaultPresets = ROLE_ICON_PRESETS[role] || ROLE_ICON_PRESETS.FARMER;
  const defaultPreset = defaultPresets[0];
  const FallbackIcon = defaultPreset.icon;

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br ${defaultPreset.bgGradient} ${sizeClasses} ${className} ${
        onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""
      } shadow-xs shrink-0 select-none`}
      title={name}
    >
      <FallbackIcon className={`${iconSizeClasses} text-white`} />
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] shadow-xs border-2 border-white dark:border-zinc-900">
          ✓
        </span>
      )}
    </div>
  );
}

interface ProfileAvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  role?: RoleType;
  userName?: string;
  onSelectAvatar: (avatarValue: string) => void;
}

export function ProfileAvatarPickerModal({
  isOpen,
  onClose,
  currentAvatar = "icon:sprout",
  role = "FARMER",
  userName = "User",
  onSelectAvatar,
}: ProfileAvatarPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"icons" | "photos" | "vectors" | "custom">("icons");
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  const [customUrl, setCustomUrl] = useState<string>("");

  if (!isOpen) return null;

  const iconPresets = ROLE_ICON_PRESETS[role] || ROLE_ICON_PRESETS.FARMER;
  const photoPresets = ROLE_PHOTO_PRESETS[role] || ROLE_PHOTO_PRESETS.FARMER;
  const vectorPresets = ROLE_VECTOR_PRESETS[role] || ROLE_VECTOR_PRESETS.FARMER;

  const handleApply = () => {
    if (activeTab === "custom" && customUrl.trim()) {
      onSelectAvatar(customUrl.trim());
    } else {
      onSelectAvatar(selectedAvatar);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18221B] rounded-3xl border border-[#d2ded5] dark:border-white/10 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#e2ebe4] dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Avatar &amp; Icon Studio / प्रोफ़ाइल अवतार
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#111814] dark:text-white mt-1">
              Choose Profile Icon or Avatar
            </h3>
            <p className="text-xs text-[#608570] dark:text-zinc-400">
              Personalize your identity across KisanLoop advisories, prescriptions, and portals.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 rounded-2xl bg-[#f8faf8] dark:bg-zinc-900 border border-[#e2ebe4] dark:border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <ProfileAvatar
              avatar={activeTab === "custom" && customUrl.trim() ? customUrl.trim() : selectedAvatar}
              role={role}
              name={userName}
              size="xl"
              showBadge={true}
            />
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Current Preview
              </div>
              <div className="text-base font-extrabold text-[#111814] dark:text-white">{userName}</div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold capitalize">
                {role.toLowerCase()} Role Badge
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Live Styled
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e2ebe4] dark:border-white/10 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("icons")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "icons"
                ? "bg-[#1b4332] text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role Icons</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "photos"
                ? "bg-[#1b4332] text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Realistic Photos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vectors")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "vectors"
                ? "bg-[#1b4332] text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Illustrated SVGs</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "custom"
                ? "bg-[#1b4332] text-white shadow-xs"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <span>Custom URL</span>
          </button>
        </div>

        {/* Tab 1: Role Icons */}
        {activeTab === "icons" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Pick a themed icon badge tailored for {role.toLowerCase()} operations:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {iconPresets.map((preset) => {
                const IconComp = preset.icon;
                const isSelected = selectedAvatar === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.id)}
                    className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? "border-[#1b4332] bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-500 scale-102"
                        : "border-[#e2ebe4] dark:border-white/10 hover:border-slate-300 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${preset.bgGradient} flex items-center justify-center shadow-xs`}
                    >
                      <IconComp className={`w-6 h-6 ${preset.iconColor}`} />
                    </div>
                    <span className="text-[11px] font-bold text-[#111814] dark:text-white leading-tight">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Realistic Photo Presets */}
        {activeTab === "photos" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Choose an authentic portrait tailored for your agricultural role:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photoPresets.map((photo) => {
                const isSelected = selectedAvatar === photo.url;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedAvatar(photo.url)}
                    className={`p-2.5 rounded-2xl border-2 text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? "border-[#1b4332] bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-500 scale-102"
                        : "border-[#e2ebe4] dark:border-white/10 hover:border-slate-300 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-14 h-14 rounded-full object-cover border-2 border-emerald-600 shadow-xs"
                    />
                    <span className="text-[11px] font-bold text-[#111814] dark:text-white leading-tight">
                      {photo.label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Vector & Illustrated Avatars */}
        {activeTab === "vectors" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Select an illustrated vector avatar:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {vectorPresets.map((vec) => {
                const isSelected = selectedAvatar === vec.url;
                return (
                  <button
                    key={vec.id}
                    type="button"
                    onClick={() => setSelectedAvatar(vec.url)}
                    className={`p-3 rounded-2xl border-2 text-center flex flex-col items-center gap-2 transition cursor-pointer ${
                      isSelected
                        ? "border-[#1b4332] bg-emerald-50/50 dark:bg-emerald-950/30 dark:border-emerald-500 scale-102"
                        : "border-[#e2ebe4] dark:border-white/10 hover:border-slate-300 bg-white dark:bg-zinc-900"
                    }`}
                  >
                    <img
                      src={vec.url}
                      alt={vec.label}
                      className="w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-800 p-1 border border-slate-200 shadow-xs"
                    />
                    <span className="text-[11px] font-bold text-[#111814] dark:text-white leading-tight">
                      {vec.label}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Custom Image Link */}
        {activeTab === "custom" && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Paste any public image or portrait URL (Unsplash, Cloudinary, AWS S3, etc.):
            </div>
            <div className="space-y-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setSelectedAvatar(e.target.value);
                }}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#d2ded5] dark:border-white/10 bg-[#f8faf8] dark:bg-zinc-800 text-xs font-semibold text-[#111814] dark:text-white focus:outline-emerald-600"
              />
              <p className="text-[10px] text-slate-400">
                Tip: Direct HTTPS image links ending in jpg, png, webp, or SVG work best.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2ebe4] dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[#d2ded5] dark:border-white/10 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Selected Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
