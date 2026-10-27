# 08: Verification Judges, Testing & Deployment Readiness

**What to build:**
Quality gates, test suites, and documentation:
- **Vitest Unit Tests**:
  - Serialization/deserialization byte-size check ($\le 35\text{ KB}$).
  - Zod schema defensive boundaries ($NaN$ rejection, prop limit $\le 250$).
  - Terrain height clamping and bounding box arithmetic.
- **GPU Resource Disposal Audit**:
  - Verify clean `.dispose()` on all textures, materials, and geometries on unmount.
- **Documentation**:
  - `README.md` with setup and build instructions.
  - Asset manifest specifying required formats and paths.
  - `External Dependencies and Setup` guide for Vercel and Supabase.

**Blocked by:** 07: Showcase, Multi-Angle Festive Poster Studio & Share

**Status:** ready-for-agent

- [ ] `npm run test` executes all Vitest suites with 100% pass rate
- [ ] Zero GPU memory leaks on repeated terrain regeneration or scene resets
- [ ] `npm run build` succeeds without TypeScript or bundling errors
- [ ] All external setup instructions for Supabase and Vercel are documented in `README.md`
