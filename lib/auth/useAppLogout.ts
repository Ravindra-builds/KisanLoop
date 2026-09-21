"use client";

import { useClerk } from "@clerk/nextjs";

export function useAppLogout() {
  let clerk: any = null;
  try {
    clerk = useClerk();
  } catch {}

  const logout = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // 1. Immediately wipe client-side cookies
    try {
      if (typeof document !== "undefined") {
        document.cookie = "kisanloop_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
        document.cookie = "kisanloop_selected_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
        document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0";
      }
    } catch {}

    // 2. Clear browser storage
    try {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.clear();
      }
    } catch {}

    // 3. Fire-and-forget backend cookie cleanup
    try {
      fetch("/api/auth/logout", {
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    } catch {}

    // 4. Fire-and-forget Clerk signout if present
    try {
      if (clerk && typeof clerk.signOut === "function") {
        clerk.signOut().catch(() => {});
      }
    } catch {}

    // 5. Immediate hard redirect to /login
    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  };

  return { logout };
}
