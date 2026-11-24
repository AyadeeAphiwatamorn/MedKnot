"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { type UserSession, DEFAULT_ADMIN } from "@/lib/auth";

interface DashboardSidebarProps {
  user?: UserSession;
  activeNav?: "dashboard" | "patients" | "appointments" | "queue-management" | "medical-records" | "staff-management" | "facility-settings" | "my-profile" | string;
  onSignOut?: () => void;
}

export default function DashboardSidebar({
  user = DEFAULT_ADMIN,
  activeNav = "dashboard",
  onSignOut,
}: DashboardSidebarProps) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "dashboard",
      href: "/dashboard",
    },
    {
      id: "patients",
      label: "Patients",
      icon: "personal_injury",
      href: "#",
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: "calendar_today",
      href: "#",
    },
    {
      id: "queue-management",
      label: "Queue Management",
      icon: "view_timeline",
      href: "#",
    },
    {
      id: "medical-records",
      label: "Medical Records",
      icon: "clinical_notes",
      href: "#",
    },
    {
      id: "staff-management",
      label: "Staff Management",
      icon: "badge",
      href: "#",
    },
    {
      id: "facility-settings",
      label: "Facility Settings",
      icon: "domain",
      href: "/dashboard/settings/facility/register",
    },
    {
      id: "my-profile",
      label: "My Profile",
      icon: "account_circle",
      href: "#",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-[#F3F6F0] border-r border-[#DDE6DA] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between">
      <div className="flex flex-col">
        {/* Brand Logo Header */}
        <div className="h-16 px-space-xl flex items-center gap-space-sm border-b border-[#DDE6DA]">
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
              <span className="font-headline-sm text-headline-sm text-[#0055A4] tracking-tight leading-none truncate">
                MedKnot
              </span>
              <span className="font-supporting text-supporting text-[#5A6372] font-semibold tracking-wider uppercase mt-0.5 truncate">
                Hospital Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Section Label */}
        <div className="px-space-xl pt-space-sm pb-1">
          <span className="font-supporting text-supporting text-[#727783] uppercase tracking-wider font-semibold">
            Operations
          </span>
        </div>

        {/* Navigation Links */}
        <div className="px-space-md py-1">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-space-md px-space-md py-space-sm rounded-xl transition-all ${
                    isActive
                      ? "bg-[#0055A4] text-white font-semibold shadow-sm"
                      : "text-[#424751] hover:bg-[#E2E8DE] hover:text-[#1F2B46]"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-body-md text-body-md truncate">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Bottom Profile Card */}
      <div className="p-space-md m-space-md bg-white border border-[#DDE6DA] rounded-xl flex items-center justify-between shadow-sm">
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
            <span className="font-card-heading text-card-heading text-[#1F2B46] truncate leading-tight">
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
            className="p-space-xs text-[#5A6372] hover:text-error transition-colors rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
            title="Sign Out"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}
