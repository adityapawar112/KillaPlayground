import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../state/useEditorStore';
import { useTerrainStore } from '../terrain/terrainStore';
import { FoliageInstance } from './foliageTypes';

describe('useEditorStore - Foliage Integration', () => {
  beforeEach(() => {
    useEditorStore.setState({
      foliageInstances: [],
      selectedFoliageId: 'banyan_broad_canopy',
      selectedFoliageIds: ['banyan_broad_canopy'],
      foliageSelectMode: 'single',
      foliageSubTool: 'scatter',
      foliageBrushRadius: 1.0,
      foliageBrushDensity: 6,
    });
  });

  it('adds foliage instances correctly', () => {
    const mock1: FoliageInstance = {
      id: 'f1',
      typeId: 'berry_scrub_bush',
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    const mock2: FoliageInstance = {
      id: 'f2',
      typeId: 'banyan_broad_canopy',
      position: [1, 0.8, 1],
      rotation: [0, 1.2, 0],
      scale: [1.2, 1.2, 1.2],
    };

    useEditorStore.getState().addFoliageInstances([mock1, mock2]);
    expect(useEditorStore.getState().foliageInstances.length).toBe(2);
    expect(useEditorStore.getState().foliageInstances[0].id).toBe('f1');
  });

  it('removes specific foliage instances by ID', () => {
    const mock1: FoliageInstance = {
      id: 'f1',
      typeId: 'berry_scrub_bush',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    const mock2: FoliageInstance = {
      id: 'f2',
      typeId: 'banyan_broad_canopy',
      position: [1, 0, 1],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };

    useEditorStore.getState().addFoliageInstances([mock1, mock2]);
    useEditorStore.getState().removeFoliageInstances(['f1']);

    const remaining = useEditorStore.getState().foliageInstances;
    expect(remaining.length).toBe(1);
    expect(remaining[0].id).toBe('f2');
  });

  it('handles single-select and multi-select modes correctly', () => {
    const store = useEditorStore.getState();

    // Toggle mode
    store.setFoliageSelectMode('multi');
    expect(useEditorStore.getState().foliageSelectMode).toBe('multi');

    // Add multiple species
    store.toggleFoliageSelectedId('berry_scrub_bush');
    expect(useEditorStore.getState().selectedFoliageIds).toContain('berry_scrub_bush');
    expect(useEditorStore.getState().selectedFoliageIds).toContain('banyan_broad_canopy');

    store.toggleFoliageSelectedId('karvand_mountain_scrub');
    expect(useEditorStore.getState().selectedFoliageIds.length).toBe(3);

    // Toggle off one species
    store.toggleFoliageSelectedId('berry_scrub_bush');
    expect(useEditorStore.getState().selectedFoliageIds).not.toContain('berry_scrub_bush');
    expect(useEditorStore.getState().selectedFoliageIds.length).toBe(2);

    // Deselect all
    store.clearFoliageSelection();
    expect(useEditorStore.getState().selectedFoliageIds.length).toBe(0);
  });

  it('clears all foliage instances', () => {
    const mock1: FoliageInstance = {
      id: 'f1',
      typeId: 'berry_scrub_bush',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    useEditorStore.getState().addFoliageInstances([mock1]);
    expect(useEditorStore.getState().foliageInstances.length).toBe(1);

    useEditorStore.getState().clearAllFoliage();
    expect(useEditorStore.getState().foliageInstances.length).toBe(0);
  });

  it('records synchronous undo and redo snapshots across foliage changes', () => {
    const terrainStore = useTerrainStore.getState();

    // Baseline snapshot
    terrainStore.pushUndo();

    const mock: FoliageInstance = {
      id: 'f1',
      typeId: 'banyan_broad_canopy',
      position: [0, 0.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };

    useEditorStore.getState().addFoliageInstances([mock]);
    expect(useEditorStore.getState().foliageInstances.length).toBe(1);

    // Second snapshot
    terrainStore.pushUndo();

    useEditorStore.getState().clearAllFoliage();
    expect(useEditorStore.getState().foliageInstances.length).toBe(0);

    // Undo clear
    terrainStore.undo();
    expect(useEditorStore.getState().foliageInstances.length).toBe(1);
    expect(useEditorStore.getState().foliageInstances[0].id).toBe('f1');

    // Undo addition
    terrainStore.undo();
    expect(useEditorStore.getState().foliageInstances.length).toBe(0);

    // Redo addition
    terrainStore.redo();
    expect(useEditorStore.getState().foliageInstances.length).toBe(1);
  });
});
