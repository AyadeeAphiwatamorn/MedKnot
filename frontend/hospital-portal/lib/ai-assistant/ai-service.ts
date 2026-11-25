import type {
  AIMessage,
  LoadedAuthorizedContext,
  PageContext,
} from "./types";
import type { MedicalDocument } from "@/types/medical-records";
import { loadAuthorizedPageData } from "./context-loader";
import { FacilityService } from "@/lib/facility/facility-service";
import { calculateAge } from "@/lib/patients/patient-service";
import { TODAY as QUEUE_TODAY } from "@/lib/queue/mock-data";

export interface AssistantReplyPayload {
  content: string;
  hasClinicalDisclaimer?: boolean;
  isDraftNotice?: boolean;
  isRefusal?: boolean;
  modeLabel: string;
}

const CLINICAL_DISCLAIMER =
  "AI-generated draft. Review the original medical record and verify all information before clinical use. This summary is not a diagnosis or treatment recommendation.";

const ADMIN_DISCLAIMER =
  "Operational draft generated from currently authorized portal data in Mock Assist Mode. Verify schedules and details before sending or executing actions.";

const MEDICAL_TERMINOLOGY_GLOSSARY: Record<string, string> = {
  "fasting blood glucose":
    "Blood sugar level measured after not eating for at least 8 hours; helps evaluate baseline glucose regulation.",
  "hba1c":
    "Glycated hemoglobin — reflects average blood glucose control over roughly the past 2 to 3 months.",
  "total serum cholesterol":
    "Combined measurement of cholesterol components in blood; elevated levels are monitored for cardiovascular risk.",
  "serum creatinine":
    "A waste product filtered by the kidneys; normal values generally suggest preserved kidney filtration.",
  "hemoglobin":
    "Protein in red blood cells responsible for carrying oxygen throughout the body.",
  "polyuria":
    "Passing larger-than-usual amounts of urine more frequently.",
  "fev1":
    "Forced Expiratory Volume in 1 second — the volume of air exhaled during the first second of a forced breath test.",
  "fev1/fvc":
    "Ratio comparing 1-second forced exhalation to total forced breath volume; helps assess airway obstruction.",
  "ige":
    "Immunoglobulin E — an antibody often elevated in allergic or atopic conditions.",
  "crp":
    "C-Reactive Protein — a general blood marker that rises when inflammation is present.",
  "esr":
    "Erythrocyte Sedimentation Rate — a non-specific indicator of inflammation.",
  "hemarthrosis":
    "Bleeding into a joint cavity, often following acute ligament or structural knee trauma.",
};

function formatLabFindings(doc: MedicalDocument): string {
  if (!doc.extractedFields.length) {
    return "- No structured laboratory or extracted biometric fields are recorded in this document.";
  }

  return doc.extractedFields
    .map((f) => {
      const flagText =
        f.flag && f.flag !== "normal"
          ? `flagged ${f.flag} in the source`
          : f.flag === "normal"
          ? "within the displayed reference range"
          : "no abnormal flag recorded";
      const refPart = f.referenceRange ? `; Ref: ${f.referenceRange}` : "";
      const unitPart = f.unit ? ` (${f.unit})` : "";
      return `- ${f.fieldName}: ${f.rawValue}${unitPart} — ${flagText}${refPart} [Source: ${doc.typeLabel} (${doc.id}), status: ${f.status}]`;
    })
    .join("\n");
}

function formatDoctorNotes(doc: MedicalDocument): string {
  const cv = doc.clinicianVerification;
  if (!cv?.clinicalNotes || cv.clinicalNotes.trim().length === 0) {
    return `- Clinician-authored clinical notes are currently unavailable in this record (verification status: ${
      cv?.isVerified ? "Verified" : "Pending clinician sign-off"
    }).`;
  }
  const lines = [
    `- Clinician Verification Status: ${cv.isVerified ? "Clinician-Verified" : "Pending Sign-Off"}`,
    cv.verifiedByDoctor ? `- Verified By: ${cv.verifiedByDoctor}${cv.verifiedAt ? ` (${cv.verifiedAt})` : ""}` : "",
    `- Documented Clinician Notes: ${cv.clinicalNotes}`,
    cv.prescriptionIssued ? `- Documented Prescription Record: ${cv.prescriptionIssued}` : "",
  ].filter(Boolean);
  return lines.join("\n");
}

function formatPatientReported(doc: MedicalDocument): string {
  const kioskSymptoms = doc.patientReportedData?.symptoms || [];
  const profileSymptoms = doc.patient.patientReportedSymptoms || [];
  const allSymptoms = Array.from(new Set([...kioskSymptoms, ...profileSymptoms]));
  const lines = allSymptoms.map((s) => `- ${s}`);
  if (doc.patientReportedData?.intakeNotes) {
    lines.push(`- Intake Note: ${doc.patientReportedData.intakeNotes}`);
  }
  if (doc.patientReportedData?.reportedOn) {
    lines.push(`- Recorded: ${doc.patientReportedData.reportedOn}`);
  }
  return lines.length > 0 ? lines.join("\n") : "- No patient-reported symptoms documented.";
}

