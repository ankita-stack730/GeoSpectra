import React from 'react';
import { Radar } from 'lucide-react';
import { TileThumbnail } from './TileThumbnail';
import { formatDate } from '@/lib/utils';

export interface Sentinel1EvidenceItem {
  date: string;
  label: string;
  subtitle?: string;
  imageUrl?: string | null;
  metric?: string;
}

interface Sentinel1EvidenceGridProps {
  items?: Sentinel1EvidenceItem[];
  className?: string;
}

export const Sentinel1EvidenceGrid: React.FC<Sentinel1EvidenceGridProps> = ({ items, className }) => {
  const cards = items ?? [];

  if (cards.length === 0) {
    return (
      <div className={className}>
        <div className="rounded-xl border border-dashed border-white/[0.08] bg-space-950/60 p-4 text-center text-[10px] font-mono uppercase tracking-[0.18em] text-text-muted">
          No Sentinel-1 evidence for this date window
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
          <Radar size={12} className="text-aurora-400" />
          Sentinel-1 evidence stack
        </div>
        <span className="rounded-full border border-aurora-500/20 bg-aurora-500/10 px-2 py-0.5 text-[9px] font-mono uppercase text-aurora-300">
          {cards.length} layers
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.slice(0, 4).map((item, index) => (
          <div
            key={`${item.label}-${index}`}
            className="rounded-xl border border-white/[0.08] bg-space-950/70 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]"
          >
            <TileThumbnail
              src={item.imageUrl ?? undefined}
              alt={`${item.label} evidence`}
              aspectRatio="square"
              zoomOnHover
              unavailable={!item.imageUrl}
              unavailableLabel="Sentinel-1 preview unavailable"
            />
            <div className="mt-2 space-y-1 font-mono">
              <div className="flex items-center justify-between gap-2 text-[9px] uppercase tracking-[0.12em] text-text-muted">
                <span>{item.label}</span>
                <span className="text-aurora-300">{item.metric ?? 'raw'}</span>
              </div>
              <div className="text-[10px] text-text-secondary">{formatDate(item.date)}</div>
              <div className="text-[9px] text-text-muted">{item.subtitle ?? 'Sentinel-1'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
