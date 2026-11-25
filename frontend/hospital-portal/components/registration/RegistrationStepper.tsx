"use client";

import React from "react";
import Link from "next/link";

interface RegistrationStepperProps {
  currentStep: 1 | 2 | 3 | 4;
}

export default function RegistrationStepper({ currentStep }: RegistrationStepperProps) {
  const steps = [
    {
      num: 1,
      title: "Facility Information",
      href: "/register-hospital/facility",
    },
    {
      num: 2,
      title: "Contact & Administrator",
      href: "/register-hospital/administrator",
    },
    {
      num: 3,
      title: "Documents & Verification",
      href: "/register-hospital/documents",
    },
    {
      num: 4,
      title: "Review & Submit",
      href: "/register-hospital/review",
    },
  ];

  return (
    <div className="w-full pb-space-lg">
      <div className="w-full bg-white border border-[#D5DFD2] rounded-2xl p-space-md shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between relative overflow-x-auto py-1">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.num;
            const isActive = currentStep === step.num;

            const content = (
              <div className="flex items-center gap-space-sm z-10 bg-white px-2 select-none shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-card-heading text-card-heading shrink-0 shadow-xs transition-all ${
                    isActive
                      ? "bg-[#0055A4] text-white font-bold ring-4 ring-[#0055A4]/15"
                      : isCompleted
                      ? "bg-tertiary-fixed text-tertiary font-bold"
                      : "bg-[#EDF2E9] border border-[#D5DFD2] text-[#727783]"
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[18px]">check</span>
                  ) : (
                    step.num
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className={`font-card-heading text-body-md whitespace-nowrap truncate ${
                      isActive
                        ? "text-[#0055A4] font-bold"
                        : isCompleted
                        ? "text-[#1F2B46] font-semibold"
                        : "text-[#727783] font-medium"
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="font-supporting text-supporting whitespace-nowrap">
                    {isActive ? (
                      <span className="text-[#0055A4] font-semibold">In Progress</span>
                    ) : isCompleted ? (
                      <span className="text-tertiary font-medium">Completed</span>
                    ) : (
                      <span className="text-[#727783]">Upcoming</span>
                    )}
                  </span>
                </div>
              </div>
            );

            return (
              <React.Fragment key={step.num}>
                {isCompleted ? (
                  <Link href={step.href} className="hover:opacity-85 transition-opacity">
                    {content}
                  </Link>
                ) : (
                  content
                )}

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 min-w-[20px] transition-colors ${
                      currentStep > step.num ? "bg-tertiary-fixed" : "bg-[#D5DFD2]"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
