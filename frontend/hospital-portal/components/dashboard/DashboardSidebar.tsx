"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type UserSession, DEFAULT_ADMIN } from "@/lib/auth";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  Stethoscope,
  Building2,
  FileText,
  BadgeCheck,
  Building,
  UserCheck,
  LogOut,
  Sparkles,
  CheckSquare,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";

interface DashboardSidebarProps {
  user?: UserSession;
  activeNav?:
    | "dashboard"
    | "patients"
    | "appointments"
    | "queue-management"
    | "doctors"
    | "departments"
    | "medical-records"
    | "ai-review"
    | "tasks"
    | "reports"
    | "staff-management"
    | "facility-settings"
    | "settings"
    | "my-profile"
    | string;
  onSignOut?: () => void;
}

interface HoveredTooltipState {
  label: string;
  top: number;
}

export default function DashboardSidebar({
  user = DEFAULT_ADMIN,
  activeNav = "dashboard",
  onSignOut,
}: DashboardSidebarProps) {
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();
  const [hoveredTooltip, setHoveredTooltip] = useState<HoveredTooltipState | null>(null);

  // On mobile drawer (< 768px), always display expanded navigation labels inside the slide-over drawer
  const showCompactDesktop = isCollapsed && !isMobileOpen;

  const showTooltipForTarget = (el: HTMLElement, label: string) => {
    if (!showCompactDesktop) return;
    const rect = el.getBoundingClientRect();
    setHoveredTooltip({
      label,
      top: rect.top + rect.height / 2,
    });
  };

  const hideTooltip = () => setHoveredTooltip(null);

  const operationsNav = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      materialIcon: "dashboard",
      href: "/dashboard",
    },
    {
      id: "patients",
      label: "Patients",
      icon: Users,
      materialIcon: "personal_injury",
      href: "/dashboard/patients",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      materialIcon: "calendar_today",
      href: "/dashboard/appointments",
    },
    {
      id: "queue-management",
      label: "Queue Management",
      icon: Clock,
      materialIcon: "view_timeline",
      href: "/dashboard/queue",
    },
    {
      id: "tasks",
      label: "Staff Tasks",
      icon: CheckSquare,
      materialIcon: "task_alt",
      href: "/dashboard/tasks",
    },
    {
      id: "reports",
      label: "Operational Reports",
      icon: BarChart3,
      materialIcon: "analytics",
      href: "/dashboard/reports",
    },
  ];

  const clinicalNav = [
    {
      id: "doctors",
      label: "Doctors",
      icon: Stethoscope,
      materialIcon: "medical_services",
      href: "/dashboard/doctors",
    },
    {
      id: "departments",
      label: "Departments",
      icon: Building2,
      materialIcon: "apartment",
      href: "/dashboard/departments",
    },
    {
      id: "medical-records",
      label: "Medical Records",
      icon: FileText,
      materialIcon: "clinical_notes",
      href: "/dashboard/documents",
    },
    {
      id: "ai-review",
      label: "AI Medical Review",
      icon: Sparkles,
      materialIcon: "auto_awesome",
      href: "/dashboard/ai-review",
    },
  ];

  const adminNav = [
    {
      id: "staff-management",
      label: "Staff Management",
      icon: BadgeCheck,
      materialIcon: "badge",
      href: "/dashboard/staff",
    },
    {
      id: "facility-settings",
      label: "Facility Settings",
      icon: Building,
      materialIcon: "domain",
      href: "/dashboard/settings/facility",
    },
    {
      id: "settings",
      label: "Settings Hub",
      icon: Settings,
      materialIcon: "settings",
      href: "/dashboard/settings",
    },
    {
      id: "my-profile",
      label: "My Profile",
      icon: UserCheck,
      materialIcon: "account_circle",
      href: "/dashboard/profile",
    },
  ];

  const renderNavGroup = (
    title: string,
    items: (typeof operationsNav)[0][],
    showTopDivider = false
  ) => (
    <div className={showCompactDesktop ? "flex flex-col mb-1.5" : "flex flex-col mb-3"}>
      {showCompactDesktop ? (
        showTopDivider ? (
          <div className="h-px bg-[#DDE6DA] mx-3.5 my-1.5" aria-hidden="true" />
        ) : null
      ) : (
        <div className="px-space-xl pt-2 pb-1.5 flex items-center justify-between">
          <span className="font-supporting text-[11px] text-[#727783] uppercase tracking-wider font-semibold">
            {title}
          </span>
        </div>
      )}

      <div className={showCompactDesktop ? "px-2.5 py-0.5" : "px-space-md py-0.5"}>
        <nav className="flex flex-col gap-0.5" aria-label={title}>
          {items.map((item) => {
            const isActive = activeNav === item.id;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={closeMobile}
                onMouseEnter={(e) => showTooltipForTarget(e.currentTarget, item.label)}
                onMouseLeave={hideTooltip}
                onFocus={(e) => showTooltipForTarget(e.currentTarget, item.label)}
                onBlur={hideTooltip}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                title={showCompactDesktop ? item.label : undefined}
                className={`flex items-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055A4] ${
                  showCompactDesktop
                    ? "justify-center w-11 h-10 mx-auto px-0 py-0"
                    : "justify-between px-space-md py-2"
                } ${
                  isActive
                    ? "bg-[#015CA9] text-white font-semibold shadow-sm"
                    : "text-[#424751] hover:bg-[#E2E8DE] hover:text-[#1F2B46]"
                }`}
              >
                <div
                  className={`flex items-center min-w-0 ${
                    showCompactDesktop ? "justify-center" : "gap-space-md"
                  }`}
                >
                  <IconComponent className="w-[18px] h-[18px] shrink-0" />
                  {!showCompactDesktop && (
                    <span className="font-body-md text-[13.5px] truncate">
                      {item.label}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay (< 768px) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1F2B46]/40 backdrop-blur-[2px] md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Primary Sidebar Navigation"
        className={`dashboard-sidebar-aside fixed inset-y-0 left-0 w-[296px] z-50 md:col-start-1 md:row-start-1 md:sticky md:top-0 md:h-screen md:w-full md:translate-x-0 md:z-20 bg-[#F3F6F0] border-r border-[#DDE6DA] shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between overflow-y-auto overflow-x-hidden sidebar-scrollbar ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Logo & Sidebar Toggle Header */}
          <div
            className={`h-16 flex items-center border-b border-[#DDE6DA] shrink-0 sticky top-0 bg-[#F3F6F0]/95 backdrop-blur-sm z-10 ${
              showCompactDesktop
                ? "px-2 justify-between gap-1"
                : "px-space-xl justify-between gap-space-sm"
            }`}
          >
            <Link
              href="/dashboard"
              onClick={closeMobile}
              title={showCompactDesktop ? "MedKnot Hospital Portal" : undefined}
              className="flex items-center gap-space-sm min-w-0"
            >
              <div
                className={`rounded-xl bg-white border border-[#DDE6DA] flex items-center justify-center shadow-sm shrink-0 ${
                  showCompactDesktop ? "w-8 h-8 p-1" : "w-10 h-10 p-1.5"
                }`}
              >
                <Image
                  src="/logo.png"
                  alt="MedKnot Logo"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              {!showCompactDesktop && (
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-sm text-headline-sm text-[#015CA9] tracking-tight leading-none truncate font-bold">
                    MedKnot
                  </span>
                  <span className="font-supporting text-supporting text-[#5A6372] font-semibold tracking-wider uppercase mt-0.5 truncate">
                    Hospital Portal
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop / Tablet Collapse-Expand Toggle */}
            <button
              type="button"
              onClick={() => {
                hideTooltip();
                toggleCollapsed();
              }}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={`hidden md:inline-flex items-center justify-center rounded-lg text-[#5A6372] hover:bg-[#E2E8DE] hover:text-[#1F2B46] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055A4] ${
                showCompactDesktop ? "w-7 h-7" : "p-1.5"
              }`}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-[18px] h-[18px]" />
              ) : (
                <PanelLeftClose className="w-[18px] h-[18px]" />
              )}
            </button>

            {/* Mobile Drawer Close Button */}
            <button
              type="button"
              onClick={closeMobile}
              aria-label="Close navigation menu"
              title="Close navigation menu"
              className="md:hidden inline-flex items-center justify-center p-1.5 rounded-lg text-[#5A6372] hover:bg-[#E2E8DE] hover:text-[#1F2B46] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055A4]"
            >
              <X className="w-[18px] h-[18px]" />
            </button>
          </div>

          {/* Navigation Sections */}
          <div className="py-2">
            {renderNavGroup("Operations", operationsNav, false)}
            {renderNavGroup("Clinical & Care", clinicalNav, true)}
            {renderNavGroup("Administration", adminNav, true)}
          </div>
        </div>

        {/* Sidebar Bottom Profile Card */}
        {showCompactDesktop ? (
          <div className="p-2 mx-2.5 my-3 bg-white border border-[#DDE6DA] rounded-xl flex flex-col items-center gap-2 shadow-sm shrink-0">
            <Link
              href="/dashboard/profile"
              onMouseEnter={(e) =>
                showTooltipForTarget(e.currentTarget, `${user.name} (${user.role})`)
              }
              onMouseLeave={hideTooltip}
              onFocus={(e) =>
                showTooltipForTarget(e.currentTarget, `${user.name} (${user.role})`)
              }
              onBlur={hideTooltip}
              title={`${user.name} (${user.role}) — View Profile`}
              aria-label={`${user.name} (${user.role}) — View Profile`}
              className="w-9 h-9 rounded-full bg-white border border-[#DDE6DA] hover:border-[#0055A4] flex items-center justify-center p-1 shrink-0 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055A4]"
            >
              <Image
                src="/logo.png"
                alt="Profile"
                width={24}
                height={24}
                className="w-full h-full object-contain"
              />
            </Link>
            {onSignOut && (
              <button
                onClick={onSignOut}
                onMouseEnter={(e) => showTooltipForTarget(e.currentTarget, "Sign Out")}
                onMouseLeave={hideTooltip}
                onFocus={(e) => showTooltipForTarget(e.currentTarget, "Sign Out")}
                onBlur={hideTooltip}
                className="w-8 h-8 text-[#5A6372] hover:text-[#ba1a1a] hover:bg-[#F3F6F0] transition-colors rounded-lg flex items-center justify-center shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055A4]"
                title="Sign Out"
                aria-label="Sign Out"
                type="button"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="p-space-md m-space-md bg-white border border-[#DDE6DA] rounded-xl flex items-center justify-between shadow-sm shrink-0">
            <Link
              href="/dashboard/profile"
              onClick={closeMobile}
              className="flex items-center gap-space-sm min-w-0 hover:opacity-90 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-white border border-[#DDE6DA] flex items-center justify-center p-1 shrink-0 shadow-xs">
                <Image
                  src="/logo.png"
                  alt="Profile"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-card-heading text-card-heading text-[#1F2B46] truncate leading-tight font-semibold">
                  {user.name}
                </span>
                <span className="font-supporting text-supporting text-[#5A6372] truncate">
                  {user.role}
                </span>
              </div>
            </Link>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="p-space-xs text-[#5A6372] hover:text-[#ba1a1a] transition-colors rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
                type="button"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Fixed Floating Tooltip for Collapsed Navigation Items (avoids overflow-y-auto clipping) */}
      {showCompactDesktop && hoveredTooltip && (
        <div
          role="tooltip"
          style={{ top: `${hoveredTooltip.top}px` }}
          className="fixed left-[92px] -translate-y-1/2 z-[60] pointer-events-none hidden md:flex items-center px-3 py-1.5 rounded-lg bg-[#1F2B46] text-white text-xs font-semibold shadow-lg whitespace-nowrap"
        >
          {hoveredTooltip.label}
        </div>
      )}
    </>
  );
}
