import React from 'react';
import { StoryChapter } from '../types/story';

interface ChapterTitleProps {
  currentChapter: StoryChapter;
  progress: number;
}

export const ChapterTitle: React.FC<ChapterTitleProps> = ({ currentChapter, progress }) => {
  // Opening screen has custom title overlay, only show standard indicator after progress > 0.05
  if (progress < 0.05 || progress > 0.94) return null;

  return (
    <div className="fixed top-8 left-8 md:top-10 md:left-12 pointer-events-none z-20 flex flex-col transition-opacity duration-700 ease-out">
      <div className="flex items-center gap-3 text-xs tracking-[0.24em] text-slate-400/80 uppercase font-mono">
        <span>{currentChapter.numberStr}</span>
        <span className="text-slate-600">/</span>
        <span>07</span>
        <span className="text-slate-600">·</span>
        <span className="text-amber-200/70">{currentChapter.timeLabel}</span>
      </div>

      <h1 className="font-cinzel text-xl md:text-2xl font-semibold tracking-wider text-slate-100 mt-1 uppercase text-shadow-sm">
        {currentChapter.title}
      </h1>

      <p className="text-xs md:text-sm text-slate-400 max-w-sm mt-1 font-light tracking-wide leading-relaxed">
        {currentChapter.subtitle}
      </p>
    </div>
  );
};
