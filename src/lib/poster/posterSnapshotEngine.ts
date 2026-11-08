/**
 * posterSnapshotEngine.ts
 * Headless offscreen 3D snapshot engine for Killa Playground.
 * Renders cinematic diorama camera perspectives into fixed-resolution offscreen
 * WebGLRenderTargets, completely independent of the user's browser window size or screen DPI.
 */

import * as THREE from 'three';

export type CameraPerspectiveId = 'isometric' | 'top' | 'rampart' | 'bastion' | 'current';

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
 * Renders an offscreen snapshot of the 3D scene at exact width and height
 */
export async function captureHeadlessSnapshot(params: {
  perspective?: CameraPerspectiveId;
  customPose?: {
    position: [number, number, number];
    target: [number, number, number];
    fov?: number;
  };
  width: number;
  height: number;
}): Promise<HTMLCanvasElement> {
  const { perspective = 'isometric', customPose, width, height } = params;
  const { gl, scene, camera: activeCamera } = getThreeBridge();

  // Fallback 2D canvas if WebGL is unavailable (e.g., SSR or unit tests)
  if (!gl || !scene) {
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = width;
    fallbackCanvas.height = height;
    const ctx = fallbackCanvas.getContext('2d')!;
    ctx.fillStyle = '#D8C09D';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#4B382C';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Snapshot (${perspective})`, width / 2, height / 2);
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

  // 3. Create offscreen WebGLRenderTarget
  const renderTarget = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    colorSpace: gl.outputColorSpace || THREE.SRGBColorSpace,
  });

  // 4. Render offscreen
  const prevRenderTarget = gl.getRenderTarget();
  gl.setRenderTarget(renderTarget);
  gl.render(scene, snapCam);
  gl.setRenderTarget(prevRenderTarget);

  // 5. Read pixels from render target
  const pixelBuffer = new Uint8Array(width * height * 4);
  gl.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixelBuffer);

  // Cleanly dispose render target immediately to ensure Zero GPU Leaks
  renderTarget.dispose();

  // 6. Draw to 2D canvas with vertical flip (since WebGL texture Y is inverted)
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = width;
  outputCanvas.height = height;
  const ctx = outputCanvas.getContext('2d')!;
  const imgData = ctx.createImageData(width, height);

  for (let y = 0; y < height; y++) {
    const srcRow = (height - 1 - y) * width * 4;
    const dstRow = y * width * 4;
    imgData.data.set(pixelBuffer.subarray(srcRow, srcRow + width * 4), dstRow);
  }
  ctx.putImageData(imgData, 0, 0);

  return outputCanvas;
}

/**
 * Headless snapshot for Viewport quick screenshot button in DioramaQuickBar
 * Captures 1920 × 1080 from the current active viewport angle
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

