import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import DocumentDetailView from "@/components/dashboard/documents/DocumentDetailView";
import { INITIAL_DOCUMENTS } from "@/lib/medical-records-data";
import type { UserSession } from "@/lib/auth";

interface DocumentDetailPageProps {
  params: Promise<{ documentId: string }>;
}

export function generateStaticParams() {
  return INITIAL_DOCUMENTS.map((doc) => ({
    documentId: doc.id,
  }));
}

export async function generateMetadata({
  params,
}: DocumentDetailPageProps): Promise<Metadata> {
  const { documentId } = await params;
  const doc = INITIAL_DOCUMENTS.find((d) => d.id === documentId);
  return {
    title: doc
      ? `${doc.title} — MedKnot Medical Records`
      : "Medical Document Details — MedKnot",
    description:
      "Detailed medical document inspection, original preview, and multi-layered verification.",
  };
}

async function DocumentDetailGuard({
  params,
}: {
  params: Promise<{ documentId: string }>;
}) {
  const { documentId } = await params;
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

  const document =
    INITIAL_DOCUMENTS.find((d) => d.id === documentId) ||
    INITIAL_DOCUMENTS[0];

  if (!document) {
    notFound();
  }

  return (
    <DocumentDetailView
      initialDocument={document}
      initialUser={session}
    />
  );
}

export default function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <DocumentDetailGuard params={params} />
    </Suspense>
  );
}
