import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;
const TARGET_URL = 'http://localhost:3000';

const OUTPUT_DIR = path.resolve(process.cwd(), 'screenshots/verification-fixes');

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

async function runFixVerification() {
  console.log(`Starting targeted verification capture...`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  const chromeProcess = spawn(
    CHROME_PATH,
    [
      `--remote-debugging-port=${PORT}`,
      '--remote-allow-origins=*',
      '--headless=new',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--window-size=1920,1080',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  let connected = false;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try {
      const res = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
      if (res && res.webSocketDebuggerUrl) {
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

    console.log('Waiting for initial page hydration...');
    await sleep(4000);

    const captureShot = async (name, width = 1920, height = 1080) => {
      await client.send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: width < 600,
      });
      await sleep(400);
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
        const s = window.__killa_editorStore.getState();
        s.setStartupModalOpen(false);
        s.setPosterModalOpen(false);
        s.setAboutModalOpen(false);
        s.setShortcutsModalOpen(false);
      } catch(e) {}
    `);
    await sleep(500);

    // 1. Building Tool: Left Panel Open, Tool Mode Rail Open (BESIDE Left Panel)
    await evalJs(`
      const s = window.__killa_editorStore.getState();
      s.setActiveTool('building');
      if (s.isMobileSidebarMinimized) s.toggleMobileSidebar();
      if (s.isToolModeMinimized) s.toggleToolMode();
    `);
    await sleep(600);
    await captureShot('fix-01-building-tool-rail-beside-leftpanel');

    // 2. Terrain Tool: Left Panel Open, Tool Mode Rail Open (BESIDE Left Panel)
    await evalJs(`
      const s = window.__killa_editorStore.getState();
      s.setActiveTool('terrain');
      if (s.isMobileSidebarMinimized) s.toggleMobileSidebar();
      if (s.isToolModeMinimized) s.toggleToolMode();
    `);
    await sleep(600);
    await captureShot('fix-02-terrain-tool-rail-beside-leftpanel');

    // 3. Left Panel Open, Tool Mode Minimized (Tab hangs beside left panel at sidebarWidth + 8px, not overlapping header)
    await evalJs(`
      const s = window.__killa_editorStore.getState();
      s.setActiveTool('building');
      if (s.isMobileSidebarMinimized) s.toggleMobileSidebar();
      if (!s.isToolModeMinimized) s.toggleToolMode();
    `);
    await sleep(600);
    await captureShot('fix-03-leftpanel-open-toolmode-minimized');

    // 4. Both Left Panel and Tool Mode Minimized (Side-by-side tabs at 8px and 116px, zero overlap)
    await evalJs(`
      const s = window.__killa_editorStore.getState();
      s.setActiveTool('building');
      if (!s.isMobileSidebarMinimized) s.toggleMobileSidebar();
      if (!s.isToolModeMinimized) s.toggleToolMode();
    `);
    await sleep(600);
    await captureShot('fix-04-both-minimized-side-by-side');

    // 5. Left Panel Minimized, Tool Mode Open (Rail at 0px, properties tab at 84px)
    await evalJs(`
      const s = window.__killa_editorStore.getState();
      s.setActiveTool('building');
      if (!s.isMobileSidebarMinimized) s.toggleMobileSidebar();
      if (s.isToolModeMinimized) s.toggleToolMode();
    `);
    await sleep(600);
    await captureShot('fix-05-leftpanel-minimized-toolmode-open');

    // 6. Language Selector in Top Bar (Pill-in-pill highlight)
    await evalJs(`
      const s = window.__killa_editorStore.getState();
      s.setStartupModalOpen(false);
      s.setPosterModalOpen(false);
    `);
    await sleep(400);
    await captureShot('fix-06-language-selector-topbar');

    // 7. Startup Modal with Unified Language Selector
    await evalJs(`
      const s = window.__killa_editorStore.getState();
      s.setStartupModalOpen(true);
    `);
    await sleep(600);
    await captureShot('fix-07-language-selector-startup-modal');

    // 8. Poster Studio Modal with Unified Language Selector
    await evalJs(`
      const s = window.__killa_editorStore.getState();
      s.setStartupModalOpen(false);
      s.setPosterModalOpen(true);
    `);
    await sleep(600);
    await captureShot('fix-08-language-selector-poster-modal');

    await client.close();
    console.log('Targeted verification capture complete!');
  } finally {
    chromeProcess.kill();
  }
}

runFixVerification().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});

