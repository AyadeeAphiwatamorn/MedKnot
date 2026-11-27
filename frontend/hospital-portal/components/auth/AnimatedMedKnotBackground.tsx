import React from 'react';

/**
 * AnimatedMedKnotBackground
 *
 * Full-viewport flowing organic gradient background for all authentication pages
 * using the enriched MedKnot CI palette:
 *   - Deep Blue          (#0C426D)
 *   - Medium Blue        (#397EAA)
 *   - Powder Blue        (#A9CDE7)
 *   - Sage Green         (#B5D0A9)
 *   - Soft Green         (#C9DFC5)
 *   - Warm Pastel Yellow (#E8D99A)
 *
 * Visual composition:
 *   - Rich Deep Blue (#0C426D) anchored in the lower-left and lower region for depth
 *   - Medium Blue (#397EAA) transitioning smoothly into Powder Blue (#A9CDE7)
 *   - Powder Blue blending organically into Sage Green (#B5D0A9) & Soft Green (#C9DFC5)
 *   - Warm Pastel Yellow (#E8D99A) illuminating the right and upper-right areas
 *   - Zero harsh stripes, zero washed-out white base; pure CSS compositor animations
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
        backgroundColor: '#A9CDE7',
      }}
    >
      {/* ── Base layer: Continuous Deep Blue → Powder Blue → Sage → Pastel Yellow field ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(115% 105% at 15% 88%, #0C426D 0%, #397EAA 28%, #A9CDE7 56%, #B5D0A9 80%, #E8D99A 100%)',
        }}
      />

      {/* ── Layer 1: Deep Blue → Medium Blue bottom-left wave for rich lower depth (20s) ── */}
      <div
        className="mk-anim-blue"
        style={{
          position: 'absolute',
          bottom: '-24%',
          left: '-16%',
          width: '84vw',
          height: '84vh',
          borderRadius: '48% 52% 45% 55%',
          background:
            'radial-gradient(65% 60% at 28% 72%, rgba(12, 66, 109, 0.96) 0%, rgba(12, 66, 109, 0.84) 24%, rgba(57, 126, 170, 0.78) 52%, rgba(169, 205, 231, 0.48) 76%, transparent 94%)',
          filter: 'blur(44px)',
        }}
      />

      {/* ── Layer 2: Medium Blue → Powder Blue lower-center orbital bridge (29s) ── */}
      <div
        className="mk-anim-ambient"
        style={{
          position: 'absolute',
          bottom: '-18%',
          left: '16%',
          width: '76vw',
          height: '76vh',
          borderRadius: '50%',
          background:
            'radial-gradient(62% 56% at 38% 68%, rgba(12, 66, 109, 0.62) 0%, rgba(57, 126, 170, 0.72) 34%, rgba(169, 205, 231, 0.72) 64%, transparent 92%)',
          filter: 'blur(48px)',
        }}
      />

      {/* ── Layer 3: Powder Blue → Sage Green → Soft Green center transition (26s) ── */}
      <div
        className="mk-anim-green"
        style={{
          position: 'absolute',
          top: '-14%',
          left: '12%',
          width: '82vw',
          height: '88vh',
          borderRadius: '54% 46% 52% 48%',
          background:
            'radial-gradient(62% 58% at 46% 42%, rgba(169, 205, 231, 0.82) 0%, rgba(181, 208, 169, 0.84) 44%, rgba(201, 223, 197, 0.66) 72%, transparent 92%)',
          filter: 'blur(46px)',
        }}
      />

      {/* ── Layer 4: Warm Pastel Yellow → Soft Green upper-right & right glow (22s) ── */}
      <div
        className="mk-anim-yellow"
        style={{
          position: 'absolute',
          top: '-12%',
          right: '-14%',
          width: '78vw',
          height: '88vh',
          borderRadius: '44% 56% 50% 50%',
          background:
            'radial-gradient(64% 58% at 62% 36%, rgba(232, 217, 154, 0.88) 0%, rgba(201, 223, 197, 0.78) 42%, rgba(181, 208, 169, 0.56) 68%, transparent 92%)',
          filter: 'blur(44px)',
        }}
      />

      {/* ── Layer 5: Soft Green & Pastel Yellow diagonal silk shimmer on lower-right (18s) ── */}
      <div
        className="mk-anim-silk"
        style={{
          position: 'absolute',
          bottom: '-10%',
          right: '-8%',
          width: '90vw',
          height: '78vh',
          borderRadius: '45% 55% 60% 40%',
          background:
            'radial-gradient(60% 54% at 68% 64%, rgba(232, 217, 154, 0.52) 0%, rgba(181, 208, 169, 0.58) 38%, rgba(169, 205, 231, 0.42) 70%, transparent 94%)',
          filter: 'blur(42px)',
        }}
      />

      {/* ── Layer 6: Upper-left Powder Blue → Soft Green luminance without harsh whiteout ── */}
      <div
        style={{
          position: 'absolute',
          top: '-12%',
          left: '-10%',
          width: '66vw',
          height: '66vh',
          background:
            'radial-gradient(62% 58% at 32% 34%, rgba(169, 205, 231, 0.78) 0%, rgba(201, 223, 197, 0.46) 52%, transparent 88%)',
          filter: 'blur(46px)',
        }}
      />
    </div>
  );
}
