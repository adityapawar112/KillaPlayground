import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveLocalScreenshot,
  listLocalScreenshots,
  deleteLocalScreenshot,
  clearAllLocalScreenshots,
} from './screenshotVault';

describe('Local Screenshot Vault (Memory Fallback)', () => {
  beforeEach(async () => {
    await clearAllLocalScreenshots();
  });

  it('saves and lists screenshots with timestamps in descending order', async () => {
    const shot1 = await saveLocalScreenshot('data:image/png;base64,AAA1', 1920, 1080);
    expect(shot1.id).toBeDefined();
    expect(shot1.dataUrl).toBe('data:image/png;base64,AAA1');

    // Slight delay to ensure distinct timestamp
    await new Promise((r) => setTimeout(r, 10));

    const shot2 = await saveLocalScreenshot('data:image/png;base64,AAA2', 1920, 1080);

    const list = await listLocalScreenshots();
    expect(list.length).toBe(2);
    // Newest first
    expect(list[0].id).toBe(shot2.id);
    expect(list[1].id).toBe(shot1.id);
  });

  it('deletes an individual screenshot by id', async () => {
    const shot1 = await saveLocalScreenshot('data:image/png;base64,BBB1', 1920, 1080);
    const shot2 = await saveLocalScreenshot('data:image/png;base64,BBB2', 1920, 1080);

    await deleteLocalScreenshot(shot1.id);

    const list = await listLocalScreenshots();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(shot2.id);
  });

  it('clears all screenshots cleanly', async () => {
    await saveLocalScreenshot('data:image/png;base64,CCC1', 1920, 1080);
    await saveLocalScreenshot('data:image/png;base64,CCC2', 1920, 1080);

    await clearAllLocalScreenshots();

    const list = await listLocalScreenshots();
    expect(list.length).toBe(0);
  });
});

