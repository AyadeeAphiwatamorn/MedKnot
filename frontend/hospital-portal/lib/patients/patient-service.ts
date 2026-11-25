import {
  Patient,
  FacilityPatient,
  PatientAppointment,
  PatientVisit,
  PatientDocument,
  PatientTimelineEvent,
  PatientDetailViewData,
  CreatePatientInput,
  PatientDirectoryStats,
  BloodGroup,
} from "./types";
import {
  INITIAL_PATIENTS,
  INITIAL_FACILITY_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_VISITS,
  INITIAL_DOCUMENTS,
  INITIAL_TIMELINE,
} from "./mock-data";
import { FacilityService } from "../facility/facility-service";

const STORAGE_KEY_PATIENTS = "medknot_patients_list";
const STORAGE_KEY_FACILITY = "medknot_facility_patients";
const STORAGE_KEY_APPOINTMENTS = "medknot_patient_appointments";
const STORAGE_KEY_VISITS = "medknot_patient_visits";
const STORAGE_KEY_DOCS = "medknot_patient_documents";
const STORAGE_KEY_TIMELINE = "medknot_patient_timeline";

/**
 * Calculates current age from YYYY-MM-DD birthdate string
 */
export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Storage helpers (safe for SSR)
 */
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

/**
 * Patient Service: handles directory queries, filtering, creation, and detail retrieval
 */
