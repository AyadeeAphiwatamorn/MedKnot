import React from 'react';
import { Inter } from 'next/font/google';
import BrandPanel, { type BrandPanelProps } from '@/components/auth/BrandPanel';

/**
 * Inter is scoped to auth pages only.
 * The root layout uses Geist to avoid overriding global font settings
 * and conflicting with other team members' modules (M5–M8).
 */
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

export interface AuthLayoutProps extends BrandPanelProps {
  children: React.ReactNode;
  /** Override the outer page background colour (hex/rgb). */
  pageBg?: string;
  /** Optional top header element (e.g. demo state switcher for audit/QA). */
  headerElement?: React.ReactNode;
  /** Optional bottom footer element (e.g. legal disclaimer bar). */
  footerElement?: React.ReactNode;
}

/**
 * AuthLayout — Shared page shell for all authentication screens.
 *
 * Renders:
 *   - Full-screen background (radial gradient or solid, per variant)
 *   - Centered white card with rounded corners and soft shadow
 *   - Two-column layout: BrandPanel (left) | form slot (right)
 *   - On mobile/tablet: single column, BrandPanel stacks above form
 *   - Optional header and footer slots for state switcher and disclaimer
 *
 * Inter font is applied here and scoped to auth pages only.
 * BrandPanel headline, subCopy, and variant are forwarded through props.
 *
 * Used by: /login, /forgot-password, /verify, /reset-password
 */
export default function AuthLayout({
  children,
  pageBg,
  headline,
  subCopy,
  footerTagline,
  variant = 'blue',
  headerElement,
  footerElement,
}: AuthLayoutProps) {
  const defaultBg =
    variant === 'green'
      ? '#EBECE7'
      : 'radial-gradient(circle at 10% 20%, #E6F4FF 0%, #F7FBF5 50%, #F0F7EE 100%)';

  return (
    <div
      className={`${inter.variable} min-h-screen w-full font-[var(--font-inter)] antialiased`}
      style={{ background: pageBg ?? defaultBg }}
    >
      {/* Outer centering wrapper */}
      <div
        className={`flex min-h-screen w-full flex-col items-center ${
          headerElement || footerElement
            ? 'justify-between p-4 sm:p-6 lg:p-10'
            : 'justify-center p-4 md:p-8'
        }`}
      >
        {headerElement}

        {/* Main card */}
        <main className="flex w-full max-w-[1360px] flex-col overflow-hidden rounded-[28px] border border-[#E9ECEF] bg-white shadow-[0_20px_50px_rgba(9,37,64,0.06)] lg:min-h-[820px] lg:flex-row">
          {/* Left: branding panel */}
          <BrandPanel
            headline={headline}
            subCopy={subCopy}
            footerTagline={footerTagline}
            variant={variant}
          />

          {/* Right: page-specific form content */}
          <section className="relative flex flex-col items-center justify-center bg-white p-8 lg:w-1/2 md:p-14 lg:p-16">
            {children}
          </section>
        </main>

        {footerElement}
      </div>
    </div>
  );
}
