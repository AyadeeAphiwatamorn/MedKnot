import React from 'react';

export interface AnimatedGradientBackgroundProps {
  /** Variant allows future palette tuning while defaulting to the official MedKnot CI theme */
  variant?: 'blue' | 'green';
}

/**
 * AnimatedGradientBackground — Continuous, fluid organic silk/liquid gradient background
 * for the MedKnot Hospital Portal authentication flow.
 *
 * Implements the MedKnot CI Palette:
 *   - Fresh Blue:     #015CA9
 *   - Creamy Avocado: #DFEEA9
 *   - Light Blue:     #E1F2FD
 *   - Soft White:     #F8FAF6 (Base canvas)
 *   - Sage Green:     #A3C8B4
 *   - Soft Yellow:    #FAE193
 *
 * Movement:
 *   - Layer A (Fresh Blue -> Light Blue): gently flows horizontally (22s duration)
 *   - Layer B (Light Blue -> Sage Green): moves in reverse direction (26s duration)
 *   - Layer C (Creamy Avocado -> Soft Yellow): undulating scale and position shifts (20s duration)
 *   - Layer D (Ambient highlight): subtle breathing luminescence (28s duration)
 *
 * Performance:
 *   - GPU accelerated via CSS transform: translate3d(...) and scale(...)
 *   - will-change: transform declared on all moving elements
 *   - Zero JavaScript/React state animation overhead (runs on browser compositor thread)
 *   - Reduced motion supported via media query fallback
 */
export default function AnimatedGradientBackground({
  variant = 'blue',
}: AnimatedGradientBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full overflow-hidden bg-[#F8FAF6]"
    >
      {/* ── Base Subtle Atmosphere ───────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, #FFFFFF 0%, #F8FAF6 60%, #F1F6F0 100%)',
        }}
      />

      {/* ── Layer A: Fresh Blue transitioning into Light Blue ───────── */}
      {/* Gently flows horizontally (22s alternate) */}
      <div
        className="animate-medknot-flow-blue absolute -top-[15%] -left-[10%] h-[115vh] w-[88vw] rounded-full opacity-65 blur-[80px] lg:blur-[110px]"
        style={{
          background:
            variant === 'green'
              ? 'radial-gradient(circle at 40% 40%, rgba(163, 200, 180, 0.45) 0%, rgba(225, 242, 253, 0.5) 50%, rgba(248, 250, 246, 0) 75%)'
              : 'radial-gradient(circle at 35% 35%, rgba(1, 92, 169, 0.22) 0%, rgba(225, 242, 253, 0.65) 45%, rgba(248, 250, 246, 0) 75%)',
        }}
      />

      {/* ── Layer B: Light Blue blending into Sage Green ────────────── */}
      {/* Moves in reverse counter-flow direction (26s alternate) */}
      <div
        className="animate-medknot-flow-green absolute -right-[15%] -bottom-[20%] h-[120vh] w-[85vw] rounded-full opacity-65 blur-[90px] lg:blur-[120px]"
        style={{
          background:
            'radial-gradient(circle at 60% 60%, rgba(163, 200, 180, 0.45) 0%, rgba(225, 242, 253, 0.45) 42%, rgba(248, 250, 246, 0) 75%)',
        }}
      />

      {/* ── Layer C: Creamy Avocado blending into Soft Yellow ───────── */}
      {/* Shifts scale and position from bottom-left to center (20s alternate) */}
      <div
        className="animate-medknot-flow-yellow absolute -bottom-[10%] left-[8%] h-[95vh] w-[75vw] rounded-full opacity-60 blur-[85px] lg:blur-[110px]"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(223, 238, 169, 0.55) 0%, rgba(250, 225, 147, 0.35) 46%, rgba(248, 250, 246, 0) 75%)',
        }}
      />

      {/* ── Layer D: Ambient Upper-Right Light (Avocado + Light Blue) ── */}
      {/* Gentle organic drift and breathing luminescence (28s alternate) */}
      <div
        className="animate-medknot-flow-ambient absolute -top-[12%] right-[5%] h-[80vh] w-[65vw] rounded-full opacity-55 blur-[90px] lg:blur-[115px]"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(223, 238, 169, 0.4) 0%, rgba(225, 242, 253, 0.48) 48%, rgba(248, 250, 246, 0) 75%)',
        }}
      />
    </div>
  );
}
