import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import manifest from './manifest';
import { useEditorStore } from '../lib/state/useEditorStore';

describe('Branding, Favicons & Manifest Integration', () => {
  it('generates valid web app manifest with transparent logo and PWA icons', () => {
    const data = manifest();
    expect(data.name).toBe('Killa Playground | 3D Diwali Mud Fort Diorama Builder');
    expect(data.short_name).toBe('Killa Playground');
    expect(data.background_color).toBe('#F9F6F0');
    expect(data.theme_color).toBe('#B85F45');

    const iconSrcs = data.icons?.map((icon) => icon.src);
    expect(iconSrcs).toContain('/killaplayground-tranparent.png');
    expect(iconSrcs).toContain('/android-chrome-192x192.png');
    expect(iconSrcs).toContain('/android-chrome-512x512.png');
    expect(iconSrcs).toContain('/apple-touch-icon.png');
    expect(iconSrcs).toContain('/favicon.ico');
  });

  it('all referenced branding logo and favicon files exist in public directory', () => {
    const publicDir = path.resolve(__dirname, '../../public');
    const requiredFiles = [
      'killaplayground-tranparent.png',
      'killaplayground-logo-light.png',
      'killaplayground-logo-dark.png',
      'killaplayground-favicon-light.png',
      'killaplayground-favicon-dark.png',
      'killaplayground-submark-light.png',
      'killaplayground-submark-dark.png',
      'favicon.ico',
      'favicon-16x16.png',
      'favicon-32x32.png',
      'apple-touch-icon.png',
      'android-chrome-192x192.png',
      'android-chrome-512x512.png',
    ];

    for (const file of requiredFiles) {
      const fullPath = path.join(publicDir, file);
      expect(fs.existsSync(fullPath), `Expected ${file} to exist in public/`).toBe(true);
    }
  });

  it('useEditorStore correctly toggles about modal open and close', () => {
    const { setAboutModalOpen } = useEditorStore.getState();
    expect(useEditorStore.getState().isAboutModalOpen).toBe(false);

    setAboutModalOpen(true);
    expect(useEditorStore.getState().isAboutModalOpen).toBe(true);

    setAboutModalOpen(false);
    expect(useEditorStore.getState().isAboutModalOpen).toBe(false);
  });
});
