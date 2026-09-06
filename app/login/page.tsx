"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { Sprout } from "lucide-react";

export default function LoginPage() {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <div className="min-h-screen bg-[#f8faf8] dark:bg-[#121814] text-[#111814] dark:text-zinc-100 font-sans antialiased flex flex-col justify-between selection:bg-emerald-100 dark:selection:bg-emerald-950 overflow-x-hidden w-full">
      {/* Universal Header Bar */}
      <header className="w-full bg-white dark:bg-[#18221B] border-b border-[#e5ece7] dark:border-white/10 px-4 sm:px-6 lg:px-12 py-3 flex items-center justify-between shadow-2xs">
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#eef4ee] dark:bg-[#214E34]/30 border border-[#d2ded5] dark:border-[#214E34] flex items-center justify-center text-[#1b4332] dark:text-emerald-400 shadow-2xs shrink-0">
            <Sprout className="w-5 h-5 text-[#1b4332] dark:text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg text-[#111814] dark:text-white tracking-tight">
                KisanLoop
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#ebf7eb] dark:bg-emerald-950 text-[#1b4332] dark:text-emerald-400 border border-[#d2ded5] dark:border-emerald-800">
                v2.5
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#608570] dark:text-emerald-400/80 hidden sm:inline">
              Action &amp; Outcome Layer for Digital Agriculture
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/signup"
            className="text-xs font-bold text-[#1b4332] dark:text-emerald-400 hover:underline"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 max-w-[1100px] w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="w-full flex flex-col items-center justify-center">
          <div className="text-center mb-6 max-w-md">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-[#608570] dark:text-emerald-400">
              Secure Sign In / प्रवेश
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#111814] dark:text-white tracking-tight mt-1">
              Welcome to KisanLoop
            </h1>
            <p className="text-xs text-[#608570] dark:text-zinc-400 mt-1">
              Sign in to access your farmer recommendations, agronomist triage, or district intelligence.
            </p>
          </div>

          {clerkPubKey ? (
            <Suspense
              fallback={
                <div className="flex items-center justify-center p-8 text-xs text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Loading Sign In...
                </div>
              }
            >
              <div className="shadow-lg rounded-2xl overflow-hidden border border-[#e2ebe4] dark:border-white/10">
                <SignIn
                  routing="hash"
                  signUpUrl="/signup"
                  fallbackRedirectUrl="/"
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      card: "shadow-none border-0 rounded-2xl",
                    },
                  }}
                />
              </div>
            </Suspense>
          ) : (
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border text-center text-xs text-muted-foreground">
              Please configure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in .env.local
            </div>
          )}
        </div>
      </main>


      {/* Universal Footer */}
      <footer className="w-full bg-white dark:bg-[#18221B] border-t border-[#e5ece7] dark:border-white/10 px-4 sm:px-6 py-3.5 text-center text-xs text-[#608570] dark:text-zinc-400 flex flex-col sm:flex-row items-center justify-between max-w-[1100px] mx-auto gap-2">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs">
          <span className="font-bold text-[#111814] dark:text-white">KisanLoop Ecosystem</span>
          <span>• Identity &amp; Advisory Access</span>
        </div>
        <div className="flex items-center gap-4 font-semibold text-[11px] sm:text-xs">
          <Link href="/" className="hover:underline">Farmer UI</Link>
          <Link href="/expert" className="hover:underline">Expert</Link>
          <Link href="/dashboard" className="hover:underline">Govt</Link>
          <Link href="/admin" className="hover:underline">Admin</Link>
        </div>
      </footer>
    </div>
  );
}

