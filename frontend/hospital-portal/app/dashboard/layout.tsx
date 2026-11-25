import React from "react";
import { FacilityProvider } from "@/components/dashboard/facility/FacilityContext";
import { SidebarProvider } from "@/components/dashboard/SidebarContext";
import { DashboardAppShell } from "@/components/dashboard/DashboardAppShell";
import { GlobalAIAssistant } from "@/components/dashboard/ai-assistant/GlobalAIAssistant";

/**
 * Shared Dashboard Layout — wraps all /dashboard/* routes in FacilityProvider,
 * SidebarProvider, the single global CSS Grid DashboardAppShell (Sidebar + Main
 * Content siblings), and mounts the GlobalAIAssistant floating overlay once.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FacilityProvider>
      <SidebarProvider>
        <DashboardAppShell>{children}</DashboardAppShell>
        <GlobalAIAssistant />
      </SidebarProvider>
    </FacilityProvider>
  );
}
