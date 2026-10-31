import { create } from 'zustand';
import { z } from 'zod';
import { COLORS } from '../constants/tokens';
import { useTerrainStore } from '../terrain/terrainStore';
import {
  WallPath,
  WallPoint,
  WallSettings,
  DEFAULT_WALL_SETTINGS,
  WallGate,
  WallSubTool,
  WallMode,
  WallStepperStep,
  FortStampType,
  CitadelKeep,
  SelectedComponentRef,
} from '../walls/wallTypes';
import { SnapResult } from '../walls/wallGeometry';
import { SplineConversionType, SplineSettings, SplinePath, SplineMode } from '../spline/splineTypes';
export type { SplineConversionType, SplineSettings, SplinePath, SplineMode, WallMode };

export interface HoveredElement {
  type: 'wall' | 'bastion' | 'tower' | 'box' | 'gate' | 'spline' | 'prop';
  id: string;
}

export const SavedProjectSchema = z.object({
  id: z.string().optional(),
  fortTitle: z.string().min(1).max(100).default('Imported Killa'),
  builderName: z.string().min(1).max(100).default('Mavala Builder'),
  templateId: z.string().default('raigad'),
  paintColor: z.string().optional().default(COLORS.basalt),
  waterMode: z.string().optional().default('tarpaulin'),
  splines: z.array(z.any()).default([]),
  walls: z.array(z.any()).optional().default([]),
  citadelKeeps: z.array(z.any()).optional().default([]),
  placedProps: z.array(z.any()).default([]),
  pondWaterFeatures: z.array(z.any()).optional().default([]),
  timestamp: z.number().optional(),
});

export type ToolType =
  // 6 Primary Killa-First Tools
  | 'terrain'
  | 'walls'
  | 'spline'
  | 'paint'
  | 'foliage'
  | 'prop'
  // Soil Pipeline Tools (Deferred Phase)
  | 'soil'
  | 'water'
  | 'shape'
  | 'shape_top'
  | 'shape_side'
  | 'dry'
  | 'grass';

export type ShapeSubTool = 'push_left' | 'push_right' | 'pat_top';
export type TerrainSubTool =
  | 'elevate'
  | 'plateau'
  | 'slope'
  | 'lower'
  | 'trench'
  | 'smooth'
  | 'pond'
  | 'soil'
  | 'retexture';
export type FoliageSubTool = 'grass' | 'path';

export type BrushSizeType = 'large' | 'medium' | 'fine';

export interface PondWaterFeature {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
}

export interface PlacedProp {
  id: string;
  type: string; // 'sinhasan' | 'mavala_spear' | 'mavala_sword' | 'tutari' | 'cannon' | 'flag' | 'boat' | 'diya' | 'temple'
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SavedProject {
  id: string;
  name: string;
  templateId: string;
  updatedAt: number;
  data: {
    splines: SplinePath[];
    walls?: WallPath[];
    citadelKeeps?: CitadelKeep[];
    placedProps: PlacedProp[];
    pondWaterFeatures?: PondWaterFeature[];
    fortTitle: string;
    builderName: string;
    templateId: string;
    paintColor?: string;
    waterMode?: 'reflective' | 'tarpaulin';
  };
}

const STORAGE_KEY = 'killa_saved_projects_v1';
const STARTUP_PREF_KEY = 'killa_dont_show_startup';

interface EditorState {
  // Active Tool & Brush State
  activeTool: ToolType;
  shapeSubTool: ShapeSubTool;
  setShapeSubTool: (st: ShapeSubTool) => void;
  terrainSubTool: TerrainSubTool;
  setTerrainSubTool: (st: TerrainSubTool) => void;
  plateauHeight: number;
  setPlateauHeight: (h: number) => void;
  slopeAngle: number; // 5 to 75 deg (default 30)
  setSlopeAngle: (angle: number) => void;
  slopeAlignment: 'camera' | 'terrain';
  setSlopeAlignment: (align: 'camera' | 'terrain') => void;
  slopeIncline: 'incline' | 'decline';
  setSlopeIncline: (incline: 'incline' | 'decline') => void;
  foliageSubTool: FoliageSubTool;
  setFoliageSubTool: (st: FoliageSubTool) => void;
  brushRadius: number; // 0.2 to 2.5
  brushStrength: number; // 0.1 to 1.0
  brushSize: BrushSizeType;
  steadyHand: boolean;
  paintColor: string;
  grassDensity: number;
  waterMode: 'reflective' | 'tarpaulin';
  nightMode: boolean;
  mudLocked: boolean;

  // Local Pond Water Planes
  pondWaterFeatures: PondWaterFeature[];
  addPondWater: (pond: Omit<PondWaterFeature, 'id'>) => string;
  removePondWater: (id: string) => void;
  clearPondWater: () => void;
  undoLastPondWater: () => void;
  setPondWaterFeatures: (features: PondWaterFeature[]) => void;

  // Parametric Fort Walls State
  walls: WallPath[];
  wallMode: WallMode;
  setWallMode: (mode: WallMode) => void;
  activeWallDraft: WallPoint[];
  wallSettings: WallSettings;
  wallSubTool: WallSubTool;
  selectedWallId: string | null;
  wallStep: WallStepperStep;
  activeStamp: FortStampType;
  citadelKeeps: CitadelKeep[];
  selectedComponent: SelectedComponentRef | null;
  wallSnapPreview: SnapResult | null;
  hoveredElement: HoveredElement | null;
  setHoveredElement: (el: HoveredElement | null) => void;

  updateWallName: (wallId: string, name: string) => void;
  updateTowerName: (wallId: string, towerId: string, name: string) => void;
  updateBoxBastionName: (wallId: string, boxId: string, name: string) => void;
  updateGateName: (wallId: string, gateId: string, name: string) => void;

