import { redirect } from "next/navigation";

/**
 * Register Facility Page — /dashboard/settings/facility/register
 *
 * Refactored: Hospital Registration has moved outside the authenticated portal to /register-hospital.
 * Existing approved hospitals are served by /dashboard/settings/facility.
 * Any legacy links or bookmarks to this route are redirected to the Facility Overview page.
 */
export default function RegisterFacilityRedirectPage() {
  redirect("/dashboard/settings/facility");
}
