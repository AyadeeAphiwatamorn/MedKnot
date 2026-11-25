import { Suspense } from "react";
import { cookies } from "next/headers";
import { QueueHistoryView } from "@/components/dashboard/queue/QueueHistoryView";

export const metadata = {
  title: "Queue History | MedKnot Hospital Portal",
  description: "Historical outpatient department queue logs, check-in records, and completion metrics.",
};

async function QueueHistoryContent() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("medknot_session")?.value;
  const isGuestMode = !sessionToken;

  return <QueueHistoryView isGuestMode={isGuestMode} />;
}

export default function QueueHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055A4] border-t-transparent" />
            <p className="text-sm font-medium text-[#1F2B46]/70">Loading queue history...</p>
          </div>
        </div>
      }
    >
      <QueueHistoryContent />
    </Suspense>
  );
}