function buildMedicalRecordSummary(doc: MedicalDocument, shorter = false): string {
  const statusLabel =
    doc.reviewStatus === "clinician-verified"
      ? "Clinician-Verified"
      : doc.reviewStatus === "staff-reviewed"
      ? "Staff-Reviewed"
      : doc.reviewStatus === "ai-draft"
      ? "AI-Extracted Draft"
      : "Patient-Reported Intake";

  if (shorter) {
    const flagged = doc.extractedFields
      .filter((f) => f.flag && f.flag !== "normal")
      .map((f) => `${f.fieldName}: ${f.rawValue} (${f.flag})`)
      .join("; ");
    return [
      `Brief Summary — ${doc.patient.name} (${doc.id}):`,
      `- Profile: ${doc.patient.age} yrs, ${doc.patient.gender} | Document: ${doc.title} (${statusLabel})`,
      `- Patient-Reported: ${doc.patientReportedData.symptoms[0] || doc.patient.patientReportedSymptoms[0] || "None recorded"}`,
      `- Source Findings: ${flagged || "No flagged abnormal parameters recorded"}`,
      `- Clinician Notes: ${doc.clinicianVerification?.clinicalNotes || "Unavailable / pending clinician sign-off."}`,
    ].join("\n");
  }

  return [
    "Based on the information currently available in this record:",
    "",
    "**1. Original Source & Patient Overview**",
    `- Patient: ${doc.patient.name} (${doc.patient.age} years old, ${doc.patient.gender}, Blood Group: ${doc.patient.bloodGroup})`,
    `- Document: ${doc.title} (${doc.id} • ${doc.typeLabel})`,
    `- Department / Attending: ${doc.departmentName} • ${doc.attendingDoctorName}`,
    `- Document Status: ${statusLabel}`,
    `- Known Allergies: ${doc.patient.allergies.join(", ") || "None documented"}`,
    "",
    "**2. Patient-Reported Information**",
    formatPatientReported(doc),
    "",
    "**3. Extracted Source Findings (Preserving Original Values & Units)**",
    formatLabFindings(doc),
    "",
    "**4. AI-Extracted Draft & Staff Review Provenance**",
    `- AI-Extracted Draft Summary (${doc.aiExtractedData.ocrModel}): ${doc.aiExtractedData.summary}`,
    doc.staffReview?.isApproved
      ? `- Staff-Reviewed: Approved by ${doc.staffReview.reviewedBy || "Authorized Staff"} (${doc.staffReview.reviewedAt || "date N/A"}) — ${doc.staffReview.notes || "Verified."}`
      : "- Staff Review: Pending staff verification.",
    "",
    "**5. Doctor's Clinical Notes (Clinician-Verified Layer)**",
    formatDoctorNotes(doc),
    "",
    "**For Clinician Review**",
    "- Verify all flagged values against the original uploaded source document.",
    "- Correlate documented patient-reported symptoms and adherence notes during clinical assessment.",
  ].join("\n");
}

function checkSafetyGuardrail(promptLower: string): string | null {
  if (
    /\b(diagnos(e|is)|what disease|prescribe|recommend medication|change dosage|increase dose|stop taking|start taking)\b/.test(
      promptLower
    )
  ) {
    return "I cannot provide a medical diagnosis, prescribe medications, or recommend medication changes. Clinical interpretation and treatment decisions remain strictly under the authority of licensed clinicians. I can, however, organize documented findings, summarize clinician-authored notes, or explain terminology from the record.";
  }

  if (
    /\b(change priority|mark urgent|set priority|triage urgency|escalate priority)\b/.test(
      promptLower
    )
  ) {
    return "I cannot independently determine clinical urgency or modify patient queue priority. Clinical triage and prioritization must be performed directly by authorized clinical staff.";
  }

  if (
    /\b(auto-?approve|verify all|sign off automatically|approve this document|confirm appointment|cancel appointment|reject request)\b/.test(
      promptLower
    ) &&
    !/\b(draft|prepare|message)\b/.test(promptLower)
  ) {
    return "I cannot automatically verify medical records or confirm, reject, or cancel patient appointments without explicit authorized staff action inside the portal workflow. I can prepare verification checklists or draft confirmation/rescheduling messages for staff review.";
  }

  return null;
}

