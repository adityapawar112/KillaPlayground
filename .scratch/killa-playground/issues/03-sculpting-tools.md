# 03: Tactile Mud Sculpting State Machine (4 Core Tools)

**What to build:**
The core mud building mechanics on `stateBuffer` with 4 interactive tools:
1. **Dump Dry Soil**: Adds Gaussian elevation mound with simplex noise roughness to R channel; G wetness set to 0.0.
2. **Pour Water**: Smooths height noise with 3x3 box blur, darkens soil, and increases G channel wetness (+0.15), reducing material roughness from 0.95 to 0.2.
3. **Top Patting**: Levels wet mud ($G > 0.5$) to sampled plane height $H_{target}$, creating flat plateaus, bastion tops, and courtyards.
4. **Side Pushing**: Compresses wet mud ($G > 0.5$) along pointer drag vector into crisp sheer vertical wall faces.
5. **Let Mud Set (Locking)**: Writes 1.0 to B channel, protecting architectural walls from accidental nearby brush deformation.
6. **Partial Dirty-Box Updates**: Updates `PlaneGeometry.attributes.position` strictly inside `[minX..maxX, minY..maxY]`, calling `addUpdateRange` and `bvh.refit()`.

**Blocked by:** 02: 3D Scene Core, Camera Rig, Courtyard Bricks & Base Terrain

**Status:** ready-for-agent

- [ ] Dumping soil raises crumbly matte brown mounds with simplex noise
- [ ] Pouring water visibly softens soil, darkens to rich red wet mud, and adds specular gloss
- [ ] Top patting flattens mounds into smooth horizontal plateaus
- [ ] Side pushing creates steep vertical wall and bastion profiles
- [ ] "Let Mud Set" prevents deformation on locked sections
- [ ] Vertex updates are constrained to dirty bounds without full geometry reallocations
