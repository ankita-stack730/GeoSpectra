import React from 'react';
import { CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AnalysisRangeOption {
  key: string;
  label: string;
  description: string;
  days: number | null;
}

interface AnalysisRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: AnalysisRangeOption[];
}

export const AnalysisRangeSelector: React.FC<AnalysisRangeSelectorProps> = ({
  value,
  onChange,
  options,
}) => (
  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-2">
    <div className="mb-2 flex items-center gap-2 px-2 text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
      <CalendarRange size={12} className="text-aurora-400" />
      Analysis window
    </div>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={cn(
            'rounded-xl border px-3 py-2 text-left transition-colors',
            value === option.key
              ? 'border-aurora-500/40 bg-aurora-500/10 text-aurora-300'
              : 'border-white/[0.08] bg-space-950/40 text-text-secondary hover:border-white/[0.12] hover:text-text-primary'
          )}
        >
          <div className="text-[10px] font-mono uppercase tracking-[0.18em]">{option.label}</div>
          <div className="mt-1 text-[9px] text-text-muted">{option.description}</div>
        </button>
      ))}
    </div>
  </div>
);
