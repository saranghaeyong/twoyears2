import React from 'react';
import { MemoryMoment } from '../types/story';
import { X, BookOpen, Clock, MapPin } from 'lucide-react';

interface MemoryArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryMoment[];
  onJumpToMemory: (progress: number) => void;
}

export const MemoryArchiveModal: React.FC<MemoryArchiveModalProps> = ({
  isOpen,
  onClose,
  memories,
  onJumpToMemory,
}) => {
  if (!isOpen) return null;

  const discoveredCount = memories.filter((m) => m.discovered).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-lg">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-slate-950/95 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <div className="text-[11px] font-mono tracking-[0.25em] text-slate-400 uppercase">
              Archive · {discoveredCount} of {memories.length} Moments
            </div>
            <h2 className="font-cinzel text-xl md:text-2xl font-semibold text-slate-100 tracking-wide mt-1">
              Recorded Memories
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* List of 15 memories */}
        <div className="flex-1 overflow-y-auto py-6 pr-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${
                m.discovered
                  ? 'bg-slate-900/60 border-white/15 hover:border-amber-400/40 hover:bg-slate-900/90 cursor-pointer'
                  : 'bg-slate-950/40 border-white/5 opacity-40'
              }`}
              onClick={() => {
                if (m.discovered) {
                  onJumpToMemory(m.progress);
                  onClose();
                }
              }}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
                  <span>MEMORY {String(m.number).padStart(2, '0')}</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={10} />
                    <span>{m.location}</span>
                  </div>
                </div>

                <h3 className="text-sm font-medium text-slate-100">
                  {m.discovered ? m.title : 'Undiscovered Memory'}
                </h3>

                <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                  {m.discovered ? m.subtitle : 'Continue scrolling the story to encounter this moment.'}
                </p>
              </div>

              {m.discovered && m.quote && (
                <div className="mt-3 pt-2 border-t border-white/5 text-[11px] text-amber-200/80 italic">
                  {m.quote}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-500">
          <span>Click any discovered memory to revisit its position in time.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 text-slate-200 hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
