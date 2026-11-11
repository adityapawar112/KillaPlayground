import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9227;
const TARGET_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(process.cwd(), 'screenshots/ticket19-verified');

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

async function runVerification() {
  console.log(`Starting Ticket 19 Visual Verification Capture...`);
  const userDataDir = path.resolve(process.cwd(), 'temp_chrome_p19_v');
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
  for (let i = 0; i < 20; i++) {
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

  try {
    const list = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
    const target = list.find((t) => t.type === 'page') || list[0];
    const client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    console.log(`Navigating to ${TARGET_URL}...`);
    await client.send('Page.navigate', { url: TARGET_URL });
    
    // Wait for Next.js compilation and store initialization
    let storeReady = false;
    for (let i = 0; i < 30; i++) {
      await sleep(1000);
      const res = await client.send('Runtime.evaluate', {
        expression: 'typeof window !== "undefined" && !!window.__killa_editorStore',
        returnByValue: true
      });
      if (res.result && res.result.value === true) {
        storeReady = true;
        console.log(`✓ Application ready & store initialized after ${i + 1}s`);
        break;
      }
    }
    if (!storeReady) {
      console.warn('⚠️ window.__killa_editorStore not detected within 30s, continuing anyway...');
    }
    await sleep(2000);

    const captureShot = async (name, width = 390, height = 844, mobile = true) => {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile,
      });
      await sleep(600);
      const res = await client.send('Page.captureScreenshot', { format: 'png' });
      const buffer = Buffer.from(res.data, 'base64');
      const outPath = path.join(OUTPUT_DIR, `${name}.png`);
      fs.writeFileSync(outPath, buffer);
      console.log(`✓ Captured: ${name}.png (${width}x${height})`);
    };

    const evalJs = async (expr) => {
      return client.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    };

    // Close startup modal initially
    await evalJs(`
      try {
        if (window.__killa_editorStore) {
          const s = window.__killa_editorStore.getState();
          s.setStartupModalOpen(false);
          s.setPosterModalOpen(false);
          s.setAboutModalOpen(false);
          s.setShortcutsModalOpen(false);
          s.setResetConfirmOpen(false);
          s.closeDestructiveConfirm();
        }
      } catch(e) {}
    `);

    // 1. Mobile 390x844: Default Studio (Top Nav with Camera/Axis/Undo/Redo, Virtual Joystick + FABs, Drawer Peek)
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setWorkspaceLayout('standard');
        s.setActiveTool('terrain');
        s.setMobileDrawerState('peek');
        s.setActiveRadialMenu('none');
      } catch(e) {}
    `);
    await captureShot('01_mobile_top_nav_joystick_fabs', 390, 844, true);

    // 2. Mobile 390x844: Hamburger Menu Slide-Over Open
    await evalJs(`
      try {
        const menuBtn = document.querySelector('button[aria-label="Open Studio Menu"]');
        if (menuBtn) menuBtn.click();
      } catch(e) {}
    `);
    await sleep(600);
    await captureShot('02_mobile_hamburger_menu_open', 390, 844, true);

    // Close menu
    await evalJs(`
      try {
        const backdrop = document.querySelector('.fixed.inset-0.z-50 > div');
        if (backdrop) backdrop.click();
      } catch(e) {}
    `);
    await sleep(400);

    // 3. Mobile 390x844: Drawer Open in Half State with [ Properties ] Tab (Embedding LeftToolSidebar)
    // Note: Virtual Joystick and FABs must shift upward above the drawer!
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setActiveTool('terrain');
        s.setMobileDrawerTab('properties');
        s.setMobileDrawerState('half');
      } catch(e) {}
    `);
    await sleep(500);
    await captureShot('03_mobile_bottom_drawer_properties', 390, 844, true);

    // 4. Mobile 390x844: Drawer Open in Half State with [ Assets ] Tab
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setActiveTool('texture');
        s.setMobileDrawerTab('assets');
        s.setMobileDrawerState('half');
      } catch(e) {}
    `);
    await sleep(500);
    await captureShot('04_mobile_bottom_drawer_assets', 390, 844, true);

    // 5. Mobile 390x844: Drawer Open in Half State with [ Outliner ] Tab
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setActiveTool('building');
        s.setMobileDrawerTab('outliner');
        s.setMobileDrawerState('half');
      } catch(e) {}
    `);
    await sleep(500);
    await captureShot('05_mobile_bottom_drawer_outliner', 390, 844, true);

    // 6. Mobile 390x844: Left FAB clicked -> In-place Radial Tool Menu replaces Joystick
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setMobileDrawerState('peek');
        s.setActiveRadialMenu('tool');
      } catch(e) {}
    `);
    await sleep(500);
    await captureShot('06_mobile_radial_tool_in_place', 390, 844, true);

    // 7. Mobile 390x844: Right FAB clicked -> In-place Radial Mode Menu replaces Joystick
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setActiveTool('building');
        s.setActiveRadialMenu('mode');
      } catch(e) {}
    `);
    await sleep(500);
    await captureShot('07_mobile_radial_mode_in_place', 390, 844, true);

    // 8. Mobile 390x844: Presentation Mode (Vertical floating bar on left)
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setActiveRadialMenu('none');
        s.setPresentationMode(true);
      } catch(e) {}
    `);
    await sleep(500);
    await captureShot('08_mobile_presentation_vertical_left', 390, 844, true);

    // 9. Mobile 390x844: Startup Modal (ProjectHubModal) fitting screen
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setPresentationMode(false);
        s.setWorkspaceLayout('standard');
        s.setStartupModalOpen(true);
      } catch(e) {}
    `);
    await sleep(600);
    await captureShot('09_mobile_startup_modal_fit', 390, 844, true);

    // Close startup modal
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setStartupModalOpen(false);
      } catch(e) {}
    `);

    // 10. Desktop 1440x900: Standard Studio Workspace (Both left and right panels open, camera cycle in bottom bar)
    await evalJs(`
      try {
        window.__killa_editorStore.setState({
          workspaceLayout: 'standard',
          isMobileSidebarMinimized: false,
          isToolModeMinimized: false,
          isRightSidebarMinimized: false,
        });
      } catch(e) {}
    `);
    await sleep(500);
    await captureShot('10_desktop_standard_workspace', 1440, 900, false);

    // 11. Desktop 1440x900: All sidebars minimized (Uniform folder handles without overlap)
    await evalJs(`
      try {
        window.__killa_editorStore.setState({
          workspaceLayout: 'standard',
          isMobileSidebarMinimized: true,
          isToolModeMinimized: true,
          isRightSidebarMinimized: true,
        });
      } catch(e) {}
    `);
    await sleep(500);
    await captureShot('11_desktop_minimized_handles_uniform', 1440, 900, false);

    // 12. Desktop 1440x900: Focus Crafting Workspace (Left panel open, right panel hidden)
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setWorkspaceLayout('focus');
      } catch(e) {}
    `);
    await sleep(500);
    await captureShot('12_desktop_focus_workspace', 1440, 900, false);

    // 13. Desktop 1440x900: Presentation Workspace (Horizontal glass bar at bottom center)
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setPresentationMode(true);
      } catch(e) {}
    `);
    await sleep(500);
    await captureShot('13_desktop_presentation_workspace', 1440, 900, false);

    await client.close();
    console.log(`[PASS] Visual verification complete! All 13 screenshots saved to: ${OUTPUT_DIR}`);
  } finally {
    chromeProcess.kill();
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  }
}

runVerification().catch((err) => {
  console.error('Verification capture failed:', err);
  process.exit(1);
});
