import * as THREE from 'three';
import { MaterialPalette } from './materials';

export class EnvironmentController {
  public root: THREE.Group;
  private fanBlades: THREE.Group | null = null;
  private teaSteamGroup: THREE.Group | null = null;
  private laptopScreenMesh: THREE.Mesh | null = null;
  public phoneMesh: THREE.Mesh | null = null;
  public teaCupA: THREE.Mesh | null = null;
  public teaCupB: THREE.Mesh | null = null;
  public droppedNotebook: THREE.Mesh | null = null;
  public festivalLanterns: THREE.Group | null = null;

  constructor(scene: THREE.Scene) {
    this.root = new THREE.Group();
    scene.add(this.root);

    this.buildPGRoom();
    this.buildCorridorAndStairs();
    this.buildCampusRoad();
    this.buildTeaStall();
    this.buildBusShelter();
    this.buildTwoYearsQuad();
    this.buildLastDayAndGate();
    this.buildYearsLaterApartment();
    this.buildMovingOnAvenue();
  }

  // 1. PG Room (Z: 5 to -5)
  private buildPGRoom() {
    const room = new THREE.Group();
    room.position.set(0, 0, 0);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(6, 10);
    const floor = new THREE.Mesh(floorGeo, MaterialPalette.floorWood);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    room.add(floor);

    // Walls
    const wallGeo = new THREE.BoxGeometry(6, 3.2, 0.15);
    const backWall = new THREE.Mesh(wallGeo, MaterialPalette.roomWall);
    backWall.position.set(0, 1.6, 5);
    backWall.receiveShadow = true;
    room.add(backWall);

    const sideWallGeo = new THREE.BoxGeometry(0.15, 3.2, 10);
    const leftWall = new THREE.Mesh(sideWallGeo, MaterialPalette.roomWall);
    leftWall.position.set(-3, 1.6, 0);
    leftWall.receiveShadow = true;
    room.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeo, MaterialPalette.roomWall);
    rightWall.position.set(3, 1.6, 0);
    rightWall.receiveShadow = true;
    room.add(rightWall);

