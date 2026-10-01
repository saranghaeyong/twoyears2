import React from 'react';
import { CHAPTERS } from '../story/chapters';
import { X, FastForward } from 'lucide-react';

interface DevMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToChapter: (progress: number) => void;
  currentProgress: number;
}

export const DevMenu: React.FC<DevMenuProps> = ({
  isOpen,
  onClose,
  onJumpToChapter,
  currentProgress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-6 md:right-10 z-50 w-72 bg-slate-950/95 border border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-slate-400 uppercase">
          <FastForward size={14} className="text-amber-400" />
          <span>Timeline Jump</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
        {CHAPTERS.map((ch) => {
          const isActive =
            currentProgress >= ch.startProgress && currentProgress < ch.endProgress;
          return (
            <button
              key={ch.id}
              onClick={() => {
                onJumpToChapter(ch.startProgress);
                onClose();
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                isActive
                  ? 'bg-amber-500/20 text-amber-200 font-medium border border-amber-500/30'
                  : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <div>
                <span className="font-mono text-[10px] text-slate-500 mr-2">
                  {ch.numberStr}
                </span>
                <span>{ch.title}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">
                {Math.round(ch.startProgress * 100)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
