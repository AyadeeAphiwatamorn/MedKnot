import {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  AppointmentStats,
  AppointmentTimelineEvent,
} from "./types";
import { INITIAL_APPOINTMENTS } from "./mock-data";
import { FacilityService } from "../facility/facility-service";

const STORAGE_KEY_APPOINTMENTS = "medknot_appointments_store";
const TODAY = "2024-11-25";

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export const AppointmentService = {
  /**
   * Raw unfiltered store helper for safe mutations
   */
  _getRawAppointments(): Appointment[] {
    return getStored<Appointment[]>(STORAGE_KEY_APPOINTMENTS, INITIAL_APPOINTMENTS);
  },

  /**
   * Retrieves appointments scoped to the active campus (or specified facilityId)
   */
  getAllAppointments(facilityId?: string): Appointment[] {
    const raw = this._getRawAppointments();
    const targetFacilityId = facilityId || FacilityService.getActiveCampusId();
    if (targetFacilityId === "ALL") return raw;
    return raw.filter((a) => a.facilityId === targetFacilityId);
  },

  /**
   * Retrieves single appointment by ID
   */
  getAppointmentById(id: string): Appointment | null {
    const all = this._getRawAppointments();
    return all.find((a) => a.id === id) || null;
  },

  /**
   * Computes summary metrics for Appointment Dashboard
   */
  getAppointmentStats(facilityId?: string): AppointmentStats {
    const all = this.getAllAppointments(facilityId);
    const totalToday = all.filter((a) => a.appointmentDate === TODAY).length;
    const pendingRequests = all.filter((a) =>
      ["Requested", "Under Review", "Awaiting Patient Response", "Reschedule Requested"].includes(a.status)
    ).length;
    const confirmedAppointments = all.filter((a) => a.status === "Confirmed").length;
    const completedAppointments = all.filter((a) => a.status === "Completed").length;
    const cancelledAppointments = all.filter((a) => a.status === "Cancelled").length;

    return {
      totalToday,
      pendingRequests,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
    };
  },

  /**
   * Query appointments with multiple filter criteria
   */
  queryAppointments(options?: {
    search?: string;
    doctor?: string;
    department?: string;
    status?: string;
    date?: string;
    type?: string;
    sortBy?: "newest" | "oldest" | "date" | "patient";
    facilityId?: string;
  }): Appointment[] {
    const all = this.getAllAppointments(options?.facilityId);
    const query = (options?.search || "").trim().toLowerCase();
    const doctorFilter = options?.doctor || "All";
    const deptFilter = options?.department || "All";
    const statusFilter = options?.status || "All";
    const dateFilter = options?.date || "";
    const typeFilter = options?.type || "All";
    const sortBy = options?.sortBy || "date";

    const filtered = all.filter((item) => {
      // 1. Search filter: Patient name or Appointment ID
      if (query) {
        const matchesName = item.patientName.toLowerCase().includes(query);
        const matchesId = item.id.toLowerCase().includes(query);
        const matchesPatId = item.facilityPatientId.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesPatId) return false;
      }

      // 2. Doctor filter
      if (doctorFilter !== "All" && item.doctorName !== doctorFilter) {
        return false;
      }

      // 3. Department filter
      if (deptFilter !== "All" && item.department !== deptFilter) {
        return false;
      }

      // 4. Status filter
      if (statusFilter !== "All" && item.status !== statusFilter) {
        return false;
      }

      // 5. Date filter
      if (dateFilter && item.appointmentDate !== dateFilter) {
        return false;
      }

      // 6. Type filter
      if (typeFilter !== "All" && item.appointmentType !== typeFilter) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "patient") {
        return a.patientName.localeCompare(b.patientName);
      }
      if (sortBy === "oldest") {
        return new Date(a.requestSubmissionDate).getTime() - new Date(b.requestSubmissionDate).getTime();
      }
      if (sortBy === "newest") {
        return new Date(b.requestSubmissionDate).getTime() - new Date(a.requestSubmissionDate).getTime();
      }
      // default: by appointment date & time
      const dateA = new Date(`${a.appointmentDate} ${a.timeSlot}`).getTime() || 0;
      const dateB = new Date(`${b.appointmentDate} ${b.timeSlot}`).getTime() || 0;
      return dateA - dateB;
    });

    return filtered;
  },

  /**
   * Retrieves requests requiring staff review
   */
  getAppointmentRequests(facilityId?: string): Appointment[] {
    const all = this.getAllAppointments(facilityId);
    return all.filter((a) =>
      ["Requested", "Under Review", "Awaiting Patient Response", "Reschedule Requested"].includes(a.status)
    );
  },

  /**
   * Validates if a doctor is already booked for that date & time slot
   */
  hasSchedulingConflict(doctorId: string, date: string, timeSlot: string, excludeAppointmentId?: string): boolean {
    if (!doctorId) return false;
    const all = this._getRawAppointments();
    return all.some(
      (a) =>
        a.id !== excludeAppointmentId &&
        a.doctorId === doctorId &&
        a.appointmentDate === date &&
        a.timeSlot === timeSlot &&
        ["Confirmed", "Under Review"].includes(a.status)
    );
  },

  /**
   * Creates a new confirmed appointment
   */
  createAppointment(input: CreateAppointmentInput): { success: boolean; appointment?: Appointment; error?: string } {
    // Conflict check
    if (this.hasSchedulingConflict(input.doctorId, input.appointmentDate, input.timeSlot)) {
      return {
        success: false,
        error: `Dr. ${input.doctorName} is already booked on ${input.appointmentDate} at ${input.timeSlot}. Please select a different time slot or physician.`,
      };
    }

    const all = this._getRawAppointments();
    const nextNum = all.length + 1;
    const newId = `APT-2024-${nextNum < 10 ? "00" : nextNum < 100 ? "0" : ""}${nextNum}`;
    const todayStr = new Date().toISOString().split("T")[0];
    const activeCtx = FacilityService.getActiveContext();

    const initialEvent: AppointmentTimelineEvent = {
      id: `EV-${Date.now()}-1`,
      timestamp: `${todayStr} 10:00 AM`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      eventType: "confirmed",
      title: "Appointment Created & Scheduled",
      description: `Created directly by hospital staff for Dr. ${input.doctorName} (${input.department}).`,
      actor: "Hospital Admissions Staff",
    };

    const newAppointment: Appointment = {
      id: newId,
      facilityPatientId: input.facilityPatientId,
      patientName: input.patientName,
      patientPhone: input.patientPhone,
      patientAge: input.patientAge,
      patientGender: input.patientGender,
      doctorId: input.doctorId,
      doctorName: input.doctorName,
      department: input.department,
      facilityId: activeCtx.campus.id,
      facilityName: `${activeCtx.facility.name} (${activeCtx.campus.name})`,
      appointmentDate: input.appointmentDate,
      timeSlot: input.timeSlot,
      durationMinutes: 30,
      appointmentType: input.appointmentType,
      status: "Confirmed",
      workflow: "facility_assigned",
      source: input.source || "Hospital Web Portal",
      reasonForVisit: input.reasonForVisit,
      patientNotes: input.patientNotes,
      staffNotes: input.staffNotes,
      requestSubmissionDate: todayStr,
      timeline: [initialEvent],
    };

    all.unshift(newAppointment);
    setStored(STORAGE_KEY_APPOINTMENTS, all);
    return { success: true, appointment: newAppointment };
  },

  /**
   * Updates appointment status with audit timeline entry
   */
  updateAppointmentStatus(
    id: string,
    newStatus: AppointmentStatus,
    options?: {
      doctorName?: string;
      doctorId?: string;
      department?: string;
      timeSlot?: string;
      date?: string;
      reason?: string;
      notes?: string;
      actor?: string;
    }
  ): Appointment | null {
    const all = this._getRawAppointments();
    const index = all.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const current = all[index];
    const todayStr = new Date().toISOString().split("T")[0];
    const actor = options?.actor || "Hospital Staff";

    let eventTitle = `Status updated to ${newStatus}`;
    let eventDescription = `Appointment moved to ${newStatus}.`;

    if (newStatus === "Confirmed") {
      eventTitle = "Appointment Confirmed";
      eventDescription = `Confirmed with ${options?.doctorName || current.doctorName} for ${
        options?.date || current.appointmentDate
      } at ${options?.timeSlot || current.timeSlot}.`;
    } else if (newStatus === "Cancelled") {
      eventTitle = "Appointment Cancelled";
      eventDescription = `Cancelled: ${options?.reason || "Patient / clinic scheduling adjustment"}.`;
    } else if (newStatus === "Awaiting Patient Response") {
      eventTitle = "Alternative Slot Proposed";
      eventDescription = `Hospital proposed slot ${options?.date || current.appointmentDate} at ${
        options?.timeSlot || current.timeSlot
      }. Awaiting patient confirmation.`;
    } else if (newStatus === "Completed") {
      eventTitle = "Consultation Completed";
      eventDescription = `Patient attended consultation with ${current.doctorName}. Clinical notes archived.`;
    }

    const newEvent: AppointmentTimelineEvent = {
      id: `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: `${todayStr} ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      eventType:
        newStatus === "Confirmed"
          ? "confirmed"
          : newStatus === "Cancelled"
          ? "cancelled"
          : newStatus === "Completed"
          ? "completed"
          : "under_review",
      title: eventTitle,
      description: eventDescription,
      actor,
    };

    const updated: Appointment = {
      ...current,
      status: newStatus,
      doctorId: options?.doctorId !== undefined ? options.doctorId : current.doctorId,
      doctorName: options?.doctorName !== undefined ? options.doctorName : current.doctorName,
      department: options?.department !== undefined ? options.department : current.department,
      appointmentDate: options?.date !== undefined ? options.date : current.appointmentDate,
      timeSlot: options?.timeSlot !== undefined ? options.timeSlot : current.timeSlot,
      cancellationReason: options?.reason !== undefined ? options.reason : current.cancellationReason,
      staffNotes: options?.notes ? `${current.staffNotes ? current.staffNotes + "\n" : ""}${options.notes}` : current.staffNotes,
      timeline: [newEvent, ...current.timeline],
    };

    all[index] = updated;
    setStored(STORAGE_KEY_APPOINTMENTS, all);
    return updated;
  },
};
