import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { getOrbitMouseButtons } from './cameraControls';

describe('Camera Controls Mouse Buttons Scheme', () => {
  it('enforces left-click and right-click orbit across tools and modes', () => {
    const terrainButtons = getOrbitMouseButtons('terrain');
    expect(terrainButtons.LEFT).toBe(THREE.MOUSE.ROTATE);
    expect(terrainButtons.RIGHT).toBe(THREE.MOUSE.ROTATE);
    expect(terrainButtons.MIDDLE).toBe(THREE.MOUSE.PAN);

    const wallSelectButtons = getOrbitMouseButtons('walls', 'select');
    expect(wallSelectButtons.LEFT).toBe(THREE.MOUSE.ROTATE);
    expect(wallSelectButtons.RIGHT).toBe(THREE.MOUSE.ROTATE);

    const wallDrawButtons = getOrbitMouseButtons('walls', 'draw');
    expect(wallDrawButtons.LEFT).toBe(THREE.MOUSE.ROTATE);

    const splineSelectButtons = getOrbitMouseButtons('spline', undefined, 'select');
    expect(splineSelectButtons.LEFT).toBe(THREE.MOUSE.ROTATE);

    const textureButtons = getOrbitMouseButtons('texture');
    expect(textureButtons.LEFT).toBe(THREE.MOUSE.ROTATE);

    const foliageButtons = getOrbitMouseButtons('foliage');
    expect(foliageButtons.LEFT).toBe(THREE.MOUSE.ROTATE);

    const propButtons = getOrbitMouseButtons('prop');
    expect(propButtons.LEFT).toBe(THREE.MOUSE.ROTATE);

    const lightingButtons = getOrbitMouseButtons('lighting');
    expect(lightingButtons.LEFT).toBe(THREE.MOUSE.ROTATE);
  });

  it('allows left-click orbit navigation in spectator view mode', () => {
    const viewButtons = getOrbitMouseButtons('view');
    expect(viewButtons.LEFT).toBe(THREE.MOUSE.ROTATE);
    expect(viewButtons.RIGHT).toBe(THREE.MOUSE.ROTATE);
    expect(viewButtons.MIDDLE).toBe(THREE.MOUSE.PAN);
  });
});
