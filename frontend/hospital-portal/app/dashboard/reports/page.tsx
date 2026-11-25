import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OperationalReportsView from "@/components/dashboard/reports/OperationalReportsView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Operational Reports & Analytics — MedKnot",
  description:
    "Hospital performance indicators, appointment volume trends, queue wait times, and department workload metrics.",
};

async function OperationalReportsGuard() {
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

  return <OperationalReportsView initialUser={session} />;
}

export default function OperationalReportsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <OperationalReportsGuard />
    </Suspense>
  );
}
