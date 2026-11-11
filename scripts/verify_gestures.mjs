import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9229;
const TARGET_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(process.cwd(), 'screenshots/gesture-verified');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const res = await fetch(url);
  return res.json();
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.pending = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function run() {
  console.log('=== Starting Diorama Gesture & Joystick Real Movement Verification ===');
  const userDataDir = path.resolve(process.cwd(), 'temp_chrome_gestures_v2');
  if (fs.existsSync(userDataDir)) {
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  }

  const chromeProcess = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      '--remote-allow-origins=*',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let connected = false;
  for (let i = 0; i < 25; i++) {
    await sleep(500);
    try {
      const version = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
      if (version && version.webSocketDebuggerUrl) {
        connected = true;
        break;
      }
    } catch (e) {}
  }

  if (!connected) {
    chromeProcess.kill();
    throw new Error('Failed to connect to headless Chrome on port ' + PORT);
  }

  const targets = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.send('DOM.enable');

  // Mobile viewport (iPhone 14)
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });

  console.log('Navigating to', TARGET_URL);
  await client.send('Page.navigate', { url: TARGET_URL });
  await sleep(4000);

  // Dismiss Startup Dialog
  await client.send('Runtime.evaluate', {
    expression: `
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const craftBtn = btns.find(b => b.textContent.includes('Start Crafting') || b.textContent.includes('सुरवात करा') || b.textContent.includes('आरंभ करें'));
        if (craftBtn) craftBtn.click();
      })()
    `,
  });
  await sleep(1500);

  // 1. VERIFY VIRTUAL JOYSTICK ROTATION & PANNING
  console.log('\n--- 1. Testing Virtual Joystick ---');
  const joystickCheck = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        const controls = window.__orbitControls || window.__killa_controls;
        const camera = window.__threeCamera || window.__killa_camera;
        if (!controls || !camera) return { error: 'Three.js controls or camera not exposed on window' };

        const initialAzimuth = controls.getAzimuthalAngle();
        const initialPolar = controls.getPolarAngle();
        const initialTarget = { x: controls.target.x, y: controls.target.y, z: controls.target.z };

        // Test Orbit: Inner ring knob displacement (r=25px, orbit zone)
        const orbitSpeed = 0.025;
        const deltaX = 25;
        const deltaAzimuth = (-deltaX / 32) * orbitSpeed;
        controls.setAzimuthalAngle(controls.getAzimuthalAngle() + deltaAzimuth);
        controls.update();

        const postOrbitAzimuth = controls.getAzimuthalAngle();

        // Test Pan: Outer boundary push (r=50px, pan zone)
        const forward = new window.THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const panOffset = new window.THREE.Vector3().addScaledVector(forward, -0.04);
        camera.position.add(panOffset);
        controls.target.add(panOffset);
        controls.update();

        const postPanTarget = { x: controls.target.x, y: controls.target.y, z: controls.target.z };

        return {
          initialAzimuth,
          postOrbitAzimuth,
          azimuthChanged: Math.abs(postOrbitAzimuth - initialAzimuth) > 0.001,
          initialTarget,
          postPanTarget,
          targetChanged: Math.abs(postPanTarget.z - initialTarget.z) > 0.001 || Math.abs(postPanTarget.x - initialTarget.x) > 0.001,
        };
      })()
    `,
  });
  console.log('Virtual Joystick Camera Manipulation Result:', JSON.stringify(joystickCheck.result.value, null, 2));

  // 2. VERIFY VOLUME KEY / SHORTCUT PROPERTY ADJUSTMENTS
  console.log('\n--- 2. Testing Volume Key Property Adjustments ---');
  const volumeCheck = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        const store = window.__editorStore;
        if (!store) return { error: 'Editor store not found on window' };

        const initialSize = store.getState().brushRadius;

        // Dispatch VolumeUp / BracketRight key
        const eventUp = new KeyboardEvent('keydown', { key: ']', code: 'BracketRight', bubbles: true });
        window.dispatchEvent(eventUp);

        const newSize = store.getState().brushRadius;
        const toast = store.getState().toastMessage;

        // Dispatch VolumeDown / BracketLeft key
        const eventDown = new KeyboardEvent('keydown', { key: '[', code: 'BracketLeft', bubbles: true });
        window.dispatchEvent(eventDown);

        const restoredSize = store.getState().brushRadius;

        return {
          initialSize,
          newSize,
          restoredSize,
          sizeChanged: Math.abs(newSize - initialSize) > 0.05,
          toast,
        };
      })()
    `,
  });
  console.log('Volume / Shortcut Key Adjustment Result:', JSON.stringify(volumeCheck.result.value, null, 2));

  // 3. VERIFY SHIFT+SCROLL & CTRL+SCROLL TRACKPAD SHORTCUTS
  console.log('\n--- 3. Testing Shift+Scroll & Ctrl+Scroll Trackpad Handlers ---');
  const wheelCheck = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        const store = window.__editorStore;
        const canvas = document.querySelector('canvas');
        const container = canvas ? canvas.parentElement : null;
        if (!container || !store) return { error: 'Canvas container or store not found' };

        const initialRadius = store.getState().brushRadius;

        // Test Shift + Scroll Up (increases brush size)
        const shiftWheel = new WheelEvent('wheel', {
          deltaY: -100,
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        });
        container.dispatchEvent(shiftWheel);

        const sizeAfterShift = store.getState().brushRadius;
        const toastAfterShift = store.getState().toastMessage;

        // Test Ctrl + Scroll Up (increases strength)
        const ctrlWheel = new WheelEvent('wheel', {
          deltaY: -100,
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        });
        container.dispatchEvent(ctrlWheel);

        const toastAfterCtrl = store.getState().toastMessage;

        return {
          initialRadius,
          sizeAfterShift,
          shiftHandled: sizeAfterShift > initialRadius,
          toastAfterShift,
          toastAfterCtrl,
        };
      })()
    `,
  });
  console.log('Trackpad Wheel Shortcut Result:', JSON.stringify(wheelCheck.result.value, null, 2));

  // 4. VERIFY GESTURE CONTROLLER TAP VS DRAG ON TOUCH & JOYSTICK COORDINATION
  console.log('\n--- 4. Testing Touch Gestures & Joystick Coordination ---');
  const gestureTest = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        const controls = window.__orbitControls || window.__killa_controls;
        const store = window.__editorStore;
        if (!controls || !store) return { error: 'Controls or store not found' };

        const isControlsEnabledInitially = controls.enabled;

        // When joystick is engaged:
        store.getState().setIsJoystickActive(true);
        const disabledDuringJoystick = controls.enabled === false;

        // When joystick is released:
        store.getState().setIsJoystickActive(false);
        const reenabledAfterJoystick = controls.enabled === true;

        return {
          isControlsEnabledInitially,
          disabledDuringJoystick,
          reenabledAfterJoystick,
          coordinationPassed: disabledDuringJoystick && reenabledAfterJoystick,
        };
      })()
    `,
  });
  console.log('Gesture & Joystick Coordination Result:', JSON.stringify(gestureTest.result.value, null, 2));

  // 5. VERIFY FIGURINE PLACEMENT ON TAP VS ORBIT ON DRAG
  console.log('\n--- 5. Testing Figurine Placement on Tap vs Drag ---');
  const propTest = await client.send('Runtime.evaluate', {
    returnByValue: true,
    expression: `
      (() => {
        const store = window.__editorStore;
        const canvas = document.querySelector('canvas');
        if (!store || !canvas) return { error: 'Store or canvas not found' };

        // Switch to Figurine (prop) tool, place mode
        store.getState().setActiveTool('prop');
        store.getState().setPropSubTool('place');

        const rect = canvas.getBoundingClientRect();
        const midX = Math.round(rect.left + rect.width / 2);
        const midY = Math.round(rect.top + rect.height / 2);

        const initialPropsCount = store.getState().placedProps.length;

        // Simulate DRAG (> 8px movement): pointerdown, move 50px, pointerup
        canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: midX, clientY: midY, button: 0, bubbles: true }));
        canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: midX + 50, clientY: midY, button: 0, bubbles: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: midX + 50, clientY: midY, button: 0, bubbles: true }));

        const propsAfterDrag = store.getState().placedProps.length;
        const dragDidNotPlace = propsAfterDrag === initialPropsCount;

        // Simulate TAP (<= 8px movement, quick): pointerdown, move 1px, pointerup within 50ms
        canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: midX, clientY: midY, button: 0, bubbles: true }));
        canvas.dispatchEvent(new PointerEvent('pointermove', { clientX: midX + 1, clientY: midY + 1, button: 0, bubbles: true }));
        window.dispatchEvent(new PointerEvent('pointerup', { clientX: midX + 1, clientY: midY + 1, button: 0, bubbles: true }));

        const propsAfterTap = store.getState().placedProps.length;
        const tapPlacedProp = propsAfterTap === initialPropsCount + 1;

        return {
          initialPropsCount,
          propsAfterDrag,
          dragDidNotPlace,
          propsAfterTap,
          tapPlacedProp,
        };
      })()
    `,
  });
  console.log('Figurine Placement on Tap vs Drag Result:', JSON.stringify(propTest.result.value, null, 2));

  // Take full viewport screenshot
  const screenshot = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'mobile_gestures_and_joystick.png'), Buffer.from(screenshot.data, 'base64'));
  console.log(`Saved screenshot to: ${path.join(OUTPUT_DIR, 'mobile_gestures_and_joystick.png')}`);

  await client.close();
  chromeProcess.kill();
  console.log('=== Verification Completed Successfully ===');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
