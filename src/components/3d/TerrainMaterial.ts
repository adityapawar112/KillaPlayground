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
export const fallbackWaterDiff = createColorTexture(2, 132, 199);    // #0284C7 blue tarpaulin water
export const fallbackWaterArm = createColorTexture(255, 60, 20);     // AO=1.0, Roughness=0.24, Metal=0.08
export const fallbackArm = createColorTexture(255, 230, 0);          // AO=1.0, Roughness=0.90, Metal=0
export const fallbackFlatNormal = createColorTexture(128, 128, 255); // Flat tangent-space normal (0, 0, 1)
export const fallbackDisp = createColorTexture(128, 128, 128);       // Midpoint height (0.5)

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
  uniform sampler2D uWalkableDisp;
  uniform sampler2D uCliffDiff;
  uniform sampler2D uCliffArm;
  uniform sampler2D uCliffNor;
  uniform sampler2D uCliffDisp;
  uniform sampler2D uCrackedDiff;
  uniform sampler2D uCrackedArm;
  uniform sampler2D uCrackedNor;
  uniform sampler2D uPathDiff;
  uniform sampler2D uPathArm;
  uniform sampler2D uPathNor;
  uniform sampler2D uGrassDiff;
  uniform sampler2D uGrassArm;
  uniform sampler2D uGrassNor;
  uniform sampler2D uWaterDiff;
  uniform sampler2D uWaterArm;
  uniform sampler2D uWaterNor;
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

    vec4 cliffDispX = texture(uCliffDisp, uvX);
    vec4 cliffDispY = texture(uCliffDisp, uvY_cliff);
    vec4 cliffDispZ = texture(uCliffDisp, uvZ);
    float rockDispHeight = cliffDispX.r * triWeights.x + cliffDispY.r * triWeights.y + cliffDispZ.r * triWeights.z;
    float rockHeight = max(rockDispHeight, cliffArm.a);

    // 4. Sample Walkable Laterite Soil (Dirt_03 retro pixel art)
    vec4 walkableDiffSample = texture(uWalkableDiff, uvWalkable);
    vec4 walkableArmSample = texture(uWalkableArm, uvWalkable);
    vec4 walkableDispSample = texture(uWalkableDisp, uvWalkable);
    float soilHeight = max(walkableDispSample.r, walkableArmSample.a);

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

    // Sahyadri Tambdi Maati (Red Laterite Soil) warmth calibration on pixel art
    vec3 soilColor = walkableDiffSample.rgb * vec3(1.24, 0.90, 0.80);
    vec3 rockColor = cliffColor * vec3(0.96, 0.96, 0.98);

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

    // 8. Surface Shading & Hydration States (Wet Mud, Tarpaulin Water, Grass, Compaction)
    // Authentic Matte Roughness: Dry soil is non-reflective matte (0.88 - 0.98), eliminating plastic glare
    float dryRoughness = mix(0.88, 0.98, rawRoughness);
    float baseRoughness = dryRoughness;

    // Wet Soil (Dirt_02 watered dark mud / chikhal) - Glistening highlights when hydrated.
    // Retains rich wet mud up to the rim edge of the depression.
    float soilWetness = smoothstep(0.02, 0.70, wetness);
    if (soilWetness > 0.001) {
      vec4 crackedDiffSample = texture(uCrackedDiff, uvWalkable);
      vec4 crackedArmSample = texture(uCrackedArm, uvWalkable);
      vec3 wetColor = crackedDiffSample.rgb * vec3(0.60, 0.46, 0.38);
      float wetRoughness = mix(dryRoughness, mix(0.24, 0.48, crackedArmSample.g), soilWetness);
      baseColor = mix(baseColor, wetColor, soilWetness);
      baseRoughness = mix(baseRoughness, wetRoughness, soilWetness);
      ao = mix(ao, crackedArmSample.r, soilWetness);
    }

    // Blue Tarpaulin Pond Basin Water (Option A: Shader-Integrated)
    // Renders strictly within excavated crater basins (wetness > 0.68)
    float waterFactor = smoothstep(0.68, 0.90, wetness);
    if (waterFactor > 0.001) {
      vec2 uvWater = vWorldPosition.xz * 2.5; // Blue tarp scale
      vec4 waterDiffSample = texture(uWaterDiff, uvWater);
      vec4 waterNorSample = texture(uWaterNor, uvWater);
      vec4 waterArmSample = texture(uWaterArm, uvWater);

      // Crisp blue plastic tarpaulin sheet lining
      baseColor = mix(baseColor, waterDiffSample.rgb, waterFactor);
      baseRoughness = mix(baseRoughness, mix(0.08, 0.22, waterArmSample.g), waterFactor);

      // Perturb surface normal with blue tarp wrinkles
      vec3 waterNor = unpackNormal(waterNorSample, 0.85);
      vec3 waterWorldNormal = computeTerrainNormal(geomNorm, waterNor);
      blendedWorldNormal = normalize(mix(blendedWorldNormal, waterWorldNormal, waterFactor));
      ao = mix(ao, waterArmSample.r, waterFactor);
    }

    // Sprouting Mustard Foliage Grass (Grass_01 retro pixel sprigs)
    if (grass > 0.0) {
      vec4 grassDiffSample = texture(uGrassDiff, uvWalkable * 1.2);
      vec4 grassArmSample = texture(uGrassArm, uvWalkable * 1.2);
      vec3 sproutColor = grassDiffSample.rgb * vec3(1.10, 1.24, 0.95);
      baseColor = mix(baseColor, sproutColor, grass * 0.92);
      baseRoughness = mix(baseRoughness, mix(0.70, 0.90, grassArmSample.g), grass * 0.85);
      ao = mix(ao, grassArmSample.r, grass * 0.5);
    }

    // Locked mud compaction
    if (locked > 0.5) {
      baseColor *= 0.95;
      baseRoughness = clamp(baseRoughness + 0.04, 0.0, 1.0);
    }

    // Apply Cavity Darkening on diffuse for rich depth in cracks
    baseColor *= mix(0.72, 1.0, ao);

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
  walkableDiff?: THREE.Texture | null;
  walkableArm?: THREE.Texture | null;
  walkableNor?: THREE.Texture | null;
  walkableDisp?: THREE.Texture | null;
  cliffDiff?: THREE.Texture | null;
  cliffArm?: THREE.Texture | null;
  cliffNor?: THREE.Texture | null;
  cliffDisp?: THREE.Texture | null;
  crackedDiff?: THREE.Texture | null;
  crackedArm?: THREE.Texture | null;
  crackedNor?: THREE.Texture | null;
  pathDiff?: THREE.Texture | null;
  pathArm?: THREE.Texture | null;
  pathNor?: THREE.Texture | null;
  grassDiff?: THREE.Texture | null;
  grassArm?: THREE.Texture | null;
  grassNor?: THREE.Texture | null;
  waterDiff?: THREE.Texture | null;
  waterArm?: THREE.Texture | null;
  waterNor?: THREE.Texture | null;
  textureRepeat?: number;
  cliffRepeat?: number;
}

