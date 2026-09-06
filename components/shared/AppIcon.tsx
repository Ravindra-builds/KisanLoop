import React from "react";
import {
  Home,
  MapPin,
  Map,
  CheckCircle2,
  Infinity as InfinityIcon,
  Headphones,
  Sprout,
  Mic,
  MicOff,
  Sun,
  Moon,
  Search,
  CheckCheck,
  Droplets,
  Bug,
  PlayCircle,
  UploadCloud,
  BookOpen,
  Network,
  Zap,
  FileText,
  Sliders,
  RotateCcw,
  LogOut,
  Brain,
  BadgeCheck,
  Clock,
  Timer,
  Coins,
  Crosshair,
  ShieldAlert,
  PhoneCall,
  Phone,
  PhoneOff,
  Volume2,
  CloudRain,
  FileSpreadsheet,
  Loader2,
  Send,
  AlertCircle,
  AlertTriangle,
  X,
  User,
  Camera,
  Languages,
  Square,
  RefreshCw,
  Info,
  Award,
  Eye,
  ClipboardCheck,
  CheckSquare,
  MessageSquare,
  Wrench,
  ArrowRight,
  HelpCircle,
  Calendar,
  IndianRupee,
  Layers,
  FileCode,
  Radio,
  Share2,
  Flame,
  Wheat,
  LayoutDashboard,
  GitFork,
  Ban,
  ShieldCheck,
  Package,
  Download,
  type LucideIcon,
} from "lucide-react";

interface AppIconProps {
  name: string;
  className?: string;
  size?: number | string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation & Core
  cottage: Home,
  home: Home,
  map: Map,
  pin_drop: MapPin,
  check_circle: CheckCircle2,
  all_inclusive: InfinityIcon,
  support_agent: Headphones,
  eco: Sprout,
  mic: Mic,
  mic_off: MicOff,
  stop: Square,
  wb_sunny: Sun,
  light_mode: Sun,
  dark_mode: Moon,
  search: Search,
  logout: LogOut,
  close: X,
  settings_suggest: Sliders,
  restart_alt: RotateCcw,
  sync: RefreshCw,
  refresh: RefreshCw,
  arrow_forward: ArrowRight,
  help_outline: HelpCircle,
  info: Info,
  warning: AlertTriangle,
  crisis_alert: AlertCircle,
  verified: BadgeCheck,
  translate: Languages,

  // Farm Actions & Inspections
  pest_control: Bug,
  water_drop: Droplets,
  done_all: CheckCheck,
  play_circle: PlayCircle,
  calendar_today: Calendar,
  schedule: Clock,
  currency_rupee: IndianRupee,
  person: User,
  account_circle: User,
  call: Phone,
  call_end: PhoneOff,
  photo_camera: Camera,
  add_a_photo: Camera,
  visibility: Eye,
  volume_up: Volume2,
  wheat: Wheat,

  // Admin & Microservices
  upload_file: UploadCloud,
  library_books: BookOpen,
  hub: Network,
  bolt: Zap,
  description: FileText,
  layers: Layers,
  code: FileCode,
  broadcast: Radio,
  share: Share2,
  fire: Flame,

  // Expert Console
  psychology: Brain,
  hourglass_top: Clock,
  timer: Timer,
  savings: Coins,
  filter_center_focus: Crosshair,
  coronavirus: ShieldAlert,
  contact_phone: PhoneCall,
  rainy: CloudRain,
  prescriptions: FileSpreadsheet,
  send: Send,
  badge: Award,
  assignment_turned_in: ClipboardCheck,
  fact_check: CheckSquare,
  sms: MessageSquare,
  troubleshoot: Wrench,

  // Government Dashboard
  dashboard: LayoutDashboard,
  conversion_path: GitFork,
  block: Ban,
  verified_user: ShieldCheck,
  tune: Sliders,
  picture_as_pdf: FileText,
  report_problem: AlertTriangle,
  inventory: Package,
  download: Download,
};

export const AppIcon: React.FC<AppIconProps> = ({ name, className = "w-5 h-5", size }) => {
  const cleanName = (name || "").trim().toLowerCase();

  // Progress / Spinner special case
  if (cleanName === "progress_activity" || cleanName === "loading" || cleanName === "spinner") {
    return <Loader2 className={`animate-spin ${className}`} size={size} />;
  }

  const Component = ICON_MAP[cleanName];

  if (Component) {
    return <Component className={className} size={size} />;
  }

  // Fallback: Return Sprout for agricultural theme
  return <Sprout className={className} size={size} />;
};

export default AppIcon;
