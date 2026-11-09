import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const TARGET_URL = 'http://localhost:3000';

const mode = process.argv[2] || 'baseline';
const OUTPUT_DIR = path.resolve(process.cwd(), `screenshots/audit-${mode}`);

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
        console.log('CDP WebSocket connected successfully');
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
  console.log(`Starting visual audit capture in mode: [${mode}]`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  const userDataDir = path.resolve(process.cwd(), 'temp_chrome_profile');
  if (fs.existsSync(userDataDir)) {
    try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
  }

  // Launch headless Chrome with remote-allow-origins
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
    console.log(`Connecting to page target: ${target.id}`);
    const client = new CDPClient(target.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Runtime.enable');

    console.log(`Navigating to ${TARGET_URL}...`);
    await client.send('Page.navigate', { url: TARGET_URL });

    // Wait for Next.js hydration and KillaCanvas loading
    console.log('Waiting for initial page hydration...');
    await sleep(5000);

    const captureShot = async (name, width = 1920, height = 1080) => {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 600,
      });
      await sleep(500);
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
        }
      } catch(e) {}
    `);

    // 1. Desktop Default (all panels closed)
    await captureShot('01-desktop-default-viewport', 1920, 1080);

    // 2. Desktop Tools (Terrain, Building, Texture, Foliage, Lighting)
    const tools = ['terrain', 'building', 'texture', 'foliage', 'lighting'];
    for (const t of tools) {
      await evalJs(`
        try {
          if (window.__killa_editorStore) {
            const s = window.__killa_editorStore.getState();
            s.setActiveTool('${t}');
            if (s.isMobileSidebarMinimized) s.toggleMobileSidebar();
          }
        } catch(e) {}
      `);
      await captureShot(`02-desktop-tool-${t}`, 1920, 1080);
    }

    // 3. Right Sidebar Outliner
    await evalJs(`
      try {
        if (window.__killa_editorStore) {
          const s = window.__killa_editorStore.getState();
          s.setActiveTool('building');
          if (s.isRightSidebarMinimized) s.toggleRightSidebar();
        }
      } catch(e) {}
    `);
    await captureShot('03-desktop-right-sidebar-outliner', 1920, 1080);

    // 4. Modals
    // Startup Modal
    await evalJs(`try { window.__killa_editorStore.getState().setStartupModalOpen(true); } catch(e){}`);
    await captureShot('04-desktop-modal-startup', 1920, 1080);
    await evalJs(`try { window.__killa_editorStore.getState().setStartupModalOpen(false); } catch(e){}`);

    // Project Hub Modal
    await evalJs(`try { window.__killa_editorStore.getState().setStartupModalOpen(true); } catch(e){}`);
    await captureShot('05-desktop-modal-projecthub', 1920, 1080);
    await evalJs(`try { window.__killa_editorStore.getState().setStartupModalOpen(false); } catch(e){}`);

    // Poster Studio Modal
    await evalJs(`try { window.__killa_editorStore.getState().setPosterModalOpen(true); } catch(e){}`);
    await captureShot('06-desktop-modal-posterstudio', 1920, 1080);
    await evalJs(`try { window.__killa_editorStore.getState().setPosterModalOpen(false); } catch(e){}`);

    // Shortcuts Modal
    await evalJs(`try { window.__killa_editorStore.getState().setShortcutsModalOpen(true); } catch(e){}`);
    await captureShot('07-desktop-modal-shortcuts', 1920, 1080);
    await evalJs(`try { window.__killa_editorStore.getState().setShortcutsModalOpen(false); } catch(e){}`);

    // About Modal
    await evalJs(`try { window.__killa_editorStore.getState().setAboutModalOpen(true); } catch(e){}`);
    await captureShot('08-desktop-modal-about', 1920, 1080);
    await evalJs(`try { window.__killa_editorStore.getState().setAboutModalOpen(false); } catch(e){}`);

    // 5. Tablet Viewport (1024x768)
    await evalJs(`try { window.__killa_editorStore.getState().setActiveTool('terrain'); } catch(e){}`);
    await captureShot('09-tablet-1024x768-terrain', 1024, 768);

    // 6. Mobile Viewport (390x844)
    await captureShot('10-mobile-390x844-default', 390, 844);

    // Mobile Hamburger Menu Open
    await evalJs(`
      try {
        const btn = document.querySelector('header button[title*="Menu"]');
        if (btn) btn.click();
      } catch(e) {}
    `);
    await captureShot('11-mobile-drawer-open', 390, 844);

    await client.close();
    console.log(`\n🎉 Visual audit capture complete! Saved screenshots to: ${OUTPUT_DIR}`);
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
