import * as THREE from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';

// 1x1 fallback textures for resilient rendering
function createColorTexture(r: number, g: number, b: number): THREE.DataTexture {
  const data = new Uint8Array([r, g, b, 255]);
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

export const fallbackDryDiff = createColorTexture(184, 85, 54);  // #B85536
export const fallbackWetDiff = createColorTexture(109, 41, 22);  // #6D2916
export const fallbackDryArm = createColorTexture(255, 230, 0);   // AO=1.0, Roughness=0.9, Metal=0
export const fallbackWetArm = createColorTexture(255, 64, 0);    // AO=1.0, Roughness=0.25, Metal=0

export const terrainVertexShader = /* glsl */ `
  varying vec2 vTerrainUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  void main() {
    vTerrainUv = uv;
    vec4 worldPos = modelMatrix * vec4(csm_Position, 1.0);
    vWorldPosition = worldPos.xyz;
    vWorldNormal = normalize((modelMatrix * vec4(csm_Normal, 0.0)).xyz);
  }
`;

export const terrainFragmentShader = /* glsl */ `
  varying vec2 vTerrainUv;
  varying vec3 vWorldPosition;
  varying vec3 vWorldNormal;

  uniform sampler2D uStateTexture;
  uniform sampler2D uDryDiff;
  uniform sampler2D uDryArm;
  uniform sampler2D uWetDiff;
  uniform sampler2D uWetArm;
  uniform float uTextureRepeat;

  void main() {
    // Sample state buffer at (u, v)
    vec4 state = texture(uStateTexture, vTerrainUv);
    float elevation = state.r;
    float wetness = clamp(state.g, 0.0, 1.0);
    float locked = clamp(state.b, 0.0, 1.0);
    float grass = clamp(state.a, 0.0, 1.0);

    // High-frequency detail tiled UVs across 10m diorama
    vec2 tiledUv = vTerrainUv * uTextureRepeat;

    // Sample dry soil PBR textures
    vec4 dryDiffSample = texture(uDryDiff, tiledUv);
    vec4 dryArmSample = texture(uDryArm, tiledUv);

    // Sample wet mud PBR textures
    vec4 wetDiffSample = texture(uWetDiff, tiledUv);
    vec4 wetArmSample = texture(uWetArm, tiledUv);

    // Blend albedo color based on wetness
    // Wet mud darkens to rich iron-red Maharashtrian tambdi maati
    vec3 dryColor = dryDiffSample.rgb;
    vec3 wetColor = wetDiffSample.rgb * 0.82;
    vec3 baseColor = mix(dryColor, wetColor, wetness);

    // Blend roughness: dry soil is matte (0.85-0.95), wet mud is glossy specular (0.2-0.35)
    float dryRoughness = dryArmSample.g * 0.95 + 0.05;
    float wetRoughness = wetArmSample.g * 0.36 + 0.08;
    float finalRoughness = mix(dryRoughness, wetRoughness, wetness);

    // Ambient occlusion
    float finalAO = mix(dryArmSample.r, wetArmSample.r, wetness);

    // Halim grass seedling sprouting tint (Channel A)
    vec3 grassTint = vec3(0.35, 0.55, 0.15); // Fresh green seedling
    baseColor = mix(baseColor, mix(baseColor, grassTint, 0.65), grass * 0.85);
    finalRoughness = mix(finalRoughness, 0.75, grass * 0.5);

    // Mud set / locked mass compaction (Channel B)
    if (locked > 0.5) {
      baseColor *= 0.96;
      finalRoughness = clamp(finalRoughness + 0.06, 0.0, 1.0);
    }

    // Set outputs for Three.js PBR lighting & shadow evaluation
    csm_DiffuseColor = vec4(baseColor, 1.0);
    csm_Roughness = clamp(finalRoughness, 0.04, 1.0);
    csm_Metalness = 0.0;
    csm_AO = finalAO;
  }
`;

export interface CreateTerrainMaterialOptions {
  stateTexture: THREE.DataTexture;
  dryDiff?: THREE.Texture | null;
  dryArm?: THREE.Texture | null;
  wetDiff?: THREE.Texture | null;
  wetArm?: THREE.Texture | null;
  textureRepeat?: number;
}

/**
 * Creates a CustomShaderMaterial instance extending MeshStandardMaterial with PBR mud blending.
 */
export function createTerrainMaterial(options: CreateTerrainMaterialOptions): CustomShaderMaterial {
  const {
    stateTexture,
    dryDiff = fallbackDryDiff,
    dryArm = fallbackDryArm,
    wetDiff = fallbackWetDiff,
    wetArm = fallbackWetArm,
    textureRepeat = 8.0,
  } = options;

  const material = new CustomShaderMaterial({
    baseMaterial: THREE.MeshStandardMaterial,
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    uniforms: {
      uStateTexture: { value: stateTexture },
      uDryDiff: { value: dryDiff || fallbackDryDiff },
      uDryArm: { value: dryArm || fallbackDryArm },
      uWetDiff: { value: wetDiff || fallbackWetDiff },
      uWetArm: { value: wetArm || fallbackWetArm },
      uTextureRepeat: { value: textureRepeat },
    },
    roughness: 0.9,
    metalness: 0.0,
  });

  return material;
}
