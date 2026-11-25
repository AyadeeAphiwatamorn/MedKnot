"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { UserSession, getClientSession } from "@/lib/auth";

interface DashboardShellProps {
  initialUser?: UserSession;
  activeNav?: string;
  children: React.ReactNode;
}

/**
 * Lightweight content container for Dashboard sub-modules.
 * Sidebar and Header are rendered globally by DashboardAppShell in app/dashboard/layout.tsx.
 */
export function DashboardShell({
  initialUser,
  children,
}: DashboardShellProps) {
  const router = useRouter();

  React.useEffect(() => {
    if (!initialUser && !getClientSession()) {
      router.push("/login");
    }
  }, [initialUser, router]);

  return (
    <div className="w-full min-w-0 flex-1 text-[#1F2B46] font-sans antialiased">
      <main className="w-full min-w-0 p-4 md:p-8 flex-1">
        <div className="w-full min-w-0 space-y-6">{children}</div>
      </main>
    </div>
  );
}
