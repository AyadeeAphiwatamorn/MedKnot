import { Suspense } from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { QueueDetailView } from "@/components/dashboard/queue/QueueDetailView";
import { QueueService } from "@/lib/queue/queue-service";
import { INITIAL_QUEUE_ENTRIES } from "@/lib/queue/mock-data";

interface QueueDetailPageProps {
  params: Promise<{
    queueId: string;
  }>;
}

export function generateStaticParams() {
  return INITIAL_QUEUE_ENTRIES.map((entry) => ({
    queueId: entry.id,
  }));
}

export async function generateMetadata({ params }: QueueDetailPageProps) {
  const { queueId } = await params;
  const entry = QueueService.getQueueEntryById(queueId);

  if (!entry) {
    return {
      title: "Queue Record Not Found | MedKnot Hospital Portal",
    };
  }

  return {
    title: `Queue ${entry.queueNumber} - ${entry.patientName} | MedKnot Queue Management`,
    description: `OPD Queue record for ${entry.patientName} with ${entry.doctorName}`,
  };
}

async function QueueDetailGuard({ params }: QueueDetailPageProps) {
  const { queueId } = await params;
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("medknot_session")?.value;
  const isGuestMode = !sessionToken;

  const entry = QueueService.getQueueEntryById(queueId);

  if (!entry) {
    notFound();
  }

  return (
    <QueueDetailView
      initialEntry={entry}
      isGuestMode={isGuestMode}
    />
  );
}

export default function QueueDetailPage({ params }: QueueDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055A4] border-t-transparent" />
            <p className="text-sm font-medium text-[#1F2B46]/70">Loading queue dossier...</p>
          </div>
        </div>
      }
    >
      <QueueDetailGuard params={params} />
    </Suspense>
  );
}