  setWallSettings: (settings: Partial<WallSettings>) => void;
  setWallSubTool: (subTool: WallSubTool) => void;
  setSelectedWallId: (id: string | null) => void;
  setWallStep: (step: WallStepperStep) => void;
  setActiveStamp: (stamp: FortStampType) => void;
  setWallSnapPreview: (snap: SnapResult | null) => void;
  setSelectedComponent: (comp: SelectedComponentRef | null) => void;
  addWallDraftPoint: (point: WallPoint) => void;
  finishCurrentWall: (isClosed?: boolean) => string | null;
  cancelCurrentWall: () => void;
  removeWall: (id: string) => void;
  clearAllWalls: () => void;
  toggleBastionOnNode: (wallId: string, nodeIndex: number) => void;
  toggleGrandBastionOnNode: (wallId: string, nodeIndex: number) => void;
  updateBastionProperties: (wallId: string, nodeIndex: number, props: Partial<import('../walls/wallTypes').CustomBastionProps>) => void;
  removeBastionFromNode: (wallId: string, nodeIndex: number) => void;
  addTowerToWall: (wallId: string, segmentIndex: number, t?: number, radius?: number) => void;
  updateTowerProperties: (wallId: string, towerId: string, props: Partial<import('../walls/wallTypes').WallTower>) => void;
  removeTowerFromWall: (wallId: string, towerId: string) => void;
  addBoxBastionToWall: (wallId: string, segmentIndex: number, t?: number, props?: Partial<import('../walls/wallTypes').WallBoxBastion>) => void;
  updateBoxBastionProperties: (wallId: string, boxId: string, props: Partial<import('../walls/wallTypes').WallBoxBastion>) => void;
  removeBoxBastionFromWall: (wallId: string, boxId: string) => void;
  addGateToWall: (wallId: string, segmentIndex: number, t?: number) => void;
  updateGateProperties: (wallId: string, gateId: string, props: Partial<WallGate>) => void;
  removeGateFromWall: (wallId: string, gateId: string) => void;
  addCitadelKeep: (keep: Omit<CitadelKeep, 'id' | 'createdAt'>) => string;
  updateCitadelKeep: (id: string, updates: Partial<CitadelKeep>) => void;
  removeCitadelKeep: (id: string) => void;
  startNewWallCircuit: () => void;
  proceedToFortify: () => string | null;
  solidifyCurrentWall: () => void;
  setWalls: (walls: WallPath[]) => void;
  setCitadelKeeps: (keeps: CitadelKeep[]) => void;

  // Spline Drawing State
  splineMode: SplineMode;
  setSplineMode: (mode: SplineMode) => void;
  isDrawingSpline: boolean;
  currentSplinePoints: [number, number, number][];
  splines: SplinePath[];
  selectedSplineId: string | null;
  splineConversionType: SplineConversionType;
  splineSettings: SplineSettings;

  // Props & Figurines State
  placedProps: PlacedProp[];
  selectedPropType: string | null;
  selectedPropId: string | null;

  // Metadata & Project Identity
  fortTitle: string;
  builderName: string;
  templateId: string;

  // Localization
  locale: 'en' | 'mr' | 'hi';
  setLocale: (locale: 'en' | 'mr' | 'hi') => void;

  // Modals & Panels Visibility
  showLeftToolbar: boolean;
  toggleLeftToolbar: () => void;
  isMobileSidebarMinimized: boolean;
  toggleMobileSidebar: () => void;
  leftSidebarWidth: number;
  setLeftSidebarWidth: (w: number) => void;
  isToolModeMinimized: boolean;
  toggleToolMode: () => void;
  isRightSidebarMinimized: boolean;
  toggleRightSidebar: () => void;
  rightSidebarWidth: number;
  setRightSidebarWidth: (w: number) => void;
  showContextualDock: boolean;
  toggleContextualDock: () => void;
  isMobileTopBarMinimized: boolean;
  toggleMobileTopBar: () => void;
  showBottomStatusBar: boolean;
  toggleBottomStatusBar: () => void;

  isPropDrawerOpen: boolean;
  isPosterModalOpen: boolean;
  isModeSelectModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  isResetConfirmOpen: boolean;
  isStartupModalOpen: boolean;
  isAboutModalOpen: boolean;
  dontShowStartupModal: boolean;
  isTerrainDrawerOpen: boolean;
  terrainDrawerTab: 'historical' | 'freeform';

  // Base Water Level State
  waterLevel: number; // 0.0 to 0.45
  waterLevelActive: boolean;
  setWaterLevel: (lvl: number) => void;
  setWaterLevelActive: (active: boolean) => void;

  // Freeform Procedural Generation Settings
  freeformSettings: {
    elevation: number;
    tablelandWidth: number;
    cliffSteepness: number;
    roughness: number;
    seed: number;
  };
  setFreeformSetting: (key: 'elevation' | 'tablelandWidth' | 'cliffSteepness' | 'roughness' | 'seed', val: number) => void;
  randomizeFreeformSeed: () => void;

  // Local Saved Projects Vault
  savedProjects: SavedProject[];
  loadSavedProjects: () => void;
  saveProjectLocally: (name?: string) => string;
  loadProjectLocally: (id: string) => boolean;
  deleteProjectLocally: (id: string) => void;
  importProjectData: (jsonStr: string) => boolean;
  exportProjectData: () => string;

  // Notification Toast
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;

  // Camera & Navigation
  cameraResetTrigger: number;
  triggerCameraReset: () => void;
  cameraViewPreset: 'top' | 'front' | 'side' | 'reset' | 'zoom_in' | 'zoom_out' | null;
  setCameraViewPreset: (view: 'top' | 'front' | 'side' | 'reset' | 'zoom_in' | 'zoom_out' | null) => void;

  // Actions
  setActiveTool: (tool: ToolType) => void;
  setBrushRadius: (r: number) => void;
  setBrushStrength: (s: number) => void;
  setBrushSize: (size: BrushSizeType) => void;
  setSteadyHand: (enabled: boolean) => void;
  setPaintColor: (color: string) => void;
  setGrassDensity: (d: number) => void;
  setWaterMode: (mode: 'reflective' | 'tarpaulin') => void;
  setNightMode: (night: boolean) => void;
  toggleNightMode: () => void;
  setMudLocked: (locked: boolean) => void;

