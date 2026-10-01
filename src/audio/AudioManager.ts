/**
 * Procedural Web Audio Engine for "TWO YEARS"
 * Provides subtle emotional ambient music, piano motifs, rain noise, phone haptics, and Foley
 * without external audio file dependencies.
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;
  private masterGain: GainNode | null = null;
  
  // Ambient noise generators
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private ambientDroneGain: GainNode | null = null;
  
  // Music scheduling
  private musicIntervalId: number | null = null;
  private currentTheme: string = 'ambient_intro';
  private chordIndex: number = 0;

  constructor() {
    const saved = localStorage.getItem('two_years_sound_enabled');
    this.isMuted = saved !== null ? saved === 'false' : false;
  }

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupRainGenerator();
      this.setupAmbientDrone();
      this.startMusicalChords();
      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext initialization failed or blocked:', e);
    }
  }

  public resume() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('two_years_sound_enabled', String(!this.isMuted));
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.35;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
    return !this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  private setupRainGenerator() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);
    whiteNoise.start(0);
    this.rainNode = whiteNoise;
  }

  private setupAmbientDrone() {
    if (!this.ctx || !this.masterGain) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
    osc2.frequency.setValueAtTime(164.81, this.ctx.currentTime); // E3

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.ambientDroneGain = this.ctx.createGain();
    this.ambientDroneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.ambientDroneGain);
    this.ambientDroneGain.connect(this.masterGain);

    osc1.start();
    osc2.start();
  }

  public setWeatherIntensity(rainAmount: number) {
    if (!this.rainGain || !this.ctx) return;
    const target = Math.max(0, Math.min(1, rainAmount)) * 0.28;
    this.rainGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.4);
  }

  public playTone(freq: number, duration: number = 2.5, type: OscillatorType = 'sine', gainVal: number = 0.08) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    } catch {
      // Ignore audio errors gracefully
    }
  }

  public playPhoneVibration() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const ctx = this.ctx;
    const masterGain = this.masterGain;
    try {
      const now = ctx.currentTime;
      [0, 0.22].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, now + offset);
        osc.frequency.exponentialRampToValueAtTime(80, now + offset + 0.16);

        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + offset);
        osc.stop(now + offset + 0.18);
      });
    } catch {
      // ignore
    }
  }

  public playTeaClink() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600, now);
      osc.frequency.exponentialRampToValueAtTime(1900, now + 0.15);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // ignore
    }
  }

  public playStepSound() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80 + Math.random() * 20, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // ignore
    }
  }

  public setTheme(theme: string) {
    this.currentTheme = theme;
  }

  private startMusicalChords() {
    if (this.musicIntervalId) return;

    // Poetic, gentle piano chord progressions
    const progressions: Record<string, number[][]> = {
      ambient_intro: [[220, 261.63, 329.63], [196, 246.94, 293.66], [174.61, 220, 261.63]], // Am, G, F
      morning_birds: [[261.63, 329.63, 392], [220, 261.63, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66]], // C, Am, F, G
      campus_routine: [[174.61, 220, 261.63, 329.63], [196, 246.94, 293.66], [220, 261.63, 329.63]], // Fmaj7, G, Am
      rain_theme: [[146.83, 220, 261.63], [174.61, 220, 261.63], [220, 261.63, 329.63], [130.81, 196, 246.94]], // Dm, F, Am, C
      seasons_montage: [[220, 261.63, 349.23], [196, 246.94, 293.66], [164.81, 196, 246.94], [174.61, 220, 261.63]],
      farewell_piano: [[220, 261.63, 329.63], [174.61, 220, 261.63], [130.81, 196, 261.63], [196, 246.94, 293.66]],
      night_solitude: [[110, 164.81, 220], [130.81, 164.81, 196], [87.31, 130.81, 174.61]],
      memory_reverie: [[220, 277.18, 329.63], [174.61, 220, 261.63], [196, 246.94, 293.66], [146.83, 220, 261.63]],
      dawn_resolution: [[261.63, 329.63, 392, 493.88], [220, 261.63, 329.63], [174.61, 220, 261.63, 329.63], [261.63, 329.63, 392]],
    };

    const playNextChord = () => {
      if (!this.ctx || this.isMuted) return;
      const chords = progressions[this.currentTheme] || progressions.ambient_intro;
      const chord = chords[this.chordIndex % chords.length];
      this.chordIndex++;

      // Arpeggiate chord notes with natural micro-delays
      chord.forEach((note, i) => {
        setTimeout(() => {
          this.playTone(note, 3.4, 'sine', 0.05 - i * 0.008);
        }, i * 220);
      });
    };

    // Schedule every 4.8 seconds for an airy, peaceful pace
    this.musicIntervalId = window.setInterval(playNextChord, 4800);
  }

  public dispose() {
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
    }
    if (this.ctx) {
      this.ctx.close();
    }
  }
}

export const audioManager = new AudioManager();
