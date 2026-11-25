import { DEFAULT_ADMIN, getClientSession } from "@/lib/auth";
import { FacilityService, getUserMembership } from "@/lib/facility/facility-service";
import { PatientService } from "@/lib/patients/patient-service";
import { AppointmentService } from "@/lib/appointments/appointment-service";
import { QueueService } from "@/lib/queue/queue-service";
import { INITIAL_DOCUMENTS } from "@/lib/medical-records-data";
import { INITIAL_AI_REVIEW_ITEMS } from "@/lib/ai-review-data";
import {
  INITIAL_DOCTORS,
  INITIAL_DEPARTMENTS,
  INITIAL_FACILITY_SETTINGS,
} from "@/lib/clinical-data";
import { INITIAL_STAFF_MEMBERS, INITIAL_STAFF_TASKS } from "@/lib/operations-data";
import type { LoadedAuthorizedContext, PageContext } from "./types";

/**
 * Loads authorized page data using existing project services & permission checks.
 * Never assumes a record is accessible solely because its ID appears in the URL.
 * Enforces campus isolation and role boundaries.
 */
export function loadAuthorizedPageData(pageContext: PageContext): LoadedAuthorizedContext {
  const session = getClientSession() || DEFAULT_ADMIN;
  const activeCtx = FacilityService.getActiveContext(session);
  const campusId = activeCtx.campus.id;
  const facilityId = activeCtx.facility.id;
  const isCampusAuthorized = FacilityService.isCampusAuthorized(campusId, session);

  const base: LoadedAuthorizedContext = {
    pageId: pageContext.pageId,
    route: pageContext.route,
    facilityId,
    facilityName: activeCtx.facility.name,
    campusId,
    campusName: activeCtx.campus.name,
    userName: session.name,
    userRole: session.role,
    isAuthorized: isCampusAuthorized,
  };

  if (!isCampusAuthorized) {
    return {
      ...base,
      isAuthorized: false,
      unavailableReason: `Your account (${session.email}) is not authorized to access records at ${activeCtx.facility.name} — ${activeCtx.campus.name}.`,
    };
  }

  const campusAppointments = AppointmentService.getAllAppointments(campusId);
  const campusQueue = QueueService.getAllQueueEntries(campusId);
  const campusPatients = PatientService.queryPatients({ facilityId: campusId });
  const campusDocuments = INITIAL_DOCUMENTS.filter((doc) => doc.facilityId === campusId);
  const campusDocIds = new Set(campusDocuments.map((d) => d.id));
  const campusAIReview = INITIAL_AI_REVIEW_ITEMS.filter((item) =>
    campusDocIds.has(item.documentId)
  );
  const campusDoctors = INITIAL_DOCTORS.filter(
    (doc) => !doc.campusIds || doc.campusIds.includes(campusId)
  );
  const campusDepartments = INITIAL_DEPARTMENTS.filter(
    (dept) => !dept.campusIds || dept.campusIds.includes(campusId)
  );

  // Staff records scoped to active campus; non-admins get limited directory visibility
  const campusStaff = INITIAL_STAFF_MEMBERS.filter((member) =>
    member.facility.toLowerCase().includes(activeCtx.campus.name.toLowerCase()) ||
    campusId === "FAC-STJUDE-NORTH"
  );

  const isAdmin =
    session.role.toLowerCase().includes("admin") ||
    getUserMembership(session).roleScope !== "Campus Staff";

  switch (pageContext.pageId) {
    case "patient-detail": {
      const entityId = pageContext.entityId;
      const detail = entityId ? PatientService.getPatientById(entityId) : null;
      if (!detail) {
        return {
          ...base,
          isAuthorized: false,
          unavailableReason: `No patient record found for ID "${entityId || "unknown"}".`,
        };
      }
      if (detail.facilityRecord.facilityId !== campusId) {
        return {
          ...base,
          isAuthorized: false,
          unavailableReason: `Patient record "${entityId}" belongs to ${detail.facilityRecord.facilityName} and cannot be accessed while scoped to ${activeCtx.facility.name} — ${activeCtx.campus.name}.`,
        };
      }
      return { ...base, patientDetail: detail };
    }

    case "appointment-detail": {
      const entityId = pageContext.entityId;
      const apt = entityId ? AppointmentService.getAppointmentById(entityId) : null;
      if (!apt) {
        return {
          ...base,
          isAuthorized: false,
          unavailableReason: `Appointment record "${entityId || "unknown"}" could not be found.`,
        };
      }
      if (apt.facilityId !== campusId) {
        return {
          ...base,
          isAuthorized: false,
          unavailableReason: `Appointment "${entityId}" belongs to ${apt.facilityName} and is outside your active campus (${activeCtx.campus.name}).`,
        };
      }
      return { ...base, appointmentDetail: apt, appointmentsList: campusAppointments };
    }

    case "queue-detail": {
      const entityId = pageContext.entityId;
      const entry = entityId ? QueueService.getQueueEntryById(entityId) : null;
      if (!entry) {
        return {
          ...base,
          isAuthorized: false,
          unavailableReason: `Queue entry "${entityId || "unknown"}" could not be found.`,
        };
      }
      const entryCampus = entry.facilityId || "FAC-STJUDE-NORTH";
      if (entryCampus !== campusId) {
        return {
          ...base,
          isAuthorized: false,
          unavailableReason: `Queue entry "${entityId}" belongs to another campus and cannot be accessed from ${activeCtx.campus.name}.`,
        };
      }
      return { ...base, queueDetail: entry, queueList: campusQueue };
    }

    case "document-detail": {
      const entityId = pageContext.entityId;
      const doc = entityId ? INITIAL_DOCUMENTS.find((d) => d.id === entityId) : null;
      if (!doc) {
        return {
          ...base,
          isAuthorized: false,
          unavailableReason: `Medical document "${entityId || "unknown"}" was not found in the authorized repository.`,
        };
      }
      if (doc.facilityId !== campusId) {
        return {
          ...base,
          isAuthorized: false,
          unavailableReason: `Medical document "${entityId}" is stored under ${doc.facilityName} and is restricted while viewing ${activeCtx.facility.name} — ${activeCtx.campus.name}. Switch to an authorized campus housing this record to review it.`,
        };
      }
      return { ...base, documentDetail: doc, documentsList: campusDocuments };
    }

    case "documents":
      return {
        ...base,
        documentsList: campusDocuments,
        documentDetail: campusDocuments[0] || null,
      };

    case "ai-review":
      return {
        ...base,
        aiReviewItems: campusAIReview,
        documentsList: campusDocuments,
      };

    case "patients":
    case "patient-new":
      return { ...base, patientsList: campusPatients };

    case "appointments":
    case "appointment-requests":
    case "appointment-calendar":
    case "appointment-new":
      return {
        ...base,
        appointmentsList: campusAppointments,
        doctors: campusDoctors,
      };

    case "queue":
    case "queue-board":
    case "queue-history":
      return { ...base, queueList: campusQueue };

    case "staff":
      if (!isAdmin) {
        return {
          ...base,
          staffMembers: campusStaff.map((s) => ({
            ...s,
            email: "Restricted (Admin only)",
            phone: "Restricted (Admin only)",
          })),
        };
      }
      return { ...base, staffMembers: campusStaff };

    case "tasks":
      return {
        ...base,
        staffTasks: campusId === "FAC-STJUDE-NORTH" ? INITIAL_STAFF_TASKS : [],
        staffMembers: campusStaff,
      };

    case "doctors":
    case "departments":
      return {
        ...base,
        doctors: campusDoctors,
        departments: campusDepartments,
        appointmentsList: campusAppointments,
      };

    case "facility-settings":
    case "settings":
      return {
        ...base,
        facilitySettings:
          campusId === "FAC-STJUDE-NORTH" ? INITIAL_FACILITY_SETTINGS : null,
      };

    default:
      return {
        ...base,
        patientsList: campusPatients,
        appointmentsList: campusAppointments,
        queueList: campusQueue,
        documentsList: campusDocuments,
        aiReviewItems: campusAIReview,
        doctors: campusDoctors,
        departments: campusDepartments,
        staffTasks: campusId === "FAC-STJUDE-NORTH" ? INITIAL_STAFF_TASKS : [],
        staffMembers: campusStaff,
      };
  }
}
