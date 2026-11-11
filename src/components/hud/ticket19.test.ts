import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from '../../lib/state/useEditorStore';
import { TRANSLATIONS } from '../../lib/i18n/translations';
import { INTERACTION_CLASSES } from '../../lib/theme/tokens';

describe('Ticket 19: Universal Interaction States, Responsive Drawers & Workspaces', () => {
  beforeEach(() => {
    useEditorStore.setState({
      workspaceLayout: 'standard',
      prePresentationWorkspaceLayout: null,
      isPresentationMode: false,
      activeTool: 'terrain',
      mobileDrawerTab: 'properties',
      mobileDrawerState: 'peek',
      activeRadialMenu: 'none',
      destructiveModal: null,
    });
  });

  describe('1. Persistent 3 Workspace Layout Configurations (Review Item 7)', () => {
    it('initializes with standard studio workspace layout', () => {
      const store = useEditorStore.getState();
      expect(store.workspaceLayout).toBe('standard');
      expect(store.isPresentationMode).toBe(false);
    });

    it('switches cleanly to focus crafting workspace', () => {
      const store = useEditorStore.getState();
      store.setWorkspaceLayout('focus');

      const updated = useEditorStore.getState();
      expect(updated.workspaceLayout).toBe('focus');
      expect(updated.isPresentationMode).toBe(false);
      expect(updated.isMobileSidebarMinimized).toBe(false);
      expect(updated.isRightSidebarMinimized).toBe(true);
    });

    it('switches to presentation exhibition and restores previous layout on exit', () => {
      const store = useEditorStore.getState();
      store.setWorkspaceLayout('focus');
      expect(useEditorStore.getState().workspaceLayout).toBe('focus');

      // Enter presentation
      store.setWorkspaceLayout('presentation');
      const inPresentation = useEditorStore.getState();
      expect(inPresentation.workspaceLayout).toBe('presentation');
      expect(inPresentation.isPresentationMode).toBe(true);
      expect(inPresentation.activeTool).toBe('view');
      expect(inPresentation.prePresentationWorkspaceLayout).toBe('focus');

      // Exit presentation
      store.setPresentationMode(false);
      const afterExit = useEditorStore.getState();
      expect(afterExit.workspaceLayout).toBe('focus');
      expect(afterExit.isPresentationMode).toBe(false);
      expect(afterExit.prePresentationWorkspaceLayout).toBeNull();
    });

    it('cycles through layouts via toggleWorkspaceLayout', () => {
      const store = useEditorStore.getState();
      expect(store.workspaceLayout).toBe('standard');

      store.toggleWorkspaceLayout();
      expect(useEditorStore.getState().workspaceLayout).toBe('focus');

      store.toggleWorkspaceLayout();
      expect(useEditorStore.getState().workspaceLayout).toBe('presentation');

      store.toggleWorkspaceLayout();
      expect(useEditorStore.getState().workspaceLayout).toBe('standard');
    });
  });

  describe('2. Dynamic Bottom Drawer & Contextual Tab Gating (Review Item 20)', () => {
    it('manages mobile drawer tab and automatically expands to half state', () => {
      const store = useEditorStore.getState();
      expect(store.mobileDrawerTab).toBe('properties');
      expect(store.mobileDrawerState).toBe('peek');

      store.setMobileDrawerTab('outliner');
      expect(useEditorStore.getState().mobileDrawerTab).toBe('outliner');
      expect(useEditorStore.getState().mobileDrawerState).toBe('half');

      store.setMobileDrawerTab('assets');
      expect(useEditorStore.getState().mobileDrawerTab).toBe('assets');
      expect(useEditorStore.getState().mobileDrawerState).toBe('half');
    });

    it('toggles mobile drawer between collapsed/peek and half state', () => {
      const store = useEditorStore.getState();
      expect(store.mobileDrawerState).toBe('peek');

      store.toggleMobileDrawer();
      expect(useEditorStore.getState().mobileDrawerState).toBe('half');

      store.toggleMobileDrawer();
      expect(useEditorStore.getState().mobileDrawerState).toBe('peek');
    });

    it('supports direct drawer state setting (full, half, peek, collapsed)', () => {
      const store = useEditorStore.getState();
      store.setMobileDrawerState('full');
      expect(useEditorStore.getState().mobileDrawerState).toBe('full');

      store.setMobileDrawerState('collapsed');
      expect(useEditorStore.getState().mobileDrawerState).toBe('collapsed');
    });
  });

  describe('3. Radial Pie Dial Menu State Engine', () => {
    it('defaults activeRadialMenu to none', () => {
      const store = useEditorStore.getState();
      expect(store.activeRadialMenu).toBe('none');
    });

    it('activates tool or mode radial menus', () => {
      const store = useEditorStore.getState();
      store.setActiveRadialMenu('tool');
      expect(useEditorStore.getState().activeRadialMenu).toBe('tool');

      store.setActiveRadialMenu('mode');
      expect(useEditorStore.getState().activeRadialMenu).toBe('mode');

      store.setActiveRadialMenu('none');
      expect(useEditorStore.getState().activeRadialMenu).toBe('none');
    });
  });

  describe('4. Standardized Destructive Action Confirmation Engine', () => {
    it('opens and closes destructive confirmation modal cleanly', () => {
      const store = useEditorStore.getState();
      expect(store.destructiveModal).toBeNull();

      const onConfirmMock = vi.fn();
      store.openDestructiveConfirm({
        title: 'Delete Rampart',
        description: 'Are you sure you want to delete this rampart wall?',
        onConfirm: onConfirmMock,
      });

      const modal = useEditorStore.getState().destructiveModal;
      expect(modal).not.toBeNull();
      expect(modal?.isOpen).toBe(true);
      expect(modal?.title).toBe('Delete Rampart');
      expect(modal?.description).toContain('delete this rampart wall');

      // Execute confirmation
      modal?.onConfirm();
      expect(onConfirmMock).toHaveBeenCalledTimes(1);

      // Close modal
      store.closeDestructiveConfirm();
      expect(useEditorStore.getState().destructiveModal).toBeNull();
    });
  });

  describe('5. Universal Interaction States & Accessibility Tokens', () => {
    it('defines high-contrast accessible keyboard focus ring', () => {
      expect(INTERACTION_CLASSES.focusRing).toContain('focus-visible:ring-2');
      expect(INTERACTION_CLASSES.focusRing).toContain('focus-visible:ring-[#B85F45]');
      expect(INTERACTION_CLASSES.focusRing).toContain('focus-visible:outline-none');
    });

    it('enforces minimum 44x44px touch target envelope on mobile controls', () => {
      expect(INTERACTION_CLASSES.touchHitTarget).toContain('min-w-[44px]');
      expect(INTERACTION_CLASSES.touchHitTarget).toContain('min-h-[44px]');
    });

    it('standardizes button interaction state classes', () => {
      expect(INTERACTION_CLASSES.buttonDefault).toContain('bg-[#FAF8F5]');
      expect(INTERACTION_CLASSES.buttonSelected).toContain('bg-[#2B2621]');
      expect(INTERACTION_CLASSES.buttonDisabled).toContain('opacity-40');
    });
  });

  describe('6. Internationalization (i18n) Completeness', () => {
    const locales = ['en', 'mr', 'hi'] as const;

    it('provides complete translations for workspace layouts across en, mr, and hi', () => {
      for (const loc of locales) {
        const bar = TRANSLATIONS[loc].appMenuBar;
        expect(bar.workspaces).toBeDefined();
        expect(bar.workspaceStandard).toBeDefined();
        expect(bar.workspaceFocus).toBeDefined();
        expect(bar.workspacePresentation).toBeDefined();
      }
    });

    it('provides complete translations for mobile studio controls across en, mr, and hi', () => {
      for (const loc of locales) {
        const mob = (TRANSLATIONS[loc] as any).mobileStudio;
        expect(mob).toBeDefined();
        expect(mob.toolProperties).toBeDefined();
        expect(mob.outliner).toBeDefined();
        expect(mob.assetsProperties).toBeDefined();
        expect(mob.dayMode).toBeDefined();
        expect(mob.nightMode).toBeDefined();
        expect(mob.play).toBeDefined();
        expect(mob.pause).toBeDefined();
      }
    });

    it('provides complete translations for destructive confirmation dialogs across en, mr, and hi', () => {
      for (const loc of locales) {
        const dest = (TRANSLATIONS[loc] as any).destructiveModal;
        expect(dest).toBeDefined();
        expect(dest.clearFigurinesTitle).toBeDefined();
        expect(dest.clearLightsTitle).toBeDefined();
        expect(dest.deleteElementTitle).toBeDefined();
        expect(dest.confirm).toBeDefined();
        expect(dest.cancel).toBeDefined();
      }
    });
  });
});

