import React from 'react';

interface ChampionsLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const ChampionsLogo: React.FC<ChampionsLogoProps> = ({
  width = 24,
  height = 24,
  className,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#0D47A1" />
        </linearGradient>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="30%" stopColor="#FFC107" />
          <stop offset="70%" stopColor="#FF8F00" />
          <stop offset="100%" stopColor="#E65100" />
        </linearGradient>
        <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF59D" />
          <stop offset="100%" stopColor="#FFD54F" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodColor="rgba(0,0,0,0.3)"
          />
        </filter>
        <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="1"
            stdDeviation="1"
            floodColor="rgba(0,0,0,0.2)"
          />
        </filter>
      </defs>

      {/* Letter C */}
      <path
        d="M24 10 C31 10 36 15 36 22 L36 26 C36 33 31 38 24 38 C17 38 12 33 12 26 L12 22 C12 15 17 10 24 10 Z M24 14 C19 14 16 17 16 22 L16 26 C16 31 19 34 24 34 C29 34 32 31 32 26 L30 26 C30 29 27 31 24 31 C21 31 19 29 19 26 L19 22 C19 19 21 17 24 17 C27 17 30 19 30 22 L32 22 C32 17 29 14 24 14 Z"
        fill="url(#blueGradient)"
        filter="url(#shadow)"
      />

      {/* Crown base - wider and more substantial */}
      <rect
        x="10"
        y="5"
        width="28"
        height="4"
        rx="2"
        fill="url(#goldGradient)"
        filter="url(#shadow)"
      />

      {/* Crown band decoration */}
      <rect
        x="10"
        y="6"
        width="28"
        height="1"
        fill="url(#goldHighlight)"
        opacity="0.8"
      />

      {/* Crown points - better proportioned */}
      <path
        d="M12 9 L15 2 L18 7 L21 3 L24 1 L27 3 L30 7 L33 2 L36 9 Z"
        fill="url(#goldGradient)"
        filter="url(#shadow)"
      />

      {/* Crown points highlights */}
      <path
        d="M12 9 L15 2 L17 6 L20 4 L24 1 L28 4 L31 6 L33 2 L36 9 L33 8 L30 6 L27 4 L24 2 L21 4 L18 6 L15 3 Z"
        fill="url(#goldHighlight)"
        opacity="0.6"
      />

      {/* Crown gems - larger and more prominent */}
      <circle
        cx="18"
        cy="5.5"
        r="1.5"
        fill="#E3F2FD"
        opacity="0.9"
        filter="url(#innerShadow)"
      />
      <circle
        cx="24"
        cy="3"
        r="2"
        fill="#E3F2FD"
        opacity="0.9"
        filter="url(#innerShadow)"
      />
      <circle
        cx="30"
        cy="5.5"
        r="1.5"
        fill="#E3F2FD"
        opacity="0.9"
        filter="url(#innerShadow)"
      />

      {/* Small accent gems */}
      <circle cx="21" cy="4" r="0.8" fill="#BBDEFB" opacity="0.7" />
      <circle cx="27" cy="4" r="0.8" fill="#BBDEFB" opacity="0.7" />

      {/* Highlight on C */}
      <path d="M17 20 Q19 18 21 20 Q19 22 17 20" fill="rgba(255,255,255,0.4)" />

      {/* Additional crown details */}
      <path
        d="M13 8 L15 3 L17 7 M19 7 L21 4 L23 7 M25 7 L27 4 L29 7 M31 7 L33 3 L35 8"
        stroke="rgba(255,215,0,0.3)"
        strokeWidth="0.5"
        fill="none"
      />
    </svg>
  );
};

export default ChampionsLogo;
