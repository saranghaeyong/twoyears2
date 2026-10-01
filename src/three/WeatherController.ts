import * as THREE from 'three';
import { QualityTier } from '../utils/devicePerformance';
import { lerp } from '../utils/interpolation';

export class WeatherController {
  private scene: THREE.Scene;
  private rainParticles: THREE.Points | null = null;
  private dustMotes: THREE.Points | null = null;
  private rainCount: number = 600;
  private currentRainIntensity: number = 0;
  private targetRainIntensity: number = 0;

  // Lighting references
  public sunLight: THREE.DirectionalLight;
  public ambientLight: THREE.AmbientLight;
  public hemisphereLight: THREE.HemisphereLight;
  public fog: THREE.FogExp2;

  constructor(scene: THREE.Scene, quality: QualityTier) {
    this.scene = scene;
    this.rainCount = quality === 'LOW' ? 250 : quality === 'MEDIUM' ? 600 : 1200;

    // Fog
    this.fog = new THREE.FogExp2(0x1a202c, 0.015);
    this.scene.fog = this.fog;

    // Ambient
    this.ambientLight = new THREE.AmbientLight(0xfff1e0, 0.7);
    this.scene.add(this.ambientLight);

    // Hemisphere
    this.hemisphereLight = new THREE.HemisphereLight(0xdce7f5, 0x3d352e, 0.6);
    this.scene.add(this.hemisphereLight);

    // Sun / Key light
    this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.4);
    this.sunLight.position.set(20, 35, 15);
    if (quality !== 'LOW') {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = quality === 'HIGH' ? 1024 : 512;
      this.sunLight.shadow.mapSize.height = quality === 'HIGH' ? 1024 : 512;
      this.sunLight.shadow.camera.near = 1;
      this.sunLight.shadow.camera.far = 100;
      this.sunLight.shadow.camera.left = -25;
      this.sunLight.shadow.camera.right = 25;
      this.sunLight.shadow.camera.top = 25;
      this.sunLight.shadow.camera.bottom = -25;
      this.sunLight.shadow.bias = -0.001;
    }
    this.scene.add(this.sunLight);

