# 05: Foliage Painting, Water Ponds & Figurine Asset Placement

**What to build:**
Foliage painting, pond water bodies, and figurine asset placement:

1. **Foliage Tool:**
   * **Grass / Moss Sub-Tool:** Paints fertile seedling green and moss directly onto the terrain surface using `rocky_terrain_02_1k` texture and instanced halim seedlings in 1 draw call.
   * **Path Sub-Tool:** Paints worn walking tracks and red-ochre paths directly onto the terrain surface using `muddy_tracks_1k`.

2. **Ponds & Water Bodies:**
   * Water plane in terrain depressions and water tanks (*Taki*).
   * Toggle between realistic reflective water and nostalgic crinkled blue plastic tarpaulin sheet.

3. **Figurines Tool:**
   * Places 3D historical figurines and fort accessories anywhere on the terrain or on top of solid dried structures.
   * Categories: *Royalty & Sinhasan* (Chhatrapati Shivaji Maharaj throne), *Mavale* (spearman, swordsman, tutari blower), *Artillery* (cannons), *Flags & Insignia* (saffron Bhagwa Dhwaj), *Festive Props* (paper boats, terracotta diyas).
   * Drag-and-drop raycast placement, rotation handle, and surface normal alignment.
   * Night Mode Diya glow: warm flickering oil lamps along battlements and courtyards.

**Blocked by:** 04: Structure Paint Studio & Spline Extrusion (Stairways & Crenellations)

**Status:** ready-for-agent

- [ ] Foliage tool paints grass/moss (`rocky_terrain_02_1k`) and paths (`muddy_tracks_1k`) directly onto the terrain
- [ ] Water appears in excavated terrain pond depressions with blue plastic sheet toggle
- [ ] Figurines tool places 3D models on both terrain surface and solid dried structures
- [ ] Toggling Night Diya Mode dims diorama and renders glowing oil lamps
