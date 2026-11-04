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

    // First Undo reverts foundation update
    terrainStore.undo();
    foundations = useEditorStore.getState().foundations;
    expect(foundations[0].height).toBe(0.4);

    // Second Undo restores state before foundation creation
    terrainStore.undo();
    expect(useEditorStore.getState().foundations.length).toBe(0);

    // Redo brings foundation back
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
    expect(useEditorStore.getState().stairs[0].settings?.scale).toBe(2.0);

    // Update stair scale
    editorStore.updateStairSettings(stairId!, { scale: 3.5 });
    expect(useEditorStore.getState().stairs[0].settings?.scale).toBe(3.5);
  });

  it('handles foundation height extrusion drafting phases and limits', () => {
    const store = useEditorStore.getState();

    // Start in base phase
    store.setActiveFoundationDraft({
      x1: 0,
      z1: 0,
      x2: 2.0,
      z2: 1.5,
      y: 0.1,
      phase: 'base',
    });
    expect(useEditorStore.getState().activeFoundationDraft?.phase).toBe('base');

    // Transition to height extrusion phase
    store.setActiveFoundationDraft({
      ...useEditorStore.getState().activeFoundationDraft!,
      phase: 'height',
      height: 0.40,
      startPointerY: 400,
    });
    expect(useEditorStore.getState().activeFoundationDraft?.phase).toBe('height');
    expect(useEditorStore.getState().activeFoundationDraft?.height).toBe(0.40);

    // Extrude height up to a high limit (e.g. 15.0m)
    store.setActiveFoundationDraft({
      ...useEditorStore.getState().activeFoundationDraft!,
      height: 15.0,
    });
    expect(useEditorStore.getState().activeFoundationDraft?.height).toBe(15.0);
  });

  it('manages Round Bastions (Ardhagol Buruj) on walls with full CRUD', () => {
    const store = useEditorStore.getState();

    // Create a wall
    store.addWallDraftPoint({ x: 0, y: 0, z: 0 });
    store.addWallDraftPoint({ x: 5, y: 0, z: 0 });
    const wallId = store.finishCurrentWall();
    expect(wallId).toBeDefined();

    // Add round bastion
    const rbId = store.addRoundBastionToWall(wallId!, 0, 0.5, { radius: 0.25 });
    expect(rbId).toBeDefined();

    let wall = useEditorStore.getState().walls.find((w) => w.id === wallId);
    expect(wall?.roundBastions).toBeDefined();
    expect(wall?.roundBastions?.length).toBe(1);
    expect(wall?.roundBastions?.[0].radius).toBe(0.25);
    expect(wall?.roundBastions?.[0].t).toBe(0.5);

    // Update properties
    store.updateRoundBastionProperties(wallId!, rbId!, {
      radius: 0.35,
      heightOffset: 0.12,
      flipSide: true,
    });
    wall = useEditorStore.getState().walls.find((w) => w.id === wallId);
    expect(wall?.roundBastions?.[0].radius).toBe(0.35);
    expect(wall?.roundBastions?.[0].heightOffset).toBe(0.12);
    expect(wall?.roundBastions?.[0].flipSide).toBe(true);

    // Update name
    store.updateRoundBastionName(wallId!, rbId!, 'Western Ardhagol Buruj');
    wall = useEditorStore.getState().walls.find((w) => w.id === wallId);
    expect(wall?.roundBastions?.[0].name).toBe('Western Ardhagol Buruj');

    // Remove round bastion
    store.removeRoundBastionFromWall(wallId!, rbId!);
    wall = useEditorStore.getState().walls.find((w) => w.id === wallId);
    expect(wall?.roundBastions?.length).toBe(0);
  });

  it('enforces mutually exclusive selections across walls, fortifications, foundations, and stairs', () => {
    const store = useEditorStore.getState();

    store.setSelectedWallId('wall_1');
    expect(useEditorStore.getState().selectedWallId).toBe('wall_1');
    expect(useEditorStore.getState().selectedFoundationId).toBeNull();
    expect(useEditorStore.getState().selectedStairId).toBeNull();

    store.setSelectedFoundationId('found_1');
    expect(useEditorStore.getState().selectedFoundationId).toBe('found_1');
    expect(useEditorStore.getState().selectedWallId).toBeNull();
    expect(useEditorStore.getState().selectedStairId).toBeNull();

    store.setSelectedStairId('stair_1');
    expect(useEditorStore.getState().selectedStairId).toBe('stair_1');
    expect(useEditorStore.getState().selectedFoundationId).toBeNull();
    expect(useEditorStore.getState().selectedWallId).toBeNull();

    store.setSelectedComponent({ type: 'round_bastion', idOrIndex: 'rb_1', wallId: 'wall_1' });
    expect(useEditorStore.getState().selectedComponent?.type).toBe('round_bastion');
    expect(useEditorStore.getState().selectedFoundationId).toBeNull();
    expect(useEditorStore.getState().selectedStairId).toBeNull();
  });

  it('clears foundations and stairs on resetScene', () => {
    const store = useEditorStore.getState();

    store.addFoundation({
      name: 'Test Slab',
      x: 0,
      z: 0,
      y: 0,
      length: 2,
      width: 2,
      height: 0.4,
      verticalOffset: 0,
      tilingRepeat: 2,
    });
    store.startStairs();
    store.addStairPoint([0, 0, 0]);
    store.addStairPoint([1, 1, 1]);
    store.finishStairs();

    expect(useEditorStore.getState().foundations.length).toBe(1);
    expect(useEditorStore.getState().stairs.length).toBe(1);

    store.resetScene();

    expect(useEditorStore.getState().foundations.length).toBe(0);
    expect(useEditorStore.getState().stairs.length).toBe(0);
    expect(useEditorStore.getState().selectedFoundationId).toBeNull();
    expect(useEditorStore.getState().selectedStairId).toBeNull();
    expect(useEditorStore.getState().activeFoundationDraft).toBeNull();
    expect(useEditorStore.getState().activeStairDraft.length).toBe(0);
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
