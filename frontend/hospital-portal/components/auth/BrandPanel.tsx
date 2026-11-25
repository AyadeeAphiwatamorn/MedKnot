import React from 'react';
import Image from 'next/image';

export interface BrandPanelProps {
  headline?: string;
  subCopy?: string;
  footerTagline?: string;
  /**
   * - 'blue'  — login / forgot-password  (default)
   * - 'green' — verify / reset-password
   */
  variant?: 'blue' | 'green';
  /**
   * Optional feature highlights shown below the sub-copy.
   * Defaults to the three Login highlights when not provided.
   */
  features?: Array<{ icon: React.ReactNode; title: string; description: string }>;
}

/* ── Default feature icons ──────────────────────────────────────────── */

function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  );
}

const DEFAULT_FEATURES: BrandPanelProps['features'] = [
  {
    icon: <IconCalendar />,
    title: 'Unified Appointments',
    description: 'Coordinate across clinics and hospitals',
  },
  {
    icon: <IconUsers />,
    title: 'Patient Records at Hand',
    description: 'Access and manage patient information securely',
  },
  {
    icon: <IconChart />,
    title: 'Smarter Clinic Operations',
    description: 'Track queues, resources, and workload in real time',
  },
];

/**
 * BrandPanel — Left column of the MedKnot authentication layout.
 *
 * Intentionally transparent background so the animated gradient canvas
 * (rendered in AuthLayout behind the card) shows through naturally.
 *
 * Layout matches Screenshot 4:
 *   - MedKnot logo + brand name top-left
 *   - Spacer
 *   - Large headline (Care teams, connected.)
 *   - Sub-copy description
 *   - Three feature highlight rows
 *   - Footer bar
 */
export default function BrandPanel({
  headline = 'Care teams,\nconnected.',
  subCopy = 'One secure workspace for doctors and hospital teams to coordinate appointments, review patient records, and optimize live clinic queues.',
  footerTagline = 'One platform. Connected healthcare.',
  variant = 'blue',
  features = DEFAULT_FEATURES,
}: BrandPanelProps) {
  const headlineColor = variant === 'green' ? 'text-[#003669]' : 'text-[#003669]';

  /* Split headline on \n so "connected." can be italicised */
  const headlineParts = headline.split('\n');

  return (
    <section
      className="relative flex w-full flex-col justify-between p-4 sm:p-6 lg:w-[50%] lg:py-8 lg:pr-6 lg:pl-2"
      aria-label="MedKnot branding panel"
      /* Fully transparent — animated background shows through */
      style={{ background: 'transparent' }}
    >
      {/* ── MedKnot logo + brand name ──────────────────────────────── */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/90 p-2 shadow-sm">
            <Image
              src="/logo.png"
              alt="MedKnot logo"
              width={36}
              height={36}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#1F2B46]">
                Med<span className="text-[#015CA9]">Knot</span>
              </span>
              <span className="inline-flex items-center rounded border border-[#015CA9]/20 bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#015CA9]">
                Hospital Portal
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-medium tracking-wide text-slate-500">
              Connected care. Brighter lives.
            </p>
          </div>
        </div>
      </div>

      {/* ── Hero content — headline + description + features ───────── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-10 lg:py-0 lg:mt-10 lg:mb-8">

        {/* Large headline */}
        <h1 className={`text-[2.6rem] font-extrabold leading-[1.1] tracking-tight lg:text-[3.2rem] ${headlineColor}`}>
          {headlineParts.map((part, i) =>
            i === headlineParts.length - 1 ? (
              <span key={i} className="block italic">{part}</span>
            ) : (
              <span key={i} className="block">{part}</span>
            )
          )}
        </h1>

        {/* Decorative underline accent (matches Screenshot 4) */}
        <div className="mt-3 h-[3px] w-20 rounded-full bg-gradient-to-r from-[#DFEEA9] to-[#A3C8B4]" />

        {/* Sub-copy */}
        <p className="mt-5 max-w-[420px] text-base leading-relaxed text-slate-700">
          {subCopy}
        </p>

        {/* Feature highlights */}
        {features && features.length > 0 && (
          <ul className="mt-8 space-y-4">
            {features.map((feature, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/80 text-[#015CA9] shadow-sm ring-1 ring-white/50">
                  {feature.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1F2B46]">{feature.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Footer bar ─────────────────────────────────────────────── */}
      <div className="relative z-10 mt-6 flex flex-col items-start justify-between gap-3 border-t border-[#015CA9]/10 pt-5 text-xs text-slate-600 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#A3C8B4]" aria-hidden="true" />
          <span className="font-medium text-slate-600">{footerTagline}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="rounded border border-white/60 bg-white/60 px-2 py-0.5">v2.4 Pro</span>
          <span aria-hidden="true">•</span>
          <a href="#" className="transition-colors hover:text-[#015CA9] focus:outline-none focus-visible:text-[#015CA9]">
            System Status
          </a>
          <span aria-hidden="true">•</span>
          <a href="#" className="transition-colors hover:text-[#015CA9] focus:outline-none focus-visible:text-[#015CA9]">
            Security Policy
          </a>
        </div>
      </div>
    </section>
  );
}
