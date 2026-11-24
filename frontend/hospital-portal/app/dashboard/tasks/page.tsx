import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TasksManagementView from "@/components/dashboard/tasks/TasksManagementView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Staff Tasks & Follow-up Management — MedKnot",
  description:
    "Operations workspace for delegating staff tasks, tracking clinical follow-ups, and managing hospital operational duties.",
};

async function TasksManagementGuard() {
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

  return <TasksManagementView initialUser={session} />;
}

export default function TasksManagementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EDF2E9]" />}>
      <TasksManagementGuard />
    </Suspense>
  );
}
