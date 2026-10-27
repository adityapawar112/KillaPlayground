# 04: Freehand Paint Studio & Spline Extrusion System

**What to build:**
Freehand surface painting system and spline extrusion tool:
- **Paint Studio**: Dedicated `1024 x 1024` offscreen paint canvas wrapped in `THREE.CanvasTexture` projected via triplanar mapping onto terrain and individual wall UVs. 6 authentic colors (Basalt Charcoal, Chuna White, Geru Red-Ochre, Tarpaulin Blue, Mud Stone, Marigold Yellow). 3 brush sizes. `lazy-brush` steady-hand stabilizer with 12px virtual string for drawing straight white brick divider lines.
- **Spline Builder**: Interactive 3D point drawing across terrain using `THREE.CatmullRomCurve3`. 1-Click floating conversion context menu: Walkway Path (red-ochre ribbon), Stone Steps (*Payrya* stepped mud boxes), Rampart Wall (extruded mud wall with auto-bastions at corners $> 35^\circ$), and Crenellated Battlements.

**Blocked by:** 03: Tactile Mud Sculpting State Machine (4 Core Tools)

**Status:** ready-for-agent

- [ ] Painting with Basalt Charcoal gives an authentic dark stone base coat
- [ ] Fine white liner brush with steady-hand stabilizer allows drawing straight mortar lines without trackpad jitter
- [ ] Spline path drawing samples 3D points smoothly across the mud surface
- [ ] Spline conversion generates extruded rampart walls, stepped mud terraces, and walkways
