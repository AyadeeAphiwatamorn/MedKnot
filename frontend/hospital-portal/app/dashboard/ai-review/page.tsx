import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AIReviewWorkspaceView from "@/components/dashboard/ai-review/AIReviewWorkspaceView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AI Medical Review & OCR Verification — MedKnot",
  description:
    "AI Medical Assistance workspace for OCR draft verification, split-screen original document review, and clinical summaries.",
};

async function AIReviewGuard() {
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

  return <AIReviewWorkspaceView initialUser={session} />;
}

export default function AIReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDF2E9]" />}>
      <AIReviewGuard />
    </Suspense>
  );
}
