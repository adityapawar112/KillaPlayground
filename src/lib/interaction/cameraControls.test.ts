import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { getOrbitMouseButtons } from './cameraControls';

describe('Camera Controls Mouse Buttons Scheme', () => {
  it('permanently disables left-click orbit across all tools and modes', () => {
    const terrainButtons = getOrbitMouseButtons('terrain');
    expect(terrainButtons.LEFT).toBe(-1);
    expect(terrainButtons.RIGHT).toBe(THREE.MOUSE.ROTATE);
    expect(terrainButtons.MIDDLE).toBe(THREE.MOUSE.PAN);

    const wallSelectButtons = getOrbitMouseButtons('walls', 'select');
    expect(wallSelectButtons.LEFT).toBe(-1);
    expect(wallSelectButtons.RIGHT).toBe(THREE.MOUSE.ROTATE);

    const wallDrawButtons = getOrbitMouseButtons('walls', 'draw');
    expect(wallDrawButtons.LEFT).toBe(-1);

    const splineSelectButtons = getOrbitMouseButtons('spline', undefined, 'select');
    expect(splineSelectButtons.LEFT).toBe(-1);

    const textureButtons = getOrbitMouseButtons('texture');
    expect(textureButtons.LEFT).toBe(-1);

    const foliageButtons = getOrbitMouseButtons('foliage');
    expect(foliageButtons.LEFT).toBe(-1);

    const propButtons = getOrbitMouseButtons('prop');
    expect(propButtons.LEFT).toBe(-1);

    const lightingButtons = getOrbitMouseButtons('lighting');
    expect(lightingButtons.LEFT).toBe(-1);
  });

  it('allows left-click orbit navigation in spectator view mode', () => {
    const viewButtons = getOrbitMouseButtons('view');
    expect(viewButtons.LEFT).toBe(THREE.MOUSE.ROTATE);
    expect(viewButtons.RIGHT).toBe(THREE.MOUSE.ROTATE);
    expect(viewButtons.MIDDLE).toBe(THREE.MOUSE.PAN);
  });
});
