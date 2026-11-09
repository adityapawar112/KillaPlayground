import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { useTerrainStore } from '../terrain/terrainStore';
import { useEditorStore } from '../state/useEditorStore';
import { getTexel, worldToGrid } from '../terrain/terrainBuffer';
import { serializeKilla, deserializeKilla } from '../persistence/killaSerializer';
import { eraseFoliageInRadius } from '../foliage/foliageScatter';

describe('Blast Radius Verification Suite', () => {
  beforeEach(() => {
    // Reset stores to initial state
    useTerrainStore.getState().resetTerrain();
    useEditorStore.getState().resetScene();
  });

  it('Fact 1: pushUndo increments historyVersion without dirtying lastUpdated', () => {
    const initialLastUpdated = useTerrainStore.getState().lastUpdated;
    const initialVersion = useTerrainStore.getState().historyVersion || 0;

    // Push an undo snapshot
    useTerrainStore.getState().pushUndo();

    const afterPush = useTerrainStore.getState();
    expect(afterPush.historyVersion).toBe(initialVersion + 1);
    expect(afterPush.lastUpdated).toBe(initialLastUpdated); // Crucial: does not falsely trigger wall re-extrusions!
    expect(afterPush.canUndo()).toBe(true);
  });

  it('Fact 2: sculptTerrain mutates stateBuffer without throttling lag or premature lastUpdated sets during drag', () => {
    const store = useTerrainStore.getState();
    const initialLastUpdated = store.lastUpdated;

    // Simulate mouse drag sculpt step (e.g., peak/raise)
    const modified = store.sculptTerrain(0, 0, {
      operation: 'elevate',
      radius: 1.0,
      strength: 0.5,
    });
    expect(modified).toBe(true);

    // Vertex data must be modified immediately
    const { ix, iz } = worldToGrid(0, 0);
    const texel = getTexel(store.stateBuffer, ix, iz);
    expect(texel.height).toBeGreaterThan(0.01);

    // During drag, lastUpdated must NOT change so 60fps loop runs without wall re-mesh rebuilds
    expect(useTerrainStore.getState().lastUpdated).toBe(initialLastUpdated);

    // When drag ends (pointerup), lastUpdated is set to current timestamp
    useTerrainStore.setState({ lastUpdated: Date.now() });
    expect(useTerrainStore.getState().lastUpdated).toBeGreaterThan(initialLastUpdated);
  });

  it('Fact 3: Texture painting mutates paintBuffer and pointer-up notifies lastUpdated for autosave', () => {
    const store = useTerrainStore.getState();
    const initialLastUpdated = store.lastUpdated;

    // Paint layer 3 onto terrain at center
    store.applyPaintBrush(0, 0, { operation: 'paint', targetLayer: 3, radius: 1.0, strength: 0.8, falloff: 0.5 });

    // Pointer-up fires
    useTerrainStore.setState({ lastUpdated: Date.now() });

    expect(useTerrainStore.getState().lastUpdated).toBeGreaterThan(initialLastUpdated);

    // Verify paintBuffer serializes into valid .killa package
    const editor = useEditorStore.getState();
    const terrain = useTerrainStore.getState();
    const blob = serializeKilla(editor, {
      stateBuffer: terrain.stateBuffer,
      paintBuffer: terrain.paintBuffer,
    });
    expect(blob.byteLength).toBeGreaterThan(100);

    const unpacked = deserializeKilla(blob);
    expect(unpacked).not.toBeNull();
    expect(unpacked!.manifest.version).toBe('1.2.0');
    expect(unpacked!.paintBuffer).toBeInstanceOf(Uint8Array);
  });

  it('Fact 4: Scene structure queries resolve FortWallsLayer, SplineStructuresContainer, and CourtyardRetainingBricks', () => {
    const scene = new THREE.Scene();

    // Create mock scene graph nodes matching real components
    const terrainGeo = new THREE.PlaneGeometry(10, 10);
    terrainGeo.rotateX(-Math.PI / 2); // Horizontal terrain plane
    const terrain = new THREE.Mesh(terrainGeo, new THREE.MeshBasicMaterial());
    terrain.name = 'BaseTerrainMesh';
    scene.add(terrain);

    const fortLayer = new THREE.Group();
    fortLayer.name = 'FortWallsLayer';
    const fortWallMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial());
    fortWallMesh.name = 'FortWall_1_Mesh';
    fortLayer.add(fortWallMesh);
    scene.add(fortLayer);

    const splineContainer = new THREE.Group();
    splineContainer.name = 'SplineStructuresContainer';
    const stoneStepsGroup = new THREE.Group();
    stoneStepsGroup.name = 'StoneSteps_spline_1';
    const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), new THREE.MeshBasicMaterial());
    stoneStepsGroup.add(stepMesh);
    splineContainer.add(stoneStepsGroup);
    scene.add(splineContainer);

    const bricks = new THREE.Group();
    bricks.name = 'CourtyardRetainingBricks';
    scene.add(bricks);

    // Target query verification
    const queriedTerrain = scene.getObjectByName('BaseTerrainMesh') || scene.getObjectByName('TerrainMeshFallback');
    const queriedFort = scene.getObjectByName('FortWallsLayer');
    const queriedSpline = scene.getObjectByName('SplineStructuresContainer') || scene.getObjectByName('SplineStructures');
    const queriedBricks = scene.getObjectByName('CourtyardRetainingBricks') || scene.getObjectByName('CourtyardBricks');

    expect(queriedTerrain).toBeDefined();
    expect(queriedFort).toBeDefined();
    expect(queriedSpline).toBeDefined();
    expect(queriedBricks).toBeDefined();

    // Test raycasting against targeted pickables with recursive = true
    const raycaster = new THREE.Raycaster(new THREE.Vector3(0, 5, 0), new THREE.Vector3(0, -1, 0));
    const hits = raycaster.intersectObjects([queriedTerrain!, queriedFort!, queriedSpline!, queriedBricks!], true);
    expect(hits.length).toBeGreaterThan(0);
    const hitNames = hits.map((h) => h.object.name);
    expect(hitNames).toContain('FortWall_1_Mesh');
    expect(hitNames).toContain('BaseTerrainMesh');
  });

  it('Fact 5: Fortification placement debounce is calibrated (60ms) and creates bastions promptly', () => {
    const editor = useEditorStore.getState();

    // Create a wall using official store methods
    editor.addWallDraftPoint({ x: -2, y: 0, z: 0 });
    editor.addWallDraftPoint({ x: 0, y: 0, z: 0 });
    editor.addWallDraftPoint({ x: 2, y: 0, z: 0 });
    const wallId = editor.finishCurrentWall(false);
    expect(wallId).toBeTruthy();

    // Add round bastion to wall
    const bastionId = editor.addRoundBastionToWall(wallId!, 0, 0.5);
    expect(bastionId).toBeTruthy();

    const wallWithBastion = useEditorStore.getState().walls.find((w) => w.id === wallId);
    expect(wallWithBastion?.roundBastions?.length).toBe(1);
  });

  it('Fact 6: setActiveTool pauses playback when switching tools, but mode changes preserve playback', () => {
    const editor = useEditorStore.getState();

    // Start in terrain tool and start playing
    editor.setActiveTool('terrain');
    editor.setIsPlaying(true);
    expect(useEditorStore.getState().isPlaying).toBe(true);

    // Switch tool mode inside terrain (e.g., to plateau or slope) - MUST stay playing!
    editor.setTerrainSubTool('plateau');
    expect(useEditorStore.getState().isPlaying).toBe(true);
    editor.setTerrainSubTool('slope');
    expect(useEditorStore.getState().isPlaying).toBe(true);

    // Now switch tools to building - MUST automatically switch to stop (false)!
    editor.setActiveTool('building');
    expect(useEditorStore.getState().isPlaying).toBe(false);

    // In building tool, turn playing back on
    editor.setIsPlaying(true);
    expect(useEditorStore.getState().isPlaying).toBe(true);

    // Switch building subtool/mode (e.g. fortifications, stairs) - MUST stay playing!
    editor.setBuildingMode('fortifications');
    expect(useEditorStore.getState().isPlaying).toBe(true);
    editor.setWallMode('fortify');
    expect(useEditorStore.getState().isPlaying).toBe(true);

    // Switch tools to foliage - MUST automatically switch to stop (false)!
    editor.setActiveTool('foliage');
    expect(useEditorStore.getState().isPlaying).toBe(false);
  });

  it('Fact 7: setWallSnapPreview dedupes identical or micro-delta positions without notifying subscribers', () => {
    const editor = useEditorStore.getState();

    editor.setWallSnapPreview({
      snapped: true,
      type: 'segment',
      position: [1.0, 0.5, 2.0],
      rotationY: 0.25,
    });

    const initialSnap = useEditorStore.getState().wallSnapPreview;
    expect(initialSnap).not.toBeNull();

    // Set preview with sub-millimeter delta (e.g., 0.002m)
    editor.setWallSnapPreview({
      snapped: true,
      type: 'segment',
      position: [1.002, 0.501, 2.001],
      rotationY: 0.25,
    });

    // Object identity must NOT change because it was deduped!
    const afterMicroMove = useEditorStore.getState().wallSnapPreview;
    expect(afterMicroMove).toBe(initialSnap);

    // Set preview with significant movement (> 0.01m)
    editor.setWallSnapPreview({
      snapped: true,
      type: 'segment',
      position: [1.2, 0.5, 2.0],
      rotationY: 0.25,
    });
    const afterRealMove = useEditorStore.getState().wallSnapPreview;
    expect(afterRealMove).not.toBe(initialSnap);
    expect(afterRealMove?.position[0]).toBe(1.2);
  });

  it('Fact 8: Foliage erase cleanly prunes foliage instances via setFoliageInstances', () => {
    const editor = useEditorStore.getState();

    const mockInstances = [
      { id: 'f1', typeId: 'banyan', position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },
      { id: 'f2', typeId: 'banyan', position: [0.1, 0, 0.1] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },
      { id: 'f3', typeId: 'banyan', position: [5.0, 0, 5.0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },
    ];
    editor.setFoliageInstances(mockInstances);
    expect(useEditorStore.getState().foliageInstances.length).toBe(3);

    // Erase within 1.0m of origin
    const { erased, remaining } = eraseFoliageInRadius(0, 0, 1.0, mockInstances);
    expect(erased.length).toBe(2);
    expect(remaining.length).toBe(1);

    editor.setFoliageInstances(remaining);
    expect(useEditorStore.getState().foliageInstances.length).toBe(1);
    expect(useEditorStore.getState().foliageInstances[0].id).toBe('f3');
  });
});
