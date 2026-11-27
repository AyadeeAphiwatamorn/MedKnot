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
      className={`${inter.variable} relative min-h-screen w-full overflow-x-hidden font-sans antialiased`}
    >
      {/* ① Animated gradient background — fixed, full-viewport, z:0 */}
      <AnimatedMedKnotBackground />

      {/* ② Page content — relative, z:10, sits above the animated canvas */}
      <div
        className={`relative z-10 flex min-h-screen w-full flex-col items-center ${
          headerElement || footerElement
            ? 'justify-between px-4 py-6 sm:px-6 lg:py-8'
            : 'justify-center px-4 sm:px-6'
        }`}
      >
        {headerElement}

        {/*
          ③ Single unified outer frosted-glass card over the living gradient canvas:
          Left BrandPanel shares the transparent frosted outer glass (`rgba(235, 245, 241, 0.38)`),
          while the Right form panel inside it uses a less transparent glass surface (`rgba(238, 246, 239, 0.84)`).
        */}
        <main className="auth-unified-card backdrop-blur-xl mx-auto my-6 sm:my-8 lg:my-10 grid w-[90%] max-w-[1450px] grid-cols-1 items-stretch gap-4 overflow-hidden p-3 sm:p-4 lg:min-h-[760px] lg:grid-cols-[1.04fr_0.96fr] lg:gap-4 lg:p-4">
          {/* Left: BrandPanel — more transparent frosted glass letting the gradient show through */}
          <BrandPanel
            headline={headline}
            subCopy={subCopy}
            footerTagline={footerTagline}
            variant={variant}
            features={features}
          />

          {/* Right: more opaque frosted glass form panel inside the same unified outer card */}
          <section className="auth-form-panel backdrop-blur-md relative flex w-full flex-col items-center justify-center p-7 sm:p-10 lg:p-12">
            {children}
          </section>
        </main>

        {footerElement}
      </div>
    </div>
  );
}
