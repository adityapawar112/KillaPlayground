import * as THREE from 'three';

/**
 * High-performance, zero-suspense texture manager for 3D foliage sprites.
 * Uses native THREE.TextureLoader with an in-memory cache.
 * Synchronously returns a THREE.Texture without throwing React Suspense promises,
 * permanently eliminating full-viewport reloading / unmounting during interactive painting.
 */
class FoliageTextureManager {
  private cache = new Map<string, THREE.Texture>();
  private loader: THREE.TextureLoader | null = null;
  private listeners = new Map<string, Set<(tex: THREE.Texture) => void>>();

  private getLoader(): THREE.TextureLoader {
    if (!this.loader) {
      this.loader = new THREE.TextureLoader();
    }
    return this.loader;
  }

  /**
   * Retrieves or asynchronously loads a texture for the given sprite URL.
   * Returns a valid THREE.Texture immediately (non-suspending and side-effect free).
   */
  getTexture(url: string, onLoad?: (texture: THREE.Texture) => void): THREE.Texture {
    if (this.cache.has(url)) {
      const existing = this.cache.get(url)!;
      if (onLoad) {
        if (existing.image) {
          queueMicrotask(() => onLoad(existing));
        } else {
          this.onTextureLoaded(url, onLoad);
        }
      }
      return existing;
    }

    if (typeof document === 'undefined') {
      const dummy = new THREE.Texture();
      this.cache.set(url, dummy);
      return dummy;
    }

    if (onLoad) {
      this.onTextureLoaded(url, onLoad);
    }

    const loader = this.getLoader();
    const texture = loader.load(
      url,
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.magFilter = THREE.NearestFilter;
        loaded.minFilter = THREE.NearestMipmapLinearFilter;
        loaded.generateMipmaps = true;
        loaded.needsUpdate = true;
        if (typeof window !== 'undefined' && (window as any).__killa_invalidate) {
          (window as any).__killa_invalidate();
        }

        const callbacks = this.listeners.get(url);
        if (callbacks) {
          callbacks.forEach((cb) => cb(loaded));
          this.listeners.delete(url);
        }
      },
      undefined,
      (err) => {
        console.warn(`[FoliageTextureManager] Failed to load foliage sprite: ${url}`, err);
      }
    );

    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestMipmapLinearFilter;
    texture.generateMipmaps = true;

    this.cache.set(url, texture);
    return texture;
  }

  /**
   * Subscribes to texture load completion safely from React useEffect.
   * Returns an unsubscribe function.
   */
  onTextureLoaded(url: string, callback: (texture: THREE.Texture) => void): () => void {
    const existing = this.cache.get(url);
    if (existing && existing.image) {
      queueMicrotask(() => callback(existing));
      return () => {};
    }

    if (!this.listeners.has(url)) {
      this.listeners.set(url, new Set());
    }
    const set = this.listeners.get(url)!;
    set.add(callback);

    return () => {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(url);
      }
    };
  }

  /**
   * Warm up GPU texture cache ahead of time (e.g. on asset selection or hover).
   */
  preload(url: string): void {
    if (this.cache.has(url)) return;
    this.getTexture(url);
  }

  /**
   * Check if texture is already cached and ready
   */
  has(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Cleanly dispose all textures from GPU memory on unmount
   */
  dispose(): void {
    for (const tex of this.cache.values()) {
      tex.dispose();
    }
    this.cache.clear();
    this.listeners.clear();
  }
}

export const foliageTextureManager = new FoliageTextureManager();
