import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9223;
const TARGET_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.resolve(process.cwd(), 'screenshots/ticket19-audit');

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
      this.ws.onopen = () => {
        console.log('CDP WebSocket connected');
        resolve();
      };
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

async function runAudit() {
  console.log(`Starting Ticket 19 Baseline Audit Capture...`);
  console.log(`Output: ${OUTPUT_DIR}`);

  const userDataDir = path.resolve(process.cwd(), 'temp_chrome_p19');
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
    await client.send('Input.dispatchKeyEvent', { type: 'rawKeyDown' });

    console.log(`Navigating to ${TARGET_URL}...`);
    await client.send('Page.navigate', { url: TARGET_URL });
    console.log('Waiting for initial page hydration...');
    await sleep(4000);

    const captureShot = async (name, width = 1440, height = 900, mobile = false) => {
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

    // Close startup modal if open
    await evalJs(`
      try {
        if (window.__killa_editorStore) {
          const s = window.__killa_editorStore.getState();
          s.setStartupModalOpen(false);
          s.setPosterModalOpen(false);
          s.setAboutModalOpen(false);
          s.setShortcutsModalOpen(false);
          s.setResetConfirmOpen(false);
        }
      } catch(e) {}
    `);

    // 1. Desktop 1440x900 - Default Studio View (Terrain tool)
    await evalJs(`try { window.__killa_editorStore.getState().setActiveTool('terrain'); } catch(e){}`);
    await captureShot('01_desktop_1440x900_default_terrain', 1440, 900);

    // 2. Desktop 1440x900 - Building Tool (Left properties + Right Outliner open)
    await evalJs(`
      try {
        const s = window.__killa_editorStore.getState();
        s.setActiveTool('building');
        if (s.isRightSidebarMinimized) s.toggleRightSidebar();
        if (s.isMobileSidebarMinimized) s.toggleMobileSidebar();
      } catch(e) {}
    `);
    await captureShot('02_desktop_1440x900_building_outliner', 1440, 900);

    // 3. Desktop 1440x900 - View Tool (Diurnal Celestial Studio)
    await evalJs(`try { window.__killa_editorStore.getState().setActiveTool('view'); } catch(e){}`);
    await captureShot('03_desktop_1440x900_view_celestial', 1440, 900);

    // 4. Tablet Landscape 1024x768 - Building tool
    await evalJs(`try { window.__killa_editorStore.getState().setActiveTool('building'); } catch(e){}`);
    await captureShot('04_tablet_1024x768_building_crowded', 1024, 768);

    // 5. Tablet Portrait 820x1180 (iPad Air) - Terrain tool
    await evalJs(`try { window.__killa_editorStore.getState().setActiveTool('terrain'); } catch(e){}`);
    await captureShot('05_tablet_820x1180_terrain', 820, 1180);

    // 6. Mobile 390x844 (iPhone 14) - Default Terrain tool
    await captureShot('06_mobile_390x844_default_terrain', 390, 844, true);

    // 7. Mobile 390x844 - Building Tool (both sidebars active)
    await evalJs(`try { window.__killa_editorStore.getState().setActiveTool('building'); } catch(e){}`);
    await captureShot('07_mobile_390x844_building_overlap', 390, 844, true);

    // 8. Mobile 375x667 (iPhone SE) - Cramped viewport
    await captureShot('08_mobile_375x667_iphone_se', 375, 667, true);

    // 9. Keyboard Focus State Test (Tab through controls on desktop)
    await evalJs(`
      try {
        const firstBtn = document.querySelector('header button');
        if (firstBtn) firstBtn.focus();
      } catch(e) {}
    `);
    await captureShot('09_desktop_focus_appmenubar', 1440, 900);

    // 10. Destructive Confirmation Modal: Reset Scene
    await evalJs(`
      try {
        window.__killa_editorStore.getState().setResetConfirmOpen(true);
      } catch(e) {}
    `);
    await captureShot('10_desktop_modal_reset_confirm', 1440, 900);
    await evalJs(`
      try {
        window.__killa_editorStore.getState().setResetConfirmOpen(false);
      } catch(e) {}
    `);

    // 11. Destructive Confirmation Modal: Terrain Change Confirm
    await evalJs(`
      try {
        window.__killa_editorStore.getState().triggerTerrainChange({
          templateId: 'sinhagad',
          title: 'Sinhagad Fort',
          description: 'A rugged mountain fortress',
          accent: '#B85F45',
          noiseScale: 0.04,
          ridgePower: 1.8,
          plateauHeight: 2.2,
          roughness: 0.8
        });
      } catch(e) {}
    `);
    await captureShot('11_desktop_modal_terrain_change_confirm', 1440, 900);
    await evalJs(`
      try {
        window.__killa_editorStore.getState().setTerrainConfirmOpen(false);
      } catch(e) {}
    `);

    // 12. Presentation Mode (Full canvas diorama)
    await evalJs(`
      try {
        window.__killa_editorStore.getState().setPresentationMode(true);
      } catch(e) {}
    `);
    await captureShot('12_desktop_presentation_mode', 1440, 900);
    await evalJs(`
      try {
        window.__killa_editorStore.getState().setPresentationMode(false);
      } catch(e) {}
    `);

    await client.close();
    console.log(`🎉 Ticket 19 Baseline Audit Complete! Saved 12 screenshots to: ${OUTPUT_DIR}`);
  } finally {
    chromeProcess.kill();
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

runAudit().catch((err) => {
  console.error('Audit capture failed:', err);
  process.exit(1);
});

