import { Suspense } from "react";
import { cookies } from "next/headers";
import { AppointmentCalendarView } from "@/components/dashboard/appointments/AppointmentCalendarView";

export const metadata = {
  title: "Appointment Calendar | MedKnot Hospital Portal",
  description: "Schedule, day, week, and month view of outpatient and specialist consultations.",
};

async function AppointmentCalendarContent() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("medknot_session")?.value;
  const isGuestMode = !sessionToken;

  return <AppointmentCalendarView isGuestMode={isGuestMode} />;
}

export default function AppointmentCalendarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055A4] border-t-transparent" />
            <p className="text-sm font-medium text-[#1F2B46]/70">Loading calendar...</p>
          </div>
        </div>
      }
    >
      <AppointmentCalendarContent />
    </Suspense>
  );
}
