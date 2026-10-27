# Architecture & Contracts: Layer Separation & Invariant Preservation

## Core Directive
Maintain strict boundaries between the 60 FPS GPU/TypedArray execution layer, the declarative React UI state layer, and the persistence pipe. Never allow high-frequency vertex mutations to pollute React state loops.

## 1. Architectural Layer Separation

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 1: REACT UI & HUD                         │
│  • Framework: Next.js 15 (App Router) / React 19 + Tailwind CSS       │
│  • State: Zustand (Active Tool, Brush Radius, Color Swatch, Modal UI)  │
│  • Constraint: Pure event dispatcher. NEVER holds 60Hz vertex floats.  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Tool Event (Pointer Down / Move / Up)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LAYER 2: 3D ENGINE & GPU RUNTIME                     │
│  • Engine: Three.js + @react-three/fiber + @react-three/drei           │
│  • Raycasting: three-mesh-bvh (< 0.2ms raycast per frame)              │
│  • State Buffer: 256x256x4 Float32Array (R: Height, G: Wetness,        │
│    B: Lock, A: Halim Grass)                                            │
│  • Paint Texture: 1024x1024 HTMLCanvas wrapped in THREE.CanvasTexture   │
│  • Shaders: three-custom-shader-material (CSM) + Triplanar mapping     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ On "Finish & Share"
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   LAYER 3: CLIENT SERIALIZATION & POSTER               │
│  • Poster: Native OffscreenCanvas (1080x1920) 4-Camera Render          │
│  • Compressor: fflate.zlibSync (Shrinks state + paint + props to <35KB)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ POST /api/killa
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                LAYER 4: PERSISTENCE (SUPABASE FREE TIER)               │
│  • Ingress Guard: Zod payload validation                               │
│  • Database: Table 'killas' (8-char nanoid, metadata, props JSONB)     │
│  • Storage: Bucket 'killa-blobs' (Stores compressed ~25KB buffer)      │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Invariants & Performance Contracts

1. **State Buffer Mutability Rule:**
   - When the user drags a mud-sculpting brush, mutate `stateBuffer` inside the brush radius directly in TypedArray memory.
   - Update `PlaneGeometry.attributes.position` **ONLY** for vertices within the dirty bounding box `[minX..maxX, minY..maxY]`.
   - Call `position.addUpdateRange(offset, count)`, `computeVertexNormals()`, and `bvh.refit()`. Never rebuild the geometry from scratch per frame.

2. **Single Draw-Call Figurine Instancing:**
   - Every placed prop (*Mavale* guards, cannons, diyas, paper boats) must be rendered via `@react-three/drei` `<Instances>` or `<InstancedMesh>`.
   - Placing 50 guards must cost **1 draw call**, never 50.

3. **Zero GPU Resource Leak Contract:**
   - Every Three.js resource (`THREE.Geometry`, `THREE.Material`, `THREE.Texture`, `THREE.WebGLRenderTarget`) created dynamically must have an explicit `.dispose()` call hooked into its component unmount lifecycle.
   - Canvas elements (`HTMLCanvasElement`, `OffscreenCanvas`) must release their 2D contexts on teardown.

4. **On-Demand Frame Loop (`frameloop="demand"`):**
   - The scene must not tick continuously at 60 FPS while idle.
   - Use `<Canvas frameloop="demand">` and invalidate frames only on camera movement, active tool dragging, or active Diya flame animation.

5. **Type Safety & Typegen Pipelines:**
   - All database records must map to generated types from Supabase CLI (`supabase gen types typescript`).
   - All state packets must implement explicit TypeScript interfaces:
     ```typescript
     export interface KillaStatePayload {
       version: 1;
       templateId: string;
       stateBuffer: Uint8Array; // 256 * 256 * 4
       paintCanvasWebP: Uint8Array;
       props: PlacedProp[];
       splines: SplinePath[];
     }
     ```
