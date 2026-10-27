## Summary of Changes
<!-- Provide a concise description of what this PR changes and why -->

## Connected Issue / Tracer Ticket
Closes #<!-- issue number -->

## Architectural Invariant Checklist
- [ ] **Ponytail Audit:** Did you avoid speculative abstractions? Are shortcuts annotated with `# shortcut: <ceiling>, <upgrade trigger>`?
- [ ] **Zero-Leak Discipline:** Are all created Three.js geometries, textures, materials, and canvas buffers properly disposed on unmount or reset?
- [ ] **Draw-Call Budget:** Placed figurines and vegetation stay batched via `<Instances>` / `<InstancedMesh>` (no unbounded draw calls).
- [ ] **Zero Server Cost:** Poster generation and mud computations execute purely client-side on WebGL / `OffscreenCanvas`.

## Quality, Test & Mutation Verification
- [ ] **Unit Tests:** Deterministic tests pass (`npm run test` or `vitest run`).
- [ ] **Mutation Standard:** Mutation score standards met ($\ge 90\%$ on payload parsing, serialization, and input sanitization).
- [ ] **Performance Verification:** Headless/WebGL frame-rate benchmark verified ($\ge 55$ FPS on interactive brush strokes via `r3f-perf`).
- [ ] **Binary Payload Size:** Compressed killa payload remains $\le 35\text{ KB}$ (`fflate` binary packing).

## Verification Evidence
<!-- Mandate evidence before assertions. Paste raw test output or terminal logs below -->
```bash
# Paste verification command output here (e.g. npm test, r3f-perf metrics)
```

## Documentation & Types
- [ ] Documentation updated (`architechture.md`, `design.md`, `product.md`, or `Agents.md` if applicable).
- [ ] TypeScript types cleanly checked (`npx tsc --noEmit` returns zero errors).
