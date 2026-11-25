import React from 'react';
import { Inter } from 'next/font/google';
import BrandPanel, { type BrandPanelProps } from '@/components/auth/BrandPanel';
import AnimatedMedKnotBackground from '@/components/auth/AnimatedMedKnotBackground';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

export interface AuthLayoutProps extends BrandPanelProps {
  children: React.ReactNode;
  headerElement?: React.ReactNode;
  footerElement?: React.ReactNode;
}

/**
 * AuthLayout — Shared page shell for all MedKnot authentication screens.
 *
 * Layout structure:
 *   ┌─ Fixed full-screen animated gradient background (z:0) ─────────┐
 *   │  ┌─ Outer centering wrapper (relative z:10) ──────────────────┐ │
 *   │  │  [optional headerElement / demo switcher]                  │ │
 *   │  │  ┌─ Main two-column card ───────────────────────────────┐  │ │
 *   │  │  │  Left: BrandPanel (transparent, animated bg visible)  │  │ │
 *   │  │  │  Right: white form panel                             │  │ │
 *   │  │  └──────────────────────────────────────────────────────┘  │ │
 *   │  │  [optional footerElement / legal]                          │ │
 *   │  └────────────────────────────────────────────────────────────┘ │
 *   └────────────────────────────────────────────────────────────────┘
 *
 * The animated background is FIXED (not absolute), so it fills the viewport
 * and is fully visible through the transparent BrandPanel.
 * The white login card on the right keeps a solid bg-white.
 */
export default function AuthLayout({
  children,
  headline,
  subCopy,
  footerTagline,
  variant = 'blue',
  features,
  headerElement,
  footerElement,
}: AuthLayoutProps) {
  return (
    /*
     * Root wrapper — transparent background so the fixed animated canvas shows through.
     * min-h-screen + relative so the z-10 centering wrapper stacks above z-0 background.
     */
    <div
      className={`${inter.variable} relative min-h-screen w-full overflow-x-hidden font-[var(--font-inter)] antialiased`}
    >
      {/* ① Animated gradient background — fixed, full-viewport, z:0 */}
      <AnimatedMedKnotBackground />

      {/* ② Page content — relative, z:10, sits above the animated canvas */}
      <div
        className={`relative z-10 flex min-h-screen w-full flex-col items-center ${
          headerElement || footerElement
            ? 'justify-between p-4 sm:p-6 lg:p-8'
            : 'justify-center p-4 md:p-6 lg:p-8'
        }`}
      >
        {headerElement}

        {/*
          ③ Split-screen layout over the living gradient canvas:
          Left BrandPanel floats transparently over the animated silk waves;
          Right login card remains a crisp, stationary solid white rounded surface.
        */}
        <main className="flex w-full max-w-[1320px] flex-col items-center gap-8 lg:min-h-[780px] lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          {/* Left: BrandPanel — transparent background, animated canvas shows through */}
          <BrandPanel
            headline={headline}
            subCopy={subCopy}
            footerTagline={footerTagline}
            variant={variant}
            features={features}
          />

          {/* Right: stationary white rounded login card */}
          <section className="relative flex w-full flex-col items-center justify-center rounded-[28px] bg-white p-8 shadow-[0_24px_64px_rgba(1,92,169,0.12),0_8px_24px_rgba(15,23,42,0.06)] md:p-12 lg:w-[46%] lg:max-w-[540px] lg:p-14">
            {children}
          </section>
        </main>

        {footerElement}
      </div>
    </div>
  );
}
