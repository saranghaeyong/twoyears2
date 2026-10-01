export interface CameraKeyframe {
  progress: number;
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
}

export interface DialogueEvent {
  id: string;
  progressStart: number;
  progressEnd: number;
  speaker: 'BOY' | 'GIRL' | 'NARRATOR' | '';
  text: string;
  subtext?: string;
}

export interface MemoryMoment {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  location: string;
  progress: number;
  quote?: string;
  image?: string;
  discovered: boolean;
}

export interface StoryChapter {
  id: string;
  numberStr: string;
  title: string;
  subtitle: string;
  startProgress: number;
  endProgress: number;
  environment: 'pg_room' | 'campus_walk' | 'tea_shop' | 'two_years_quad' | 'last_day' | 'years_later_room' | 'empty_college' | 'moving_on_road';
  timeLabel: string;
  weather: 'clear' | 'sunny' | 'rain' | 'overcast' | 'golden_hour' | 'night';
  weatherIntensity: number;
  audioTheme: 'ambient_intro' | 'morning_birds' | 'campus_routine' | 'rain_theme' | 'seasons_montage' | 'farewell_piano' | 'night_solitude' | 'memory_reverie' | 'dawn_resolution';
}

export type RainChoice = 'walk' | 'run' | 'wait';
