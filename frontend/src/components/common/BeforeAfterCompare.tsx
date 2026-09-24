import React, { useState } from 'react';
import { ArrowRight, Check, Expand, Flame, Maximize2, RotateCcw, Sliders, Sparkles } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { TileThumbnail } from './TileThumbnail';

interface BeforeAfterCompareProps {
  beforeUrl?: string | null;
  afterUrl?: string | null;
  differenceUrl?: string | null;
  differenceHeatmapUrl?: string | null;
  backendMaskUrl?: string | null;
  beforeDate?: string;
  afterDate?: string;
  className?: string;
  defaultMode?: 'side-by-side' | 'slider';
  fullBleed?: boolean;
  onFullscreen?: () => void;
  showDifferenceMap?: boolean;
}

export const BeforeAfterCompare: React.FC<BeforeAfterCompareProps> = ({
  beforeUrl,
  afterUrl,
  differenceUrl,
  differenceHeatmapUrl,
  backendMaskUrl,
  beforeDate,
  afterDate,
  className,
  defaultMode = 'slider',
  fullBleed = false,
  onFullscreen,
  showDifferenceMap = true,
}) => {
  const [mode, setMode] = useState<'side-by-side' | 'slider'>(defaultMode);
  const [sliderPos, setSliderPos] = useState(50);
  const [visualMode, setVisualMode] = useState<'true-color' | 'difference'>('true-color');
  const [heatmapOverlay, setHeatmapOverlay] = useState(false);
  const [backendMask, setBackendMask] = useState(false);
  const differenceUrlToShow = differenceHeatmapUrl || differenceUrl;
  const showDifference = visualMode === 'difference' && differenceUrlToShow;
  const comparisonUrl = showDifference ? differenceUrlToShow : afterUrl;

  return (
    <div className={cn('space-y-3', fullBleed && 'h-full flex flex-col', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
          <span className="text-text-primary font-medium">{formatDate(beforeDate)}</span>
          <ArrowRight size={12} className="text-aurora-400" />
          <span className="text-text-primary font-medium">{formatDate(afterDate)}</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button type="button" onClick={() => setSliderPos(50)} className="compare-tool"><RotateCcw size={12} />50/50 reset</button>
          <button type="button" onClick={() => setSliderPos(50)} className="compare-tool"><Expand size={12} />Fit comparison</button>
          <button type="button" onClick={() => setVisualMode('true-color')} className={cn('compare-tool', visualMode === 'true-color' && 'compare-tool-active')}><Sparkles size={12} />True color</button>
          <button type="button" disabled={!differenceUrlToShow} onClick={() => setVisualMode('difference')} className={cn('compare-tool', visualMode === 'difference' && 'compare-tool-active')}><Flame size={12} />Difference heatmap</button>
          <button type="button" disabled={!differenceUrlToShow} onClick={() => { setHeatmapOverlay(false); setVisualMode('true-color'); }} className={cn('compare-tool', !showDifference && 'compare-tool-active')}><Check size={12} />Heatmap off</button>
          {onFullscreen && <button type="button" onClick={onFullscreen} className="compare-tool"><Maximize2 size={12} />Fullscreen comparison</button>}
          <button type="button" disabled={!backendMaskUrl} onClick={() => setBackendMask(!backendMask)} className={cn('compare-tool', backendMask && 'compare-tool-active')}><Check size={12} />Backend difference mask</button>
          <button type="button" onClick={() => setMode(mode === 'side-by-side' ? 'slider' : 'side-by-side')} className="compare-tool"><Sliders size={12} />{mode === 'side-by-side' ? 'Slider Mode' : 'Side-by-Side'}</button>
        </div>
      </div>

      {mode === 'side-by-side' ? (
        <div className="grid grid-cols-2 gap-3">
          <TileThumbnail src={beforeUrl} alt="Before Tile" aspectRatio="wide" objectFit="contain" unavailable={!beforeUrl} />
          <TileThumbnail src={comparisonUrl} alt="After Tile" aspectRatio="wide" objectFit="contain" unavailable={!comparisonUrl} />
        </div>
      ) : (
        <div className={cn('relative mx-auto h-[min(62vh,680px)] min-h-[360px] max-h-[680px] w-full max-w-6xl overflow-hidden rounded-lg border border-white/[0.1] select-none', fullBleed && 'min-h-0 flex-1')}>
          <div className="absolute inset-0">
            <TileThumbnail src={comparisonUrl} alt="After Tile" aspectRatio="auto" objectFit="contain" className="h-full w-full" zoomOnHover={false} unavailable={!comparisonUrl} />
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-space-950/80 font-mono text-[10px] text-aurora-400 border border-aurora-500/20">{showDifference ? 'DIFFERENCE' : 'AFTER'}</div>
          </div>
          <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
            <TileThumbnail src={beforeUrl} alt="Before Tile" aspectRatio="auto" objectFit="contain" className="h-full w-full" zoomOnHover={false} unavailable={!beforeUrl} />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-space-950/80 font-mono text-[10px] text-text-secondary border border-white/[0.1]">BEFORE</div>
          </div>
          {heatmapOverlay && differenceUrlToShow && <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"><TileThumbnail src={differenceUrlToShow} alt="Heatmap overlay" aspectRatio="auto" objectFit="contain" className="h-full w-full" zoomOnHover={false} /></div>}
          {backendMask && backendMaskUrl && <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-screen"><TileThumbnail src={backendMaskUrl} alt="Backend difference mask" aspectRatio="auto" objectFit="contain" className="h-full w-full" zoomOnHover={false} /></div>}
          <div className="absolute top-0 bottom-0 w-0.5 bg-aurora-400 shadow-[0_0_10px_#00D4FF] cursor-ew-resize flex items-center justify-center pointer-events-none" style={{ left: `${sliderPos}%` }}><div className="w-5 h-5 rounded-full bg-space-900 border border-aurora-400 shadow-glow-cyan flex items-center justify-center text-aurora-400"><Sliders size={10} /></div></div>
          <input type="range" min={0} max={100} value={sliderPos} onChange={(event) => setSliderPos(Number(event.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10" />
        </div>
      )}

      {showDifferenceMap && differenceHeatmapUrl && !onFullscreen && <div className="pt-2 border-t border-white/[0.06]"><div className="flex items-center justify-between text-[10px] font-mono text-rose-400 mb-1.5"><span>SPECTRAL DELTA DIFFERENCE MAP</span><span>Δ SIGNAL</span></div><TileThumbnail src={differenceHeatmapUrl} alt="Difference Map" aspectRatio="wide" unavailable={!differenceHeatmapUrl} /></div>}
    </div>
  );
};
