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
});
