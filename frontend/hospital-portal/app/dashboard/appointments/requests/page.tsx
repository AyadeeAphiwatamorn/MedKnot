import { Suspense } from "react";
import { cookies } from "next/headers";
import { AppointmentRequestsView } from "@/components/dashboard/appointments/AppointmentRequestsView";

export const metadata = {
  title: "Appointment Requests | MedKnot Hospital Portal",
  description: "Review, approve, assign, and reschedule incoming appointment bookings.",
};

async function AppointmentRequestsContent() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("medknot_session")?.value;
  const isGuestMode = !sessionToken;

  return <AppointmentRequestsView isGuestMode={isGuestMode} />;
}

export default function AppointmentRequestsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055A4] border-t-transparent" />
            <p className="text-sm font-medium text-[#1F2B46]/70">Loading requests queue...</p>
          </div>
        </div>
      }
    >
      <AppointmentRequestsContent />
    </Suspense>
  );
}
