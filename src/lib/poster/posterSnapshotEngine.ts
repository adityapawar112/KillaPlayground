/**
 * posterSnapshotEngine.ts
 * Headless offscreen 3D snapshot engine for Killa Playground.
 * Renders cinematic diorama camera perspectives into fixed-resolution offscreen
 * WebGLRenderTargets with authentic diurnal lighting and atmospheric sky backgrounds,
 * completely independent of the user's browser window size or screen DPI.
 */

import * as THREE from 'three';
import {
  AtmosphericLightingConfig,
  getAtmosphericLighting,
} from '../lighting/atmosphericLighting';

export type CameraPerspectiveId = 'isometric' | 'top' | 'rampart' | 'bastion' | 'current';
export type TimePresetId = 'dawn' | 'noon' | 'sunset' | 'night';

export interface CameraPerspectiveDef {
  id: CameraPerspectiveId;
  name: string;
  marathiName: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export const CAMERA_PERSPECTIVES: Record<Exclude<CameraPerspectiveId, 'current'>, CameraPerspectiveDef> = {
  isometric: {
    id: 'isometric',
    name: 'Isometric (45°)',
    marathiName: 'त्रिमितीय देखावा (४५°)',
    position: [7, 7, 7],
    target: [0, 0.5, 0],
    fov: 45,
  },
  top: {
    id: 'top',
    name: "Bird's Eye (Top-Down)",
    marathiName: 'विहंगम देखावा (वरतून)',
    position: [0, 14, 0.001],
    target: [0, 0, 0],
    fov: 42,
  },
  rampart: {
    id: 'rampart',
    name: 'Rampart Eye (15° Low)',
    marathiName: 'तटबंदी देखावा (१५°)',
    position: [3, 1.2, 4.5],
    target: [0, 0.8, 0],
    fov: 48,
  },
  bastion: {
    id: 'bastion',
    name: 'Bastion Hero (30° Citadel)',
    marathiName: 'बुरुज व बालेकिल्ला (३०°)',
    position: [-4.5, 2.5, 4.5],
    target: [0, 1.0, 0],
    fov: 40,
  },
};

/**
 * Accesses active Three.js GL, Scene, and Camera from global bridge
 */
export function getThreeBridge(): {
  gl: THREE.WebGLRenderer | null;
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
} {
  if (typeof window === 'undefined') {
    return { gl: null, scene: null, camera: null };
  }
  return {
    gl: (window as any).__threeGL || null,
    scene: (window as any).__threeScene || null,
    camera: (window as any).__threeCamera || null,
  };
}

/**
 * Resolves the atmospheric lighting configuration for a given time preset or live viewport state
 */
export function getAtmosphericConfigForPreset(timePreset?: TimePresetId): AtmosphericLightingConfig {
  if (timePreset === 'dawn') {
    return getAtmosphericLighting(6.0, false, 12, 90);
  }
  if (timePreset === 'noon') {
    return getAtmosphericLighting(12.0, false, 75, 180);
  }
  if (timePreset === 'sunset') {
    return getAtmosphericLighting(17.5, false, 20, 255);
  }
  if (timePreset === 'night') {
    return getAtmosphericLighting(21.0, true, 52, 230);
  }

  // Fallback to active viewport editor state if available
  if (typeof window !== 'undefined' && (window as any).__killa_editorStore) {
    const s = (window as any).__killa_editorStore.getState();
    return getAtmosphericLighting(s.timeOfDay, s.nightMode, s.sunElevation, s.sunAzimuth);
  }

  return getAtmosphericLighting(12.0, false, 75, 180);
}

/**
 * Renders the authentic viewport atmospheric sky gradient (and stars for night mode) onto a 2D canvas
 */
export function drawAtmosphericSkyToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: AtmosphericLightingConfig
) {
  const { phaseName, isNight } = config;
  const cx = width * 0.5;

  if (isNight || phaseName === 'Diwali Night') {
    // Deep luminous indigo / midnight royal blue
    const cy = height * 0.25;
    const radius = Math.max(width, height) * 1.1;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0.0, '#1E3A8A');
    grad.addColorStop(0.35, '#172554');
    grad.addColorStop(0.70, '#0F172A');
    grad.addColorStop(1.0, '#030712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Twinkling celestial stars (deterministic LCG so it never flickers)
    let seed = 42;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    const starCount = 80;
    for (let i = 0; i < starCount; i++) {
      const sx = rnd() * width;
      const sy = rnd() * height * 0.70;
      const sr = 0.6 + rnd() * 1.4;
      const sa = 0.35 + rnd() * 0.6;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 248, 255, ${sa})`;
      ctx.fill();
    }
  } else if (phaseName === 'Dawn') {
    // Soft rose-gold & peach morning glow
    const cy = height * 0.95;
    const radius = Math.max(width, height) * 1.1;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0.0, '#FED7AA');
    grad.addColorStop(0.25, '#FCA5A5');
    grad.addColorStop(0.65, '#475569');
    grad.addColorStop(1.0, '#1E293B');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else if (phaseName === 'Golden Hour' || phaseName === 'Dusk') {
    // Radiant fiery amber & saffron sunset
    const cy = height * 0.95;
    const radius = Math.max(width, height) * 1.15;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0.0, '#FB923C');
    grad.addColorStop(0.30, '#EA580C');
    grad.addColorStop(0.60, '#9A3412');
    grad.addColorStop(0.85, '#312E81');
    grad.addColorStop(1.0, '#0F172A');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Noon: Crisp sunny blue sky
    const cy = 0;
    const radius = Math.max(width, height) * 1.1;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0.0, '#7DD3FC');
    grad.addColorStop(0.35, '#BAE6FD');
    grad.addColorStop(0.70, '#E0F2FE');
    grad.addColorStop(1.0, '#F9F6F0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Temporarily overrides the scene's lights, fog, and tone mapping
 * to match a specific atmospheric configuration, returning a restore callback.
 */
export function applyAtmosphericConfigToScene(
  scene: THREE.Scene,
  gl: THREE.WebGLRenderer,
  config: AtmosphericLightingConfig
): () => void {
  const prevExposure = gl.toneMappingExposure;
  const prevFogColor = scene.fog && scene.fog instanceof THREE.FogExp2 ? scene.fog.color.getHex() : null;
  const prevFogDensity = scene.fog && scene.fog instanceof THREE.FogExp2 ? scene.fog.density : null;

  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = config.toneMappingExposure;

  if (scene.fog && scene.fog instanceof THREE.FogExp2) {
    scene.fog.color.set(config.fogColor);
    scene.fog.density = config.fogDensity;
  }

  interface RestorableLight {
    light: THREE.Light;
    color: THREE.Color;
    intensity: number;
    groundColor?: THREE.Color;
    position?: THREE.Vector3;
  }
  const restoredLights: RestorableLight[] = [];

  scene.traverse((obj) => {
    if (obj instanceof THREE.AmbientLight) {
      restoredLights.push({ light: obj, color: obj.color.clone(), intensity: obj.intensity });
      obj.color.set(config.ambientColor);
      obj.intensity = config.ambientIntensity;
    } else if (obj instanceof THREE.DirectionalLight) {
      restoredLights.push({
        light: obj,
        color: obj.color.clone(),
        intensity: obj.intensity,
        position: obj.position.clone(),
      });
      if (obj.castShadow) {
        // Sun / Moon primary directional light
        obj.color.set(config.sunColor);
        obj.intensity = config.sunIntensity;
        obj.position.set(...config.sunPosition);
      } else {
        // Mud bounce indirect light
        obj.color.set(config.bounceColor);
        obj.intensity = config.bounceIntensity;
        obj.position.set(...config.bouncePosition);
      }
    } else if (obj instanceof THREE.HemisphereLight) {
      restoredLights.push({
        light: obj,
        color: obj.color.clone(),
        intensity: obj.intensity,
        groundColor: obj.groundColor.clone(),
      });
      obj.color.set(config.hemisphereSkyColor);
      obj.groundColor.set(config.hemisphereGroundColor);
      obj.intensity = config.hemisphereIntensity;
    } else if (obj instanceof THREE.PointLight) {
      // Diya point lights
      restoredLights.push({
        light: obj,
        color: obj.color.clone(),
        intensity: obj.intensity,
      });
      if (config.isNight) {
        if (obj.intensity === 0) {
          obj.intensity = 1.8;
          obj.color.set('#F59E0B');
        }
      } else {
        obj.intensity = 0.2;
      }
    }
  });

  return () => {
    gl.toneMappingExposure = prevExposure;
    if (scene.fog && scene.fog instanceof THREE.FogExp2 && prevFogColor !== null && prevFogDensity !== null) {
      scene.fog.color.setHex(prevFogColor);
      scene.fog.density = prevFogDensity;
    }
    for (const item of restoredLights) {
      item.light.color.copy(item.color);
      item.light.intensity = item.intensity;
      if (item.groundColor && item.light instanceof THREE.HemisphereLight) {
        item.light.groundColor.copy(item.groundColor);
      }
      if (item.position && item.light instanceof THREE.DirectionalLight) {
        item.light.position.copy(item.position);
      }
    }
  };
}

/**
 * Renders an offscreen snapshot of the 3D scene at exact width and height with
 * authentic diurnal lighting and atmospheric sky gradient.
 */
export async function captureHeadlessSnapshot(params: {
  perspective?: CameraPerspectiveId;
  timePreset?: TimePresetId;
  customPose?: {
    position: [number, number, number];
    target: [number, number, number];
    fov?: number;
  };
  width: number;
  height: number;
}): Promise<HTMLCanvasElement> {
  const { perspective = 'isometric', timePreset, customPose, width, height } = params;
  const { gl, scene, camera: activeCamera } = getThreeBridge();
  const config = getAtmosphericConfigForPreset(timePreset);

  // Fallback 2D canvas if WebGL is unavailable (e.g., SSR or unit tests)
  if (!gl || !scene || typeof document === 'undefined') {
    if (typeof document === 'undefined') {
      return { width, height, toDataURL: () => 'data:image/png;base64,mock' } as any;
    }
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = width;
    fallbackCanvas.height = height;
    const ctx = fallbackCanvas.getContext('2d')!;
    drawAtmosphericSkyToCanvas(ctx, width, height, config);
    ctx.fillStyle = '#4B382C';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Snapshot (${perspective} • ${config.phaseName})`, width / 2, height / 2);
    return fallbackCanvas;
  }

  // 1. Determine camera positioning and target
  let camPos: [number, number, number];
  let camTarget: [number, number, number];
  let camFov: number;

  if (customPose) {
    camPos = customPose.position;
    camTarget = customPose.target;
    camFov = customPose.fov || 45;
  } else if (perspective === 'current' && activeCamera) {
    camPos = [activeCamera.position.x, activeCamera.position.y, activeCamera.position.z];
    const dir = new THREE.Vector3();
    activeCamera.getWorldDirection(dir);
    camTarget = [
      activeCamera.position.x + dir.x * 5,
      activeCamera.position.y + dir.y * 5,
      activeCamera.position.z + dir.z * 5,
    ];
    camFov = activeCamera.fov;
  } else if (perspective !== 'current' && CAMERA_PERSPECTIVES[perspective]) {
    const def = CAMERA_PERSPECTIVES[perspective];
    camPos = def.position;
    camTarget = def.target;
    camFov = def.fov;
  } else {
    const def = CAMERA_PERSPECTIVES.isometric;
    camPos = def.position;
    camTarget = def.target;
    camFov = def.fov;
  }

  // 2. Setup dedicated offscreen camera with exact aspect ratio
  const snapCam = new THREE.PerspectiveCamera(camFov, width / height, 0.1, 150);
  snapCam.position.set(...camPos);
  snapCam.lookAt(new THREE.Vector3(...camTarget));
  snapCam.updateProjectionMatrix();

  // 3. Create offscreen WebGLRenderTarget with alpha support
  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    colorSpace: gl.outputColorSpace || THREE.SRGBColorSpace,
  });

  // 4. Apply diurnal lighting overrides to scene for snapshot
  const restoreLighting = applyAtmosphericConfigToScene(scene, gl, config);

  const prevRenderTarget = gl.getRenderTarget();
  gl.setRenderTarget(renderTarget);
  // Clear with transparent alpha so 3D meshes have alpha 1 and empty sky has alpha 0
  gl.setClearColor(0x000000, 0);
  gl.clear();
  gl.render(scene, snapCam);
  gl.setRenderTarget(prevRenderTarget);

  // Restore live scene lighting immediately
  restoreLighting();

  // 5. Read 3D pixels from render target
  const pixelBuffer = new Uint8Array(width * height * 4);
  gl.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixelBuffer);

  // Cleanly dispose render target immediately to ensure Zero GPU Leaks
  renderTarget.dispose();

  // 6. Draw 3D render to offscreen temporary canvas with vertical flip
  const temp3DCanvas = document.createElement('canvas');
  temp3DCanvas.width = width;
  temp3DCanvas.height = height;
  const tempCtx = temp3DCanvas.getContext('2d')!;
  const imgData = tempCtx.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 4;
    const dstRow = y * width * 4;
    imgData.data.set(pixelBuffer.subarray(srcRow, srcRow + width * 4), dstRow);
  }
  tempCtx.putImageData(imgData, 0, 0);

  // 7. Composite final output canvas: atmospheric sky gradient as base, 3D diorama on top
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const outCtx = outputCanvas.getContext('2d')!;

  // Render authentic sky gradient
  drawAtmosphericSkyToCanvas(outCtx, width, height, config);

  // Composite 3D diorama layer over sky gradient
  outCtx.drawImage(temp3DCanvas, 0, 0);

  return outputCanvas;
}

/**
 * Headless snapshot for Viewport quick screenshot button in DioramaQuickBar
 * Captures 1920 × 1080 from the current active viewport angle with active lighting and sky.
 */
export async function captureHeadlessDioramaSnapshot(
  width: number = 1920,
  height: number = 1080
): Promise<{ dataUrl: string; canvas: HTMLCanvasElement }> {
  const canvas = await captureHeadlessSnapshot({
    perspective: 'current',
    width,
    height,
  });
  const dataUrl = canvas.toDataURL('image/png');
  return { dataUrl, canvas };
}
