import * as THREE from 'three';
import { MaterialPalette } from './materials';
import { clamp, lerp } from '../utils/interpolation';

export interface CharacterRig {
  root: THREE.Group;
  head: THREE.Mesh;
  body: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  backpack?: THREE.Mesh;
}

export class CharacterController {
  private scene: THREE.Scene;
  public boy: CharacterRig;
  public girl: CharacterRig;
  public ghostBoy: CharacterRig;
  public ghostGirl: CharacterRig;

  private walkPhase: number = 0;
  private lastProgress: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.boy = this.createStylizedFigure('boy', false);
    this.girl = this.createStylizedFigure('girl', false);
    this.ghostBoy = this.createStylizedFigure('boy', true);
    this.ghostGirl = this.createStylizedFigure('girl', true);

    this.scene.add(this.boy.root);
    this.scene.add(this.girl.root);
    this.scene.add(this.ghostBoy.root);
    this.scene.add(this.ghostGirl.root);

    this.ghostBoy.root.visible = false;
    this.ghostGirl.root.visible = false;
  }

  private createStylizedFigure(type: 'boy' | 'girl', isGhost: boolean = false): CharacterRig {
    const root = new THREE.Group();

    const matBody = isGhost ? MaterialPalette.ghostMemory : (type === 'boy' ? MaterialPalette.boyJacket : MaterialPalette.girlSweater);
    const matLegs = isGhost ? MaterialPalette.ghostMemory : (type === 'boy' ? MaterialPalette.boyPants : MaterialPalette.girlPants);
    const matSkin = isGhost ? MaterialPalette.ghostMemory : MaterialPalette.skinWarm;
    const matHair = isGhost ? MaterialPalette.ghostMemory : MaterialPalette.hairDark;

    // Torso / Body
    const bodyGeo = new THREE.BoxGeometry(0.38, 0.58, 0.22);
    const body = new THREE.Mesh(bodyGeo, matBody);
    body.position.y = 1.05;
    body.castShadow = !isGhost;
    root.add(body);

    // Head
    const headGeo = new THREE.BoxGeometry(0.24, 0.26, 0.22);
    const head = new THREE.Mesh(headGeo, matSkin);
    head.position.y = 1.48;
    head.castShadow = !isGhost;
    root.add(head);

    // Hair
    const hairGeo = new THREE.BoxGeometry(0.26, 0.12, 0.24);
    const hair = new THREE.Mesh(hairGeo, matHair);
    hair.position.y = 1.58;
    root.add(hair);

    if (type === 'girl' && !isGhost) {
      // Long hair back piece
      const longHairGeo = new THREE.BoxGeometry(0.26, 0.28, 0.1);
      const longHair = new THREE.Mesh(longHairGeo, matHair);
      longHair.position.set(0, 1.42, -0.1);
      root.add(longHair);
    }

    // Arms
    const armGeo = new THREE.BoxGeometry(0.1, 0.48, 0.1);
    
    const leftArm = new THREE.Mesh(armGeo, matBody);
    leftArm.position.set(-0.25, 1.02, 0);
    leftArm.castShadow = !isGhost;
    root.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, matBody);
    rightArm.position.set(0.25, 1.02, 0);
    rightArm.castShadow = !isGhost;
    root.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.12, 0.68, 0.12);

    const leftLeg = new THREE.Mesh(legGeo, matLegs);
    leftLeg.position.set(-0.11, 0.36, 0);
    leftLeg.castShadow = !isGhost;
    root.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, matLegs);
    rightLeg.position.set(0.11, 0.36, 0);
    rightLeg.castShadow = !isGhost;
    root.add(rightLeg);

    // Backpack
    let backpack: THREE.Mesh | undefined;
    if (!isGhost) {
      const packGeo = new THREE.BoxGeometry(0.3, 0.38, 0.15);
      backpack = new THREE.Mesh(packGeo, MaterialPalette.backpack);
      backpack.position.set(0, 1.08, -0.16);
      backpack.castShadow = true;
      root.add(backpack);
    }

    return { root, head, body, leftArm, rightArm, leftLeg, rightLeg, backpack };
  }

  public update(progress: number, delta: number) {
    const dProgress = Math.abs(progress - this.lastProgress);
    this.lastProgress = progress;

    const isMoving = dProgress > 0.0001;
    if (isMoving) {
      this.walkPhase += delta * 9;
    }

    // Swing limbs if moving
    const swing = isMoving ? Math.sin(this.walkPhase) * 0.45 : 0;

    this.animateLimb(this.boy, swing);
    this.animateLimb(this.girl, -swing);

    this.positionCharactersByProgress(progress);
  }

  private animateLimb(rig: CharacterRig, swing: number) {
    rig.leftLeg.rotation.x = swing;
    rig.rightLeg.rotation.x = -swing;
    rig.leftArm.rotation.x = -swing * 0.7;
    rig.rightArm.rotation.x = swing * 0.7;
    // subtle torso bounce
    rig.body.position.y = 1.05 + Math.abs(swing) * 0.03;
    rig.head.position.y = 1.48 + Math.abs(swing) * 0.03;
  }

  private positionCharactersByProgress(p: number) {
    // 0.0 - 0.05: PG room morning
    if (p < 0.05) {
      const t = p / 0.05;
      this.boy.root.visible = true;
      this.girl.root.visible = false;
      this.ghostBoy.root.visible = false;
      this.ghostGirl.root.visible = false;

      // Boy gets up from desk towards doorway
      this.boy.root.position.set(lerp(0.2, 0.3, t), 0, lerp(1.2, -0.5, t));
      this.boy.root.rotation.y = Math.PI;
    } 
    // 0.05 - 0.14: Leaving PG room through corridor
    else if (p < 0.14) {
      const t = (p - 0.05) / 0.09;
      this.boy.root.visible = true;
      this.girl.root.visible = false;
      this.boy.root.position.set(lerp(0.3, 0.0, t), 0, lerp(-0.5, -12.0, t));
      this.boy.root.rotation.y = Math.PI;
    }
    // 0.14 - 0.22: First Meeting on Campus Road
    else if (p < 0.22) {
      const t = (p - 0.14) / 0.08;
      this.boy.root.visible = true;
      this.girl.root.visible = true;

      // Boy walks along campus path
      this.boy.root.position.set(lerp(0.0, 0.8, t), 0, lerp(-16.0, -28.0, t));
      this.boy.root.rotation.y = Math.PI;

      // Girl walks slightly ahead, drops notebook around t=0.35, pauses, then continues
      const girlZ = lerp(-20.0, -32.0, t);
      this.girl.root.position.set(0.2, 0, girlZ);
      this.girl.root.rotation.y = Math.PI;
    }
    // 0.22 - 0.32: The Routine & Tea Stall
    else if (p < 0.32) {
      const t = (p - 0.22) / 0.10;
      this.boy.root.visible = true;
      this.girl.root.visible = true;

      if (p < 0.26) {
        // Walking together side by side
        const subT = (p - 0.22) / 0.04;
        this.boy.root.position.set(lerp(0.8, -3.2, subT), 0, lerp(-28.0, -50.0, subT));
        this.girl.root.position.set(lerp(0.2, -3.8, subT), 0, lerp(-32.0, -50.0, subT));
        this.boy.root.rotation.y = Math.PI;
        this.girl.root.rotation.y = Math.PI;
      } else {
        // At the tea stall counter
        this.boy.root.position.set(-3.2, 0, -53.5);
        this.girl.root.position.set(-3.9, 0, -53.5);
        this.boy.root.rotation.y = Math.PI * 0.25;
        this.girl.root.rotation.y = -Math.PI * 0.25;
      }
    }
    // 0.32 - 0.36: Rain under bus stop shelter
    else if (p < 0.36) {
      this.boy.root.visible = true;
      this.girl.root.visible = true;
      this.boy.root.position.set(1.4, 0, -74.0);
      this.girl.root.position.set(0.7, 0, -74.0);
      this.boy.root.rotation.y = Math.PI * 0.1;
      this.girl.root.rotation.y = 0;
    }
    // 0.36 - 0.52: Two Years timeline quad
    else if (p < 0.52) {
      const t = (p - 0.36) / 0.16;
      this.boy.root.visible = true;
      this.girl.root.visible = true;
      // Moving in harmony through the quad
      this.boy.root.position.set(lerp(1.4, -0.6, t), 0, lerp(-76.0, -125.0, t));
      this.girl.root.position.set(lerp(0.7, 0.4, t), 0, lerp(-76.0, -124.0, t));
      this.boy.root.rotation.y = Math.PI;
      this.girl.root.rotation.y = Math.PI;
    }
    // 0.52 - 0.66: Last Day & Gate
    else if (p < 0.66) {
      const t = (p - 0.52) / 0.14;
      this.boy.root.visible = true;
      this.girl.root.visible = true;

      if (p < 0.62) {
        // Walking slowly to college gate
        const subT = (p - 0.52) / 0.10;
        this.boy.root.position.set(lerp(-0.6, -0.4, subT), 0, lerp(-125.0, -162.0, subT));
        this.girl.root.position.set(lerp(0.4, 0.4, subT), 0, lerp(-124.0, -162.0, subT));
        this.boy.root.rotation.y = Math.PI;
        this.girl.root.rotation.y = Math.PI;
      } else {
        // Parting ways in different directions
        const partT = (p - 0.62) / 0.04;
        this.boy.root.position.set(lerp(-0.4, -2.5, partT), 0, lerp(-162.0, -170.0, partT));
        this.girl.root.position.set(lerp(0.4, 3.0, partT), 0, lerp(-162.0, -172.0, partT));
        this.boy.root.rotation.y = Math.PI * 0.85;
        this.girl.root.rotation.y = -Math.PI * 0.85;
      }
    }
    // 0.66 - 0.78: Years Later Apartment
    else if (p < 0.78) {
      this.boy.root.visible = true;
      this.girl.root.visible = false;
      this.ghostBoy.root.visible = false;
      this.ghostGirl.root.visible = false;

      // Boy sitting in his modern apartment at desk
      this.boy.root.position.set(18.0, 0, -14.0);
      this.boy.root.rotation.y = 0;
    }
    // 0.78 - 0.90: Memory Reverie (Empty college, ghost fragments)
    else if (p < 0.90) {
      this.boy.root.visible = false;
      this.girl.root.visible = false;

      // Ghost memory figures flickering quietly at the bench & tea stall
      this.ghostBoy.root.visible = true;
      this.ghostGirl.root.visible = true;
      this.ghostBoy.root.position.set(-3.2, 0, -53.5);
      this.ghostGirl.root.position.set(-3.9, 0, -53.5);
      this.ghostBoy.root.rotation.y = Math.PI * 0.25;
      this.ghostGirl.root.rotation.y = -Math.PI * 0.25;
    }
    // 0.90 - 1.00: Moving On Morning Road
    else {
      const t = (p - 0.90) / 0.10;
      this.boy.root.visible = true;
      this.girl.root.visible = false;
      this.ghostBoy.root.visible = false;
      this.ghostGirl.root.visible = false;

      // Boy walks steadily forward along the bright morning avenue
      this.boy.root.position.set(32.0, 0, lerp(-5.0, -35.0, t));
      this.boy.root.rotation.y = Math.PI;
    }
  }
}
