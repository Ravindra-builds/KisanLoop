"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sprout } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8faf8] dark:bg-[#121814] flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4 animate-bounce">
        <Sprout className="w-5 h-5" />
      </div>
      <p className="text-sm font-bold text-[#111814] dark:text-white mb-2">
        Redirecting to KisanLoop Role Login...
      </p>
      <Link href="/login" className="text-xs text-emerald-700 underline font-semibold">
        Click here if not redirected automatically
      </Link>
    </div>
  );
}
