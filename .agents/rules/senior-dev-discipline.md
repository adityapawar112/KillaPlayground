# Senior Developer Discipline: Code Minimalism & YAGNI

## Core Directive
Favor deletion over addition. Write the simplest, shortest, most minimal working code that meets the requirements. Never introduce speculative abstractions, anticipatory interfaces, or wrapper classes for single call sites.

## 1. The 7-Rung Ladder of Laziness
Before writing any code or reaching for a new package, evaluate every solution against the 7-Rung Ladder:

1. **YAGNI (Cut Completely):** Ask: *Does this feature or abstraction really need to exist?* If the product functions without it, cut it. (e.g., zero user login, zero server-side rendering queues, zero custom voxel engines).
2. **Standard Library & Native Platform First:** Reach for browser standards first:
   - Use native `OffscreenCanvas` and `CanvasRenderingContext2D` instead of a server-side headless browser.
   - Use `navigator.share()` and native blobs instead of multi-part upload microservices.
   - Use typed arrays (`Float32Array`, `Uint8Array`) and circular memory buffers instead of bloated custom state registries.
3. **Existing Battle-Tested Libraries Over Custom Math:**
   - Use `three-mesh-bvh` for `<0.2ms` raycasting instead of custom spatial quadtrees.
   - Use `CatmullRomCurve3` and `ExtrudeGeometry` for spline walls instead of bespoke curve solvers.
   - Use `lazy-brush` or `perfect-freehand` (3 KB) instead of complex bezier smoothing algorithms.
   - Use `fflate` for compression instead of hand-rolled quantization.
4. **One Line Before Fifty:** A single idiomatic standard call beats a 50-line custom utility.
5. **Delete Before You Add:** When refactoring, eliminate dead paths, obsolete parameters, and unused types first.
6. **No "Future-Proofing":** Never architect for unstated requirements. Build for the current spec with clean, readable boundaries.
7. **Single Owner & Single Responsibilities:** Avoid two-way bindings across state domains. 60 FPS vertex mutations live in TypedArray buffers on the GPU, while UI controls live in Zustand.

## 2. Ponytail Shortcut Protocol
When a quick solution is deliberately chosen over a complex architecture to preserve velocity:
- **Format:** Always annotate with an explicit shortcut comment:
  ```typescript
  // shortcut: <ceiling description>, <upgrade trigger>
  ```
- **Example:**
  ```typescript
  // shortcut: 15-slot in-memory circular buffer for undo/redo, upgrade to indexedDB if state exceeds 50MB
  const undoStack: Uint8Array[] = [];
  ```
- **Ledger Tracking:** Maintain transparency using `/ponytail-debt` so technical debt is visible, quantified, and actionable.

## 3. Anti-Patterns (Immediate Rejection)
- Abstract base classes with a single implementation.
- "Manager", "Helper", or "Service" grab-bag files that collect unrelated functions.
- Premature caching layers that add invalidation bugs without proven profiling data.
- Rewriting native Three.js / WebGL shader pipelines when `three-custom-shader-material` or standard materials suffice.
