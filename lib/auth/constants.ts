export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "FARMER" | "EXPERT" | "GOVT" | "ADMIN";
  preferredLanguage: string;
  district?: string;
  farmId?: string;
  avatar?: string;
}

export const TEST_USERS: AuthUser[] = [
  {
    id: "usr_farmer_ravi",
    name: "Ravi Kumar (रवि कुमार)",
    email: "ravi.kumar@kisanloop.org",
    role: "FARMER",
    preferredLanguage: "hi",
    district: "Ranchi, Jharkhand",
    farmId: "farm_ravi_01",
    avatar: "icon:sprout",
  },
  {
    id: "usr_expert_patel",
    name: "Dr. K. Patel (Agronomist)",
    email: "dr.patel@kvk-ranchi.org",
    role: "EXPERT",
    preferredLanguage: "en",
    district: "KVK Ranchi",
    avatar: "icon:microscope",
  },
  {
    id: "usr_govt_officer",
    name: "Ramesh Kumar (DAO)",
    email: "dao.ranchi@jharkhand.gov.in",
    role: "GOVT",
    preferredLanguage: "en",
    district: "Ranchi Agriculture Dept",
    avatar: "icon:landmark",
  },
  {
    id: "usr_admin_master",
    name: "System Administrator",
    email: "admin@kisanloop.org",
    role: "ADMIN",
    preferredLanguage: "en",
    district: "Headquarters",
    avatar: "icon:shield",
  },
];

export const AUTH_COOKIE_NAME = "kisanloop_session";

export function getDefaultRedirectForRole(role: string): string {
  switch (role) {
    case "FARMER":
      return "/";
    case "EXPERT":
      return "/expert";
    case "GOVT":
      return "/dashboard";
    case "ADMIN":
      return "/admin";
    default:
      return "/";
  }
}
