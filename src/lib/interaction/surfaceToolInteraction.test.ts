import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as THREE from 'three';
import { handleStructurePointerDown, handleStructurePointerMove } from './surfaceToolInteraction';
import { useEditorStore } from '../state/useEditorStore';
import { useTerrainStore } from '../terrain/terrainStore';

describe('surfaceToolInteraction', () => {
  let mockEvent: any;
  let invalidateMock: any;

  beforeEach(() => {
    if (typeof (globalThis as any).window === 'undefined') {
      (globalThis as any).window = globalThis;
    }
    useEditorStore.setState({
      activeTool: 'terrain',
      splineMode: 'select',
      isDrawingSpline: false,
      currentSplinePoints: [],
      foliageInstances: [],
      selectedFoliageId: 'banyan_broad_canopy',
      selectedFoliageIds: ['banyan_broad_canopy'],
      foliageSubTool: 'scatter',
      selectedTextureId: 'dirt_01',
      paintSubTool: 'brush',
    });

    invalidateMock = vi.fn();
    (window as any).__orbitControls = { enabled: true };

    mockEvent = {
      button: 0,
      buttons: 1,
      altKey: false,
      point: new THREE.Vector3(1, 0.5, 1),
      face: { normal: new THREE.Vector3(0, 1, 0) },
      stopPropagation: vi.fn(),
    };
  });

  it('ignores non-left click or alt-click', () => {
    mockEvent.button = 1;
    const handled = handleStructurePointerDown(mockEvent, invalidateMock);
    expect(handled).toBe(false);
    expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
  });

  it('handles spline tool drawing on structures without orbiting', () => {
    useEditorStore.setState({ activeTool: 'spline', splineMode: 'draw' });

    const handled = handleStructurePointerDown(mockEvent, invalidateMock);
    expect(handled).toBe(true);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect((window as any).__orbitControls.enabled).toBe(false);
    expect(useEditorStore.getState().currentSplinePoints.length).toBe(1);
    expect(useEditorStore.getState().currentSplinePoints[0]).toEqual([1, 0.5, 1]);
    expect(invalidateMock).toHaveBeenCalled();
  });

  it('handles texture painting on structures without orbiting', () => {
    useEditorStore.setState({ activeTool: 'texture', paintSubTool: 'brush' });

    const handled = handleStructurePointerDown(mockEvent, invalidateMock);
    expect(handled).toBe(true);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect((window as any).__orbitControls.enabled).toBe(false);
    expect(invalidateMock).toHaveBeenCalled();
  });

  it('handles foliage hero single placement on structures without orbiting', () => {
    useEditorStore.setState({
      activeTool: 'foliage',
      foliageSubTool: 'single',
      selectedFoliageId: 'banyan_broad_canopy',
    });

    const handled = handleStructurePointerDown(mockEvent, invalidateMock);
    expect(handled).toBe(true);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect((window as any).__orbitControls.enabled).toBe(false);
    expect(useEditorStore.getState().foliageInstances.length).toBe(1);
    expect(useEditorStore.getState().foliageInstances[0].position).toEqual([1, 0.5, 1]);
    expect(invalidateMock).toHaveBeenCalled();
  });

  it('handles foliage scatter dragging on structures without orbiting', () => {
    useEditorStore.setState({
      activeTool: 'foliage',
      foliageSubTool: 'scatter',
      selectedFoliageId: 'banyan_broad_canopy',
      selectedFoliageIds: ['banyan_broad_canopy'],
      foliageBrushRadius: 1.0,
      foliageBrushDensity: 5,
    });

    const handled = handleStructurePointerDown(mockEvent, invalidateMock);
    expect(handled).toBe(true);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect((window as any).__orbitControls.enabled).toBe(false);

    // Pointer move while dragging
    mockEvent.point = new THREE.Vector3(1.2, 0.5, 1.2);
    const moveHandled = handleStructurePointerMove(mockEvent, invalidateMock);
    expect(moveHandled).toBe(true);
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });

  it('collapses and expands all panels properly', () => {
    const store = useEditorStore.getState();

    // Collapse
    store.collapseAllPanels();
    let state = useEditorStore.getState();
    expect(state.isMobileSidebarMinimized).toBe(true);
    expect(state.isToolModeMinimized).toBe(true);
    expect(state.isRightSidebarMinimized).toBe(true);
    expect(state.isMobileTopBarMinimized).toBe(true);
    expect(state.showBottomStatusBar).toBe(false);

    // Expand
    store.expandAllPanels();
    state = useEditorStore.getState();
    expect(state.isMobileSidebarMinimized).toBe(false);
    expect(state.isToolModeMinimized).toBe(false);
    expect(state.isRightSidebarMinimized).toBe(false);
    expect(state.isMobileTopBarMinimized).toBe(false);
    expect(state.showContextualDock).toBe(true);
    expect(state.showLeftToolbar).toBe(true);
  });
});
