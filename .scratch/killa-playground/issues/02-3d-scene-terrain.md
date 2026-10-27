# 02: 3D Scene Core, Camera Rig, Courtyard Bricks & Base Terrain

**What to build:**
Three.js scene graph with R3F `<Canvas frameloop="demand">` and diorama `<OrbitControls>`. Courtyard environment lighting (sunlight + ambient courtyard bounce + night mode moonlight rig). Retaining red brick border geometry encircling the mud diorama base. Base terrain `PlaneGeometry(10, 10, 255, 255)` backed by `stateBuffer` (`Float32Array` of size `256 x 256 x 4` in `THREE.DataTexture`) storing Height (R), Wetness (G), Lock (B), and Grass Density (A). `<Bvh>` acceleration for `< 0.2ms` raycasting. PBR material pipeline loading the PolyHaven textures from `public/textures/`.

**Blocked by:** 01: Project Foundation, Design System Tokens & Responsive Shell

**Status:** closed

- [x] `<Canvas frameloop="demand">` configured with `<OrbitControls>` bounded polar angles
- [x] Courtyard diorama lighting rig with directional sunlight, warm ambient ground bounce, and night moonlight
- [x] Retaining red clay perimeter brick wall encircling diorama base
- [x] Terrain `PlaneGeometry(10, 10, 255, 255)` with `stateBuffer` DataTexture
- [x] `<Bvh>` raycasting integration yielding $< 0.2\text{ms}$ raycasts
- [x] PBR texture loader connecting `red_laterite_soil_stones_1k` and `red_mud_stones_1k`
