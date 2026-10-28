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
    store.setWallSettings({ height: 2.8, thickness: 0.6, uvScale: 1.5 });

    const updated = useEditorStore.getState().wallSettings;
    expect(updated.height).toBe(2.8);
    expect(updated.thickness).toBe(0.6);
    expect(updated.uvScale).toBe(1.5);
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
});

