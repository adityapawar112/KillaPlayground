# 06: State Serialization, Local Persistence Adapter & Project Hub

**What to build:**
State snapshotting, persistence adapter, and project file management:
- **Undo / Redo**: 15-slot in-memory circular buffer storing compressed snapshots of `stateBuffer` + `paintCanvas` + props.
- **Binary Serialization**: Quantize `stateBuffer` to `Uint8Array`. Export `paintCanvas` as WebP buffer. Compress state + paint + props JSON with `fflate.zipSync` into a compact $< 35\text{ KB}$ binary package (`.killa` format).
- **Local Persistence Vault**:
  - `localStorage` adapter (`killa_saved_projects_v1`) persisting named projects with timestamp of last save (`updatedAt`), blueprint type, and complete diorama parameters.
  - Project management methods: `saveProjectLocally()`, `loadProjectLocally()`, `deleteProjectLocally()`.
  - Blender-style startup modal hub displaying recent locally saved projects with relative time elapsed (`Just now`, `5 mins ago`, `2 hours ago`) and one-click loading.
- **Desktop File Import & Export**:
  - Direct desktop file download of `.killa` / `.json` diorama project packages.
  - Native file picker upload to import external or backed-up `.killa` project files into the 3D canvas without requiring an online database.
- **Defensive Validation Schema**: Zod schema validating incoming payloads, rejecting malformed coordinates or corrupt state buffers.
- **Future Supabase Bridge**: Pluggable adapter interface ready for cloud sync and read-only shareable links (`/killa/[id]`).

**Blocked by:** 04: Freehand Paint Studio & Spline Extrusion System, 05: Nature, Water Bodies & Figurine Asset Browser

**Status:** ready-for-agent

- [ ] Undo and redo reliably revert and restore sculpting, painting, and prop placement operations
- [ ] `serializeKilla()` packages dirty state + paint + 50 props into $\le 35\text{ KB}$ in $< 15\text{ms}$
- [ ] Killa state is persisted to local storage (`localStorage`) and listed in the startup modal with last-saved timestamp
- [ ] `.killa` / `.json` project files can be downloaded and imported cleanly through the desktop application menu
- [ ] Inbound payload schema validates types and rejects malformed data
