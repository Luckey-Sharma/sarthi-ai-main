import React from 'react';

interface BigButtonProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'calm';
  badge?: string;
  className?: string;
  disabled?: boolean;
}

export const BigButton: React.FC<BigButtonProps> = ({
  title,
  subtitle,
  icon,
  onClick,
  variant = 'primary',
  badge,
  className = '',
  disabled = false,
}) => {
  const variantStyles = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 text-white border-b-4 border-emerald-800 active:border-b-0 shadow-lg shadow-emerald-700/20',
    secondary:
      'bg-white hover:bg-amber-50 text-stone-900 border-2 border-amber-300 border-b-4 border-b-amber-400 active:border-b-2 shadow-md',
    accent:
      'bg-amber-500 hover:bg-amber-600 text-white border-b-4 border-amber-700 active:border-b-0 shadow-lg shadow-amber-600/25',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white border-b-4 border-rose-900 active:border-b-0 shadow-lg shadow-rose-700/30',
    calm:
      'bg-indigo-600 hover:bg-indigo-700 text-white border-b-4 border-indigo-900 active:border-b-0 shadow-lg shadow-indigo-700/25',
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`relative group w-full text-left p-6 sm:p-7 rounded-3xl transition-all duration-150 transform active:translate-y-1 cursor-pointer flex items-center justify-between gap-4 select-none ${
        variantStyles[variant]
      } ${disabled ? 'opacity-50 cursor-not-allowed transform-none' : ''} ${className}`}
    >
      <div className="flex items-center gap-5 min-w-0">
        {icon && (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0 text-3xl sm:text-4xl shadow-inner">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate">
              {title}
            </h3>
            {badge && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/25 text-current shrink-0">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-sm sm:text-base opacity-90 font-medium mt-1 line-clamp-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform">
        <span className="text-xl font-bold">➔</span>
      </div>
    </button>
  );
};

export default BigButton;
