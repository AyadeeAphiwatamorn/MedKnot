/**
 * Appointment Management Module — TypeScript Definitions
 *
 * Supports dual facility appointment workflows:
 * - Workflow A: Facility-managed assignment (staff reviews request, assigns department/doctor/slot, confirms)
 * - Workflow B: Patient-selected doctor & slot (patient selects doctor/slot, staff verifies and confirms)
 */

export type AppointmentStatus =
  | "Requested"
  | "Under Review"
  | "Confirmed"
  | "Awaiting Patient Response"
  | "Reschedule Requested"
  | "Cancelled"
  | "Completed"
  | "No Show";

export type AppointmentWorkflowType = "facility_assigned" | "patient_selected";

export type AppointmentType =
  | "New Consultation"
  | "Follow-up"
  | "Routine Checkup"
  | "Specialist Review"
  | "Emergency OPD";

export type AppointmentSource =
  | "Patient Mobile App"
  | "Hospital Web Portal"
  | "Front Desk OPD Kiosk"
  | "Doctor Referral"
  | "Phone Booking Desk";

export type AppointmentTimelineEventType =
  | "requested"
  | "under_review"
  | "doctor_assigned"
  | "confirmed"
  | "rescheduled"
  | "cancelled"
  | "completed"
  | "info_requested"
  | "no_show";

export interface AppointmentTimelineEvent {
  id: string;
  timestamp: string;
  date: string;
  eventType: AppointmentTimelineEventType;
  title: string;
  description: string;
  actor: string;
}

export interface Appointment {
  id: string; // e.g. "APT-2024-001"
  facilityPatientId: string; // FK to facility patient record e.g. "MK-PT-2024-00101"
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;

  // Doctor & Department
  doctorId: string; // e.g. "DOC-101" or empty if unassigned
  doctorName: string; // e.g. "Dr. Chen Wei"
  department: string; // e.g. "Internal Medicine"
  facilityId: string;
  facilityName: string;

  // Scheduling
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:30 AM"
  durationMinutes: number; // e.g. 30

  // Clinical & Metadata
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  workflow: AppointmentWorkflowType;
  source: AppointmentSource;
  reasonForVisit: string;
  patientNotes?: string;
  staffNotes?: string;
  requestSubmissionDate: string;
  cancellationReason?: string;

  // Audit Timeline
  timeline: AppointmentTimelineEvent[];
}

export interface CreateAppointmentInput {
  facilityPatientId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;

  department: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string;
  timeSlot: string;
  appointmentType: AppointmentType;
  reasonForVisit: string;
  patientNotes?: string;
  staffNotes?: string;
  source?: AppointmentSource;
}

export interface AppointmentStats {
  totalToday: number;
  pendingRequests: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
}
