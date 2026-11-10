import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '../../lib/state/useEditorStore';
import { TRANSLATIONS } from '../../lib/i18n/translations';

describe('Ticket 16: Viewport Ergonomics, Celestial Lighting & Presentation Mode', () => {
  beforeEach(() => {
    useEditorStore.setState({
      showGuides: true,
      showWireframe: false,
      showBrickRing: true,
      isPresentationMode: false,
      isPlaying: true,
      viewMode: 'orbit',
      fogDensityMultiplier: 1.0,
      bounceIntensityMultiplier: 1.0,
      exposureMultiplier: 1.0,
      timeOfDay: 12.0,
      sunElevation: 75,
      sunAzimuth: 180,
      nightMode: false,
    });
  });

  describe('1. Viewport Guides & Overlays Toggles (Review Item 12)', () => {
    it('manages showGuides state and toggle', () => {
      const store = useEditorStore.getState();
      expect(store.showGuides).toBe(true);

      store.toggleGuides();
      expect(useEditorStore.getState().showGuides).toBe(false);

      store.setShowGuides(true);
      expect(useEditorStore.getState().showGuides).toBe(true);
    });

    it('manages showWireframe state and toggle', () => {
      const store = useEditorStore.getState();
      expect(store.showWireframe).toBe(false);

      store.toggleWireframe();
      expect(useEditorStore.getState().showWireframe).toBe(true);

      store.setShowWireframe(false);
      expect(useEditorStore.getState().showWireframe).toBe(false);
    });

    it('manages showBrickRing state and toggle', () => {
      const store = useEditorStore.getState();
      expect(store.showBrickRing).toBe(true);

      store.toggleBrickRing();
      expect(useEditorStore.getState().showBrickRing).toBe(false);

      store.setShowBrickRing(true);
      expect(useEditorStore.getState().showBrickRing).toBe(true);
    });
  });

  describe('2. Dedicated Diorama Presentation Mode (Review Item 13)', () => {
    it('toggles presentation mode state cleanly', () => {
      const store = useEditorStore.getState();
      expect(store.isPresentationMode).toBe(false);

      store.togglePresentationMode();
      expect(useEditorStore.getState().isPresentationMode).toBe(true);

      store.setPresentationMode(false);
      expect(useEditorStore.getState().isPresentationMode).toBe(false);
    });

    it('switches activeTool to view mode on enter and restores previous tool on exit', () => {
      const store = useEditorStore.getState();
      store.setActiveTool('terrain');
      expect(useEditorStore.getState().activeTool).toBe('terrain');

      // Enter presentation mode
      store.setPresentationMode(true);
      expect(useEditorStore.getState().isPresentationMode).toBe(true);
      expect(useEditorStore.getState().activeTool).toBe('view');
      expect(useEditorStore.getState().prePresentationTool).toBe('terrain');

      // Exit presentation mode
      store.setPresentationMode(false);
      expect(useEditorStore.getState().isPresentationMode).toBe(false);
      expect(useEditorStore.getState().activeTool).toBe('terrain');
      expect(useEditorStore.getState().prePresentationTool).toBeNull();
    });

    it('togglePresentationMode also preserves and restores previous tool', () => {
      const store = useEditorStore.getState();
      store.setActiveTool('walls');
      expect(useEditorStore.getState().activeTool).toBe('walls');

      // Toggle enter
      store.togglePresentationMode();
      expect(useEditorStore.getState().isPresentationMode).toBe(true);
      expect(useEditorStore.getState().activeTool).toBe('view');

      // Toggle exit
      store.togglePresentationMode();
      expect(useEditorStore.getState().isPresentationMode).toBe(false);
      expect(useEditorStore.getState().activeTool).toBe('walls');
    });
  });

  describe('2.1 Panel Minimize All & Maximize All Quick Actions', () => {
    it('collapses all panels cleanly', () => {
      const store = useEditorStore.getState();
      useEditorStore.setState({
        isMobileSidebarMinimized: false,
        isRightSidebarMinimized: false,
        showBottomStatusBar: true,
      });

      store.collapseAllPanels();
      const updated = useEditorStore.getState();
      expect(updated.isMobileSidebarMinimized).toBe(true);
      expect(updated.isRightSidebarMinimized).toBe(true);
      expect(updated.showBottomStatusBar).toBe(false);
    });

    it('expands all panels cleanly', () => {
      const store = useEditorStore.getState();
      useEditorStore.setState({
        isMobileSidebarMinimized: true,
        isRightSidebarMinimized: true,
        showBottomStatusBar: false,
      });

      store.expandAllPanels();
      const updated = useEditorStore.getState();
      expect(updated.isMobileSidebarMinimized).toBe(false);
      expect(updated.isRightSidebarMinimized).toBe(false);
      expect(updated.showBottomStatusBar).toBe(true);
    });
  });

  describe('3. Preset-First Celestial Lighting Studio (Review Item 14)', () => {
    it('sets Dawn celestial preset with exact coordinates', () => {
      const store = useEditorStore.getState();
      store.setSunDirectionPreset('dawn');

      const updated = useEditorStore.getState();
      expect(updated.timeOfDay).toBe(6.0);
      expect(updated.sunElevation).toBe(12);
      expect(updated.sunAzimuth).toBe(90);
      expect(updated.nightMode).toBe(false);
    });

    it('sets Noon celestial preset with exact coordinates', () => {
      const store = useEditorStore.getState();
      store.setSunDirectionPreset('noon');

      const updated = useEditorStore.getState();
      expect(updated.timeOfDay).toBe(12.0);
      expect(updated.sunElevation).toBe(75);
      expect(updated.sunAzimuth).toBe(180);
      expect(updated.nightMode).toBe(false);
    });

    it('sets Golden Hour sunset preset with exact coordinates', () => {
      const store = useEditorStore.getState();
      store.setSunDirectionPreset('sunset');

      const updated = useEditorStore.getState();
      expect(updated.timeOfDay).toBe(17.5);
      expect(updated.sunElevation).toBe(20);
      expect(updated.sunAzimuth).toBe(255);
      expect(updated.nightMode).toBe(false);
    });

    it('sets Diwali Night preset with exact coordinates and triggers salvo', () => {
      const store = useEditorStore.getState();
      store.setSunDirectionPreset('night');

      const updated = useEditorStore.getState();
      expect(updated.timeOfDay).toBe(21.0);
      expect(updated.sunElevation).toBe(52);
      expect(updated.sunAzimuth).toBe(230);
      expect(updated.nightMode).toBe(true);
      expect(updated.salvoTrigger).toBeGreaterThan(0);
    });

    it('resets atmospheric modifiers cleanly to default values', () => {
      const store = useEditorStore.getState();
      store.setFogDensityMultiplier(2.3);
      store.setBounceIntensityMultiplier(1.8);
      store.setExposureMultiplier(1.4);

      store.resetAtmosphericModifiers();

      const updated = useEditorStore.getState();
      expect(updated.fogDensityMultiplier).toBe(1.0);
      expect(updated.bounceIntensityMultiplier).toBe(1.0);
      expect(updated.exposureMultiplier).toBe(1.0);
    });
  });

  describe('4. Unified Bottom Viewport Toolbar Controls (Review Item 11)', () => {
    it('dispatches camera viewpoint presets', () => {
      const store = useEditorStore.getState();
      expect(store.cameraViewPreset).toBeNull();

      store.setCameraViewPreset('isometric');
      expect(useEditorStore.getState().cameraViewPreset).toBe('isometric');

      store.setCameraViewPreset('top');
      expect(useEditorStore.getState().cameraViewPreset).toBe('top');

      store.setCameraViewPreset('rampart');
      expect(useEditorStore.getState().cameraViewPreset).toBe('rampart');

      store.setCameraViewPreset('reset');
      expect(useEditorStore.getState().cameraViewPreset).toBe('reset');
    });

    it('toggles turntable spin animation mode', () => {
      const store = useEditorStore.getState();
      expect(store.viewMode).toBe('orbit');

      store.setViewMode('turntable');
      expect(useEditorStore.getState().viewMode).toBe('turntable');

      store.setViewMode('orbit');
      expect(useEditorStore.getState().viewMode).toBe('orbit');
    });
  });

  describe('5. Translation Parity for Ticket 16 Keys Across Locales', () => {
    const locales = ['en', 'mr', 'hi'] as const;

    it('defines all required appMenuBar view menu keys', () => {
      for (const loc of locales) {
        const t = TRANSLATIONS[loc];
        expect(t.appMenuBar.presentationMode).toBeDefined();
        expect(t.appMenuBar.showGuides).toBeDefined();
        expect(t.appMenuBar.showWireframe).toBeDefined();
        expect(t.appMenuBar.showBrickRing).toBeDefined();
        expect(t.appMenuBar.collapseAllPanels).toBeDefined();
        expect(t.appMenuBar.expandAllPanels).toBeDefined();
        expect(t.sidebars.left.resetSection).toBeDefined();
      }
    });

    it('defines all unified bottom viewport toolbar keys', () => {
      for (const loc of locales) {
        const t = TRANSLATIONS[loc];
        expect(t.dioramaQuickBar.isometric).toBeDefined();
        expect(t.dioramaQuickBar.birdsEye).toBeDefined();
        expect(t.dioramaQuickBar.rampartEye).toBeDefined();
        expect(t.dioramaQuickBar.resetHome).toBeDefined();
        expect(t.dioramaQuickBar.turntable).toBeDefined();
        expect(t.dioramaQuickBar.presentation).toBeDefined();
        expect(t.dioramaQuickBar.exitPresentation).toBeDefined();
        expect(t.dioramaQuickBar.escHint).toBeDefined();
      }
    });

    it('defines all celestial preset card descriptions', () => {
      for (const loc of locales) {
        const t = TRANSLATIONS[loc];
        expect(t.celestialPresets.dawnTitle).toBeDefined();
        expect(t.celestialPresets.dawnDesc).toBeDefined();
        expect(t.celestialPresets.noonTitle).toBeDefined();
        expect(t.celestialPresets.noonDesc).toBeDefined();
        expect(t.celestialPresets.goldenTitle).toBeDefined();
        expect(t.celestialPresets.goldenDesc).toBeDefined();
        expect(t.celestialPresets.nightTitle).toBeDefined();
        expect(t.celestialPresets.nightDesc).toBeDefined();
        expect(t.celestialPresets.advancedAtmosphere).toBeDefined();
        expect(t.celestialPresets.resetDefaults).toBeDefined();
      }
    });

    it('defines all contextual keycap labels', () => {
      for (const loc of locales) {
        const t = TRANSLATIONS[loc];
        expect(t.contextualKeycaps.click).toBeDefined();
        expect(t.contextualKeycaps.drag).toBeDefined();
        expect(t.contextualKeycaps.shiftScroll).toBeDefined();
        expect(t.contextualKeycaps.ctrlDrag).toBeDefined();
        expect(t.contextualKeycaps.altDrag).toBeDefined();
        expect(t.contextualKeycaps.enter).toBeDefined();
        expect(t.contextualKeycaps.esc).toBeDefined();
      }
    });
  });
});
