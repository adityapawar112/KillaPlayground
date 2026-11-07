import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../state/useEditorStore';
import { useTerrainStore } from '../terrain/terrainStore';

describe('Lighting State Management in Editor Store', () => {
  beforeEach(() => {
    const store = useEditorStore.getState();
    store.clearAllLights();
    store.setLightingSubTool('place');
    store.setSelectedLightType('diya_clay_01');
    store.setSelectedLightId(null);
    store.setLightPlacementScale(1.0);
    store.setLightPlacementRotation(0);
    store.setLightRandomRotation(false);
    store.setLightRandomBurstHeight(false);
    store.setLightBurstHeight(1.0);
    store.setLightNormalAlign(0.0);
    store.setLightElevationOffset(0.0);
  });

  it('initializes with default lighting settings', () => {
    const state = useEditorStore.getState();
    expect(state.lightingSubTool).toBe('place');
    expect(state.selectedLightType).toBe('diya_clay_01');
    expect(state.selectedLightId).toBeNull();
    expect(state.placedLights).toEqual([]);
    expect(state.lightPlacementScale).toBe(1.0);
    expect(state.lightPlacementRotation).toBe(0);
    expect(state.lightRandomRotation).toBe(false);
    expect(state.lightRandomBurstHeight).toBe(false);
    expect(state.lightBurstHeight).toBe(1.0);
  });

  it('transitions between all 4 subtool modes cleanly (place, select, transform, erase)', () => {
    const store = useEditorStore.getState();
    store.setLightingSubTool('select');
    expect(useEditorStore.getState().lightingSubTool).toBe('select');

    store.setLightingSubTool('transform');
    expect(useEditorStore.getState().lightingSubTool).toBe('transform');

    store.setLightingSubTool('erase');
    expect(useEditorStore.getState().lightingSubTool).toBe('erase');

    store.setLightingSubTool('place');
    expect(useEditorStore.getState().lightingSubTool).toBe('place');
  });

  it('adds, updates, and removes placed lights with full undo and redo', () => {
    const terrainStore = useTerrainStore.getState();
    const editorStore = useEditorStore.getState();

    expect(editorStore.placedLights.length).toBe(0);

    const id1 = editorStore.addLight({
      type: 'diya_clay_01',
      category: 'diyas_clay',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
    expect(useEditorStore.getState().placedLights.length).toBe(1);

    const id2 = editorStore.addLight({
      type: 'anaar_saffron',
      category: 'fireworks',
      position: [1, 0, 1],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      colorTheme: 'saffron',
    });
    expect(useEditorStore.getState().placedLights.length).toBe(2);

    // Undo second addition
    const didUndo1 = terrainStore.undo();
    expect(didUndo1).toBe(true);
    expect(useEditorStore.getState().placedLights.length).toBe(1);
    expect(useEditorStore.getState().placedLights[0].id).toBe(id1);

    // Redo second addition
    const didRedo1 = terrainStore.redo();
    expect(didRedo1).toBe(true);
    expect(useEditorStore.getState().placedLights.length).toBe(2);

    // Remove first light
    useEditorStore.getState().removeLight(id1);
    expect(useEditorStore.getState().placedLights.length).toBe(1);
    expect(useEditorStore.getState().placedLights[0].id).toBe(id2);

    // Undo removal
    terrainStore.undo();
    expect(useEditorStore.getState().placedLights.length).toBe(2);
  });

  it('duplicates placed lights with offset', () => {
    const store = useEditorStore.getState();
    const id = store.addLight({
      type: 'skyshot_peony',
      category: 'fireworks',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      colorTheme: 'peony',
    });

    const dupId = store.duplicateLight(id);
    expect(dupId).toBeDefined();
    expect(useEditorStore.getState().placedLights.length).toBe(2);

    const dup = useEditorStore.getState().placedLights.find((l) => l.id === dupId);
    expect(dup).toBeDefined();
    expect(dup?.position[0]).toBeCloseTo(0.2);
    expect(dup?.position[2]).toBeCloseTo(0.2);
  });

  it('triggers test firework event', () => {
    const store = useEditorStore.getState();
    const id = store.addLight({
      type: 'anaar_gold',
      category: 'fireworks',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });

    store.triggerTestFirework(id);
    const trigger = useEditorStore.getState().testFireworkTrigger;
    expect(trigger).toBeDefined();
    expect(trigger?.id).toBe(id);
    expect(trigger?.timestamp).toBeGreaterThan(0);
  });

  it('supports adjusting burstHeight on placed fireworks', () => {
    const store = useEditorStore.getState();
    const id = store.addLight({
      type: 'skyshot_peony',
      category: 'fireworks',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      burstHeight: 1.0,
      colorTheme: 'peony',
    });

    store.updateLightTransform(id, { burstHeight: 1.8 });
    const updated = useEditorStore.getState().placedLights.find((l) => l.id === id);
    expect(updated?.burstHeight).toBe(1.8);
  });

  it('supports random burst height toggle when placing fireworks', () => {
    const store = useEditorStore.getState();
    store.setLightRandomBurstHeight(true);
    expect(useEditorStore.getState().lightRandomBurstHeight).toBe(true);

    const fwId = store.addLight({
      type: 'anaar_saffron',
      category: 'fireworks',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      colorTheme: 'saffron',
    });

    const placed = useEditorStore.getState().placedLights.find((l) => l.id === fwId);
    expect(placed).toBeDefined();
    expect(placed?.burstHeight).toBeDefined();
    // Should be in randomized range 0.60m to 2.40m
    expect(placed!.burstHeight!).toBeGreaterThanOrEqual(0.6);
    expect(placed!.burstHeight!).toBeLessThanOrEqual(2.4);

    // When disabled, uses lightBurstHeight
    store.setLightRandomBurstHeight(false);
    store.setLightBurstHeight(1.5);
    const fwId2 = store.addLight({
      type: 'anaar_saffron',
      category: 'fireworks',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      colorTheme: 'saffron',
    });
    const placed2 = useEditorStore.getState().placedLights.find((l) => l.id === fwId2);
    expect(placed2?.burstHeight).toBe(1.5);
  });

  it('manages time of day and celestial sun/moon direction properties', () => {
    const store = useEditorStore.getState();

    // Default daytime state
    store.setTimeOfDay(14.0);
    expect(useEditorStore.getState().timeOfDay).toBe(14.0);
    expect(useEditorStore.getState().nightMode).toBe(false);

    // Solar noon preset
    store.setSunDirectionPreset('noon');
    let state = useEditorStore.getState();
    expect(state.timeOfDay).toBe(12.0);
    expect(state.sunElevation).toBe(75);
    expect(state.sunAzimuth).toBe(180);
    expect(state.nightMode).toBe(false);

    // Sunset / Golden Hour preset (30 mins before sunset, 20 deg elevation)
    store.setSunDirectionPreset('sunset');
    state = useEditorStore.getState();
    expect(state.timeOfDay).toBe(17.5);
    expect(state.sunElevation).toBe(20);
    expect(state.nightMode).toBe(false);

    // Diwali Night preset
    store.setSunDirectionPreset('night');
    state = useEditorStore.getState();
    expect(state.timeOfDay).toBe(21.0);
    expect(state.nightMode).toBe(true);

    // Direct elevation and azimuth adjustments
    store.setSunElevation(35);
    store.setSunAzimuth(120);
    expect(useEditorStore.getState().sunElevation).toBe(35);
    expect(useEditorStore.getState().sunAzimuth).toBe(120);

    // Automatic day/night toggling via timeOfDay
    store.setTimeOfDay(22.0);
    expect(useEditorStore.getState().nightMode).toBe(true);

    store.setTimeOfDay(10.0);
    expect(useEditorStore.getState().nightMode).toBe(false);
  });
});