export const PatientService = {
  /**
   * Retrieves registered facility patients for the active campus (or specified facilityId)
   */
  getAllFacilityPatients(facilityId?: string): { facilityRecord: FacilityPatient; patient: Patient }[] {
    const patients = getStored<Patient[]>(STORAGE_KEY_PATIENTS, INITIAL_PATIENTS);
    const facilityRecords = getStored<FacilityPatient[]>(STORAGE_KEY_FACILITY, INITIAL_FACILITY_PATIENTS);
    const targetFacilityId = facilityId || FacilityService.getActiveCampusId();

    const scopedRecords =
      targetFacilityId === "ALL"
        ? facilityRecords
        : facilityRecords.filter((r) => r.facilityId === targetFacilityId);

    return scopedRecords.map((record) => {
      const p = patients.find((pat) => pat.id === record.patientId) || {
        id: record.patientId,
        firstName: "Unknown",
        lastName: "Patient",
        dateOfBirth: "1990-01-01",
        gender: "Other",
      };
      return { facilityRecord: record, patient: p };
    });
  },

  /**
   * Filtered directory search
   */
  queryPatients(options?: {
    search?: string;
    status?: string;
    gender?: string;
    sortBy?: "newest" | "oldest" | "name" | "lastVisit";
    facilityId?: string;
  }): { facilityRecord: FacilityPatient; patient: Patient; age: number }[] {
    const all = this.getAllFacilityPatients(options?.facilityId);
    const query = (options?.search || "").trim().toLowerCase();
    const statusFilter = options?.status || "All";
    const genderFilter = options?.gender || "All";
    const sortBy = options?.sortBy || "newest";

    const filtered = all.filter(({ facilityRecord, patient }) => {
      // 1. Search filter: Patient name, ID, phone
      if (query) {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const patId = facilityRecord.facilityPatientId.toLowerCase();
        const phone = facilityRecord.phoneNumber.replace(/\s+/g, "");
        const cleanQuery = query.replace(/\s+/g, "");

        const matchesName = fullName.includes(query);
        const matchesId = patId.includes(query);
        const matchesPhone = phone.includes(cleanQuery);

        if (!matchesName && !matchesId && !matchesPhone) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== "All" && facilityRecord.status !== statusFilter) {
        return false;
      }

      // 3. Gender filter
      if (genderFilter !== "All" && patient.gender !== genderFilter) {
        return false;
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        const nameA = `${a.patient.firstName} ${a.patient.lastName}`;
        const nameB = `${b.patient.firstName} ${b.patient.lastName}`;
        return nameA.localeCompare(nameB);
      }
      if (sortBy === "oldest") {
        return new Date(a.facilityRecord.registrationDate).getTime() - new Date(b.facilityRecord.registrationDate).getTime();
      }
      if (sortBy === "lastVisit") {
        const timeA = a.facilityRecord.lastVisit ? new Date(a.facilityRecord.lastVisit).getTime() : 0;
        const timeB = b.facilityRecord.lastVisit ? new Date(b.facilityRecord.lastVisit).getTime() : 0;
        return timeB - timeA;
      }
      // default: newest
      return new Date(b.facilityRecord.registrationDate).getTime() - new Date(a.facilityRecord.registrationDate).getTime();
    });

    return filtered.map((item) => ({
      ...item,
      age: calculateAge(item.patient.dateOfBirth),
    }));
  },

  /**
   * Retrieves summary statistics for the patient directory header
   */
  getDirectoryStats(facilityId?: string): PatientDirectoryStats {
    const targetFacilityId = facilityId || FacilityService.getActiveCampusId();
    const allRecords = getStored<FacilityPatient[]>(STORAGE_KEY_FACILITY, INITIAL_FACILITY_PATIENTS);
    const facilityRecords =
      targetFacilityId === "ALL"
        ? allRecords
        : allRecords.filter((r) => r.facilityId === targetFacilityId);

    const totalPatients = facilityRecords.length;
    const activePatients = facilityRecords.filter((r) => r.status === "Active").length;
    const pendingRegistrations = facilityRecords.filter((r) => r.status === "Pending").length;

    // Count new in November 2024 or recent 30 days
    const newThisMonth = facilityRecords.filter((r) => {
      const reg = new Date(r.registrationDate);
      return reg.getFullYear() === 2024 && reg.getMonth() === 10; // Nov 2024
    }).length;

    return {
      totalPatients,
      activePatients,
      pendingRegistrations,
      newThisMonth: Math.max(3, newThisMonth),
    };
  },

  /**
   * Retrieves full patient details workspace data by facilityPatientId
   */
  getPatientById(facilityPatientId: string): PatientDetailViewData | null {
    const patients = getStored<Patient[]>(STORAGE_KEY_PATIENTS, INITIAL_PATIENTS);
    const facilityRecords = getStored<FacilityPatient[]>(STORAGE_KEY_FACILITY, INITIAL_FACILITY_PATIENTS);
    const appointments = getStored<PatientAppointment[]>(STORAGE_KEY_APPOINTMENTS, INITIAL_APPOINTMENTS);
    const visits = getStored<PatientVisit[]>(STORAGE_KEY_VISITS, INITIAL_VISITS);
    const documents = getStored<PatientDocument[]>(STORAGE_KEY_DOCS, INITIAL_DOCUMENTS);
    const timeline = getStored<PatientTimelineEvent[]>(STORAGE_KEY_TIMELINE, INITIAL_TIMELINE);

    const facilityRecord = facilityRecords.find((r) => r.facilityPatientId === facilityPatientId);
    if (!facilityRecord) return null;

    const patient = patients.find((p) => p.id === facilityRecord.patientId) || {
      id: facilityRecord.patientId,
      firstName: "Patient",
      lastName: "Profile",
      dateOfBirth: "1990-01-01",
      gender: "Other",
    };

    const patientAppointments = appointments.filter((a) => a.facilityPatientId === facilityPatientId);
    const patientVisits = visits.filter((v) => v.facilityPatientId === facilityPatientId);
    const patientDocs = documents.filter((d) => d.facilityPatientId === facilityPatientId);
    const patientTimeline = timeline.filter((t) => t.facilityPatientId === facilityPatientId);

    // Stats
    const totalAppointments = patientAppointments.length;
    const completedVisits = patientVisits.length;
    const upcomingAppointments = patientAppointments.filter((a) => a.status === "Scheduled").length;
    const lastVisit = facilityRecord.lastVisit || "No recorded visits";

    return {
      patient,
      facilityRecord,
      appointments: patientAppointments,
      visits: patientVisits,
      documents: patientDocs,
      timeline: patientTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      stats: {
        totalAppointments,
        completedVisits,
        upcomingAppointments,
        lastVisit,
      },
    };
  },

  /**
   * Registers a new patient into the facility
   */
  createPatient(input: CreatePatientInput): { patient: Patient; facilityRecord: FacilityPatient } {
    const patients = getStored<Patient[]>(STORAGE_KEY_PATIENTS, INITIAL_PATIENTS);
    const facilityRecords = getStored<FacilityPatient[]>(STORAGE_KEY_FACILITY, INITIAL_FACILITY_PATIENTS);
    const timeline = getStored<PatientTimelineEvent[]>(STORAGE_KEY_TIMELINE, INITIAL_TIMELINE);

    const nextIndex = facilityRecords.length + 101;
    const facilityPatientId = `MK-PT-2024-00${nextIndex}`;
    const globalPatientId = `PT-GLOBAL-${Math.floor(80000 + Math.random() * 19999)}`;
    const today = new Date().toISOString().split("T")[0];

    const newPatient: Patient = {
      id: globalPatientId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      bloodGroup: input.bloodGroup || "Unknown",
      photoUrl: input.photoUrl || null,
      nationalIdMasked: `•••-••-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    const allergiesList = input.knownAllergies
      ? input.knownAllergies.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const conditionsList = input.medicalConditions
      ? input.medicalConditions.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const activeCtx = FacilityService.getActiveContext();
    const newFacilityRecord: FacilityPatient = {
      facilityPatientId,
      patientId: globalPatientId,
      facilityId: activeCtx.campus.id,
      facilityName: `${activeCtx.facility.name} (${activeCtx.campus.name})`,
      status: "Active",
      registrationDate: today,
      lastVisit: null,
      phoneNumber: input.phoneNumber.trim(),
      email: input.email ? input.email.trim() : undefined,
      address: input.address.trim(),
      city: input.city.trim(),
      state: input.state.trim(),
      postalCode: input.postalCode.trim(),
      emergencyContactName: input.emergencyContactName.trim(),
      emergencyContactRelation: input.emergencyContactRelation.trim(),
      emergencyContactPhone: input.emergencyContactPhone.trim(),
      knownAllergies: allergiesList,
      medicalConditions: conditionsList,
      registrationNotes: input.registrationNotes?.trim(),
      primaryDepartment: "General Ward",
    };

    const newTimelineEvent: PatientTimelineEvent = {
      id: `TL-NEW-${Date.now()}`,
      facilityPatientId,
      timestamp: `${today} 10:00 AM`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      eventType: "registration",
      title: "Patient Intake & Registration",
      description: `Patient enrolled at St. Jude North Campus. Record generated with ID ${facilityPatientId}.`,
      actor: "Hospital Admissions Staff",
      icon: "badge",
    };

    patients.unshift(newPatient);
    facilityRecords.unshift(newFacilityRecord);
    timeline.unshift(newTimelineEvent);

    setStored(STORAGE_KEY_PATIENTS, patients);
    setStored(STORAGE_KEY_FACILITY, facilityRecords);
    setStored(STORAGE_KEY_TIMELINE, timeline);

    return { patient: newPatient, facilityRecord: newFacilityRecord };
  },

  /**
   * Updates an existing patient record
   */
  updatePatient(
    facilityPatientId: string,
    updates: Partial<FacilityPatient> & { firstName?: string; lastName?: string; bloodGroup?: BloodGroup }
  ): FacilityPatient | null {
    const patients = getStored<Patient[]>(STORAGE_KEY_PATIENTS, INITIAL_PATIENTS);
    const facilityRecords = getStored<FacilityPatient[]>(STORAGE_KEY_FACILITY, INITIAL_FACILITY_PATIENTS);

    const recordIndex = facilityRecords.findIndex((r) => r.facilityPatientId === facilityPatientId);
    if (recordIndex === -1) return null;

    const record = facilityRecords[recordIndex];
    const patientIndex = patients.findIndex((p) => p.id === record.patientId);

    // Update facility record
    const updatedRecord: FacilityPatient = {
      ...record,
      ...updates,
    };
    facilityRecords[recordIndex] = updatedRecord;

    // Update patient identity if name / blood group updated
    if (patientIndex !== -1 && (updates.firstName || updates.lastName || updates.bloodGroup)) {
      patients[patientIndex] = {
        ...patients[patientIndex],
        ...(updates.firstName ? { firstName: updates.firstName } : {}),
        ...(updates.lastName ? { lastName: updates.lastName } : {}),
        ...(updates.bloodGroup ? { bloodGroup: updates.bloodGroup } : {}),
      };
      setStored(STORAGE_KEY_PATIENTS, patients);
    }

    setStored(STORAGE_KEY_FACILITY, facilityRecords);
    return updatedRecord;
  },
};
