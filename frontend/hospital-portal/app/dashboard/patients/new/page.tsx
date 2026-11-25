import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PatientRegistrationForm from "@/components/dashboard/patients/PatientRegistrationForm";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Register Patient — MedKnot Hospital Portal",
  description: "Register a new patient into the hospital facility care registry.",
};

async function PatientRegistrationGuard() {
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

  return <PatientRegistrationForm initialUser={session} />;
}

/**
 * Register Patient Page — /dashboard/patients/new
 *
 * Protected route: checks the authenticated session from cookies within Suspense.
 */
export default function NewPatientPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <PatientRegistrationGuard />
    </Suspense>
  );
}
