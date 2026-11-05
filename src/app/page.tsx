"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveSession } from "@/lib/tenantStore";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getActiveSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    if (session.role === "SUPER_ADMIN") {
      router.replace("/dashboard");
    } else {
      router.replace("/portal");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#060b13] flex items-center justify-center text-slate-400 font-mono text-xs">
      Loading CloudDining OS...
    </div>
  );
}
