import React from 'react';

interface PakistanFlagCircleProps {
  className?: string;
  size?: number;
}

export const PakistanFlagCircle: React.FC<PakistanFlagCircleProps> = ({
  className = 'w-20 h-20',
  size = 120
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      aria-label="Flag of Pakistan circular emblem"
      role="img"
    >
      <defs>
        {/* Metallic Gold Outer Ring Gradient */}
        <linearGradient id="flagGoldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="25%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="75%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Inner Metallic Bevel Gradient */}
        <linearGradient id="flagInnerBevel" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B45309" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.8" />
        </linearGradient>

        {/* Subtle Dome / Gloss Highlight */}
        <linearGradient id="flagGlassGloss" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>

        {/* Circular Clipping Mask */}
        <clipPath id="flagCircleClip">
          <circle cx="100" cy="100" r="92" />
        </clipPath>
      </defs>

      {/* Outer Shadow Ring */}
      <circle cx="100" cy="100" r="98" fill="none" stroke="#B45309" strokeWidth="2" opacity="0.3" />

      {/* Outer Heavy Gold Beveled Ring */}
      <circle cx="100" cy="100" r="95" fill="none" stroke="url(#flagGoldBorder)" strokeWidth="6" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="url(#flagInnerBevel)" strokeWidth="2" />

      {/* Masked National Flag Content */}
      <g clipPath="url(#flagCircleClip)">
        {/* Deep Pakistani Green Field (#01411C) */}
        <rect x="0" y="0" width="200" height="200" fill="#01411C" />

        {/* White Hoist Stripe on Left Side (27% width = 54px) */}
        <rect x="0" y="0" width="54" height="200" fill="#FFFFFF" />

        {/* Subtle seam line between white and green */}
        <line x1="54" y1="0" x2="54" y2="200" stroke="#002911" strokeWidth="0.75" opacity="0.3" />

        {/* Crescent Moon and Star in Green Field (Center at x=127, y=100) */}
        <g transform="translate(127, 100) rotate(-45)">
          {/* Outer Crescent Moon Path */}
          <path
            fill="#FFFFFF"
            fillRule="evenodd"
            d="
              M 0, -40
              A 40 40 0 1 0 0, 40
              A 34 34 0 1 1 0, -40
              Z
            "
          />

          {/* Five-Pointed Star tilted towards the top opening of the crescent */}
          <g transform="translate(30, -5) rotate(18)">
            <polygon
              fill="#FFFFFF"
              points="
                0,-16
                4.7,-4.8
                15.2,-4.8
                6.7,2.2
                9.9,13
                0,6.5
                -9.9,13
                -6.7,2.2
                -15.2,-4.8
                -4.7,-4.8
              "
            />
          </g>
        </g>

        {/* Dome / Gloss Highlight Layer for authentic 3D medallion look */}
        <circle cx="100" cy="100" r="92" fill="url(#flagGlassGloss)" pointerEvents="none" />
      </g>

      {/* Fine Golden Inner Rim */}
      <circle cx="100" cy="100" r="92" fill="none" stroke="#D97706" strokeWidth="1" opacity="0.6" />
    </svg>
  );
};
