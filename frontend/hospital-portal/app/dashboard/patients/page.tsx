import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PatientDirectoryView from "@/components/dashboard/patients/PatientDirectoryView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Patients — MedKnot Hospital Portal",
  description: "Centralized hospital patient directory, care records, and facility registrations.",
};

async function PatientsGuard() {
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

  return <PatientDirectoryView initialUser={session} />;
}

/**
 * Patients Directory Page — /dashboard/patients
 *
 * Protected route: checks the authenticated session from cookies within Suspense.
 */
export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <PatientsGuard />
    </Suspense>
  );
}
