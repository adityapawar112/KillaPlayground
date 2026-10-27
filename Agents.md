# Agent Operational Charter: Diwali Killa Sandbox

## 1. Role & Mission
You are operating within **Diwali Killa Sandbox**, an interactive, tactile 3D browser diorama that celebrates the Maharashtrian Diwali folk tradition of building miniature mud forts (*Diwali Killa*).

Your primary mission as an autonomous coding agent is to author high-performance, minimal, and secure code adhering to strict engineering discipline, zero server costs (₹0), and cultural design authenticity.

---

## 2. Product Runtime vs. Development Workspace Boundary

A strict boundary exists between what the application builds and the tooling used to build it:

| Dimension | Product Runtime (What the App Builds) | Development Workspace (Agent Authoring Tools) |
| :--- | :--- | :--- |
| **Environment** | User's WebGL2 browser (desktop/mobile) | Node.js v22+, PowerShell on Windows, Git |
| **Framework** | Next.js 15 (App Router) or Vite + React 19 | Antigravity IDE Agentic Engine |
| **3D Engine** | Three.js + `@react-three/fiber` + `@react-three/drei` | `three-mesh-bvh`, `gltf-transform` CLI |
| **State Layer** | `stateBuffer` (TypedArray) + `Zustand` (UI) | Git branches, worktrees, issue tracking |
| **Persistence** | Supabase Postgres (`killas`) + Storage (`killa-blobs`) | Local filesystem, `.agents/skills/`, `.agents/rules/` |
| **Cost Standard** | **₹0 (100% Client-Side Compute)** | Zero unapproved cloud resources |

---

## 3. Ponytail Code Discipline (The 7-Rung Ladder)

Every line of code authored in this repository must climb the **7-Rung Ladder of Laziness**:
1. **YAGNI (Cut completely):** No user authentication, no server-side 3D rendering, no custom voxel engines, and no backend image processing.
2. **Standard Library & Native APIs First:** Use native `OffscreenCanvas`, `CanvasRenderingContext2D`, `TypedArray`, and `navigator.share()`.
3. **Existing Battle-Tested Libraries:** Use `three-mesh-bvh` (< 0.2ms raycasts), `three-custom-shader-material`, `CatmullRomCurve3`, `lazy-brush`, and `fflate`.
4. **One Line Before Fifty:** Eliminate custom utility wrappers when native or framework primitives already exist.
5. **Deletion Over Addition:** Prune dead code, unused types, and redundant checks before introducing new files.
6. **No Speculative Abstractions:** Build only what the current tracer bullet ticket requires.
7. **Single Ownership:** GPU vertex mutation stays in TypedArray buffers; React handles UI overlays.

### The Shortcut Protocol
When choosing a simple solution over a complex architecture for velocity, annotate it with:
```typescript
// shortcut: <ceiling description>, <upgrade trigger>
```
*Example:*
```typescript
// shortcut: 15-slot in-memory circular buffer for undo/redo, upgrade to indexedDB if state exceeds 50MB
const undoStack: Uint8Array[] = [];
```
Track deferred technical debt periodically using the `ponytail-debt` skill.

---

## 4. Spec-to-Execution Pipeline & Domain Docs

Work proceeds through a disciplined tracer-bullet pipeline:

```
[product.md / architechture.md / design.md]
                  │
                  ▼
              /to-spec  ──▶  Formal Architecture Spec
                  │
                  ▼
            /to-tickets ──▶  Dependency-Ordered Tracer Tickets
                  │
                  ▼
         /implement-spec ──▶  TDD Red-Green Loop + Mutation Tests
                  │
                  ▼
   /verification-before-completion ──▶ Fresh Evidence & Benchmarks
```

### Domain Documentation Layout:
- [product.md](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/product.md): Core user journey, 7 feature phases, cultural lore, and non-goals.
- [architechture.md](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/architechture.md): Zero-cost tech stack, terrain heightmap state machine, triplanar shader architecture, spline extrusion, 4-angle poster generator, and binary serialization.
- [design.md](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/design.md): Sun-baked courtyard canvas (`#F9F6F0`), 6 earth-tone palette, Devanagari typography (`Yatra One`, `Modak`), and HUD component specifications.
- [credits.md](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/credits.md): CC0 PolyHaven texture sources.

### Triage Labels:
- `bug`: Defects breaking functionality, WebGL rendering, or state persistence.
- `enhancement`: New fort templates, props, or tool capabilities.
- `triage`: Unverified user requests or newly opened issues.
- `in-progress`: Currently active tracer ticket.
- `verified`: Passed all 3 verification judges with attached logs.

---

## 5. Official Skills Catalog & Trigger Matrix

