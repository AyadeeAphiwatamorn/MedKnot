import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StaffManagementView from "@/components/dashboard/staff/StaffManagementView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Staff Management — MedKnot Hospital Portal",
  description:
    "Manage clinical staff credentials, active facility permissions, departmental shifts, and secure provider onboardings.",
};

async function StaffGuard() {
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

  return <StaffManagementView initialUser={session} />;
}

/**
 * Hospital Admin Portal — Staff Management (/dashboard/staff)
 *
 * Protected administrative route: checks authenticated session in cookies.
 * Renders staff directory, metrics, filters, invite modal, and account controls.
 */
export default function StaffPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDF2E9]" />}>
      <StaffGuard />
    </Suspense>
  );
}
