import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../state/useEditorStore';
import { useTerrainStore } from '../terrain/terrainStore';
import { DEFAULT_WALL_SETTINGS } from './wallTypes';

describe('Wall Store & State Integration', () => {
  beforeEach(() => {
    useEditorStore.setState({
      walls: [],
      activeWallDraft: [],
      wallSettings: { ...DEFAULT_WALL_SETTINGS },
      wallSubTool: 'draw',
      selectedWallId: null,
    });
  });

  it('manages active wall draft points and finishes wall', () => {
    const store = useEditorStore.getState();

    store.addWallDraftPoint({ x: 0, y: 0, z: 0 });
    store.addWallDraftPoint({ x: 2, y: 0, z: 0 });
    store.addWallDraftPoint({ x: 2, y: 0, z: 2 });

    expect(useEditorStore.getState().activeWallDraft.length).toBe(3);

    const wallId = store.finishCurrentWall(false);
    expect(wallId).toBeDefined();

    const state = useEditorStore.getState();
    expect(state.walls.length).toBe(1);
    expect(state.walls[0].id).toBe(wallId);
    expect(state.walls[0].points.length).toBe(3);
    expect(state.walls[0].isClosed).toBe(false);
    expect(state.activeWallDraft.length).toBe(0);
  });

  it('updates parametric wall settings', () => {
    const store = useEditorStore.getState();
    store.setWallSettings({ height: 0.8, thickness: 0.3, uvScale: 1.5 });

    const updated = useEditorStore.getState().wallSettings;
    expect(updated.height).toBe(0.8);
    expect(updated.thickness).toBe(0.3);
    expect(updated.uvScale).toBe(1.5);
  });

  it('manages wall selection, vertex mode, and finish wall to lock editing', () => {
    const store = useEditorStore.getState();
    store.addWallDraftPoint({ x: 0, y: 0, z: 0 });
    store.addWallDraftPoint({ x: 3, y: 0, z: 0 });
    const wallId = store.finishCurrentWall(false)!;

    // Wall creation automatically enters vertex mode (selectedWallId is set)
    expect(useEditorStore.getState().selectedWallId).toBe(wallId);

    // Clicking finish wall sets selectedWallId to null (exiting vertex mode)
    store.setSelectedWallId(null);
    expect(useEditorStore.getState().selectedWallId).toBeNull();

    // Selecting wall re-enters vertex mode and syncs wall settings
    store.setSelectedWallId(wallId);
    expect(useEditorStore.getState().selectedWallId).toBe(wallId);
  });

  it('toggles bastions and inserts gates into existing walls', () => {
    const store = useEditorStore.getState();
    store.addWallDraftPoint({ x: 0, y: 0, z: 0 });
    store.addWallDraftPoint({ x: 4, y: 0, z: 0 });
    const wallId = store.finishCurrentWall(false)!;

    // Toggle manual bastion on node 0
    store.toggleBastionOnNode(wallId, 0);
    let wall = useEditorStore.getState().walls.find((w) => w.id === wallId);
    expect(wall?.manualBastionIndices).toContain(0);

    // Toggle again removes it
    store.toggleBastionOnNode(wallId, 0);
    wall = useEditorStore.getState().walls.find((w) => w.id === wallId);
    expect(wall?.manualBastionIndices).not.toContain(0);

    // Add Maha Darwaza gate to segment 0
    store.addGateToWall(wallId, 0, 0.5);
    wall = useEditorStore.getState().walls.find((w) => w.id === wallId);
    expect(wall?.gates.length).toBe(1);
    expect(wall?.gates[0].segmentIndex).toBe(0);
    expect(wall?.gates[0].t).toBe(0.5);
  });

  it('integrates wall modifications into undo/redo stack', () => {
    const terrainStore = useTerrainStore.getState();
    const editorStore = useEditorStore.getState();

    // Snapshot before wall
    terrainStore.pushUndo();

    // Draw wall 1
    editorStore.addWallDraftPoint({ x: -2, y: 0, z: 0 });
    editorStore.addWallDraftPoint({ x: 2, y: 0, z: 0 });
    editorStore.finishCurrentWall(false);
    expect(useEditorStore.getState().walls.length).toBe(1);

    // Undo -> should restore to 0 walls
    terrainStore.undo();
    expect(useEditorStore.getState().walls.length).toBe(0);

    // Redo -> should restore the wall
    terrainStore.redo();
    expect(useEditorStore.getState().walls.length).toBe(1);
  });

  it('manages 3-step crafting stepper transitions', () => {
    const store = useEditorStore.getState();

    // Starts in layout step
    expect(store.wallStep).toBe('layout');

    // Add draft points and proceed to fortify
    store.addWallDraftPoint({ x: 0, y: 0, z: 0 });
    store.addWallDraftPoint({ x: 3, y: 0, z: 0 });
    store.addWallDraftPoint({ x: 3, y: 0, z: 3 });
    const wallId = store.proceedToFortify();

    expect(wallId).toBeDefined();
    expect(useEditorStore.getState().wallStep).toBe('fortify');
    expect(useEditorStore.getState().selectedWallId).toBe(wallId);
    expect(useEditorStore.getState().walls.length).toBe(1);

    // Solidify fort
    store.solidifyCurrentWall();
    expect(useEditorStore.getState().wallStep).toBe('solidified');
    expect(useEditorStore.getState().selectedWallId).toBeNull();

    // Start another circuit returns to layout
    store.startNewWallCircuit();
    expect(useEditorStore.getState().wallStep).toBe('layout');
    expect(useEditorStore.getState().activeWallDraft.length).toBe(0);
  });

  it('manages grand bastions and citadel keeps with undo/redo', () => {
    const terrainStore = useTerrainStore.getState();
    const store = useEditorStore.getState();

    // Snapshot
    terrainStore.pushUndo();

    // Build wall
    store.addWallDraftPoint({ x: 0, y: 0, z: 0 });
    store.addWallDraftPoint({ x: 5, y: 0, z: 0 });
    const wallId = store.finishCurrentWall(false)!;

    // Toggle Grand Bastion (Maha Buruj)
    store.toggleGrandBastionOnNode(wallId, 1);
    let wall = useEditorStore.getState().walls.find((w) => w.id === wallId);
    expect(wall?.grandBastionIndices).toContain(1);
    expect(wall?.manualBastionIndices).toContain(1);

    // Add Citadel Keep
    const keepId = store.addCitadelKeep({
      x: 1.5,
      y: 0.8,
      z: 2.0,
      scale: 1.2,
      rotationY: 0.5,
      height: 0.9,
    });
    expect(useEditorStore.getState().citadelKeeps.length).toBe(1);
    expect(useEditorStore.getState().citadelKeeps[0].id).toBe(keepId);

    // Update keep
    store.updateCitadelKeep(keepId, { scale: 1.5 });
    expect(useEditorStore.getState().citadelKeeps[0].scale).toBe(1.5);

    // Undo keep addition
    terrainStore.undo();
    expect(useEditorStore.getState().citadelKeeps.length).toBe(0);

    // Redo keep addition
    terrainStore.redo();
    expect(useEditorStore.getState().citadelKeeps.length).toBe(1);
  });
});

