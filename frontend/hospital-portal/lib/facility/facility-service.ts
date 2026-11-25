import { Campus, Facility, FacilityMembership } from "./types";
import { MOCK_FACILITIES, MOCK_MEMBERSHIPS } from "./mock-data";
import { UserSession, DEFAULT_ADMIN, getClientSession, setClientSession } from "@/lib/auth";

export const ACTIVE_CAMPUS_STORAGE_KEY = "medknot_active_campus_id";
export const FACILITY_CHANGED_EVENT = "medknot:facility-changed";

/**
 * Resolves membership permissions for the authenticated user.
 * [PENDING BACKEND] Replace with server-verified JWT / RBAC facility-membership lookup:
 *   GET /api/v1/auth/facility-memberships
 */
export function getUserMembership(user?: UserSession | null): FacilityMembership {
  const email = (user?.email || DEFAULT_ADMIN.email).trim().toLowerCase();

  const exactMatch = MOCK_MEMBERSHIPS.find(
    (m) => m.userEmail.toLowerCase() === email
  );
  if (exactMatch) return exactMatch;

  // Fallback by role: Hospital Admin gets multi-campus access; clinical staff default to single campus
  if (user?.role === "Hospital Admin" || !user) {
    return MOCK_MEMBERSHIPS[0];
  }

  return {
    userEmail: email,
    authorizedFacilityIds: ["FAC-STJUDE"],
    authorizedCampusIds: ["FAC-STJUDE-NORTH"],
    defaultCampusId: "FAC-STJUDE-NORTH",
    roleScope: "Campus Staff",
  };
}

export const FacilityService = {
  /**
   * Returns only the facilities and campuses the authenticated user
   * is explicitly authorized to access.
   */
  getAuthorizedFacilities(user?: UserSession | null): Facility[] {
    const membership = getUserMembership(user);

    return MOCK_FACILITIES.filter((fac) =>
      membership.authorizedFacilityIds.includes(fac.id)
    )
      .map((fac) => ({
        ...fac,
        campuses: fac.campuses.filter((c) =>
          membership.authorizedCampusIds.includes(c.id)
        ),
      }))
      .filter((fac) => fac.campuses.length > 0);
  },

  /**
   * Checks whether a given campusId is authorized for the user.
   */
  isCampusAuthorized(campusId: string, user?: UserSession | null): boolean {
    const membership = getUserMembership(user);
    return membership.authorizedCampusIds.includes(campusId);
  },

  /**
   * Resolves the currently active { facility, campus } from persisted storage,
   * validating authorization before returning. Falls back to the user's default campus.
   */
  getActiveContext(user?: UserSession | null): { facility: Facility; campus: Campus } {
    const authorizedFacilities = this.getAuthorizedFacilities(user);
    const membership = getUserMembership(user);

    let storedCampusId: string | null = null;
    if (typeof window !== "undefined") {
      try {
        storedCampusId = localStorage.getItem(ACTIVE_CAMPUS_STORAGE_KEY);
      } catch {
        storedCampusId = null;
      }
    }

    const candidateId =
      storedCampusId && this.isCampusAuthorized(storedCampusId, user)
        ? storedCampusId
        : membership.defaultCampusId;

    for (const fac of authorizedFacilities) {
      const foundCampus = fac.campuses.find((c) => c.id === candidateId);
      if (foundCampus) {
        return { facility: fac, campus: foundCampus };
      }
    }

    // Guaranteed fallback to first authorized facility & campus
    const fallbackFacility = authorizedFacilities[0] || MOCK_FACILITIES[0];
    const fallbackCampus = fallbackFacility.campuses[0] || MOCK_FACILITIES[0].campuses[0];
    return { facility: fallbackFacility, campus: fallbackCampus };
  },

  /**
   * Returns the active campus ID (safe helper for data services).
   */
  getActiveCampusId(user?: UserSession | null): string {
    const currentUser = user ?? (typeof window !== "undefined" ? getClientSession() : null);
    return this.getActiveContext(currentUser).campus.id;
  },

  /**
   * Validates permission and switches the active campus context.
   * Persists to localStorage and syncs UserSession cookie + storage.
   *
   * [PENDING BACKEND] Must also call POST /api/v1/auth/switch-campus and
   * obtain a facility-scoped token/session from the backend.
   */
  switchCampus(
    campusId: string,
    user?: UserSession | null
  ): { ok: boolean; facility?: Facility; campus?: Campus; error?: string } {
    const currentUser = user ?? (typeof window !== "undefined" ? getClientSession() : null) ?? DEFAULT_ADMIN;

    if (!this.isCampusAuthorized(campusId, currentUser)) {
      return {
        ok: false,
        error: "Access Denied: You do not have permission to access the selected campus.",
      };
    }

    const authorizedFacilities = this.getAuthorizedFacilities(currentUser);
    for (const fac of authorizedFacilities) {
      const targetCampus = fac.campuses.find((c) => c.id === campusId);
      if (targetCampus) {
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(ACTIVE_CAMPUS_STORAGE_KEY, targetCampus.id);

            // Sync UserSession facility display string for SSR/cookie consistency
            const session = getClientSession() || currentUser;
            setClientSession({
              ...session,
              facility: `${fac.name} — ${targetCampus.name}`,
            });

            window.dispatchEvent(
              new CustomEvent(FACILITY_CHANGED_EVENT, {
                detail: { facilityId: fac.id, campusId: targetCampus.id },
              })
            );
          } catch {
            // ignore storage errors
          }
        }

        return { ok: true, facility: fac, campus: targetCampus };
      }
    }

    return {
      ok: false,
      error: "Selected campus could not be found in your authorized facilities.",
    };
  },
};
