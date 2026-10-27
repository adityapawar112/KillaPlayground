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
export const fallbackArm = createColorTexture(255, 230, 0);          // AO=1.0, Roughness=0.90, Metal=0
export const fallbackFlatNormal = createColorTexture(128, 128, 255); // Flat tangent-space normal (0, 0, 1)

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
  uniform sampler2D uWalkableNor;
  uniform sampler2D uCliffDiff;
  uniform sampler2D uCliffArm;
  uniform sampler2D uCliffNor;
  uniform sampler2D uCrackedDiff;
  uniform sampler2D uCrackedArm;
  uniform sampler2D uCrackedNor;
  uniform sampler2D uPathDiff;
  uniform sampler2D uPathArm;
  uniform sampler2D uPathNor;
  uniform sampler2D uGrassDiff;
  uniform sampler2D uGrassArm;
  uniform sampler2D uGrassNor;
  uniform float uTextureRepeat;
  uniform float uCliffRepeat;

  vec3 perturbNormal(vec3 worldNormal, vec3 mapNormal, vec2 uvCoord, vec3 worldPos) {
    vec3 q0 = dFdx(worldPos);
    vec3 q1 = dFdy(worldPos);
    vec2 st0 = dFdx(uvCoord);
    vec2 st1 = dFdy(uvCoord);

    vec3 N = normalize(worldNormal);
    vec3 q1perp = cross(q1, N);
    vec3 q0perp = cross(N, q0);

    vec3 T = q1perp * st0.x + q0perp * st1.x;
    vec3 B = q1perp * st0.y + q0perp * st1.y;

    float det = max(dot(T, T), dot(B, B));
    float scale = (det == 0.0) ? 0.0 : inversesqrt(det);

    return normalize(T * (mapNormal.x * scale) + B * (mapNormal.y * scale) + N * mapNormal.z);
  }

  void main() {
    vec3 geomNorm = normalize(vWorldNormal);

    // 1. Walkable vs Steeper-than-walkable Slope Determination:
    // Flat to walkable slopes: geomNorm.y >= 0.78 (~38 degrees)
    // Steeper than walkable cliffs: geomNorm.y < 0.70
    float steepness = 1.0 - smoothstep(0.70, 0.80, geomNorm.y);

    // 2. Walkable horizontal coordinate tiling (red_laterite_soil_stones_1k)
    vec2 tiledUv = vTerrainUv * uTextureRepeat;
    vec4 walkableDiffSample = texture(uWalkableDiff, tiledUv);
    vec4 walkableArmSample = texture(uWalkableArm, tiledUv);
    vec3 walkableNorSample = texture(uWalkableNor, tiledUv).rgb * 2.0 - 1.0;

    // 3. Steep cliff face triplanar coordinates (rocks_ground_06_1k)
    vec3 blendWeights = abs(geomNorm);
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

    vec3 cliffNorX = texture(uCliffNor, cliffUvX).rgb * 2.0 - 1.0;
    vec3 cliffNorZ = texture(uCliffNor, cliffUvZ).rgb * 2.0 - 1.0;
    vec3 cliffNor = (cliffNorX * blendWeights.x + cliffNorZ * blendWeights.z) / (blendWeights.x + blendWeights.z + 0.0001);

    // Blend base walkable terrain with steep rock cliffs
    vec3 baseColor = mix(walkableDiffSample.rgb, cliffColor, steepness);

    // Realistic Matte Roughness for Natural Soil & Basalt (Eliminates glossy plastic look)
    // Walkable soil is earthy and rough (0.90 to 0.98), rock is (0.86 to 0.95)
    float walkableRoughness = mix(0.90, 0.98, walkableArmSample.g);
    float cliffRoughness = mix(0.86, 0.95, cliffArm.g);
    float baseRoughness = mix(walkableRoughness, cliffRoughness, steepness);
    float baseAO = mix(walkableArmSample.r, cliffArm.r, steepness);

    // Industry standard Cotangent Frame normal perturbation for walkable laterite soil
    vec3 walkableNormalWorld = perturbNormal(geomNorm, walkableNorSample, tiledUv, vWorldPosition);

    // Triplanar normal perturbation for steep basalt rock cliffs
    vec3 cliffNormalWorld = normalize(geomNorm + cliffNor * 0.85);

    vec3 finalNormal = normalize(mix(walkableNormalWorld, cliffNormalWorld, steepness));

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
      // Darkened moist wet red soil with specular highlights ONLY when watered
      vec3 wetColor = crackedDiffSample.rgb * 0.74;
      float wetRoughness = mix(0.85, 0.18 + crackedArmSample.g * 0.18, wetness);
      baseColor = mix(baseColor, wetColor, wetness);
      baseRoughness = mix(baseRoughness, wetRoughness, wetness);
      baseAO = mix(baseAO, crackedArmSample.r, wetness);
    }

    // 6. Foliage Grass (rocky_terrain_02_1k)
    if (grass > 0.0) {
      vec4 grassDiffSample = texture(uGrassDiff, tiledUv * 1.5);
      vec4 grassArmSample = texture(uGrassArm, tiledUv * 1.5);
      baseColor = mix(baseColor, grassDiffSample.rgb, grass * 0.88);
      baseRoughness = mix(baseRoughness, mix(0.88, 0.98, grassArmSample.g), grass * 0.8);
    }

    // 7. Mud set / locked mass compaction
    if (locked > 0.5) {
      baseColor *= 0.95;
      baseRoughness = clamp(baseRoughness + 0.04, 0.0, 1.0);
    }

    csm_DiffuseColor = vec4(baseColor, 1.0);
    csm_Roughness = clamp(baseRoughness, 0.08, 1.0);
    csm_Metalness = 0.0;
    csm_AO = baseAO;
    csm_FragNormal = finalNormal;
  }
