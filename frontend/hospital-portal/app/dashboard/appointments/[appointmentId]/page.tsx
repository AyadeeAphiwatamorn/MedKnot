import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { AppointmentDetailView } from "@/components/dashboard/appointments/AppointmentDetailView";
import { AppointmentService } from "@/lib/appointments/appointment-service";
import { INITIAL_APPOINTMENTS } from "@/lib/appointments/mock-data";

interface AppointmentDetailPageProps {
  params: Promise<{
    appointmentId: string;
  }>;
}

export function generateStaticParams() {
  return INITIAL_APPOINTMENTS.map((apt) => ({
    appointmentId: apt.id,
  }));
}

export async function generateMetadata({ params }: AppointmentDetailPageProps) {
  const { appointmentId } = await params;
  const appointment = AppointmentService.getAppointmentById(appointmentId);

  if (!appointment) {
    return {
      title: "Appointment Not Found | MedKnot Hospital Portal",
    };
  }

  return {
    title: `${appointment.id} - ${appointment.patientName} | MedKnot Appointments`,
    description: `Appointment record for ${appointment.patientName} with ${appointment.doctorName}`,
  };
}

async function AppointmentDetailGuard({ params }: AppointmentDetailPageProps) {
  const { appointmentId } = await params;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("medknot_session")?.value;
  const isGuestMode = !sessionToken;

  const appointment = AppointmentService.getAppointmentById(appointmentId);

  if (!appointment) {
    notFound();
  }

  return (
    <AppointmentDetailView
      initialAppointment={appointment}
      isGuestMode={isGuestMode}
    />
  );
}

export default function AppointmentDetailPage({ params }: AppointmentDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055A4] border-t-transparent" />
            <p className="text-sm font-medium text-[#1F2B46]/70">Loading appointment dossier...</p>
          </div>
        </div>
      }
    >
      <AppointmentDetailGuard params={params} />
    </Suspense>
  );
}