    this.initDustMotes();
    this.initRainParticles();
  }

  private initDustMotes() {
    const count = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 3.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xffeebb,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    this.dustMotes = new THREE.Points(geometry, material);
    this.scene.add(this.dustMotes);
  }

  private initRainParticles() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.rainCount * 3);
    const velocities = new Float32Array(this.rainCount);

    for (let i = 0; i < this.rainCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      velocities[i] = 12 + Math.random() * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    (geometry as unknown as { velocities: Float32Array }).velocities = velocities;

    const material = new THREE.PointsMaterial({
      color: 0xa8c0d8,
      size: 0.08,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });

    this.rainParticles = new THREE.Points(geometry, material);
    this.scene.add(this.rainParticles);
  }

  public setWeather(type: string, intensity: number) {
    this.targetRainIntensity = type === 'rain' ? intensity : 0;
  }

  public update(delta: number, progress: number, cameraPosition: THREE.Vector3) {
    // Smooth rain intensity transition
    this.currentRainIntensity = lerp(this.currentRainIntensity, this.targetRainIntensity, delta * 3);

    // Update Rain
    if (this.rainParticles) {
      const material = this.rainParticles.material as THREE.PointsMaterial;
      material.opacity = this.currentRainIntensity * 0.75;
      this.rainParticles.visible = material.opacity > 0.01;

      if (this.rainParticles.visible) {
        // Follow camera
        this.rainParticles.position.x = cameraPosition.x;
        this.rainParticles.position.z = cameraPosition.z;

        const positions = this.rainParticles.geometry.attributes.position.array as Float32Array;
        const velocities = (this.rainParticles.geometry as unknown as { velocities: Float32Array }).velocities;

        for (let i = 0; i < this.rainCount; i++) {
          positions[i * 3 + 1] -= velocities[i] * delta;
          // Slant
          positions[i * 3 + 0] -= 1.8 * delta;

          if (positions[i * 3 + 1] < -1) {
            positions[i * 3 + 1] = 22 + Math.random() * 3;
            positions[i * 3 + 0] = (Math.random() - 0.5) * 40;
          }
        }
        this.rainParticles.geometry.attributes.position.needsUpdate = true;
      }
    }

    // Update Dust Motes (subtle drift)
    if (this.dustMotes) {
      const pos = this.dustMotes.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.001;
      }
      this.dustMotes.geometry.attributes.position.needsUpdate = true;
      // Dust visible mostly in morning pg room
      (this.dustMotes.material as THREE.PointsMaterial).opacity = Math.max(0, 0.45 * (1 - progress * 4));
    }

    // Dynamic Lighting & Atmosphere based on chapter progress:
    this.applyAtmospherePreset(progress);
  }

  private applyAtmospherePreset(p: number) {
    // 0.0 - 0.18: Morning warm sunlight
    // 0.18 - 0.32: Autumn golden afternoon
    // 0.32 - 0.36: Rainy overcast
    // 0.36 - 0.52: Seasons montage
    // 0.52 - 0.66: Dusk golden farewell
    // 0.66 - 0.78: Night apartment
    // 0.78 - 0.90: Rainy memory reverie
    // 0.90 - 1.00: Bright morning dawn

    if (p < 0.18) {
      // Morning
      this.fog.color.setHex(0x181c24);
      this.fog.density = 0.018;
      this.ambientLight.color.setHex(0xffecd6);
      this.ambientLight.intensity = 0.8;
      this.sunLight.color.setHex(0xffeaaf);
      this.sunLight.intensity = 1.5;
      this.sunLight.position.set(12, 18, 10);
    } else if (p < 0.32) {
      // Golden afternoon
      this.fog.color.setHex(0x28231d);
      this.fog.density = 0.015;
      this.ambientLight.color.setHex(0xffe5cc);
      this.ambientLight.intensity = 0.75;
      this.sunLight.color.setHex(0xf79d65);
      this.sunLight.intensity = 1.3;
      this.sunLight.position.set(-15, 12, -45);
    } else if (p < 0.36) {
      // Rain
      this.fog.color.setHex(0x1a212b);
      this.fog.density = 0.028;
      this.ambientLight.color.setHex(0x94a3b8);
      this.ambientLight.intensity = 0.5;
      this.sunLight.color.setHex(0x64748b);
      this.sunLight.intensity = 0.4;
    } else if (p < 0.52) {
      // Seasons quad
      const seasonCycle = Math.sin(p * 25);
      if (seasonCycle > 0.3) {
        // bright festival / summer
        this.fog.color.setHex(0x2d2420);
        this.sunLight.color.setHex(0xffb07c);
      } else {
        // winter / overcast
        this.fog.color.setHex(0x1c232f);
        this.sunLight.color.setHex(0x93c5fd);
      }
      this.fog.density = 0.016;
      this.ambientLight.intensity = 0.7;
    } else if (p < 0.66) {
      // Last day dusk
      this.fog.color.setHex(0x241d24);
      this.fog.density = 0.018;
      this.ambientLight.color.setHex(0xdfa08b);
      this.ambientLight.intensity = 0.65;
      this.sunLight.color.setHex(0xf472b6);
      this.sunLight.intensity = 0.9;
      this.sunLight.position.set(20, 8, -150);
    } else if (p < 0.78) {
      // Night apartment
      this.fog.color.setHex(0x060911);
      this.fog.density = 0.035;
      this.ambientLight.color.setHex(0x1e293b);
      this.ambientLight.intensity = 0.3;
      this.sunLight.color.setHex(0x38bdf8);
      this.sunLight.intensity = 0.25;
      this.sunLight.position.set(15, 15, -10);
    } else if (p < 0.90) {
      // Reverie memory
      this.fog.color.setHex(0x141822);
      this.fog.density = 0.024;
      this.ambientLight.color.setHex(0x818cf8);
      this.ambientLight.intensity = 0.45;
      this.sunLight.color.setHex(0xa5b4fc);
      this.sunLight.intensity = 0.5;
    } else {
      // Bright moving on dawn
      this.fog.color.setHex(0x1e2633);
      this.fog.density = 0.012;
      this.ambientLight.color.setHex(0xfef3c7);
      this.ambientLight.intensity = 0.9;
      this.sunLight.color.setHex(0xfde047);
      this.sunLight.intensity = 1.6;
      this.sunLight.position.set(38, 25, -5);
    }
  }
}
