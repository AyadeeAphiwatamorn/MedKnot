"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserSession,
  DEFAULT_ADMIN,
  clearClientSession,
} from "@/lib/auth";
import RegisterFacilityView from "@/components/dashboard/facility/RegisterFacilityView";
import { INITIAL_FACILITY_SETTINGS } from "@/lib/clinical-data";
import { FacilitySettings } from "@/types/clinical";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  ShieldCheck,
  Bed,
  Activity,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  FileBadge,
  Sparkles,
  Sliders,
  AlertTriangle,
  UserCheck,
  Hospital,
  Clock,
  ArrowRight,
  Edit3,
} from "lucide-react";

interface FacilitySettingsViewProps {
  initialUser?: UserSession;
}

export default function FacilitySettingsView({
  initialUser,
}: FacilitySettingsViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [facilityData, setFacilityData] = useState<FacilitySettings>(
    INITIAL_FACILITY_SETTINGS
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] antialiased bg-transparent w-full min-w-0 flex-1">
      <main className="relative bg-transparent w-full min-w-0 px-4 md:px-8 pt-2 pb-16">
        <div className="flex flex-col w-full min-w-0">
            {/* Toast Notification */}
            {toastMessage && (
              <div className="fixed top-20 right-8 z-50 bg-[#1F2B46] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 border border-[#015CA9]">
                <CheckCircle2 className="w-5 h-5 text-[#DFEEA9] shrink-0" />
                <span className="font-card-heading text-sm font-medium">
                  {toastMessage}
                </span>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="ml-2 text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Breadcrumb & Sub-header */}
            <div className="w-full py-space-lg flex flex-col gap-space-sm">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-space-xs text-[#5A6372] font-supporting text-supporting"
              >
                <Link
                  href="/dashboard"
                  className="hover:text-[#015CA9] transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>Dashboard</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-[#667085] shrink-0" />
                <span className="text-[#5A6372] whitespace-nowrap">
                  Settings &amp; Administration
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#667085] shrink-0" />
                <span className="text-[#015CA9] font-semibold whitespace-nowrap">
                  Facility Settings
                </span>
              </nav>

              {/* Title & Action Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#015CA9] tracking-tight font-bold truncate">
                      Facility Profile &amp; Hospital Settings
                    </h1>
                    <Badge variant="avocado" className="shadow-xs">
                      Module 5 • Connected Facility
                    </Badge>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-3xl">
                    View institutional registrations, NABH/JCI hospital accreditations,
                    licensed bed counts, and configure organizational parameters.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    variant={activeTab === "wizard" ? "outline" : "default"}
                    onClick={() =>
                      setActiveTab(activeTab === "wizard" ? "overview" : "wizard")
                    }
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>
                      {activeTab === "wizard"
                        ? "View Facility Summary"
                        : "Edit Facility Registration"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Primary Mode Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="flex items-center justify-between gap-4 mb-6">
                <TabsList>
                  <TabsTrigger value="overview">
                    <Building className="w-4 h-4 mr-1.5" />
                    Facility Overview
                  </TabsTrigger>
                  <TabsTrigger value="compliance">
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Accreditation &amp; Licenses
                  </TabsTrigger>
                  <TabsTrigger value="wizard">
                    <Sliders className="w-4 h-4 mr-1.5" />
                    Registration &amp; Setup Wizard
                  </TabsTrigger>
                </TabsList>

                {activeTab !== "wizard" && (
                  <Link
                    href="/dashboard/settings/facility/register"
                    className="text-xs font-semibold text-[#015CA9] hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>Full-page Registration Mode</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* ── TAB 1: FACILITY OVERVIEW ────────────────────── */}
              <TabsContent value="overview" className="space-y-6">
                {/* Hero Facility Banner Card */}
                <Card className="overflow-hidden">
                  <div className="h-3 bg-gradient-to-r from-[#015CA9] via-[#A3C8B4] to-[#DFEEA9]" />
                  <div className="p-6 md:p-8 flex flex-col lg:flex-row items-start justify-between gap-6">
                    <div className="flex items-start gap-5 min-w-0">
                      <div className="w-20 h-20 rounded-2xl bg-[#E1F2FD] border border-[#bce0fb] flex items-center justify-center p-2 shrink-0 shadow-sm">
                        <Image
                          src="/logo.png"
                          alt="Facility Logo"
                          width={60}
                          height={60}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h2 className="font-bold text-2xl text-[#1F2B46] tracking-tight">
                            {facilityData.facilityName}
                          </h2>
                          <Badge variant="avocado">
                            <span className="w-2 h-2 rounded-full bg-[#526524] animate-pulse mr-1" />
                            {facilityData.activeStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-[#5A6372]">
                          {facilityData.facilityType} • Established in{" "}
                          {facilityData.yearEstablished}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-[#667085] flex-wrap pt-1">
                          <span className="font-medium text-[#015CA9] bg-[#E1F2FD] px-2.5 py-0.5 rounded-md border border-[#bce0fb]">
                            Charter No: {facilityData.registrationNumber}
                          </span>
                          <span>•</span>
                          <span>Tax / GST: {facilityData.taxId}</span>
                          <span>•</span>
                          <span className="font-semibold text-[#1F2B46]">
                            {facilityData.traumaLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveTab("wizard")}
                        className="w-full justify-center"
                      >
                        <Edit3 className="w-4 h-4 mr-1.5" />
                        Edit Facility Profile
                      </Button>
                      <a
                        href={facilityData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-[#C8D6C3] text-xs font-semibold text-[#1F2B46] hover:bg-[#E6EDE2] transition-colors"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#015CA9]" />
                        <span>Visit Website</span>
                        <ExternalLink className="w-3 h-3 text-[#667085]" />
                      </a>
                    </div>
                  </div>

                  {/* Institutional Summary text */}
                  <div className="px-6 md:px-8 pb-6 border-t border-[#C8D6C3] pt-4">
                    <p className="text-sm text-[#5A6372] leading-relaxed">
                      {facilityData.overview}
                    </p>
                  </div>
                </Card>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)]">
                    <CardContent className="p-4 flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0">
                        <Bed className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                          Licensed Inpatient Beds
                        </p>
                        <h4 className="text-2xl font-bold text-[#1F2B46]">
                          {facilityData.totalBeds}
                        </h4>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)]">
                    <CardContent className="p-4 flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#DFEEA9] text-[#2d3a08] flex items-center justify-center shrink-0">
                        <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                          ICU / Critical Care Beds
                        </p>
                        <h4 className="text-2xl font-bold text-[#1F2B46]">
                          {facilityData.icuBeds}
                        </h4>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)]">
                    <CardContent className="p-4 flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center shrink-0">
                        <Hospital className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                          Modular OTs
                        </p>
                        <h4 className="text-2xl font-bold text-[#1F2B46]">
                          {facilityData.operatingTheaters} Suites
                        </h4>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-[0_6px_16px_rgba(31,43,70,0.14)]">
                    <CardContent className="p-4 flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#FAE193] text-[#5e4300] flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs text-[#5A6372] font-semibold uppercase tracking-wider">
                          Emergency &amp; Trauma
                        </p>
                        <h4 className="text-2xl font-bold text-[#1F2B46]">
                          24/7 Level 1
                        </h4>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 2-Column Detail Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Location & Contact Information */}
                  <Card>
                    <CardHeader className="p-5 pb-3 border-b border-[#C8D6C3]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#015CA9]" />
                        <CardTitle>Campus Location &amp; Contact Desks</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4 text-sm">
                      <div className="space-y-1">
                        <span className="text-xs text-[#667085] uppercase tracking-wider font-semibold block">
                          Official Campus Address
                        </span>
                        <p className="font-medium text-[#1F2B46]">
                          {facilityData.streetAddress}
                        </p>
                        <p className="text-[#5A6372]">
                          {facilityData.city}, {facilityData.state} —{" "}
                          {facilityData.pincode}, {facilityData.country}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-[#E1E9DC] border border-[#C8D6C3]">
                          <span className="text-xs text-[#667085] block">
                            General Contact Desk
                          </span>
                          <span className="font-semibold text-[#1F2B46] block mt-0.5">
                            {facilityData.contactDesk}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#ffdad6]/40 border border-[#f5b8b2]">
                          <span className="text-xs text-[#ba1a1a] block font-semibold">
                            Emergency Hotline (24/7)
                          </span>
                          <span className="font-bold text-[#ba1a1a] block mt-0.5">
                            {facilityData.emergencyDesk}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-[#E1E9DC] border border-[#C8D6C3]">
                          <span className="text-xs text-[#667085] block">
                            Patient Registry Email
                          </span>
                          <span className="font-semibold text-[#015CA9] block mt-0.5 truncate">
                            {facilityData.registryEmail}
                          </span>
                        </div>
                        <div className="p-3 rounded-xl bg-[#E1E9DC] border border-[#C8D6C3]">
                          <span className="text-xs text-[#667085] block">
                            Care &amp; Support Email
                          </span>
                          <span className="font-semibold text-[#015CA9] block mt-0.5 truncate">
                            {facilityData.supportEmail}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Institutional Leadership & Administrator */}
                  <Card>
                    <CardHeader className="p-5 pb-3 border-b border-[#C8D6C3]">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-[#015CA9]" />
                        <CardTitle>Institutional Leadership</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4 text-sm">
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-[#E1E9DC] border border-[#C8D6C3]">
                        <div className="w-12 h-12 rounded-full bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center font-bold text-base shrink-0">
                          ML
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-base text-[#1F2B46]">
                            {facilityData.adminName}
                          </h4>
                          <p className="text-xs text-[#5A6372]">
                            {facilityData.adminDesignation}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#C8D6C3]">
                          <span className="text-[#667085] flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-[#015CA9]" />
                            Official Administrative Email
                          </span>
                          <span className="font-semibold text-[#1F2B46]">
                            {facilityData.adminEmail}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#C8D6C3]">
                          <span className="text-[#667085] flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-[#015CA9]" />
                            Direct Administrator Phone
                          </span>
                          <span className="font-semibold text-[#1F2B46]">
                            {facilityData.adminPhone}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#E1F2FD]/50 border border-[#bce0fb] text-xs text-[#003e7a] flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#015CA9]" />
                        <span>
                          The registered facility administrator maintains statutory
                          sign-off authority for clinical staff credentialing,
                          statutory EHR audit events, and data sharing consent.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* ── TAB 2: COMPLIANCE & ACCREDITATIONS ──────────── */}
              <TabsContent value="compliance" className="space-y-6">
                <Card>
                  <CardHeader className="p-6 pb-4 border-b border-[#C8D6C3]">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle>
                          Hospital Accreditations &amp; Quality Certifications
                        </CardTitle>
                        <CardDescription>
                          Accreditation standards certified for tertiary clinical
                          excellence, safety, and patient outcomes.
                        </CardDescription>
                      </div>
                      <Badge variant="avocado">Verified Compliant</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {facilityData.accreditations.map((acc, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl border border-[#C8D6C3] bg-[#E1E9DC] flex items-start gap-3"
                        >
                          <div className="w-9 h-9 rounded-xl bg-[#DFEEA9] text-[#2d3a08] flex items-center justify-center shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-[#1F2B46]">
                              {acc}
                            </h4>
                            <span className="text-xs text-[#5A6372] block mt-0.5">
                              Certified Valid • Re-evaluation cycle current
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#C8D6C3]">
                      <div className="p-3 rounded-xl bg-white border border-[#C8D6C3]">
                        <span className="text-xs text-[#667085] block">
                          Last Clinical Audit
                        </span>
                        <span className="font-bold text-sm text-[#1F2B46] block mt-0.5">
                          {facilityData.lastAuditDate}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-[#C8D6C3]">
                        <span className="text-xs text-[#667085] block">
                          Next Quality Renewal
                        </span>
                        <span className="font-bold text-sm text-[#015CA9] block mt-0.5">
                          {facilityData.nextRenewalDate}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-[#C8D6C3]">
                        <span className="text-xs text-[#667085] block">
                          EHR Security Status
                        </span>
                        <span className="font-bold text-sm text-[#526524] block mt-0.5">
                          Tier-4 HIPAA &amp; ISO 27001
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ── TAB 3: REGISTRATION & SETUP WIZARD ──────────── */}
              <TabsContent value="wizard" className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#E1F2FD] border border-[#bce0fb] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Sliders className="w-5 h-5 text-[#015CA9] shrink-0" />
                    <div>
                      <h3 className="font-bold text-sm text-[#003e7a]">
                        Integrated Facility Registration &amp; Modification Workflow
                      </h3>
                      <p className="text-xs text-[#5A6372]">
                        Modify legal entity credentials, campus contact points,
                        or administrator signatures using the core MedKnot registration
                        engine.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("overview")}
                    className="shrink-0"
                  >
                    Return to Overview
                  </Button>
                </div>

                {/* Integrated RegisterFacilityView */}
                <div className="rounded-2xl border border-[#C5D2C0] overflow-hidden bg-white shadow-[0_3px_10px_rgba(31,43,70,0.10)]">
                  <RegisterFacilityView initialUser={user} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
      </main>
    </div>
  );
}
