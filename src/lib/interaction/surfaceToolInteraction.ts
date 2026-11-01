import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { useEditorStore } from '../state/useEditorStore';
import { useTerrainStore } from '../terrain/terrainStore';
import { getTextureById, TEXTURE_MANIFEST } from '../textures/textureManifest';
import { getFoliageById, FOLIAGE_MANIFEST } from '../foliage/foliageManifest';
import { generateScatterCandidates, eraseFoliageInRadius } from '../foliage/foliageScatter';
import { FoliageInstance } from '../foliage/foliageTypes';
import { getTerrainHeightAt, getTerrainNormalAt } from '../terrain/terrainBuffer';

let isPaintingSurface = false;
let isDrawingSurfaceSpline = false;
let lastSplinePoint: [number, number, number] | null = null;

/**
 * Handles pointer-down on 3D structures (walls, bastions, gates, spline structures)
 * so that active tools (Texture, Foliage, Spline) operate seamlessly on structures
 * instead of letting pointer events fall through to OrbitControls.
 */
export function handleStructurePointerDown(
  e: ThreeEvent<PointerEvent>,
  invalidate: () => void
): boolean {
  if (e.button !== 0 || e.altKey) return false;
  const editor = useEditorStore.getState();

  // 1. Spline Tool (draw mode)
  if (editor.activeTool === 'spline' && editor.splineMode === 'draw') {
    e.stopPropagation();
    if (typeof window !== 'undefined' && (window as any).__orbitControls) {
      (window as any).__orbitControls.enabled = false;
    }

    isDrawingSurfaceSpline = true;
    if (!editor.isDrawingSpline) {
      editor.startSpline();
    }
    editor.addSplinePoint([e.point.x, e.point.y, e.point.z]);
    lastSplinePoint = [e.point.x, e.point.y, e.point.z];
    invalidate();
    return true;
  }

  // 2. Texture Tool
  if (editor.activeTool === 'texture' || editor.activeTool === 'paint') {
    e.stopPropagation();
    if (typeof window !== 'undefined' && (window as any).__orbitControls) {
      (window as any).__orbitControls.enabled = false;
    }

    isPaintingSurface = true;
    const terrainStore = useTerrainStore.getState();
    terrainStore.pushUndo();

    const texItem = getTextureById(editor.selectedTextureId) || TEXTURE_MANIFEST[0];
    terrainStore.applyPaintBrush(e.point.x, e.point.z, {
      operation: editor.paintSubTool,
      targetLayer: texItem.layerIndex,
      radius: editor.paintBrushRadius,
      strength: editor.paintBrushStrength,
      falloff: editor.paintBrushFalloff,
    });
    invalidate();
    return true;
  }

  // 3. Foliage Tool
  if (editor.activeTool === 'foliage') {
    e.stopPropagation();
    if (typeof window !== 'undefined' && (window as any).__orbitControls) {
      (window as any).__orbitControls.enabled = false;
    }

    const terrainStore = useTerrainStore.getState();
    terrainStore.pushUndo();

    if (editor.foliageSubTool === 'single') {
      const foliageItem = getFoliageById(editor.selectedFoliageId) || FOLIAGE_MANIFEST[0];
      const jitterFactor = 1.0 + (Math.random() * 2 - 1) * editor.foliageScaleJitter;
      const randomYaw = Math.random() * Math.PI * 2;

      const norm = e.face?.normal
        ? [e.face.normal.x, e.face.normal.y, e.face.normal.z]
        : [0, 1, 0];
      const quat = new THREE.Quaternion();
      const up = new THREE.Vector3(0, 1, 0);
      const surfaceNorm = new THREE.Vector3(norm[0], norm[1], norm[2]).normalize();
      const blendedUp = up.clone().lerp(surfaceNorm, editor.foliageNormalAlign).normalize();
      const alignQuat = new THREE.Quaternion().setFromUnitVectors(up, blendedUp);
      const yawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), randomYaw);
      quat.multiplyQuaternions(alignQuat, yawQuat);
      const euler = new THREE.Euler().setFromQuaternion(quat, 'YXZ');

      const singleInstance: FoliageInstance = {
        id: `foliage_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        typeId: foliageItem.id,
        position: [e.point.x, e.point.y, e.point.z],
        rotation: [euler.x, euler.y, euler.z],
        scale: [jitterFactor, jitterFactor, jitterFactor],
      };
      editor.addFoliageInstances([singleInstance]);
      invalidate();
      return true;
    }

    if (editor.foliageSubTool === 'scatter') {
      isPaintingSurface = true;
      const stateBuffer = terrainStore.stateBuffer;
      const activeTypeIds =
        editor.foliageSelectMode === 'multi' && editor.selectedFoliageIds.length > 0
          ? editor.selectedFoliageIds
          : [editor.selectedFoliageId || FOLIAGE_MANIFEST[0].id];
      const activeItems = activeTypeIds.map((id) => getFoliageById(id) || FOLIAGE_MANIFEST[0]);
      const avgSpacing = activeItems.reduce((acc, it) => acc + it.spacing, 0) / activeItems.length;

      const candidates = generateScatterCandidates({
        centerX: e.point.x,
        centerZ: e.point.z,
        typeId: activeItems[0].id,
        typeIds: activeTypeIds,
        spacing: avgSpacing,
        options: {
          operation: 'scatter',
          radius: editor.foliageBrushRadius,
          density: editor.foliageBrushDensity,
          scaleJitter: editor.foliageScaleJitter,
          normalAlign: editor.foliageNormalAlign,
        },
        existingInstances: editor.foliageInstances,
        getHeightAt: (x, z) => getTerrainHeightAt(x, z, stateBuffer),
        getNormalAt: (x, z) => {
          const n = getTerrainNormalAt(x, z, stateBuffer);
          return [n.x, n.y, n.z];
        },
      });
      if (candidates.length > 0) {
        editor.addFoliageInstances(candidates);
      }
      invalidate();
      return true;
    }

    if (editor.foliageSubTool === 'erase') {
      isPaintingSurface = true;
      const { erased } = eraseFoliageInRadius(
        e.point.x,
        e.point.z,
        editor.foliageBrushRadius,
        editor.foliageInstances
      );
      if (erased.length > 0) {
        editor.removeFoliageInstances(erased.map((it) => it.id));
      }
      invalidate();
      return true;
    }
  }

  // 4. Figurine Erase on Solid Structures
  if (editor.activeTool === 'prop' && editor.propSubTool === 'erase') {
    isPaintingSurface = true;
    const toRemove = editor.placedProps.filter((p) => {
      const dx = p.position[0] - e.point.x;
      const dz = p.position[2] - e.point.z;
      return Math.hypot(dx, dz) <= editor.propEraseRadius;
    });
    if (toRemove.length > 0) {
      editor.removeProps(toRemove.map((it) => it.id));
    }
    invalidate();
    return true;
  }

  return false;
}

/**
 * Handles pointer-move on 3D structures when dragging with active tools.
 */
export function handleStructurePointerMove(
  e: ThreeEvent<PointerEvent>,
  invalidate: () => void
): boolean {
  const editor = useEditorStore.getState();

  // 1. Spline Dragging
  if (editor.activeTool === 'spline' && editor.splineMode === 'draw') {
    e.stopPropagation();
    if (isDrawingSurfaceSpline && e.buttons === 1) {
      if (lastSplinePoint) {
        const dist = Math.hypot(
          e.point.x - lastSplinePoint[0],
          e.point.y - lastSplinePoint[1],
          e.point.z - lastSplinePoint[2]
        );
        if (dist >= 0.15) {
          editor.addSplinePoint([e.point.x, e.point.y, e.point.z]);
          lastSplinePoint = [e.point.x, e.point.y, e.point.z];
          invalidate();
        }
      }
    }
    return true;
  }

  // 2. Texture Dragging
  if (
    (editor.activeTool === 'texture' || editor.activeTool === 'paint') &&
    isPaintingSurface &&
    e.buttons === 1
  ) {
    e.stopPropagation();
    const terrainStore = useTerrainStore.getState();
    const texItem = getTextureById(editor.selectedTextureId) || TEXTURE_MANIFEST[0];
    terrainStore.applyPaintBrush(e.point.x, e.point.z, {
      operation: editor.paintSubTool,
      targetLayer: texItem.layerIndex,
      radius: editor.paintBrushRadius,
      strength: editor.paintBrushStrength,
      falloff: editor.paintBrushFalloff,
    });
    invalidate();
    return true;
  }

  // 3. Foliage Dragging
  if (editor.activeTool === 'foliage' && isPaintingSurface && e.buttons === 1) {
    e.stopPropagation();
    const terrainStore = useTerrainStore.getState();

    if (editor.foliageSubTool === 'scatter') {
      const stateBuffer = terrainStore.stateBuffer;
      const activeTypeIds =
        editor.foliageSelectMode === 'multi' && editor.selectedFoliageIds.length > 0
          ? editor.selectedFoliageIds
          : [editor.selectedFoliageId || FOLIAGE_MANIFEST[0].id];
      const activeItems = activeTypeIds.map((id) => getFoliageById(id) || FOLIAGE_MANIFEST[0]);
      const avgSpacing = activeItems.reduce((acc, it) => acc + it.spacing, 0) / activeItems.length;

      const candidates = generateScatterCandidates({
        centerX: e.point.x,
        centerZ: e.point.z,
        typeId: activeItems[0].id,
        typeIds: activeTypeIds,
        spacing: avgSpacing,
        options: {
          operation: 'scatter',
          radius: editor.foliageBrushRadius,
          density: editor.foliageBrushDensity,
          scaleJitter: editor.foliageScaleJitter,
          normalAlign: editor.foliageNormalAlign,
        },
        existingInstances: editor.foliageInstances,
        getHeightAt: (x, z) => getTerrainHeightAt(x, z, stateBuffer),
        getNormalAt: (x, z) => {
          const n = getTerrainNormalAt(x, z, stateBuffer);
          return [n.x, n.y, n.z];
        },
      });
      if (candidates.length > 0) {
        editor.addFoliageInstances(candidates);
      }
      invalidate();
      return true;
    }

    if (editor.foliageSubTool === 'erase') {
      const { erased } = eraseFoliageInRadius(
        e.point.x,
        e.point.z,
        editor.foliageBrushRadius,
        editor.foliageInstances
      );
      if (erased.length > 0) {
        editor.removeFoliageInstances(erased.map((it) => it.id));
      }
      invalidate();
      return true;
    }
  }

  // 4. Figurine Erase on Solid Structures
  if (editor.activeTool === 'prop' && editor.propSubTool === 'erase') {
    isPaintingSurface = true;
    const toRemove = editor.placedProps.filter((p) => {
      const dx = p.position[0] - e.point.x;
      const dz = p.position[2] - e.point.z;
      return Math.hypot(dx, dz) <= editor.propEraseRadius;
    });
    if (toRemove.length > 0) {
      editor.removeProps(toRemove.map((it) => it.id));
    }
    invalidate();
    return true;
  }

  return false;
}

// Global reset when mouse button is released anywhere
if (typeof window !== 'undefined') {
  window.addEventListener('pointerup', () => {
    if (isPaintingSurface || isDrawingSurfaceSpline) {
      isPaintingSurface = false;
      isDrawingSurfaceSpline = false;
      lastSplinePoint = null;
      if (typeof window !== 'undefined' && (window as any).__orbitControls) {
        (window as any).__orbitControls.enabled = true;
      }
    }
  });
}
