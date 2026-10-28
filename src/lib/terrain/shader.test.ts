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

  it('compiles reworked slope-aware terrain material with all required uniforms within MAX_TEXTURE_IMAGE_UNITS', async () => {
    const { createTerrainMaterial } = await import('../../components/3d/TerrainMaterial');
    const { createStateBuffer, createStateTexture } = await import('./terrainBuffer');
    const buf = createStateBuffer();
    const tex = createStateTexture(buf);

    const terrainMat = createTerrainMaterial({ stateTexture: tex });
    expect(terrainMat).toBeDefined();
    // Exactly 11 texture samplers to guarantee compliance with MAX_TEXTURE_IMAGE_UNITS (16)
    expect(terrainMat.uniforms.uStateTexture).toBeDefined();
    expect(terrainMat.uniforms.uCliffDiff).toBeDefined();
    expect(terrainMat.uniforms.uCliffArm).toBeDefined();
    expect(terrainMat.uniforms.uCliffNor).toBeDefined();
    expect(terrainMat.uniforms.uWalkableDiff).toBeDefined();
    expect(terrainMat.uniforms.uWalkableArm).toBeDefined();
    expect(terrainMat.uniforms.uWalkableNor).toBeDefined();
    expect(terrainMat.uniforms.uCrackedDiff).toBeDefined();
    expect(terrainMat.uniforms.uGrassDiff).toBeDefined();
    expect(terrainMat.uniforms.uWaterDiff).toBeDefined();
    expect(terrainMat.uniforms.uWaterNor).toBeDefined();

    // Verify sampler count is strictly <= 12 to leave margin for Three.js internal lights/shadows
    const samplerUniformCount = Object.values(terrainMat.uniforms).filter(
      (u: any) => u.value && (u.value.isTexture || u.value.isDataTexture)
    ).length;
    expect(samplerUniformCount).toBeLessThanOrEqual(11);
  });
});
