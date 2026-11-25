"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { ActiveFacilityContextValue, Campus, Facility } from "@/lib/facility/types";
import {
  FacilityService,
  FACILITY_CHANGED_EVENT,
  ACTIVE_CAMPUS_STORAGE_KEY,
} from "@/lib/facility/facility-service";
import { MOCK_FACILITIES } from "@/lib/facility/mock-data";
import { getClientSession, DEFAULT_ADMIN, type UserSession } from "@/lib/auth";

const FacilityContext = createContext<ActiveFacilityContextValue | null>(null);

interface FacilityProviderProps {
  children: React.ReactNode;
  initialUser?: UserSession;
}

export function FacilityProvider({ children, initialUser }: FacilityProviderProps) {
  const [user, setUser] = useState<UserSession | null>(initialUser ?? null);
  const [authorizedFacilities, setAuthorizedFacilities] = useState<Facility[]>(() =>
    FacilityService.getAuthorizedFacilities(initialUser ?? DEFAULT_ADMIN)
  );
  const [activeFacility, setActiveFacility] = useState<Facility>(() => {
    const ctx = FacilityService.getActiveContext(initialUser ?? DEFAULT_ADMIN);
    return ctx.facility;
  });
  const [activeCampus, setActiveCampus] = useState<Campus>(() => {
    const ctx = FacilityService.getActiveContext(initialUser ?? DEFAULT_ADMIN);
    return ctx.campus;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const syncFromStorage = useCallback(
    (overrideUser?: UserSession | null) => {
      const currentUser = overrideUser ?? getClientSession() ?? initialUser ?? DEFAULT_ADMIN;
      setUser(currentUser);
      const facilities = FacilityService.getAuthorizedFacilities(currentUser);
      const { facility, campus } = FacilityService.getActiveContext(currentUser);
      setAuthorizedFacilities(facilities);
      setActiveFacility(facility);
      setActiveCampus(campus);
      setIsLoading(false);
    },
    [initialUser]
  );

  // Hydrate persisted campus context on client mount & listen for cross-tab/event changes
  useEffect(() => {
    syncFromStorage();

    const handleFacilityChanged = () => {
      syncFromStorage();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === ACTIVE_CAMPUS_STORAGE_KEY || e.key === "medknot_user") {
        syncFromStorage();
      }
    };

    window.addEventListener(FACILITY_CHANGED_EVENT, handleFacilityChanged);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(FACILITY_CHANGED_EVENT, handleFacilityChanged);
      window.removeEventListener("storage", handleStorage);
    };
  }, [syncFromStorage]);

  const totalAuthorizedCampuses = useMemo(
    () => authorizedFacilities.reduce((acc, f) => acc + f.campuses.length, 0),
    [authorizedFacilities]
  );

  const canSwitchCampus = totalAuthorizedCampuses > 1;

  const selectCampus = useCallback(
    async (campusId: string): Promise<{ ok: boolean; error?: string }> => {
      if (campusId === activeCampus.id) {
        return { ok: true };
      }

      setIsSwitching(true);
      setError(null);

      // Simulate brief async verification latency (aligned with future API switch call)
      await new Promise((resolve) => setTimeout(resolve, 120));

      const currentUser = user ?? getClientSession() ?? DEFAULT_ADMIN;
      const result = FacilityService.switchCampus(campusId, currentUser);

      if (!result.ok || !result.facility || !result.campus) {
        const msg = result.error || "Unable to switch campus.";
        setError(msg);
        setIsSwitching(false);
        return { ok: false, error: msg };
      }

      setActiveFacility(result.facility);
      setActiveCampus(result.campus);
      setIsSwitching(false);
      return { ok: true };
    },
    [activeCampus.id, user]
  );

  const selectFacility = useCallback(
    async (facilityId: string): Promise<{ ok: boolean; error?: string }> => {
      const targetFac = authorizedFacilities.find((f) => f.id === facilityId);
      if (!targetFac || targetFac.campuses.length === 0) {
        const msg = "Access Denied: You do not have permission to access this facility.";
        setError(msg);
        return { ok: false, error: msg };
      }
      const primaryOrFirst =
        targetFac.campuses.find((c) => c.isPrimary) || targetFac.campuses[0];
      return selectCampus(primaryOrFirst.id);
    },
    [authorizedFacilities, selectCampus]
  );

  const refreshFacilities = useCallback(() => {
    setIsLoading(true);
    setError(null);
    syncFromStorage();
  }, [syncFromStorage]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<ActiveFacilityContextValue>(
    () => ({
      activeFacility,
      activeCampus,
      authorizedFacilities,
      totalAuthorizedCampuses,
      canSwitchCampus,
      isLoading,
      isSwitching,
      error,
      selectCampus,
      selectFacility,
      refreshFacilities,
      clearError,
    }),
    [
      activeFacility,
      activeCampus,
      authorizedFacilities,
      totalAuthorizedCampuses,
      canSwitchCampus,
      isLoading,
      isSwitching,
      error,
      selectCampus,
      selectFacility,
      refreshFacilities,
      clearError,
    ]
  );

  return <FacilityContext.Provider value={value}>{children}</FacilityContext.Provider>;
}

/**
 * Hook to access the active Facility & Campus context across all Dashboard modules.
 */
export function useFacility(): ActiveFacilityContextValue {
  const ctx = useContext(FacilityContext);
  if (ctx) return ctx;

  // Safe fallback if a component is rendered outside FacilityProvider
  const fallbackFacility = MOCK_FACILITIES[0];
  const fallbackCampus = fallbackFacility.campuses[0];
  return {
    activeFacility: fallbackFacility,
    activeCampus: fallbackCampus,
    authorizedFacilities: [fallbackFacility],
    totalAuthorizedCampuses: 1,
    canSwitchCampus: false,
    isLoading: false,
    isSwitching: false,
    error: null,
    selectCampus: async () => ({ ok: false, error: "FacilityProvider not mounted" }),
    selectFacility: async () => ({ ok: false, error: "FacilityProvider not mounted" }),
    refreshFacilities: () => {},
    clearError: () => {},
  };
}
