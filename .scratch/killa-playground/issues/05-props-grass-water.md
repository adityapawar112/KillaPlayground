# 05: Nature, Water Bodies & Figurine Asset Browser

**What to build:**
Nature scattering, water bodies, and figurine asset drawer:
- **Sprouted Halim Grass**: Paints Channel A of `stateBuffer`. Single `THREE.InstancedMesh` rendering 15,000 tiny two-leaf sprout crosses in **1 draw call**.
- **Water Cisterns & Blue Plastic Sea**: Water plane at $Y = 0.08$. Digging terrain below 0.08 exposes water. Toggle between realistic reflective water and nostalgic crinkled blue plastic tarpaulin sheet.
- **Figurine & Prop Browser**: Right-side sliding drawer with category tabs: *Royalty & Sinhasan*, *Mavale*, *Artillery*, *Flags & Insignia*, *Festive Props*. Stylized clay diorama models (Chhatrapati Shivaji Maharaj throne, spearman, swordsman, tutari blower, cannons, Bhagwa Dhwaj with swaying vertex shader, paper boats, terracotta diyas). Single draw-call batching per figurine type via `<Instances>`. Drag-and-drop raycast placement, rotation handle, and ground alignment. Night Mode Diya glow: warm additive flame decals at 0.1ms GPU cost.

**Blocked by:** 03: Tactile Mud Sculpting State Machine (4 Core Tools)

**Status:** ready-for-agent

- [ ] Halim grass brush scatters sprouted two-leaf seedlings at 60 FPS in a single draw call
- [ ] Water plane appears in depressions with functional blue plastic sheet toggle
- [ ] Figurine drawer opens smoothly; props can be placed, moved, and rotated onto fort surfaces
- [ ] Toggling Night Diya Mode dims diorama and renders glowing oil lamps along battlements
