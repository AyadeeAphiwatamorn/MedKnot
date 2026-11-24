import React from 'react';
import Image from 'next/image';

export interface BrandPanelProps {
  /**
   * Headline text shown below the central illustration.
   * Each string is a separate line (rendered in a single <h1>).
   */
  headline?: string;
  /** Sub-copy paragraph shown below the headline. */
  subCopy?: string;
  /** Left-panel footer tagline (default: "One platform. Connected healthcare.") */
  footerTagline?: string;
  /**
   * Variant controls the left-panel gradient and colour mood.
   * - 'blue'  — login (blue/cream)   [default]
   * - 'green' — reset-password / verify (green/white)
   */
  variant?: 'blue' | 'green';
}

const VARIANTS = {
  blue: {
    section:
      'relative flex flex-col justify-between border-b border-[#E2ECE4] bg-gradient-to-br from-[#E6F4FF]/70 via-[#F7FBF5] to-[#DCF4A2]/20 p-10 lg:w-1/2 lg:border-b-0 lg:border-r md:p-14 lg:p-16',
    blur1: 'pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#E6F4FF] opacity-60 blur-3xl',
    blur2: 'pointer-events-none absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[#DCF4A2] opacity-40 blur-3xl',
    illustrationWrap:
      'absolute inset-0 rounded-full bg-gradient-to-tr from-[#E6F4FF] via-white to-[#DCF4A2]/40 shadow-inner',
    card: 'relative z-10 flex h-44 w-44 items-center justify-center rounded-2xl border border-white bg-white/90 p-4 shadow-[0_12px_30px_rgba(0,85,164,0.08)] backdrop-blur-md',
    h1Color: 'text-[#003669]',
  },
  green: {
    section:
      'relative flex flex-col justify-between border-b border-[#E6EBE4] bg-gradient-to-b from-[#FAFDF9] via-[#F4F9F2] to-[#EEF6EB] p-8 lg:w-1/2 lg:border-b-0 lg:border-r md:p-14 lg:p-16 overflow-hidden',
    blur1: 'pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-[#DCF4A2] opacity-30 blur-3xl',
    blur2: 'pointer-events-none absolute bottom-8 right-8 h-64 w-64 rounded-full bg-[#E6F4FF] opacity-30 blur-3xl',
    illustrationWrap:
      'absolute inset-0 rounded-full',
    card: 'relative z-10 flex h-48 w-48 items-center justify-center rounded-3xl border border-white bg-white p-6 shadow-[0_12px_32px_rgba(0,85,164,0.08)] md:h-56 md:w-56 md:p-8',
    h1Color: 'text-[#092540]',
  },
};

/**
 * BrandPanel — Left column of the authentication layout.
 *
 * Shared across all authentication pages. Accepts props to customise:
 * - Headline and sub-copy (each page has different copy)
 * - Variant (blue for login, green for recovery/verify)
 *
 * Uses the official MedKnot logo from /logo.png.
 * Stateless — no client-side behavior. Safe to use as a Server Component.
 */
export default function BrandPanel({
  headline = 'Care teams, connected.',
  subCopy = 'One secure workspace for doctors and hospital teams to coordinate appointments, review patient records, and optimize live clinic queues.',
  footerTagline = 'One platform. Connected healthcare.',
  variant = 'blue',
}: BrandPanelProps) {
  const v = VARIANTS[variant];

  return (
    <section className={v.section} aria-label="MedKnot branding panel">
      {/* ── Ambient decorative blurs ────────────────────────────────── */}
      <div aria-hidden="true" className={v.blur1} />
      <div aria-hidden="true" className={v.blur2} />

      {/* ── Logo / Header ────────────────────────────────────────────── */}
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          {/* Logo icon box */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
            <Image
              src="/logo.png"
              alt="MedKnot logo"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          {/* Brand name + badge */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-[#1F2B46]">
                Med<span className="text-[#0055A4]">Knot</span>
              </span>
              <span className="inline-flex items-center rounded border border-[#0055A4]/20 bg-[#E6F4FF] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#0055A4]">
                Hospital Portal
              </span>
            </div>
            <p className="mt-0.5 text-xs font-medium tracking-wide text-slate-500">
              Connected care. Brighter lives.
            </p>
          </div>
        </div>
      </div>

      {/* ── Centre illustration + headline ───────────────────────────── */}
      <div className="relative z-10 my-8 flex flex-col items-center lg:my-0">

        {/* Circular / radial illustration stage */}
        <div
          className="relative flex h-64 w-64 items-center justify-center rounded-full md:h-72 md:w-72 lg:mx-0"
          style={
            variant === 'green'
              ? {
                  background:
                    'radial-gradient(circle, rgba(220,244,162,0.45) 0%, rgba(230,244,255,0.5) 45%, rgba(247,251,245,0) 72%)',
                }
              : undefined
          }
        >
          {variant === 'blue' && (
            <div aria-hidden="true" className={v.illustrationWrap} />
          )}

          {/* Glass card with logo */}
          <div className={v.card}>
            <Image
              src="/logo.png"
              alt="MedKnot interconnected symbol"
              width={160}
              height={160}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Floating badge — top right: Multi-Clinic Unified */}
          <div
            className="absolute right-2 top-4 flex animate-pulse items-center gap-2 rounded-full border border-[#A4CBBA]/40 bg-white/95 px-3.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-sm"
            aria-hidden="true"
          >
            <span className="h-2 w-2 rounded-full bg-[#0055A4]" />
            Multi-Clinic Unified
          </div>

          {/* Floating badge — bottom left: HIPAA & SOC-2 Ready */}
          <div
            className="absolute bottom-6 left-2 flex items-center gap-2 rounded-full border border-[#DCF4A2] bg-white/95 px-3.5 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-sm"
            aria-hidden="true"
          >
            <svg className="h-3.5 w-3.5 text-[#0055A4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            HIPAA &amp; SOC-2 Ready
          </div>
        </div>

        {/* Headline + sub-copy */}
        <div className="mt-8 max-w-md space-y-3 text-center lg:text-left">
          <h1 className={`text-3xl font-extrabold leading-tight tracking-tight md:text-4xl ${v.h1Color}`}>
            {headline}
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 md:text-base">
            {subCopy}
          </p>
        </div>
      </div>

      {/* ── Bottom footer bar ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-between gap-3 border-t border-[#0055A4]/10 pt-6 text-xs text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#A4CBBA]" aria-hidden="true" />
          <span className="font-medium text-slate-700">{footerTagline}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="rounded border border-slate-200 bg-white/80 px-2 py-0.5">v2.4 Pro</span>
          <span aria-hidden="true">•</span>
          <a href="#" className="transition-colors hover:text-[#0055A4] focus:outline-none focus-visible:text-[#0055A4]">
            System Status
          </a>
          <span aria-hidden="true">•</span>
          <a href="#" className="transition-colors hover:text-[#0055A4] focus:outline-none focus-visible:text-[#0055A4]">
            Security Policy
          </a>
        </div>
      </div>
    </section>
  );
}