    // Bed
    const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 2.2), MaterialPalette.darkDesk);
    bedFrame.position.set(-2, 0.18, 2.8);
    bedFrame.castShadow = true;
    bedFrame.receiveShadow = true;
    room.add(bedFrame);

    const mattress = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.25, 2.1),
      new THREE.MeshStandardMaterial({ color: 0x485a6c, roughness: 0.9 })
    );
    mattress.position.set(-2, 0.45, 2.8);
    room.add(mattress);

    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.12, 0.4),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.95 })
    );
    pillow.position.set(-2, 0.6, 3.6);
    room.add(pillow);

    // Study Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.75, 0.9), MaterialPalette.darkDesk);
    desk.position.set(0.6, 0.38, 2.8);
    desk.castShadow = true;
    room.add(desk);

    // Books on desk
    const bookColors = [0x991b1b, 0x1e3a8a, 0x166534, 0x854d0e];
    bookColors.forEach((color, idx) => {
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.05, 0.22),
        new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
      );
      book.position.set(0.2, 0.77 + idx * 0.052, 2.7);
      room.add(book);
    });

    // Water bottle
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.26, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.4 })
    );
    bottle.position.set(1.1, 0.88, 2.9);
    room.add(bottle);

    // Wall Clock at 08:12 AM
    const clock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
    );
    clock.rotation.x = Math.PI / 2;
    clock.position.set(-1.0, 2.3, 4.9);
    room.add(clock);

    // Window with light
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.4, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    );
    windowFrame.position.set(-2.95, 1.8, 1.0);
    windowFrame.rotation.y = Math.PI / 2;
    room.add(windowFrame);

    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.2), MaterialPalette.windowGlass);
    windowGlass.position.set(-2.9, 1.8, 1.0);
    windowGlass.rotation.y = Math.PI / 2;
    room.add(windowGlass);

    // Ceiling Fan
    const fanCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 })
    );
    fanCenter.position.set(0, 3.0, 2.0);
    room.add(fanCenter);

    this.fanBlades = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.015, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 })
      );
      blade.position.x = 0.48;
      const bladeWrapper = new THREE.Group();
      bladeWrapper.rotation.y = (i * Math.PI * 2) / 3;
      bladeWrapper.add(blade);
      this.fanBlades.add(bladeWrapper);
    }
    this.fanBlades.position.set(0, 2.95, 2.0);
    room.add(this.fanBlades);

    this.root.add(room);
  }

  // 2. Corridor & Staircase (Z: -5 to -15)
  private buildCorridorAndStairs() {
    const corridor = new THREE.Group();

    // Corridor Floor
    const floorGeo = new THREE.PlaneGeometry(3.5, 12);
    const floor = new THREE.Mesh(floorGeo, MaterialPalette.campusPavement);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, -10);
    floor.receiveShadow = true;
    corridor.add(floor);

    // Side corridor pillars
    for (let z = -6; z >= -14; z -= 3) {
      const pillarGeo = new THREE.BoxGeometry(0.35, 3.0, 0.35);
      const leftPillar = new THREE.Mesh(pillarGeo, MaterialPalette.roomWall);
      leftPillar.position.set(-1.6, 1.5, z);
      leftPillar.castShadow = true;
      corridor.add(leftPillar);

      const rightPillar = new THREE.Mesh(pillarGeo, MaterialPalette.roomWall);
      rightPillar.position.set(1.6, 1.5, z);
      rightPillar.castShadow = true;
      corridor.add(rightPillar);
    }

    // Concrete steps descending toward campus road
    for (let s = 0; s < 4; s++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(4.0, 0.15, 0.6),
        MaterialPalette.campusPavement
      );
      step.position.set(0, -0.075 * s, -14.5 - s * 0.5);
      step.receiveShadow = true;
      corridor.add(step);
    }

    this.root.add(corridor);
  }

  // 3. College Campus Entrance & Road (Z: -16 to -45)
  private buildCampusRoad() {
    const campus = new THREE.Group();

    // Road asphalt
    const roadGeo = new THREE.PlaneGeometry(7.0, 32);
    const road = new THREE.Mesh(roadGeo, MaterialPalette.wetAsphalt);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.3, -31);
    road.receiveShadow = true;
    campus.add(road);

    // Green verge sides
    const lawnGeo = new THREE.PlaneGeometry(16, 32);
    const leftLawn = new THREE.Mesh(lawnGeo, MaterialPalette.campusGrass);
    leftLawn.rotation.x = -Math.PI / 2;
    leftLawn.position.set(-11.5, -0.31, -31);
    campus.add(leftLawn);

    const rightLawn = new THREE.Mesh(lawnGeo, MaterialPalette.campusGrass);
    rightLawn.rotation.x = -Math.PI / 2;
    rightLawn.position.set(11.5, -0.31, -31);
    campus.add(rightLawn);

    // Trees
    const treePositions: [number, number][] = [
      [-5.5, -20], [5.2, -22], [-6.2, -28], [5.8, -32],
      [-5.0, -38], [6.5, -42], [-4.8, -45]
    ];

    treePositions.forEach(([x, z], i) => {
      const tree = this.createTree(i % 3 === 0);
      tree.position.set(x, -0.3, z);
      campus.add(tree);
    });

    // Parked Bicycles
    for (let b = 0; b < 3; b++) {
      const bike = this.createBicycle();
      bike.position.set(-4.2, -0.3, -24 - b * 1.6);
      bike.rotation.y = 0.2 + b * 0.1;
      campus.add(bike);
    }

    // Dropped notebook on pathway around Z: -20
    const notebookGeo = new THREE.BoxGeometry(0.35, 0.03, 0.45);
    const notebookMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.7 });
    this.droppedNotebook = new THREE.Mesh(notebookGeo, notebookMat);
    this.droppedNotebook.position.set(0.3, -0.28, -20.2);
    this.droppedNotebook.rotation.y = 0.4;
    campus.add(this.droppedNotebook);

    // Lampposts
    for (let lp = -18; lp >= -42; lp -= 12) {
      const lamppost = this.createLamppost();
      lamppost.position.set(3.8, -0.3, lp);
      campus.add(lamppost);
    }

    this.root.add(campus);
  }

  // 4. The Tea Stall & Routine Benches (Z: -45 to -65)
  private buildTeaStall() {
    const teaGroup = new THREE.Group();

    // Roadside stall structure
    const stallBase = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 2.4, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 })
    );
    stallBase.position.set(-5.5, 0.9, -54);
    teaGroup.add(stallBase);

    // Corrugated metal slanted awning
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(4.0, 0.08, 2.8),
      MaterialPalette.teaStallMetal
    );
    awning.position.set(-5.3, 2.3, -54);
    awning.rotation.z = -0.15;
    teaGroup.add(awning);

    // Wooden Counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.85, 0.7),
      MaterialPalette.woodBench
    );
    counter.position.set(-3.8, 0.42, -54);
    teaGroup.add(counter);

    // Two hot cutting chai glasses on the counter
    const glassGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.12, 12);
    this.teaCupA = new THREE.Mesh(glassGeo, MaterialPalette.chaiGlass);
    this.teaCupA.position.set(-3.7, 0.91, -53.8);
    teaGroup.add(this.teaCupA);

    this.teaCupB = new THREE.Mesh(glassGeo, MaterialPalette.chaiGlass);
    this.teaCupB.position.set(-3.7, 0.91, -54.2);
    teaGroup.add(this.teaCupB);

    // Tea Steam particles
    this.teaSteamGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.02 + i * 0.005, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
      );
      puff.position.set(-3.7, 0.98 + i * 0.05, -54.0);
      this.teaSteamGroup.add(puff);
    }
    teaGroup.add(this.teaSteamGroup);

    // Wooden Bench opposite stall
    const bench = this.createWoodenBench();
    bench.position.set(3.4, -0.3, -54);
    teaGroup.add(bench);

    this.root.add(teaGroup);
  }

  // 5. Monsoon Bus Shelter (Z: -65 to -80)
  private buildBusShelter() {
    const shelterGroup = new THREE.Group();

    // Shelter concrete pad
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.15, 3.2),
      MaterialPalette.campusPavement
    );
    pad.position.set(1.5, -0.22, -74);
    shelterGroup.add(pad);

    // Posts & metal roof
    for (let px of [-0.4, 3.4]) {
      for (let pz of [-72.8, -75.2]) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8),
          MaterialPalette.teaStallMetal
        );
        post.position.set(px, 1.08, pz);
        shelterGroup.add(post);
      }
    }

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(4.4, 0.08, 3.0),
      MaterialPalette.teaStallMetal
    );
    roof.position.set(1.5, 2.4, -74);
    shelterGroup.add(roof);

    // Water puddle reflection plane
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(1.8, 18),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.1,
        metalness: 0.7,
      })
    );
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(0.2, -0.28, -71);
    shelterGroup.add(puddle);

    this.root.add(shelterGroup);
  }

  // 6. The "Two Years" Quad Timeline (Z: -80 to -130)
  private buildTwoYearsQuad() {
    const quad = new THREE.Group();

    // Quad Central Lawn
    const quadLawn = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 48),
      MaterialPalette.campusGrass
    );
    quadLawn.rotation.x = -Math.PI / 2;
    quadLawn.position.set(0, -0.31, -105);
    quadLawn.receiveShadow = true;
    quad.add(quadLawn);

    // Crossed stone pathways
    const pathA = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 48),
      MaterialPalette.campusPavement
    );
    pathA.rotation.x = -Math.PI / 2;
    pathA.position.set(0, -0.3, -105);
    quad.add(pathA);

    // College Department Buildings on left & right
    for (let side of [-12, 12]) {
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(6.0, 7.5, 42),
        new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 })
      );
      building.position.set(side, 3.4, -105);
      quad.add(building);

      // Windows
      for (let wz = -120; wz <= -90; wz += 4) {
        for (let wy = 2; wy <= 5.5; wy += 2.2) {
          const win = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1.2, 1.6),
            MaterialPalette.windowGlass
          );
          win.position.set(side + (side < 0 ? 3.01 : -3.01), wy, wz);
          quad.add(win);
        }
      }
    }

    // Festoon String Lanterns (Festival season)
    this.festivalLanterns = new THREE.Group();
    for (let z = -92; z >= -118; z -= 4) {
      for (let x = -4; x <= 4; x += 2) {
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 8, 8),
          MaterialPalette.lanternGlow
        );
        bulb.position.set(x + (Math.random() - 0.5) * 0.4, 3.4 - Math.abs(x) * 0.12, z);
        this.festivalLanterns.add(bulb);
      }
    }
    quad.add(this.festivalLanterns);

    this.root.add(quad);
  }

  // 7. Last Day Classrooms & Iron College Gate (Z: -130 to -175)
  private buildLastDayAndGate() {
    const lastDayGroup = new THREE.Group();

    // Quiet classroom corridor area
    const path = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 40),
      MaterialPalette.campusPavement
    );
    path.rotation.x = -Math.PI / 2;
    path.position.set(0, -0.3, -152);
    lastDayGroup.add(path);

    // Ornate Iron College Gate at Z: -164
    const pillarLeft = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 4.5, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 })
    );
    pillarLeft.position.set(-2.8, 1.95, -164);
    lastDayGroup.add(pillarLeft);

    const pillarRight = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 4.5, 0.9),
      new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.8 })
    );
    pillarRight.position.set(2.8, 1.95, -164);
    lastDayGroup.add(pillarRight);

    // Iron gate bars (open)
    const leftGate = this.createIronGateWing();
    leftGate.position.set(-2.4, -0.3, -164);
    leftGate.rotation.y = 0.9; // swung open
    lastDayGroup.add(leftGate);

    const rightGate = this.createIronGateWing();
    rightGate.position.set(2.4, -0.3, -164);
    rightGate.rotation.y = -0.9;
    lastDayGroup.add(rightGate);

    this.root.add(lastDayGroup);
  }

  // 8. Years Later Modern Apartment (Offset at X: 18, Z: -5 to -20)
  private buildYearsLaterApartment() {
    const apt = new THREE.Group();
    apt.position.set(18, 0, -14);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e222d, roughness: 0.5 })
    );
    floor.rotation.x = -Math.PI / 2;
    apt.add(floor);

    // Desk
    const modernDesk = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.74, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
    );
    modernDesk.position.set(0, 0.37, 0.4);
    apt.add(modernDesk);

    // Laptop
    const laptopBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.015, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
    );
    laptopBase.position.set(0, 0.75, 0.35);
    apt.add(laptopBase);

    const laptopScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.24, 0.015),
      new THREE.MeshBasicMaterial({ color: 0x60a5fa })
    );
    laptopScreen.position.set(0, 0.87, 0.21);
    laptopScreen.rotation.x = -0.2;
    this.laptopScreenMesh = laptopScreen;
    apt.add(laptopScreen);

    // Smartphone lying beside keyboard (for the notification story event!)
    const phoneGeo = new THREE.BoxGeometry(0.12, 0.01, 0.22);
    this.phoneMesh = new THREE.Mesh(phoneGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    this.phoneMesh.position.set(0.38, 0.75, 0.4);
    apt.add(this.phoneMesh);

    // Coffee mug
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 })
    );
    mug.position.set(-0.35, 0.79, 0.45);
    apt.add(mug);

    // Night Window overlooking city skyline
    const windowWall = new THREE.Mesh(
      new THREE.BoxGeometry(6, 3.2, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.9 })
    );
    windowWall.position.set(0, 1.6, -3.5);
    apt.add(windowWall);

    const largeWindow = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 2.2),
      MaterialPalette.windowGlass
    );
    largeWindow.position.set(0, 1.6, -3.4);
    apt.add(largeWindow);

    // City lights in the far distance
    for (let b = 0; b < 16; b++) {
      const h = 4 + Math.random() * 8;
      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, h, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x050811, roughness: 0.9 })
      );
      bldg.position.set(-8 + b * 1.4, h / 2 - 2, -18);
      apt.add(bldg);
    }

    this.root.add(apt);
  }

  // 9. Moving On Avenue (Offset at X: 32, Z: 5 to -50)
  private buildMovingOnAvenue() {
    const ave = new THREE.Group();
    ave.position.set(32, 0, -20);

    // Wide open sunlit boulevard
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(9, 65),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 })
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, -0.3, 0);
    ave.add(road);

    // Tree-lined boulevard
    for (let z = 24; z >= -30; z -= 7) {
      const treeL = this.createTree(false);
      treeL.position.set(-5.5, -0.3, z);
      ave.add(treeL);

      const treeR = this.createTree(false);
      treeR.position.set(5.5, -0.3, z);
      ave.add(treeR);
    }

    this.root.add(ave);
  }

  private createTree(isAutumn: boolean = false): THREE.Group {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, 2.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.9 })
    );
    trunk.position.y = 1.4;
    trunk.castShadow = true;
    tree.add(trunk);

    const foliageMat = isAutumn ? MaterialPalette.autumnFoliage : MaterialPalette.foliage;
    const foliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.5, 1),
      foliageMat
    );
    foliage.position.y = 3.2;
    foliage.castShadow = true;
    tree.add(foliage);

    return tree;
  }

  private createWoodenBench(): THREE.Group {
    const bench = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.45), MaterialPalette.woodBench);
    seat.position.y = 0.45;
    bench.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.35, 0.06), MaterialPalette.woodBench);
    back.position.set(0, 0.72, -0.2);
    bench.add(back);

    for (let x of [-0.75, 0.75]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.4), MaterialPalette.teaStallMetal);
      leg.position.set(x, 0.22, 0);
      bench.add(leg);
    }
    return bench;
  }

  private createBicycle(): THREE.Group {
    const bike = new THREE.Group();
    const wheelGeo = new THREE.TorusGeometry(0.3, 0.03, 6, 16);
    const wheelMat = MaterialPalette.teaStallMetal;

    const frontWheel = new THREE.Mesh(wheelGeo, wheelMat);
    frontWheel.position.set(0, 0.3, 0.55);
    bike.add(frontWheel);

    const backWheel = new THREE.Mesh(wheelGeo, wheelMat);
    backWheel.position.set(0, 0.3, -0.55);
    bike.add(backWheel);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.35, 0.75), new THREE.MeshStandardMaterial({ color: 0x0284c7 }));
    frame.position.set(0, 0.45, 0);
    bike.add(frame);
    return bike;
  }

  private createLamppost(): THREE.Group {
    const lamp = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 4.0, 8),
      MaterialPalette.teaStallMetal
    );
    pole.position.y = 2.0;
    lamp.add(pole);

    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.25, 0.35),
      new THREE.MeshBasicMaterial({ color: 0xffedd5 })
    );
    head.position.y = 4.1;
    lamp.add(head);
    return lamp;
  }

  private createIronGateWing(): THREE.Group {
    const wing = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 3.2, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3, wireframe: true })
    );
    frame.position.set(1.1, 1.6, 0);
    wing.add(frame);
    return wing;
  }

  public update(delta: number, progress: number) {
    // Fan spin
    if (this.fanBlades) {
      this.fanBlades.rotation.y += delta * 4.5;
    }

    // Tea Steam animation
    if (this.teaSteamGroup) {
      this.teaSteamGroup.children.forEach((child, i) => {
        child.position.y += delta * 0.15;
        if (child.position.y > 1.4) {
          child.position.y = 0.98;
        }
      });
    }

    // In Chapter 06 (Memory, progress 0.78 - 0.90): Two tea cups become one (Section 22)
    if (this.teaCupB) {
      this.teaCupB.visible = progress < 0.78;
    }

    // Phone notification pulsing glow around progress 0.70 - 0.78
    if (this.phoneMesh) {
      const isPhoneActive = progress >= 0.70 && progress <= 0.78;
      const mat = this.phoneMesh.material as THREE.MeshBasicMaterial;
      if (isPhoneActive) {
        const pulse = 0.5 + Math.sin(Date.now() * 0.008) * 0.5;
        mat.color.setRGB(0.2 + pulse * 0.3, 0.7 + pulse * 0.3, 1.0);
      } else {
        mat.color.setHex(0x1e293b);
      }
    }
  }
}
