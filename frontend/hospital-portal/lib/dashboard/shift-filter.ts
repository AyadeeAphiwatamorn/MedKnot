/**
 * Dashboard Date Range & Shift Filter Utilities
 *
 * Scopes Dashboard operational metrics (appointments, queue, requests, staff activity)
 * to the selected date slice and hospital shift window without altering mock timestamps.
 */

export type DateRangeOption = "today" | "tomorrow" | "week" | "custom";
export type ShiftOption = "all" | "morning" | "afternoon" | "night";

export interface ShiftWindow {
  id: ShiftOption;
  label: string;
  shortLabel: string;
  timeRange: string;
  startMinutes: number; // inclusive, 0..1440
  endMinutes: number; // exclusive, 0..1440
}

/** Reference date used in the seeded appointment & queue datasets */
export const MOCK_DATASET_TODAY = "2024-11-25";
export const MOCK_DATASET_TOMORROW = "2024-11-26";
export const MOCK_DATASET_WEEK_START = "2024-11-25";
export const MOCK_DATASET_WEEK_END = "2024-12-01";

/**
 * Standard shift windows derived from facility staff schedule configuration
 * (see DEFAULT_ADMIN.shift in lib/auth.ts and INITIAL_STAFF_MEMBERS in lib/operations-data.ts).
 */
export const SHIFT_WINDOWS: Record<ShiftOption, ShiftWindow> = {
  all: {
    id: "all",
    label: "All Shifts",
    shortLabel: "All Shifts",
    timeRange: "24 Hours",
    startMinutes: 0,
    endMinutes: 1440,
  },
  morning: {
    id: "morning",
    label: "Morning Shift (08:00–16:00)",
    shortLabel: "Morning Shift",
    timeRange: "08:00–16:00",
    startMinutes: 8 * 60, // 480
    endMinutes: 16 * 60, // 960
  },
  afternoon: {
    id: "afternoon",
    label: "Afternoon Shift (16:00–00:00)",
    shortLabel: "Afternoon Shift",
    timeRange: "16:00–00:00",
    startMinutes: 16 * 60, // 960
    endMinutes: 24 * 60, // 1440
  },
  night: {
    id: "night",
    label: "Night Shift (00:00–08:00)",
    shortLabel: "Night Shift",
    timeRange: "00:00–08:00",
    startMinutes: 0,
    endMinutes: 8 * 60, // 480
  },
};

/** Formats a Date object as local YYYY-MM-DD */
export function formatLocalDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Computes Monday–Sunday bounds in local YYYY-MM-DD for a given Date */
function getWeekBoundsISO(refDate: Date): { start: string; end: string } {
  const d = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());
  const day = d.getDay(); // 0=Sun, 1=Mon
  const diffToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  return {
    start: formatLocalDateISO(mon),
    end: formatLocalDateISO(sun),
  };
}

/**
 * Checks whether a YYYY-MM-DD operational record date matches the selected date filter.
 * Supports both real calendar dates (newly created items) and the seeded mock dataset date anchor.
 */
export function matchesDateFilter(
  recordDate: string,
  dateRange: DateRangeOption,
  customDate: string,
  now: Date | null = null
): boolean {
  if (!recordDate) return false;

  const realToday = now ? formatLocalDateISO(now) : "";
  const tomorrowDate = now
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    : null;
  const realTomorrow = tomorrowDate ? formatLocalDateISO(tomorrowDate) : "";
  const realWeek = now ? getWeekBoundsISO(now) : null;

  switch (dateRange) {
    case "today":
      return (realToday !== "" && recordDate === realToday) || recordDate === MOCK_DATASET_TODAY;
    case "tomorrow":
      return (realTomorrow !== "" && recordDate === realTomorrow) || recordDate === MOCK_DATASET_TOMORROW;
    case "week":
      return (
        (realWeek !== null && recordDate >= realWeek.start && recordDate <= realWeek.end) ||
        (recordDate >= MOCK_DATASET_WEEK_START && recordDate <= MOCK_DATASET_WEEK_END)
      );
    case "custom":
      if (!customDate) {
        return recordDate === MOCK_DATASET_TODAY || (realToday !== "" && recordDate === realToday);
      }
      return recordDate === customDate;
    default:
      return true;
  }
}

/**
 * Parses time strings such as "09:30 AM", "02:00 PM", "08:15 PM", or "14:30"
 * into minutes since midnight (0..1439).
 */
export function parseTimeSlotToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const trimmed = timeStr.trim();

  const amPmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hours = parseInt(amPmMatch[1], 10);
    const mins = parseInt(amPmMatch[2], 10);
    const period = amPmMatch[3].toUpperCase();
    if (period === "AM" && hours === 12) hours = 0;
    else if (period === "PM" && hours !== 12) hours += 12;
    return hours * 60 + mins;
  }

  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    const hours = parseInt(h24Match[1], 10);
    const mins = parseInt(h24Match[2], 10);
    if (hours >= 0 && hours < 24 && mins >= 0 && mins < 60) {
      return hours * 60 + mins;
    }
  }

  return null;
}

/** Checks if a time slot falls inside the selected shift window */
export function matchesShiftFilter(timeSlot: string | undefined, shift: ShiftOption): boolean {
  if (shift === "all") return true;
  const minutes = parseTimeSlotToMinutes(timeSlot);
  if (minutes === null) return false;
  const win = SHIFT_WINDOWS[shift];
  return minutes >= win.startMinutes && minutes < win.endMinutes;
}

/** Checks if a staff member's shift label matches the selected shift filter */
export function matchesStaffShift(staffShift: string | undefined, shift: ShiftOption): boolean {
  if (shift === "all") return true;
  const lower = (staffShift || "").toLowerCase();
  if (shift === "morning") {
    return lower.includes("morning") || lower.includes("day") || lower.includes("general") || lower.includes("08:00");
  }
  if (shift === "afternoon") {
    return lower.includes("afternoon") || lower.includes("evening") || lower.includes("14:00") || lower.includes("16:00");
  }
  if (shift === "night") {
    return lower.includes("night") || lower.includes("00:00");
  }
  return true;
}

/** Formats YYYY-MM-DD into short readable date e.g. "Nov 28" without UTC offset shifts */
export function formatShortCustomDate(dateStr: string): string {
  if (!dateStr) return "Custom Date";
  const parts = dateStr.split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const local = new Date(parts[0], parts[1] - 1, parts[2]);
  return local.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Formats the header filter button label */
export function formatDashboardFilterLabel(
  dateRange: DateRangeOption,
  customDate: string,
  shift: ShiftOption
): string {
  let dateLabel = "Today";
  if (dateRange === "tomorrow") dateLabel = "Tomorrow";
  else if (dateRange === "week") dateLabel = "This Week";
  else if (dateRange === "custom") dateLabel = formatShortCustomDate(customDate);

  const shiftLabel = SHIFT_WINDOWS[shift].shortLabel;
  return `${dateLabel} • ${shiftLabel}`;
}