function buildMedicalRecordFollowUp(
  promptLower: string,
  doc: MedicalDocument,
  history: AIMessage[]
): AssistantReplyPayload {
  // Shorter summary follow-up
  if (/\b(shorter|brief|concise|condense|tldr)\b/.test(promptLower)) {
    return {
      content: buildMedicalRecordSummary(doc, true),
      hasClinicalDisclaimer: true,
      isDraftNotice: true,
      modeLabel: "Mock Assist • Medical Record",
    };
  }

  // Separate patient-reported vs lab findings
  if (/\b(separate|split|distinguish)\b/.test(promptLower)) {
    return {
      content: [
        `Separated sections for **${doc.patient.name}** (${doc.id}):`,
        "",
        "**Patient-Reported Information (Self-Reported / Intake)**",
        formatPatientReported(doc),
        "",
        "**Laboratory / Documented Source Findings**",
        formatLabFindings(doc),
      ].join("\n"),
      hasClinicalDisclaimer: true,
      isDraftNotice: true,
      modeLabel: "Mock Assist • Medical Record",
    };
  }

  const asksFullRecord = /\b(record|medical document|overview|full summary|and the doctor)\b/.test(
    promptLower
  );

  // Doctor's clinical notes (only when specifically asking about doctor notes, not full record+notes)
  if (!asksFullRecord && /\b(doctor|clinician|clinical note|physician)\b/.test(promptLower)) {
    return {
      content: [
        `**Clinician-Authored Notes — ${doc.patient.name} (${doc.id})**`,
        formatDoctorNotes(doc),
      ].join("\n"),
      hasClinicalDisclaimer: true,
      isDraftNotice: true,
      modeLabel: "Mock Assist • Medical Record",
    };
  }

  // Lab findings / abnormal values
  if (/\b(lab|laboratory|abnormal|flagged|high|low|critical|finding)\b/.test(promptLower)) {
    const flaggedFields = doc.extractedFields.filter((f) => f.flag && f.flag !== "normal");
    const isAbnormalFocus = /\b(abnormal|flagged)\b/.test(promptLower);
    const fieldsToShow = isAbnormalFocus && flaggedFields.length > 0 ? flaggedFields : doc.extractedFields;
    const formatted = fieldsToShow
      .map((f) => {
        const flagTag = f.flag && f.flag !== "normal" ? `FLAGGED ${f.flag.toUpperCase()}` : "Normal";
        return `- **${f.fieldName}**: ${f.rawValue} | Unit: ${f.unit || "N/A"} | Ref: ${
          f.referenceRange || "Not specified"
        } | Status: ${flagTag} | Source: ${doc.typeLabel} (${doc.id})`;
      })
      .join("\n");

    return {
      content: [
        `**${isAbnormalFocus ? "Flagged Abnormal Source Values" : "Laboratory & Extracted Findings"} — ${doc.patient.name} (${doc.id})**`,
        formatted || "- No flagged abnormal values are recorded in this document.",
      ].join("\n"),
      hasClinicalDisclaimer: true,
      isDraftNotice: true,
      modeLabel: "Mock Assist • Medical Record",
    };
  }

  // Compare patient-reported with documented findings
  if (/\b(compare|correlation|match)\b/.test(promptLower)) {
    return {
      content: [
        `**Comparison: Patient-Reported Intake vs. Documented Findings (${doc.id})**`,
        "",
        "**Patient-Reported Intake:**",
        formatPatientReported(doc),
        "",
        "**Documented Source Findings:**",
        formatLabFindings(doc),
        "",
        "**Documented Staff & Clinician Context:**",
        doc.staffReview?.notes ? `- Staff Review: ${doc.staffReview.notes}` : "- Staff Review: Pending.",
        formatDoctorNotes(doc),
      ].join("\n"),
      hasClinicalDisclaimer: true,
      isDraftNotice: true,
      modeLabel: "Mock Assist • Medical Record",
    };
  }

  // Handover draft
  if (/\b(handover|handoff|sbar|transfer)\b/.test(promptLower)) {
    return {
      content: [
        `**DRAFT Clinical Handover Summary — ${doc.patient.name} (${doc.patient.id})**`,
        `- **Patient:** ${doc.patient.name}, ${doc.patient.age}y ${doc.patient.gender}, Blood Group ${doc.patient.bloodGroup}`,
        `- **Allergies:** ${doc.patient.allergies.join(", ") || "None documented"}`,
        `- **Chronic Conditions:** ${doc.patient.chronicConditions.join(", ") || "None documented"}`,
        `- **Source Record:** ${doc.title} (${doc.id} • ${doc.reviewStatus})`,
        `- **Attending / Dept:** ${doc.attendingDoctorName} (${doc.departmentName})`,
        `- **Patient-Reported:** ${doc.patientReportedData.symptoms.join("; ") || "None documented"}${
          doc.patientReportedData.intakeNotes ? ` — Note: ${doc.patientReportedData.intakeNotes}` : ""
        }`,
        "- **Key Source Findings:**",
        formatLabFindings(doc),
        "- **Clinician Notes:**",
        formatDoctorNotes(doc),
      ].join("\n"),
      hasClinicalDisclaimer: true,
      isDraftNotice: true,
      modeLabel: "Mock Assist • Draft Handover",
    };
  }

  // Plain language terminology explanation
  if (/\b(terminology|term|plain language|explain|mean)\b/.test(promptLower)) {
    const docText = `${doc.title} ${doc.extractedFields.map((f) => f.fieldName).join(" ")} ${
      doc.aiExtractedData.summary
    } ${doc.patientReportedData.symptoms.join(" ")}`.toLowerCase();

    const matchedTerms = Object.entries(MEDICAL_TERMINOLOGY_GLOSSARY).filter(([term]) =>
      docText.includes(term)
    );
    const definitions =
      matchedTerms.length > 0
        ? matchedTerms.map(([term, desc]) => `- **${term.toUpperCase()}**: ${desc}`).join("\n")
        : "- No specialized laboratory abbreviations matched in the glossary for this document.";

    return {
      content: [
        `**Plain-Language Terminology Guide — ${doc.title} (${doc.id})**`,
        definitions,
      ].join("\n"),
      hasClinicalDisclaimer: true,
      modeLabel: "Mock Assist • Terminology",
    };
  }

  // Default full medical record summary (including first prompt or general follow-up)
  const hadPrevious = history.some((m) => m.role === "assistant");
  return {
    content: buildMedicalRecordSummary(doc, false) + (hadPrevious ? "" : ""),
    hasClinicalDisclaimer: true,
    isDraftNotice: true,
    modeLabel: "Mock Assist • Medical Record",
  };
}

