# 03: Structure Building Tools (Soil, Water, Shape, Dry) & Terrain Tool

**What to build:**
The core building mechanics separating terrain manipulation from architectural structure modeling:

### 1. Bundled Structure Tools (Operating on Lumps of Soil Placed on Terrain)
1. **Soil Tool**: Does NOT affect the mountain terrain itself; drops a discrete lump of soil (`red_laterite_soil_stones_1k`) onto the terrain, which serves as raw building material.
2. **Water Tool**: Pours water onto the lump of soil to soften it, making it malleable (`cracked_red_ground_1k` wet sheen) with high specular gloss.
3. **Shaping Tool**: Models the wet soil into architectural structures:
   * *Push Left:* Compresses soil from the right into clean vertical faces.
   * *Push Right:* Compresses soil from the left.
   * *Pat from Top:* Levels mounds into flat horizontal decks, bastion rooftops, and ramparts.
4. **Drying Tool**: Dries the shaped wet soil, hardening it into solid architectural stone/mass. Once dried, the structure allows painting on top, placing figurines, and applying the spline tool for crenellations.

### 2. Terrain Tool (Mountain Manipulation & Ponds)
* **Terrain Tool**: Directly elevates or depresses the underlying mountain terrain itself.
* **Pond Sub-Tool**: Excavates water depressions that fill with reflective pond water or blue plastic tarpaulin.

**Blocked by:** 02: 3D Scene Core, Camera Rig, Courtyard Bricks & Base Terrain

**Status:** ready-for-agent

- [ ] Soil tool drops discrete soil lumps on top of terrain without mutating underlying terrain
- [ ] Water tool softens the soil lump into malleable wet mud
- [ ] Shaping tool models wet soil with push-left, push-right, and top-patting gestures
- [ ] Drying tool hardens shaped soil into solid immutable structures
- [ ] Terrain tool elevates and depresses the mountain terrain, with a pond excavation sub-tool
- [ ] Partial dirty-box updates and BVH refits guarantee $< 0.2\text{ms}$ raycasting
