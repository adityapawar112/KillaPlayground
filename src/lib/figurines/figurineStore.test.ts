import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore, SavedProjectSchema } from '../state/useEditorStore';
import { useTerrainStore } from '../terrain/terrainStore';

describe('Figurine State Management in Editor Store', () => {
  beforeEach(() => {
    const store = useEditorStore.getState();
    store.clearAllProps();
    store.setPropSubTool('place');
    store.setSelectedPropType('warrior');
    store.setSelectedPropId(null);
    store.setPropPlacementScale(1.0);
    store.setPropPlacementRotation(0);
    store.setPropRandomRotation(false);
    store.setPropNormalAlign(0.0);
    store.setPropElevationOffset(0.0);
  });

  it('initializes with default figurine settings', () => {
    const state = useEditorStore.getState();
    expect(state.propSubTool).toBe('place');
    expect(state.selectedPropType).toBe('warrior');
    expect(state.selectedPropId).toBeNull();
    expect(state.placedProps).toEqual([]);
    expect(state.propPlacementScale).toBe(1.0);
    expect(state.propPlacementRotation).toBe(0);
    expect(state.propRandomRotation).toBe(false);
  });

  it('transitions between subtool modes cleanly', () => {
    const store = useEditorStore.getState();
    store.setPropSubTool('select');
    expect(useEditorStore.getState().propSubTool).toBe('select');

    store.setPropSubTool('transform');
    expect(useEditorStore.getState().propSubTool).toBe('transform');

    store.setPropSubTool('erase');
    expect(useEditorStore.getState().propSubTool).toBe('erase');

    store.setPropSubTool('place');
    expect(useEditorStore.getState().propSubTool).toBe('place');
  });

  it('correctly records undo and redo for figurine placement and removal', () => {
    const terrainStore = useTerrainStore.getState();
    const editorStore = useEditorStore.getState();

    expect(editorStore.placedProps.length).toBe(0);

    const id1 = editorStore.addProp({
      type: 'warrior',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
    expect(useEditorStore.getState().placedProps.length).toBe(1);

    const id2 = editorStore.addProp({
      type: 'spearman',
      position: [1, 0, 1],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
    expect(useEditorStore.getState().placedProps.length).toBe(2);

    // Undo second addition
    const didUndo1 = terrainStore.undo();
    expect(didUndo1).toBe(true);
    expect(useEditorStore.getState().placedProps.length).toBe(1);
    expect(useEditorStore.getState().placedProps[0].id).toBe(id1);

    // Undo first addition
    const didUndo2 = terrainStore.undo();
    expect(didUndo2).toBe(true);
    expect(useEditorStore.getState().placedProps.length).toBe(0);

    // Redo first addition
    const didRedo1 = terrainStore.redo();
    expect(didRedo1).toBe(true);
    expect(useEditorStore.getState().placedProps.length).toBe(1);
    expect(useEditorStore.getState().placedProps[0].id).toBe(id1);

    // Redo second addition
    const didRedo2 = terrainStore.redo();
    expect(didRedo2).toBe(true);
    expect(useEditorStore.getState().placedProps.length).toBe(2);

    // Remove first prop
    useEditorStore.getState().removeProp(id1);
    expect(useEditorStore.getState().placedProps.length).toBe(1);
    expect(useEditorStore.getState().placedProps[0].id).toBe(id2);

    // Undo removal
    terrainStore.undo();
    expect(useEditorStore.getState().placedProps.length).toBe(2);
  });

  it('adds, updates, and removes placed figurines', () => {
    const store = useEditorStore.getState();
    const id = store.addProp({
      type: 'warrior',
      position: [1.0, 0.5, -2.0],
      rotation: [0, Math.PI / 4, 0],
      scale: [1, 1, 1],
    });

    let state = useEditorStore.getState();
    expect(state.placedProps.length).toBe(1);
    expect(state.placedProps[0].id).toBe(id);
    expect(state.placedProps[0].type).toBe('warrior');
    expect(state.selectedPropId).toBe(id);

    // Update transform
    store.updatePropTransform(id, {
      position: [1.5, 0.6, -2.2],
      scale: [1.2, 1.2, 1.2],
    });

    state = useEditorStore.getState();
    expect(state.placedProps[0].position).toEqual([1.5, 0.6, -2.2]);
    expect(state.placedProps[0].scale).toEqual([1.2, 1.2, 1.2]);

    // Remove
    store.removeProp(id);
    state = useEditorStore.getState();
    expect(state.placedProps.length).toBe(0);
    expect(state.selectedPropId).toBeNull();
  });

  it('duplicates an existing figurine with spatial offset', () => {
    const store = useEditorStore.getState();
    const id = store.addProp({
      type: 'king_throne',
      position: [0.0, 0.4, 0.0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });

    const dupId = store.duplicateProp(id);
    expect(dupId).toBeDefined();

    const state = useEditorStore.getState();
    expect(state.placedProps.length).toBe(2);
    expect(state.selectedPropId).toBe(dupId);

    const dup = state.placedProps.find((p) => p.id === dupId);
    expect(dup?.type).toBe('king_throne');
    expect(dup?.position[0]).toBeCloseTo(0.25);
    expect(dup?.position[2]).toBeCloseTo(0.25);
  });

  it('clears all placed figurines', () => {
    const store = useEditorStore.getState();
    store.addProp({ type: 'warrior', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });
    store.addProp({ type: 'spearman', position: [1, 0, 1], rotation: [0, 0, 0], scale: [1, 1, 1] });

    expect(useEditorStore.getState().placedProps.length).toBe(2);
    store.clearAllProps();
    expect(useEditorStore.getState().placedProps.length).toBe(0);
    expect(useEditorStore.getState().selectedPropId).toBeNull();
  });

  it('clamps and updates placement parameter sliders', () => {
    const store = useEditorStore.getState();

    store.setPropPlacementScale(2.5);
    expect(useEditorStore.getState().propPlacementScale).toBe(2.5);
    store.setPropPlacementScale(0.1); // below min 0.2
    expect(useEditorStore.getState().propPlacementScale).toBe(0.2);

    store.setPropPlacementRotation(400); // 400 % 360 = 40
    expect(useEditorStore.getState().propPlacementRotation).toBe(40);

    store.setPropNormalAlign(0.85);
    expect(useEditorStore.getState().propNormalAlign).toBe(0.85);

    store.setPropElevationOffset(0.15);
    expect(useEditorStore.getState().propElevationOffset).toBe(0.15);

    store.setPropEraseRadius(1.5);
    expect(useEditorStore.getState().propEraseRadius).toBe(1.5);
    store.setPropEraseRadius(0.05); // below min 0.2
    expect(useEditorStore.getState().propEraseRadius).toBe(0.2);
    store.setPropEraseRadius(5.0); // above max 3.0
    expect(useEditorStore.getState().propEraseRadius).toBe(3.0);
  });

  it('supports batch removal of props via removeProps with undo support', () => {
    const terrainStore = useTerrainStore.getState();
    const editorStore = useEditorStore.getState();

    const id1 = editorStore.addProp({ type: 'warrior', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });
    const id2 = editorStore.addProp({ type: 'spearman', position: [0.2, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });
    const id3 = editorStore.addProp({ type: 'fan_blower', position: [5, 0, 5], rotation: [0, 0, 0], scale: [1, 1, 1] });

    expect(useEditorStore.getState().placedProps.length).toBe(3);

    // Batch remove id1 and id2
    useEditorStore.getState().removeProps([id1, id2]);
    expect(useEditorStore.getState().placedProps.length).toBe(1);
    expect(useEditorStore.getState().placedProps[0].id).toBe(id3);

    // Undo restores both props
    terrainStore.undo();
    expect(useEditorStore.getState().placedProps.length).toBe(3);
  });

  it('validates project payload containing placedProps with SavedProjectSchema', () => {
    const validPayload = {
      fortTitle: 'Sinhagad Assault',
      builderName: 'Tanaji Malusare',
      templateId: 'sinhagad',
      splines: [],
      placedProps: [
        {
          id: 'prop_test_01',
          type: 'warrior',
          position: [2.5, 0.8, -1.2],
          rotation: [0, 1.57, 0],
          scale: [1, 1, 1],
        },
      ],
    };

    const parsed = SavedProjectSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.placedProps.length).toBe(1);
      expect(parsed.data.placedProps[0].type).toBe('warrior');
    }
  });
});

