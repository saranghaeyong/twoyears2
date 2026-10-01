/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useStoryEngine } from './hooks/useStoryEngine';
import { ChapterTitle } from './components/ChapterTitle';
import { DialogueOverlay } from './components/DialogueOverlay';
import { OpeningOverlay } from './components/OpeningOverlay';
import { PhoneModal } from './components/PhoneModal';
import { RainChoiceOverlay } from './components/RainChoiceOverlay';
import { MemoryArchiveModal } from './components/MemoryArchiveModal';
import { ControlsHUD } from './components/ControlsHUD';
import { DevMenu } from './components/DevMenu';
import { FinalScreen } from './components/FinalScreen';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    progress,
    currentChapter,
    activeDialogue,
    memories,
    savedInitialProgress,
    jumpTo,
    restartStory,
    // Phone
    phoneMode,
    isPhoneOpen,
    closePhone,
    // Rain
    isRainChoiceOpen,
    rainChoice,
    selectRainChoice,
    // Memories
    isMemoryArchiveOpen,
    openMemoryArchive,
    closeMemoryArchive,
    // Dev Menu
    isDevMenuOpen,
    toggleDevMenu,
    closeDevMenu,
    // Sound & Motion
    isMuted,
    toggleSound,
    reducedMotion,
    toggleReducedMotion,
  } = useStoryEngine(containerRef);

  const discoveredCount = memories.filter((m) => m.discovered).length;

  // Chapter 06 Memory Reverie subtle ghost flashback flash
  const isMemoryReverie = progress >= 0.78 && progress <= 0.88;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-slate-100 select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing" />

      {/* Subtle Cinematic Vignette */}
      <div className="cinematic-vignette absolute inset-0 z-10" />

      {/* Subtle Cinematic Film Grain Overlay */}
      <div className="cinematic-grain absolute inset-0 z-10" />

      {/* Memory Reverie Flashes (Chapter 06) */}
      {isMemoryReverie && (
        <div className="absolute inset-0 z-15 pointer-events-none mix-blend-screen opacity-20 bg-gradient-to-t from-indigo-900/30 via-transparent to-amber-900/20 transition-opacity duration-1000" />
      )}

      {/* Top Left Chapter Title Indicator */}
      <ChapterTitle currentChapter={currentChapter} progress={progress} />

      {/* Top Right Controls HUD */}
      <ControlsHUD
        isMuted={isMuted}
        onToggleSound={toggleSound}
        onOpenMemories={openMemoryArchive}
        discoveredCount={discoveredCount}
        totalMemories={memories.length}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={toggleReducedMotion}
        onToggleDevMenu={toggleDevMenu}
      />

      {/* Dialogue / Narrative Subtitles */}
      <DialogueOverlay dialogue={activeDialogue} />

      {/* Opening Prologue Overlay */}
      <OpeningOverlay
        progress={progress}
        savedProgress={savedInitialProgress}
        onContinueSaved={() => jumpTo(savedInitialProgress)}
        onBeginScroll={() => jumpTo(0.08)}
      />

      {/* Rain Interactive Choice (Chapter 02) */}
      <RainChoiceOverlay
        isOpen={isRainChoiceOpen}
        selectedChoice={rainChoice}
        onSelectChoice={selectRainChoice}
      />

      {/* Interactive Phone Modal (Crush chat & Wedding story) */}
      <PhoneModal
        mode={phoneMode || 'crush_chat'}
        isOpen={isPhoneOpen}
        onClose={closePhone}
      />

      {/* Memory Archive Collection Modal */}
      <MemoryArchiveModal
        isOpen={isMemoryArchiveOpen}
        onClose={closeMemoryArchive}
        memories={memories}
        onJumpToMemory={jumpTo}
      />

      {/* Developer Chapter Selector */}
      <DevMenu
        isOpen={isDevMenuOpen}
        onClose={closeDevMenu}
        onJumpToChapter={jumpTo}
        currentProgress={progress}
      />

      {/* Final Ending Screen (Chapter 07) */}
      <FinalScreen
        progress={progress}
        onRestart={restartStory}
        onReplayMemory={() => jumpTo(0.78)}
      />

      {/* Hairline cinematic progress bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-[2px] bg-white/5 z-30 pointer-events-none">
        <div
          className="h-full bg-amber-400/50 transition-all duration-150 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>
    </div>
  );
}
