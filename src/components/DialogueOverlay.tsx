import React from 'react';
import { DialogueEvent } from '../types/story';

interface DialogueOverlayProps {
  dialogue: DialogueEvent | null;
}

export const DialogueOverlay: React.FC<DialogueOverlayProps> = ({ dialogue }) => {
  if (!dialogue) return null;

  return (
    <div className="fixed bottom-14 md:bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-xl px-6 text-center transition-all duration-500 ease-out">
      <div className="inline-block px-8 py-5 rounded-2xl bg-black/55 backdrop-blur-md border border-white/10 shadow-2xl">
        {dialogue.speaker && dialogue.speaker !== 'NARRATOR' && (
          <div className="text-[11px] font-mono tracking-[0.25em] text-amber-300/80 uppercase mb-1.5">
            {dialogue.speaker}
          </div>
        )}

        <div className="text-base md:text-lg text-slate-100 font-sans-story tracking-wide font-normal leading-relaxed text-wrap">
          {dialogue.text}
        </div>

        {dialogue.subtext && (
          <div className="text-xs text-slate-400 mt-2 font-light italic tracking-normal">
            {dialogue.subtext}
          </div>
        )}
      </div>
    </div>
  );
};