function buildContextualMockResponse(
  prompt: string,
  pageContext: PageContext,
  data: LoadedAuthorizedContext,
  history: AIMessage[]
): AssistantReplyPayload {
  const promptLower = prompt.trim().toLowerCase();

  // 1. Permission / Availability gate
  if (!data.isAuthorized) {
    return {
      content: `Access Restricted / Data Unavailable: ${
        data.unavailableReason ||
        "You do not have permission or an active campus scope to view the requested record."
      }`,
      isRefusal: true,
      modeLabel: "Access Verification",
    };
  }

  // 2. Clinical & operational safety guardrails
  const refusal = checkSafetyGuardrail(promptLower);
  if (refusal) {
    return {
      content: refusal,
      isRefusal: true,
      modeLabel: "Clinical Safety Policy",
    };
  }

  const campusHeader = `${data.facilityName} — ${data.campusName}`;

  // 3. Medical Records Module
  if (pageContext.pageId === "document-detail" || pageContext.pageId === "documents") {
    const targetDoc = data.documentDetail || data.documentsList?.[0] || null;
    if (!targetDoc) {
      return {
        content: `No medical records are currently available under **${campusHeader}**. Switch to a campus containing medical records (e.g., Campus North) or upload a document to summarize it.`,
        modeLabel: "Mock Assist • Medical Records",
      };
    }
    return buildMedicalRecordFollowUp(promptLower, targetDoc, history);
  }

  // 4. AI Medical Review Module
  if (pageContext.pageId === "ai-review") {
    const items = data.aiReviewItems || [];
    if (items.length === 0) {
      return {
        content: `No AI Medical Review documents are currently queued for **${campusHeader}**.`,
        modeLabel: "Mock Assist • AI Review",
      };
    }
    const pending = items.filter((i) => i.status === "pending-review");
    const active = pending[0] || items[0];

    if (/\b(checklist|verify|verification)\b/.test(promptLower)) {
      return {
        content: [
          `**Verification Checklist Draft — ${active.documentTitle} (${active.documentId})**`,
          `- [ ] Confirm patient identity: ${active.patientName} (${active.patientId})`,
          `- [ ] Verify specimen/source reference against original preview (${active.documentPreviewData.specimenId})`,
          ...active.extractedParameters.map(
            (p) =>
              `- [ ] Verify **${p.name}**: \`${p.rawValue}\` (Ref: ${p.referenceRange}, Confidence: ${Math.round(
                p.confidence * 100
              )}%, Source: ${p.sourceRef})`
          ),
          `- [ ] Clinician sign-off required before clinical action (AI never auto-approves).`,
        ].join("\n"),
        hasClinicalDisclaimer: true,
        isDraftNotice: true,
        modeLabel: "Mock Assist • AI Review",
      };
    }

    if (/\b(uncertain|low|confidence)\b/.test(promptLower)) {
      const sorted = [...active.extractedParameters].sort((a, b) => a.confidence - b.confidence);
      return {
        content: [
          `**Confidence Inspection — ${active.patientName} (${active.documentId})**`,
          `Overall OCR confidence: ${Math.round(active.overallConfidence * 100)}% (${active.ocrModel})`,
          ...sorted.map(
            (p) =>
              `- **${p.name}**: ${p.rawValue} — Confidence **${Math.round(p.confidence * 100)}%** (${p.sourceRef})`
          ),
          "",
          "Fields below 95% confidence should be manually cross-checked against the source scan first.",
        ].join("\n"),
        hasClinicalDisclaimer: true,
        modeLabel: "Mock Assist • AI Review",
      };
    }

    if (/\b(compare|original|source|explain|extracted)\b/.test(promptLower)) {
      return {
        content: [
          `**Source Comparison — ${active.documentTitle} (${active.documentId})**`,
          ...active.extractedParameters.map(
            (p) =>
              `- **${p.name}**: Extracted \`${p.cleanedValue} ${p.unit}\` vs Raw \`${p.rawValue}\` (Ref: ${p.referenceRange}, Source: ${p.sourceRef})`
          ),
          "",
          `AI Draft Observation: ${active.preConsultationSummary.headline}`,
        ].join("\n"),
        hasClinicalDisclaimer: true,
        modeLabel: "Mock Assist • AI Review",
      };
    }

    return {
      content: [
        `**AI Medical Review Queue — ${campusHeader}**`,
        `- Total Review Items: ${items.length} | Pending Human Review: ${pending.length}`,
        ...items.map(
          (i) =>
            `- **${i.documentId}** (${i.patientName}): ${i.documentTitle} — Status: \`${i.status}\`, Confidence: ${Math.round(
              i.overallConfidence * 100
            )}%`
        ),
      ].join("\n"),
      hasClinicalDisclaimer: true,
      modeLabel: "Mock Assist • AI Review",
    };
  }

  // 5. Patient Detail / Directory
  if (pageContext.pageId === "patient-detail" && data.patientDetail) {
    const { patient, facilityRecord, stats, visits, appointments, documents } = data.patientDetail;
    const age = calculateAge(patient.dateOfBirth);

    if (/\b(missing|incomplete|administrative)\b/.test(promptLower)) {
      const missing: string[] = [];
      if (!facilityRecord.email) missing.push("Email address");
      if (!facilityRecord.lastVisit) missing.push("Recorded visit date");
      if (!patient.bloodGroup || patient.bloodGroup === "Unknown") missing.push("Verified blood group");
      if (!facilityRecord.knownAllergies?.length) missing.push("Allergy confirmation");
      if (!facilityRecord.emergencyContactPhone) missing.push("Emergency contact phone");
      return {
        content: [
          `**Administrative Completeness Check — ${patient.firstName} ${patient.lastName} (${facilityRecord.facilityPatientId})**`,
          missing.length > 0
            ? missing.map((m) => `- Missing / Unverified: ${m}`).join("\n")
            : "- All core administrative demographics, emergency contacts, and registration details are complete on file.",
        ].join("\n"),
        modeLabel: "Mock Assist • Patient Record",
      };
    }

    if (/\b(visit|history)\b/.test(promptLower)) {
      return {
        content: [
          `**Documented Visit History — ${patient.firstName} ${patient.lastName} (${facilityRecord.facilityPatientId})**`,
          `- Completed Visits: ${stats.completedVisits} | Upcoming Appointments: ${stats.upcomingAppointments} | Last Visit: ${stats.lastVisit}`,
          ...(visits.length > 0
            ? visits.map(
                (v) => `- **${v.visitDate}** — ${v.department} (${v.attendingDoctor}): ${v.visitSummary} [Status: ${v.visitStatus}]`
              )
            : ["- No historical clinical encounters recorded yet."]),
        ].join("\n"),
        hasClinicalDisclaimer: true,
        modeLabel: "Mock Assist • Patient Visits",
      };
    }

    if (/\b(handover|handoff)\b/.test(promptLower)) {
      return {
        content: [
          `**DRAFT Patient Handover Summary — ${patient.firstName} ${patient.lastName} (${facilityRecord.facilityPatientId})**`,
          `- Demographics: ${age} yrs, ${patient.gender}, Blood Group: ${patient.bloodGroup || "Unknown"}`,
          `- Campus: ${facilityRecord.facilityName} | Status: ${facilityRecord.status}`,
          `- Documented Allergies: ${facilityRecord.knownAllergies?.join(", ") || "None documented"}`,
          `- Documented Conditions: ${facilityRecord.medicalConditions?.join(", ") || "None documented"}`,
          `- Appointments (${appointments.length}): ${
            appointments[0]
              ? `Next/Latest ${appointments[0].appointmentDate} ${appointments[0].time} with ${appointments[0].doctorName}`
              : "None"
          }`,
          `- Attached Documents: ${documents.length}`,
        ].join("\n"),
        hasClinicalDisclaimer: true,
        isDraftNotice: true,
        modeLabel: "Mock Assist • Draft Handover",
      };
    }

    const shorter = /\b(shorter|brief|concise)\b/.test(promptLower);
    if (shorter) {
      return {
        content: `**${patient.firstName} ${patient.lastName}** (${facilityRecord.facilityPatientId}): ${age}y ${patient.gender}, Blood Group ${
          patient.bloodGroup || "Unknown"
        }, Status: ${facilityRecord.status}. Allergies: ${
          facilityRecord.knownAllergies?.join(", ") || "None"
        }. Visits: ${stats.completedVisits}, Appointments: ${stats.totalAppointments}.`,
        hasClinicalDisclaimer: true,
        modeLabel: "Mock Assist • Patient Profile",
      };
    }

    return {
      content: [
        `**Patient Profile Summary — ${patient.firstName} ${patient.lastName} (${facilityRecord.facilityPatientId})**`,
        `- Age / Gender: ${age} yrs • ${patient.gender} | Blood Group: ${patient.bloodGroup || "Unknown"}`,
        `- Facility Status: ${facilityRecord.status} (Registered ${facilityRecord.registrationDate})`,
        `- Contact: ${facilityRecord.phoneNumber}${facilityRecord.email ? ` • ${facilityRecord.email}` : ""}`,
        `- Emergency Contact: ${facilityRecord.emergencyContactName} (${facilityRecord.emergencyContactRelation}) — ${facilityRecord.emergencyContactPhone}`,
        `- Allergies: ${facilityRecord.knownAllergies?.join(", ") || "None documented"}`,
        `- Chronic Conditions: ${facilityRecord.medicalConditions?.join(", ") || "None documented"}`,
        `- Activity: ${stats.completedVisits} visits, ${stats.totalAppointments} appointments, ${documents.length} documents.`,
      ].join("\n"),
      hasClinicalDisclaimer: true,
      modeLabel: "Mock Assist • Patient Profile",
    };
  }

  if (pageContext.pageId === "patients" || pageContext.pageId === "patient-new") {
    const list = data.patientsList || [];
    const pending = list.filter((p) => p.facilityRecord.status === "Pending");
    const missingEmail = list.filter((p) => !p.facilityRecord.email);

    if (/\b(missing|incomplete|administrative)\b/.test(promptLower)) {
      return {
        content: [
          `**Missing Administrative Information — ${campusHeader}**`,
          `- Records without email on file (${missingEmail.length}): ${
            missingEmail
              .slice(0, 5)
              .map((p) => `${p.patient.firstName} ${p.patient.lastName} (${p.facilityRecord.facilityPatientId})`)
              .join(", ") || "None"
          }`,
          `- Pending registration verification (${pending.length}): ${
            pending.map((p) => `${p.patient.firstName} ${p.patient.lastName}`).join(", ") || "None"
          }`,
        ].join("\n"),
        modeLabel: "Mock Assist • Patient Directory",
      };
    }

    return {
      content: [
        `**Patient Directory Summary — ${campusHeader}**`,
        `- Total Registered Patients: ${list.length} | Active: ${
          list.filter((p) => p.facilityRecord.status === "Active").length
        } | Pending: ${pending.length}`,
        ...list
          .slice(0, 5)
          .map(
            (p) =>
              `- **${p.patient.firstName} ${p.patient.lastName}** (\`${p.facilityRecord.facilityPatientId}\`) — ${p.age}y ${p.patient.gender}, Status: ${p.facilityRecord.status}`
          ),
      ].join("\n"),
      modeLabel: "Mock Assist • Patient Directory",
    };
  }

  // 6. Appointments Module
  if (
    pageContext.pageId === "appointments" ||
    pageContext.pageId === "appointment-requests" ||
    pageContext.pageId === "appointment-calendar" ||
    pageContext.pageId === "appointment-new" ||
    pageContext.pageId === "appointment-detail"
  ) {
    const apts = data.appointmentsList || [];
    const single = data.appointmentDetail;
    const pending = apts.filter((a) =>
      ["Requested", "Under Review", "Awaiting Patient Response", "Reschedule Requested"].includes(a.status)
    );

    if (/\b(confirm|confirmation message)\b/.test(promptLower)) {
      const ref = single || apts.find((a) => a.status === "Confirmed") || apts[0];
      return {
        content: ref
          ? [
              "**DRAFT Appointment Confirmation Message (For Staff Review Before Sending)**",
              `Hello ${ref.patientName}, your appointment (${ref.id}) with ${ref.doctorName} (${ref.department}) at ${data.facilityName} — ${data.campusName} is scheduled for ${ref.appointmentDate} at ${ref.timeSlot}. Please arrive 15 minutes early for front-desk check-in.`,
            ].join("\n\n")
          : `No appointment record available at ${campusHeader} to draft a message.`,
        isDraftNotice: true,
        modeLabel: "Mock Assist • Draft Message",
      };
    }

    if (/\b(reschedul|alternative)\b/.test(promptLower)) {
      const ref = single || pending[0] || apts[0];
      return {
        content: ref
          ? [
              "**DRAFT Appointment Rescheduling Message (For Staff Review Before Sending)**",
              `Hello ${ref.patientName}, regarding your appointment request (${ref.id}) with ${ref.doctorName} (${ref.department}) at ${data.campusName}, the requested time is currently unavailable. Could we confirm an alternative slot? Please reply or contact the reception desk to select your preferred time.`,
            ].join("\n\n")
          : `No appointment record available at ${campusHeader} to draft a rescheduling message.`,
        isDraftNotice: true,
        modeLabel: "Mock Assist • Draft Message",
      };
    }

    if (/\b(conflict|overlap|double)\b/.test(promptLower)) {
      const activeApts = apts.filter((a) => ["Confirmed", "Under Review", "Requested"].includes(a.status));
      const seen = new Map<string, string[]>();
      const conflicts: string[] = [];
      for (const a of activeApts) {
        if (!a.doctorId) continue;
        const key = `${a.doctorId}|${a.appointmentDate}|${a.timeSlot}`;
        const list = seen.get(key) || [];
        list.push(`${a.id} (${a.patientName})`);
        seen.set(key, list);
        if (list.length === 2) {
          conflicts.push(`- ${a.doctorName} on ${a.appointmentDate} at ${a.timeSlot}: ${list.join(" & ")}`);
        }
      }
      return {
        content:
          conflicts.length > 0
            ? `**Detected Scheduling Overlaps — ${campusHeader}**\n${conflicts.join("\n")}`
            : `**Schedule Conflict Check — ${campusHeader}**\nNo overlapping bookings detected across ${activeApts.length} active appointments for this campus.`,
        modeLabel: "Mock Assist • Schedule Check",
      };
    }

    if (/\b(pending|request|awaiting|review)\b/.test(promptLower)) {
      return {
        content: [
          `**Appointment Requests Awaiting Review — ${campusHeader} (${pending.length})**`,
          ...(pending.length > 0
            ? pending.map(
                (a) =>
                  `- **${a.id}** — ${a.patientName} (${a.department}, ${a.appointmentDate} ${a.timeSlot}) — Status: **${a.status}**`
              )
            : ["- No pending appointment requests at this campus."]),
        ].join("\n"),
        modeLabel: "Mock Assist • Appointments",
      };
    }

    if (single) {
      return {
        content: [
          `**Appointment Summary — ${single.id}**`,
          `- Patient: ${single.patientName} (${single.facilityPatientId}, ${single.patientAge}y ${single.patientGender})`,
          `- Clinician: ${single.doctorName || "Unassigned"} (${single.department})`,
          `- Schedule: ${single.appointmentDate} at ${single.timeSlot} (${single.durationMinutes} min)`,
          `- Status: **${single.status}** | Source: ${single.source}`,
          `- Reason: ${single.reasonForVisit}`,
        ].join("\n"),
        modeLabel: "Mock Assist • Appointment",
      };
    }

    return {
      content: [
        `**Appointment Schedule Summary — ${campusHeader}**`,
        `- Total Campus Appointments: ${apts.length} | Confirmed: ${
          apts.filter((a) => a.status === "Confirmed").length
        } | Pending Requests: ${pending.length} | Completed: ${
          apts.filter((a) => a.status === "Completed").length
        }`,
        ...apts
          .slice(0, 5)
          .map(
            (a) =>
              `- **${a.appointmentDate} ${a.timeSlot}**: ${a.patientName} with ${
                a.doctorName || "Unassigned"
              } (${a.department}) — \`${a.status}\``
          ),
      ].join("\n"),
      modeLabel: "Mock Assist • Appointments",
    };
  }

  // 7. Queue Management Module
  if (
    pageContext.pageId === "queue" ||
    pageContext.pageId === "queue-board" ||
    pageContext.pageId === "queue-history" ||
    pageContext.pageId === "queue-detail"
  ) {
    const queue = data.queueList || [];
    const singleQ = data.queueDetail;
    const waiting = queue.filter((q) => q.status === "Waiting" || q.status === "Checked In");
    const completed = queue.filter((q) => q.status === "Completed");
    const inConsult = queue.filter((q) => q.status === "In Consultation");

    if (singleQ && !/\b(waiting|completed|report)\b/.test(promptLower)) {
      return {
        content: [
          `**Queue Token Summary — ${singleQ.queueNumber} (${singleQ.id})**`,
          `- Patient: ${singleQ.patientName} (${singleQ.facilityPatientId})`,
          `- Department / Physician: ${singleQ.department} • ${singleQ.doctorName} (${singleQ.roomNumber || "Triage"})`,
          `- Status: **${singleQ.status}** | Priority: ${singleQ.priority} (set by staff)`,
          `- Check-in: ${singleQ.checkInTime} | Wait: ${
            singleQ.actualWaitMinutes ?? singleQ.estimatedWaitMinutes ?? 0
          } mins`,
        ].join("\n"),
        modeLabel: "Mock Assist • Queue Entry",
      };
    }

    if (/\b(longest|wait time|longest time)\b/.test(promptLower)) {
      const sorted = [...waiting].sort(
        (a, b) =>
          (b.actualWaitMinutes ?? b.estimatedWaitMinutes ?? 0) -
          (a.actualWaitMinutes ?? a.estimatedWaitMinutes ?? 0)
      );
      return {
        content: [
          `**Longest Waiting Patients — ${campusHeader}**`,
          ...(sorted.length > 0
            ? sorted.map(
                (q) =>
                  `- **${q.queueNumber}** ${q.patientName} (${q.department}) — ${
                    q.actualWaitMinutes ?? q.estimatedWaitMinutes ?? 0
                  } mins (${q.status})`
              )
            : ["- No patients currently waiting in queue."]),
        ].join("\n"),
        modeLabel: "Mock Assist • Queue",
      };
    }

    if (/\b(completed)\b/.test(promptLower)) {
      return {
        content: [
          `**Completed Consultations — ${campusHeader} (${completed.length})**`,
          ...(completed.length > 0
            ? completed.map(
                (q) =>
                  `- **${q.queueNumber}** ${q.patientName} with ${q.doctorName} (${q.department}) — Completed at ${
                    q.completionTime || "N/A"
                  }`
              )
            : ["- No completed queue entries recorded for this campus yet."]),
        ].join("\n"),
        modeLabel: "Mock Assist • Queue",
      };
    }

    if (/\b(report|activity|changes)\b/.test(promptLower)) {
      return {
        content: [
          `**DRAFT Queue Activity Report — ${campusHeader}**`,
          `- Total Logged Tokens: ${queue.length} (Today ${QUEUE_TODAY}: ${
            queue.filter((q) => q.appointmentDate === QUEUE_TODAY).length
          })`,
          `- In Consultation: ${inConsult.length} | Waiting/Checked-in: ${waiting.length} | Completed: ${completed.length}`,
          ...queue
            .slice(0, 4)
            .map(
              (q) =>
                `- **${q.queueNumber}** (${q.patientName}): Latest event — ${
                  q.timeline[0]?.title || q.status
                } (${q.timeline[0]?.timestamp || q.checkInTime})`
            ),
        ].join("\n"),
        isDraftNotice: true,
        modeLabel: "Mock Assist • Queue Report",
      };
    }

    return {
      content: [
        `**Current Waiting Queue — ${campusHeader}**`,
        `- Checked In / Waiting: ${waiting.length} | In Consultation: ${inConsult.length} | Completed: ${completed.length}`,
        ...(waiting.length > 0
          ? waiting.map(
              (q) =>
                `- **${q.queueNumber}** ${q.patientName} (${q.department}, ${q.doctorName}) — ${q.status}, ~${
                  q.actualWaitMinutes ?? q.estimatedWaitMinutes ?? 0
                } min wait`
            )
          : ["- Queue is currently clear at this campus."]),
      ].join("\n"),
      modeLabel: "Mock Assist • Queue",
    };
  }

  // 8. Staff Management
  if (pageContext.pageId === "staff") {
    const staff = data.staffMembers || [];
    if (/\b(invitation|invite|draft)\b/.test(promptLower)) {
      return {
        content: [
          `**DRAFT Staff Invitation Message — ${campusHeader}**`,
          `Subject: Invitation to Join ${data.facilityName} (${data.campusName}) on MedKnot Hospital Portal\n\nDear [Staff Member Name],\nYou have been invited to join the ${data.campusName} clinical operations workspace as [Role] in [Department]. Please verify your institutional email and complete your profile activation link within 48 hours.`,
        ].join("\n\n"),
        isDraftNotice: true,
        modeLabel: "Mock Assist • Staff Draft",
      };
    }

    if (/\b(incomplete|missing)\b/.test(promptLower)) {
      const incomplete = staff.filter((s) => !s.phone || !s.shift || s.status !== "active");
      return {
        content: [
          `**Staff Profile Completeness — ${campusHeader}**`,
          incomplete.length > 0
            ? incomplete
                .map(
                  (s) =>
                    `- **${s.name}** (${s.role}) — Status: ${s.status}, Shift: ${s.shift || "Missing"}`
                )
                .join("\n")
            : "- All visible staff profiles contain email, phone, department, role, and shift assignment.",
        ].join("\n"),
        modeLabel: "Mock Assist • Staff",
      };
    }

    const rolesCount = staff.reduce<Record<string, number>>((acc, s) => {
      acc[s.role] = (acc[s.role] || 0) + 1;
      return acc;
    }, {});

    return {
      content: [
        `**Staff Directory Summary — ${campusHeader}**`,
        `- Total Staff Records: ${staff.length} | Active: ${
          staff.filter((s) => s.status === "active").length
        } | On Leave: ${staff.filter((s) => s.status === "on_leave").length}`,
        `- By Role: ${Object.entries(rolesCount)
          .map(([r, c]) => `${r} (${c})`)
          .join(", ")}`,
        ...staff.slice(0, 5).map((s) => `- **${s.name}** — ${s.role} • ${s.department} (${s.shift})`),
      ].join("\n"),
      modeLabel: "Mock Assist • Staff",
    };
  }

  // 9. Staff Tasks
  if (pageContext.pageId === "tasks") {
    const tasks = data.staffTasks || [];
    const pending = tasks.filter((t) => t.status !== "completed");

    if (/\b(reminder|draft)\b/.test(promptLower)) {
      const top = pending[0];
      return {
        content: top
          ? `**DRAFT Task Reminder**\nHi ${top.assignedToName}, friendly reminder regarding "${top.title}" (${top.id}, priority: ${top.priority.toUpperCase()}) due ${top.dueDate}. Please update its status in Staff Tasks once completed.`
          : "No pending staff tasks require a reminder right now.",
        isDraftNotice: true,
        modeLabel: "Mock Assist • Task Draft",
      };
    }

    if (/\b(overdue)\b/.test(promptLower)) {
      const urgentOrDue = pending.filter(
        (t) => t.priority === "urgent" || t.dueDate.toLowerCase().includes("today") || t.dueDate.toLowerCase().includes("yesterday")
      );
      return {
        content: [
          `**Due Today / Priority Tasks — ${campusHeader}**`,
          ...(urgentOrDue.length > 0
            ? urgentOrDue.map(
                (t) =>
                  `- **${t.id}** [${t.priority.toUpperCase()}] ${t.title} — Assigned: ${t.assignedToName} (Due: ${t.dueDate})`
              )
            : ["- No overdue tasks flagged in current campus tasks."]),
        ].join("\n"),
        modeLabel: "Mock Assist • Staff Tasks",
      };
    }

    if (/\b(by staff|assignee|member)\b/.test(promptLower)) {
      const grouped = tasks.reduce<Record<string, string[]>>((acc, t) => {
        acc[t.assignedToName] = acc[t.assignedToName] || [];
        acc[t.assignedToName].push(`${t.title} (${t.status})`);
        return acc;
      }, {});
      return {
        content: [
          `**Tasks Grouped by Staff Member — ${campusHeader}**`,
          ...Object.entries(grouped).map(
            ([name, list]) => `- **${name}** (${list.length}): ${list.join("; ")}`
          ),
        ].join("\n"),
        modeLabel: "Mock Assist • Staff Tasks",
      };
    }

    return {
      content: [
        `**Staff Tasks Summary — ${campusHeader}**`,
        `- Total: ${tasks.length} | Pending/In Progress: ${pending.length} | Completed: ${
          tasks.length - pending.length
        }`,
        ...pending.map(
          (t) => `- **${t.id}** ${t.title} — ${t.assignedToName} (Due: ${t.dueDate}, Status: ${t.status})`
        ),
      ].join("\n"),
      modeLabel: "Mock Assist • Staff Tasks",
    };
  }

  // 10. Doctors & Departments
  if (pageContext.pageId === "doctors" || pageContext.pageId === "departments") {
    const doctors = data.doctors || [];
    const depts = data.departments || [];

    if (/\b(gap|scheduling|schedule)\b/.test(promptLower)) {
      const wedGap = doctors
        .filter((d) => !d.availabilitySchedule.Wednesday.slots.some((s) => s.startTime >= "14:00"))
        .map((d) => d.name);
      return {
        content: [
          `**Schedule Coverage & Gaps — ${campusHeader}**`,
          `- Doctors available on current campus: ${doctors.length}`,
          `- **Wednesday Afternoon Gap:** ${wedGap.join(", ") || "None"} currently show Morning OPD only (09:00–13:00).`,
          `- **Sunday Coverage:** Routine OPD closed; Emergency covered by on-call doctors (${doctors
            .filter((d) => d.onCall)
            .map((d) => d.name)
            .join(", ")}).`,
        ].join("\n"),
        modeLabel: "Mock Assist • Doctors & Schedules",
      };
    }

    if (pageContext.pageId === "departments" || /\b(department)\b/.test(promptLower)) {
      return {
        content: [
          `**Department Summary — ${campusHeader} (${depts.length} Active)**`,
          ...depts.map(
            (d) =>
              `- **${d.name}** (${d.code}): ${d.occupiedBeds}/${d.totalBeds} beds occupied, Head: ${d.headDoctorName}, Hours: ${d.operatingHours}`
          ),
        ].join("\n"),
        modeLabel: "Mock Assist • Departments",
      };
    }

    return {
      content: [
        `**Doctor Availability — ${campusHeader} (${doctors.length} Physicians)**`,
        ...doctors.map(
          (d) =>
            `- **${d.name}** (${d.departmentName}): Status \`${d.status}\`, On Call: ${
              d.onCall ? "Yes" : "No"
            }, Suite: ${d.roomNumber}`
        ),
      ].join("\n"),
      modeLabel: "Mock Assist • Doctors",
    };
  }

  // 11. Facility Settings & Settings Hub
  if (pageContext.pageId === "facility-settings" || pageContext.pageId === "settings") {
    const fs = data.facilitySettings;
    const authFacilities = FacilityService.getAuthorizedFacilities();
    if (/\b(campus|configuration|hierarchy)\b/.test(promptLower)) {
      return {
        content: [
          `**Multi-Facility & Campus Configuration**`,
          `- Active Facility: **${data.facilityName}** (${data.facilityId})`,
          `- Active Campus: **${data.campusName}** (${data.campusId})`,
          `- Authorized Facilities in Your Scope (${authFacilities.length}):`,
          ...authFacilities.map(
            (f) => `- ${f.name}: ${f.campuses.map((c) => `${c.name} [${c.status}]`).join(", ")}`
          ),
        ].join("\n"),
        modeLabel: "Mock Assist • Facility Config",
      };
    }

    if (/\b(draft|update)\b/.test(promptLower)) {
      return {
        content: `**DRAFT Administrative Update — ${campusHeader}**\nAttention ${data.campusName} Teams: Please ensure all facility registration contacts, campus shift rosters, and compliance checklists remain up to date in the Facility Settings portal prior to the next quality review cycle.`,
        isDraftNotice: true,
        modeLabel: "Mock Assist • Facility Draft",
      };
    }

    return {
      content: fs
        ? [
            `**Facility Information Summary — ${fs.facilityName}**`,
            `- Type: ${fs.facilityType} | Registration: ${fs.registrationNumber} | Status: ${fs.activeStatus}`,
            `- Capacity: ${fs.totalBeds} Total Beds, ${fs.icuBeds} ICU Beds, ${fs.operatingTheaters} Modular OTs (${fs.traumaLevel})`,
            `- Accreditations: ${fs.accreditations.join(", ")}`,
            `- Next Quality Renewal: ${fs.nextRenewalDate}`,
          ].join("\n")
        : `**Campus Overview — ${campusHeader}**\nDetailed institutional certificate fields are maintained at the primary Campus North administrative node. Basic campus parameters for ${data.campusName} are active and operational.`,
      modeLabel: "Mock Assist • Facility Settings",
    };
  }

  // 12. Dashboard / Reports / Profile Default
  const apts = data.appointmentsList || [];
  const queue = data.queueList || [];
  const tasks = data.staffTasks || [];
  const pendingApts = apts.filter((a) =>
    ["Requested", "Under Review", "Awaiting Patient Response", "Reschedule Requested"].includes(a.status)
  );
  const activeQueue = queue.filter((q) => ["Checked In", "Waiting", "In Consultation"].includes(q.status));
  const pendingTasks = tasks.filter((t) => t.status !== "completed");

  if (/\b(report|daily operational)\b/.test(promptLower)) {
    return {
      content: [
        `**DRAFT Daily Operational Report — ${campusHeader}**`,
        `- **Registered Patients:** ${(data.patientsList || []).length}`,
        `- **Appointments:** ${apts.length} total (${apts.filter((a) => a.status === "Confirmed").length} confirmed, ${
          apts.filter((a) => a.status === "Completed").length
        } completed, ${pendingApts.length} pending requests)`,
        `- **OPD Queue:** ${activeQueue.length} active patients (${queue.filter((q) => q.status === "Completed").length} completed consultations)`,
        `- **Staff Tasks:** ${pendingTasks.length} pending/in-progress items`,
        `- **AI Review Queue:** ${(data.aiReviewItems || []).filter((i) => i.status === "pending-review").length} documents awaiting human clinician verification`,
      ].join("\n"),
      isDraftNotice: true,
      modeLabel: "Mock Assist • Operational Draft",
    };
  }

  return {
    content: [
      `**Operational Activity Summary — ${campusHeader}**`,
      `- **Appointments:** ${apts.length} scheduled records (${pendingApts.length} pending staff triage)`,
      `- **Live Queue:** ${activeQueue.length} active tokens (${queue.filter((q) => q.status === "Waiting").length} waiting, ${
        queue.filter((q) => q.status === "In Consultation").length
      } in consultation)`,
      `- **Pending Staff Tasks:** ${pendingTasks.length} open items`,
      `- **Staff Attention Needed:** ${
        pendingApts.length > 0
          ? `${pendingApts.length} appointment requests awaiting review`
          : "No urgent appointment request backlog"
      }; ${(data.aiReviewItems || []).filter((i) => i.status === "pending-review").length} AI-extracted documents pending review.`,
    ].join("\n"),
    modeLabel: "Mock Assist • Dashboard",
  };
}

/**
 * Global MedKnot AI Assistant Service
 *
 * // [PENDING BACKEND] Replace mock responder with authenticated POST /api/v1/ai/chat endpoint
 * // ensuring server-side RBAC, campus tenant isolation, and HIPAA-compliant audit logging.
 */
export const AIAssistantService = {
  async sendMessage(
    prompt: string,
    pageContext: PageContext,
    conversationHistory: AIMessage[]
  ): Promise<AssistantReplyPayload> {
    // Load & authorize fresh context from active services at request time
    const authorizedData = loadAuthorizedPageData(pageContext);

    // Simulated async processing delay for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 480));

    const reply = buildContextualMockResponse(
      prompt,
      pageContext,
      authorizedData,
      conversationHistory
    );

    if (reply.hasClinicalDisclaimer) {
      reply.content = `${reply.content}\n\n${CLINICAL_DISCLAIMER}`;
    } else if (reply.isDraftNotice) {
      reply.content = `${reply.content}\n\n${ADMIN_DISCLAIMER}`;
    }

    return reply;
  },
};
