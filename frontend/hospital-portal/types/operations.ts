export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "urgent" | "high" | "medium" | "low";
export type UserRole =
  | "Hospital Administrator"
  | "Doctor"
  | "Nursing Staff"
  | "Receptionist";

export interface StaffTask {
  id: string;
  title: string;
  description: string;
  category: "Patient Follow-up" | "Clinical Review" | "Lab Specimen" | "Discharge" | "Facility Maintenance";
  assignedToName: string;
  assignedToRole: UserRole;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  patientId?: string;
  patientName?: string;
  createdAt: string;
  completedAt?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  facility: string;
  status: "active" | "inactive" | "on_leave";
  joinedDate: string;
  lastActive: string;
  shift: string;
}

export interface AppointmentVolumePoint {
  date: string;
  day: string;
  scheduled: number;
  completed: number;
  walkIn: number;
  cancelled: number;
}

export interface QueueWaitTimePoint {
  hour: string;
  triageWait: number; // minutes
  consultationWait: number; // minutes
  totalWait: number; // minutes
}

export interface DepartmentWorkloadPoint {
  name: string;
  departmentCode: string;
  activePatients: number;
  physiciansOnDuty: number;
  utilizationRate: number; // percentage
  color: string;
}