  // Spline Actions
  startSpline: () => void;
  addSplinePoint: (point: [number, number, number]) => void;
  finishSpline: (type?: SplineConversionType, settings?: SplineSettings) => string | null;
  cancelSpline: () => void;
  deleteSpline: (id: string) => void;
  clearAllSplines: () => void;
  setSelectedSplineId: (id: string | null) => void;
  setSplineConversionType: (type: SplineConversionType) => void;
  setSplineSettings: (settings: Partial<SplineSettings>) => void;
  updateSplineType: (id: string, type: SplineConversionType) => void;
  updateSplineSettings: (id: string, settings: Partial<SplineSettings>) => void;
  updateSplineName: (splineId: string, name: string) => void;
  translateSpline: (id: string, dx: number, dyOrDz: number, dz?: number) => void;
  rotateSpline: (id: string, angleDeg: number) => void;
  scaleSpline: (id: string, factor: number) => void;
  scaleSplineItem: (id: string, factor: number) => void;

  // Prop Actions
  addProp: (prop: Omit<PlacedProp, 'id'>) => string;
  updatePropTransform: (
    id: string,
    transform: Partial<Pick<PlacedProp, 'position' | 'rotation' | 'scale'>>
  ) => void;
  removeProp: (id: string) => void;
  setSelectedPropType: (type: string | null) => void;
  setSelectedPropId: (id: string | null) => void;

  // Metadata Actions
  setFortTitle: (title: string) => void;
  setBuilderName: (name: string) => void;
  setTemplateId: (templateId: string) => void;

  // Drawer / Modal Actions
  setPropDrawerOpen: (open: boolean) => void;
  setPosterModalOpen: (open: boolean) => void;
  setModeSelectModalOpen: (open: boolean) => void;
  setShortcutsModalOpen: (open: boolean) => void;
  setResetConfirmOpen: (open: boolean) => void;
  setStartupModalOpen: (open: boolean) => void;
  setAboutModalOpen: (open: boolean) => void;
  setDontShowStartupModal: (dontShow: boolean) => void;
  setTerrainDrawerOpen: (open: boolean, tab?: 'historical' | 'freeform') => void;
  setTerrainDrawerTab: (tab: 'historical' | 'freeform') => void;