`;

export interface CreateTerrainMaterialOptions {
  stateTexture: THREE.DataTexture;
  walkableDiff?: THREE.Texture | null;
  walkableArm?: THREE.Texture | null;
  walkableNor?: THREE.Texture | null;
  cliffDiff?: THREE.Texture | null;
  cliffArm?: THREE.Texture | null;
  cliffNor?: THREE.Texture | null;
  crackedDiff?: THREE.Texture | null;
  crackedArm?: THREE.Texture | null;
  crackedNor?: THREE.Texture | null;
  pathDiff?: THREE.Texture | null;
  pathArm?: THREE.Texture | null;
  pathNor?: THREE.Texture | null;
  grassDiff?: THREE.Texture | null;
  grassArm?: THREE.Texture | null;
  grassNor?: THREE.Texture | null;
  textureRepeat?: number;
  cliffRepeat?: number;
}

/**
 * Creates a CustomShaderMaterial instance extending MeshStandardMaterial with slope-aware
 * PBR texture blending (walkable soil vs steep cliffs, normal maps, wet mud, and foliage).
 */
export function createTerrainMaterial(options: CreateTerrainMaterialOptions): CustomShaderMaterial {
  const {
    stateTexture,
    walkableDiff = fallbackWalkableDiff,
    walkableArm = fallbackArm,
    walkableNor = fallbackFlatNormal,
    cliffDiff = fallbackCliffDiff,
    cliffArm = fallbackArm,
    cliffNor = fallbackFlatNormal,
    crackedDiff = fallbackCrackedDiff,
    crackedArm = fallbackArm,
    crackedNor = fallbackFlatNormal,
    pathDiff = fallbackPathDiff,
    pathArm = fallbackArm,
    pathNor = fallbackFlatNormal,
    grassDiff = fallbackGrassDiff,
    grassArm = fallbackArm,
    grassNor = fallbackFlatNormal,
    textureRepeat = 6.0,
    cliffRepeat = 4.0,
  } = options;

  return new CustomShaderMaterial({
    baseMaterial: THREE.MeshStandardMaterial,
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    uniforms: {
      uStateTexture: { value: stateTexture },
      uWalkableDiff: { value: walkableDiff || fallbackWalkableDiff },
      uWalkableArm: { value: walkableArm || fallbackArm },
      uWalkableNor: { value: walkableNor || fallbackFlatNormal },
      uCliffDiff: { value: cliffDiff || fallbackCliffDiff },
      uCliffArm: { value: cliffArm || fallbackArm },
      uCliffNor: { value: cliffNor || fallbackFlatNormal },
      uCrackedDiff: { value: crackedDiff || fallbackCrackedDiff },
      uCrackedArm: { value: crackedArm || fallbackArm },
      uCrackedNor: { value: crackedNor || fallbackFlatNormal },
      uPathDiff: { value: pathDiff || fallbackPathDiff },
      uPathArm: { value: pathArm || fallbackArm },
      uPathNor: { value: pathNor || fallbackFlatNormal },
      uGrassDiff: { value: grassDiff || fallbackGrassDiff },
      uGrassArm: { value: grassArm || fallbackArm },
      uGrassNor: { value: grassNor || fallbackFlatNormal },
      uTextureRepeat: { value: textureRepeat },
      uCliffRepeat: { value: cliffRepeat },
    },
    roughness: 0.95,
    metalness: 0.0,
    side: THREE.FrontSide,
  });
}