All agent skills reside in [.agents/skills/](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills) and must be invoked according to their triggers:

### Compulsory Baseline Skills (14 Skills)
| Skill | Location | Trigger & Role |
| :--- | :--- | :--- |
| `unslop` | [.agents/skills/unslop](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/unslop) | Cuts AI writing tells, marketing fluff, and decorative filler from docs and code. |
| `tdd` | [.agents/skills/tdd](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/tdd) | Test-driven development Red-Green-Refactor loop. |
| `to-spec` | [.agents/skills/to-spec](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/to-spec) | Synthesizes discussion into formal specifications. |
| `to-tickets` | [.agents/skills/to-tickets](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/to-tickets) | Decomposes specs into dependency-ordered tracer-bullet tickets. |
| `implement-spec` | [.agents/skills/implement-spec](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/implement-spec) | Executes tickets in dependency order with isolated tests. |
| `ponytail` | [.agents/skills/ponytail](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/ponytail) | Enforces minimal working diffs, YAGNI discipline, and `# shortcut:` conventions. |
| `handoff` | [.agents/skills/handoff](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/handoff) | Compacts session context into clean continuation briefs. |
| `wayfinder` | [.agents/skills/wayfinder](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/wayfinder) | Maps multi-session work graphs into decision tickets. |
| `blast-radius` | [.agents/skills/blast-radius](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/blast-radius) | Evaluates systemic impact across call sites before shipping diffs. |
| `architect` | [.agents/skills/architect](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/architect) | Sketches types, signatures, and module boundaries before code. |
| `create-verification-skill` | [.agents/skills/create-verification-skill](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/create-verification-skill) | Generates project-local test and drive harnesses. |
| `maintain-verification-skill` | [.agents/skills/maintain-verification-skill](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/maintain-verification-skill) | Audits and updates verification harnesses against code changes. |
| `verification-before-completion` | [.agents/skills/verification-before-completion](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/verification-before-completion) | Mandates fresh test/benchmark evidence before claiming completion. |
| `ui-ux-pro-max` | [.agents/skills/ui-ux-pro-max](file:///c:/Users/adity/Desktop/Projects/KillaPlayground/.agents/skills/ui-ux-pro-max) | Design intelligence, color palettes, spacing tokens, and typography. |

### Targeted Vendor Skills (Stack Specific)
| Vendor / Domain | Skill | When to Read / Invoke |
| :--- | :--- | :--- |
| **Next.js / React** | `vercel-react-best-practices` | When writing or reviewing React components, hooks, bundle size, or App Router pages. |
| **React 19 / UI** | `vercel-composition-patterns` | When designing compound HUD components, drawers, or floating docks. |
| **Design Guidelines**| `web-design-guidelines` | When checking accessibility, contrast ratios, and touch targets. |
| **Vercel** | `deploy-to-vercel` | When preparing preview or production deployments. |
| **Supabase** | `supabase-postgres-best-practices`| When authoring SQL schemas, RLS policies, indexes, or database constraints. |
| **Supabase Client** | `supabase` | When integrating the Supabase JS client or Storage uploads. |
| **R3F Scene Graph** | `threejs-react-three-fiber` | When constructing `<Canvas>`, `<Instances>`, lighting, or camera rigs. |
| **Custom Shaders** | `threejs-shaders` | When writing GLSL chunks for CSM triplanar mud textures and wetness gloss. |
| **3D Geometry** | `threejs-geometry` | When manipulating `PlaneGeometry` vertex heightmaps or extruding splines. |
| **Interaction** | `threejs-interaction` | When implementing mouse/touch raycasting with `three-mesh-bvh`. |
| **3D Performance** | `threejs-performance` | When optimizing draw calls, instance batching, and eliminating GPU leaks. |
| **Asset Pipeline** | `threejs-asset-pipeline` | When optimizing `.glb` models with Draco/Meshopt compression via `gltf-transform`. |
| **Unit Testing** | `vitest` | When writing unit tests for `fflate` compression, state transforms, or Zod guards. |
| **Browser E2E** | `playwright-cli` | When running headless browser frame-rate and memory benchmark judges. |

---

## 6. Non-Negotiable Operational Rules

1. **Evidence Before Assertions:** Never state that code works, tests pass, or benchmarks are met without running the full command and including the raw output.
2. **Context Budget Discipline:** Do not install indiscriminate mega-dumps. Maintain targeted, single-purpose skills.
3. **Zero GPU Leaks:** Every created texture, material, geometry, and offscreen canvas must be cleanly disposed on unmount.
4. **Cultural Authenticity:** Uphold the warm courtyard palette, Devanagari display voice (`Yatra One`), and authentic Maratha fort architecture (bastions, ramparts, *Maha Darwaza*).
