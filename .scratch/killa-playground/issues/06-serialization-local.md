# 06: State Serialization, Undo/Redo & Local Persistence Adapter

**What to build:**
State snapshotting, undo/redo, and persistence adapter:
- **Undo / Redo**: 15-slot in-memory circular buffer storing compressed snapshots of `stateBuffer` + `paintCanvas` + props.
- **Binary Serialization**: Quantize `stateBuffer` to `Uint8Array`. Export `paintCanvas` as WebP buffer. Compress state + paint + props JSON with `fflate.zipSync` into a compact $< 35\text{ KB}$ binary package.
- **Persistence Adapter**: Pluggable interface (`saveKilla()`, `loadKilla()`, `listLocalKillas()`). Local storage / IndexedDB implementation for offline and unconfigured runs. Defensive Zod validation schema for inbound payloads. Ready-to-connect Supabase client module and SQL migration script for future linking.

**Blocked by:** 04: Freehand Paint Studio & Spline Extrusion System, 05: Nature, Water Bodies & Figurine Asset Browser

**Status:** ready-for-agent

- [ ] Undo and redo reliably revert and restore sculpting, painting, and prop placement operations
- [ ] `serializeKilla()` packages dirty state + paint + 50 props into $\le 35\text{ KB}$ in $< 15\text{ms}$
- [ ] Killa state is persisted to local storage and successfully restored upon page reload
- [ ] Inbound payload schema validates types and rejects malformed data
