"use client";

import { useClerk } from "@clerk/nextjs";

export function useAppLogout() {
  const clerk = useClerk();

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.warn("Backend logout cookie clear warning:", err);
    }

    try {
      // Clear client storage
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.removeItem("kisanloop_active_role");
      }
    } catch {}

    try {
      if (clerk && typeof clerk.signOut === "function") {
        await clerk.signOut({ redirectUrl: "/login" });
        return;
      }
    } catch (clerkErr) {
      console.warn("Clerk signOut error:", clerkErr);
    }

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return { logout };
}
