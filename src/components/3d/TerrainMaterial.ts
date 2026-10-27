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

  // Cotangent Frame normal perturbation for arbitrary surface UVs
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

    // 1. Sharpen Triplanar Weights (prevents blurry 45-degree ghosting smear)
    vec3 triWeights = pow(abs(geomNorm), vec3(6.0));
    triWeights /= (triWeights.x + triWeights.y + triWeights.z + 0.0001);

    // 2. Full 3-Axis Triplanar Coordinates for Cliff Rock
    float cliffScale = uCliffRepeat * 0.12;
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

    // 5. Slope Steepness & Height-Based Transition (Game Engine Splatmap)
    // Walkable vs cliff transition starts at slope ~35 deg (geomNorm.y ~ 0.82)
    float slopeFactor = 1.0 - smoothstep(0.68, 0.82, geomNorm.y);
    float cliffBlend = heightBlend(soilHeight, rockHeight, slopeFactor, 0.18);

    // Sahyadri Tambdi Maati (Red Laterite Soil) warmth calibration on pixel art
    vec3 soilColor = walkableDiffSample.rgb * vec3(1.24, 0.90, 0.80);
    vec3 rockColor = cliffColor * vec3(0.96, 0.96, 0.98);

    // Blend Diffuse & ARM
    vec3 baseColor = mix(soilColor, rockColor, cliffBlend);
    vec3 arm = mix(walkableArmSample.rgb, cliffArm.rgb, cliffBlend);
    float ao = arm.r;
    float rawRoughness = arm.g;

    // 6. Triplanar Normal Perturbation for Rock Cliff
    vec3 tnormalX = unpackNormal(texture(uCliffNor, uvX), 1.0);
    vec3 tnormalY = unpackNormal(texture(uCliffNor, uvY_cliff), 1.0);
    vec3 tnormalZ = unpackNormal(texture(uCliffNor, uvZ), 1.0);

    // Whiteout projection: orient tangent normals to World X, Y, Z axes
    vec3 cliffNormWorldX = vec3(0.0, tnormalX.yx) + geomNorm;
    vec3 cliffNormWorldY = vec3(tnormalY.x, 0.0, tnormalY.y) + geomNorm;
    vec3 cliffNormWorldZ = vec3(tnormalZ.xy, 0.0) + geomNorm;

    vec3 cliffWorldNormal = normalize(
      cliffNormWorldX * triWeights.x +
      cliffNormWorldY * triWeights.y +
      cliffNormWorldZ * triWeights.z
    );

    // Cotangent Frame perturbation for Walkable Retro Soil
    vec3 walkableNorSample = unpackNormal(texture(uWalkableNor, uvWalkable), 1.0);
    vec3 walkableWorldNormal = perturbNormal(geomNorm, walkableNorSample, uvWalkable, vWorldPosition);

    // Blend Walkable vs Cliff normals in World Space
    vec3 blendedWorldNormal = normalize(mix(walkableWorldNormal, cliffWorldNormal, cliffBlend));

    // 7. State Buffer Interaction (Water, Wet Mud, Grass, Locked)
    vec4 state = texture(uStateTexture, vTerrainUv);
    float wetness = clamp(state.g, 0.0, 1.0);
    float locked = clamp(state.b, 0.0, 1.0);
    float grass = clamp(state.a, 0.0, 1.0);

    // Preserve natural micro-roughness contrast (0.40 to 0.95)
    float dryRoughness = clamp(rawRoughness * 1.05, 0.40, 0.95);
    float baseRoughness = dryRoughness;

    // Wet Soil (Dirt_02 watered dark mud)
    if (wetness > 0.0) {
      vec4 crackedDiffSample = texture(uCrackedDiff, uvWalkable);
      vec4 crackedArmSample = texture(uCrackedArm, uvWalkable);
      vec3 wetColor = crackedDiffSample.rgb * vec3(0.68, 0.54, 0.48);
      float wetRoughness = mix(dryRoughness, 0.15 + crackedArmSample.g * 0.15, wetness);
      baseColor = mix(baseColor, wetColor, wetness);
      baseRoughness = mix(baseRoughness, wetRoughness, wetness);
      ao = mix(ao, crackedArmSample.r, wetness);
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
    baseColor *= mix(0.68, 1.0, ao);

    // Assign to CSM outputs
    csm_DiffuseColor = vec4(baseColor, 1.0);
    csm_Roughness = clamp(baseRoughness, 0.08, 1.0);
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
    textureRepeat = 16.0,
    cliffRepeat = 12.0,
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
      uTextureRepeat: { value: textureRepeat },
      uCliffRepeat: { value: cliffRepeat },
    },
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.FrontSide,
  });
}

