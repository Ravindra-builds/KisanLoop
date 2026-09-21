"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { AuthUser } from "@/lib/auth/constants";
import { useAppLogout } from "@/lib/auth/useAppLogout";

interface UserNavProps {
  accentColor?: "emerald" | "purple" | "blue" | "zinc";
}

export function UserNav({ accentColor = "emerald" }: UserNavProps) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const { logout: handleLogout } = useAppLogout();

  const getBadgeColors = () => {
    switch (accentColor) {
      case "purple":
        return "bg-purple-600 text-white";
      case "blue":
        return "bg-blue-600 text-white";
      case "zinc":
        return "bg-zinc-800 text-white";
      default:
        return "bg-emerald-600 text-white";
    }
  };

  const getContainerBg = () => {
    switch (accentColor) {
      case "purple":
        return "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/40";
      case "blue":
        return "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40";
      case "zinc":
        return "bg-muted/60 border-border";
      default:
        return "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40";
    }
  };

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 ${getContainerBg()}`}>
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center shrink-0 text-xs shadow-xs ${getBadgeColors()}`}>
          {initials}
        </div>
        <div className="overflow-hidden">
          <h4 className="font-extrabold text-xs text-foreground truncate">
            {user.name}
          </h4>
          <p className="text-[10px] text-muted-foreground truncate">
            {user.district || user.email}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        title="Sign Out / बाहर निकलें"
        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition shrink-0 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
