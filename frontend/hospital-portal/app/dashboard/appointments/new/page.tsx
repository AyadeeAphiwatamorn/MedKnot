import { Suspense } from "react";
import { cookies } from "next/headers";
import { CreateAppointmentForm } from "@/components/dashboard/appointments/CreateAppointmentForm";

export const metadata = {
  title: "Book Appointment | MedKnot Hospital Portal",
  description: "Schedule a new outpatient or telehealth consultation for an existing facility patient.",
};

async function CreateAppointmentContent() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("medknot_session")?.value;
  const isGuestMode = !sessionToken;

  return <CreateAppointmentForm isGuestMode={isGuestMode} />;
}

export default function CreateAppointmentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055A4] border-t-transparent" />
            <p className="text-sm font-medium text-[#1F2B46]/70">Loading appointment booking form...</p>
          </div>
        </div>
      }
    >
      <CreateAppointmentContent />
    </Suspense>
  );
}
