"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { type UserSession, DEFAULT_ADMIN } from "@/lib/auth";

interface DashboardHeaderProps {
  user?: UserSession;
}

export default function DashboardHeader({ user = DEFAULT_ADMIN }: DashboardHeaderProps) {
  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-[#F3F6F0]/90 backdrop-blur-xl border-b border-[#DDE6DA] shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-8">
      {/* Left: Facility Switcher Pill */}
      <div className="flex items-center min-w-0">
        <div className="flex items-center gap-space-sm bg-white border border-[#DDE6DA] px-space-md py-space-xs rounded-xl shadow-sm text-[#1F2B46] cursor-pointer hover:bg-[#F3F6F0] transition-colors">
          <span className="material-symbols-outlined text-[#0055A4] text-xl shrink-0">
            local_hospital
          </span>
          <div className="flex flex-col text-left min-w-0">
            <span className="font-supporting text-supporting text-[#5A6372] uppercase tracking-wider font-semibold truncate">
              Facility
            </span>
            <span className="font-card-heading text-card-heading text-[#1F2B46] truncate">
              {user.facility}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-supporting text-supporting font-semibold uppercase tracking-wider hidden md:inline-block shrink-0">
            Campus North
          </span>
          <span className="material-symbols-outlined text-[#5A6372] text-lg ml-space-xs shrink-0">
            expand_more
          </span>
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-space-lg shrink-0">
        <button
          className="relative p-space-sm text-[#424751] hover:bg-[#E2E8DE] hover:text-[#1F2B46] rounded-full transition-colors flex items-center justify-center cursor-pointer"
          type="button"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-xl">
            notifications
          </span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
        </button>

        <div className="flex items-center gap-space-md pl-space-md">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-space-sm bg-white border border-[#D5DFD2] py-1 px-space-md rounded-full shadow-sm hover:bg-[#F3F6F0] transition-colors cursor-pointer"
            title="View My Profile"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-[#D5DFD2] flex items-center justify-center p-0.5 shrink-0 shadow-xs">
              <Image
                src="/logo.png"
                alt="Profile"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-right mr-1 hidden sm:flex min-w-0">
              <span className="font-body-md text-body-md text-[#1F2B46] font-semibold leading-tight truncate">
                {user.name}
              </span>
              <span className="font-supporting text-supporting text-[#5A6372] truncate">
                {user.department}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
