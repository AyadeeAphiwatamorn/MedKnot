export type NotificationCategory =
  | "appointments"
  | "queue"
  | "patients"
  | "records"
  | "tasks";

export type NotificationType =
  // Appointments
  | "new_appointment_request"
  | "appointment_confirmed"
  | "appointment_rejected"
  | "appointment_rescheduled"
  | "appointment_cancelled"
  | "appointment_review_needed"
  // Queue Management
  | "patient_checked_in"
  | "patient_moved_waiting"
  | "consultation_started"
  | "consultation_completed"
  | "patient_no_show"
  // Patients
  | "new_patient_registration"
  | "patient_registration_approved"
  | "patient_correction_needed"
  // Medical Records
  | "new_document_uploaded"
  | "document_awaiting_review"
  | "document_review_completed"
  // Staff Tasks
  | "task_assigned"
  | "task_deadline_approaching"
  | "task_completed";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  type: NotificationType;
  timestamp: string; // e.g. "12m ago", "Today, 10:45 AM"
  createdAt: string; // ISO timestamp
  read: boolean;
  linkUrl: string;
  patientName?: string;
  referenceId?: string;
}
