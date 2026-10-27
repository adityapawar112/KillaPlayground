import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import CustomShaderMaterialVanilla from 'three-custom-shader-material/vanilla';

describe('CustomShaderMaterial Vanilla Shader Compilation', () => {
  it('instantiates vanilla CustomShaderMaterial with MeshStandardMaterial', () => {
    const mat = new CustomShaderMaterialVanilla({
      baseMaterial: THREE.MeshStandardMaterial,
      uniforms: {
        uStateTexture: { value: null },
      },
      vertexShader: `
        varying vec2 vTerrainUv;
        void main() {
          vTerrainUv = uv;
        }
      `,
      fragmentShader: `
        varying vec2 vTerrainUv;
        void main() {
          csm_DiffuseColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
      `,
    });

    expect(mat).toBeDefined();
    expect(mat.isMaterial).toBe(true);
  });

  it('compiles reworked slope-aware terrain material with all required uniforms', async () => {
    const { createTerrainMaterial } = await import('../../components/3d/TerrainMaterial');
    const { createStateBuffer, createStateTexture } = await import('./terrainBuffer');
    const buf = createStateBuffer();
    const tex = createStateTexture(buf);

    const terrainMat = createTerrainMaterial({ stateTexture: tex });
    expect(terrainMat).toBeDefined();
    expect(terrainMat.uniforms.uCliffDiff).toBeDefined();
    expect(terrainMat.uniforms.uWalkableDiff).toBeDefined();
    expect(terrainMat.uniforms.uCrackedDiff).toBeDefined();
    expect(terrainMat.uniforms.uPathDiff).toBeDefined();
    expect(terrainMat.uniforms.uGrassDiff).toBeDefined();
  });
});