/**
 * Creates a CustomShaderMaterial instance extending MeshStandardMaterial with slope-aware
 * retro PBR texture blending (height-blended triplanar basalt rock cliffs, view-space normal perturbation, wet mud, and sprouting foliage).
 */
export function createTerrainMaterial(options: CreateTerrainMaterialOptions): CustomShaderMaterial {
  const {
    stateTexture,
    walkableDiff = fallbackWalkableDiff,
    walkableArm = fallbackArm,
    walkableNor = fallbackFlatNormal,
    walkableDisp = fallbackDisp,
    cliffDiff = fallbackCliffDiff,
    cliffArm = fallbackArm,
    cliffNor = fallbackFlatNormal,
    cliffDisp = fallbackDisp,
    crackedDiff = fallbackCrackedDiff,
    crackedArm = fallbackArm,
    crackedNor = fallbackFlatNormal,
    pathDiff = fallbackPathDiff,
    pathArm = fallbackArm,
    pathNor = fallbackFlatNormal,
    grassDiff = fallbackGrassDiff,
    grassArm = fallbackArm,
    grassNor = fallbackFlatNormal,
    waterDiff = fallbackWaterDiff,
    waterArm = fallbackWaterArm,
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
      uWalkableDiff: { value: walkableDiff || fallbackWalkableDiff },
      uWalkableArm: { value: walkableArm || fallbackArm },
      uWalkableNor: { value: walkableNor || fallbackFlatNormal },
      uWalkableDisp: { value: walkableDisp || fallbackDisp },
      uCliffDiff: { value: cliffDiff || fallbackCliffDiff },
      uCliffArm: { value: cliffArm || fallbackArm },
      uCliffNor: { value: cliffNor || fallbackFlatNormal },
      uCliffDisp: { value: cliffDisp || fallbackDisp },
      uCrackedDiff: { value: crackedDiff || fallbackCrackedDiff },
      uCrackedArm: { value: crackedArm || fallbackArm },
      uCrackedNor: { value: crackedNor || fallbackFlatNormal },
      uPathDiff: { value: pathDiff || fallbackPathDiff },
      uPathArm: { value: pathArm || fallbackArm },
      uPathNor: { value: pathNor || fallbackFlatNormal },
      uGrassDiff: { value: grassDiff || fallbackGrassDiff },
      uGrassArm: { value: grassArm || fallbackArm },
      uGrassNor: { value: grassNor || fallbackFlatNormal },
      uWaterDiff: { value: waterDiff || fallbackWaterDiff },
      uWaterArm: { value: waterArm || fallbackWaterArm },
      uWaterNor: { value: waterNor || fallbackFlatNormal },
      uTextureRepeat: { value: textureRepeat },
      uCliffRepeat: { value: cliffRepeat },
    },
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.FrontSide,
  });
}

