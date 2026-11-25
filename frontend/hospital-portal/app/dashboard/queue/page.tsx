import { Suspense } from "react";
import { cookies } from "next/headers";
import { QueueOverviewView } from "@/components/dashboard/queue/QueueOverviewView";

export const metadata = {
  title: "Queue Management | MedKnot Hospital Portal",
  description: "Live outpatient department patient flow, check-ins, waiting times, and consultation routing.",
};

async function QueueOverviewContent() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("medknot_session")?.value;
  const isGuestMode = !sessionToken;

  return <QueueOverviewView isGuestMode={isGuestMode} />;
}

export default function QueueOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055A4] border-t-transparent" />
            <p className="text-sm font-medium text-[#1F2B46]/70">Loading OPD queue overview...</p>
          </div>
        </div>
      }
    >
      <QueueOverviewContent />
    </Suspense>
  );
}
