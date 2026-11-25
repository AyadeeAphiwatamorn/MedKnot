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
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import {
  MedicalDocument,
  ReviewStatus,
  ExtractedField,
} from "@/types/medical-records";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FileText,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Clock,
  Download,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertTriangle,
  FileCheck,
  Stethoscope,
  Activity,
  History,
  Lock,
  Printer,
  Calendar,
  Building2,
  User,
  Phone,
  ShieldAlert,
  Edit3,
  X,
  FileSpreadsheet,
  Check,
  ExternalLink,
} from "lucide-react";

interface DocumentDetailViewProps {
  initialDocument: MedicalDocument;
  initialUser?: UserSession;
}

export default function DocumentDetailView({
  initialDocument,
  initialUser,
}: DocumentDetailViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // State
  const [doc, setDoc] = useState<MedicalDocument>(initialDocument);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isAuditsOpen, setIsAuditsOpen] = useState<boolean>(false);
  const [isSignOffOpen, setIsSignOffOpen] = useState<boolean>(false);
  const [isStaffReviewOpen, setIsStaffReviewOpen] = useState<boolean>(false);

  // Sign-off form
  const [clinicianNotes, setClinicianNotes] = useState(
    doc.clinicianVerification.clinicalNotes ||
      "Verified clinical laboratory values. Treatment plan initiated according to hospital clinical guidelines."
  );
  const [rxIssued, setRxIssued] = useState(
    doc.clinicianVerification.prescriptionIssued || "Routine follow-up advised."
  );

  // Staff Review form
  const [staffNotes, setStaffNotes] = useState(
    doc.staffReview.notes ||
      "Specimen integrity and patient national identifier verified by nursing triage."
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Status Badge Component
  const getReviewStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case "clinician-verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80] shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#526524]" />
            Clinician-Verified
          </span>
        );
      case "staff-reviewed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E1F2FD] text-[#015CA9] border border-[#bce0fb] shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#015CA9]" />
            Staff-Reviewed
          </span>
        );
      case "ai-draft":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAE193] text-[#5e4300] border border-[#eed072] shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#946200]" />
            AI-Extracted Draft (Unverified)
          </span>
        );
      case "patient-reported":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3F6F0] text-[#5A6372] border border-[#DDE6DA] shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#727783]" />
            Patient-Reported Intake
          </span>
        );
    }
  };

  // Complete Clinician Sign-off
  const handleCompleteClinicianSignOff = () => {
    const updated: MedicalDocument = {
      ...doc,
      reviewStatus: "clinician-verified",
      clinicianVerification: {
        isVerified: true,
        verifiedByDoctor: user.name,
        verifiedAt: new Date().toLocaleString(),
        clinicalNotes: clinicianNotes,
        prescriptionIssued: rxIssued,
      },
      auditEvents: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          user: user.name,
          role: user.role,
          action: "Completed Clinician Verification & signed off extracted records",
        },
        ...doc.auditEvents,
      ],
    };

    setDoc(updated);
    setIsSignOffOpen(false);
    showToast(`Signed off and verified "${doc.title}" as Clinician`);
  };

  // Complete Staff Review
  const handleCompleteStaffReview = () => {
    const updated: MedicalDocument = {
      ...doc,
      reviewStatus:
        doc.reviewStatus === "clinician-verified"
          ? "clinician-verified"
          : "staff-reviewed",
      staffReview: {
        isApproved: true,
        reviewedBy: `${user.name} (${user.role})`,
        reviewedAt: new Date().toLocaleString(),
        notes: staffNotes,
      },
      auditEvents: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          user: user.name,
          role: user.role,
          action: "Completed Staff Review and verified patient specimen data",
        },
        ...doc.auditEvents,
      ],
    };

    setDoc(updated);
    setIsStaffReviewOpen(false);
    showToast(`Approved Staff Review for "${doc.title}"`);
  };

  return (
    <div className="dashboard-theme font-body-md text-body-md text-[#1F2B46] min-h-screen antialiased bg-[#EDF2E9]">
      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <DashboardSidebar
        user={user}
        activeNav="medical-records"
        onSignOut={handleSignOut}
      />

      {/* ── TOP HEADER & MAIN VIEWPORT ────────────────────── */}
      <div className="pl-72">
        <DashboardHeader user={user} />

        <main className="relative pt-16 bg-[#EDF2E9] min-h-screen w-full px-8 pb-16">
          <div className="flex flex-col w-full max-w-[1700px] mx-auto">
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
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Breadcrumb & Navigation Header */}
            <div className="w-full py-space-lg flex flex-col gap-space-sm">
              <div className="flex items-center justify-between gap-4 flex-wrap">
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
                  <Link
                    href="/dashboard/documents"
                    className="hover:text-[#015CA9] transition-colors"
                  >
                    Medical Records
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                  <span className="text-[#015CA9] font-semibold truncate max-w-xs">
                    {doc.id}
                  </span>
                </nav>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAuditsOpen(true)}
                    className="text-xs flex items-center gap-1.5"
                  >
                    <History className="w-3.5 h-3.5 text-[#015CA9]" />
                    <span>Audit Trail ({doc.auditEvents.length})</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      showToast(
                        "Generated short-lived authorized signed URL (valid for 15 minutes)"
                      )
                    }
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-[#015CA9]" />
                    <span>Download Original</span>
                  </Button>
                </div>
              </div>

              {/* Document Title Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#015CA9] tracking-tight font-bold truncate">
                      {doc.title}
                    </h1>
                    {getReviewStatusBadge(doc.reviewStatus)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#5A6372] flex-wrap">
                    <span className="font-semibold text-[#1F2B46]">
                      Document ID: {doc.id}
                    </span>
                    <span>•</span>
                    <span>{doc.typeLabel}</span>
                    <span>•</span>
                    <span>Uploaded: {doc.uploadDate}</span>
                    <span>•</span>
                    <span>Uploaded by: {doc.uploadedBy}</span>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {doc.reviewStatus !== "clinician-verified" && (
                    <Button
                      onClick={() => setIsSignOffOpen(true)}
                      className="flex items-center gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify as Clinician</span>
                    </Button>
                  )}

                  {!doc.staffReview.isApproved && (
                    <Button
                      variant="secondary"
                      onClick={() => setIsStaffReviewOpen(true)}
                      className="flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approve Staff Review</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Main 2-Column Split: Left = Original Preview, Right = Clinical Data & Records */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ── LEFT COLUMN: ORIGINAL DOCUMENT PREVIEW (5 cols on xl, 6 on lg) ── */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-4">
                <Card className="bg-white border-[#DDE6DA] shadow-sm overflow-hidden sticky top-20">
                  <CardHeader className="p-4 border-b border-[#DDE6DA] bg-[#FAFDF8] flex flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#015CA9] shrink-0" />
                      <span className="font-bold text-sm text-[#1F2B46] truncate">
                        Original Document Preview
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                        className="p-1 text-[#5A6372] hover:text-[#1F2B46] rounded hover:bg-[#E2E8DE]"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <span className="text-[11px] font-bold text-[#5A6372] w-9 text-center">
                        {zoomLevel}%
                      </span>
                      <button
                        type="button"
                        onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
                        className="p-1 text-[#5A6372] hover:text-[#1F2B46] rounded hover:bg-[#E2E8DE]"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </CardHeader>

                  {/* Document Render Surface */}
                  <div className="p-4 bg-[#EDF2E9] overflow-auto max-h-[750px] flex items-center justify-center">
                    <div
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
                      className="transition-transform duration-150 w-full"
                    >
                      {/* Document Sheet Simulation */}
                      <div className="bg-white rounded-lg shadow-lg border border-[#DDE6DA] p-6 text-xs text-[#1F2B46] relative overflow-hidden min-h-[680px]">
                        {/* Confidential Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] rotate-[-30deg]">
                          <span className="text-4xl font-black uppercase tracking-widest text-[#001b3c]">
                            MEDKNOT VERIFIED MEDICAL RECORD
                          </span>
                        </div>

                        {/* Lab / Hospital Header */}
                        <div className="border-b-2 border-[#015CA9] pb-4 mb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#E1F2FD] border border-[#bce0fb] flex items-center justify-center p-1">
                                <Image
                                  src="/logo.png"
                                  alt="Logo"
                                  width={24}
                                  height={24}
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <h3 className="font-black text-sm text-[#015CA9] tracking-tight uppercase">
                                  St. Jude Medical Center Laboratories
                                </h3>
                                <p className="text-[10px] text-[#5A6372]">
                                  Department of Clinical Pathology &amp; Diagnostics • NABL Accredited
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-[10px] text-[#015CA9] font-bold block">
                                {doc.id}
                              </span>
                              <span className="text-[9px] text-[#727783] block">
                                BARCODE: *{doc.patientId}*
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Patient Demographics Table in Document */}
                        <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#F8FAF6] border border-[#DDE6DA] rounded-lg mb-4 text-[11px]">
                          <div>
                            <span className="text-[#727783] block">Patient Name:</span>
                            <span className="font-bold text-[#1F2B46]">
                              {doc.patientName}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#727783] block">Patient ID:</span>
                            <span className="font-mono font-bold text-[#1F2B46]">
                              {doc.patientId}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#727783] block">Age / Gender / Blood:</span>
                            <span className="font-medium text-[#1F2B46]">
                              {doc.patient.age} Yrs / {doc.patient.gender} / {doc.patient.bloodGroup}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#727783] block">Attending Physician:</span>
                            <span className="font-medium text-[#1F2B46]">
                              {doc.attendingDoctorName}
                            </span>
                          </div>
                        </div>

                        {/* Document Content Display */}
                        {doc.type === "typed-lab-report" ? (
                          <div>
                            <h4 className="font-bold text-xs text-[#015CA9] uppercase tracking-wider mb-2">
                              Diagnostic Laboratory Test Results
                            </h4>
                            <table className="w-full text-left border-collapse text-[11px] mb-4">
                              <thead>
                                <tr className="border-b border-[#DDE6DA] bg-[#FAFDF8] text-[#5A6372]">
                                  <th className="py-1.5 px-2">Investigation</th>
                                  <th className="py-1.5 px-2">Result</th>
                                  <th className="py-1.5 px-2">Unit</th>
                                  <th className="py-1.5 px-2">Biological Reference</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#F3F6F0]">
                                {doc.extractedFields.map((field) => (
                                  <tr key={field.id} className="hover:bg-[#FAFDF8]">
                                    <td className="py-1.5 px-2 font-medium text-[#1F2B46]">
                                      {field.fieldName}
                                    </td>
                                    <td className="py-1.5 px-2 font-bold">
                                      <span
                                        className={
                                          field.flag === "high" || field.flag === "critical"
                                            ? "text-[#ba1a1a]"
                                            : "text-[#1F2B46]"
                                        }
                                      >
                                        {field.rawValue}
                                        {field.flag === "high" && " (H)"}
                                        {field.flag === "low" && " (L)"}
                                      </span>
                                    </td>
                                    <td className="py-1.5 px-2 text-[#5A6372]">
                                      {field.unit || "—"}
                                    </td>
                                    <td className="py-1.5 px-2 text-[#727783]">
                                      {field.referenceRange || "Standard"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            <div className="p-2.5 rounded bg-[#FAFDF8] border border-[#DDE6DA] text-[10px] space-y-1 mb-4">
                              <span className="font-bold text-[#1F2B46] block uppercase tracking-wider">
                                Laboratory Impression &amp; Methodology:
                              </span>
                              <p className="text-[#5A6372] leading-relaxed">
                                Automated chemiluminescence and enzymatic kinetic assays performed on certified clinical analyzers.
                                Clinical correlation recommended.
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Printed Registration Form Presentation */
                          <div className="space-y-3">
                            <h4 className="font-bold text-xs text-[#015CA9] uppercase tracking-wider mb-2">
                              Outpatient Registration &amp; Triage Questionnaire
                            </h4>

                            <div className="space-y-2 border border-[#DDE6DA] p-3 rounded-lg bg-[#FAFDF8]">
                              <span className="font-bold text-[11px] text-[#1F2B46] block">
                                Chief Presenting Symptoms:
                              </span>
                              <p className="text-[11px] text-[#5A6372]">
                                {doc.patientReportedData.symptoms.join("; ")}
                              </p>
                            </div>

                            <div className="space-y-2 border border-[#DDE6DA] p-3 rounded-lg bg-[#FAFDF8]">
                              <span className="font-bold text-[11px] text-[#1F2B46] block">
                                Triage Physical Examination &amp; Notes:
                              </span>
                              <p className="text-[11px] text-[#5A6372]">
                                {doc.patientReportedData.intakeNotes}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Signatures & Accreditation Footer on Sheet */}
                        <div className="pt-6 mt-6 border-t border-[#DDE6DA] flex items-end justify-between text-[10px] text-[#727783]">
                          <div>
                            <span className="font-bold text-[#1F2B46] block">
                              Verified by Pathology Technologist
                            </span>
                            <span>Lic: MCI-NABL-LAB-44910</span>
                          </div>

                          <div className="text-right">
                            <div className="w-24 h-8 border-b border-[#015CA9] flex items-center justify-center font-serif text-[11px] text-[#015CA9] italic">
                              C. Wei, MD
                            </div>
                            <span className="font-bold text-[#1F2B46] block mt-0.5">
                              Medical Officer Sign-off
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Footer */}
                  <div className="p-3 bg-[#FAFDF8] border-t border-[#DDE6DA] flex items-center justify-between text-xs text-[#5A6372]">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#015CA9]" />
                      Original File: {doc.fileType} ({doc.fileSize})
                    </span>
                    <span className="text-[#015CA9] font-medium">Page 1 of 1</span>
                  </div>
                </Card>
              </div>

              {/* ── RIGHT COLUMN: PATIENT INFO & 4 DISTINCT RECORD LAYERS (7 cols) ── */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-6">
                {/* 1. Patient Health Info Card */}
                <Card className="bg-white border-[#DDE6DA] shadow-sm">
                  <CardHeader className="p-5 pb-3 border-b border-[#F3F6F0]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-full bg-[#E1F2FD] text-[#015CA9] flex items-center justify-center font-bold text-sm shrink-0">
                          {doc.patient.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-[#1F2B46]">
                              {doc.patient.name}
                            </h3>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#F3F6F0] text-[#015CA9] border border-[#DDE6DA]">
                              {doc.patient.id}
                            </span>
                          </div>
                          <p className="text-xs text-[#5A6372]">
                            {doc.patient.age} Yrs • {doc.patient.gender} • Blood Group:{" "}
                            <strong className="text-[#015CA9]">{doc.patient.bloodGroup}</strong>
                          </p>
                        </div>
                      </div>

                      <Badge variant="avocado">Active Patient</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA]">
                        <span className="text-[#727783] block">Patient Direct Phone</span>
                        <span className="font-semibold text-[#1F2B46] block mt-0.5">
                          {doc.patient.phone}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA]">
                        <span className="text-[#727783] block">Emergency Contact</span>
                        <span className="font-semibold text-[#1F2B46] block mt-0.5">
                          {doc.patient.emergencyContact}
                        </span>
                      </div>
                    </div>

                    {/* Allergies & Chronic Conditions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#ffdad6]/30 border border-[#f5b8b2]">
                        <span className="text-xs font-bold text-[#ba1a1a] block mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Known Drug Allergies
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {doc.patient.allergies.map((allergy) => (
                            <span
                              key={allergy}
                              className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdad6] text-[#ba1a1a]"
                            >
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#E1F2FD]/40 border border-[#bce0fb]">
                        <span className="text-xs font-bold text-[#003e7a] block mb-1 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-[#015CA9]" />
                          Chronic Medical Conditions
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {doc.patient.chronicConditions.map((cond) => (
                            <span
                              key={cond}
                              className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#E1F2FD] text-[#015CA9]"
                            >
                              {cond}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ── 4 DISTINCT RECORD STATUS LAYERS ───────────────────────── */}
                <div className="space-y-4">
                  {/* LAYER 1: PATIENT-REPORTED INFORMATION */}
                  <Card className="bg-white border-[#DDE6DA] shadow-sm">
                    <CardHeader className="p-4 border-b border-[#F3F6F0] bg-[#FAFDF8] flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#5A6372]" />
                        <CardTitle className="text-sm">
                          1. Patient-Reported Information
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        Source: Patient Intake
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2 text-xs">
                      <div>
                        <span className="font-semibold text-[#5A6372] block">
                          Patient-Reported Symptoms:
                        </span>
                        <ul className="list-disc list-inside text-[#1F2B46] mt-1 space-y-0.5">
                          {doc.patientReportedData.symptoms.map((sym, idx) => (
                            <li key={idx}>{sym}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#F8FAF6] border border-[#DDE6DA]">
                        <span className="font-semibold text-[#727783] block">
                          Intake Notes:
                        </span>
                        <p className="text-[#1F2B46] mt-0.5">
                          {doc.patientReportedData.intakeNotes}
                        </p>
                      </div>
                      <span className="text-[10px] text-[#727783] block">
                        Recorded on: {doc.patientReportedData.reportedOn}
                      </span>
                    </CardContent>
                  </Card>

                  {/* LAYER 2: AI-EXTRACTED DRAFT */}
                  <Card className="bg-white border-[#DDE6DA] shadow-sm">
                    <CardHeader className="p-4 border-b border-[#F3F6F0] bg-[#FAFDF8] flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#946200]" />
                        <CardTitle className="text-sm">
                          2. AI-Extracted Draft Records
                        </CardTitle>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#FAE193] text-[#5e4300] border border-[#eed072]">
                        <AlertTriangle className="w-3 h-3" />
                        AI Draft • Awaiting Verification
                      </span>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-xs">
                      {/* Warning notice */}
                      <div className="p-3 rounded-xl bg-[#FAE193]/30 border border-[#eed072] text-[#5e4300] flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#946200]" />
                        <span>
                          <strong>Clinical Safety Notice:</strong> AI-extracted values are
                          drafts for clinical support only. Authorized healthcare
                          professionals must independently review and verify each parameter.
                        </span>
                      </div>

                      {/* AI Summary */}
                      <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA] space-y-1">
                        <span className="font-semibold text-[#5A6372] block">
                          Automated OCR Interpretation:
                        </span>
                        <p className="text-[#1F2B46] leading-relaxed">
                          {doc.aiExtractedData.summary}
                        </p>
                        <span className="text-[10px] text-[#727783] block pt-1">
                          Processed by: {doc.aiExtractedData.ocrModel} • Confidence:{" "}
                          <strong>{(doc.confidenceOverall * 100).toFixed(0)}%</strong>
                        </span>
                      </div>

                      {/* Extracted Fields Table */}
                      <div className="border border-[#DDE6DA] rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#FAFDF8] border-b border-[#DDE6DA] text-[#5A6372] font-semibold">
                            <tr>
                              <th className="py-2 px-3">Field</th>
                              <th className="py-2 px-3">Extracted Value</th>
                              <th className="py-2 px-3">Ref Range</th>
                              <th className="py-2 px-3">Confidence</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DDE6DA]">
                            {doc.extractedFields.map((field) => (
                              <tr key={field.id} className="hover:bg-[#FAFDF8]">
                                <td className="py-2 px-3 font-medium text-[#1F2B46]">
                                  {field.fieldName}
                                </td>
                                <td className="py-2 px-3 font-bold">
                                  <span
                                    className={
                                      field.flag === "high" || field.flag === "critical"
                                        ? "text-[#ba1a1a]"
                                        : "text-[#1F2B46]"
                                    }
                                  >
                                    {field.rawValue}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-[#5A6372]">
                                  {field.referenceRange || "Standard"}
                                </td>
                                <td className="py-2 px-3">
                                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#DFEEA9] text-[#2d3a08]">
                                    {(field.confidenceScore * 100).toFixed(0)}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* LAYER 3: STAFF-REVIEWED RECORDS */}
                  <Card className="bg-white border-[#DDE6DA] shadow-sm">
                    <CardHeader className="p-4 border-b border-[#F3F6F0] bg-[#FAFDF8] flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#015CA9]" />
                        <CardTitle className="text-sm">
                          3. Staff-Reviewed Verification
                        </CardTitle>
                      </div>
                      {doc.staffReview.isApproved ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#E1F2FD] text-[#015CA9] border border-[#bce0fb]">
                          <Check className="w-3 h-3" />
                          Staff Review Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#F3F6F0] text-[#727783] border border-[#DDE6DA]">
                          Pending Staff Check
                        </span>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 space-y-2 text-xs">
                      {doc.staffReview.isApproved ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[#727783]">Reviewed By:</span>
                            <span className="font-bold text-[#1F2B46]">
                              {doc.staffReview.reviewedBy}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#727783]">Timestamp:</span>
                            <span className="text-[#5A6372]">
                              {doc.staffReview.reviewedAt}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-lg bg-[#F8FAF6] border border-[#DDE6DA]">
                            <span className="font-semibold text-[#5A6372] block">
                              Staff Observations:
                            </span>
                            <p className="text-[#1F2B46] mt-0.5">
                              {doc.staffReview.notes}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-[#727783] italic">
                            Specimen and patient ID validation pending from nursing staff.
                          </p>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsStaffReviewOpen(true)}
                          >
                            Mark Reviewed
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* LAYER 4: CLINICIAN-VERIFIED RECORDS */}
                  <Card className="bg-white border-[#DDE6DA] shadow-sm">
                    <CardHeader className="p-4 border-b border-[#F3F6F0] bg-[#FAFDF8] flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#526524]" />
                        <CardTitle className="text-sm">
                          4. Clinician-Verified Records
                        </CardTitle>
                      </div>
                      {doc.clinicianVerification.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#526524]" />
                          Clinician Certified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#FAE193] text-[#5e4300] border border-[#eed072]">
                          Awaiting Doctor Sign-off
                        </span>
                      )}
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-xs">
                      {doc.clinicianVerification.isVerified ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[#727783]">Attending Doctor:</span>
                            <span className="font-bold text-[#015CA9]">
                              {doc.clinicianVerification.verifiedByDoctor}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#727783]">Verified At:</span>
                            <span className="text-[#5A6372]">
                              {doc.clinicianVerification.verifiedAt}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA] space-y-1">
                            <span className="font-semibold text-[#5A6372] block">
                              Doctor&apos;s Verified Diagnostic Assessment:
                            </span>
                            <p className="text-[#1F2B46] leading-relaxed">
                              {doc.clinicianVerification.clinicalNotes}
                            </p>
                          </div>

                          {doc.clinicianVerification.prescriptionIssued && (
                            <div className="p-3 rounded-xl bg-[#E1F2FD]/50 border border-[#bce0fb] space-y-1">
                              <span className="font-semibold text-[#003e7a] block">
                                Prescriptions &amp; Clinical Orders:
                              </span>
                              <p className="text-[#003e7a] font-medium">
                                {doc.clinicianVerification.prescriptionIssued}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA]">
                          <div>
                            <span className="font-bold text-[#1F2B46] block">
                              Pending Doctor Sign-off
                            </span>
                            <span className="text-[11px] text-[#727783]">
                              Review the original document on the left and sign off on verified findings.
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setIsSignOffOpen(true)}
                          >
                            Verify Document
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* ── MEDICAL HISTORY TIMELINE ──────────────────────────────── */}
                <Card className="bg-white border-[#DDE6DA] shadow-sm">
                  <CardHeader className="p-5 pb-3 border-b border-[#F3F6F0]">
                    <div className="flex items-center gap-2">
                      <History className="w-5 h-5 text-[#015CA9]" />
                      <CardTitle>Medical History &amp; Encounter Timeline</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DDE6DA]">
                      {doc.medicalHistory.map((item) => (
                        <div key={item.id} className="relative">
                          {/* Timeline dot */}
                          <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#015CA9] ring-4 ring-[#E1F2FD]" />

                          <div className="p-3 rounded-xl bg-[#F8FAF6] border border-[#DDE6DA] text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-sm text-[#1F2B46]">
                                {item.title}
                              </span>
                              <span className="text-[11px] font-bold text-[#727783]">
                                {item.date}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[#5A6372]">
                              <Stethoscope className="w-3.5 h-3.5 text-[#015CA9]" />
                              <span>
                                {item.doctorName} • {item.departmentName}
                              </span>
                            </div>
                            <p className="text-[#1F2B46] pt-1 leading-relaxed">
                              {item.summary}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── MODAL 1: CLINICIAN VERIFICATION SIGN-OFF ───────── */}
      <Dialog open={isSignOffOpen} onOpenChange={setIsSignOffOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader onClose={() => setIsSignOffOpen(false)}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#015CA9]" />
              <DialogTitle>Clinician Verification &amp; Sign-off</DialogTitle>
            </div>
            <DialogDescription>
              Confirm and certify that you have reviewed the original document
              and verified all clinical diagnostic findings for {doc.patientName}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 bg-[#DFEEA9]/40 border border-[#c5dd80] rounded-xl text-[#2d3a08] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#526524]" />
              <span>
                By signing off, this document will be marked as{" "}
                <strong>Clinician-Verified</strong> in the patient&apos;s legal health
                record and recorded in the immutable audit log.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Clinician Assessment &amp; Verified Interpretation
              </label>
              <textarea
                rows={3}
                value={clinicianNotes}
                onChange={(e) => setClinicianNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-xs text-[#1F2B46] focus:ring-2 focus:ring-[#015CA9] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Prescription &amp; Orders Issued
              </label>
              <Input
                value={rxIssued}
                onChange={(e) => setRxIssued(e.target.value)}
                placeholder="e.g. Rx-2025-1029: Metformin 850mg PO BID..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSignOffOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCompleteClinicianSignOff}>
              Complete Sign-off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: STAFF REVIEW APPROVAL ─────────────────── */}
      <Dialog open={isStaffReviewOpen} onOpenChange={setIsStaffReviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader onClose={() => setIsStaffReviewOpen(false)}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#015CA9]" />
              <DialogTitle>Complete Staff Review</DialogTitle>
            </div>
            <DialogDescription>
              Validate specimen integrity, patient demographic matching, and
              administrative check-in requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Staff Review Notes
              </label>
              <textarea
                rows={3}
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-xs text-[#1F2B46] focus:ring-2 focus:ring-[#015CA9] outline-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStaffReviewOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCompleteStaffReview}>
              Approve Staff Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: AUDIT TRAIL ───────────────────────────── */}
      <Dialog open={isAuditsOpen} onOpenChange={setIsAuditsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader onClose={() => setIsAuditsOpen(false)}>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#015CA9]" />
              <DialogTitle>Document Access &amp; Change Audit Trail</DialogTitle>
            </div>
            <DialogDescription>
              Immutable traceability records for {doc.id} complying with
              healthcare privacy and HIPAA security specifications.
            </DialogDescription>
          </DialogHeader>

          <div className="border border-[#DDE6DA] rounded-xl divide-y divide-[#DDE6DA] max-h-72 overflow-y-auto text-xs">
            {doc.auditEvents.map((aud) => (
              <div key={aud.id} className="p-3 bg-white space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F2B46]">
                    {aud.user} ({aud.role})
                  </span>
                  <span className="text-[#727783] text-[11px]">
                    {aud.timestamp}
                  </span>
                </div>
                <p className="text-[#5A6372]">{aud.action}</p>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAuditsOpen(false)}>
              Close Audit Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
