import React from 'react';
import { Volume2, VolumeX, Sparkles, Activity, Layers, RotateCcw } from 'lucide-react';

interface ControlsHUDProps {
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenMemories: () => void;
  discoveredCount: number;
  totalMemories: number;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onToggleDevMenu: () => void;
}

export const ControlsHUD: React.FC<ControlsHUDProps> = ({
  isMuted,
  onToggleSound,
  onOpenMemories,
  discoveredCount,
  totalMemories,
  reducedMotion,
  onToggleReducedMotion,
  onToggleDevMenu,
}) => {
  return (
    <div className="fixed top-6 right-6 md:top-8 md:right-10 z-40 flex items-center gap-2.5">
      {/* Sound Toggle */}
      <button
        onClick={onToggleSound}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all duration-200"
        title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
      >
        {isMuted ? <VolumeX size={14} className="text-slate-400" /> : <Volume2 size={14} className="text-amber-300" />}
        <span className="hidden sm:inline text-[11px] font-mono tracking-wider">
          {isMuted ? 'SOUND OFF' : 'SOUND ON'}
        </span>
      </button>

      {/* Memory Archive button */}
      <button
        onClick={onOpenMemories}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all duration-200"
        title="Open Memory Archive"
      >
        <Sparkles size={13} className="text-amber-300/80" />
        <span className="text-[11px] font-mono tracking-wider">
          MEMORIES <span className="text-slate-400">({discoveredCount}/{totalMemories})</span>
        </span>
      </button>

      {/* Reduced Motion Toggle */}
      <button
        onClick={onToggleReducedMotion}
        className={`p-2 rounded-full backdrop-blur-md border transition-colors ${
          reducedMotion
            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
            : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
        }`}
        title={reducedMotion ? 'Reduced Motion: ON' : 'Reduced Motion: OFF'}
      >
        <Activity size={14} />
      </button>

      {/* Developer / Chapter Jump button */}
      <button
        onClick={onToggleDevMenu}
        className="p-2 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10 text-slate-400 hover:text-white transition-colors"
        title="Jump to Chapter (Chapters Navigator)"
      >
        <Layers size={14} />
      </button>
    </div>
  );
};
