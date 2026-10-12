import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  inverted?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  inverted = false,
  className = '',
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      role="banner"
    >
      {/* Precision SVG Water Droplet with Green Leaf & Flowing Water Lines */}
      <div className={`relative shrink-0 ${iconSizes[size]} flex items-center justify-center`}>
        <svg
          viewBox="0 0 100 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform duration-200 hover:scale-105"
        >
          <defs>
            {/* Primary Water Droplet Gradient */}
            <linearGradient id="dropGrad" x1="50" y1="5" x2="50" y2="115" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="45%" stopColor="#0B6FB8" />
              <stop offset="100%" stopColor="#082B49" />
            </linearGradient>

            {/* Vibrant Green Leaf Gradient */}
            <linearGradient id="leafGrad" x1="30" y1="40" x2="70" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Subtle Water Flow Gradient */}
            <linearGradient id="flowGrad" x1="20" y1="65" x2="80" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Droplet Silhouette */}
          <path
            d="M50 8 C50 8, 16 54, 16 80 C16 99 31 114 50 114 C69 114 84 99 84 80 C84 54, 50 8, 50 8 Z"
            fill="url(#dropGrad)"
          />

          {/* Flowing Water Line Bottom */}
          <path
            d="M24 82 C34 94, 66 94, 76 82 C68 90, 32 90, 24 82 Z"
            fill="url(#flowGrad)"
          />

          {/* Central Leaf Curve */}
          <path
            d="M48 42 C58 52, 68 68, 64 86 C54 88, 38 78, 38 62 C38 50, 48 42, 48 42 Z"
            fill="url(#leafGrad)"
          />

          {/* Leaf Central Rib Line */}
          <path
            d="M49 45 Q53 62 57 80"
            stroke="#ECFDF5"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Secondary Wave Flow Line */}
          <path
            d="M30 72 C40 68, 60 74, 70 70"
            stroke="#BAE6FD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 2"
          />

          {/* Light Reflection Highlight at Apex */}
          <ellipse
            cx="40"
            cy="28"
            rx="4"
            ry="9"
            transform="rotate(-25 40 28)"
            fill="#FFFFFF"
            fillOpacity="0.35"
          />
        </svg>
      </div>

      {/* Wordmark and Tagline */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-bold tracking-tight ${textSizes[size]} ${
              inverted ? 'text-white' : 'text-slate-900'
            }`}
          >
            EcoWatch
          </span>
          <span className="font-bold text-teal-500 tracking-tight text-xs px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/20">
            AI
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[11px] font-medium tracking-normal mt-0.5 ${
              inverted ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Cleaner Water • Healthier Tomorrow
          </span>
        )}
      </div>
    </div>
  );
};
