# 03: Base Terrain Manipulation Tool

**What to build:**
Direct terrain mesh manipulation engine and excavation tools operating on the 65,536 vertex diorama plane:

### 1. Direct Terrain Sculpting Subtools
* **Elevate Tool:** Raises mountain crests, peaks, and ridges with radial falloff.
* **Lower Tool:** Depresses terrain to carve valleys, trenches, and moat beds.
* **Plateau Tool:** Flattens sampled vertices to a target plane height $H_{target}$, creating flat fort building decks and bastion summits.
* **Smooth Tool:** Multi-tap kernel blur softening rugged vertices into natural earthen contours.
* **Slope / Ramp Tool:** Calibrated inclination grading with angle presets (15°, 30°, 45°, 60°) and angle slider for fort ascents.
* **Pond Excavation Subtool (Option A: Shader-Integrated):** Carves crater depressions directly in the terrain heightmap and renders authentic blue tarpaulin PBR water with specular ripples on the flat basin floor (`wetness > 0.68`), surrounded by dark wet mud (*chikhal*) on crater banks (`wetness` 0.70 to 0.02) up to the rim edge. Prevents cliff leaks, prevents water plane stacking, and restores 100% cleanly on undo.

### 2. Interaction Ergonomics & Performance
* **3D Surface Normal Indicator:** Brush cursor reticle ring dynamically aligns flush to the exact terrain surface normal, eliminating z-fighting across cliffs.
* **Ergonomic Wheel Shortcuts:** `Shift+Scroll` for brush radius, `Ctrl+Scroll` for sculpt strength, `Alt+Scroll` for plateau/slope angle, intercepted in capture phase with complete suppression of camera zoom.
* **Undo/Redo History:** Synchronized with 15-slot circular history (`Ctrl+Z` / `Ctrl+Y`) and dedicated undo controls.
* **BVH Raycasting Acceleration:** Partial dirty-box updates and BVH refits guarantee $< 0.2\text{ms}$ raycasting latency.

**Blocked by:** 02: 3D Scene Core, Camera Rig, Courtyard Bricks & Base Terrain

**Status:** closed

- [x] Elevating terrain smoothly raises organic hills and mountain crests
- [x] Lowering terrain excavates depressions that reveal underlying ground/water
- [x] Plateau tool flattens elevated peaks into level fort construction decks
- [x] Smoothing tool removes jagged vertices without resetting height
- [x] Slope tool creates clean graded ramps at 15°, 30°, 45°, 60° presets
- [x] Brush cursor ring orients flush to terrain surface normal without z-fighting
- [x] Shift/Ctrl/Alt + Wheel adjust sliders and prevent OrbitControls zoom
- [x] Excavating ponds renders shader-integrated blue tarpaulin water on basin floors and dark wet mud along banks with full undo/redo support
- [x] Vertex modifications execute in dirty bounding box ranges without full geometry reallocations
