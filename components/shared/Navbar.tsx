"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sprout,
  UserCheck,
  Building2,
  Database,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "./LanguageContext";

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();

  const handleResetDemo = async () => {
    if (confirm("Reset demo database to fresh initial state (Hero Farmer Ravi Kumar)?")) {
      try {
        const res = await fetch("/api/admin/reset-demo", { method: "POST" });
        if (res.ok) {
          window.location.reload();
        }
      } catch (err) {
        console.error("Reset failed:", err);
      }
    }
  };

  const navLinks = [
    { href: "/", label: t("farmer"), icon: Sprout },
    { href: "/expert", label: t("expert"), icon: UserCheck },
    { href: "/dashboard", label: t("government"), icon: Building2 },
    { href: "/admin", label: t("knowledge"), icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur shadow-xs">
      <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                Kisan<span className="text-emerald-600">LOOP</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              {t("tagline")}
            </p>
          </div>
        </Link>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-muted/70 rounded-lg p-1 border text-xs">
            <button
              type="button"
              onClick={() => setLanguage("hi")}
              className={`px-2 py-1 rounded font-medium transition ${
                language === "hi"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              हिन्दी
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2 py-1 rounded font-medium transition ${
                language === "en"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetDemo}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border bg-muted/40 hover:bg-muted px-2.5 py-1.5 rounded-lg transition"
            title="Reset demo data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("resetDemo")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
