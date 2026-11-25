import React from 'react';

/**
 * AnimatedMedKnotBackground
 *
 * Full-viewport flowing silk gradient background using official MedKnot CI colors:
 *   - Fresh Blue     (#015CA9)
 *   - Light Blue     (#E1F2FD)
 *   - Sage Green     (#A3C8B4)
 *   - Creamy Avocado (#DFEEA9)
 *   - Soft Yellow    (#FAE193)
 *   - Soft White     (#F8FAF6)
 *
 * Visual composition mirrors the reference silk waves:
 *   - Luminous Soft White & Light Blue upper-left canvas for dark-navy text contrast
 *   - Flowing Fresh Blue → Light Blue liquid wave sweeping from bottom-left (20s, L→R)
 *   - Counter-flowing Sage Green → Creamy Avocado wave across center & upper-right (26s, R→L)
 *   - Warm Creamy Avocado → Soft Yellow silk glow beneath & right of the login card (22s)
 *   - Translucent Soft White / Light Blue silk ribbon folds adding organic depth (18s / 29s)
 *
 * Performance & accessibility:
 *   - Pure CSS GPU-composited translate3d / scale / rotate keyframes (zero React re-renders)
 *   - Static presentation when prefers-reduced-motion: reduce is active
 *   - Fixed full-screen z-0 layer with overflow: hidden and pointer-events: none
 */
export default function AnimatedMedKnotBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        backgroundColor: '#F8FAF6',
      }}
    >
      {/* ── Base layer: Soft White → Light Blue luminous silk backdrop ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(125deg, #F8FAF6 0%, #E1F2FD 42%, #F8FAF6 72%, #E1F2FD 100%)',
        }}
      />

      {/* ── Layer 1: Fresh Blue → Light Blue bottom-left wave, flows left-to-right (20s) ── */}
      <div
        className="mk-anim-blue"
        style={{
          position: 'absolute',
          bottom: '-26%',
          left: '-18%',
          width: '78vw',
          height: '82vh',
          borderRadius: '48% 52% 45% 55%',
          background:
            'radial-gradient(64% 58% at 28% 68%, #015CA9 0%, rgba(1,92,169,0.78) 28%, rgba(225,242,253,0.82) 64%, transparent 88%)',
          filter: 'blur(38px)',
        }}
      />

      {/* ── Layer 2: Light Blue → Sage Green counter-wave, moves right-to-left (26s) ── */}
      <div
        className="mk-anim-green"
        style={{
          position: 'absolute',
          top: '-12%',
          right: '-14%',
          width: '82vw',
          height: '95vh',
          borderRadius: '54% 46% 52% 48%',
          background:
            'radial-gradient(60% 56% at 56% 42%, rgba(163,200,180,0.82) 0%, rgba(225,242,253,0.88) 44%, rgba(223,238,169,0.5) 70%, transparent 90%)',
          filter: 'blur(42px)',
        }}
      />

      {/* ── Layer 3: Creamy Avocado → Soft Yellow organic ribbon, bottom-center to right (22s) ── */}
      <div
        className="mk-anim-yellow"
        style={{
          position: 'absolute',
          bottom: '-22%',
          left: '26%',
          width: '76vw',
          height: '78vh',
          borderRadius: '44% 56% 50% 50%',
          background:
            'radial-gradient(62% 54% at 48% 58%, rgba(223,238,169,0.92) 0%, rgba(250,225,147,0.82) 36%, rgba(163,200,180,0.48) 66%, transparent 88%)',
          filter: 'blur(36px)',
        }}
      />

      {/* ── Layer 4: Light Blue secondary wave — mid-left diagonal shift (29s) ── */}
      <div
        className="mk-anim-ambient"
        style={{
          position: 'absolute',
          top: '14%',
          left: '-10%',
          width: '68vw',
          height: '72vh',
          borderRadius: '50%',
          background:
            'radial-gradient(58% 52% at 40% 52%, rgba(225,242,253,0.95) 0%, rgba(1,92,169,0.34) 46%, rgba(163,200,180,0.28) 72%, transparent 90%)',
          filter: 'blur(40px)',
        }}
      />

      {/* ── Layer 5: Luminous Soft White silk ribbon fold for signature liquid sheen (18s) ── */}
      <div
        className="mk-anim-silk"
        style={{
          position: 'absolute',
          top: '-18%',
          left: '-15%',
          width: '130vw',
          height: '90vh',
          borderRadius: '45% 55% 60% 40%',
          background:
            'linear-gradient(118deg, rgba(248,250,246,0.92) 8%, rgba(225,242,253,0.72) 32%, rgba(248,250,246,0.88) 50%, rgba(223,238,169,0.42) 68%, rgba(250,225,147,0.38) 84%, transparent 96%)',
          filter: 'blur(30px)',
        }}
      />

      {/* ── Layer 6: Soft White top-left readability mist behind hero typography ── */}
      <div
        style={{
          position: 'absolute',
          top: '-8%',
          left: '-6%',
          width: '58vw',
          height: '62vh',
          background:
            'radial-gradient(62% 58% at 32% 32%, rgba(248,250,246,0.90) 0%, rgba(248,250,246,0.45) 55%, transparent 86%)',
          filter: 'blur(32px)',
        }}
      />
    </div>
  );
}
