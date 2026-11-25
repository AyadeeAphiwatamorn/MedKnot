/**
 * Patient Management Module — TypeScript Definitions
 *
 * Implements conceptual separation between:
 * - Patient: Platform-level patient identity.
 * - FacilityPatient: Facility-specific patient registration, record, and clinical relationship.
 */

export type PatientStatus = "Active" | "Pending" | "Inactive";
export type PatientGender = "Male" | "Female" | "Other";
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | "Unknown";

export type AppointmentStatus = "Scheduled" | "Completed" | "In-Consultation" | "Cancelled";
export type AppointmentType = "New Consultation" | "Follow-up" | "Routine Checkup" | "Specialist Review" | "Emergency OPD";

export type DocumentReviewStatus =
  | "Uploaded"
  | "AI Processing"
  | "Awaiting Review"
  | "Staff Reviewed"
  | "Clinician Verified";

export type DocumentType =
  | "Lab Report"
  | "Discharge Summary"
  | "Prescription"
  | "Radiology / Scan"
  | "Referral Letter"
  | "Insurance Card";

export type TimelineEventType =
  | "registration"
  | "appointment_scheduled"
  | "check_in"
  | "consultation"
  | "document_uploaded"
  | "document_reviewed"
  | "follow_up";

/**
 * Platform-level Patient Identity
 */
export interface Patient {
  id: string; // Global platform ID e.g. "PT-GLOBAL-89402"
  firstName: string;
  lastName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: PatientGender;
  bloodGroup?: BloodGroup;
  photoUrl?: string | null;
  nationalIdMasked?: string;
}

/**
 * Facility-specific Patient Registration
 */
export interface FacilityPatient {
  facilityPatientId: string; // Facility ID e.g. "MK-PT-2024-00101"
  patientId: string; // FK to Patient.id
  facilityId: string; // e.g. "FAC-STJUDE-NORTH"
  facilityName: string; // "St. Jude Medical Center (Campus North)"
  status: PatientStatus;
  registrationDate: string; // YYYY-MM-DD
  lastVisit?: string | null;

  // Contact
  phoneNumber: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;

  // Clinical profile tags
  primaryDepartment?: string;
  primaryDoctor?: string;
  knownAllergies?: string[];
  medicalConditions?: string[];
  registrationNotes?: string;
}

/**
 * Patient Appointment Record
 */
export interface PatientAppointment {
  id: string;
  facilityPatientId: string;
  appointmentDate: string; // YYYY-MM-DD
  time: string; // e.g. "09:30 AM"
  doctorName: string;
  department: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  notes?: string;
}

/**
 * Patient Clinical Visit History
 */
export interface PatientVisit {
  id: string;
  facilityPatientId: string;
  visitDate: string;
  attendingDoctor: string;
  department: string;
  visitStatus: "Completed" | "Discharged" | "Admitted";
  visitSummary: string;
  vitals?: {
    bloodPressure?: string;
    heartRate?: string;
    temperature?: string;
    spO2?: string;
  };
}

/**
 * Patient Medical Document
 */
export interface PatientDocument {
  id: string;
  facilityPatientId: string;
  documentName: string;
  documentType: DocumentType;
  uploadedDate: string;
  uploadedBy: string;
  fileSize: string;
  reviewStatus: DocumentReviewStatus;
  isAiExtracted?: boolean;
  notes?: string;
}

/**
 * Patient Health Timeline Event
 */
export interface PatientTimelineEvent {
  id: string;
  facilityPatientId: string;
  timestamp: string;
  date: string;
  eventType: TimelineEventType;
  title: string;
  description: string;
  actor: string;
  icon: string;
}

/**
 * Aggregated Patient View for Details Workspace
 */
export interface PatientDetailViewData {
  patient: Patient;
  facilityRecord: FacilityPatient;
  appointments: PatientAppointment[];
  visits: PatientVisit[];
  documents: PatientDocument[];
  timeline: PatientTimelineEvent[];
  stats: {
    totalAppointments: number;
    completedVisits: number;
    upcomingAppointments: number;
    lastVisit: string;
  };
}

/**
 * Patient Registration Form Payload
 */
export interface CreatePatientInput {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: PatientGender;
  bloodGroup?: BloodGroup;
  photoUrl?: string | null;

  phoneNumber: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;

  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;

  knownAllergies?: string;
  medicalConditions?: string;
  registrationNotes?: string;
}

/**
 * Summary Statistics for Directory Dashboard
 */
export interface PatientDirectoryStats {
  totalPatients: number;
  activePatients: number;
  pendingRegistrations: number;
  newThisMonth: number;
}
