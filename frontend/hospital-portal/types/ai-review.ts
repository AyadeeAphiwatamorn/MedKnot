import { DocumentType } from "@/types/medical-records";

export type AIReviewStatus =
  | "pending-review"
  | "partially-reviewed"
  | "approved"
  | "rejected";

export interface ExtractedAIParameter {
  id: string;
  name: string;
  rawValue: string;
  cleanedValue: string;
  unit: string;
  referenceRange: string;
  confidence: number;
  status: "draft" | "approved" | "modified" | "rejected";
  sourceRef: string;
  flag: "normal" | "high" | "low" | "critical";
  reviewedBy?: string;
  originalValue?: string;
}

export interface ClinicalObservation {
  id: string;
  text: string;
  category: "alert" | "insight" | "trend" | "history";
  sourceRef: string;
  highlightParamId?: string;
}

export interface AbnormalFlag {
  parameter: string;
  value: string;
  ref: string;
  severity: "high" | "critical" | "warning";
  clinicalSignificance: string;
}

export interface PatientHistoryLink {
  id: string;
  date: string;
  label: string;
  trend: string;
  comparison?: string;
}

export interface PreConsultationSummary {
  headline: string;
  keyObservations: ClinicalObservation[];
  abnormalFlags: AbnormalFlag[];
  patientHistoryLinks: PatientHistoryLink[];
  draftImpression: string;
}

export interface DocumentPreviewRow {
  investigation: string;
  result: string;
  unit: string;
  refRange: string;
  isAbnormal?: boolean;
  lineRef: string;
}

export interface DocumentPreviewData {
  headerTitle: string;
  labName: string;
  accreditation: string;
  specimenId: string;
  collectionTime: string;
  reportingTime: string;
  clinicalSections: {
    sectionName: string;
    rows: DocumentPreviewRow[];
  }[];
}

export interface AIReviewItem {
  id: string;
  documentId: string;
  documentTitle: string;
  documentType: DocumentType;
  patientName: string;
  patientId: string;
  patientAge: number;
  patientGender: "Female" | "Male" | "Other";
  uploadDate: string;
  status: AIReviewStatus;
  ocrModel: string;
  overallConfidence: number;
  processingTime: string;
  extractedParameters: ExtractedAIParameter[];
  preConsultationSummary: PreConsultationSummary;
  documentPreviewData: DocumentPreviewData;
  reviewNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}
