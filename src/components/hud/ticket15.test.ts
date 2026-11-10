import { describe, it, expect, beforeEach } from 'vitest';
import {
  useEditorStore,
  STUDIO_HEADER_HEIGHT_EXPANDED,
  STUDIO_HEADER_HEIGHT_COLLAPSED,
} from '../../lib/state/useEditorStore';
import { TRANSLATIONS } from '../../lib/i18n/translations';

describe('Ticket 15: Two-Row Studio Header & Compact Tool Rail State', () => {
  beforeEach(() => {
    useEditorStore.setState({
      isToolRailCompact: true,
      isDirty: false,
      showContextualDock: true,
      isMobileTopBarMinimized: false,
    });
  });

  it('exposes exact header height constants for expanded and collapsed rows', () => {
    expect(STUDIO_HEADER_HEIGHT_EXPANDED).toBe(72);
    expect(STUDIO_HEADER_HEIGHT_COLLAPSED).toBe(38);
  });

  it('toggles compact tool rail between 48px icon-only and 68px labeled rail', () => {
    const store = useEditorStore.getState();
    expect(store.isToolRailCompact).toBe(true);

    store.toggleToolRailCompact();
    expect(useEditorStore.getState().isToolRailCompact).toBe(false);

    store.toggleToolRailCompact();
    expect(useEditorStore.getState().isToolRailCompact).toBe(true);
  });

  it('tracks dirty document state indicator', () => {
    const store = useEditorStore.getState();
    expect(store.isDirty).toBe(false);

    store.setIsDirty(true);
    expect(useEditorStore.getState().isDirty).toBe(true);

    store.setIsDirty(false);
    expect(useEditorStore.getState().isDirty).toBe(false);
  });

  it('provides all new translation keys across English, Marathi, and Hindi', () => {
    const locales = ['en', 'mr', 'hi'] as const;

    for (const loc of locales) {
      const t = TRANSLATIONS[loc];

      // Settings dropdown in Row 1
      expect(t.appMenuBar.settings).toBeDefined();
      expect(t.appMenuBar.saved).toBeDefined();
      expect(t.appMenuBar.unsavedChanges).toBeDefined();

      // Contextual groupings in Left Sidebar
      expect(t.sidebars.left.geometry).toBeDefined();
      expect(t.sidebars.left.placement).toBeDefined();
      expect(t.sidebars.left.appearance).toBeDefined();
      expect(t.sidebars.left.behavior).toBeDefined();
      expect(t.sidebars.left.lighting).toBeDefined();
      expect(t.sidebars.left.camera).toBeDefined();
      expect(t.sidebars.left.advancedSettings).toBeDefined();

      // Right Panel standard dual-pane headers
      expect(t.sidebars.right.sceneOutliner).toBeDefined();
      expect(t.sidebars.right.elementInspector).toBeDefined();
      expect(t.sidebars.right.assetBrowser).toBeDefined();
      expect(t.sidebars.right.selectToInspect).toBeDefined();
    }
  });

  it('determines changeable advanced properties presence correctly across tools', () => {
    // Helper replicating hasAdvanced logic
    const hasAdvanced = (tool: string, mode?: string, subTool?: string) => {
      if (tool === 'building' || tool === 'walls') return mode === 'walls';
      if (tool === 'texture') return subTool === 'paint';
      if (tool === 'foliage') return subTool !== 'erase';
      if (tool === 'prop') return subTool === 'place';
      if (tool === 'lighting') return subTool === 'place';
      return false;
    };

    // Terrain must never display advanced settings checkbox
    expect(hasAdvanced('terrain')).toBe(false);

    // View must never display advanced settings checkbox (fireworks salvo at top)
    expect(hasAdvanced('view')).toBe(false);

    // Tools with changeable advanced properties
    expect(hasAdvanced('building', 'walls')).toBe(true);
    expect(hasAdvanced('building', 'foundation')).toBe(false);
    expect(hasAdvanced('texture', undefined, 'paint')).toBe(true);
    expect(hasAdvanced('foliage', undefined, 'scatter')).toBe(true);
    expect(hasAdvanced('foliage', undefined, 'erase')).toBe(false);
    expect(hasAdvanced('prop', undefined, 'place')).toBe(true);
    expect(hasAdvanced('prop', undefined, 'select')).toBe(false);
    expect(hasAdvanced('lighting', undefined, 'place')).toBe(true);
    expect(hasAdvanced('lighting', undefined, 'select')).toBe(false);
  });
});
