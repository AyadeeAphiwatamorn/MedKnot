"use client";

import React, { createContext, useContext, useState } from "react";

export interface DocumentItem {
  file: File | null;
  name: string;
  size: number;
  uploadedAt: string;
  status: "idle" | "uploaded" | "error";
  error?: string;
}

export type HospitalApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Rejected";

export type AdminAccountStatus =
  | "Not Created"
  | "Invitation Pending"
  | "Invitation Sent"
  | "Active";

export interface RegistrationState {
  // Application & Account Status (Confirmed Business Rule)
  applicationStatus: HospitalApplicationStatus;
  adminAccountStatus: AdminAccountStatus;

  // Step 1: Facility Info
  facilityName: string;
  facilityType: string;
  registrationNumber: string;
  yearEstablished: string;
  website: string;
  overview: string;
  logoFile: File | null;
  logoPreview: string | null;

  // Step 2: Location & Contact
  country: string;
  state: string;
  city: string;
  pincode: string;
  streetAddress: string;
  contactDesk: string;
  registryEmail: string;

  // Step 2: Authorized Administrator (First Hospital Admin)
  adminName: string;
  adminDesignation: string;
  adminEmail: string;
  adminPhone: string;
  isApplicantDifferent: boolean;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;

  // Step 3: Documents
  documents: {
    registrationCert: DocumentItem;
    authorizationLetter: DocumentItem;
    accreditationDoc: DocumentItem;
    taxExemptionDoc: DocumentItem;
  };

  // Step 4: Declarations & Metadata
  declarationAgreed: boolean;
  termsAgreed: boolean;
  referenceNumber: string;
  submissionDate: string;
  lastSavedTime: string;
}

interface RegistrationContextType {
  state: RegistrationState;
  updateFacilityInfo: (updates: Partial<RegistrationState>) => void;
  updateContactAndAdmin: (updates: Partial<RegistrationState>) => void;
  uploadDocument: (docKey: keyof RegistrationState["documents"], file: File) => void;
  removeDocument: (docKey: keyof RegistrationState["documents"]) => void;
  setLogo: (file: File | null, preview: string | null) => void;
  setApplicationStatus: (status: HospitalApplicationStatus) => void;
  setAdminAccountStatus: (status: AdminAccountStatus) => void;
  saveDraft: () => string;
  submitRegistration: () => string;
}

const defaultDocuments: RegistrationState["documents"] = {
  registrationCert: {
    file: null,
    name: "MH-State-Health-License-2024.pdf",
    size: 2450000,
    uploadedAt: "Today, 10:40 AM",
    status: "uploaded",
  },
  authorizationLetter: {
    file: null,
    name: "Board-Resolution-MedKnot-Auth.pdf",
    size: 1180000,
    uploadedAt: "Today, 10:41 AM",
    status: "uploaded",
  },
  accreditationDoc: {
    file: null,
    name: "NABH-Accreditation-Level3.pdf",
    size: 3200000,
    uploadedAt: "Today, 10:41 AM",
    status: "uploaded",
  },
  taxExemptionDoc: {
    file: null,
    name: "",
    size: 0,
    uploadedAt: "",
    status: "idle",
  },
};

const initialRegistrationState: RegistrationState = {
  applicationStatus: "Draft",
  adminAccountStatus: "Not Created",
  facilityName: "St. Jude Specialty Hospital & Research Centre",
  facilityType: "Multispecialty Hospital",
  registrationNumber: "REG-MH-2024-91024",
  yearEstablished: "2014",
  website: "https://www.stjude-health.org",
  overview:
    "St. Jude Medical Center Campus North is a 350-bed tertiary multispecialty facility equipped with 14 laminar modular OTs, 60 ICU units, and Level-1 Trauma Emergency care, integrated with automated digital diagnostics.",
  logoFile: null,
  logoPreview: null,
  country: "India",
  state: "Maharashtra",
  city: "Mumbai",
  pincode: "400050",
  streetAddress: "Plot 18, Medical Knowledge Park, Western Express Highway, Bandra East",
  contactDesk: "+91 22 2840 9100",
  registryEmail: "registrations@stjude-health.org",
  adminName: "Dr. Michael Lee",
  adminDesignation: "Chief Medical Director / Head of Administration",
  adminEmail: "m.lee@stjude-health.org",
  adminPhone: "+91 98201 44882",
  isApplicantDifferent: false,
  applicantName: "",
  applicantEmail: "",
  applicantPhone: "",
  documents: defaultDocuments,
  declarationAgreed: true,
  termsAgreed: true,
  referenceNumber: "MK-HOSP-2026-8942",
  submissionDate: "",
  lastSavedTime: "10:42 AM",
};

const RegistrationContext = createContext<RegistrationContextType | null>(null);

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<RegistrationState>(() => {
    return {
      ...initialRegistrationState,
      submissionDate: "October 24, 2026",
    };
  });

  const updateFacilityInfo = (updates: Partial<RegistrationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const updateContactAndAdmin = (updates: Partial<RegistrationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const uploadDocument = (docKey: keyof RegistrationState["documents"], file: File) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setState((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: {
          file,
          name: file.name,
          size: file.size,
          uploadedAt: `Just now, ${timeStr}`,
          status: "uploaded",
        },
      },
    }));
  };

  const removeDocument = (docKey: keyof RegistrationState["documents"]) => {
    setState((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docKey]: {
          file: null,
          name: "",
          size: 0,
          uploadedAt: "",
          status: "idle",
        },
      },
    }));
  };

  const setLogo = (file: File | null, preview: string | null) => {
    setState((prev) => ({
      ...prev,
      logoFile: file,
      logoPreview: preview,
    }));
  };

  const saveDraft = (): string => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setState((prev) => ({ ...prev, lastSavedTime: timeStr }));
    return timeStr;
  };

  const setApplicationStatus = (status: HospitalApplicationStatus) => {
    setState((prev) => ({ ...prev, applicationStatus: status }));
  };

  const setAdminAccountStatus = (status: AdminAccountStatus) => {
    setState((prev) => ({ ...prev, adminAccountStatus: status }));
  };

  const submitRegistration = (): string => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ref = `MK-HOSP-2026-${randomSuffix}`;
    const now = new Date();
    const formatted = now.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    setState((prev) => ({
      ...prev,
      applicationStatus: "Submitted",
      adminAccountStatus: "Invitation Pending",
      referenceNumber: ref,
      submissionDate: formatted,
    }));
    return ref;
  };

  return (
    <RegistrationContext.Provider
      value={{
        state,
        updateFacilityInfo,
        updateContactAndAdmin,
        uploadDocument,
        removeDocument,
        setLogo,
        setApplicationStatus,
        setAdminAccountStatus,
        saveDraft,
        submitRegistration,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error("useRegistration must be used within a RegistrationProvider");
  }
  return context;
}
