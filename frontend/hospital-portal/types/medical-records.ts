export type ReviewStatus =
  | "patient-reported"
  | "ai-draft"
  | "staff-reviewed"
  | "clinician-verified";

export type DocumentType =
  | "typed-lab-report"
  | "printed-registration-form"
  | "prescription-record"
  | "discharge-summary"
  | "imaging-report";

export interface ExtractedField {
  id: string;
  fieldName: string;
  rawValue: string;
  cleanedValue: string;
  referenceRange?: string;
  unit?: string;
  confidenceScore: number;
  status: ReviewStatus;
  source: "ocr-extracted" | "patient-reported" | "staff-entered" | "clinician-entered";
  flag?: "normal" | "high" | "low" | "critical";
}

export interface PatientInfo {
  id: string;
  name: string;
  age: number;
  gender: "Female" | "Male" | "Other";
  bloodGroup: string;
  phone: string;
  emergencyContact: string;
  allergies: string[];
  chronicConditions: string[];
  patientReportedSymptoms: string[];
}

export interface MedicalHistoryItem {
  id: string;
  date: string;
  type: "encounter" | "lab-test" | "prescription" | "admission" | "imaging";
  title: string;
  doctorName: string;
  departmentName: string;
  summary: string;
  status: ReviewStatus;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
}

export interface MedicalDocument {
  id: string;
  title: string;
  type: DocumentType;
  typeLabel: string;
  patientId: string;
  patientName: string;
  patient: PatientInfo;
  facilityId: string;
  facilityName: string;
  departmentId: string;
  departmentName: string;
  attendingDoctorName: string;
  uploadDate: string;
  uploadedBy: string;
  fileUrl: string;
  fileType: "application/pdf" | "image/png" | "image/jpeg";
  fileSize: string;
  reviewStatus: ReviewStatus;
  confidenceOverall: number;
  extractedFields: ExtractedField[];
  patientReportedData: {
    symptoms: string[];
    intakeNotes: string;
    reportedOn: string;
  };
  aiExtractedData: {
    summary: string;
    detectedImpression: string;
    ocrModel: string;
    processedAt: string;
  };
  staffReview: {
    reviewedBy?: string;
    reviewedAt?: string;
    notes?: string;
    isApproved: boolean;
  };
  clinicianVerification: {
    verifiedByDoctor?: string;
    verifiedAt?: string;
    clinicalNotes?: string;
    isVerified: boolean;
    prescriptionIssued?: string;
  };
  medicalHistory: MedicalHistoryItem[];
  auditEvents: AuditEvent[];
}
