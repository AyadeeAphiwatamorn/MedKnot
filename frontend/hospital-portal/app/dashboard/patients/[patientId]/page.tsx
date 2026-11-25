import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PatientDetailView from "@/components/dashboard/patients/PatientDetailView";
import { INITIAL_FACILITY_PATIENTS } from "@/lib/patients/mock-data";
import type { UserSession } from "@/lib/auth";

interface PatientPageProps {
  params: Promise<{
    patientId: string;
  }>;
}

export function generateStaticParams() {
  return INITIAL_FACILITY_PATIENTS.map((p) => ({
    patientId: p.facilityPatientId,
  }));
}

export async function generateMetadata({ params }: PatientPageProps): Promise<Metadata> {
  const { patientId } = await params;
  return {
    title: `Patient ${patientId} — MedKnot Hospital Portal`,
    description: `Patient care records, visits, appointments, and medical timeline for ${patientId}.`,
  };
}

async function PatientDetailGuard({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
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

  return <PatientDetailView patientId={patientId} initialUser={session} />;
}

/**
 * Patient Details Workspace — /dashboard/patients/[patientId]
 *
 * Protected route: verifies authenticated session in cookies within Suspense.
 * Passes params promise into the Suspense boundary to support Next.js 16 Partial Prerendering (PPR).
 * The outer page component remains synchronous so the Suspense boundary wraps runtime data access.
 */
export default function PatientPage({ params }: PatientPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <PatientDetailGuard params={params} />
    </Suspense>
  );
}
