import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from '../state/useEditorStore';
import { useTerrainStore } from '../terrain/terrainStore';

describe('useEditorStore - Spline Integration', () => {
  beforeEach(() => {
    // Reset store state
    useEditorStore.setState({
      splines: [],
      currentSplinePoints: [],
      isDrawingSpline: false,
      selectedSplineId: null,
      splineConversionType: 'steps',
    });
  });

  it('manages draft points lifecycle when drawing splines', () => {
    const store = useEditorStore.getState();
    store.startSpline();
    expect(useEditorStore.getState().isDrawingSpline).toBe(true);
    expect(useEditorStore.getState().currentSplinePoints).toEqual([]);

    store.addSplinePoint([0, 0, 0]);
    store.addSplinePoint([1, 0.5, 1]);
    expect(useEditorStore.getState().currentSplinePoints.length).toBe(2);

    store.cancelSpline();
    expect(useEditorStore.getState().isDrawingSpline).toBe(false);
    expect(useEditorStore.getState().currentSplinePoints).toEqual([]);
  });

  it('finishes a valid spline and records synchronous undo snapshot', () => {
    const pushUndoSpy = vi.spyOn(useTerrainStore.getState(), 'pushUndo');

    const store = useEditorStore.getState();
    store.startSpline();
    store.addSplinePoint([0, 0, 0]);
    store.addSplinePoint([1, 0.5, 1]);
    store.addSplinePoint([2, 1.0, 2]);

    const splineId = store.finishSpline('steps', { stepWidth: 0.8 });
    expect(splineId).toBeDefined();
    expect(pushUndoSpy).toHaveBeenCalled();

    const state = useEditorStore.getState();
    expect(state.splines.length).toBe(1);
    expect(state.splines[0].type).toBe('steps');
    expect(state.splines[0].settings?.stepWidth).toBe(0.8);
    expect(state.isDrawingSpline).toBe(false);
    expect(state.currentSplinePoints).toEqual([]);

    pushUndoSpy.mockRestore();
  });

  it('does not create a spline if fewer than 2 points are drawn', () => {
    const store = useEditorStore.getState();
    store.startSpline();
    store.addSplinePoint([0, 0, 0]);
    const id = store.finishSpline('flags');
    expect(id).toBeNull();
    expect(useEditorStore.getState().splines.length).toBe(0);
  });

  it('deletes an individual spline and calls pushUndo', () => {
    const pushUndoSpy = vi.spyOn(useTerrainStore.getState(), 'pushUndo');
    const store = useEditorStore.getState();

    store.startSpline();
    store.addSplinePoint([0, 0, 0]);
    store.addSplinePoint([1, 1, 1]);
    const id = store.finishSpline('flags');
    expect(useEditorStore.getState().splines.length).toBe(1);

    store.deleteSpline(id!);
    expect(useEditorStore.getState().splines.length).toBe(0);
    expect(pushUndoSpy).toHaveBeenCalled();

    pushUndoSpy.mockRestore();
  });

  it('updates spline conversion type and settings with undo protection', () => {
    const pushUndoSpy = vi.spyOn(useTerrainStore.getState(), 'pushUndo');
    const store = useEditorStore.getState();

    store.startSpline();
    store.addSplinePoint([0, 0, 0]);
    store.addSplinePoint([1, 1, 1]);
    const id = store.finishSpline('steps');

    store.updateSplineType(id!, 'diyas');
    expect(useEditorStore.getState().splines[0].type).toBe('diyas');

    store.updateSplineSettings(id!, { spacing: 0.5 });
    expect(useEditorStore.getState().splines[0].settings?.spacing).toBe(0.5);

    expect(pushUndoSpy).toHaveBeenCalledTimes(3); // 1 create + 1 update type + 1 update settings
    pushUndoSpy.mockRestore();
  });

  it('clears all splines and triggers pushUndo', () => {
    const pushUndoSpy = vi.spyOn(useTerrainStore.getState(), 'pushUndo');
    const store = useEditorStore.getState();

    store.startSpline();
    store.addSplinePoint([0, 0, 0]);
    store.addSplinePoint([1, 1, 1]);
    store.finishSpline('steps');

    store.clearAllSplines();
    expect(useEditorStore.getState().splines.length).toBe(0);
    expect(pushUndoSpy).toHaveBeenCalled();

    pushUndoSpy.mockRestore();
  });
});

