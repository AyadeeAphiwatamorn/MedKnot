import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FacilitySettingsView from "@/components/dashboard/facility/FacilitySettingsView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Facility Settings & Profile — MedKnot",
  description:
    "Hospital facility overview, legal charter details, bed capacity, accreditations, and integrated registration setup.",
};

async function FacilitySettingsGuard() {
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

  return <FacilitySettingsView initialUser={session} />;
}

export default function FacilitySettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDF2E9]" />}>
      <FacilitySettingsGuard />
    </Suspense>
  );
}
