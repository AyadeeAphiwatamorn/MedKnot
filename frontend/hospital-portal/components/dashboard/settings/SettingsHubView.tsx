"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserSession,
  DEFAULT_ADMIN,
  clearClientSession,
} from "@/lib/auth";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Settings,
  Users,
  Building,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  Lock,
  FileBadge,
  Bell,
  Sliders,
  Sparkles,
} from "lucide-react";

interface SettingsHubViewProps {
  initialUser?: UserSession;
}

export default function SettingsHubView({ initialUser }: SettingsHubViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  const settingsCards = [
    {
      title: "Staff Accounts & Role Permissions",
      description:
        "Manage hospital user accounts, assign roles (Administrator, Doctor, Nurse, Receptionist), configure access permissions, and invite new medical staff.",
      icon: Users,
      href: "/dashboard/settings/staff",
      badge: "User Management",
      color: "#015CA9",
      bg: "#E1F2FD",
    },
    {
      title: "Facility Profile & Accreditations",
      description:
        "Hospital charter details, institutional registrations, bed capacities, trauma tier, 24/7 emergency hotlines, and NABH/JCI accreditation tracking.",
      icon: Building,
      href: "/dashboard/settings/facility",
      badge: "Facility Management",
      color: "#526524",
      bg: "#DFEEA9",
    },
    {
      title: "Security, Privacy & EHR Audits",
      description:
        "Immutable audit event logging, HIPAA compliance parameters, Supabase storage access controls, and role-based session lifetimes.",
      icon: ShieldCheck,
      href: "/dashboard/documents",
      badge: "Compliance & Security",
      color: "#003e7a",
      bg: "#E1F2FD",
    },
  ];

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] min-h-screen antialiased bg-[#EDF2E9]">
      <DashboardSidebar
        user={user}
        activeNav="settings"
        onSignOut={handleSignOut}
      />

      <div className="pl-72">
        <DashboardHeader user={user} />

        <main className="relative pt-16 bg-[#EDF2E9] min-h-screen w-full px-8 pb-16">
          <div className="flex flex-col w-full max-w-[1500px] mx-auto">
            {/* Breadcrumb & Sub-header */}
            <div className="w-full py-space-lg flex flex-col gap-space-sm">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-space-xs text-[#5A6372] font-supporting text-supporting"
              >
                <Link
                  href="/dashboard"
                  className="hover:text-[#015CA9] transition-colors"
                >
                  Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <span className="text-[#015CA9] font-semibold whitespace-nowrap">
                  Settings &amp; Administration Hub
                </span>
              </nav>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#015CA9] tracking-tight font-bold">
                      Administrative Settings Hub
                    </h1>
                    <Badge variant="avocado">Module 8 • Operations</Badge>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-3xl">
                    Centralized administrative console for hospital identity, role-based
                    staff permissions, facility accreditations, and regulatory compliance.
                  </p>
                </div>
              </div>
            </div>

            {/* Hub Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {settingsCards.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-all border-[#DDE6DA] flex flex-col justify-between"
                  >
                    <div>
                      <CardHeader className="p-6 pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                            style={{
                              backgroundColor: item.bg,
                              color: item.color,
                            }}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <Badge variant="secondary">{item.badge}</Badge>
                        </div>
                        <CardTitle className="text-base text-[#1F2B46] font-bold">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 pt-0">
                        <p className="text-xs text-[#5A6372] leading-relaxed">
                          {item.description}
                        </p>
                      </CardContent>
                    </div>

                    <div className="p-6 pt-3 border-t border-[#F3F6F0] bg-[#FAFDF8]">
                      <Link href={item.href}>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs flex items-center justify-between"
                        >
                          <span>Manage {item.title.split(" ")[0]}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Institutional Information Card */}
            <Card className="bg-white border-[#DDE6DA] shadow-sm">
              <CardHeader className="p-6 pb-3 border-b border-[#F3F6F0]">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-[#015CA9]" />
                  <CardTitle className="text-base">Active Facility Workspace</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA]">
                  <span className="text-[#727783] block">Active Facility</span>
                  <span className="font-bold text-[#1F2B46] block text-sm mt-0.5">
                    {user.facility}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA]">
                  <span className="text-[#727783] block">Current Administrator</span>
                  <span className="font-bold text-[#1F2B46] block text-sm mt-0.5">
                    {user.name} ({user.role})
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA]">
                  <span className="text-[#727783] block">Active Shift / Context</span>
                  <span className="font-bold text-[#015CA9] block text-sm mt-0.5">
                    {user.shift}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
