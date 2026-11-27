"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface QueueSubnavProps {
  waitingCount?: number;
  inConsultationCount?: number;
}

export function QueueSubnav({ waitingCount, inConsultationCount }: QueueSubnavProps) {
  const pathname = usePathname();

  const isOverview = pathname === "/dashboard/queue";
  const isBoard = pathname === "/dashboard/queue/board";
  const isHistory = pathname === "/dashboard/queue/history";

  return (
    <div className="border-t border-[#C8D6C3] pt-3 flex items-center gap-2">
      <Link
        href="/dashboard/queue"
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
          isOverview
            ? "bg-[#0055A4] text-white shadow-xs"
            : "text-[#5A6372] hover:bg-[#E6EDE2] hover:text-[#1F2B46]"
        }`}
      >
        <span className="material-symbols-outlined text-sm">table_chart</span>
        <span>Queue Overview</span>
      </Link>

      <Link
        href="/dashboard/queue/board"
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
          isBoard
            ? "bg-[#0055A4] text-white shadow-xs"
            : "text-[#5A6372] hover:bg-[#E6EDE2] hover:text-[#1F2B46]"
        }`}
      >
        <span className="material-symbols-outlined text-sm">view_kanban</span>
        <span>Live Queue Board</span>
        {waitingCount !== undefined && waitingCount > 0 && (
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              isBoard ? "bg-white/20 text-white" : "bg-[#FFF4E5] text-[#B76E00] border border-[#FFE0B2]"
            }`}
          >
            {waitingCount} waiting
          </span>
        )}
      </Link>

      <Link
        href="/dashboard/queue/history"
        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
          isHistory
            ? "bg-[#0055A4] text-white shadow-xs"
            : "text-[#5A6372] hover:bg-[#E6EDE2] hover:text-[#1F2B46]"
        }`}
      >
        <span className="material-symbols-outlined text-sm">history</span>
        <span>Queue History</span>
      </Link>
    </div>
  );
}
