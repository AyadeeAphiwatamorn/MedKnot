import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DocumentsDirectoryView from "@/components/dashboard/documents/DocumentsDirectoryView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Medical Records Directory — MedKnot",
  description:
    "Medical document archive, typed lab reports, registration forms, and clinical review status.",
};

async function DocumentsDirectoryGuard() {
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

  return <DocumentsDirectoryView initialUser={session} />;
}

export default function DocumentsDirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <DocumentsDirectoryGuard />
    </Suspense>
  );
}
