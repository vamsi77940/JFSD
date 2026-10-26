import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: {
    text: string;
    variant: 'positive' | 'warning' | 'danger' | 'neutral';
  };
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = 'text-purple-400',
  badge,
}) => {
  const getBadgeStyle = () => {
    if (!badge) return '';
    switch (badge.variant) {
      case 'positive':
        return 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/40';
      case 'warning':
        return 'text-amber-400 bg-amber-950/60 border border-amber-800/40';
      case 'danger':
        return 'text-rose-400 bg-rose-950/60 border border-rose-800/40';
      default:
        return 'text-slate-400 bg-slate-800/60 border border-slate-700/40';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 transition-all hover:border-slate-700/80 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{title}</span>
        <div className={`p-2 rounded-lg bg-slate-950/80 border border-slate-800/50 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">{value}</h3>
      </div>
      {(subtext || badge) && (
        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <span>{subtext}</span>
          {badge && (
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${getBadgeStyle()}`}>
              {badge.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
