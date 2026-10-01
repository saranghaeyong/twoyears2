import React, { useState, useEffect } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';

interface FinalScreenProps {
  progress: number;
  onRestart: () => void;
  onReplayMemory: () => void;
}

export const FinalScreen: React.FC<FinalScreenProps> = ({
  progress,
  onRestart,
  onReplayMemory,
}) => {
  const [step, setStep] = useState<number>(0);

  const isEnding = progress >= 0.96;

  useEffect(() => {
    if (!isEnding) {
      setStep(0);
      return;
    }

    const t1 = setTimeout(() => setStep(1), 1200);
    const t2 = setTimeout(() => setStep(2), 3400);
    const t3 = setTimeout(() => setStep(3), 5600);
    const t4 = setTimeout(() => setStep(4), 7800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [isEnding]);

  if (!isEnding) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-black/90 backdrop-blur-xl text-center fade-in">
      <div className="max-w-xl flex flex-col items-center">
        {/* Title */}
        <h2 className="font-cinzel text-3xl md:text-5xl font-semibold tracking-[0.2em] text-slate-100 uppercase">
          TWO YEARS
        </h2>

        <div className="w-12 h-px bg-white/20 my-8"></div>

        {/* Narrative progression */}
        <div className="min-h-[140px] flex flex-col items-center justify-center gap-4 text-base md:text-lg text-slate-300 font-light leading-relaxed tracking-wide italic">
          {step >= 1 && (
            <p className="fade-in">
              "Some people become part of our lives."
            </p>
          )}

          {step >= 2 && (
            <p className="fade-in">
              "Some become part of our memories."
            </p>
          )}

          {step >= 3 && (
            <p className="fade-in text-amber-200/90 font-normal">
              "And sometimes, that is enough."
            </p>
          )}
        </div>

        {step >= 4 && (
          <div className="mt-8 flex flex-col items-center gap-6 fade-in">
            <div className="text-xs font-mono tracking-[0.35em] text-slate-400 uppercase">
              THE END
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={onReplayMemory}
                className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 border border-white/20 transition-all flex items-center gap-2"
              >
                <Sparkles size={14} className="text-amber-300" />
                <span>REPLAY MEMORY</span>
              </button>

              <button
                onClick={onRestart}
                className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 border border-white/10 transition-all flex items-center gap-2"
              >
                <RotateCcw size={14} />
                <span>START AGAIN</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
