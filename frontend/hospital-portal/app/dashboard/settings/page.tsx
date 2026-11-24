import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SettingsHubView from "@/components/dashboard/settings/SettingsHubView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Settings & Administration Hub — MedKnot",
  description:
    "Central administrative settings console for hospital facility parameters, staff account permissions, and compliance.",
};

async function SettingsGuard() {
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

  return <SettingsHubView initialUser={session} />;
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDF2E9]" />}>
      <SettingsGuard />
    </Suspense>
  );
}
