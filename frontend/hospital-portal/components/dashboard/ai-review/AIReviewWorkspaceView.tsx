"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserSession,
  DEFAULT_ADMIN,
  clearClientSession,
} from "@/lib/auth";
import { INITIAL_AI_REVIEW_ITEMS } from "@/lib/ai-review-data";
import {
  AIReviewItem,
  ExtractedAIParameter,
  AIReviewStatus,
} from "@/types/ai-review";
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
  Sparkles,
  AlertTriangle,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Edit3,
  Check,
  X,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Stethoscope,
  Activity,
  History,
  Info,
  Clock,
  ShieldAlert,
  Sliders,
  User,
  Building2,
  FileCheck,
} from "lucide-react";

interface AIReviewWorkspaceViewProps {
  initialUser?: UserSession;
}

export default function AIReviewWorkspaceView({
  initialUser,
}: AIReviewWorkspaceViewProps) {
  const router = useRouter();
  const user: UserSession = initialUser || DEFAULT_ADMIN;

  const handleSignOut = () => {
    clearClientSession();
    router.push("/login");
  };

  // State
  const [reviewItems, setReviewItems] = useState<AIReviewItem[]>(
    INITIAL_AI_REVIEW_ITEMS
  );
  const [selectedItemId, setSelectedItemId] = useState<string>(
    INITIAL_AI_REVIEW_ITEMS[0].id
  );
  const [activeTab, setActiveTab] = useState<"fields" | "summary">("fields");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [highlightedSourceRef, setHighlightedSourceRef] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Field Modal
  const [editingField, setEditingField] = useState<ExtractedAIParameter | null>(
    null
  );
  const [editFieldValue, setEditFieldValue] = useState<string>("");

  // Add Field Modal
  const [isAddFieldOpen, setIsAddFieldOpen] = useState<boolean>(false);
  const [newFieldName, setNewFieldName] = useState<string>("");
  const [newFieldValue, setNewFieldValue] = useState<string>("");
  const [newFieldUnit, setNewFieldUnit] = useState<string>("");
  const [newFieldRefRange, setNewFieldRefRange] = useState<string>("");

  // Sign-off Modal
  const [isSignOffOpen, setIsSignOffOpen] = useState<boolean>(false);
  const [signOffNotes, setSignOffNotes] = useState<string>(
    "Verified all extracted diagnostic parameters against source laboratory document. Findings correlated with patient clinical presentation."
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Selected Item
  const activeItem = useMemo(() => {
    return (
      reviewItems.find((item) => item.id === selectedItemId) || reviewItems[0]
    );
  }, [reviewItems, selectedItemId]);

  // Filtered Review Queue
  const filteredQueue = useMemo(() => {
    return reviewItems.filter((item) => {
      const matchSearch =
        item.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [reviewItems, searchQuery, statusFilter]);

  // Quick stats
  const stats = useMemo(() => {
    const total = reviewItems.length;
    const pending = reviewItems.filter((i) => i.status === "pending-review").length;
    const approved = reviewItems.filter((i) => i.status === "approved").length;
    return { total, pending, approved };
  }, [reviewItems]);

  // Handle Approve Single Field
  const handleToggleFieldApproval = (fieldId: string) => {
    setReviewItems((prev) =>
      prev.map((item) => {
        if (item.id !== activeItem.id) return item;
        return {
          ...item,
          extractedParameters: item.extractedParameters.map((param) => {
            if (param.id !== fieldId) return param;
            const newStatus = param.status === "approved" ? "draft" : "approved";
            return {
              ...param,
              status: newStatus,
              reviewedBy: newStatus === "approved" ? user.name : undefined,
            };
          }),
        };
      })
    );
    showToast("Updated field verification status");
  };

  // Handle Save Field Edit
  const handleSaveFieldEdit = () => {
    if (!editingField) return;

    setReviewItems((prev) =>
      prev.map((item) => {
        if (item.id !== activeItem.id) return item;
        return {
          ...item,
          extractedParameters: item.extractedParameters.map((param) => {
            if (param.id !== editingField.id) return param;
            return {
              ...param,
              cleanedValue: editFieldValue,
              rawValue: `${editFieldValue} ${param.unit}`.trim(),
              status: "modified",
              originalValue: param.originalValue || param.cleanedValue,
              reviewedBy: `${user.name} (Corrected)`,
            };
          }),
        };
      })
    );

    showToast(`Corrected value for ${editingField.name}`);
    setEditingField(null);
  };

  // Handle Add Missing Field
  const handleAddMissingField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim() || !newFieldValue.trim()) return;

    const newParam: ExtractedAIParameter = {
      id: `param-manual-${Date.now()}`,
      name: newFieldName.trim(),
      rawValue: `${newFieldValue.trim()} ${newFieldUnit.trim()}`.trim(),
      cleanedValue: newFieldValue.trim(),
      unit: newFieldUnit.trim() || "—",
      referenceRange: newFieldRefRange.trim() || "Standard Reference",
      confidence: 1.0,
      status: "modified",
      sourceRef: "Manual Clinical Addition",
      flag: "normal",
      reviewedBy: `${user.name} (Manual)`,
    };

    setReviewItems((prev) =>
      prev.map((item) => {
        if (item.id !== activeItem.id) return item;
        return {
          ...item,
          extractedParameters: [...item.extractedParameters, newParam],
        };
      })
    );

    setIsAddFieldOpen(false);
    setNewFieldName("");
    setNewFieldValue("");
    setNewFieldUnit("");
    setNewFieldRefRange("");
    showToast(`Added parameter "${newParam.name}" to review`);
  };

  // Handle Approve All Fields
  const handleApproveAllFields = () => {
    setReviewItems((prev) =>
      prev.map((item) => {
        if (item.id !== activeItem.id) return item;
        return {
          ...item,
          extractedParameters: item.extractedParameters.map((param) => ({
            ...param,
            status: "approved",
            reviewedBy: user.name,
          })),
        };
      })
    );
    showToast(`Approved all ${activeItem.extractedParameters.length} extracted parameters`);
  };

  // Complete Final Verification
  const handleCompleteSignOff = () => {
    setReviewItems((prev) =>
      prev.map((item) => {
        if (item.id !== activeItem.id) return item;
        return {
          ...item,
          status: "approved",
          verifiedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          verifiedBy: user.name,
          reviewNotes: signOffNotes,
          extractedParameters: item.extractedParameters.map((param) => ({
            ...param,
            status: "approved",
            reviewedBy: user.name,
          })),
        };
      })
    );

    setIsSignOffOpen(false);
    showToast(`Completed human verification for ${activeItem.documentTitle}`);
  };

  // Status Badge
  const getJobStatusBadge = (status: AIReviewStatus) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80]">
            <CheckCircle2 className="w-3 h-3 text-[#526524]" />
            Verified &amp; Approved
          </span>
        );
      case "partially-reviewed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E1F2FD] text-[#015CA9] border border-[#bce0fb]">
            <ShieldCheck className="w-3 h-3 text-[#015CA9]" />
            In Review
          </span>
        );
      case "pending-review":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FAE193] text-[#5e4300] border border-[#eed072]">
            <Sparkles className="w-3 h-3 text-[#946200]" />
            Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] border border-[#f5b8b2]">
            <X className="w-3 h-3" />
            Rejected
          </span>
        );
    }
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
                  <X className="w-4 h-4" />
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
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <span className="text-[#5A6372] whitespace-nowrap">
                  Clinical &amp; Care
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-[#727783] shrink-0" />
                <span className="text-[#015CA9] font-semibold whitespace-nowrap">
                  AI Medical Review Workspace
                </span>
              </nav>

              {/* Title & Action Row */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-xs">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-space-md flex-wrap">
                    <h1 className="font-headline-lg text-headline-lg text-[#015CA9] tracking-tight font-bold truncate">
                      AI Medical Assistance &amp; Draft Review
                    </h1>
                    <Badge variant="avocado" className="shadow-xs">
                      Module 7 • Human-in-the-Loop OCR
                    </Badge>
                  </div>
                  <p className="font-body-md text-body-md text-[#5A6372] max-w-4xl">
                    Interactive clinical review interface for validating AI-extracted
                    laboratory parameters, comparing against original source documents,
                    and reviewing synthesized pre-consultation briefings.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {activeItem.status !== "approved" ? (
                    <Button
                      onClick={() => setIsSignOffOpen(true)}
                      className="flex items-center gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Human Sign-Off</span>
                    </Button>
                  ) : (
                    <Badge variant="success" className="px-3 py-1.5 text-xs">
                      <Check className="w-4 h-4 mr-1 text-[#287A55]" />
                      Verified by {activeItem.verifiedBy}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* ── PROMINENT CLINICAL SAFETY BANNER ──────────────────────── */}
            <div className="mb-6 p-4 rounded-2xl bg-[#FAE193]/35 border border-[#eed072] text-[#5e4300] shadow-xs flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAE193] text-[#5e4300] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-[#946200]" />
              </div>
              <div className="space-y-0.5 text-xs">
                <h4 className="font-bold text-sm text-[#4a3400] uppercase tracking-wider flex items-center gap-2">
                  <span>Clinical Safety &amp; Legal Responsibility Advisory</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAE193] font-semibold border border-[#eed072]">
                    Unverified AI Draft
                  </span>
                </h4>
                <p className="leading-relaxed text-[#5e4300]">
                  All AI-extracted fields, laboratory values, and pre-consultation
                  summaries displayed in this workspace are <strong>automated drafts</strong> generated
                  to assist healthcare staff. They <strong>do not constitute medical diagnosis, treatment plans, or prescriptions</strong>.
                  Authorized clinicians and staff must independently review and verify all data against the original
                  uploaded document on the left before recording verified records.
                </p>
              </div>
            </div>

            {/* ── DOCUMENT QUEUE SELECTOR TABS ─────────────────────────── */}
            <div className="bg-white border border-[#DDE6DA] rounded-2xl p-4 shadow-sm mb-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#015CA9]" />
                  <span className="font-bold text-sm text-[#1F2B46]">
                    Documents Awaiting Review ({filteredQueue.length} jobs)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-8 px-2.5 bg-[#F8FAF6] border border-[#DDE6DA] rounded-lg text-xs font-medium text-[#1F2B46] outline-none"
                  >
                    <option value="all">All Review Statuses</option>
                    <option value="pending-review">Pending Review</option>
                    <option value="approved">Verified &amp; Approved</option>
                  </select>
                </div>
              </div>

              {/* Queue Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {filteredQueue.map((item) => {
                  const isSelected = item.id === activeItem.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setHighlightedSourceRef(null);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? "bg-[#E1F2FD]/50 border-[#015CA9] shadow-sm ring-1 ring-[#015CA9]"
                          : "bg-[#F8FAF6] border-[#DDE6DA] hover:bg-white hover:border-[#bce0fb]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-[#1F2B46] block truncate">
                            {item.documentTitle}
                          </span>
                          <span className="text-[11px] text-[#5A6372] block truncate">
                            {item.patientName} ({item.patientId}) • {item.patientAge}y
                          </span>
                        </div>
                        {getJobStatusBadge(item.status)}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#727783] pt-1 border-t border-[#DDE6DA]/60">
                        <span className="flex items-center gap-1 font-semibold text-[#015CA9]">
                          <Sparkles className="w-3 h-3 text-[#015CA9]" />
                          {(item.overallConfidence * 100).toFixed(0)}% Confidence
                        </span>
                        <span>{item.extractedParameters.length} fields</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── SPLIT-SCREEN AI REVIEW INTERFACE ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ── LEFT PANE: ORIGINAL DOCUMENT PREVIEW (5 cols on xl) ── */}
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

                  {/* High-Fidelity Rendered Source Document */}
                  <div className="p-4 bg-[#EDF2E9] overflow-auto max-h-[720px] flex items-center justify-center">
                    <div
                      style={{
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: "top center",
                      }}
                      className="transition-transform duration-150 w-full"
                    >
                      <div className="bg-white rounded-lg shadow-lg border border-[#DDE6DA] p-6 text-xs text-[#1F2B46] relative overflow-hidden min-h-[660px]">
                        {/* Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] rotate-[-25deg]">
                          <span className="text-3xl font-black uppercase tracking-widest text-[#001b3c]">
                            MEDKNOT VERIFIED SOURCE DOCUMENT
                          </span>
                        </div>

                        {/* Letterhead */}
                        <div className="border-b-2 border-[#015CA9] pb-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#E1F2FD] border border-[#bce0fb] flex items-center justify-center p-1">
                                <Image
                                  src="/logo.png"
                                  alt="Logo"
                                  width={22}
                                  height={22}
                                  className="object-contain"
                                />
                              </div>
                              <div>
                                <h3 className="font-black text-xs text-[#015CA9] uppercase tracking-tight">
                                  {activeItem.documentPreviewData.headerTitle}
                                </h3>
                                <p className="text-[9px] text-[#5A6372]">
                                  {activeItem.documentPreviewData.labName} • {activeItem.documentPreviewData.accreditation}
                                </p>
                              </div>
                            </div>
                            <div className="text-right text-[9px] text-[#727783]">
                              <span className="font-mono font-bold text-[#015CA9] block">
                                {activeItem.documentPreviewData.specimenId}
                              </span>
                              <span>Collected: {activeItem.documentPreviewData.collectionTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* Patient Strip */}
                        <div className="p-2 bg-[#F8FAF6] border border-[#DDE6DA] rounded-lg mb-3 text-[10px] grid grid-cols-2 gap-1.5">
                          <div>
                            <span className="text-[#727783]">Patient: </span>
                            <span className="font-bold text-[#1F2B46]">
                              {activeItem.patientName} ({activeItem.patientId})
                            </span>
                          </div>
                          <div>
                            <span className="text-[#727783]">Demographics: </span>
                            <span className="font-medium text-[#1F2B46]">
                              {activeItem.patientAge}y / {activeItem.patientGender}
                            </span>
                          </div>
                        </div>

                        {/* Clinical Sections with Source Line References */}
                        <div className="space-y-4">
                          {activeItem.documentPreviewData.clinicalSections.map(
                            (section, secIdx) => (
                              <div key={secIdx} className="space-y-1.5">
                                <h5 className="font-bold text-[10.5px] text-[#015CA9] uppercase tracking-wider bg-[#F3F6F0] px-2 py-0.5 rounded">
                                  {section.sectionName}
                                </h5>

                                <table className="w-full text-left text-[10.5px] border-collapse">
                                  <thead>
                                    <tr className="border-b border-[#DDE6DA] text-[#727783] text-[9.5px]">
                                      <th className="py-1 px-1.5">Investigation</th>
                                      <th className="py-1 px-1.5">Result</th>
                                      <th className="py-1 px-1.5">Unit</th>
                                      <th className="py-1 px-1.5">Reference</th>
                                      <th className="py-1 px-1.5 text-right">Line Ref</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#F3F6F0]">
                                    {section.rows.map((row, rowIdx) => {
                                      const isHighlighted =
                                        highlightedSourceRef === row.lineRef;
                                      return (
                                        <tr
                                          key={rowIdx}
                                          className={`transition-colors ${
                                            isHighlighted
                                              ? "bg-[#DFEEA9]/50 font-bold ring-2 ring-[#015CA9] rounded"
                                              : "hover:bg-[#FAFDF8]"
                                          }`}
                                        >
                                          <td className="py-1 px-1.5 text-[#1F2B46]">
                                            {row.investigation}
                                          </td>
                                          <td className="py-1 px-1.5 font-bold">
                                            <span
                                              className={
                                                row.isAbnormal
                                                  ? "text-[#ba1a1a]"
                                                  : "text-[#1F2B46]"
                                              }
                                            >
                                              {row.result}
                                            </span>
                                          </td>
                                          <td className="py-1 px-1.5 text-[#5A6372]">
                                            {row.unit}
                                          </td>
                                          <td className="py-1 px-1.5 text-[#727783]">
                                            {row.refRange}
                                          </td>
                                          <td className="py-1 px-1.5 text-right font-mono text-[9px] text-[#015CA9]">
                                            {row.lineRef}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )
                          )}
                        </div>

                        {/* Document Footer */}
                        <div className="pt-4 mt-6 border-t border-[#DDE6DA] flex items-center justify-between text-[9px] text-[#727783]">
                          <span>Generated by Certified Laboratory Analyzer</span>
                          <span className="font-mono text-[#015CA9]">
                            OCR SHA-256 Verified
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* ── RIGHT PANE: EDITABLE AI DRAFTS & PRE-CONSULTATION SUMMARY ── */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-4">
                {/* Mode Switcher Tabs */}
                <div className="bg-white border border-[#DDE6DA] rounded-2xl p-2 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab("fields")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === "fields"
                          ? "bg-[#015CA9] text-white shadow-sm"
                          : "text-[#5A6372] hover:bg-[#F3F6F0] hover:text-[#1F2B46]"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Extracted Parameters ({activeItem.extractedParameters.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("summary")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === "summary"
                          ? "bg-[#015CA9] text-white shadow-sm"
                          : "text-[#5A6372] hover:bg-[#F3F6F0] hover:text-[#1F2B46]"
                      }`}
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>AI Pre-Consultation Summary</span>
                      <span className="w-2 h-2 rounded-full bg-[#DFEEA9]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddFieldOpen(true)}
                      className="text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#015CA9]" />
                      <span>Add Parameter</span>
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleApproveAllFields}
                      className="text-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve All</span>
                    </Button>
                  </div>
                </div>

                {/* TAB CONTENT 1: EXTRACTED DRAFT PARAMETERS */}
                {activeTab === "fields" && (
                  <div className="space-y-3">
                    {activeItem.extractedParameters.map((param) => {
                      const isApproved = param.status === "approved";
                      const isModified = param.status === "modified";
                      const isSourceHighlighted =
                        highlightedSourceRef === param.sourceRef;

                      return (
                        <Card
                          key={param.id}
                          className={`border transition-all ${
                            isSourceHighlighted
                              ? "border-[#015CA9] ring-2 ring-[#015CA9]/30 bg-[#FAFDF8]"
                              : isApproved
                              ? "border-[#c5dd80] bg-[#FAFDF8]"
                              : "border-[#DDE6DA] bg-white hover:border-[#bce0fb]"
                          }`}
                        >
                          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                            {/* Left: Parameter name and values */}
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-sm text-[#1F2B46] truncate">
                                  {param.name}
                                </h4>
                                {param.flag === "high" && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a]">
                                    HIGH
                                  </span>
                                )}
                                {param.flag === "low" && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a]">
                                    LOW
                                  </span>
                                )}
                                {isModified && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAE193] text-[#5e4300] border border-[#eed072]">
                                    Corrected by Reviewer
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-xs text-[#727783]">Value:</span>
                                  <span className="text-base font-bold text-[#015CA9]">
                                    {param.cleanedValue}
                                  </span>
                                  <span className="text-xs text-[#5A6372] font-semibold">
                                    {param.unit}
                                  </span>
                                </div>
                                <span className="text-[#DDE6DA]">|</span>
                                <span className="text-[#5A6372]">
                                  Ref Range:{" "}
                                  <strong className="text-[#1F2B46]">
                                    {param.referenceRange}
                                  </strong>
                                </span>
                              </div>

                              {/* Source Reference Chip */}
                              <div className="flex items-center gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setHighlightedSourceRef(
                                      highlightedSourceRef === param.sourceRef
                                        ? null
                                        : param.sourceRef
                                    )
                                  }
                                  className={`text-[10.5px] px-2 py-0.5 rounded-md font-mono transition-colors flex items-center gap-1 cursor-pointer ${
                                    isSourceHighlighted
                                      ? "bg-[#015CA9] text-white"
                                      : "bg-[#E1F2FD] text-[#015CA9] hover:bg-[#cbe7fb]"
                                  }`}
                                  title="Click to highlight source location in document preview"
                                >
                                  <span>{param.sourceRef}</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                                <span className="text-[10.5px] text-[#727783]">
                                  Confidence:{" "}
                                  <strong>{(param.confidence * 100).toFixed(0)}%</strong>
                                </span>
                              </div>
                            </div>

                            {/* Right: Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingField(param);
                                  setEditFieldValue(param.cleanedValue);
                                }}
                                className="text-xs"
                              >
                                <Edit3 className="w-3 h-3 mr-1 text-[#015CA9]" />
                                Edit Value
                              </Button>

                              <button
                                type="button"
                                onClick={() => handleToggleFieldApproval(param.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  isApproved
                                    ? "bg-[#DFEEA9] text-[#2d3a08] border border-[#c5dd80] shadow-xs"
                                    : "bg-[#F3F6F0] text-[#5A6372] border border-[#DDE6DA] hover:bg-[#E1F2FD] hover:text-[#015CA9]"
                                }`}
                              >
                                {isApproved ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-[#526524]" />
                                    <span>Approved</span>
                                  </>
                                ) : (
                                  <span>Approve Field</span>
                                )}
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* TAB CONTENT 2: AI PRE-CONSULTATION SUMMARY */}
                {activeTab === "summary" && (
                  <div className="space-y-4">
                    {/* Clinical Synthesis Headline Card */}
                    <Card className="bg-white border-[#DDE6DA] shadow-sm">
                      <CardHeader className="p-5 pb-3 border-b border-[#F3F6F0] bg-[#FAFDF8]">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-[#015CA9]" />
                          <CardTitle className="text-sm">
                            Physician Pre-Consultation Synthesis
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-5 space-y-3 text-xs leading-relaxed">
                        <div className="p-3.5 rounded-xl bg-[#E1F2FD]/50 border border-[#bce0fb] text-[#003e7a] font-medium text-sm">
                          {activeItem.preConsultationSummary.headline}
                        </div>

                        {/* Key Observations list */}
                        <div className="space-y-2 pt-2">
                          <span className="font-bold text-[#1F2B46] uppercase tracking-wider text-[11px] block">
                            Key Clinical Observations &amp; Source Citations:
                          </span>
                          <div className="space-y-2">
                            {activeItem.preConsultationSummary.keyObservations.map(
                              (obs) => (
                                <div
                                  key={obs.id}
                                  className="p-3 rounded-xl border border-[#DDE6DA] bg-[#F8FAF6] flex items-start justify-between gap-3"
                                >
                                  <div className="space-y-1">
                                    <p className="text-[#1F2B46] font-medium">
                                      {obs.text}
                                    </p>
                                    <span className="text-[10px] text-[#727783] block">
                                      Source: {obs.sourceRef}
                                    </span>
                                  </div>
                                  <Badge
                                    variant={
                                      obs.category === "alert"
                                        ? "warning"
                                        : obs.category === "trend"
                                        ? "secondary"
                                        : "avocado"
                                    }
                                  >
                                    {obs.category}
                                  </Badge>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Abnormal Flags Grid */}
                        <div className="space-y-2 pt-2">
                          <span className="font-bold text-[#1F2B46] uppercase tracking-wider text-[11px] block">
                            Abnormal Value Alerts &amp; Clinical Significance:
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activeItem.preConsultationSummary.abnormalFlags.map(
                              (flag, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-xl border border-[#f5b8b2] bg-[#ffdad6]/25 space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#ba1a1a]">
                                      {flag.parameter}: {flag.value}
                                    </span>
                                    <span className="text-[10px] font-bold text-[#727783]">
                                      Ref: {flag.ref}
                                    </span>
                                  </div>
                                  <p className="text-[#5e4300] text-[11px] leading-snug">
                                    {flag.clinicalSignificance}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Patient History Baselines */}
                        <div className="space-y-2 pt-2">
                          <span className="font-bold text-[#1F2B46] uppercase tracking-wider text-[11px] block">
                            Patient Historical Trend Comparisons:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activeItem.preConsultationSummary.patientHistoryLinks.map(
                              (hist) => (
                                <div
                                  key={hist.id}
                                  className="p-3 rounded-xl border border-[#DDE6DA] bg-white text-xs space-y-0.5"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-[#1F2B46]">
                                      {hist.label}
                                    </span>
                                    <span className="text-[10px] text-[#727783]">
                                      {hist.date}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-[#015CA9] block">
                                    {hist.trend}
                                  </span>
                                  {hist.comparison && (
                                    <p className="text-[11px] text-[#5A6372]">
                                      {hist.comparison}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        {/* Draft Impression Box */}
                        <div className="p-3.5 rounded-xl bg-[#FAFDF8] border-2 border-dashed border-[#A3C8B4] text-xs text-[#1F2B46] leading-relaxed">
                          <span className="font-bold text-[#526524] uppercase tracking-wider text-[10.5px] block mb-1">
                            AI-Drafted Clinical Assessment (Subject to Clinician Verification)
                          </span>
                          {activeItem.preConsultationSummary.draftImpression}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
      </main>

      {/* ── MODAL 1: EDIT FIELD VALUE ─────────────────────── */}
      <Dialog
        open={!!editingField}
        onOpenChange={(open) => !open && setEditingField(null)}
      >
        <DialogContent className="max-w-md">
          {editingField && (
            <div>
              <DialogHeader onClose={() => setEditingField(null)}>
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-[#015CA9]" />
                  <DialogTitle>Correct Extracted Parameter</DialogTitle>
                </div>
                <DialogDescription>
                  Modify the clinical parameter if OCR extraction was inaccurate or
                  incomplete.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2 text-xs">
                <div>
                  <span className="font-bold text-[#1F2B46] block mb-1">
                    Parameter: {editingField.name}
                  </span>
                  <span className="text-[#727783] block">
                    Source: {editingField.sourceRef} • Unit: {editingField.unit}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#1F2B46] block">
                    Corrected Value ({editingField.unit})
                  </label>
                  <Input
                    type="text"
                    value={editFieldValue}
                    onChange={(e) => setEditFieldValue(e.target.value)}
                    placeholder="Enter corrected clinical value"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditingField(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveFieldEdit}>
                  Save Correction
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── MODAL 2: ADD MISSING FIELD ───────────────────── */}
      <Dialog open={isAddFieldOpen} onOpenChange={setIsAddFieldOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader onClose={() => setIsAddFieldOpen(false)}>
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#015CA9]" />
              <DialogTitle>Add Missing Clinical Parameter</DialogTitle>
            </div>
            <DialogDescription>
              Manually add a laboratory result or questionnaire field that was not
              automatically identified by the OCR engine.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMissingField} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Parameter Name <span className="text-error">*</span>
              </label>
              <Input
                placeholder="e.g. Serum Potassium"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-[#1F2B46] block">
                  Result Value <span className="text-error">*</span>
                </label>
                <Input
                  placeholder="e.g. 4.2"
                  value={newFieldValue}
                  onChange={(e) => setNewFieldValue(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#1F2B46] block">Unit</label>
                <Input
                  placeholder="e.g. mEq/L"
                  value={newFieldUnit}
                  onChange={(e) => setNewFieldUnit(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Biological Reference Range
              </label>
              <Input
                placeholder="e.g. 3.5 - 5.0 mEq/L"
                value={newFieldRefRange}
                onChange={(e) => setNewFieldRefRange(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddFieldOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Parameter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL 3: FINAL CLINICIAN SIGN-OFF ─────────────── */}
      <Dialog open={isSignOffOpen} onOpenChange={setIsSignOffOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader onClose={() => setIsSignOffOpen(false)}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#015CA9]" />
              <DialogTitle>Clinician Human Verification &amp; Sign-off</DialogTitle>
            </div>
            <DialogDescription>
              Complete clinical verification for {activeItem.documentTitle} (Patient: {activeItem.patientName}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 rounded-xl bg-[#DFEEA9]/40 border border-[#c5dd80] text-[#2d3a08] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#526524]" />
              <span>
                By completing sign-off, all verified values transition from <strong>AI-Extracted Draft</strong> to{" "}
                <strong>Clinician-Verified Record</strong> in MedKnot EHR.
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#1F2B46] block">
                Clinical Attestation Notes
              </label>
              <textarea
                rows={3}
                value={signOffNotes}
                onChange={(e) => setSignOffNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF6] border border-[#DDE6DA] rounded-xl text-xs text-[#1F2B46] focus:ring-2 focus:ring-[#015CA9] outline-none"
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
            <Button onClick={handleCompleteSignOff}>
              Certify &amp; Complete Sign-off
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
