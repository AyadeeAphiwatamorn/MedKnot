"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useFacility } from "@/components/dashboard/facility/FacilityContext";

export function FacilitySelector() {
  const {
    activeFacility,
    activeCampus,
    authorizedFacilities,
    totalAuthorizedCampuses,
    canSwitchCampus,
    isLoading,
    isSwitching,
    error,
    selectCampus,
    refreshFacilities,
    clearError,
  } = useFacility();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when opened (if search is visible)
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const showSearch = authorizedFacilities.length > 1 || totalAuthorizedCampuses > 3;

  const filteredFacilities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return authorizedFacilities;

    return authorizedFacilities
      .map((fac) => {
        const facilityMatches =
          fac.name.toLowerCase().includes(q) ||
          fac.type.toLowerCase().includes(q) ||
          fac.location.toLowerCase().includes(q);

        const matchingCampuses = facilityMatches
          ? fac.campuses
          : fac.campuses.filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                c.location.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q)
            );

        if (matchingCampuses.length === 0) return null;
        return { ...fac, campuses: matchingCampuses };
      })
      .filter((f): f is NonNullable<typeof f> => f !== null);
  }, [authorizedFacilities, searchQuery]);

  const handleSelectCampus = async (campusId: string) => {
    const res = await selectCampus(campusId);
    if (res.ok) {
      setIsOpen(false);
    }
  };

  // Single-campus display (graceful non-interactive state — no misleading dropdown)
  if (!isLoading && !canSwitchCampus) {
    return (
      <div
        className="flex items-center gap-2.5 bg-white border border-[#D5DFD2] px-3.5 py-1.5 rounded-xl shadow-xs text-[#1F2B46] min-w-0 max-w-full"
        title={`Assigned to ${activeFacility.name} — ${activeCampus.name} (Single-campus access)`}
      >
        <div className="w-7 h-7 rounded-lg bg-[#EDF2E9] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#0055A4] text-[18px]">
            local_hospital
          </span>
        </div>
        <div className="flex flex-col text-left min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-[#5A6372] uppercase tracking-wider font-semibold leading-none">
              Facility
            </span>
            <span className="text-[10px] text-[#727783] hidden sm:inline">• Single Campus</span>
          </div>
          <span className="text-xs sm:text-sm font-semibold text-[#1F2B46] truncate leading-tight mt-0.5">
            {activeFacility.name}
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#D4EC9B] text-[#151F00] text-[11px] font-semibold uppercase tracking-wider hidden md:inline-flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B4D0D]" />
          {activeCampus.name}
        </span>
      </div>
    );
  }

  return (
    <div className="relative min-w-0" ref={containerRef}>
      {/* Trigger Pill */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={isLoading || isSwitching}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Switch facility or campus. Current: ${activeFacility.name}, ${activeCampus.name}`}
        className={`flex items-center gap-2.5 bg-white border px-3.5 py-1.5 rounded-xl shadow-xs text-[#1F2B46] transition-all cursor-pointer min-w-0 max-w-full ${
          isOpen
            ? "border-[#0055A4] ring-2 ring-[#0055A4]/15 bg-[#F8FAF6]"
            : "border-[#D5DFD2] hover:bg-[#F3F6F0] hover:border-[#B8C6B4]"
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-[#E1F2FD]/70 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#0055A4] text-[18px]">
            local_hospital
          </span>
        </div>

        <div className="flex flex-col text-left min-w-0">
          <span className="text-[10px] text-[#5A6372] uppercase tracking-wider font-semibold leading-none truncate">
            Facility
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[#1F2B46] truncate leading-tight mt-0.5 max-w-[160px] sm:max-w-[240px]">
            {isLoading ? "Loading facility…" : activeFacility.name}
          </span>
        </div>

        {/* Active Campus Badge */}
        <span className="px-2.5 py-0.5 rounded-full bg-[#D4EC9B] text-[#151F00] text-[11px] font-semibold uppercase tracking-wider hidden md:inline-flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B4D0D]" />
          {activeCampus.name}
        </span>

        {/* Expand / Loading indicator */}
        <span
          className={`material-symbols-outlined text-[#5A6372] text-[18px] ml-0.5 shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-[#0055A4]" : ""
          }`}
        >
          {isSwitching ? "sync" : "expand_more"}
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Facility and campus selector"
          className="absolute left-0 top-full mt-2 w-[340px] sm:w-[400px] max-w-[calc(100vw-2rem)] bg-white border border-[#D5DFD2] rounded-2xl shadow-[0_16px_40px_rgba(31,43,70,0.14)] z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#F8FAF6] border-b border-[#E5EAE2] flex items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F2B46]">
                Switch Facility &amp; Campus
              </h3>
              <p className="text-[11px] text-[#5A6372] mt-0.5">
                {authorizedFacilities.length}{" "}
                {authorizedFacilities.length === 1 ? "facility" : "facilities"} •{" "}
                {totalAuthorizedCampuses}{" "}
                {totalAuthorizedCampuses === 1 ? "campus" : "campuses"} authorized
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-[#5A6372] hover:bg-[#E2E8DE] hover:text-[#1F2B46] transition-colors cursor-pointer"
              aria-label="Close facility selector"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Search input when multiple facilities/campuses exist */}
          {showSearch && (
            <div className="p-3 border-b border-[#EEF2EC] bg-white">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined text-[#727783] text-[18px] absolute left-3 pointer-events-none">
                  search
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search facility, campus, or city…"
                  className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#F8FAF6] border border-[#D5DFD2] rounded-lg text-[#1F2B46] placeholder:text-[#727783] focus:outline-none focus:border-[#0055A4] focus:ring-2 focus:ring-[#0055A4]/15"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-[#727783] hover:text-[#1F2B46] cursor-pointer"
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mx-3 mt-3 p-2.5 rounded-xl bg-[#FFDAD6] border border-[#BA1A1A]/20 flex items-start justify-between gap-2 text-xs text-[#93000A]">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
                  error
                </span>
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={clearError}
                className="text-[#93000A] hover:opacity-75 cursor-pointer"
                aria-label="Dismiss error"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          )}

          {/* Body: Loading / Empty / Facility Hierarchy */}
          <div className="max-h-[360px] overflow-y-auto p-3 space-y-3">
            {isLoading ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-[#5A6372]">
                <span className="material-symbols-outlined text-2xl animate-spin text-[#0055A4]">
                  progress_activity
                </span>
                <span className="text-xs font-medium">Loading authorized facilities…</span>
              </div>
            ) : filteredFacilities.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <span className="material-symbols-outlined text-3xl text-[#727783] mb-1">
                  domain_disabled
                </span>
                <p className="text-xs font-semibold text-[#1F2B46]">
                  No matching facilities or campuses
                </p>
                <p className="text-[11px] text-[#5A6372] mt-1">
                  {searchQuery
                    ? `No authorized locations match "${searchQuery}".`
                    : "You do not have active memberships for any campuses."}
                </p>
                {!searchQuery && (
                  <button
                    type="button"
                    onClick={refreshFacilities}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-[#EDF2E9] hover:bg-[#D5DFD2] text-xs font-semibold text-[#1F2B46] transition-colors cursor-pointer"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              filteredFacilities.map((facility) => {
                const isActiveFacility = facility.id === activeFacility.id;
                return (
                  <div
                    key={facility.id}
                    className={`rounded-xl border transition-colors ${
                      isActiveFacility
                        ? "border-[#0055A4]/30 bg-[#F8FAF6]"
                        : "border-[#E5EAE2] bg-white"
                    }`}
                  >
                    {/* Facility Parent Header */}
                    <div className="px-3.5 py-2.5 border-b border-[#EEF2EC] flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isActiveFacility
                              ? "bg-[#0055A4] text-white"
                              : "bg-[#EDF2E9] text-[#0055A4]"
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            apartment
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-[#1F2B46] truncate">
                              {facility.name}
                            </span>
                            {isActiveFacility && (
                              <span className="px-1.5 py-0.5 rounded bg-[#E1F2FD] text-[#0055A4] text-[10px] font-semibold">
                                Current Facility
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#5A6372] truncate mt-0.5">
                            {facility.type} • {facility.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Campuses Tree List */}
                    <div className="p-1.5 space-y-1" role="listbox" aria-label={`${facility.name} campuses`}>
                      {facility.campuses.map((campus) => {
                        const isSelected = campus.id === activeCampus.id;
                        return (
                          <button
                            key={campus.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            disabled={isSwitching}
                            onClick={() => handleSelectCampus(campus.id)}
                            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#E1F2FD]/70 text-[#003E7A] ring-1 ring-[#0055A4]/30"
                                : "hover:bg-[#EDF2E9]/70 text-[#1F2B46]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`w-2 h-2 rounded-full shrink-0 ${
                                  isSelected
                                    ? "bg-[#0055A4]"
                                    : campus.status === "Operational"
                                    ? "bg-[#526524]"
                                    : "bg-[#D4AF7A]"
                                }`}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold truncate">
                                    {campus.name}
                                  </span>
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-white/80 border border-[#D5DFD2] text-[#5A6372]">
                                    {campus.code}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#5A6372] truncate">
                                  {campus.location}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0055A4]">
                                  <span className="material-symbols-outlined text-[16px]">
                                    check_circle
                                  </span>
                                  Active
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium text-[#5A6372]">
                                  Switch
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Isolation Note */}
          <div className="px-4 py-2.5 bg-[#F8FAF6] border-t border-[#E5EAE2] flex items-center justify-between text-[10px] text-[#5A6372]">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#0055A4]">
                verified_user
              </span>
              Authorized campus isolation active
            </span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
