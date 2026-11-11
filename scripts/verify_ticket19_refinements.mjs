import assert from 'node:assert';
import * as THREE from 'three';

console.log('--- TEST 1: Three.js Virtual Joystick Spherical Orbit Calculation ---');
{
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
  camera.position.set(10, 10, 10);
  const controls = {
    target: new THREE.Vector3(0, 0, 0),
    minPolarAngle: 0.1,
    maxPolarAngle: Math.PI / 2 - 0.05,
    update: () => {},
  };

  const initialDistance = camera.position.distanceTo(controls.target);

  // Test joystick tilt inside inner ring (r = 20 <= 32)
  const x = 16, y = -12;
  const orbitSpeed = 0.025;
  const deltaAzimuth = (-x / 32) * orbitSpeed;
  const deltaPolar = (-y / 32) * orbitSpeed;

  const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
  const spherical = new THREE.Spherical().setFromVector3(offset);
  const initialTheta = spherical.theta;
  const initialPhi = spherical.phi;

  spherical.theta += deltaAzimuth;
  spherical.phi = THREE.MathUtils.clamp(
    spherical.phi + deltaPolar,
    controls.minPolarAngle || 0.1,
    controls.maxPolarAngle || Math.PI / 2 - 0.05
  );
  offset.setFromSpherical(spherical);
  camera.position.addVectors(controls.target, offset);
  camera.lookAt(controls.target);

  const finalDistance = camera.position.distanceTo(controls.target);

  console.log(`Initial angles: theta=${initialTheta.toFixed(4)}, phi=${initialPhi.toFixed(4)}`);
  console.log(`Updated angles: theta=${spherical.theta.toFixed(4)}, phi=${spherical.phi.toFixed(4)}`);
  console.log(`Distance preserved: ${Math.abs(initialDistance - finalDistance) < 1e-6}`);

  assert(spherical.theta !== initialTheta, 'Azimuth angle must change on joystick X input');
  assert(spherical.phi !== initialPhi, 'Polar angle must change on joystick Y input');
  assert(Math.abs(initialDistance - finalDistance) < 1e-4, 'Orbit must maintain radial camera distance');
  console.log('✓ Virtual Joystick Orbit verified mathematically!');
}

console.log('\n--- TEST 2: Camera Perspective Cycle Logic ---');
{
  const CAMERA_CYCLE = [
    { id: 'isometric', label: 'Iso' },
    { id: 'top', label: 'Top' },
    { id: 'rampart', label: 'Rmp' },
    { id: 'reset', label: 'Hom' },
  ];

  let activeCameraPreset = 'isometric';
  const cycleStates = [];

  for (let i = 0; i < 8; i++) {
    const camIdx = Math.max(0, CAMERA_CYCLE.findIndex((c) => c.id === activeCameraPreset));
    const nextIdx = (camIdx + 1) % CAMERA_CYCLE.length;
    activeCameraPreset = CAMERA_CYCLE[nextIdx].id;
    cycleStates.push(activeCameraPreset);
  }

  console.log('8 Consecutive Cycles:', cycleStates.join(' -> '));
  assert.deepStrictEqual(cycleStates, [
    'top', 'rampart', 'reset', 'isometric',
    'top', 'rampart', 'reset', 'isometric',
  ]);
  console.log('✓ Camera Cycle properly rotates indefinitely without getting stuck!');
}

console.log('\n--- TEST 3: Mobile Bottom Drawer Dynamic Tabs per Tool/Subtool ---');
{
  function computeTabs({ activeTool, propSubTool, lightingSubTool, selectedWallId }) {
    const showPropertiesTab = true;
    const showAssetsTab =
      ['texture', 'paint', 'foliage'].includes(activeTool) ||
      (activeTool === 'prop' && propSubTool === 'place') ||
      (activeTool === 'lighting' && lightingSubTool === 'place');

    const showOutlinerTab =
      ['building', 'walls', 'spline'].includes(activeTool) ||
      (activeTool === 'prop' && propSubTool !== 'place') ||
      (activeTool === 'lighting' && lightingSubTool !== 'place');

    const showElementTab =
      (activeTool === 'prop' && propSubTool !== 'place') ||
      (activeTool === 'lighting' && lightingSubTool !== 'place') ||
      (['building', 'walls', 'spline'].includes(activeTool) && Boolean(selectedWallId));

    const tabs = [];
    if (showPropertiesTab) tabs.push('properties');
    if (showAssetsTab) tabs.push('assets');
    if (showOutlinerTab) tabs.push('outliner');
    if (showElementTab) tabs.push('element');
    return tabs;
  }

  // 1. Figurine Place Mode
  const propPlace = computeTabs({ activeTool: 'prop', propSubTool: 'place' });
  console.log('Figurine in Place Mode Tabs:', propPlace);
  assert.deepStrictEqual(propPlace, ['properties', 'assets'], 'Figurine place mode must only show Properties and Assets');

  // 2. Figurine Select Mode
  const propSelect = computeTabs({ activeTool: 'prop', propSubTool: 'select' });
  console.log('Figurine in Select Mode Tabs:', propSelect);
  assert.deepStrictEqual(propSelect, ['properties', 'outliner', 'element'], 'Figurine select mode must show Properties, Outliner, and Element');

  // 3. Lighting Place Mode
  const lightPlace = computeTabs({ activeTool: 'lighting', lightingSubTool: 'place' });
  console.log('Lighting in Place Mode Tabs:', lightPlace);
  assert.deepStrictEqual(lightPlace, ['properties', 'assets'], 'Lighting place mode must only show Properties and Assets');

  // 4. Lighting Select Mode
  const lightSelect = computeTabs({ activeTool: 'lighting', lightingSubTool: 'select' });
  console.log('Lighting in Select Mode Tabs:', lightSelect);
  assert.deepStrictEqual(lightSelect, ['properties', 'outliner', 'element'], 'Lighting select mode must show Properties, Outliner, and Element');

  // 5. Trees (Foliage) Mode
  const foliageTabs = computeTabs({ activeTool: 'foliage' });
  console.log('Foliage Tabs:', foliageTabs);
  assert.deepStrictEqual(foliageTabs, ['properties', 'assets'], 'Foliage mode must only show Properties and Assets');

  // 6. Texture / Paint Mode
  const textureTabs = computeTabs({ activeTool: 'texture' });
  console.log('Texture Tabs:', textureTabs);
  assert.deepStrictEqual(textureTabs, ['properties', 'assets'], 'Texture mode must only show Properties and Assets');

  // 7. Terrain Mode
  const terrainTabs = computeTabs({ activeTool: 'terrain' });
  console.log('Terrain Tabs:', terrainTabs);
  assert.deepStrictEqual(terrainTabs, ['properties'], 'Terrain mode must only show Properties');

  // 8. Building / Walls (Unselected vs Selected)
  const buildingUnselected = computeTabs({ activeTool: 'building', selectedWallId: null });
  console.log('Building Unselected Tabs:', buildingUnselected);
  assert.deepStrictEqual(buildingUnselected, ['properties', 'outliner'], 'Building unselected must show Properties and Outliner');

  const buildingSelected = computeTabs({ activeTool: 'building', selectedWallId: 'wall_1' });
  console.log('Building Selected Tabs:', buildingSelected);
  assert.deepStrictEqual(buildingSelected, ['properties', 'outliner', 'element'], 'Building selected must show Properties, Outliner, and Element');

  console.log('✓ All tool tab configurations diagnosed and verified!');
}

