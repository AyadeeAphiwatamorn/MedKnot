"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function RegistrationHeader() {
  return (
    <header className="w-full bg-[#F3F6F0]/95 backdrop-blur-md border-b border-[#DDE6DA] shadow-[0_1px_8px_rgba(0,0,0,0.03)] sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo and Title */}
        <Link href="/register-hospital" className="flex items-center gap-space-sm group">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#DDE6DA] flex items-center justify-center p-1.5 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
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
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-[#0055A4] tracking-tight leading-none font-bold">
                MedKnot
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#0055A4]/10 text-[#0055A4] text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                Institutional Network
              </span>
            </div>
            <span className="font-supporting text-supporting text-[#5A6372] font-semibold tracking-wider uppercase mt-0.5 truncate">
              Hospital Registration Portal
            </span>
          </div>
        </Link>

        {/* Right side security badge & Sign In button */}
        <div className="flex items-center gap-space-md shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DDE6DA] text-[#5A6372] font-supporting text-supporting shadow-xs">
            <span className="material-symbols-outlined text-sm text-[#0055A4]">verified_user</span>
            <span>HIPAA &amp; ABDM Compliant Onboarding</span>
          </div>

          <Link
            href="/login"
            className="px-space-md py-1.5 rounded-xl bg-white border border-[#DDE6DA] hover:bg-[#E2E8DE] text-[#0055A4] font-button-label text-supporting font-semibold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span className="whitespace-nowrap">Already registered? Sign In</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
