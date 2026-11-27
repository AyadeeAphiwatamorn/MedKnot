'use client';

import React, { useRef, useCallback } from 'react';

export type OtpState = 'default' | 'invalid' | 'expired' | 'rate-limit' | 'success';

interface OtpInputProps {
  /** Current 6-character array of digit strings ('' for empty). */
  digits: string[];
  onChange: (digits: string[]) => void;
  state: OtpState;
  disabled?: boolean;
}

const STATE_STYLES: Record<OtpState, string> = {
  default:
    'border-[#AEBEAA] bg-[#F3F7F2] hover:border-[#8EA389] hover:bg-[#EEF4ED] focus:bg-white focus:border-[#0055A4] focus:ring-[3px] focus:ring-[#0055A4]/15',
  invalid:
    'border-red-500 bg-white ring-2 ring-red-100',
  expired:
    'border-amber-400 bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200',
  'rate-limit':
    'border-[#C5D1C2] bg-[#E9EFE7] text-[#556173] opacity-70 cursor-not-allowed',
  success:
    'border-emerald-500 ring-2 ring-emerald-200 bg-emerald-50/30',
};

/**
 * OtpInput — Six individual digit boxes for OTP entry.
 *
 * Features:
 *   - Numeric only (filters non-digits)
 *   - Auto-advance on digit entry
 *   - Backspace navigates to previous box
 *   - Paste of full 6-digit code populates all boxes
 *   - Per-box styling driven by `state` prop
 *   - Disabled in rate-limit and success states
 *
 * Used by: OtpVerificationForm.
 */
export default function OtpInput({ digits, onChange, state, disabled = false }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const isDisabled = disabled || state === 'rate-limit' || state === 'success';

  const setRef = useCallback(
    (el: HTMLInputElement | null, idx: number) => {
      refs.current[idx] = el;
    },
    [],
  );

  const updateDigit = (idx: number, val: string) => {
    const next = [...digits];
    next[idx] = val;
    onChange(next);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        // Clear current box
        updateDigit(idx, '');
      } else if (idx > 0) {
        // Move to previous and clear it
        refs.current[idx - 1]?.focus();
        updateDigit(idx - 1, '');
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      refs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    const digit = raw.slice(-1); // keep last digit typed
    updateDigit(idx, digit);
    if (idx < 5) {
      refs.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] ?? '';
    }
    onChange(next);
    // Focus the last filled box or the next empty one
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  const boxStyle = STATE_STYLES[state];

  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-2.5" aria-label="6-digit verification code">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => setRef(el, idx)}
          id={`otp-${idx + 1}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          placeholder="-"
          disabled={isDisabled}
          aria-label={`Digit ${idx + 1}`}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          data-otp-input="true"
          className={`h-13 w-full rounded-xl border-[1.5px] bg-[#F3F7F2] text-center text-xl font-bold text-[#1F2B46] shadow-2xs transition-all focus:outline-none sm:h-14
            ${idx === 0 && state === 'default' && !digit ? 'border-[#0055A4] bg-white ring-[3px] ring-[#0055A4]/15' : boxStyle}
            ${isDisabled ? 'cursor-not-allowed' : ''}`}
        />
      ))}
    </div>
  );
}
