import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DoctorManagementView from "@/components/dashboard/doctors/DoctorManagementView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Doctor Directory & Availability — MedKnot",
  description:
    "Clinical doctor directory, specialties, department assignments, and availability schedule management.",
};

async function DoctorManagementGuard() {
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

  return <DoctorManagementView initialUser={session} />;
}

export default function DoctorManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <DoctorManagementGuard />
    </Suspense>
  );
}
