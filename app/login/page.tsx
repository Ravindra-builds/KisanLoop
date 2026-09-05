"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sprout,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Info,
  KeyRound,
} from "lucide-react";
import { TEST_USERS } from "@/lib/auth/constants";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [selectedEmail, setSelectedEmail] = useState(TEST_USERS[0].email);
  const [password, setPassword] = useState("Farmer@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectUser = (user: (typeof TEST_USERS)[0]) => {
    setSelectedEmail(user.email);
    if (user.role === "FARMER") setPassword("Farmer@123");
    else if (user.role === "EXPERT") setPassword("Expert@123");
    else if (user.role === "GOVT") setPassword("Govt@123");
    else setPassword("Admin@123");
    setError(null);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedEmail }),
      });

      const json = await res.json();
      if (json.success) {
        const dest = from !== "/login" && from !== "/" ? from : json.data.redirectUrl;
        router.push(dest);
        router.refresh();
      } else {
        setError(json.error?.message || "Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-green-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl grid md:grid-cols-5 bg-card border rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side: Brand Banner */}
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-700 via-emerald-800 to-green-950 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white">
                <Sprout className="w-7 h-7 text-emerald-300" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight">
                  Kisan<span className="text-emerald-400">LOOP</span>
                </span>
                <p className="text-xs text-emerald-200">
                  Agricultural Action Intelligence
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-bold leading-snug">
                Turning Agricultural Intelligence into Verified Farmer Action.
              </h2>
              <p className="text-xs text-emerald-100/80 leading-relaxed">
                Connect satellite radars, soil sensors, and agricultural guidelines into personalized, feasibility-checked actions for Indian smallholders.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-[11px] text-emerald-200/70 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Role-separated secure ecosystem with audit trail.</span>
          </div>
        </div>

        {/* Right Side: Login & Test Credentials */}
        <div className="md:col-span-3 p-8 flex flex-col justify-center">
          <div>
            <h3 className="text-2xl font-black text-foreground">Sign In / प्रवेश करें</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Select one of the pre-configured test accounts below or enter credentials.
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Quick 1-Click Role Selector Cards */}
          <div className="mt-6 space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Pre-Configured Test Accounts (One-Click)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEST_USERS.map((user) => {
                const isSelected = selectedEmail === user.email;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 shadow-xs"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-muted text-muted-foreground">
                        {user.role}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div className="font-bold text-xs text-foreground truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {user.email}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <KeyRound className="w-4 h-4 text-muted-foreground absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-3 rounded-xl bg-muted/40 border text-[11px] text-muted-foreground flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Toggle <code>DEMO_MODE=true</code> in <code>.env.local</code> to bypass login automatically.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-600 animate-pulse">
            <Sprout className="w-6 h-6 animate-spin" />
            <span>Loading KisanLoop Login...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