  // Reset
  resetScene: () => void;
}

const getInitialSavedProjects = (): SavedProject[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

const getInitialStartupPref = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STARTUP_PREF_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Synchronous undo snapshot helper to capture state BEFORE any mutation occurs,
 * eliminating async microtask race conditions.
 *
 * // shortcut: Synchronous undo/redo snapshots via useTerrainStore, upgrade to isolated IndexedDB action journal if scene state exceeds 50MB
 */
const pushUndoSnapshot = () => {
  try {
    useTerrainStore.getState().pushUndo();
  } catch {
    // Graceful fallback if invoked during initial module bootstrapping
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  locale: 'en',
  setLocale: (locale) => set({ locale }),

  activeTool: 'terrain',
  shapeSubTool: 'pat_top',
  setShapeSubTool: (shapeSubTool) => set({ shapeSubTool }),
  terrainSubTool: 'elevate',
  setTerrainSubTool: (terrainSubTool) => set({ terrainSubTool }),
  plateauHeight: 1.0,
  setPlateauHeight: (plateauHeight) => set({ plateauHeight }),
  slopeAngle: 30,
  setSlopeAngle: (slopeAngle) => set({ slopeAngle }),
  slopeAlignment: 'camera',
  setSlopeAlignment: (slopeAlignment) => set({ slopeAlignment }),
  slopeIncline: 'incline',
  setSlopeIncline: (slopeIncline) => set({ slopeIncline }),
  foliageSubTool: 'grass',
  setFoliageSubTool: (foliageSubTool) => set({ foliageSubTool }),
  brushRadius: 0.8,
  brushStrength: 0.5,
  brushSize: 'medium',
  steadyHand: true,
  paintColor: COLORS.basalt,
  grassDensity: 0.6,
  waterMode: 'tarpaulin',
  nightMode: false,
  mudLocked: false,

  pondWaterFeatures: [],
  addPondWater: (pond) => {
    const id = `pond_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newPond: PondWaterFeature = { ...pond, id };
    set((state) => ({
      pondWaterFeatures: [...state.pondWaterFeatures, newPond],
    }));
    return id;
  },
  removePondWater: (id) =>
    set((state) => ({
      pondWaterFeatures: state.pondWaterFeatures.filter((p) => p.id !== id),
    })),
  clearPondWater: () => set({ pondWaterFeatures: [] }),
  undoLastPondWater: () =>
    set((state) => ({
      pondWaterFeatures: state.pondWaterFeatures.slice(0, -1),
    })),
  setPondWaterFeatures: (pondWaterFeatures) => set({ pondWaterFeatures }),

  // Parametric Fort Walls Implementation
  walls: [],
  wallMode: 'draw',
  setWallMode: (wallMode) =>
    set((state) => ({
      wallMode,
      selectedWallId: wallMode === 'draw' ? null : state.selectedWallId,
      selectedComponent: wallMode === 'draw' ? null : state.selectedComponent,
      activeWallDraft: [],
      activeStamp: wallMode === 'fortify' ? (state.activeStamp || 'tower') : null,
      wallSnapPreview: null,
      hoveredElement: null,
    })),
  hoveredElement: null,
  setHoveredElement: (hoveredElement) => set({ hoveredElement }),
  activeWallDraft: [],
  wallSettings: { ...DEFAULT_WALL_SETTINGS },
  wallSubTool: 'draw',
  selectedWallId: null,
  wallStep: 'layout',
  activeStamp: null,
  citadelKeeps: [],
  selectedComponent: null,
  wallSnapPreview: null,

  updateWallName: (wallId, name) =>
    set((state) => ({
      walls: state.walls.map((w) => (w.id === wallId ? { ...w, name } : w)),
    })),
  updateTowerName: (wallId, towerId, name) =>
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return {
          ...w,
          towers: (w.towers || []).map((t) => (t.id === towerId ? { ...t, name } : t)),
        };
      }),
    })),
  updateBoxBastionName: (wallId, boxId, name) =>
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return {
          ...w,
          boxBastions: (w.boxBastions || []).map((b) => (b.id === boxId ? { ...b, name } : b)),
        };
      }),
    })),
  updateGateName: (wallId, gateId, name) =>
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return {
          ...w,
          gates: (w.gates || []).map((g) => (g.id === gateId ? { ...g, name } : g)),
        };
      }),
    })),

  setWallSettings: (newSettings) =>
    set((state) => {
      const updated = { ...state.wallSettings, ...newSettings };
      const targetId = state.selectedWallId ?? (state.walls.length === 1 ? state.walls[0].id : null);
      const updatedWalls = targetId
        ? state.walls.map((w) => (w.id === targetId ? { ...w, settings: { ...w.settings, ...newSettings } } : w))
        : state.walls;
      return { wallSettings: updated, walls: updatedWalls };
    }),
  setWallSubTool: (wallSubTool) => set({ wallSubTool }),
  setSelectedWallId: (selectedWallId) =>
    set((state) => {
      if (!selectedWallId) return { selectedWallId: null };
      const wall = state.walls.find((w) => w.id === selectedWallId);
      return {
        selectedWallId,
        wallSettings: wall ? { ...wall.settings } : state.wallSettings,
      };
    }),
  // shortcut: 3-state stepper (layout -> fortify -> solidified), upgrade to hierarchical statechart (XState) if nested sub-bastion editing modes are added
  setWallStep: (wallStep) =>
    set((state) => {
      // Guard: Cannot transition to fortify or solidified if there are no walls built and no active draft
      if (wallStep !== 'layout' && state.walls.length === 0 && state.activeWallDraft.length < 2) {
        return state;
      }
      return { wallStep };
    }),
  setActiveStamp: (activeStamp) => set({ activeStamp, wallSnapPreview: null }),
  setWallSnapPreview: (wallSnapPreview) => set({ wallSnapPreview }),
  setSelectedComponent: (selectedComponent) => set({ selectedComponent }),
  addWallDraftPoint: (point) =>
    set((state) => ({ activeWallDraft: [...state.activeWallDraft, point] })),
  finishCurrentWall: (isClosed = false) => {
    const { activeWallDraft, wallSettings, walls } = get();
    if (activeWallDraft.length < 2) return null;

    pushUndoSnapshot();

    const id = `wall_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newWall: WallPath = {
      id,
      points: [...activeWallDraft],
      isClosed,
      towers: [],
      boxBastions: [],
      manualBastionIndices: [],
      grandBastionIndices: [],
      gates: [],
      settings: { ...wallSettings },
      createdAt: Date.now(),
    };

    set({
      walls: [...walls, newWall],
      activeWallDraft: [],
      selectedWallId: null,
    });
    return id;
  },
  cancelCurrentWall: () => set({ activeWallDraft: [] }),
  removeWall: (id) => {
    pushUndoSnapshot();
    set((state) => ({
      walls: state.walls.filter((w) => w.id !== id),
      selectedWallId: state.selectedWallId === id ? null : state.selectedWallId,
      selectedComponent:
        state.selectedComponent?.wallId === id ? null : state.selectedComponent,
    }));
  },
  clearAllWalls: () => {
    if (get().walls.length === 0) return;
    pushUndoSnapshot();
    set({
      walls: [],
      activeWallDraft: [],
      selectedWallId: null,
      selectedComponent: null,
      wallStep: 'layout',
    });
  },
  toggleBastionOnNode: (wallId, nodeIndex) => {
    pushUndoSnapshot();
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        const current = new Set(w.manualBastionIndices || []);
        const excluded = new Set(w.excludedBastionIndices || []);
        if (current.has(nodeIndex)) {
          current.delete(nodeIndex);
        } else {
          current.add(nodeIndex);
          excluded.delete(nodeIndex); // Un-exclude if user explicitly toggles bastion back on
        }
        return {
          ...w,
          manualBastionIndices: Array.from(current).sort((a, b) => a - b),
          excludedBastionIndices: Array.from(excluded).sort((a, b) => a - b),
        };
      }),
    }));
  },
  toggleGrandBastionOnNode: (wallId, nodeIndex) => {
    pushUndoSnapshot();
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        const currentGrand = new Set(w.grandBastionIndices || []);
        const currentManual = new Set(w.manualBastionIndices || []);
        const excluded = new Set(w.excludedBastionIndices || []);
        if (currentGrand.has(nodeIndex)) {
          currentGrand.delete(nodeIndex);
        } else {
          currentGrand.add(nodeIndex);
          currentManual.add(nodeIndex); // Grand bastion is also a bastion
          excluded.delete(nodeIndex);
        }
        return {
          ...w,
          grandBastionIndices: Array.from(currentGrand).sort((a, b) => a - b),
          manualBastionIndices: Array.from(currentManual).sort((a, b) => a - b),
          excludedBastionIndices: Array.from(excluded).sort((a, b) => a - b),
        };
      }),
    }));
  },
  updateBastionProperties: (wallId, nodeIndex, props) => {
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        const current = w.customBastions || {};
        const updated = {
          ...current,
          [nodeIndex]: { ...(current[nodeIndex] || {}), ...props },
        };
        let grandBastions = w.grandBastionIndices || [];
        let manualBastions = w.manualBastionIndices || [];
        if (props.isGrand !== undefined) {
          if (props.isGrand) {
            grandBastions = Array.from(new Set([...grandBastions, nodeIndex])).sort((a, b) => a - b);
            manualBastions = Array.from(new Set([...manualBastions, nodeIndex])).sort((a, b) => a - b);
          } else {
            grandBastions = grandBastions.filter((idx) => idx !== nodeIndex);
          }
        }
        return {
          ...w,
          customBastions: updated,
          grandBastionIndices: grandBastions,
          manualBastionIndices: manualBastions,
        };
      }),
    }));
  },
  removeBastionFromNode: (wallId, nodeIndex) => {
    pushUndoSnapshot();
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        const manual = (w.manualBastionIndices || []).filter((idx) => idx !== nodeIndex);
        const grand = (w.grandBastionIndices || []).filter((idx) => idx !== nodeIndex);
        const excluded = Array.from(new Set([...(w.excludedBastionIndices || []), nodeIndex])).sort((a, b) => a - b);
        const custom = { ...(w.customBastions || {}) };
        delete custom[nodeIndex];
        return {
          ...w,
          manualBastionIndices: manual,
          grandBastionIndices: grand,
          excludedBastionIndices: excluded,
          customBastions: custom,
        };
      }),
      selectedComponent:
        state.selectedComponent?.type === 'bastion' &&
        state.selectedComponent.idOrIndex === nodeIndex &&
        state.selectedComponent.wallId === wallId
          ? null
          : state.selectedComponent,
    }));
  },
  addTowerToWall: (wallId, segmentIndex, t = 0.5, radius) => {
    pushUndoSnapshot();
    const towerId = `tower_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((state) => {
      const wall = state.walls.find((w) => w.id === wallId);
      const defaultRadius = wall?.settings.bastionRadius || 0.13;
      const newTower: import('../walls/wallTypes').WallTower = {
        id: towerId,
        segmentIndex,
        t,
        radius: radius ?? defaultRadius,
        heightOffset: 0.02,
      };
      return {
        walls: state.walls.map((w) => {
          if (w.id !== wallId) return w;
          return { ...w, towers: [...(w.towers || []), newTower] };
        }),
        selectedComponent: { type: 'tower', idOrIndex: towerId, wallId },
      };
    });
  },
  updateTowerProperties: (wallId, towerId, props) => {
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return {
          ...w,
          towers: (w.towers || []).map((tow) => (tow.id === towerId ? { ...tow, ...props } : tow)),
        };
      }),
    }));
  },
  removeTowerFromWall: (wallId, towerId) => {
    pushUndoSnapshot();
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return { ...w, towers: (w.towers || []).filter((tow) => tow.id !== towerId) };
      }),
      selectedComponent:
        state.selectedComponent?.type === 'tower' && state.selectedComponent.idOrIndex === towerId
          ? null
          : state.selectedComponent,
    }));
  },
  addBoxBastionToWall: (wallId, segmentIndex, t = 0.5, props) => {
    pushUndoSnapshot();
    const boxId = `box_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newBox: import('../walls/wallTypes').WallBoxBastion = {
      id: boxId,
      segmentIndex,
      t,
      width: props?.width ?? 0.30,
      depth: props?.depth ?? 0.30,
      heightOffset: props?.heightOffset ?? 0.04,
      flipSide: props?.flipSide ?? false,
    };
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return { ...w, boxBastions: [...(w.boxBastions || []), newBox] };
      }),
      selectedComponent: { type: 'box', idOrIndex: boxId, wallId },
    }));
  },
  updateBoxBastionProperties: (wallId, boxId, props) => {
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return {
          ...w,
          boxBastions: (w.boxBastions || []).map((b) => (b.id === boxId ? { ...b, ...props } : b)),
        };
      }),
    }));
  },
  removeBoxBastionFromWall: (wallId, boxId) => {
    pushUndoSnapshot();
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return { ...w, boxBastions: (w.boxBastions || []).filter((b) => b.id !== boxId) };
      }),
      selectedComponent:
        state.selectedComponent?.type === 'box' && state.selectedComponent.idOrIndex === boxId
          ? null
          : state.selectedComponent,
    }));
  },
  addGateToWall: (wallId, segmentIndex, t = 0.5) => {
    pushUndoSnapshot();
    const gateId = `gate_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newGate: WallGate = {
      id: gateId,
      segmentIndex,
      t,
      width: 0.18,
      height: 0.18,
      hasGatehouse: true,
    };
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return { ...w, gates: [...(w.gates || []), newGate] };
      }),
      selectedComponent: { type: 'gate', idOrIndex: gateId, wallId },
    }));
  },
  updateGateProperties: (wallId, gateId, props) => {
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return {
          ...w,
          gates: (w.gates || []).map((g) => (g.id === gateId ? { ...g, ...props } : g)),
        };
      }),
    }));
  },
  removeGateFromWall: (wallId, gateId) => {
    pushUndoSnapshot();
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return { ...w, gates: (w.gates || []).filter((g) => g.id !== gateId) };
      }),
      selectedComponent:
        state.selectedComponent?.type === 'gate' && state.selectedComponent.idOrIndex === gateId
          ? null
          : state.selectedComponent,
    }));
  },
  addCitadelKeep: (keep) => {
    pushUndoSnapshot();
    const id = `citadel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newKeep: CitadelKeep = {
      ...keep,
      id,
      createdAt: Date.now(),
    };
    set((state) => ({
      citadelKeeps: [...state.citadelKeeps, newKeep],
      selectedComponent: { type: 'citadel', idOrIndex: id },
    }));
    return id;
  },
  updateCitadelKeep: (id, updates) => {
    set((state) => ({
      citadelKeeps: state.citadelKeeps.map((k) => (k.id === id ? { ...k, ...updates } : k)),
    }));
  },
  removeCitadelKeep: (id) => {
    pushUndoSnapshot();
    set((state) => ({
      citadelKeeps: state.citadelKeeps.filter((k) => k.id !== id),
      selectedComponent:
        state.selectedComponent?.type === 'citadel' && state.selectedComponent.idOrIndex === id
          ? null
          : state.selectedComponent,
    }));
  },
  startNewWallCircuit: () => {
    set({
      activeWallDraft: [],
      selectedWallId: null,
      activeStamp: null,
      selectedComponent: null,
      wallStep: 'layout',
    });
  },
  proceedToFortify: () => {
    const { activeWallDraft, finishCurrentWall, selectedWallId, walls } = get();
    if (activeWallDraft.length >= 2) {
      const first = activeWallDraft[0];
      const last = activeWallDraft[activeWallDraft.length - 1];
      const dx = first.x - last.x;
      const dz = first.z - last.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const isClosed = activeWallDraft.length >= 3 && dist < 0.7;
      const newId = finishCurrentWall(isClosed);
      set({ wallStep: 'fortify', selectedWallId: newId });
      return newId;
    }
    if (selectedWallId) {
      set({ wallStep: 'fortify' });
      return selectedWallId;
    }
    if (walls.length > 0) {
      const latestId = walls[walls.length - 1].id;
      set({ wallStep: 'fortify', selectedWallId: latestId });
      return latestId;
    }
    return null;
  },
  solidifyCurrentWall: () => {
    set({
      wallStep: 'solidified',
      selectedWallId: null,
      activeStamp: null,
      selectedComponent: null,
    });
  },
  setWalls: (walls) => set({ walls }),
  setCitadelKeeps: (citadelKeeps) => set({ citadelKeeps }),

  splineMode: 'draw',
  setSplineMode: (splineMode) =>
    set((state) => ({
      splineMode,
      selectedSplineId: splineMode === 'draw' ? null : state.selectedSplineId,
      currentSplinePoints: [],
      isDrawingSpline: false,
      hoveredElement: null,
    })),
  isDrawingSpline: false,
  currentSplinePoints: [],
  splines: [],
  selectedSplineId: null,
  splineConversionType: 'steps',
  splineSettings: {
    stepWidth: 0.06,
    stepRun: 0.025,
    stepRise: 0.01,
    stepOffset: 0.0,
    stepSpacing: 0.025,
    spacing: 0.20,
    scale: 1.0,
  },

  placedProps: [],
  selectedPropType: null,
  selectedPropId: null,

  fortTitle: 'Our Killa',
  builderName: 'Mavala Builder',
  templateId: 'raigad',

  // Visibility States
  showLeftToolbar: true,
  toggleLeftToolbar: () => set((state) => ({ showLeftToolbar: !state.showLeftToolbar })),
  isMobileSidebarMinimized: false,
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarMinimized: !state.isMobileSidebarMinimized })),
  leftSidebarWidth: 310,
  setLeftSidebarWidth: (w: number) => set({ leftSidebarWidth: w }),
  isToolModeMinimized: false,
  toggleToolMode: () => set((state) => ({ isToolModeMinimized: !state.isToolModeMinimized })),
  isRightSidebarMinimized: false,
  toggleRightSidebar: () => set((state) => ({ isRightSidebarMinimized: !state.isRightSidebarMinimized })),
  rightSidebarWidth: 310,
  setRightSidebarWidth: (w: number) => set({ rightSidebarWidth: w }),
  showContextualDock: true,
  toggleContextualDock: () => set((state) => ({ showContextualDock: !state.showContextualDock })),
  isMobileTopBarMinimized: false,
  toggleMobileTopBar: () => set((state) => ({ isMobileTopBarMinimized: !state.isMobileTopBarMinimized })),
  showBottomStatusBar: true,
  toggleBottomStatusBar: () => set((state) => ({ showBottomStatusBar: !state.showBottomStatusBar })),

  isPropDrawerOpen: false,
  isPosterModalOpen: false,
  isModeSelectModalOpen: false,
  isShortcutsModalOpen: false,
  isResetConfirmOpen: false,
  isStartupModalOpen: false, // Default to false so user immediately accesses the 3D diorama
  isAboutModalOpen: false,
  dontShowStartupModal: false,
  isTerrainDrawerOpen: false,
  terrainDrawerTab: 'historical',

  // Water Level Defaults
  waterLevel: 0.12,
  waterLevelActive: true,
  setWaterLevel: (waterLevel) => set({ waterLevel }),
  setWaterLevelActive: (waterLevelActive) => set({ waterLevelActive }),

  // Freeform procedural defaults
  freeformSettings: {
    elevation: 1.45,
    tablelandWidth: 3.4,
    cliffSteepness: 5.5,
    roughness: 0.5,
    seed: 42,
  },
  setFreeformSetting: (key, val) => {
    set((state) => {
      const updated = { ...state.freeformSettings, [key]: val };
      if (state.templateId === 'scratch') {
        import('../terrain/terrainStore').then((m) => {
          m.useTerrainStore.getState().loadTemplate('scratch', updated);
        });
      }
      return { freeformSettings: updated };
    });
  },
  randomizeFreeformSeed: () => {
    const newSeed = Math.floor(Math.random() * 1000000);
    get().setFreeformSetting('seed', newSeed);
  },

  savedProjects: [],
  toastMessage: null,
  setToastMessage: (msg) => set({ toastMessage: msg }),

  cameraResetTrigger: 0,
  triggerCameraReset: () => set((state) => ({ cameraResetTrigger: state.cameraResetTrigger + 1 })),
  cameraViewPreset: null,
  setCameraViewPreset: (v) => set({ cameraViewPreset: v }),

  loadSavedProjects: () => {
    const projects = getInitialSavedProjects();
    const dontShow = getInitialStartupPref();
    set({
      savedProjects: projects,
      dontShowStartupModal: dontShow,
    });
  },

  saveProjectLocally: (name) => {
    const { splines, walls, placedProps, pondWaterFeatures, fortTitle, builderName, templateId, paintColor, waterMode, savedProjects } = get();
    const projectName = name?.trim() || fortTitle || 'Untitled Killa';
    const projectId = `killa_${Date.now()}`;
    const newProject: SavedProject = {
      id: projectId,
      name: projectName,
      templateId,
      updatedAt: Date.now(),
      data: {
        splines,
        walls,
        placedProps,
        pondWaterFeatures,
        fortTitle: projectName,
        builderName,
        templateId,
        paintColor,
        waterMode,
      },
    };

    const existingIndex = savedProjects.findIndex((p) => p.name.toLowerCase() === projectName.toLowerCase());
    let updatedProjects: SavedProject[];
    if (existingIndex >= 0) {
      updatedProjects = [...savedProjects];
      updatedProjects[existingIndex] = newProject;
    } else {
      updatedProjects = [newProject, ...savedProjects];
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }

    set({ savedProjects: updatedProjects, fortTitle: projectName });
    return projectId;
  },

  loadProjectLocally: (id) => {
    const { savedProjects } = get();
    const proj = savedProjects.find((p) => p.id === id);
    if (!proj || !proj.data) return false;

    set({
      splines: proj.data.splines || [],
      walls: proj.data.walls || [],
      placedProps: proj.data.placedProps || [],
      pondWaterFeatures: proj.data.pondWaterFeatures || [],
      fortTitle: proj.data.fortTitle || proj.name,
      builderName: proj.data.builderName || 'Mavala Builder',
      templateId: proj.data.templateId || 'raigad',
      paintColor: proj.data.paintColor || COLORS.basalt,
      waterMode: proj.data.waterMode || 'tarpaulin',
      isStartupModalOpen: false,
    });
    return true;
  },

  deleteProjectLocally: (id) => {
    const { savedProjects } = get();
    const updated = savedProjects.filter((p) => p.id !== id);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update localStorage:', err);
      }
    }
    set({ savedProjects: updated });
  },

  exportProjectData: () => {
    const { splines, walls, placedProps, pondWaterFeatures, fortTitle, builderName, templateId, paintColor, waterMode } = get();
    const payload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      fortTitle,
      builderName,
      templateId,
      paintColor,
      waterMode,
      splines,
      walls,
      placedProps,
      pondWaterFeatures,
    };
    return JSON.stringify(payload, null, 2);
  },

  importProjectData: (jsonStr) => {
    try {
      const raw = JSON.parse(jsonStr);
      const parsed = SavedProjectSchema.safeParse(raw);
      if (!parsed.success) {
        console.warn('Invalid project format:', parsed.error);
        return false;
      }
      const data = parsed.data;

      set({
        fortTitle: data.fortTitle,
        builderName: data.builderName,
        templateId: data.templateId,
        paintColor: data.paintColor,
        waterMode: data.waterMode as any,
        splines: data.splines,
        walls: (data as any).walls || [],
        placedProps: data.placedProps,
        pondWaterFeatures: data.pondWaterFeatures || [],
        isStartupModalOpen: false,
      });

      // Also auto-save into local projects list
      get().saveProjectLocally(data.fortTitle);
      return true;
    } catch (err) {
      console.error('Failed to parse project JSON:', err);
      return false;
    }
  },

  setActiveTool: (tool) => {
    set({
      activeTool: tool,
      isPropDrawerOpen: tool === 'prop',
      selectedWallId: null,
      selectedComponent: null,
      activeWallDraft: [],
      activeStamp: null,
      wallSnapPreview: null,
      selectedSplineId: null,
      currentSplinePoints: [],
      isDrawingSpline: false,
      selectedPropId: null,
      hoveredElement: null,
    });
  },
  setBrushRadius: (r) => set({ brushRadius: r }),
  setBrushStrength: (s) => set({ brushStrength: s }),
  setBrushSize: (size) => {
    const radiusMap: Record<BrushSizeType, number> = {
      fine: 0.25,
      medium: 0.75,
      large: 1.8,
    };
    set({ brushSize: size, brushRadius: radiusMap[size] });
  },
  setSteadyHand: (enabled) => set({ steadyHand: enabled }),
  setPaintColor: (color) => set({ paintColor: color }),
  setGrassDensity: (d) => set({ grassDensity: d }),
  setWaterMode: (mode) => set({ waterMode: mode }),
  setNightMode: (night) => set({ nightMode: night }),
  toggleNightMode: () => set((state) => ({ nightMode: !state.nightMode })),
  setMudLocked: (locked) => set({ mudLocked: locked }),

  startSpline: () => set({ isDrawingSpline: true, currentSplinePoints: [] }),
  addSplinePoint: (pt) =>
    set((state) => ({
      currentSplinePoints: [...state.currentSplinePoints, pt],
    })),
  finishSpline: (type, settings) => {
    const { currentSplinePoints, splines, splineConversionType, splineSettings } = get();
    if (currentSplinePoints.length >= 2) {
      pushUndoSnapshot();
      const id = `spline_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const resolvedType = type ?? splineConversionType;
      const resolvedSettings = settings
        ? { ...splineSettings, ...settings }
        : { ...splineSettings };
      const newSpline: SplinePath = {
        id,
        points: currentSplinePoints,
        type: resolvedType,
        settings: resolvedSettings,
      };
      set({
        splines: [...splines, newSpline],
        isDrawingSpline: false,
        currentSplinePoints: [],
        selectedSplineId: null,
      });
      return id;
    } else {
      set({ isDrawingSpline: false, currentSplinePoints: [] });
      return null;
    }
  },
  cancelSpline: () => set({ isDrawingSpline: false, currentSplinePoints: [] }),
  deleteSpline: (id) => {
    pushUndoSnapshot();
    set((state) => ({
      splines: state.splines.filter((s) => s.id !== id),
      selectedSplineId: state.selectedSplineId === id ? null : state.selectedSplineId,
    }));
  },
  clearAllSplines: () => {
    pushUndoSnapshot();
    set({
      splines: [],
      selectedSplineId: null,
      isDrawingSpline: false,
      currentSplinePoints: [],
    });
  },
  setSelectedSplineId: (id) => set({ selectedSplineId: id }),
  setSplineConversionType: (splineConversionType) => set({ splineConversionType }),
  setSplineSettings: (settings) =>
    set((state) => ({
      splineSettings: { ...state.splineSettings, ...settings },
    })),
  updateSplineType: (id, type) => {
    pushUndoSnapshot();
    set((state) => ({
      splines: state.splines.map((s) => (s.id === id ? { ...s, type } : s)),
    }));
  },
  updateSplineSettings: (id, settings) => {
    pushUndoSnapshot();
    set((state) => ({
      splines: state.splines.map((s) =>
        s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s
      ),
    }));
  },
  updateSplineName: (id, name) => {
    set((state) => ({
      splines: state.splines.map((s) => (s.id === id ? { ...s, name } : s)),
    }));
  },
  translateSpline: (id, dx, dyOrDz = 0, dz) => {
    pushUndoSnapshot();
    const dy = dz !== undefined ? dyOrDz : 0;
    const actualDz = dz !== undefined ? dz : dyOrDz;
    set((state) => ({
      splines: state.splines.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          points: s.points.map(([x, y, z]) => [x + dx, y + dy, z + actualDz] as [number, number, number]),
        };
      }),
    }));
  },
  rotateSpline: (id, angleDeg) => {
    pushUndoSnapshot();
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    set((state) => ({
      splines: state.splines.map((s) => {
        if (s.id !== id || s.points.length === 0) return s;
        let cx = 0, cz = 0;
        for (const [x, , z] of s.points) {
          cx += x;
          cz += z;
        }
        cx /= s.points.length;
        cz /= s.points.length;
        return {
          ...s,
          points: s.points.map(([x, y, z]) => {
            const rx = x - cx;
            const rz = z - cz;
            const nx = cx + rx * cos - rz * sin;
            const nz = cz + rx * sin + rz * cos;
            return [nx, y, nz] as [number, number, number];
          }),
        };
      }),
    }));
  },
  scaleSpline: (id, factor) => {
    pushUndoSnapshot();
    set((state) => ({
      splines: state.splines.map((s) => {
        if (s.id !== id || s.points.length === 0) return s;
        let cx = 0, cz = 0;
        for (const [x, , z] of s.points) {
          cx += x;
          cz += z;
        }
        cx /= s.points.length;
        cz /= s.points.length;
        return {
          ...s,
          points: s.points.map(([x, y, z]) => {
            const rx = x - cx;
            const rz = z - cz;
            return [cx + rx * factor, y, cz + rz * factor] as [number, number, number];
          }),
        };
      }),
    }));
  },
  scaleSplineItem: (id, factor) => {
    pushUndoSnapshot();
    set((state) => ({
      splines: state.splines.map((s) => {
        if (s.id !== id) return s;
        const current = s.settings || {};
        if (s.type === 'steps') {
          return {
            ...s,
            settings: {
              ...current,
              stepWidth: Math.max(0.02, Math.min(0.35, (current.stepWidth ?? 0.06) * factor)),
              stepRun: Math.max(0.01, Math.min(0.12, (current.stepRun ?? 0.025) * factor)),
              stepRise: Math.max(0.005, Math.min(0.05, (current.stepRise ?? 0.01) * factor)),
            },
          };
        } else {
          return {
            ...s,
            settings: {
              ...current,
              scale: Math.max(0.3, Math.min(3.0, (current.scale ?? 1.0) * factor)),
            },
          };
        }
      }),
    }));
  },

  addProp: (prop) => {
    const id = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newProp: PlacedProp = { ...prop, id };
    set((state) => ({
      placedProps: [...state.placedProps, newProp],
      selectedPropId: id,
    }));
    return id;
  },
  updatePropTransform: (id, transform) =>
    set((state) => ({
      placedProps: state.placedProps.map((p) =>
        p.id === id ? { ...p, ...transform } : p
      ),
    })),
  removeProp: (id) =>
    set((state) => ({
      placedProps: state.placedProps.filter((p) => p.id !== id),
      selectedPropId: state.selectedPropId === id ? null : state.selectedPropId,
    })),
  setSelectedPropType: (type) => set({ selectedPropType: type }),
  setSelectedPropId: (id) => set({ selectedPropId: id }),

  setFortTitle: (title) => set({ fortTitle: title }),
  setBuilderName: (name) => set({ builderName: name }),
  setTemplateId: (templateId) => {
    set({ templateId });
    try {
      // Lazy import/call terrain store to avoid circular dependency
      import('../terrain/terrainStore').then((m) => {
        m.useTerrainStore.getState().loadTemplate(templateId);
      });
    } catch (e) {
      console.warn('Failed to load terrain template:', e);
    }
  },

  setPropDrawerOpen: (open) => set({ isPropDrawerOpen: open }),
  setPosterModalOpen: (open) => set({ isPosterModalOpen: open }),
  setModeSelectModalOpen: (open) => set({ isModeSelectModalOpen: open }),
  setShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),
  setResetConfirmOpen: (open) => set({ isResetConfirmOpen: open }),
  setStartupModalOpen: (open) => set({ isStartupModalOpen: open }),
  setAboutModalOpen: (open) => set({ isAboutModalOpen: open }),
  setTerrainDrawerOpen: (open, tab) =>
    set((state) => ({
      isTerrainDrawerOpen: open,
      terrainDrawerTab: tab || state.terrainDrawerTab,
    })),
  setTerrainDrawerTab: (terrainDrawerTab) => set({ terrainDrawerTab }),
  setDontShowStartupModal: (dontShow) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STARTUP_PREF_KEY, dontShow ? 'true' : 'false');
      } catch (err) {
        console.error('Failed to set startup pref:', err);
      }
    }
    set({ dontShowStartupModal: dontShow });
  },

  resetScene: () => {
    try {
      import('../terrain/terrainStore').then((m) => {
        m.useTerrainStore.getState().resetTerrain();
      });
    } catch (e) {
      console.warn('Failed to reset terrain:', e);
    }
    set({
      splines: [],
      walls: [],
      activeWallDraft: [],
      selectedWallId: null,
      wallStep: 'layout',
      activeStamp: null,
      citadelKeeps: [],
      selectedComponent: null,
      placedProps: [],
      pondWaterFeatures: [],
      selectedPropId: null,
      selectedPropType: null,
      mudLocked: false,
      isResetConfirmOpen: false,
    });
  },
}));

if (typeof window !== 'undefined') {
  (window as any).__editorStore = useEditorStore;
}
