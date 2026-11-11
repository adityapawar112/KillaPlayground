import { describe, it, expect } from 'vitest';
import { useEditorStore } from '../../lib/state/useEditorStore';

describe('Poster Studio Access, Presentation Bar & Mobile UI Refinements', () => {
  it('1. useEditorStore persists activeCameraPreset across view cycles', () => {
    const store = useEditorStore.getState();
    expect(store.activeCameraPreset).toBeDefined();

    store.setCameraViewPreset('top');
    expect(useEditorStore.getState().activeCameraPreset).toBe('top');

    store.setCameraViewPreset('rampart');
    expect(useEditorStore.getState().activeCameraPreset).toBe('rampart');

    store.setCameraViewPreset('reset');
    expect(useEditorStore.getState().activeCameraPreset).toBe('reset');

    store.setCameraViewPreset('isometric');
    expect(useEditorStore.getState().activeCameraPreset).toBe('isometric');
  });

  it('2. Mobile Presentation Vertical Bar correctly cycles using activeCameraPreset', () => {
    const PRESETS = [
      { id: 'isometric' as const, label: 'Iso' },
      { id: 'top' as const, label: 'Top' },
      { id: 'rampart' as const, label: 'Rampart' },
      { id: 'reset' as const, label: 'Home' },
    ];

    useEditorStore.getState().setCameraViewPreset('isometric');

    for (let i = 0; i < 4; i++) {
      const currentActive = useEditorStore.getState().activeCameraPreset;
      const currentIdx = Math.max(0, PRESETS.findIndex((p) => p.id === currentActive));
      const nextPreset = PRESETS[(currentIdx + 1) % PRESETS.length];

      useEditorStore.getState().setCameraViewPreset(nextPreset.id);
      expect(useEditorStore.getState().activeCameraPreset).toBe(nextPreset.id);
    }

    // Verify it completed a full cycle back to isometric
    expect(useEditorStore.getState().activeCameraPreset).toBe('isometric');
  });

  it('3. Poster Studio modal state is controlled via setPosterModalOpen', () => {
    const store = useEditorStore.getState();
    expect(store.isPosterModalOpen).toBe(false);

    store.setPosterModalOpen(true);
    expect(useEditorStore.getState().isPosterModalOpen).toBe(true);

    store.setPosterModalOpen(false);
    expect(useEditorStore.getState().isPosterModalOpen).toBe(false);
  });
});
