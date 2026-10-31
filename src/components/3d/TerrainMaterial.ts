import * as THREE from 'three';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import { createFallbackArrayTexture } from '../../lib/terrain/terrainPaintBuffer';

// 1x1 fallback textures for resilient rendering
function createColorTexture(r: number, g: number, b: number, a = 255): THREE.DataTexture {
  const data = new Uint8Array([r, g, b, a]);
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

export const fallbackWalkableDiff = createColorTexture(184, 85, 54);  // #B85536 red laterite soil
export const fallbackCliffDiff = createColorTexture(85, 75, 68);     // #554B44 basalt rocks
export const fallbackCrackedDiff = createColorTexture(140, 52, 28);   // #8C341C cracked mud
export const fallbackGrassDiff = createColorTexture(75, 110, 40);    // #4B6E28 foliage grass
export const fallbackWaterDiff = createColorTexture(2, 132, 199);    // #0284C7 blue tarpaulin water
export const fallbackArm = createColorTexture(255, 230, 0);          // AO=1.0, Roughness=0.90, Metal=0
export const fallbackFlatNormal = createColorTexture(128, 128, 255); // Flat tangent-space normal (0, 0, 1)
export const fallbackPaintState = createColorTexture(0, 0, 0, 0);     // Unpainted: weight = 0
export const fallbackPaintAtlas = createFallbackArrayTexture(52);

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

  // Optimized to 13 samplers total (Guarantees <= 16 MAX_TEXTURE_IMAGE_UNITS with Three.js shadow maps & envmap)
  uniform sampler2D uStateTexture;
  uniform sampler2D uWalkableDiff;
  uniform sampler2D uWalkableArm;
  uniform sampler2D uWalkableNor;
  uniform sampler2D uCliffDiff;
  uniform sampler2D uCliffArm;
  uniform sampler2D uCliffNor;
  uniform sampler2D uCrackedDiff;
  uniform sampler2D uGrassDiff;
  uniform sampler2D uWaterDiff;
  uniform sampler2D uWaterNor;
  // Direct Terrain Texture Painting Studio (Ticket 06)
  uniform sampler2DArray uPaintAtlas;
  uniform sampler2D uPaintState;
  uniform float uPaintRepeat;
  uniform float uTextureRepeat;
  uniform float uCliffRepeat;

  // Unpack OpenGL Normal Map [0, 1] -> [-1, 1] with strength scaling
  vec3 unpackNormal(vec4 sampleNor, float strength) {
    vec3 n = sampleNor.xyz * 2.0 - 1.0;
    n.xy *= strength;
    return normalize(n);
  }

  // Height-based blending function (Game Engine Splatmap standard)
  float heightBlend(float hA, float hB, float factor, float contrast) {
    float a = hA + (1.0 - factor);
    float b = hB + factor;
    float ma = max(a, b) - contrast;
    float ba = max(a - ma, 0.0);
    float bb = max(b - ma, 0.0);
    return bb / (ba + bb + 0.0001);
  }

  // Robust, screen-derivative-free TBN terrain normal perturbation (No dFdx/dFdy striping or loops)
  vec3 computeTerrainNormal(vec3 geomNorm, vec3 mapNor) {
    vec3 up = abs(geomNorm.y) < 0.999 ? vec3(0.0, 1.0, 0.0) : vec3(0.0, 0.0, 1.0);
    vec3 tangent = normalize(cross(up, geomNorm));
    vec3 bitangent = cross(geomNorm, tangent);
    return normalize(tangent * mapNor.x + bitangent * mapNor.y + geomNorm * mapNor.z);
  }

  void main() {
    vec3 geomNorm = normalize(vWorldNormal);

    // 1. Sharpen Triplanar Weights (prevents blurry 45-degree ghosting smear)
    vec3 triWeights = pow(abs(geomNorm), vec3(6.0));
    triWeights /= (triWeights.x + triWeights.y + triWeights.z + 0.0001);

    // 2. Full 3-Axis Triplanar Coordinates for Cliff Rock
    float cliffScale = uCliffRepeat * 0.1;
    vec2 uvX = vWorldPosition.zy * cliffScale;
    vec2 uvY_cliff = vWorldPosition.xz * cliffScale;
    vec2 uvZ = vWorldPosition.xy * cliffScale;

    // Walkable soil planar coordinates (world-space based to prevent UV stretching)
    vec2 uvWalkable = vWorldPosition.xz * (uTextureRepeat * 0.1);

    // 3. Sample Cliff Rock along 3 axes (Rock_02 Deccan basalt)
    vec4 cliffDiffX = texture(uCliffDiff, uvX);
    vec4 cliffDiffY = texture(uCliffDiff, uvY_cliff);
    vec4 cliffDiffZ = texture(uCliffDiff, uvZ);
    vec3 cliffColor = cliffDiffX.rgb * triWeights.x + cliffDiffY.rgb * triWeights.y + cliffDiffZ.rgb * triWeights.z;

    vec4 cliffArmX = texture(uCliffArm, uvX);
    vec4 cliffArmY = texture(uCliffArm, uvY_cliff);
    vec4 cliffArmZ = texture(uCliffArm, uvZ);
    vec4 cliffArm = cliffArmX * triWeights.x + cliffArmY * triWeights.y + cliffArmZ * triWeights.z;
    float rockHeight = cliffArm.a > 0.01 ? cliffArm.a : (cliffColor.r * 0.8);

    // 4. Sample Walkable Laterite Soil (Dirt_03 retro pixel art)
    vec4 walkableDiffSample = texture(uWalkableDiff, uvWalkable);
    vec4 walkableArmSample = texture(uWalkableArm, uvWalkable);
    float soilHeight = walkableArmSample.a > 0.01 ? walkableArmSample.a : (walkableDiffSample.r * 0.8);

    // 5. State Buffer Sampling (Wetness, Mud Locking, Sprouting Grass)
    vec4 state = texture(uStateTexture, vTerrainUv);
    float wetness = clamp(state.g, 0.0, 1.0);
    float locked = clamp(state.b, 0.0, 1.0);
    float grass = clamp(state.a, 0.0, 1.0);

    // 6. Slope Steepness & Height-Based Transition (Game Engine Splatmap)
    // Walkable vs cliff transition starts at slope ~35 deg (geomNorm.y ~ 0.82)
    float slopeFactor = 1.0 - smoothstep(0.68, 0.82, geomNorm.y);
    float cliffBlend = heightBlend(soilHeight, rockHeight, slopeFactor, 0.18);

    // Suppress cliff rock inside excavated pond depressions so crater banks remain earthy mud
    float effectiveCliffBlend = cliffBlend * (1.0 - smoothstep(0.05, 0.40, wetness));

    // Sahyadri Walkable Soil & Cliff Rock (Original Texture Colors)
    vec3 soilColor = walkableDiffSample.rgb;
    vec3 rockColor = cliffColor;

    // Blend Diffuse & ARM
    vec3 baseColor = mix(soilColor, rockColor, effectiveCliffBlend);
    vec3 arm = mix(walkableArmSample.rgb, cliffArm.rgb, effectiveCliffBlend);
    float ao = arm.r;
    float rawRoughness = arm.g;

    // 7. Triplanar Normal Perturbation for Rock Cliff (Deccan Basalt)
    vec3 tnormalX = unpackNormal(texture(uCliffNor, uvX), 0.9);
    vec3 tnormalY = unpackNormal(texture(uCliffNor, uvY_cliff), 0.9);
    vec3 tnormalZ = unpackNormal(texture(uCliffNor, uvZ), 0.9);

    vec3 nX = vec3(tnormalX.z * sign(geomNorm.x), tnormalX.y, tnormalX.x);
    vec3 nY = vec3(tnormalY.x, tnormalY.z * sign(geomNorm.y), tnormalY.y);
    vec3 nZ = vec3(tnormalZ.x, tnormalZ.y, tnormalZ.z * sign(geomNorm.z));

    vec3 cliffWorldNormal = normalize(nX * triWeights.x + nY * triWeights.y + nZ * triWeights.z);

    // Robust TBN perturbation for Walkable Retro Soil (Dirt_03)
    vec3 walkableNorSample = unpackNormal(texture(uWalkableNor, uvWalkable), 0.75);
    vec3 walkableWorldNormal = computeTerrainNormal(geomNorm, walkableNorSample);

    // Blend Walkable vs Cliff normals in World Space
    vec3 blendedWorldNormal = normalize(mix(walkableWorldNormal, cliffWorldNormal, effectiveCliffBlend));

    // 8. Surface Shading & Hydration States (Wet Mud, Tarpaulin Water, Grass)
    // Authentic Matte Roughness: Dry soil is non-reflective matte (0.88 - 0.98), eliminating plastic glare
    float dryRoughness = mix(0.88, 0.98, rawRoughness);
    float baseRoughness = dryRoughness;

    // Wet Soil (Dirt_02 watered dark mud) - Glistening highlights when hydrated.
    float soilWetness = smoothstep(0.02, 0.70, wetness);
    if (soilWetness > 0.001) {
      vec4 crackedDiffSample = texture(uCrackedDiff, uvWalkable);
      vec3 wetColor = crackedDiffSample.rgb;
      float wetRoughness = mix(dryRoughness, 0.32, soilWetness);
      baseColor = mix(baseColor, wetColor, soilWetness);
      baseRoughness = mix(baseRoughness, wetRoughness, soilWetness);
      ao = mix(ao, 0.95, soilWetness);
    }

    // Blue Tarpaulin Pond Basin Water (Option A: Shader-Integrated)
    // Renders strictly within excavated crater basins (wetness > 0.68)
    // Matches DioramaBaseWaterPlane scale (1.6 per meter) and roughness (0.35)
    float waterFactor = smoothstep(0.68, 0.90, wetness);
    if (waterFactor > 0.001) {
      vec2 uvWater = vWorldPosition.xz * 1.6;
      vec4 waterDiffSample = texture(uWaterDiff, uvWater);
      vec4 waterNorSample = texture(uWaterNor, uvWater);

      baseColor = mix(baseColor, waterDiffSample.rgb, waterFactor);
      baseRoughness = mix(baseRoughness, 0.35, waterFactor);

      // Perturb surface normal with blue tarp wrinkles
      vec3 waterNor = unpackNormal(waterNorSample, 0.85);
      vec3 waterWorldNormal = computeTerrainNormal(geomNorm, waterNor);
      blendedWorldNormal = normalize(mix(blendedWorldNormal, waterWorldNormal, waterFactor));
      ao = mix(ao, 1.0, waterFactor);
    }

    // Sprouting Mustard Foliage Grass (Grass_01 retro pixel sprigs)
    if (grass > 0.0) {
      vec4 grassDiffSample = texture(uGrassDiff, uvWalkable * 1.2);
      vec3 sproutColor = grassDiffSample.rgb;
      baseColor = mix(baseColor, sproutColor, grass * 0.92);
      baseRoughness = mix(baseRoughness, 0.82, grass * 0.85);
      ao = mix(ao, 0.75, grass * 0.5);
    }

    // Locked mud compaction
    if (locked > 0.5) {
      baseRoughness = clamp(baseRoughness + 0.04, 0.0, 1.0);
    }

    // 8.5. Direct Terrain Texture Painting Studio (Ticket 06)
    // Sits directly on top of base terrain using original texture colors
    ivec2 texSize = textureSize(uPaintState, 0);
    vec2 pCoord = vTerrainUv * vec2(texSize);
    ivec2 nearestCoord = clamp(ivec2(floor(pCoord)), ivec2(0), texSize - ivec2(1));
    vec4 nearestState = texelFetch(uPaintState, nearestCoord, 0);

    // Bilinear filtering on paintWeight (alpha) eliminates blocky texel staircase while keeping layer IDs strictly discrete
    vec2 f = fract(pCoord - 0.5);
    ivec2 c00 = clamp(ivec2(floor(pCoord - 0.5)), ivec2(0), texSize - ivec2(1));
    ivec2 c10 = clamp(c00 + ivec2(1, 0), ivec2(0), texSize - ivec2(1));
    ivec2 c01 = clamp(c00 + ivec2(0, 1), ivec2(0), texSize - ivec2(1));
    ivec2 c11 = clamp(c00 + ivec2(1, 1), ivec2(0), texSize - ivec2(1));
    vec4 s00 = texelFetch(uPaintState, c00, 0);
    vec4 s10 = texelFetch(uPaintState, c10, 0);
    vec4 s01 = texelFetch(uPaintState, c01, 0);
    vec4 s11 = texelFetch(uPaintState, c11, 0);

    float paintWeight = mix(mix(s00.a, s10.a, f.x), mix(s01.a, s11.a, f.x), f.y);

    if (paintWeight > 0.001) {
      vec2 paintUv = vWorldPosition.xz * (uPaintRepeat * 0.1);
      // Discrete layer IDs from the nearest cell center - strictly prevents any interpolation across unrelated textures
      float layerA = floor(nearestState.r * 255.0 + 0.5);
      float layerB = floor(nearestState.g * 255.0 + 0.5);

      // Smooth bilinear interpolation of blendFactor when neighbor cells share the same layer pair
      bool sameLayers = (s00.rg == nearestState.rg) && (s10.rg == nearestState.rg) &&
                        (s01.rg == nearestState.rg) && (s11.rg == nearestState.rg);
      float blendFactor = sameLayers ? mix(mix(s00.b, s10.b, f.x), mix(s01.b, s11.b, f.x), f.y) : nearestState.b;

      vec4 colA = texture(uPaintAtlas, vec3(paintUv, layerA));
      vec4 colB = texture(uPaintAtlas, vec3(paintUv, layerB));
      vec3 paintedColor = mix(colA.rgb, colB.rgb, blendFactor);

      baseColor = mix(baseColor, paintedColor, paintWeight);

      // Water layer (layer 51) receives authentic liquid gloss (0.35) matching water plane
      float isWaterLayer = step(50.5, max(layerA, layerB));
      float paintedRoughness = mix(0.90, 0.35, isWaterLayer);
      baseRoughness = mix(baseRoughness, paintedRoughness, paintWeight);
    }

    // Assign to CSM outputs
    csm_DiffuseColor = vec4(baseColor, 1.0);
    csm_Roughness = clamp(baseRoughness, 0.1, 1.0);
    csm_Metalness = 0.0;
    csm_AO = ao;

    // CRITICAL: Transform World-Space Normal into View-Space Normal for CSM MeshStandardMaterial!
    csm_FragNormal = normalize((viewMatrix * vec4(blendedWorldNormal, 0.0)).xyz);
  }
`;

export interface CreateTerrainMaterialOptions {
  stateTexture: THREE.DataTexture;
  paintStateTexture?: THREE.DataTexture | null;
  paintAtlasTexture?: THREE.DataArrayTexture | null;
  paintRepeat?: number;
  walkableDiff?: THREE.Texture | null;
  walkableArm?: THREE.Texture | null;
  walkableNor?: THREE.Texture | null;
  cliffDiff?: THREE.Texture | null;
  cliffArm?: THREE.Texture | null;
  cliffNor?: THREE.Texture | null;
  crackedDiff?: THREE.Texture | null;
  grassDiff?: THREE.Texture | null;
  waterDiff?: THREE.Texture | null;
  waterNor?: THREE.Texture | null;
  textureRepeat?: number;
  cliffRepeat?: number;
  // Deprecated/backward-compatible optional fields (ignored in shader)
  walkableDisp?: THREE.Texture | null;
  cliffDisp?: THREE.Texture | null;
  crackedArm?: THREE.Texture | null;
  crackedNor?: THREE.Texture | null;
  pathDiff?: THREE.Texture | null;
  pathArm?: THREE.Texture | null;
  pathNor?: THREE.Texture | null;
  grassArm?: THREE.Texture | null;
  grassNor?: THREE.Texture | null;
  waterArm?: THREE.Texture | null;
}

/**
 * Creates a CustomShaderMaterial instance extending MeshStandardMaterial with slope-aware
 * retro PBR texture blending (height-blended triplanar basalt rock cliffs, view-space normal perturbation, wet mud, and blue tarp water).
 * Uses strictly 11 samplers to guarantee compliance with MAX_TEXTURE_IMAGE_UNITS(16).
 */
export function createTerrainMaterial(options: CreateTerrainMaterialOptions): CustomShaderMaterial {
  const {
    stateTexture,
    paintStateTexture = fallbackPaintState,
    paintAtlasTexture = fallbackPaintAtlas,
    paintRepeat = 16.0,
    walkableDiff = fallbackWalkableDiff,
    walkableArm = fallbackArm,
    walkableNor = fallbackFlatNormal,
    cliffDiff = fallbackCliffDiff,
    cliffArm = fallbackArm,
    cliffNor = fallbackFlatNormal,
    crackedDiff = fallbackCrackedDiff,
    grassDiff = fallbackGrassDiff,
    waterDiff = fallbackWaterDiff,
    waterNor = fallbackFlatNormal,
    textureRepeat = 8.0,
    cliffRepeat = 6.0,
  } = options;

  return new CustomShaderMaterial({
    baseMaterial: THREE.MeshStandardMaterial,
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    uniforms: {
      uStateTexture: { value: stateTexture },
      uPaintState: { value: paintStateTexture || fallbackPaintState },
      uPaintAtlas: { value: paintAtlasTexture || fallbackPaintAtlas },
      uPaintRepeat: { value: paintRepeat },
      uWalkableDiff: { value: walkableDiff || fallbackWalkableDiff },
      uWalkableArm: { value: walkableArm || fallbackArm },
      uWalkableNor: { value: walkableNor || fallbackFlatNormal },
      uCliffDiff: { value: cliffDiff || fallbackCliffDiff },
      uCliffArm: { value: cliffArm || fallbackArm },
      uCliffNor: { value: cliffNor || fallbackFlatNormal },
      uCrackedDiff: { value: crackedDiff || fallbackCrackedDiff },
      uGrassDiff: { value: grassDiff || fallbackGrassDiff },
      uWaterDiff: { value: waterDiff || fallbackWaterDiff },
      uWaterNor: { value: waterNor || fallbackFlatNormal },
      uTextureRepeat: { value: textureRepeat },
      uCliffRepeat: { value: cliffRepeat },
    },
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.FrontSide,
  });
}

