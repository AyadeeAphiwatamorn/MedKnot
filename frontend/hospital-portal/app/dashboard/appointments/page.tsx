import { Suspense } from "react";
import { cookies } from "next/headers";
import AppointmentsOverviewView from "@/components/dashboard/appointments/AppointmentsOverviewView";

export const metadata = {
  title: "Appointments | MedKnot Hospital Portal",
  description: "View and manage outpatient and specialty appointments across facility departments.",
};

async function AppointmentsOverviewContent() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("medknot_session")?.value;

  return <AppointmentsOverviewView />;
}

export default function AppointmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055A4] border-t-transparent" />
            <p className="text-sm font-medium text-[#1F2B46]/70">Loading appointments...</p>
          </div>
        </div>
      }
    >
      <AppointmentsOverviewContent />
    </Suspense>
  );
}
