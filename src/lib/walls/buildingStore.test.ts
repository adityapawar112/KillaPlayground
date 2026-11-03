import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore, SavedProjectSchema } from '../state/useEditorStore';
import { useTerrainStore } from '../terrain/terrainStore';

describe('Building Store & State Integration (Ticket 09)', () => {
  beforeEach(() => {
    useEditorStore.setState({
      activeTool: 'building',
      buildingMode: 'walls',
      walls: [],
      foundations: [],
      stairs: [],
      splines: [],
      selectedWallId: null,
      selectedFoundationId: null,
      selectedStairId: null,
      activeWallDraft: [],
      activeFoundationDraft: null,
      activeStairDraft: [],
    });
  });

  it('supports 5 operational mode transitions with state synchronization', () => {
    const store = useEditorStore.getState();

    // Default mode is 'walls'
    expect(useEditorStore.getState().buildingMode).toBe('walls');
    expect(useEditorStore.getState().wallMode).toBe('draw');

    // Switch to 'foundation'
    store.setBuildingMode('foundation');
    expect(useEditorStore.getState().buildingMode).toBe('foundation');

    // Switch to 'stairs'
    store.setBuildingMode('stairs');
    expect(useEditorStore.getState().buildingMode).toBe('stairs');

    // Switch to 'fortifications'
    store.setBuildingMode('fortifications');
    expect(useEditorStore.getState().buildingMode).toBe('fortifications');
    expect(useEditorStore.getState().wallMode).toBe('fortify');

    // Switch to 'select'
    store.setBuildingMode('select');
    expect(useEditorStore.getState().buildingMode).toBe('select');
    expect(useEditorStore.getState().wallMode).toBe('select');
  });

  it('adds, updates, and deletes Foundation slabs with undo/redo integration', () => {
    const terrainStore = useTerrainStore.getState();
    const editorStore = useEditorStore.getState();

    terrainStore.pushUndo();

    const id = editorStore.addFoundation({
      name: 'Main Bastion Deck',
      x: 1.5,
      z: 2.0,
      y: 0.3,
      length: 3.0,
      width: 2.5,
      height: 0.4,
      verticalOffset: 0.1,
      tilingRepeat: 3.0,
    });

    expect(id).toBeDefined();
    let foundations = useEditorStore.getState().foundations;
    expect(foundations.length).toBe(1);
    expect(foundations[0].id).toBe(id);
    expect(foundations[0].length).toBe(3.0);
    expect(useEditorStore.getState().selectedFoundationId).toBe(id);

    // Update foundation properties
    editorStore.updateFoundation(id, { height: 0.8, verticalOffset: 0.2 });
    foundations = useEditorStore.getState().foundations;
    expect(foundations[0].height).toBe(0.8);
    expect(foundations[0].verticalOffset).toBe(0.2);

    // Test Undo restores state before foundation creation
    terrainStore.undo();
    expect(useEditorStore.getState().foundations.length).toBe(0);

    // Test Redo brings foundation back
    terrainStore.redo();
    expect(useEditorStore.getState().foundations.length).toBe(1);

    // Delete foundation
    editorStore.deleteFoundation(id);
    expect(useEditorStore.getState().foundations.length).toBe(0);
    expect(useEditorStore.getState().selectedFoundationId).toBeNull();
  });

  it('manages stone stairs lifecycle and synchronization with splines', () => {
    const terrainStore = useTerrainStore.getState();
    const editorStore = useEditorStore.getState();

    terrainStore.pushUndo();

    editorStore.startStairs();
    expect(useEditorStore.getState().isDrawingStairs).toBe(true);

    editorStore.addStairPoint([0, 0, 0]);
    editorStore.addStairPoint([0, 0.5, 1.0]);
    editorStore.addStairPoint([0, 1.0, 2.0]);
    expect(useEditorStore.getState().activeStairDraft.length).toBe(3);

    const stairId = editorStore.finishStairs({ stepWidth: 0.2, stepSpacing: 0.04 });
    expect(stairId).toBeDefined();
    expect(useEditorStore.getState().stairs.length).toBe(1);
    expect(useEditorStore.getState().isDrawingStairs).toBe(false);

    const stair = useEditorStore.getState().stairs[0];
    expect(stair.points.length).toBe(3);
    expect(stair.settings?.stepWidth).toBe(0.2);

    // Mirrored into splines for backwards compatibility
    expect(useEditorStore.getState().splines.length).toBe(1);
    expect(useEditorStore.getState().splines[0].type).toBe('steps');

    // Update stair settings
    editorStore.updateStairSettings(stairId!, { stepOffset: 0.05 });
    expect(useEditorStore.getState().stairs[0].settings?.stepOffset).toBe(0.05);

    // First undo reverts stair settings update
    terrainStore.undo();
    expect(useEditorStore.getState().stairs[0].settings?.stepOffset).toBe(0.0);

    // Second undo reverts stair creation
    terrainStore.undo();
    expect(useEditorStore.getState().stairs.length).toBe(0);

    // Redo restores stairs
    terrainStore.redo();
    expect(useEditorStore.getState().stairs.length).toBe(1);
  });

  it('serializes and deserializes projects with foundations, stairs, and backward compatibility', () => {
    const store = useEditorStore.getState();

    store.addFoundation({
      name: 'Courtyard Base',
      x: 0,
      z: 0,
      y: 0,
      length: 4.0,
      width: 4.0,
      height: 0.5,
      verticalOffset: 0,
      tilingRepeat: 4.0,
    });

    store.startStairs();
    store.addStairPoint([0, 0, 0]);
    store.addStairPoint([1, 1, 1]);
    store.finishStairs();

    const exportedStr = store.exportProjectData();
    const parsed = JSON.parse(exportedStr);

    expect(parsed.foundations).toBeDefined();
    expect(parsed.foundations.length).toBe(1);
    expect(parsed.stairs).toBeDefined();
    expect(parsed.stairs.length).toBe(1);

    // Validate with SavedProjectSchema
    const schemaValidation = SavedProjectSchema.safeParse(parsed);
    expect(schemaValidation.success).toBe(true);

    // Test backward compatibility: importing older project with only splines of type 'steps'
    const legacyProject = {
      version: '1.0.0',
      fortTitle: 'Old Fort',
      builderName: 'Mavala',
      templateId: 'raigad',
      walls: [],
      splines: [
        {
          id: 'legacy_steps_1',
          name: 'Old Staircase',
          points: [[0, 0, 0], [2, 1, 2]],
          type: 'steps',
          settings: { stepWidth: 0.15 },
        },
      ],
      placedProps: [],
    };

    const importSuccess = store.importProjectData(JSON.stringify(legacyProject));
    expect(importSuccess).toBe(true);
    expect(useEditorStore.getState().stairs.length).toBe(1);
    expect(useEditorStore.getState().stairs[0].name).toBe('Old Staircase');
  });
});
