'use client';

import React from 'react';

export default function SafeIllustration() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(170deg, #dcebfa 0%, #c4e1f8 35%, #9ecbf4 70%, #82bdf1 100%)',
        borderTopRightRadius: '24px',
        borderBottomRightRadius: '24px',
      }}
    >
      {/* Background vertical light streaks matching screenshot */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '10%', left: '16%', width: '4px', height: '64px', background: 'rgba(255, 255, 255, 0.45)', borderRadius: '9999px', filter: 'blur(0.5px)' }} />
        <div style={{ position: 'absolute', top: '6%', right: '24%', width: '4px', height: '80px', background: 'rgba(255, 255, 255, 0.45)', borderRadius: '9999px', filter: 'blur(0.5px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '12%', width: '4px', height: '76px', background: 'rgba(255, 255, 255, 0.35)', borderRadius: '9999px', filter: 'blur(0.5px)' }} />
        <div style={{ position: 'absolute', top: '68%', right: '20%', width: '4px', height: '70px', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '9999px', filter: 'blur(0.5px)' }} />
        <div style={{ position: 'absolute', top: '32%', right: '10%', width: '3px', height: '50px', background: 'rgba(255, 255, 255, 0.28)', borderRadius: '9999px', filter: 'blur(0.5px)' }} />
        <div style={{ position: 'absolute', bottom: '12%', left: '38%', width: '3px', height: '45px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '9999px', filter: 'blur(0.5px)' }} />
      </div>

      {/* Floating 3D Isometric Safe Container */}
      <div
        style={{
          position: 'relative',
          width: '380px',
          height: '380px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'safeFloating 4.5s ease-in-out infinite',
        }}
      >
        <style>{`
          @keyframes safeFloating {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-12px) rotate(0.8deg);
            }
          }
        `}</style>

        <svg
          viewBox="0 0 420 420"
          style={{ width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 25px 35px rgba(22, 60, 115, 0.22))' }}
        >
          <defs>
            {/* Outer Safe Light Blue Body Shading */}
            <linearGradient id="bodyTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#b3dcfc" />
              <stop offset="50%" stopColor="#96ccf7" />
              <stop offset="100%" stopColor="#7cbcf0" />
            </linearGradient>

            <linearGradient id="bodyRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#75b5ec" />
              <stop offset="50%" stopColor="#539fe3" />
              <stop offset="100%" stopColor="#3782cf" />
            </linearGradient>

            {/* Front Bevel Outer Rim */}
            <linearGradient id="frontBevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#488ece" />
              <stop offset="100%" stopColor="#2564a5" />
            </linearGradient>

            {/* Recessed Safe Door Dark Navy */}
            <linearGradient id="doorInterior" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e4e82" />
              <stop offset="40%" stopColor="#183f6b" />
              <stop offset="100%" stopColor="#112d4e" />
            </linearGradient>

            {/* Cyan Dial 3D Gradients */}
            <linearGradient id="dialSide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>

            <linearGradient id="dialFace" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="60%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <linearGradient id="dialWell" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0e4e68" />
              <stop offset="100%" stopColor="#083344" />
            </linearGradient>

            {/* Chrome Three-Spoke Vault Wheel Handle */}
            <linearGradient id="chromeMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#f1f5f9" />
              <stop offset="70%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="chromeDark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Soft Ambient Ground Shadow */}
            <radialGradient id="safeGroundShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(18, 52, 98, 0.45)" />
              <stop offset="50%" stopColor="rgba(18, 52, 98, 0.2)" />
              <stop offset="100%" stopColor="rgba(18, 52, 98, 0)" />
            </radialGradient>
          </defs>

          {/* 0. Ambient Ground Shadow */}
          <ellipse
            cx="210"
            cy="360"
            rx="145"
            ry="30"
            fill="url(#safeGroundShadow)"
          />

          {/* 1. TOP FACE (Isometric perspective) */}
          <path
            d="M 92 108
               C 88 100, 96 94, 106 91
               L 278 70
               C 288 69, 298 75, 302 83
               L 358 122
               C 362 125, 360 131, 354 133
               L 295 145
               L 92 108 Z"
            fill="url(#bodyTop)"
          />

          {/* 2. RIGHT SIDE FACE (Isometric depth) */}
          <path
            d="M 295 145
               L 358 122
               C 364 125, 368 132, 368 140
               L 368 268
               C 368 276, 362 284, 355 288
               L 295 315
               L 295 145 Z"
            fill="url(#bodyRight)"
          />

          {/* 3. FRONT BEVEL (Rounded square frame) */}
          <rect
            x="75"
            y="108"
            width="220"
            height="207"
            rx="36"
            fill="url(#frontBevel)"
          />

          {/* 4. RECESSED INNER DOOR (Dark Navy) */}
          <rect
            x="93"
            y="125"
            width="184"
            height="173"
            rx="26"
            fill="url(#doorInterior)"
          />

          {/* Inner Door Edge Highlight & Depth */}
          <rect
            x="95"
            y="127"
            width="180"
            height="169"
            rx="24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="2.5"
          />

          {/* 5. CYAN 3D COMBINATION DIAL */}
          <g transform="translate(155, 212)">
            {/* Cyan Dial 3D Base Extrusion */}
            <circle cx="2" cy="4" r="46" fill="#0891b2" />
            {/* Front Cyan Dial Face */}
            <circle cx="0" cy="0" r="46" fill="url(#dialFace)" />

            {/* Recessed Dial Outer Ring */}
            <circle cx="0" cy="0" r="40" fill="url(#dialSide)" opacity="0.6" />

            {/* 10 Circular Dimples/Holes on Dial Perimeter */}
            {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, idx) => {
              const rad = (angle * Math.PI) / 180;
              const cx = Math.cos(rad) * 28;
              const cy = Math.sin(rad) * 28;
              return (
                <g key={idx}>
                  <circle cx={cx} cy={cy} r="4.2" fill="#0e4e68" />
                  <circle cx={cx - 0.5} cy={cy - 0.5} r="3.2" fill="#083344" />
                  <circle cx={cx + 0.8} cy={cy + 0.8} r="1.5" fill="#67e8f9" opacity="0.8" />
                </g>
              );
            })}

            {/* Inner Center Recess */}
            <circle cx="0" cy="0" r="16" fill="url(#dialWell)" />
            <circle cx="0" cy="0" r="14" fill="#0c4a6e" />
          </g>

          {/* 6. THREE-SPOKE SILVER CHROME VAULT WHEEL */}
          <g transform="translate(202, 204)">
            {/* Spoke 1 - Top/Left (-40 deg) */}
            <g transform="rotate(-40)">
              <rect x="-4.5" y="-42" width="9" height="42" rx="4.5" fill="url(#chromeMetal)" stroke="url(#chromeDark)" strokeWidth="0.8" />
              <circle cx="0" cy="-42" r="7.5" fill="url(#chromeMetal)" stroke="url(#chromeDark)" strokeWidth="0.8" />
              <circle cx="-1.5" cy="-43.5" r="2.5" fill="#ffffff" opacity="0.9" />
            </g>

            {/* Spoke 2 - Right/Up (80 deg) */}
            <g transform="rotate(80)">
              <rect x="-4.5" y="-42" width="9" height="42" rx="4.5" fill="url(#chromeMetal)" stroke="url(#chromeDark)" strokeWidth="0.8" />
              <circle cx="0" cy="-42" r="7.5" fill="url(#chromeMetal)" stroke="url(#chromeDark)" strokeWidth="0.8" />
              <circle cx="-1.5" cy="-43.5" r="2.5" fill="#ffffff" opacity="0.9" />
            </g>

            {/* Spoke 3 - Bottom/Down-Left (200 deg) */}
            <g transform="rotate(200)">
              <rect x="-4.5" y="-42" width="9" height="42" rx="4.5" fill="url(#chromeMetal)" stroke="url(#chromeDark)" strokeWidth="0.8" />
              <circle cx="0" cy="-42" r="7.5" fill="url(#chromeMetal)" stroke="url(#chromeDark)" strokeWidth="0.8" />
              <circle cx="-1.5" cy="-43.5" r="2.5" fill="#ffffff" opacity="0.9" />
            </g>

            {/* Center Hub Outer Ring */}
            <circle cx="0" cy="0" r="15" fill="url(#chromeDark)" />
            <circle cx="0" cy="0" r="13" fill="url(#chromeMetal)" />
            <circle cx="-2.5" cy="-2.5" r="5" fill="#ffffff" opacity="0.8" />
          </g>

          {/* Right Edge Vault Door Hinges */}
          <rect x="274" y="148" width="6" height="22" rx="3" fill="#67a9e6" />
          <rect x="274" y="240" width="6" height="22" rx="3" fill="#67a9e6" />
        </svg>
      </div>
    </div>
  );
}
