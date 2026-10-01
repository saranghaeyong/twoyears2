import React from 'react';
import { RainChoice } from '../types/story';
import { audioManager } from '../audio/AudioManager';

interface RainChoiceOverlayProps {
  isOpen: boolean;
  selectedChoice: RainChoice | null;
  onSelectChoice: (choice: RainChoice) => void;
}

export const RainChoiceOverlay: React.FC<RainChoiceOverlayProps> = ({
  isOpen,
  selectedChoice,
  onSelectChoice,
}) => {
  if (!isOpen) return null;

  const choices: { id: RainChoice; label: string; desc: string }[] = [
    { id: 'walk', label: 'WALK', desc: 'Slow, steady steps through the grey downpour' },
    { id: 'run', label: 'RUN', desc: 'Dashing together toward the library awning' },
    { id: 'wait', label: 'WAIT', desc: 'Standing quietly side by side under the shed' },
  ];

  return (
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
      <div className="text-[11px] font-mono tracking-[0.25em] text-slate-300/80 uppercase mb-1">
        Monsoon shower has started
      </div>

      <div className="flex items-center gap-3">
        {choices.map((c) => {
          const isSelected = selectedChoice === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                audioManager.playTone(440, 0.2, 'triangle', 0.04);
                onSelectChoice(c.id);
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-medium tracking-wider transition-all duration-300 border ${
                isSelected
                  ? 'bg-sky-500/30 border-sky-400 text-sky-100 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'bg-black/60 backdrop-blur-md border-white/20 text-slate-300 hover:bg-black/80 hover:border-white/40'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
