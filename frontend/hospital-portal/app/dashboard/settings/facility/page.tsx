
import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FacilityOverviewView from "@/components/dashboard/facility/FacilityOverviewView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Facility Settings — MedKnot Hospital Portal",
  description:
    "Institutional profile, verified accreditation, regulatory licensing, physical node parameters, and contact channels for approved facilities.",
};

async function FacilityOverviewGuard() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("medknot_session");

  if (!sessionCookie?.value) {
    redirect("/login");
  }

  let session: UserSession | null = null;

  try {
    session = JSON.parse(decodeURIComponent(sessionCookie.value));
  } catch {
    redirect("/login");
  }

  if (!session?.authenticated) {
    redirect("/login");
  }

  return <FacilityOverviewView initialUser={session} />;
}

/**
 * Facility Overview Page — /dashboard/settings/facility
 *
 * Protected route: checks the authenticated session from cookies within Suspense.
 * Serves existing, approved hospitals with institutional overview, regulatory verification,
 * administrative contacts, and permitted facility detail editing.
 */
export default function FacilitySettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDF2E9]" />}>
      <FacilityOverviewGuard />
    </Suspense>
  );
}
