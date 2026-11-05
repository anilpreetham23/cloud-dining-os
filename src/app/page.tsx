"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if session exists or redirect to dashboard
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#040814] flex items-center justify-center text-slate-400 font-mono text-xs">
      Loading CloudDining OS Super Admin Console...
    </div>
  );
}
