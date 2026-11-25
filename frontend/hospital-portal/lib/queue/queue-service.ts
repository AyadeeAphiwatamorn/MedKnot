import { QueueEntry, QueueStatus, QueueStats, CheckInAppointmentInput, QueuePriority } from "./types";
import { INITIAL_QUEUE_ENTRIES, TODAY } from "./mock-data";
import { AppointmentService } from "../appointments/appointment-service";
import { FacilityService } from "../facility/facility-service";

const STORAGE_KEY_QUEUE = "medknot_queue_entries_store";

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

export const QueueService = {
  /**
   * Raw unfiltered store helper for safe mutations
   */
  _getRawQueueEntries(): QueueEntry[] {
    return getStored<QueueEntry[]>(STORAGE_KEY_QUEUE, INITIAL_QUEUE_ENTRIES);
  },

  /**
   * Retrieves queue entries scoped to the active campus (or specified facilityId)
   */
  getAllQueueEntries(facilityId?: string): QueueEntry[] {
    const raw = this._getRawQueueEntries();
    const targetFacilityId = facilityId || FacilityService.getActiveCampusId();
    if (targetFacilityId === "ALL") return raw;
    return raw.filter((q) => (q.facilityId || "FAC-STJUDE-NORTH") === targetFacilityId);
  },

  /**
   * Retrieves today's active queue entries
   */
  getTodayQueueEntries(facilityId?: string): QueueEntry[] {
    const all = this.getAllQueueEntries(facilityId);
    return all.filter((q) => q.appointmentDate === TODAY);
  },

  /**
   * Retrieves single queue entry by ID
   */
  getQueueEntryById(id: string): QueueEntry | null {
    const all = this._getRawQueueEntries();
    return all.find((q) => q.id === id) || null;
  },

  /**
   * Retrieves a queue entry associated with an appointment
   */
  getQueueEntryByAppointmentId(appointmentId: string): QueueEntry | null {
    const all = this.getAllQueueEntries();
    return all.find((q) => q.appointmentId === appointmentId && !["Cancelled", "No Show"].includes(q.status)) || null;
  },

  /**
   * Computes summary metrics for Queue Dashboard
   */
  getQueueStats(facilityId?: string): QueueStats {
    const today = this.getTodayQueueEntries(facilityId);
    const totalToday = today.length;
    const checkedIn = today.filter((q) => q.status === "Checked In").length;
    const waiting = today.filter((q) => q.status === "Waiting").length;
    const inConsultation = today.filter((q) => q.status === "In Consultation").length;
    const completed = today.filter((q) => q.status === "Completed").length;
    const noShow = today.filter((q) => q.status === "No Show").length;
    const cancelled = today.filter((q) => q.status === "Cancelled").length;

    // Calculate approximate average wait
    const waitingEntries = today.filter((q) => q.actualWaitMinutes !== undefined);
    const avgWait = waitingEntries.length > 0
      ? Math.round(waitingEntries.reduce((acc, curr) => acc + (curr.actualWaitMinutes || 0), 0) / waitingEntries.length)
      : 18;

    return {
      totalToday,
      checkedIn,
      waiting,
      inConsultation,
      completed,
      noShow,
      cancelled,
      averageWaitMinutes: avgWait,
    };
  },

  /**
   * Query queue with filters and sorting
   */
  queryQueue(options?: {
    date?: string;
    department?: string;
    doctor?: string;
    status?: string;
    search?: string;
    sortBy?: "queueNumber" | "checkInTime" | "appointmentTime" | "status";
    onlyActive?: boolean;
  }): QueueEntry[] {
    const all = this.getAllQueueEntries();
    const targetDate = options?.date !== undefined ? options.date : TODAY;
    const deptFilter = options?.department || "All";
    const doctorFilter = options?.doctor || "All";
    const statusFilter = options?.status || "All";
    const query = (options?.search || "").trim().toLowerCase();
    const sortBy = options?.sortBy || "queueNumber";

    const filtered = all.filter((item) => {
      // Date filter (empty string means any date, e.g. for history)
      if (targetDate && item.appointmentDate !== targetDate) {
        return false;
      }

      // Department
      if (deptFilter !== "All" && item.department !== deptFilter) {
        return false;
      }

      // Doctor
      if (doctorFilter !== "All" && item.doctorId !== doctorFilter && item.doctorName !== doctorFilter) {
        return false;
      }

      // Status
      if (statusFilter !== "All" && item.status !== statusFilter) {
        return false;
      }

      // Search
      if (query) {
        const matchesName = item.patientName.toLowerCase().includes(query);
        const matchesId = item.facilityPatientId.toLowerCase().includes(query);
        const matchesQNum = item.queueNumber.toLowerCase().includes(query);
        const matchesApt = item.appointmentId.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesQNum && !matchesApt) return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "checkInTime") {
        return a.checkInTime.localeCompare(b.checkInTime);
      }
      if (sortBy === "appointmentTime") {
        return a.appointmentTime.localeCompare(b.appointmentTime);
      }
      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      return a.queueNumber.localeCompare(b.queueNumber);
    });

    return filtered;
  },

  /**
   * Check in a patient from a confirmed appointment
   */
  checkInAppointment(input: CheckInAppointmentInput): { success: boolean; queueEntry?: QueueEntry; error?: string } {
    // 1. Fetch appointment
    const appointment = AppointmentService.getAppointmentById(input.appointmentId);
    if (!appointment) {
      return { success: false, error: "Appointment record not found." };
    }

    // 2. Validate appointment status (Must be Confirmed)
    if (appointment.status !== "Confirmed") {
      return {
        success: false,
        error: `Cannot check in appointment with status "${appointment.status}". Only Confirmed appointments may be checked into the queue.`,
      };
    }

    // 3. Prevent duplicate active queue entry
    const existing = this.getQueueEntryByAppointmentId(input.appointmentId);
    if (existing) {
      return {
        success: false,
        error: `Patient already has an active queue entry (${existing.queueNumber}) for this appointment.`,
      };
    }

    const all = this._getRawQueueEntries();
    const todayEntries = all.filter((q) => q.appointmentDate === appointment.appointmentDate);

    // Generate Dept-specific Queue Number (e.g. IM-108, CD-109)
    const deptPrefix = appointment.department.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "GN";
    const nextSeq = todayEntries.length + 101;
    const queueNumber = `${deptPrefix}-${nextSeq}`;

    const newId = `Q-2024-${String(all.length + 1).padStart(3, "0")}`;
    const nowTimeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    // Approximate estimated wait based on queue count
    const waitingCount = todayEntries.filter((q) => q.status === "Waiting").length;
    const approxWait = Math.max(10, waitingCount * 15);

    const newEntry: QueueEntry = {
      id: newId,
      queueNumber,
      appointmentId: appointment.id,
      facilityId: appointment.facilityId,
      facilityPatientId: appointment.facilityPatientId,
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      patientAge: appointment.patientAge,
      patientGender: appointment.patientGender,
      appointmentTime: appointment.timeSlot,
      appointmentDate: appointment.appointmentDate,
      department: appointment.department,
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName,
      roomNumber: `Suite ${Math.floor(Math.random() * 8) + 101}`,
      checkInTime: nowTimeStr,
      status: "Checked In",
      priority: input.priority || "Standard",
      priorityReason: input.priorityReason,
      estimatedWaitMinutes: approxWait,
      chiefComplaint: appointment.reasonForVisit,
      staffNotes: input.staffNotes || appointment.staffNotes,
      timeline: [
        {
          id: `EV-${Date.now()}-1`,
          timestamp: nowTimeStr,
          date: appointment.appointmentDate,
          status: "Checked In",
          title: "Patient Check-in Verified",
          description: "Patient presented at reception and check-in was verified.",
          actor: input.actor || "Priya Sharma (Receptionist)",
        },
      ],
    };

    all.unshift(newEntry);
    setStored(STORAGE_KEY_QUEUE, all);

    return { success: true, queueEntry: newEntry };
  },

  /**
   * Update Queue Status with audit timeline
   */
  updateQueueStatus(
    id: string,
    newStatus: QueueStatus,
    options?: {
      actor?: string;
      reason?: string;
      roomNumber?: string;
    }
  ): { success: boolean; queueEntry?: QueueEntry; error?: string } {
    const all = this._getRawQueueEntries();
    const index = all.findIndex((q) => q.id === id);

    if (index === -1) {
      return { success: false, error: "Queue entry not found." };
    }

    const entry = { ...all[index] };
    const nowTimeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    const actor = options?.actor || "Authorized Staff";

    let eventTitle = `Status changed to ${newStatus}`;
    let eventDesc = `Status transitioned from ${entry.status} to ${newStatus}.`;

    entry.status = newStatus;

    if (newStatus === "Waiting") {
      entry.waitingStartTime = entry.waitingStartTime || nowTimeStr;
      eventTitle = "Moved to Waiting Area";
      eventDesc = "Patient called to clinical waiting lounge.";
    } else if (newStatus === "In Consultation") {
      entry.consultationStartTime = nowTimeStr;
      if (options?.roomNumber) entry.roomNumber = options.roomNumber;
      eventTitle = "Consultation Commenced";
      eventDesc = `Patient called into ${entry.roomNumber || "examination room"} with ${entry.doctorName}.`;
      // Calculate actual wait time if waitingStartTime exists
      if (entry.waitingStartTime) {
        entry.actualWaitMinutes = 20; // Simulated realistic duration
      }
    } else if (newStatus === "Completed") {
      entry.completionTime = nowTimeStr;
      eventTitle = "Consultation Completed";
      eventDesc = "Visit finished and patient discharged or routed to billing/pharmacy.";
    } else if (newStatus === "No Show") {
      entry.cancellationTime = nowTimeStr;
      eventTitle = "Marked as No Show";
      eventDesc = options?.reason || "Patient failed to report within the designated arrival window.";
    } else if (newStatus === "Cancelled") {
      entry.cancellationTime = nowTimeStr;
      entry.cancellationReason = options?.reason;
      eventTitle = "Queue Entry Cancelled";
      eventDesc = options?.reason || "Cancelled by hospital staff request.";
    }

    const newEvent = {
      id: `EV-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      timestamp: nowTimeStr,
      date: entry.appointmentDate,
      status: newStatus,
      title: eventTitle,
      description: eventDesc,
      actor,
    };

    entry.timeline = [newEvent, ...entry.timeline];
    all[index] = entry;
    setStored(STORAGE_KEY_QUEUE, all);

    return { success: true, queueEntry: entry };
  },

  /**
   * Eligible appointments for check-in today that are not yet checked in
   */
  getEligibleCheckInAppointments() {
    const allAppointments = AppointmentService.getAllAppointments();
    const todayConfirmed = allAppointments.filter(
      (a) => a.appointmentDate === TODAY && a.status === "Confirmed"
    );

    const activeQueueAptIds = new Set(
      this.getAllQueueEntries()
        .filter((q) => q.appointmentDate === TODAY && !["Cancelled", "No Show"].includes(q.status))
        .map((q) => q.appointmentId)
    );

    return todayConfirmed.filter((a) => !activeQueueAptIds.has(a.id));
  },
};
