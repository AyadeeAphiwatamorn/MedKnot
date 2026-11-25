/**
 * Facility & Campus Management — TypeScript Definitions
 *
 * Conceptual hierarchy:
 *   Facility (e.g., St. Jude Medical Center)
 *     ├── Campus North   (id: "FAC-STJUDE-NORTH")
 *     ├── Campus South   (id: "FAC-STJUDE-SOUTH")
 *     └── Campus Central (id: "FAC-STJUDE-CENTRAL")
 *
 * A Facility is the parent healthcare organization/institution.
 * A Campus is a physical clinical location belonging to a Facility.
 * Note: Existing patient/appointment records use `facilityId` to identify the
 * clinical campus node (e.g., "FAC-STJUDE-NORTH"), so `Campus.id` aligns
 * directly with those existing IDs for seamless data isolation.
 */

export type CampusStatus = "Operational" | "Maintenance" | "Limited";

export interface Campus {
  id: string; // e.g., "FAC-STJUDE-NORTH"
  facilityId: string; // Parent Facility.id, e.g., "FAC-STJUDE"
  name: string; // e.g., "Campus North"
  code: string; // e.g., "NORTH"
  location: string; // e.g., "Bandra East, Mumbai"
  address: string;
  status: CampusStatus;
  isPrimary?: boolean;
}

export interface Facility {
  id: string; // e.g., "FAC-STJUDE"
  name: string; // e.g., "St. Jude Medical Center"
  type: string; // e.g., "Multispecialty Tertiary Hospital"
  location: string; // e.g., "Mumbai, Maharashtra"
  registrationNumber: string;
  campuses: Campus[];
}

export interface FacilityMembership {
  userEmail: string;
  /** Authorized facility IDs */
  authorizedFacilityIds: string[];
  /** Authorized campus IDs (subset of campuses within authorized facilities) */
  authorizedCampusIds: string[];
  /** Default campus ID on initial sign-in */
  defaultCampusId: string;
  roleScope: "Network Admin" | "Facility Admin" | "Campus Staff";
}

export interface ActiveFacilityContextValue {
  /** Currently active parent facility */
  activeFacility: Facility;
  /** Currently active campus within activeFacility */
  activeCampus: Campus;
  /** All facilities the authenticated user is authorized to view */
  authorizedFacilities: Facility[];
  /** Total count of authorized campuses across all authorized facilities */
  totalAuthorizedCampuses: number;
  /** Whether the user has access to more than one campus */
  canSwitchCampus: boolean;
  /** Loading / switching state */
  isLoading: boolean;
  isSwitching: boolean;
  /** Error message if a switch or fetch fails */
  error: string | null;
  /** Switch to a specific authorized campus (and its parent facility) */
  selectCampus: (campusId: string) => Promise<{ ok: boolean; error?: string }>;
  /** Switch to another authorized facility (selects its first authorized campus) */
  selectFacility: (facilityId: string) => Promise<{ ok: boolean; error?: string }>;
  /** Refresh authorized facilities */
  refreshFacilities: () => void;
  /** Clear any transient error */
  clearError: () => void;
}
