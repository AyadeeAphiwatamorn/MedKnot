import { Facility, FacilityMembership } from "./types";

/**
 * Master Facility & Campus Registry (Mock — pending backend GET /api/v1/auth/facilities)
 *
 * Hierarchy:
 *   1. St. Jude Medical Center ("FAC-STJUDE")
 *      ├── Campus North   ("FAC-STJUDE-NORTH")   — Primary
 *      ├── Campus South   ("FAC-STJUDE-SOUTH")
 *      └── Campus Central ("FAC-STJUDE-CENTRAL")
 *   2. Mercy General Hospital ("FAC-MERCY")
 *      └── Main Campus    ("FAC-MERCY-MAIN")
 */
export const MOCK_FACILITIES: Facility[] = [
  {
    id: "FAC-STJUDE",
    name: "St. Jude Medical Center",
    type: "Multispecialty Tertiary Hospital",
    location: "Mumbai, Maharashtra",
    registrationNumber: "REG-MH-2024-91024",
    campuses: [
      {
        id: "FAC-STJUDE-NORTH",
        facilityId: "FAC-STJUDE",
        name: "Campus North",
        code: "NORTH",
        location: "Bandra East, Mumbai",
        address: "Plot 18, Medical Knowledge Park, Bandra East",
        status: "Operational",
        isPrimary: true,
      },
      {
        id: "FAC-STJUDE-SOUTH",
        facilityId: "FAC-STJUDE",
        name: "Campus South",
        code: "SOUTH",
        location: "Worli Sea Face, Mumbai",
        address: "142 Dr. Annie Besant Rd, Worli",
        status: "Operational",
      },
      {
        id: "FAC-STJUDE-CENTRAL",
        facilityId: "FAC-STJUDE",
        name: "Campus Central",
        code: "CENTRAL",
        location: "Dadar West, Mumbai",
        address: "88 Shivaji Park Avenue, Dadar West",
        status: "Maintenance",
      },
    ],
  },
  {
    id: "FAC-MERCY",
    name: "Mercy General Hospital",
    type: "Community Acute Care Center",
    location: "Pune, Maharashtra",
    registrationNumber: "REG-MH-2023-44810",
    campuses: [
      {
        id: "FAC-MERCY-MAIN",
        facilityId: "FAC-MERCY",
        name: "Main Campus",
        code: "MAIN",
        location: "Koregaon Park, Pune",
        address: "24 North Main Road, Koregaon Park",
        status: "Operational",
        isPrimary: true,
      },
    ],
  },
];

/**
 * Mock User Facility Memberships (pending backend RBAC / membership endpoint)
 *
 * - Hospital Admin (michael.lee@stjudes.medknot.org):
 *     Authorized for St. Jude (Campus North & Campus South) + Mercy General (Main Campus).
 *     Note: Campus Central ("FAC-STJUDE-CENTRAL") is intentionally NOT in authorizedCampusIds
 *     to enforce and demonstrate permission-based campus isolation.
 * - Physician (dr.chen@stjudes.medknot.org):
 *     Authorized ONLY for St. Jude Campus North (single-campus user behavior).
 */
export const MOCK_MEMBERSHIPS: FacilityMembership[] = [
  {
    userEmail: "michael.lee@stjudes.medknot.org",
    authorizedFacilityIds: ["FAC-STJUDE", "FAC-MERCY"],
    authorizedCampusIds: ["FAC-STJUDE-NORTH", "FAC-STJUDE-SOUTH", "FAC-MERCY-MAIN"],
    defaultCampusId: "FAC-STJUDE-NORTH",
    roleScope: "Network Admin",
  },
  {
    userEmail: "dr.chen@stjudes.medknot.org",
    authorizedFacilityIds: ["FAC-STJUDE"],
    authorizedCampusIds: ["FAC-STJUDE-NORTH"],
    defaultCampusId: "FAC-STJUDE-NORTH",
    roleScope: "Campus Staff",
  },
];
