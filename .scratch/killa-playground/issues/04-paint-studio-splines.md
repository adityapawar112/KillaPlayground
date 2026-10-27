# 04: Structure Paint Studio & Spline Extrusion (Stairways & Crenellations)

**What to build:**
Freehand structure painting and spline generation following the terrain:

1. **Structure Paint Tool (Bundled Tool 5):**
   * Dedicated painting brush for dried solid structures.
   * Authentic pigments: Basalt Charcoal, Chuna White, Geru Red-Ochre.
   * `lazy-brush` steady-hand stabilizer (12px virtual string) for drawing crisp straight mortar lines and brick divider joints without jitter.

2. **Spline Tool:**
   * Interactive 3D point drawing that samples points following the terrain topology using `THREE.CatmullRomCurve3`.
   * **Stairway (*Payrya*):** Automatically generates stepped stone/mud box sequences climbing up hillsides and walls.
   * **Crenellations (*Kangare*):** Places alternating defensive battlements and rampart crests along the top edge of solid dried structures.

**Blocked by:** 03: Structure Building Tools (Soil, Water, Shape, Dry) & Terrain Tool

**Status:** ready-for-agent

- [ ] Painting on solid dried structures applies authentic pigment base coats
- [ ] Fine white liner brush with steady-hand stabilizer draws straight brick divider lines
- [ ] Spline path drawing follows terrain height accurately in real-time
- [ ] Spline converts cleanly into stepped stairways (*Payrya*) and crenellations (*Kangare*)
