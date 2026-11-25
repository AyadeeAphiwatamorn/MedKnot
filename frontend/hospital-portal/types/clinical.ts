export interface AvailabilitySlot {
  id: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  maxPatients: number;
}

export interface DaySchedule {
  available: boolean;
  slots: AvailabilitySlot[];
}

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface Doctor {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  qualifications: string;
  licenseNumber: string;
  experienceYears: number;
  departmentId: string;
  departmentName: string;
  primarySpecialty: string;
  secondarySpecialties: string[];
  roomNumber: string;
  consultationFee: number;
  status: "active" | "on-leave" | "in-surgery" | "off-duty";
  onCall: boolean;
  avatarUrl?: string;
  bio: string;
  rating?: number;
  patientsCount?: number;
  campusIds?: string[];
  availabilitySchedule: Record<DayOfWeek, DaySchedule>;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headDoctorId: string;
  headDoctorName: string;
  description: string;
  location: string;
  floor: string;
  extensionPhone: string;
  operatingHours: string;
  status: "active" | "maintenance" | "emergency-only";
  specialties: string[];
  totalBeds: number;
  occupiedBeds: number;
  emergencyCapable: boolean;
  iconName: string;
  doctorCount?: number;
  campusIds?: string[];
}

export interface FacilitySettings {
  facilityName: string;
  facilityType: string;
  registrationNumber: string;
  taxId: string;
  yearEstablished: string;
  website: string;
  overview: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  streetAddress: string;
  contactDesk: string;
  emergencyDesk: string;
  registryEmail: string;
  supportEmail: string;
  adminName: string;
  adminDesignation: string;
  adminEmail: string;
  adminPhone: string;
  accreditations: string[];
  totalBeds: number;
  icuBeds: number;
  operatingTheaters: number;
  traumaLevel: string;
  is24x7Emergency: boolean;
  activeStatus: "Operational" | "Maintenance" | "Emergency Surge";
  lastAuditDate: string;
  nextRenewalDate: string;
}
