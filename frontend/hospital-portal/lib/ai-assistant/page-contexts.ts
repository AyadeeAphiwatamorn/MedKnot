import { PageContext } from "./types";

const DEFAULT_WELCOME = (pageName: string, facilityLabel: string) =>
  `Hello! I'm your MedKnot AI Assistant (Demo Assist Mode). I'm currently viewing **${pageName}** for **${facilityLabel}**. How can I help reduce administrative workload today?`;

const MEDICAL_RECORDS_WELCOME =
  "Hello! I'm your MedKnot AI Assistant. I can help you understand and summarize this medical record. What would you like me to review?";

/**
 * Resolves a Next.js App Router pathname into a structured PageContext
 * covering every authenticated route in the MedKnot Hospital Portal.
 */
export function resolvePageContext(
  pathname: string,
  facilityName: string,
  campusName: string
): PageContext {
  const cleanPath = pathname.replace(/\/+$/, "") || "/dashboard";
  const facilityLabel = `${facilityName} — ${campusName}`;

  // 1. Medical Document Details: /dashboard/documents/[documentId]
  if (cleanPath.startsWith("/dashboard/documents/") && cleanPath !== "/dashboard/documents") {
    const documentId = decodeURIComponent(cleanPath.slice("/dashboard/documents/".length).split("/")[0]);
    return {
      pageId: "document-detail",
      pageName: "Medical Document Details",
      route: cleanPath,
      entityType: "medical-document",
      entityId: documentId,
      welcomeMessage: MEDICAL_RECORDS_WELCOME,
      suggestedPrompts: [
        "Summarize this patient's medical record.",
        "Summarize the doctor's clinical notes.",
        "Highlight important laboratory findings.",
        "Prepare a concise patient handover summary.",
      ],
      followUpPrompts: [
        "Can you make it shorter?",
        "Separate the patient-reported information from the laboratory findings.",
        "Identify abnormal values already flagged in the source.",
        "Explain medical terminology in plain language.",
      ],
      availableActions: [
        "Summarize medical document",
        "Summarize clinician-authored notes",
        "Extract laboratory values with flags",
        "Compare patient intake with findings",
        "Draft clinical handover summary",
        "Explain medical terminology",
      ],
      isClinicalRecordContext: true,
    };
  }

  // 2. Medical Records Directory: /dashboard/documents
  if (cleanPath === "/dashboard/documents") {
    return {
      pageId: "documents",
      pageName: "Medical Records",
      route: cleanPath,
      entityType: "medical-document",
      welcomeMessage: MEDICAL_RECORDS_WELCOME,
      suggestedPrompts: [
        "Summarize this patient's medical record.",
        "Summarize the doctor's clinical notes.",
        "Highlight important laboratory findings.",
        "Prepare a concise patient handover summary.",
      ],
      followUpPrompts: [
        "Identify abnormal values already flagged in the source.",
        "Compare patient-reported information with documented findings.",
        "Explain medical terminology in plain language.",
      ],
      availableActions: [
        "Summarize medical documents",
        "List clinician-verified vs AI draft records",
        "Extract flagged lab findings",
        "Prepare handover draft",
      ],
      isClinicalRecordContext: true,
    };
  }

  // 3. AI Medical Review: /dashboard/ai-review
  if (cleanPath === "/dashboard/ai-review") {
    return {
      pageId: "ai-review",
      pageName: "AI Medical Review",
      route: cleanPath,
      entityType: "ai-review-job",
      welcomeMessage: DEFAULT_WELCOME("AI Medical Review", facilityLabel),
      suggestedPrompts: [
        "Summarize documents awaiting review.",
        "Explain what information was extracted.",
        "Highlight uncertain extracted fields.",
        "Compare extracted values with the original source.",
        "Prepare a verification checklist.",
      ],
      followUpPrompts: [
        "Show abnormal flags in the pending review queue.",
        "Can you make it shorter?",
      ],
      availableActions: [
        "Summarize pending AI extractions",
        "Compare OCR output to source document",
        "Highlight low-confidence fields",
        "Generate verification checklist",
      ],
      isClinicalRecordContext: true,
    };
  }

  // 4. Patient Registration: /dashboard/patients/new
  if (cleanPath === "/dashboard/patients/new") {
    return {
      pageId: "patient-new",
      pageName: "Register Patient",
      route: cleanPath,
      entityType: "patient",
      welcomeMessage: DEFAULT_WELCOME("Register Patient", facilityLabel),
      suggestedPrompts: [
        "Identify missing administrative information.",
        "Summarize the patient's registered information.",
        "Prepare a patient handover draft.",
      ],
      followUpPrompts: ["What fields are required before intake check-in?"],
      availableActions: [
        "Checklist required intake demographics",
        "Check campus patient directory summary",
      ],
    };
  }

  // 5. Patient Details: /dashboard/patients/[patientId]
  if (cleanPath.startsWith("/dashboard/patients/")) {
    const patientId = decodeURIComponent(cleanPath.slice("/dashboard/patients/".length).split("/")[0]);
    return {
      pageId: "patient-detail",
      pageName: "Patient Details",
      route: cleanPath,
      entityType: "patient",
      entityId: patientId,
      welcomeMessage: DEFAULT_WELCOME(`Patient Details (${patientId})`, facilityLabel),
      suggestedPrompts: [
        "Summarize this patient's profile.",
        "Summarize the patient's visit history.",
        "Summarize the patient's registered information.",
        "Identify missing administrative information.",
        "Prepare a patient handover draft.",
      ],
      followUpPrompts: [
        "Can you make it shorter?",
        "Show upcoming appointments and recent documents.",
      ],
      availableActions: [
        "Summarize patient demographics & allergies",
        "Summarize documented visit history",
        "Identify incomplete administrative fields",
        "Draft handover summary",
      ],
      isClinicalRecordContext: true,
    };
  }

  // 6. Patient Directory: /dashboard/patients
  if (cleanPath === "/dashboard/patients") {
    return {
      pageId: "patients",
      pageName: "Patient Directory",
      route: cleanPath,
      entityType: "patient",
      welcomeMessage: DEFAULT_WELCOME("Patient Directory", facilityLabel),
      suggestedPrompts: [
        "Summarize the patient's registered information.",
        "Identify missing administrative information.",
        "Summarize this patient's profile.",
        "Summarize the patient's visit history.",
        "Prepare a patient handover draft.",
      ],
      followUpPrompts: [
        "How many patients have pending registrations?",
        "Can you make it shorter?",
      ],
      availableActions: [
        "Summarize campus patient registry",
        "Identify records missing email or allergies",
        "Draft administrative intake summary",
      ],
    };
  }

  // 7. Appointment Requests: /dashboard/appointments/requests
  if (cleanPath === "/dashboard/appointments/requests") {
    return {
      pageId: "appointment-requests",
      pageName: "Appointment Requests",
      route: cleanPath,
      entityType: "appointment",
      welcomeMessage: DEFAULT_WELCOME("Appointment Requests", facilityLabel),
      suggestedPrompts: [
        "Summarize pending appointment requests.",
        "Show requests awaiting staff review.",
        "Identify scheduling conflicts using available schedule data.",
        "Prepare an appointment confirmation message.",
        "Draft a rescheduling message.",
      ],
      followUpPrompts: [
        "Can you make it shorter?",
        "Which requests need physician assignment?",
      ],
      availableActions: [
        "Summarize pending intake requests",
        "Check schedule conflicts",
        "Draft confirmation or rescheduling SMS/email",
      ],
    };
  }

  // 8. Appointment Calendar: /dashboard/appointments/calendar
  if (cleanPath === "/dashboard/appointments/calendar") {
    return {
      pageId: "appointment-calendar",
      pageName: "Appointment Calendar",
      route: cleanPath,
      entityType: "appointment",
      welcomeMessage: DEFAULT_WELCOME("Appointment Calendar", facilityLabel),
      suggestedPrompts: [
        "Summarize today's appointment schedule.",
        "Identify scheduling conflicts using available schedule data.",
        "Summarize pending appointment requests.",
        "Prepare an appointment confirmation message.",
        "Draft a rescheduling message.",
      ],
      followUpPrompts: ["Can you make it shorter?"],
      availableActions: [
        "Summarize calendar density",
        "Check overlapping physician slots",
        "Draft rescheduling message",
      ],
    };
  }

  // 9. New Appointment: /dashboard/appointments/new
  if (cleanPath === "/dashboard/appointments/new") {
    return {
      pageId: "appointment-new",
      pageName: "New Appointment",
      route: cleanPath,
      entityType: "appointment",
      welcomeMessage: DEFAULT_WELCOME("Schedule New Appointment", facilityLabel),
      suggestedPrompts: [
        "Summarize today's appointment schedule.",
        "Identify scheduling conflicts using available schedule data.",
        "Prepare an appointment confirmation message.",
      ],
      followUpPrompts: ["Show doctor availability slots."],
      availableActions: [
        "Check open schedule slots",
        "Detect doctor double-bookings",
        "Draft confirmation message",
      ],
    };
  }

  // 10. Appointment Detail: /dashboard/appointments/[appointmentId]
  if (cleanPath.startsWith("/dashboard/appointments/")) {
    const appointmentId = decodeURIComponent(
      cleanPath.slice("/dashboard/appointments/".length).split("/")[0]
    );
    return {
      pageId: "appointment-detail",
      pageName: "Appointment Details",
      route: cleanPath,
      entityType: "appointment",
      entityId: appointmentId,
      welcomeMessage: DEFAULT_WELCOME(`Appointment (${appointmentId})`, facilityLabel),
      suggestedPrompts: [
        "Summarize this appointment record.",
        "Identify scheduling conflicts using available schedule data.",
        "Prepare an appointment confirmation message.",
        "Draft a rescheduling message.",
      ],
      followUpPrompts: ["Can you make it shorter?"],
      availableActions: [
        "Summarize appointment & timeline",
        "Verify slot conflicts",
        "Draft patient communication",
      ],
    };
  }

  // 11. Appointments Overview: /dashboard/appointments
  if (cleanPath === "/dashboard/appointments") {
    return {
      pageId: "appointments",
      pageName: "Appointments Overview",
      route: cleanPath,
      entityType: "appointment",
      welcomeMessage: DEFAULT_WELCOME("Appointments Overview", facilityLabel),
      suggestedPrompts: [
        "Summarize pending appointment requests.",
        "Show requests awaiting staff review.",
        "Summarize today's appointment schedule.",
        "Identify scheduling conflicts using available schedule data.",
        "Prepare an appointment confirmation message.",
        "Draft a rescheduling message.",
      ],
      followUpPrompts: ["Can you make it shorter?"],
      availableActions: [
        "Summarize scheduled & pending appointments",
        "Flag overlapping slots",
        "Draft patient confirmation or reschedule message",
      ],
    };
  }

  // 12. Queue Live Board: /dashboard/queue/board
  if (cleanPath === "/dashboard/queue/board") {
    return {
      pageId: "queue-board",
      pageName: "Queue Live Board",
      route: cleanPath,
      entityType: "queue-entry",
      welcomeMessage: DEFAULT_WELCOME("Queue Live Board", facilityLabel),
      suggestedPrompts: [
        "Summarize the current waiting queue.",
        "Show patients waiting for the longest time.",
        "Summarize completed consultations.",
        "Prepare a queue activity report.",
      ],
      followUpPrompts: ["Summarize queue changes.", "Can you make it shorter?"],
      availableActions: [
        "Summarize active queue stations",
        "Identify longest-waiting tokens",
        "Draft operational queue summary",
      ],
    };
  }

  // 13. Queue History: /dashboard/queue/history
  if (cleanPath === "/dashboard/queue/history") {
    return {
      pageId: "queue-history",
      pageName: "Queue History",
      route: cleanPath,
      entityType: "queue-entry",
      welcomeMessage: DEFAULT_WELCOME("Queue History", facilityLabel),
      suggestedPrompts: [
        "Summarize completed consultations.",
        "Prepare a queue activity report.",
        "Summarize queue changes.",
        "Summarize the current waiting queue.",
      ],
      followUpPrompts: ["Can you make it shorter?"],
      availableActions: [
        "Summarize historical queue throughput",
        "Analyze completed vs no-show counts",
      ],
    };
  }

  // 14. Queue Detail: /dashboard/queue/[queueId]
  if (cleanPath.startsWith("/dashboard/queue/")) {
    const queueId = decodeURIComponent(cleanPath.slice("/dashboard/queue/".length).split("/")[0]);
    return {
      pageId: "queue-detail",
      pageName: "Queue Token Details",
      route: cleanPath,
      entityType: "queue-entry",
      entityId: queueId,
      welcomeMessage: DEFAULT_WELCOME(`Queue Entry (${queueId})`, facilityLabel),
      suggestedPrompts: [
        "Summarize queue changes.",
        "Summarize the current waiting queue.",
        "Prepare a queue activity report.",
      ],
      followUpPrompts: ["Can you make it shorter?"],
      availableActions: [
        "Summarize token timeline & wait metrics",
        "Draft front-desk update",
      ],
    };
  }

  // 15. Queue Overview: /dashboard/queue
  if (cleanPath === "/dashboard/queue") {
    return {
      pageId: "queue",
      pageName: "Queue Management",
      route: cleanPath,
      entityType: "queue-entry",
      welcomeMessage: DEFAULT_WELCOME("Queue Management", facilityLabel),
      suggestedPrompts: [
        "Summarize the current waiting queue.",
        "Show patients waiting for the longest time.",
        "Summarize completed consultations.",
        "Prepare a queue activity report.",
        "Summarize queue changes.",
      ],
      followUpPrompts: ["Can you make it shorter?"],
      availableActions: [
        "Summarize live queue volume & wait times",
        "Highlight longest waits",
        "Draft shift queue report",
      ],
    };
  }

  // 16. Staff Management: /dashboard/staff or /dashboard/settings/staff
  if (cleanPath === "/dashboard/staff" || cleanPath === "/dashboard/settings/staff") {
    return {
      pageId: "staff",
      pageName: "Staff Management",
      route: cleanPath,
      entityType: "staff",
      welcomeMessage: DEFAULT_WELCOME("Staff Management", facilityLabel),
      suggestedPrompts: [
        "Summarize the staff directory.",
        "Identify incomplete staff profiles.",
        "Summarize staff roles and departments.",
        "Draft a staff invitation message.",
        "Summarize staffing information.",
      ],
      followUpPrompts: ["Can you make it shorter?"],
      availableActions: [
        "Summarize staff roster by role & shift",
        "Check profile completeness",
        "Draft onboarding invitation",
      ],
    };
  }

  // 17. Staff Tasks: /dashboard/tasks
  if (cleanPath === "/dashboard/tasks") {
    return {
      pageId: "tasks",
      pageName: "Staff Tasks",
      route: cleanPath,
      entityType: "staff-task",
      welcomeMessage: DEFAULT_WELCOME("Staff Tasks", facilityLabel),
      suggestedPrompts: [
        "Summarize pending tasks.",
        "Show overdue tasks.",
        "Summarize tasks by staff member.",
        "Prepare a daily task report.",
        "Draft a task reminder.",
      ],
      followUpPrompts: ["Can you make it shorter?"],
      availableActions: [
        "Summarize task backlog & priorities",
        "Group tasks by assignee",
        "Draft reminder message",
      ],
    };
  }

  // 18. Doctors Directory: /dashboard/doctors
  if (cleanPath === "/dashboard/doctors") {
    return {
      pageId: "doctors",
      pageName: "Doctors & Schedules",
      route: cleanPath,
      entityType: "doctor",
      welcomeMessage: DEFAULT_WELCOME("Doctors Directory", facilityLabel),
      suggestedPrompts: [
        "Summarize doctor availability.",
        "Find scheduling gaps using available schedule data.",
        "Summarize department information.",
        "Prepare a department activity summary.",
      ],
      followUpPrompts: ["Which physicians are currently on call?"],
      availableActions: [
        "Summarize physician availability & on-call roster",
        "Highlight schedule gaps",
        "Summarize booked appointment load per doctor",
      ],
    };
  }

  // 19. Departments: /dashboard/departments
  if (cleanPath === "/dashboard/departments") {
    return {
      pageId: "departments",
      pageName: "Departments",
      route: cleanPath,
      entityType: "department",
      welcomeMessage: DEFAULT_WELCOME("Departments", facilityLabel),
      suggestedPrompts: [
        "Summarize department information.",
        "Summarize doctor availability.",
        "Find scheduling gaps using available schedule data.",
        "Prepare a department activity summary.",
      ],
      followUpPrompts: ["Which departments have the highest bed occupancy?"],
      availableActions: [
        "Summarize bed utilization & active departments",
        "Review physician coverage",
        "Draft department activity summary",
      ],
    };
  }

  // 20. Facility Settings: /dashboard/settings/facility or /register
  if (cleanPath.startsWith("/dashboard/settings/facility")) {
    return {
      pageId: "facility-settings",
      pageName: "Facility Settings",
      route: cleanPath,
      entityType: "facility-settings",
      welcomeMessage: DEFAULT_WELCOME("Facility Settings", facilityLabel),
      suggestedPrompts: [
        "Summarize facility information.",
        "Identify incomplete facility details.",
        "Explain campus configuration.",
        "Draft an administrative update.",
      ],
      followUpPrompts: ["What accreditations are verified on file?"],
      availableActions: [
        "Summarize facility registration & beds",
        "Explain multi-campus setup & permissions",
        "Draft institutional update notice",
      ],
    };
  }

  // 21. Settings Hub: /dashboard/settings
  if (cleanPath === "/dashboard/settings") {
    return {
      pageId: "settings",
      pageName: "Settings Hub",
      route: cleanPath,
      entityType: "facility-settings",
      welcomeMessage: DEFAULT_WELCOME("Settings Hub", facilityLabel),
      suggestedPrompts: [
        "Summarize facility information.",
        "Explain campus configuration.",
        "Summarize staffing information.",
        "Draft an administrative update.",
      ],
      followUpPrompts: ["Can you make it shorter?"],
      availableActions: [
        "Summarize governance & configuration modules",
        "Explain campus & staff access scope",
      ],
    };
  }

  // 22. Operational Reports: /dashboard/reports
  if (cleanPath === "/dashboard/reports") {
    return {
      pageId: "reports",
      pageName: "Operational Reports",
      route: cleanPath,
      entityType: "operational-report",
      welcomeMessage: DEFAULT_WELCOME("Operational Reports", facilityLabel),
      suggestedPrompts: [
        "Prepare a daily operational report draft.",
        "Summarize today's hospital activity.",
        "Prepare a queue activity report.",
        "Prepare a department activity summary.",
      ],
      followUpPrompts: ["Can you make it shorter?"],
      availableActions: [
        "Compile operational metrics draft",
        "Summarize department workload & wait trends",
      ],
    };
  }

  // 23. User Profile: /dashboard/profile
  if (cleanPath === "/dashboard/profile") {
    return {
      pageId: "profile",
      pageName: "My Staff Profile",
      route: cleanPath,
      entityType: "user-profile",
      welcomeMessage: DEFAULT_WELCOME("Staff Profile", facilityLabel),
      suggestedPrompts: [
        "Explain campus configuration.",
        "Summarize pending tasks.",
        "Summarize today's hospital activity.",
      ],
      followUpPrompts: ["What facilities am I authorized to access?"],
      availableActions: [
        "Review active role & campus scope",
        "Check assigned tasks",
      ],
    };
  }

  // 24. Default / Dashboard Overview: /dashboard
  return {
    pageId: "dashboard",
    pageName: "Dashboard Overview",
    route: cleanPath,
    entityType: "facility-dashboard",
    welcomeMessage: DEFAULT_WELCOME("Dashboard Overview", facilityLabel),
    suggestedPrompts: [
      "Summarize today's hospital activity.",
      "What requires staff attention today?",
      "Summarize pending appointments and requests.",
      "Summarize current queue activity.",
      "Prepare a daily operational report draft.",
    ],
    followUpPrompts: [
      "Can you make it shorter?",
      "Show overdue or critical pending tasks.",
    ],
    availableActions: [
      "Summarize campus operations",
      "Highlight pending requests & queue load",
      "Draft daily operational report",
    ],
  };
}
