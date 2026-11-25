"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  clearClientSession,
  DEFAULT_ADMIN,
  getClientSession,
  type UserSession,
} from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
  useSidebar,
} from "@/components/dashboard/SidebarContext";

function resolveActiveNavFromPath(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/dashboard";
  if (path === "/dashboard") return "dashboard";
  if (path.startsWith("/dashboard/patients")) return "patients";
  if (path.startsWith("/dashboard/appointments")) return "appointments";
  if (path.startsWith("/dashboard/queue")) return "queue-management";
  if (path.startsWith("/dashboard/tasks")) return "tasks";
  if (path.startsWith("/dashboard/reports")) return "reports";
  if (path.startsWith("/dashboard/doctors")) return "doctors";
  if (path.startsWith("/dashboard/departments")) return "departments";
  if (path.startsWith("/dashboard/documents")) return "medical-records";
  if (path.startsWith("/dashboard/ai-review")) return "ai-review";
  if (path.startsWith("/dashboard/staff") || path.startsWith("/dashboard/settings/staff")) {
    return "staff-management";
  }
  if (path.startsWith("/dashboard/settings/facility")) return "facility-settings";
  if (path.startsWith("/dashboard/settings")) return "settings";
  if (path.startsWith("/dashboard/profile")) return "my-profile";
  return "dashboard";
}

/**
 * Single Global Dashboard Layout Grid Shell mounted in app/dashboard/layout.tsx.
 * Keeps Sidebar and Main Content as true CSS Grid siblings (`var(--sidebar-width) minmax(0, 1fr)`)
 * so Main Content Width always equals Viewport Width - Sidebar Width without fixed/margin offsets.
 */
export function DashboardAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/dashboard";
  const router = useRouter();
  const { isCollapsed } = useSidebar();
  const [user, setUser] = useState<UserSession>(DEFAULT_ADMIN);

  useEffect(() => {
    const clientSession = getClientSession();
    if (clientSession) {
      setUser(clientSession);
    }
  }, [pathname]);

  const activeNav = useMemo(() => resolveActiveNavFromPath(pathname), [pathname]);

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  return (
    <div
      className="dashboard-layout-grid"
      style={{
        ["--sidebar-width" as string]: isCollapsed
          ? SIDEBAR_COLLAPSED_WIDTH
          : SIDEBAR_EXPANDED_WIDTH,
      }}
    >
      {/* Sibling 1: Persistent Global Sidebar (Col 1 on tablet/desktop, drawer on mobile) */}
      <DashboardSidebar
        user={user}
        activeNav={activeNav}
        onSignOut={handleSignOut}
      />

      {/* Sibling 2: Main Content Container (Col 2, minmax(0, 1fr)) */}
      <div className="dashboard-layout-main">
        <DashboardHeader user={user} />
        <div className="dashboard-layout-content">{children}</div>
      </div>
    </div>
  );
}
