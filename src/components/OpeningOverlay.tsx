import React from 'react';
import { ChevronDown, Play } from 'lucide-react';

interface OpeningOverlayProps {
  progress: number;
  savedProgress: number;
  onContinueSaved: () => void;
  onBeginScroll: () => void;
}

export const OpeningOverlay: React.FC<OpeningOverlayProps> = ({
  progress,
  savedProgress,
  onContinueSaved,
  onBeginScroll,
}) => {
  // Fade out as user scrolls past 0.05
  if (progress > 0.06) return null;

  const opacity = Math.max(0, 1 - progress / 0.05);

  return (
    <div
      className="fixed inset-0 z-30 flex flex-col items-center justify-between p-8 md:p-14 pointer-events-auto bg-black transition-opacity duration-700 ease-out"
      style={{ opacity }}
    >
      <div className="w-full flex justify-between items-center text-xs font-mono tracking-[0.3em] text-slate-500 uppercase">
        <span>A Cinematic Experience</span>
        <span>WebGL · 3D</span>
      </div>

      {/* Main Title Group */}
      <div className="flex flex-col items-center text-center max-w-xl my-auto">
        <h1 className="font-cinzel text-5xl md:text-7xl font-semibold tracking-[0.18em] text-slate-100 uppercase">
          TWO YEARS
        </h1>

        <div className="text-xs md:text-sm font-mono tracking-[0.28em] text-amber-200/80 uppercase mt-4">
          An Interactive Story
        </div>

        <div className="w-12 h-px bg-white/20 my-6"></div>

        <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed tracking-wide italic">
          "Some people stay in our lives.<br />
          Some people stay in our memories."
        </p>

        {savedProgress > 0.06 && savedProgress < 0.95 && (
          <button
            onClick={onContinueSaved}
            className="mt-8 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 border border-white/20 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Play size={13} className="text-amber-300" />
            <span>CONTINUE FROM {Math.round(savedProgress * 100)}%</span>
          </button>
        )}
      </div>

      {/* Scroll to begin indicator */}
      <div
        onClick={onBeginScroll}
        className="flex flex-col items-center gap-2 text-slate-400 cursor-pointer animate-subtle-pulse hover:text-white transition-colors"
      >
        <span className="text-[11px] font-mono tracking-[0.3em] uppercase">
          Scroll To Begin
        </span>
        <ChevronDown size={18} />
      </div>
    </div>
  );
};
