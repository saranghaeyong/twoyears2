import * as THREE from 'three';

// Procedural subtle canvas texture helpers to ensure 0 external texture load failures
export function createNoiseCanvasTexture(colorA: string, colorB: string, pattern: 'grid' | 'wood' | 'noise' | 'wall' = 'noise'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = colorA;
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = colorB;
  if (pattern === 'grid') {
    ctx.lineWidth = 1;
    ctx.strokeStyle = colorB;
    for (let i = 0; i < 128; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 128);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(128, i);
      ctx.stroke();
    }
  } else if (pattern === 'wood') {
    for (let y = 0; y < 128; y += 4) {
      ctx.fillStyle = (y % 8 === 0) ? colorB : colorA;
      ctx.fillRect(0, y, 128, 2);
    }
  } else {
    // Subtle noise specks
    for (let i = 0; i < 240; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export class MaterialPalette {
  public static roomWall = new THREE.MeshStandardMaterial({
    color: 0xdfd8cd,
    roughness: 0.9,
    metalness: 0.05,
  });

  public static floorWood = new THREE.MeshStandardMaterial({
    color: 0x5a3e2b,
    roughness: 0.65,
    metalness: 0.1,
  });

  public static darkDesk = new THREE.MeshStandardMaterial({
    color: 0x3d2b1f,
    roughness: 0.7,
  });

  public static boyJacket = new THREE.MeshStandardMaterial({
    color: 0x2b3846, // Slate navy
    roughness: 0.8,
  });

  public static boyPants = new THREE.MeshStandardMaterial({
    color: 0x1f242b, // Charcoal
    roughness: 0.9,
  });

  public static girlSweater = new THREE.MeshStandardMaterial({
    color: 0xb58f79, // Warm cinnamon / terracotta
    roughness: 0.8,
  });

  public static girlPants = new THREE.MeshStandardMaterial({
    color: 0x272c35,
    roughness: 0.9,
  });

  public static skinWarm = new THREE.MeshStandardMaterial({
    color: 0xd9a888,
    roughness: 0.6,
  });

  public static hairDark = new THREE.MeshStandardMaterial({
    color: 0x1a1513,
    roughness: 0.9,
  });

  public static backpack = new THREE.MeshStandardMaterial({
    color: 0x7c4936, // Vintage rust canvas
    roughness: 0.85,
  });

  public static campusPavement = new THREE.MeshStandardMaterial({
    color: 0x6e7279,
    roughness: 0.85,
    metalness: 0.05,
  });

  public static wetAsphalt = new THREE.MeshStandardMaterial({
    color: 0x2c3138,
    roughness: 0.35,
    metalness: 0.4,
  });

  public static campusGrass = new THREE.MeshStandardMaterial({
    color: 0x3d5438,
    roughness: 0.9,
  });

  public static foliage = new THREE.MeshStandardMaterial({
    color: 0x385234,
    roughness: 0.85,
    flatShading: true,
  });

  public static autumnFoliage = new THREE.MeshStandardMaterial({
    color: 0x9e6832,
    roughness: 0.85,
    flatShading: true,
  });

  public static woodBench = new THREE.MeshStandardMaterial({
    color: 0x634226,
    roughness: 0.75,
  });

  public static teaStallMetal = new THREE.MeshStandardMaterial({
    color: 0x59646b,
    roughness: 0.4,
    metalness: 0.6,
  });

  public static chaiGlass = new THREE.MeshPhysicalMaterial({
    color: 0xd49b4b,
    transparent: true,
    opacity: 0.85,
    roughness: 0.15,
    transmission: 0.6,
    thickness: 0.5,
  });

  public static windowGlass = new THREE.MeshPhysicalMaterial({
    color: 0xa8c5db,
    transparent: true,
    opacity: 0.35,
    roughness: 0.2,
  });

  public static lanternGlow = new THREE.MeshBasicMaterial({
    color: 0xffaa44,
  });

  public static phoneScreen = new THREE.MeshBasicMaterial({
    color: 0x0a101d,
  });

  public static ghostMemory = new THREE.MeshBasicMaterial({
    color: 0xe0e7ff,
    transparent: true,
    opacity: 0.28,
  });
}
