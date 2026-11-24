"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { type UserSession, DEFAULT_ADMIN } from "@/lib/auth";
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

export default function DashboardSidebar({
  user = DEFAULT_ADMIN,
  activeNav = "dashboard",
  onSignOut,
}: DashboardSidebarProps) {
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
      href: "#",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      materialIcon: "calendar_today",
      href: "#",
    },
    {
      id: "queue-management",
      label: "Queue Management",
      icon: Clock,
      materialIcon: "view_timeline",
      href: "#",
    },
    {
      id: "tasks",
      label: "Staff Tasks",
      icon: CheckSquare,
      materialIcon: "task_alt",
      href: "/dashboard/tasks",
      badge: "M8",
    },
    {
      id: "reports",
      label: "Operational Reports",
      icon: BarChart3,
      materialIcon: "analytics",
      href: "/dashboard/reports",
      badge: "M8",
    },
  ];

  const clinicalNav = [
    {
      id: "doctors",
      label: "Doctors",
      icon: Stethoscope,
      materialIcon: "medical_services",
      href: "/dashboard/doctors",
      badge: "M5",
    },
    {
      id: "departments",
      label: "Departments",
      icon: Building2,
      materialIcon: "apartment",
      href: "/dashboard/departments",
      badge: "M5",
    },
    {
      id: "medical-records",
      label: "Medical Records",
      icon: FileText,
      materialIcon: "clinical_notes",
      href: "/dashboard/documents",
      badge: "M6",
    },
    {
      id: "ai-review",
      label: "AI Medical Review",
      icon: Sparkles,
      materialIcon: "auto_awesome",
      href: "/dashboard/ai-review",
      badge: "M7",
    },
  ];

  const adminNav = [
    {
      id: "staff-management",
      label: "Staff Management",
      icon: BadgeCheck,
      materialIcon: "badge",
      href: "/dashboard/settings/staff",
      badge: "M8",
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
      badge: "M8",
    },
    {
      id: "my-profile",
      label: "My Profile",
      icon: UserCheck,
      materialIcon: "account_circle",
      href: "#",
    },
  ];

  const renderNavGroup = (
    title: string,
    items: (typeof operationsNav[0] & { badge?: string })[]
  ) => (
    <div className="flex flex-col mb-3">
      <div className="px-space-xl pt-2 pb-1.5 flex items-center justify-between">
        <span className="font-supporting text-[11px] text-[#727783] uppercase tracking-wider font-semibold">
          {title}
        </span>
      </div>
      <div className="px-space-md py-0.5">
        <nav className="flex flex-col gap-0.5">
          {items.map((item) => {
            const isActive = activeNav === item.id;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center justify-between px-space-md py-2 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#015CA9] text-white font-semibold shadow-sm"
                    : "text-[#424751] hover:bg-[#E2E8DE] hover:text-[#1F2B46]"
                }`}
              >
                <div className="flex items-center gap-space-md min-w-0">
                  <IconComponent className="w-[18px] h-[18px] shrink-0" />
                  <span className="font-body-md text-[13.5px] truncate">
                    {item.label}
                  </span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#F3F6F0] border-r border-[#DDE6DA] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between overflow-y-auto">
      <div className="flex flex-col">
        {/* Brand Logo Header */}
        <div className="h-16 px-space-xl flex items-center gap-space-sm border-b border-[#DDE6DA] shrink-0 sticky top-0 bg-[#F3F6F0]/95 backdrop-blur-sm z-10">
          <Link href="/dashboard" className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#DDE6DA] flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <Image
                src="/logo.png"
                alt="MedKnot Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm text-[#015CA9] tracking-tight leading-none truncate font-bold">
                MedKnot
              </span>
              <span className="font-supporting text-supporting text-[#5A6372] font-semibold tracking-wider uppercase mt-0.5 truncate">
                Hospital Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="py-2">
          {renderNavGroup("Operations", operationsNav)}
          {renderNavGroup("Clinical & Care", clinicalNav)}
          {renderNavGroup("Administration", adminNav)}
        </div>
      </div>

      {/* Sidebar Bottom Profile Card */}
      <div className="p-space-md m-space-md bg-white border border-[#DDE6DA] rounded-xl flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-space-sm min-w-0">
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
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="p-space-xs text-[#5A6372] hover:text-[#ba1a1a] transition-colors rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
            title="Sign Out"
            type="button"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
