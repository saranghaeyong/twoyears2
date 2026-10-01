import { useState, useEffect, useRef, useCallback } from 'react';
import { World } from '../three/World';
import { CHAPTERS } from '../story/chapters';
import { INITIAL_MEMORIES } from '../story/memories';
import { DIALOGUE_EVENTS } from '../story/dialogue';
import { StoryChapter, MemoryMoment, DialogueEvent, RainChoice } from '../types/story';
import { audioManager } from '../audio/AudioManager';
import { clamp } from '../utils/interpolation';

export function useStoryEngine(containerRef: React.RefObject<HTMLDivElement | null>) {
  const worldRef = useRef<World | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentChapter, setCurrentChapter] = useState<StoryChapter>(CHAPTERS[0]);
  const [activeDialogue, setActiveDialogue] = useState<DialogueEvent | null>(null);
  const [memories, setMemories] = useState<MemoryMoment[]>(() => {
    try {
      const saved = localStorage.getItem('two_years_memories');
      if (saved) {
        const savedIds = new Set(JSON.parse(saved) as string[]);
        return INITIAL_MEMORIES.map((m) => ({
          ...m,
          discovered: savedIds.has(m.id) || m.discovered,
        }));
      }
    } catch {
      // fallback
    }
    return INITIAL_MEMORIES;
  });

  const [savedInitialProgress, setSavedInitialProgress] = useState<number>(() => {
    try {
      const p = localStorage.getItem('two_years_story_progress');
      if (p) return parseFloat(p);
    } catch {
      // fallback
    }
    return 0;
  });

  // Interactive modal states
  const [phoneMode, setPhoneMode] = useState<'crush_chat' | 'wedding_story' | null>(null);
  const [isPhoneOpen, setIsPhoneOpen] = useState<boolean>(false);
  const [isRainChoiceOpen, setIsRainChoiceOpen] = useState<boolean>(false);
  const [rainChoice, setRainChoice] = useState<RainChoice | null>(null);
  const [isMemoryArchiveOpen, setIsMemoryArchiveOpen] = useState<boolean>(false);
  const [isDevMenuOpen, setIsDevMenuOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.getIsMuted());
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    return localStorage.getItem('two_years_reduced_motion') === 'true';
  });

  // Track if interaction triggered in this session to prevent infinite re-opening
  const triggeredEventsRef = useRef<Set<string>>(new Set());

  // Initialize Three.js World
  useEffect(() => {
    if (!containerRef.current) return;

    const world = new World(
      containerRef.current,
      {
        onProgressUpdate: (p) => {
          setProgress(p);

          // Find chapter
          const ch = CHAPTERS.find((c) => p >= c.startProgress && p <= c.endProgress) || CHAPTERS[CHAPTERS.length - 1];
          setCurrentChapter(ch);

          // Audio chapter sync
          audioManager.setTheme(ch.audioTheme);
          audioManager.setWeatherIntensity(ch.weather === 'rain' ? ch.weatherIntensity : 0);

          // Find dialogue
          const diag = DIALOGUE_EVENTS.find((d) => p >= d.progressStart && p <= d.progressEnd) || null;
          setActiveDialogue(diag);

          // Discover memories
          setMemories((prev) => {
            let changed = false;
            const updated = prev.map((m) => {
              if (!m.discovered && p >= m.progress) {
                changed = true;
                return { ...m, discovered: true };
              }
              return m;
            });
            if (changed) {
              const discoveredIds = updated.filter((m) => m.discovered).map((m) => m.id);
              localStorage.setItem('two_years_memories', JSON.stringify(discoveredIds));
            }
            return changed ? updated : prev;
          });

          // Check story interactive events
          // 1. Phone crush typing around 0.298
          if (p >= 0.295 && p <= 0.315 && !triggeredEventsRef.current.has('crush_chat')) {
            triggeredEventsRef.current.add('crush_chat');
            setPhoneMode('crush_chat');
            setIsPhoneOpen(true);
          }

          // 2. Rain choice around 0.33
          if (p >= 0.33 && p <= 0.355 && !triggeredEventsRef.current.has('rain_choice')) {
            triggeredEventsRef.current.add('rain_choice');
            setIsRainChoiceOpen(true);
          }

          // 3. Years later wedding story around 0.73
          if (p >= 0.725 && p <= 0.765 && !triggeredEventsRef.current.has('wedding_story')) {
            triggeredEventsRef.current.add('wedding_story');
            setPhoneMode('wedding_story');
            setIsPhoneOpen(true);
          }

          // Save progress throttle
          if (Math.random() < 0.05) {
            localStorage.setItem('two_years_story_progress', p.toFixed(4));
          }
        },
        onClickInteractiveObject: (name) => {
          if (name === 'phone') {
            setPhoneMode(progress > 0.5 ? 'wedding_story' : 'crush_chat');
            setIsPhoneOpen(true);
          } else if (name === 'tea') {
            audioManager.playTeaClink();
          }
        },
      },
      0
    );

    worldRef.current = world;
    world.setReducedMotion(reducedMotion);

    return () => {
      world.dispose();
      worldRef.current = null;
    };
  }, []);

  // Scroll, wheel, touch & keyboard navigation
  useEffect(() => {
    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      audioManager.resume();
      if (!worldRef.current) return;

      const delta = e.deltaY * 0.00035;
      worldRef.current.setTargetProgress(worldRef.current.targetProgress + delta);
    };

    const handleTouchStart = (e: TouchEvent) => {
      audioManager.resume();
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0 || !worldRef.current) return;
      const currentY = e.touches[0].clientY;
      const diff = touchStartY - currentY;
      touchStartY = currentY;

      const delta = diff * 0.001;
      worldRef.current.setTargetProgress(worldRef.current.targetProgress + delta);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      audioManager.resume();
      if (!worldRef.current) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 's' || e.key === 'S' || e.key === ' ') {
        e.preventDefault();
        worldRef.current.setTargetProgress(worldRef.current.targetProgress + 0.025);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        worldRef.current.setTargetProgress(worldRef.current.targetProgress - 0.025);
      } else if (e.key === 'Escape') {
        setIsPhoneOpen(false);
        setIsMemoryArchiveOpen(false);
        setIsDevMenuOpen(false);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const jumpTo = useCallback((p: number) => {
    if (worldRef.current) {
      worldRef.current.jumpToProgress(p);
    }
  }, []);

  const toggleSound = useCallback(() => {
    audioManager.resume();
    const active = audioManager.toggleMute();
    setIsMuted(!active);
  }, []);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => {
      const next = !prev;
      localStorage.setItem('two_years_reduced_motion', String(next));
      if (worldRef.current) {
        worldRef.current.setReducedMotion(next);
      }
      return next;
    });
  }, []);

  const restartStory = useCallback(() => {
    triggeredEventsRef.current.clear();
    jumpTo(0);
    localStorage.removeItem('two_years_story_progress');
  }, [jumpTo]);

  return {
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
    openPhone: (mode: 'crush_chat' | 'wedding_story') => {
      setPhoneMode(mode);
      setIsPhoneOpen(true);
    },
    closePhone: () => setIsPhoneOpen(false),
    // Rain
    isRainChoiceOpen,
    rainChoice,
    selectRainChoice: (choice: RainChoice) => {
      setRainChoice(choice);
      setIsRainChoiceOpen(false);
    },
    // Memories
    isMemoryArchiveOpen,
    openMemoryArchive: () => setIsMemoryArchiveOpen(true),
    closeMemoryArchive: () => setIsMemoryArchiveOpen(false),
    // Dev Menu
    isDevMenuOpen,
    toggleDevMenu: () => setIsDevMenuOpen((prev) => !prev),
    closeDevMenu: () => setIsDevMenuOpen(false),
    // Audio & Motion
    isMuted,
    toggleSound,
    reducedMotion,
    toggleReducedMotion,
  };
}
