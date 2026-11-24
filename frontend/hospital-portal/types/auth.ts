/**
 * MedKnot Hospital Portal — Authentication Types
 *
 * These types define the shape of data used across all authentication forms.
 * They are designed to be forward-compatible with the Spring Boot backend API
 * once the authentication contract is confirmed.
 *
 * All API integration points are marked with [PENDING BACKEND].
 */

// ── Form State ─────────────────────────────────────────────────────────────

/** Login form field values. */
export interface LoginFormValues {
  /** Work email address or numeric/alphanumeric Staff ID. */
  identifier: string;
  password: string;
}

/** Forgot Password form field values. */
export interface ForgotPasswordFormValues {
  email: string;
}

/** OTP verification form field values. */
export interface OtpFormValues {
  /** Six-character numeric OTP code. */
  code: string;
}

/** Reset Password form field values. */
export interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

// ── Feedback / Status ──────────────────────────────────────────────────────

/** Type of inline status feedback shown to the user. */
export type FeedbackType = 'error' | 'success' | 'warning' | null;

/** Feedback message state used in AuthStatusMessage. */
export interface AuthFeedback {
  type: FeedbackType;
  message: string;
}

// ── Staff Roles ─────────────────────────────────────────────────────────────

/**
 * Staff roles recognized by the MedKnot platform.
 * [PENDING BACKEND] — Returned by POST /api/v1/auth/login.
 */
export type StaffRole = 'PHYSICIAN' | 'NURSE' | 'DESK' | 'ADMIN';

// ── API Contracts (Pending Backend Confirmation) ───────────────────────────

/**
 * [PENDING BACKEND] Request body for POST /api/v1/auth/login
 */
export interface LoginRequest {
  identifier: string;   // work email or staff ID
  password: string;
}

/**
 * [PENDING BACKEND] Successful response from POST /api/v1/auth/login
 * Token is expected to be delivered via HttpOnly cookie, not in the body.
 * The body carries non-sensitive metadata only.
 */
export interface LoginResponse {
  staffId: string;
  displayName: string;
  role: StaffRole;
  redirectUrl: string;
}

/**
 * [PENDING BACKEND] Request body for POST /api/v1/auth/forgot-password
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * [PENDING BACKEND] Request body for POST /api/v1/auth/verify-otp
 */
export interface VerifyOtpRequest {
  sessionToken: string; // from forgot-password response
  code: string;
}

/**
 * [PENDING BACKEND] Request body for POST /api/v1/auth/reset-password
 */
export interface ResetPasswordRequest {
  resetToken: string;   // from OTP verification response
  newPassword: string;
}

// ── Validation ─────────────────────────────────────────────────────────────

/** Field-level validation errors for a form. */
export type FormErrors<T> = Partial<Record<keyof T, string>>;
