import * as THREE from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';

// 1x1 fallback textures for resilient rendering
function createColorTexture(r: number, g: number, b: number): THREE.DataTexture {
  const data = new Uint8Array([r, g, b, 255]);
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

export const fallbackWalkableDiff = createColorTexture(184, 85, 54);  // #B85536 red laterite soil
export const fallbackCliffDiff = createColorTexture(85, 75, 68);     // #554B44 basalt rocks
export const fallbackCrackedDiff = createColorTexture(140, 52, 28);   // #8C341C cracked mud
export const fallbackPathDiff = createColorTexture(115, 68, 45);     // #73442D muddy tracks
export const fallbackGrassDiff = createColorTexture(75, 110, 40);    // #4B6E28 foliage grass
export const fallbackArm = createColorTexture(255, 220, 0);          // AO=1.0, Roughness=0.86, Metal=0

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
  uniform sampler2D uWalkableDiff;
  uniform sampler2D uWalkableArm;
  uniform sampler2D uCliffDiff;
  uniform sampler2D uCliffArm;
  uniform sampler2D uCrackedDiff;
  uniform sampler2D uCrackedArm;
  uniform sampler2D uPathDiff;
  uniform sampler2D uPathArm;
  uniform sampler2D uGrassDiff;
  uniform sampler2D uGrassArm;
  uniform float uTextureRepeat;
  uniform float uCliffRepeat;

  void main() {
    vec3 worldNorm = normalize(vWorldNormal);

    // 1. Walkable vs Steeper-than-walkable Slope Determination:
    // Flat to walkable slopes: worldNorm.y >= 0.78 (~38 degrees)
    // Steeper than walkable cliffs: worldNorm.y < 0.72
    float steepness = 1.0 - smoothstep(0.70, 0.80, worldNorm.y);

    // 2. Walkable horizontal coordinate tiling (red_laterite_soil_stones_1k)
    vec2 tiledUv = vTerrainUv * uTextureRepeat;
    vec4 walkableDiffSample = texture(uWalkableDiff, tiledUv);
    vec4 walkableArmSample = texture(uWalkableArm, tiledUv);

    // 3. Steep cliff face triplanar coordinates (rocks_ground_06_1k)
    // Projects on vertical planes to eliminate texture stretching
    vec3 blendWeights = abs(worldNorm);
    blendWeights = normalize(max(blendWeights, 0.0001));
    float blendSum = blendWeights.x + blendWeights.y + blendWeights.z;
    blendWeights /= blendSum;

    vec2 cliffUvX = vWorldPosition.zy * (uCliffRepeat * 0.12);
    vec2 cliffUvZ = vWorldPosition.xy * (uCliffRepeat * 0.12);

    vec4 cliffDiffX = texture(uCliffDiff, cliffUvX);
    vec4 cliffDiffZ = texture(uCliffDiff, cliffUvZ);
    vec3 cliffColor = (cliffDiffX.rgb * blendWeights.x + cliffDiffZ.rgb * blendWeights.z) / (blendWeights.x + blendWeights.z + 0.0001);

    vec4 cliffArmX = texture(uCliffArm, cliffUvX);
    vec4 cliffArmZ = texture(uCliffArm, cliffUvZ);
    vec3 cliffArm = (cliffArmX.rgb * blendWeights.x + cliffArmZ.rgb * blendWeights.z) / (blendWeights.x + blendWeights.z + 0.0001);

    // Blend base walkable terrain with steep rock cliffs
    vec3 baseColor = mix(walkableDiffSample.rgb, cliffColor, steepness);
    float baseRoughness = mix(walkableArmSample.g * 0.92 + 0.05, cliffArm.g * 0.95 + 0.05, steepness);
    float baseAO = mix(walkableArmSample.r, cliffArm.r, steepness);

    // 4. Sample State Buffer
    vec4 state = texture(uStateTexture, vTerrainUv);
    float elevation = state.r;
    float wetness = clamp(state.g, 0.0, 1.0);
    float locked = clamp(state.b, 0.0, 1.0);
    float grass = clamp(state.a, 0.0, 1.0);

    // 5. Wet Soil / Water & Reshaped Dry Soil (cracked_red_ground_1k)
    vec4 crackedDiffSample = texture(uCrackedDiff, tiledUv);
    vec4 crackedArmSample = texture(uCrackedArm, tiledUv);

    if (wetness > 0.0) {
      // Darkened moist wet red soil with specular highlights
      vec3 wetColor = crackedDiffSample.rgb * 0.78;
      float wetRoughness = crackedArmSample.g * 0.32 + 0.06;
      baseColor = mix(baseColor, wetColor, wetness);
      baseRoughness = mix(baseRoughness, wetRoughness, wetness);
      baseAO = mix(baseAO, crackedArmSample.r, wetness);
    }

    // 6. Foliage Grass (rocky_terrain_02_1k)
    if (grass > 0.0) {
      vec4 grassDiffSample = texture(uGrassDiff, tiledUv * 1.4);
      vec4 grassArmSample = texture(uGrassArm, tiledUv * 1.4);
      baseColor = mix(baseColor, grassDiffSample.rgb, grass * 0.85);
      baseRoughness = mix(baseRoughness, grassArmSample.g * 0.85, grass * 0.7);
    }

    // 7. Mud set / locked mass compaction
    if (locked > 0.5) {
      baseColor *= 0.96;
      baseRoughness = clamp(baseRoughness + 0.06, 0.0, 1.0);
    }

    csm_DiffuseColor = vec4(baseColor, 1.0);
    csm_Roughness = clamp(baseRoughness, 0.04, 1.0);
    csm_Metalness = 0.0;
    csm_AO = baseAO;
  }
`;

export interface CreateTerrainMaterialOptions {
  stateTexture: THREE.DataTexture;
  walkableDiff?: THREE.Texture | null;
  walkableArm?: THREE.Texture | null;
  cliffDiff?: THREE.Texture | null;
  cliffArm?: THREE.Texture | null;
  crackedDiff?: THREE.Texture | null;
  crackedArm?: THREE.Texture | null;
  pathDiff?: THREE.Texture | null;
  pathArm?: THREE.Texture | null;
  grassDiff?: THREE.Texture | null;
  grassArm?: THREE.Texture | null;
  textureRepeat?: number;
  cliffRepeat?: number;
}

/**
 * Creates a CustomShaderMaterial instance extending MeshStandardMaterial with slope-aware
 * PBR texture blending (walkable soil vs steep cliffs, wet mud, and foliage).
 */
export function createTerrainMaterial(options: CreateTerrainMaterialOptions): CustomShaderMaterial {
  const {
    stateTexture,
    walkableDiff = fallbackWalkableDiff,
    walkableArm = fallbackArm,
    cliffDiff = fallbackCliffDiff,
    cliffArm = fallbackArm,
    crackedDiff = fallbackCrackedDiff,
    crackedArm = fallbackArm,
    pathDiff = fallbackPathDiff,
    pathArm = fallbackArm,
    grassDiff = fallbackGrassDiff,
    grassArm = fallbackArm,
    textureRepeat = 8.0,
    cliffRepeat = 6.0,
  } = options;

  const material = new CustomShaderMaterial({
    baseMaterial: THREE.MeshStandardMaterial,
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    uniforms: {
      uStateTexture: { value: stateTexture },
      uWalkableDiff: { value: walkableDiff || fallbackWalkableDiff },
      uWalkableArm: { value: walkableArm || fallbackArm },
      uCliffDiff: { value: cliffDiff || fallbackCliffDiff },
      uCliffArm: { value: cliffArm || fallbackArm },
      uCrackedDiff: { value: crackedDiff || fallbackCrackedDiff },
      uCrackedArm: { value: crackedArm || fallbackArm },
      uPathDiff: { value: pathDiff || fallbackPathDiff },
      uPathArm: { value: pathArm || fallbackArm },
      uGrassDiff: { value: grassDiff || fallbackGrassDiff },
      uGrassArm: { value: grassArm || fallbackArm },
      uTextureRepeat: { value: textureRepeat },
      uCliffRepeat: { value: cliffRepeat },
    },
    roughness: 0.9,
    metalness: 0.0,
  });

  return material;
}
