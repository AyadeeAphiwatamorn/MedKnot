/**
 * Queue Management Module — TypeScript Definitions
 * 
 * Supports complete patient clinic workflow:
 * Confirmed Appointment -> Patient Check-in -> Checked In -> Waiting -> In Consultation -> Completed
 * Also supports: No Show, Cancelled.
 */

export type QueueStatus =
  | "Checked In"
  | "Waiting"
  | "In Consultation"
  | "Completed"
  | "No Show"
  | "Cancelled";

export type QueuePriority = "Standard" | "Priority" | "Urgent" | "Follow-up";

export interface QueueTimelineEvent {
  id: string;
  timestamp: string; // e.g. "09:15 AM"
  date: string; // YYYY-MM-DD
  status: QueueStatus;
  title: string;
  description: string;
  actor: string; // e.g. "Priya Sharma (Receptionist)", "Dr. Chen Wei"
}

export interface QueueEntry {
  id: string; // e.g. "Q-2024-001"
  queueNumber: string; // e.g. "A-101", "C-204"
  appointmentId: string; // FK to Appointment.id
  facilityId?: string; // Campus node ID e.g. "FAC-STJUDE-NORTH"
  facilityPatientId: string; // FK to FacilityPatient.facilityPatientId
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;

  // Appointment & Provider
  appointmentTime: string; // e.g. "09:30 AM"
  appointmentDate: string; // YYYY-MM-DD
  department: string; // e.g. "Internal Medicine"
  doctorId: string; // e.g. "DOC-101"
  doctorName: string; // e.g. "Dr. Chen Wei"
  roomNumber?: string; // e.g. "Exam Room 302"

  // Queue Timing & Flow
  checkInTime: string; // e.g. "09:10 AM"
  waitingStartTime?: string; // e.g. "09:15 AM"
  consultationStartTime?: string; // e.g. "09:42 AM"
  completionTime?: string; // e.g. "10:05 AM"
  cancellationTime?: string;
  
  // Status & Priority
  status: QueueStatus;
  priority: QueuePriority;
  priorityReason?: string; // Clinical note for prioritization

  // Waiting Time Metrics (Approximate)
  estimatedWaitMinutes?: number; // e.g. 15
  actualWaitMinutes?: number; // Calculated duration in waiting state

  // Clinical / Staff Notes
  chiefComplaint: string;
  staffNotes?: string;
  cancellationReason?: string;

  // Audit trail
  timeline: QueueTimelineEvent[];
}

export interface CheckInAppointmentInput {
  appointmentId: string;
  priority?: QueuePriority;
  priorityReason?: string;
  staffNotes?: string;
  actor?: string;
}

export interface QueueStats {
  totalToday: number;
  checkedIn: number;
  waiting: number;
  inConsultation: number;
  completed: number;
  noShow: number;
  cancelled: number;
  averageWaitMinutes: number;
}
