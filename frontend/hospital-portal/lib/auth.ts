/**
 * MedKnot Hospital Portal — Authentication & Session Management
 *
 * Provides utilities for managing user session state across
 * both client components and server components using cookies and localStorage.
 */

export interface UserSession {
  name: string;
  role: string;
  department: string;
  facility: string;
  shift: string;
  email: string;
  authenticated: boolean;
}

export const DEFAULT_ADMIN: UserSession = {
  name: 'Michael Lee',
  role: 'Hospital Admin',
  department: 'Hospital Administration',
  facility: 'St. Jude Medical Center — Campus North',
  shift: 'Morning Shift • Active 08:00 – 16:00',
  email: 'michael.lee@stjudes.medknot.org',
  authenticated: true,
};

const SESSION_COOKIE_NAME = 'medknot_session';
const SESSION_STORAGE_KEY = 'medknot_user';

/**
 * Client-side helper to get the active user session.
 */
export function getClientSession(): UserSession | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Try localStorage
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.authenticated) return parsed;
    }

    // 2. Try cookie
    const cookies = document.cookie.split(';');
    for (const c of cookies) {
      const [name, val] = c.trim().split('=');
      if (name === SESSION_COOKIE_NAME && val) {
        const parsed = JSON.parse(decodeURIComponent(val));
        if (parsed?.authenticated) return parsed;
      }
    }
  } catch {
    // Return null on parsing errors
  }

  return null;
}

/**
 * Sets the authenticated user session in both cookie and localStorage.
 */
export function setClientSession(user: UserSession): void {
  if (typeof window === 'undefined') return;

  const json = JSON.stringify(user);
  localStorage.setItem(SESSION_STORAGE_KEY, json);

  // Set cookie for 7 days, accessible across paths
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(
    json,
  )}; path=/; max-age=604800; SameSite=Lax`;
}

/**
 * Clears the session on sign out.
 */
export function clearClientSession(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(SESSION_STORAGE_KEY);
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
