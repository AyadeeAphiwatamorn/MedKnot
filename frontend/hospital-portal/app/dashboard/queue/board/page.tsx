import { Suspense } from "react";
import { cookies } from "next/headers";
import { QueueBoardView } from "@/components/dashboard/queue/QueueBoardView";

export const metadata = {
  title: "Queue Board | MedKnot Hospital Portal",
  description: "Operational Kanban queue board for outpatient clinic patient staging and consultation tracking.",
};

async function QueueBoardContent() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("medknot_session")?.value;
  const isGuestMode = !sessionToken;

  return <QueueBoardView isGuestMode={isGuestMode} />;
}

export default function QueueBoardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0055A4] border-t-transparent" />
            <p className="text-sm font-medium text-[#1F2B46]/70">Loading queue board...</p>
          </div>
        </div>
      }
    >
      <QueueBoardContent />
    </Suspense>
  );
}
