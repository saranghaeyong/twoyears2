export type QualityTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface PerformanceProfile {
  tier: QualityTier;
  pixelRatio: number;
  maxParticles: number;
  enableShadows: boolean;
  fogDensityMultiplier: number;
}

export function detectDevicePerformance(): PerformanceProfile {
  const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 768;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;

  if (isMobile || memory <= 2 || cores <= 2) {
    return {
      tier: 'LOW',
      pixelRatio: Math.min(window.devicePixelRatio || 1, 1.25),
      maxParticles: 400,
      enableShadows: false,
      fogDensityMultiplier: 1.0,
    };
  }

  if (memory <= 4 || cores <= 4) {
    return {
      tier: 'MEDIUM',
      pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
      maxParticles: 900,
      enableShadows: true,
      fogDensityMultiplier: 1.0,
    };
  }

  return {
    tier: 'HIGH',
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2.0),
    maxParticles: 1800,
    enableShadows: true,
    fogDensityMultiplier: 1.0,
  };
}
