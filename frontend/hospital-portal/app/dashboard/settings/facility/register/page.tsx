import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import RegisterFacilityView from "@/components/dashboard/facility/RegisterFacilityView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Register Facility — MedKnot Hospital Portal",
  description:
    "Register your hospital or clinic facility with the MedKnot Connected Care network.",
};

async function RegisterFacilityGuard() {
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

  return <RegisterFacilityView initialUser={session} />;
}

/**
 * Register Facility Page — /dashboard/settings/facility/register
 *
 * Protected route: checks the authenticated session from cookies within Suspense.
 * If unauthenticated, redirects to /login.
 */
export default function RegisterFacilityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDF2E9]" />}>
      <RegisterFacilityGuard />
    </Suspense>
  );
}
