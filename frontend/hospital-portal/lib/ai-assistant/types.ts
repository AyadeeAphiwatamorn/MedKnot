import type { MedicalDocument } from "@/types/medical-records";
import type { AIReviewItem } from "@/types/ai-review";
import type { PatientDetailViewData, FacilityPatient, Patient } from "@/lib/patients/types";
import type { Appointment } from "@/lib/appointments/types";
import type { QueueEntry } from "@/lib/queue/types";
import type { Doctor, Department, FacilitySettings } from "@/types/clinical";
import type { StaffMember, StaffTask } from "@/types/operations";

export type PageModuleId =
  | "dashboard"
  | "patients"
  | "patient-new"
  | "patient-detail"
  | "appointments"
  | "appointment-requests"
  | "appointment-calendar"
  | "appointment-new"
  | "appointment-detail"
  | "queue"
  | "queue-board"
  | "queue-history"
  | "queue-detail"
  | "staff"
  | "tasks"
  | "doctors"
  | "departments"
  | "documents"
  | "document-detail"
  | "ai-review"
  | "facility-settings"
  | "settings"
  | "reports"
  | "profile";

export type AssistantEntityType =
  | "facility-dashboard"
  | "patient"
  | "appointment"
  | "queue-entry"
  | "staff"
  | "staff-task"
  | "doctor"
  | "department"
  | "medical-document"
  | "ai-review-job"
  | "facility-settings"
  | "operational-report"
  | "user-profile";

export interface PageContext {
  pageId: PageModuleId;
  pageName: string;
  route: string;
  entityType: AssistantEntityType;
  entityId?: string;
  welcomeMessage: string;
  suggestedPrompts: string[];
  followUpPrompts: string[];
  availableActions: string[];
  isClinicalRecordContext?: boolean;
}

export interface LoadedAuthorizedContext {
  pageId: PageModuleId;
  route: string;
  facilityId: string;
  facilityName: string;
  campusId: string;
  campusName: string;
  userName: string;
  userRole: string;
  isAuthorized: boolean;
  unavailableReason?: string;
  patientDetail?: PatientDetailViewData | null;
  patientsList?: { facilityRecord: FacilityPatient; patient: Patient; age: number }[];
  appointmentDetail?: Appointment | null;
  appointmentsList?: Appointment[];
  queueDetail?: QueueEntry | null;
  queueList?: QueueEntry[];
  documentDetail?: MedicalDocument | null;
  documentsList?: MedicalDocument[];
  aiReviewItems?: AIReviewItem[];
  doctors?: Doctor[];
  departments?: Department[];
  staffMembers?: StaffMember[];
  staffTasks?: StaffTask[];
  facilitySettings?: FacilitySettings | null;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  hasClinicalDisclaimer?: boolean;
  isDraftNotice?: boolean;
  isRefusal?: boolean;
  isError?: boolean;
  modeLabel?: string;
}

export interface AIConversationState {
  id: string;
  contextKey: string;
  entityScopeKey: string;
  campusId: string;
  messages: AIMessage[];
  startedAt: string;
}
