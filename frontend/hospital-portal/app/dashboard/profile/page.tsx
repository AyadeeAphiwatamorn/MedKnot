import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileView from "@/components/dashboard/profile/ProfileView";
import type { UserSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Profile — MedKnot Hospital Portal",
  description:
    "Authorized hospital staff profile, clinical affiliations, access tiers, and security credentials.",
};

async function ProfileGuard() {
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

  return <ProfileView initialUser={session} />;
}

/**
 * Hospital Portal — My Profile Page (/dashboard/profile)
 *
 * Protected route: verifies authenticated session in cookies.
 * Renders full profile overview, editable personal details, security settings,
 * and hospital affiliation access permissions.
 */
export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <ProfileGuard />
    </Suspense>
  );
}
