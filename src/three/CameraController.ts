import * as THREE from 'three';
import { CAMERA_KEYFRAMES } from './cameraData';
import { clamp, lerp } from '../utils/interpolation';

export class CameraController {
  public camera: THREE.PerspectiveCamera;
  private currentLookAt: THREE.Vector3 = new THREE.Vector3(0, 1.4, 0);
  private targetLookAt: THREE.Vector3 = new THREE.Vector3(0, 1.4, 0);
  private mouseOffset: { x: number; y: number } = { x: 0, y: 0 };
  private targetMouseOffset: { x: number; y: number } = { x: 0, y: 0 };

  constructor(fov: number = 48, aspect: number = 16 / 9) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 300);
    this.camera.position.set(0, 1.6, 3.8);
    this.camera.lookAt(0, 1.4, 0);
  }

  public setMouse(normalizedX: number, normalizedY: number) {
    // Subtle, restrained cinematic parallax
    this.targetMouseOffset.x = normalizedX * 0.35;
    this.targetMouseOffset.y = -normalizedY * 0.2;
  }

  public update(progress: number, delta: number, reducedMotion: boolean = false) {
    const p = clamp(progress, 0, 1);

    // Find keyframe segment
    let index = 0;
    for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
      if (p >= CAMERA_KEYFRAMES[i].progress && p <= CAMERA_KEYFRAMES[i + 1].progress) {
        index = i;
        break;
      }
    }

    const k1 = CAMERA_KEYFRAMES[index];
    const k2 = CAMERA_KEYFRAMES[Math.min(index + 1, CAMERA_KEYFRAMES.length - 1)];

    const span = k2.progress - k1.progress;
    const tRaw = span > 0.0001 ? (p - k1.progress) / span : 0;
    
    // Smooth cosine or cubic easing
    const t = tRaw * tRaw * (3 - 2 * tRaw);

    const targetPos = new THREE.Vector3(
      lerp(k1.position[0], k2.position[0], t),
      lerp(k1.position[1], k2.position[1], t),
      lerp(k1.position[2], k2.position[2], t)
    );

    this.targetLookAt.set(
      lerp(k1.lookAt[0], k2.lookAt[0], t),
      lerp(k1.lookAt[1], k2.lookAt[1], t),
      lerp(k1.lookAt[2], k2.lookAt[2], t)
    );

    const targetFov = lerp(k1.fov || 48, k2.fov || 48, t);

    // Apply mouse parallax with damping
    if (!reducedMotion) {
      this.mouseOffset.x += (this.targetMouseOffset.x - this.mouseOffset.x) * (delta * 4);
      this.mouseOffset.y += (this.targetMouseOffset.y - this.mouseOffset.y) * (delta * 4);
    } else {
      this.mouseOffset.x = 0;
      this.mouseOffset.y = 0;
    }

    targetPos.x += this.mouseOffset.x;
    targetPos.y += this.mouseOffset.y;

    // Smoothly apply position & lookAt
    const lerpSpeed = Math.min(1, delta * 12);
    this.camera.position.lerp(targetPos, lerpSpeed);
    this.currentLookAt.lerp(this.targetLookAt, lerpSpeed);

    this.camera.lookAt(this.currentLookAt);

    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov = lerp(this.camera.fov, targetFov, lerpSpeed);
      this.camera.updateProjectionMatrix();
    }
  }

  public setAspect(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }
}
