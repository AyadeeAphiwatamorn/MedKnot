import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DepartmentManagementView from "@/components/dashboard/departments/DepartmentManagementView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Department Management — MedKnot",
  description:
    "Institutional department directory, physician assignments, clinical head assignments, and bed occupancy.",
};

async function DepartmentManagementGuard() {
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

  return <DepartmentManagementView initialUser={session} />;
}

export default function DepartmentManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDF2E9]" />}>
      <DepartmentManagementGuard />
    </Suspense>
  );
}
