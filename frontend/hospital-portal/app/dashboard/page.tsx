import { Suspense } from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardView from '@/components/dashboard/DashboardView';
import type { UserSession } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Hospital Admin Dashboard — MedKnot',
  description:
    'Hospital Portal Operations Dashboard for authorized administrators and healthcare staff.',
};

async function DashboardGuard() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('medknot_session');

  if (!sessionCookie?.value) {
    redirect('/login');
  }

  let session: UserSession | null = null;
  try {
    session = JSON.parse(decodeURIComponent(sessionCookie.value));
  } catch {
    redirect('/login');
  }

  if (!session?.authenticated) {
    redirect('/login');
  }

  return <DashboardView initialUser={session} />;
}

/**
 * Hospital Admin Dashboard — /dashboard
 *
 * Protected route: checks the authenticated session from cookies within Suspense.
 * If unauthenticated, redirects to /login.
 */
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent" />}>
      <DashboardGuard />
    </Suspense>
  );
}

