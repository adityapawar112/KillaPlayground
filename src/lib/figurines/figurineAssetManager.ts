/**
 * Figurine Asset Manager
 * Singleton caching manager for 3D GLB figurine geometries and materials.
 * Guarantees zero duplicate GPU uploads and aligns model bases flush to y = 0.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface CachedFigurineAsset {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  baseOffset: number; // Y offset applied to align feet to y = 0
  dimensions: THREE.Vector3;
}

class FigurineAssetManager {
  private cache = new Map<string, CachedFigurineAsset>();
  private loadingPromises = new Map<string, Promise<CachedFigurineAsset>>();
  private loader = new GLTFLoader();

  /**
   * Load or retrieve cached figurine asset.
   */
  public async loadAsset(modelPath: string): Promise<CachedFigurineAsset> {
    if (this.cache.has(modelPath)) {
      return this.cache.get(modelPath)!;
    }

    if (this.loadingPromises.has(modelPath)) {
      return this.loadingPromises.get(modelPath)!;
    }

    const promise = new Promise<CachedFigurineAsset>((resolve, reject) => {
      this.loader.load(
        modelPath,
        (gltf) => {
          let targetMesh: THREE.Mesh | null = null;
          gltf.scene.traverse((obj) => {
            if (!targetMesh && (obj as THREE.Mesh).isMesh) {
              targetMesh = obj as THREE.Mesh;
            }
          });

          if (!targetMesh) {
            reject(new Error(`No mesh found in GLTF model: ${modelPath}`));
            return;
          }

          const mesh = targetMesh as THREE.Mesh;
          gltf.scene.updateMatrixWorld(true);

          const origGeom = mesh.geometry;
          const cleanGeom = new THREE.BufferGeometry();

          // De-interleave position into standard Float32BufferAttribute
          const posAttr = origGeom.attributes.position;
          const floatPos = new Float32Array(posAttr.count * 3);
          for (let i = 0; i < posAttr.count; i++) {
            floatPos[i * 3 + 0] = posAttr.getX(i);
            floatPos[i * 3 + 1] = posAttr.getY(i);
            floatPos[i * 3 + 2] = posAttr.getZ(i);
          }
          cleanGeom.setAttribute('position', new THREE.BufferAttribute(floatPos, 3));

          // De-interleave normal
          const normAttr = origGeom.attributes.normal;
          if (normAttr) {
            const floatNorm = new Float32Array(normAttr.count * 3);
            for (let i = 0; i < normAttr.count; i++) {
              floatNorm[i * 3 + 0] = normAttr.getX(i);
              floatNorm[i * 3 + 1] = normAttr.getY(i);
              floatNorm[i * 3 + 2] = normAttr.getZ(i);
            }
            cleanGeom.setAttribute('normal', new THREE.BufferAttribute(floatNorm, 3));
          }

          // De-interleave UV
          const uvAttr = origGeom.attributes.uv;
          if (uvAttr) {
            const floatUV = new Float32Array(uvAttr.count * 2);
            for (let i = 0; i < uvAttr.count; i++) {
              floatUV[i * 2 + 0] = uvAttr.getX(i);
              floatUV[i * 2 + 1] = uvAttr.getY(i);
            }
            cleanGeom.setAttribute('uv', new THREE.BufferAttribute(floatUV, 2));
          }

          if (origGeom.index) {
            cleanGeom.setIndex(origGeom.index.clone());
          }

          // Apply mesh's matrixWorld (which contains node translation and scale from GLB)
          cleanGeom.applyMatrix4(mesh.matrixWorld);

          // Center in X and Z, align bottom to Y = 0
          cleanGeom.computeBoundingBox();
          let bbox = cleanGeom.boundingBox || new THREE.Box3();
          const centerX = (bbox.min.x + bbox.max.x) / 2;
          const centerZ = (bbox.min.z + bbox.max.z) / 2;
          const minY = bbox.min.y;

          cleanGeom.translate(-centerX, -minY, -centerZ);

          // Miniature diorama scale calibration:
          // In authentic Diwali Killa tradition:
          // 1. Human warriors/mavale/king/attendants: ~0.15m (15cm) tall, fitting nicely on 0.25m fort ramparts.
          // 2. Horse rider & bullock cart: ~0.16m - 0.18m tall.
          // 3. Diyas: ~0.05m (5cm) wide clay cups.
          // 4. Saffron Flag: ~0.27m tall mast.
          let scaleFactor = 0.16;
          if (modelPath.includes('diya_')) {
            scaleFactor = 0.18;
          } else if (modelPath.includes('saffron_flag') || modelPath.includes('flag.glb')) {
            scaleFactor = 0.28;
          } else if (modelPath.includes('bullock_cart') || modelPath.includes('Bullock')) {
            scaleFactor = 0.18;
          } else if (modelPath.includes('horse_rider') || modelPath.includes('horse')) {
            scaleFactor = 0.18;
          }

          cleanGeom.scale(scaleFactor, scaleFactor, scaleFactor);
          cleanGeom.computeBoundingBox();
          cleanGeom.computeBoundingSphere();

          const finalBbox = cleanGeom.boundingBox || new THREE.Box3();
          const size = new THREE.Vector3();
          finalBbox.getSize(size);

          // Material preparation (cast/receive shadows, double-sided, sRGB colorSpace)
          const mat = Array.isArray(mesh.material)
            ? mesh.material[0].clone()
            : mesh.material.clone();

          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.roughness = 0.85;
            mat.metalness = 0.05;
            mat.side = THREE.DoubleSide;
            mat.shadowSide = THREE.DoubleSide;
            if (mat.map) {
              mat.map.colorSpace = THREE.SRGBColorSpace;
              mat.map.needsUpdate = true;
            }
          }

          const cached: CachedFigurineAsset = {
            geometry: cleanGeom,
            material: mat,
            baseOffset: 0,
            dimensions: size,
          };

          this.cache.set(modelPath, cached);
          this.loadingPromises.delete(modelPath);
          resolve(cached);
        },
        undefined,
        (err) => {
          this.loadingPromises.delete(modelPath);
          reject(err);
        }
      );
    });

    this.loadingPromises.set(modelPath, promise);
    return promise;
  }

  /**
   * Synchronous cache retrieval (returns undefined if not yet loaded).
   */
  public getCached(modelPath: string): CachedFigurineAsset | undefined {
    return this.cache.get(modelPath);
  }

  /**
   * Preload multiple assets asynchronously.
   */
  public async preloadAll(modelPaths: string[]): Promise<void> {
    await Promise.all(modelPaths.map((p) => this.loadAsset(p).catch(() => null)));
  }

  /**
   * Dispose all cached geometries and materials.
   */
  public disposeAll(): void {
    for (const asset of this.cache.values()) {
      asset.geometry.dispose();
      asset.material.dispose();
    }
    this.cache.clear();
    this.loadingPromises.clear();
  }
}

export const figurineAssetManager = new FigurineAssetManager();

