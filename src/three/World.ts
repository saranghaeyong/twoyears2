import * as THREE from 'three';
import { CameraController } from './CameraController';
import { EnvironmentController } from './EnvironmentController';
import { CharacterController } from './CharacterController';
import { WeatherController } from './WeatherController';
import { detectDevicePerformance, PerformanceProfile } from '../utils/devicePerformance';
import { clamp, lerp } from '../utils/interpolation';

export interface WorldCallbacks {
  onProgressUpdate: (progress: number) => void;
  onHoverObject?: (name: string | null) => void;
  onClickInteractiveObject?: (type: string) => void;
}

export class World {
  public container: HTMLElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public cameraController: CameraController;
  public environmentController: EnvironmentController;
  public characterController: CharacterController;
  public weatherController: WeatherController;

  public perfProfile: PerformanceProfile;
  public currentProgress: number = 0;
  public targetProgress: number = 0;

  private isRunning: boolean = true;
  private lastTime: number = performance.now();
  private callbacks: WorldCallbacks;
  public reducedMotion: boolean = false;

  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mousePos: THREE.Vector2 = new THREE.Vector2(0, 0);

  constructor(container: HTMLElement, callbacks: WorldCallbacks, initialProgress: number = 0) {
    this.container = container;
    this.callbacks = callbacks;
    this.currentProgress = initialProgress;
    this.targetProgress = initialProgress;

    this.perfProfile = detectDevicePerformance();

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e17);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.cameraController = new CameraController(48, aspect);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: this.perfProfile.tier !== 'LOW',
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });

    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.perfProfile.pixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    if (this.perfProfile.enableShadows) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    container.appendChild(this.renderer.domElement);

    // Sub-controllers
    this.environmentController = new EnvironmentController(this.scene);
    this.characterController = new CharacterController(this.scene);
    this.weatherController = new WeatherController(this.scene, this.perfProfile.tier);

    // Listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('pointerdown', this.onPointerDown);

    const canvas = this.renderer.domElement;
    canvas.addEventListener('webglcontextlost', this.onContextLost, false);
    canvas.addEventListener('webglcontextrestored', this.onContextRestored, false);

    // Initial update
    this.updateControllers(0.016);
    this.animate();
  }

  public setReducedMotion(reduced: boolean) {
    this.reducedMotion = reduced;
  }

  public setTargetProgress(p: number) {
    this.targetProgress = clamp(p, 0, 1);
  }

  public jumpToProgress(p: number) {
    this.targetProgress = clamp(p, 0, 1);
    this.currentProgress = this.targetProgress;
    this.updateControllers(0.016);
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.cameraController.setAspect(width / height);
    this.renderer.setSize(width, height);
  };

  private onMouseMove = (e: MouseEvent) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    this.mousePos.set(nx, -ny);
    this.cameraController.setMouse(nx, ny);

    this.checkRaycast();
  };

  private onPointerDown = () => {
    this.checkRaycast(true);
  };

  private checkRaycast(isClick: boolean = false) {
    this.raycaster.setFromCamera(this.mousePos, this.cameraController.camera);
    
    const interactables: { obj: THREE.Object3D | null; name: string }[] = [
      { obj: this.environmentController.phoneMesh, name: 'phone' },
      { obj: this.environmentController.droppedNotebook, name: 'notebook' },
      { obj: this.environmentController.teaCupA, name: 'tea' },
    ];

    for (const item of interactables) {
      if (!item.obj) continue;
      const intersects = this.raycaster.intersectObject(item.obj, true);
      if (intersects.length > 0) {
        if (isClick && this.callbacks.onClickInteractiveObject) {
          this.callbacks.onClickInteractiveObject(item.name);
        } else if (this.callbacks.onHoverObject) {
          this.callbacks.onHoverObject(item.name);
        }
        return;
      }
    }

    if (!isClick && this.callbacks.onHoverObject) {
      this.callbacks.onHoverObject(null);
    }
  }

  private onContextLost = (e: Event) => {
    e.preventDefault();
    console.warn('WebGL context lost, pausing render loop');
    this.isRunning = false;
  };

  private onContextRestored = () => {
    console.log('WebGL context restored');
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  };

  private updateControllers(delta: number) {
    // Cinematic Damping of scroll progress:
    const smoothing = this.reducedMotion ? 0.35 : 0.08;
    this.currentProgress = lerp(this.currentProgress, this.targetProgress, smoothing);

    if (Math.abs(this.currentProgress - this.targetProgress) < 0.00005) {
      this.currentProgress = this.targetProgress;
    }

    this.callbacks.onProgressUpdate(this.currentProgress);

    this.cameraController.update(this.currentProgress, delta, this.reducedMotion);
    this.environmentController.update(delta, this.currentProgress);
    this.characterController.update(this.currentProgress, delta);
    this.weatherController.update(delta, this.currentProgress, this.cameraController.camera.position);
  }

  private animate = () => {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.updateControllers(delta);
    this.renderer.render(this.scene, this.cameraController.camera);
  };

  public dispose() {
    this.isRunning = false;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('pointerdown', this.onPointerDown);

    const canvas = this.renderer.domElement;
    canvas.removeEventListener('webglcontextlost', this.onContextLost);
    canvas.removeEventListener('webglcontextrestored', this.onContextRestored);

    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
