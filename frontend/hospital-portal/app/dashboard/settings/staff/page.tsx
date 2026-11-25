import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StaffManagementView from "@/components/dashboard/settings/staff/StaffManagementView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Staff Management & Access Control — MedKnot",
  description:
    "Manage hospital personnel accounts, Section 6 role-based permissions (Administrator, Doctor, Nursing Staff, Receptionist), access toggles, and staff invitations.",
};

async function StaffManagementGuard() {
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

export default function StaffManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <StaffManagementGuard />
    </Suspense>
  );
}
