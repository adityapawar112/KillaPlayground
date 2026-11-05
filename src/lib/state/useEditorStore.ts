import { create } from 'zustand';
import { z } from 'zod';
import { COLORS } from '../constants/tokens';
import { useTerrainStore } from '../terrain/terrainStore';
import { getTerrainHeightAt } from '../terrain/terrainBuffer';
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
import { FoliageInstance, FoliageSubTool } from '../foliage/foliageTypes';
import { getFoliageById } from '../foliage/foliageManifest';
import { foliageTextureManager } from '../foliage/foliageTextureManager';
import { PropSubTool } from '../figurines/figurineTypes';
import { PlacedLight, LightingSubTool } from '../lighting/lightingTypes';
export type { SplineConversionType, SplineSettings, SplinePath, SplineMode, WallMode, FoliageInstance, FoliageSubTool, PropSubTool, PlacedLight, LightingSubTool };

export type BuildingMode = 'select' | 'walls' | 'foundation' | 'stairs' | 'fortifications';

export interface FoundationSlab {
  id: string;
  name?: string;
  x: number; // center x in meters
  z: number; // center z in meters
  y: number; // base terrain elevation in meters
  length: number; // dx in meters (default 2.0m)
  width: number;  // dz in meters (default 2.0m)
  height: number; // slab thickness: 0.10m to 3.00m (default 0.40m = 40cm)
  verticalOffset: number; // -0.50m to +2.00m (default 0.0m)
  tilingRepeat: number; // 1 to 10 (default 3)
  rotationY?: number;
  createdAt: number;
}

export interface StairPath {
  id: string;
  name?: string;
  points: [number, number, number][];
  settings?: SplineSettings;
  createdAt: number;
}

export interface HoveredElement {
  type: 'wall' | 'bastion' | 'tower' | 'box' | 'gate' | 'spline' | 'prop' | 'foundation' | 'stair' | 'light';
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
  foundations: z.array(z.any()).optional().default([]),
  stairs: z.array(z.any()).optional().default([]),
  citadelKeeps: z.array(z.any()).optional().default([]),
  placedProps: z.array(z.any()).default([]),
  placedLights: z.array(z.any()).optional().default([]),
  pondWaterFeatures: z.array(z.any()).optional().default([]),
  foliageInstances: z.array(z.any()).optional().default([]),
  timestamp: z.number().optional(),
});

export type ToolType =
  // 7 Primary Killa-First Tools
  | 'terrain'
  | 'building'
  | 'walls'
  | 'spline'
  | 'texture'
  | 'foliage'
  | 'prop'
  | 'lighting'
  | 'view'
  // Soil Pipeline Tools (Deferred Phase)
  | 'soil'
  | 'water'
  | 'shape'
  | 'shape_top'
  | 'shape_side'
  | 'dry'
  | 'paint'
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
    placedLights?: PlacedLight[];
    pondWaterFeatures?: PondWaterFeature[];
    foliageInstances?: FoliageInstance[];
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
  brushRadius: number; // 0.2 to 2.5
  brushStrength: number; // 0.1 to 1.0
  brushSize: BrushSizeType;
  steadyHand: boolean;
  paintColor: string;
  grassDensity: number;
  waterMode: 'reflective' | 'tarpaulin';
  nightMode: boolean;
  mudLocked: boolean;

  // Texture Painting Studio State (Ticket 06)
  selectedTextureId: string;
  setSelectedTextureId: (id: string) => void;
  paintSubTool: 'paint' | 'erase';
  setPaintSubTool: (st: 'paint' | 'erase') => void;
  paintBrushRadius: number;
  setPaintBrushRadius: (r: number) => void;
  paintBrushStrength: number;
  setPaintBrushStrength: (s: number) => void;
  paintBrushFalloff: number;
  setPaintBrushFalloff: (f: number) => void;
  paintTextureRepeat: number;
  setPaintTextureRepeat: (rep: number) => void;
  paintCategoryFilter: string;
  setPaintCategoryFilter: (cat: string) => void;
  paintSearchQuery: string;
  setPaintSearchQuery: (query: string) => void;

  // 3D Foliage & Nature Scatter State (Ticket 07)
  foliageSubTool: FoliageSubTool;
  setFoliageSubTool: (st: FoliageSubTool) => void;
  foliageSelectMode: 'single' | 'multi';
  setFoliageSelectMode: (mode: 'single' | 'multi') => void;
  selectedFoliageId: string;
  setSelectedFoliageId: (id: string) => void;
  selectedFoliageIds: string[];
  setSelectedFoliageIds: (ids: string[]) => void;
  toggleFoliageSelectedId: (id: string) => void;
  clearFoliageSelection: () => void;
  foliageBrushRadius: number;
  setFoliageBrushRadius: (r: number) => void;
  foliageBrushDensity: number;
  setFoliageBrushDensity: (d: number) => void;
  foliageScaleJitter: number;
  setFoliageScaleJitter: (j: number) => void;
  foliageNormalAlign: number;
  setFoliageNormalAlign: (a: number) => void;
  foliageCategoryFilter: string;
  setFoliageCategoryFilter: (cat: string) => void;
  foliageSearchQuery: string;
  setFoliageSearchQuery: (query: string) => void;
  foliageInstances: FoliageInstance[];
  addFoliageInstances: (instances: FoliageInstance[]) => void;
  removeFoliageInstances: (ids: string[]) => void;
  clearAllFoliage: () => void;
  setFoliageInstances: (instances: FoliageInstance[]) => void;

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
  buildingMode: BuildingMode;
  setBuildingMode: (mode: BuildingMode) => void;
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
  updateRoundBastionName: (wallId: string, bastionId: string, name: string) => void;
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
  addRoundBastionToWall: (wallId: string, segmentIndex: number, t?: number, props?: Partial<import('../walls/wallTypes').WallRoundBastion>) => string;
  updateRoundBastionProperties: (wallId: string, bastionId: string, props: Partial<import('../walls/wallTypes').WallRoundBastion>) => void;
  removeRoundBastionFromWall: (wallId: string, bastionId: string) => void;
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

  // Foundation Slabs State (Ticket 09)
  foundations: FoundationSlab[];
  selectedFoundationId: string | null;
  activeFoundationDraft: {
    x1: number;
    z1: number;
    x2: number;
    z2: number;
    y: number;
    height?: number;
    phase?: 'base' | 'height';
    startPointerY?: number;
  } | null;
  defaultFoundationHeight: number;
  defaultFoundationOffset: number;
  defaultFoundationTiling: number;
  addFoundation: (slab: Omit<FoundationSlab, 'id' | 'createdAt'>) => string;
  updateFoundation: (id: string, updates: Partial<FoundationSlab>) => void;
  deleteFoundation: (id: string) => void;
  setSelectedFoundationId: (id: string | null) => void;
  setActiveFoundationDraft: (draft: {
    x1: number;
    z1: number;
    x2: number;
    z2: number;
    y: number;
    height?: number;
    phase?: 'base' | 'height';
    startPointerY?: number;
  } | null) => void;
  setDefaultFoundationHeight: (height: number) => void;
  setDefaultFoundationOffset: (offset: number) => void;
  setDefaultFoundationTiling: (tiling: number) => void;
  setFoundations: (foundations: FoundationSlab[]) => void;

  // Stone Stairs State (Ticket 09)
  stairs: StairPath[];
  selectedStairId: string | null;
  activeStairDraft: [number, number, number][];
  isDrawingStairs: boolean;
  stairSettings: SplineSettings;
  startStairs: () => void;
  addStairPoint: (point: [number, number, number]) => void;
  finishStairs: (settings?: SplineSettings) => string | null;
  cancelStairs: () => void;
  deleteStair: (id: string) => void;
  setSelectedStairId: (id: string | null) => void;
  updateStairSettings: (id: string, settings: Partial<SplineSettings>) => void;
  updateStairName: (id: string, name: string) => void;
  setStairSettings: (settings: Partial<SplineSettings>) => void;
  setStairs: (stairs: StairPath[]) => void;

  // Spline Drawing State
  splineMode: SplineMode;
  setSplineMode: (mode: SplineMode) => void;
  isDrawingSpline: boolean;
  currentSplinePoints: [number, number, number][];
  splines: SplinePath[];
  selectedSplineId: string | null;
  splineConversionType: SplineConversionType;
  splineSettings: SplineSettings;

  // Props & Figurines State (Ticket 08)
  propSubTool: PropSubTool;
  setPropSubTool: (st: PropSubTool) => void;
  propCategoryFilter: string;
  setPropCategoryFilter: (cat: string) => void;
  propSearchQuery: string;
  setPropSearchQuery: (query: string) => void;
  propPlacementScale: number;
  setPropPlacementScale: (scale: number) => void;
  propPlacementRotation: number;
  setPropPlacementRotation: (rot: number) => void;
  propRandomRotation: boolean;
  setPropRandomRotation: (rand: boolean) => void;
  propNormalAlign: number;
  setPropNormalAlign: (align: number) => void;
  propElevationOffset: number;
  setPropElevationOffset: (offset: number) => void;
  propEraseRadius: number;
  setPropEraseRadius: (radius: number) => void;
  placedProps: PlacedProp[];
  selectedPropType: string | null;
  selectedPropId: string | null;

  // Festive Lighting & Fireworks Studio State (Ticket 10)
  lightingSubTool: LightingSubTool;
  setLightingSubTool: (st: LightingSubTool) => void;
  lightingCategoryFilter: string;
  setLightingCategoryFilter: (cat: string) => void;
  lightingSearchQuery: string;
  setLightingSearchQuery: (query: string) => void;
  lightPlacementScale: number;
  setLightPlacementScale: (scale: number) => void;
  lightPlacementRotation: number;
  setLightPlacementRotation: (rot: number) => void;
  lightRandomRotation: boolean;
  setLightRandomRotation: (rand: boolean) => void;
  lightNormalAlign: number;
  setLightNormalAlign: (align: number) => void;
  lightElevationOffset: number;
  setLightElevationOffset: (offset: number) => void;
  lightBurstHeight: number;
  setLightBurstHeight: (height: number) => void;
  lightEraseRadius: number;
  setLightEraseRadius: (radius: number) => void;
  placedLights: PlacedLight[];
  selectedLightType: string | null;
  selectedLightId: string | null;

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
  collapseAllPanels: () => void;
  expandAllPanels: () => void;

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
  setSplines: (splines: SplinePath[]) => void;
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
  removeProps: (ids: string[]) => void;
  setSelectedPropType: (type: string | null) => void;
  setSelectedPropId: (id: string | null) => void;
  duplicateProp: (id: string) => string | null;
  snapPropToSurface: (id: string) => void;
  clearAllProps: () => void;
  setPlacedProps: (props: PlacedProp[]) => void;

  // Festive Lighting Actions (Ticket 10)
  addLight: (light: Omit<PlacedLight, 'id' | 'createdAt'>) => string;
  updateLightTransform: (
    id: string,
    transform: Partial<Pick<PlacedLight, 'position' | 'rotation' | 'scale' | 'colorTheme' | 'burstHeight'>>
  ) => void;
  removeLight: (id: string) => void;
  removeLights: (ids: string[]) => void;
  setSelectedLightType: (type: string | null) => void;
  setSelectedLightId: (id: string | null) => void;
  duplicateLight: (id: string) => string | null;
  snapLightToSurface: (id: string) => void;
  clearAllLights: () => void;
  setPlacedLights: (lights: PlacedLight[]) => void;
  testFireworkTrigger: { id: string; timestamp: number } | null;
  triggerTestFirework: (id: string) => void;
  clearTestFireworkTrigger: () => void;

  // Time-of-Day & Celestial Lighting State (Ticket 10 Skeleton / Ticket 11 Full)
  timeOfDay: number; // 0.0 to 24.0 (hours), default 14.0 (2:00 PM)
  sunElevation: number; // -15 to 90 degrees (altitude above horizon / X-axis rotation), default 48
  sunAzimuth: number; // 0 to 360 degrees (compass bearing), default 55
  setTimeOfDay: (hours: number) => void;
  setSunElevation: (deg: number) => void;
  setSunAzimuth: (deg: number) => void;
  setSunDirectionPreset: (preset: 'dawn' | 'noon' | 'sunset' | 'night') => void;

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
  brushRadius: 0.8,
  brushStrength: 0.5,
  brushSize: 'medium',
  steadyHand: true,
  paintColor: COLORS.basalt,
  grassDensity: 0.6,
  waterMode: 'tarpaulin',
  nightMode: false,
  mudLocked: false,

  // Texture Painting Studio Defaults (Ticket 06)
  selectedTextureId: 'dirt_03', // Default: Tambdi Maati
  setSelectedTextureId: (selectedTextureId) => set({ selectedTextureId }),
  paintSubTool: 'paint',
  setPaintSubTool: (paintSubTool) => set({ paintSubTool }),
  paintBrushRadius: 1.0,
  setPaintBrushRadius: (paintBrushRadius) => set({ paintBrushRadius }),
  paintBrushStrength: 0.6,
  setPaintBrushStrength: (paintBrushStrength) => set({ paintBrushStrength }),
  paintBrushFalloff: 0.5,
  setPaintBrushFalloff: (paintBrushFalloff) => set({ paintBrushFalloff }),
  paintTextureRepeat: 16.0,
  setPaintTextureRepeat: (paintTextureRepeat) => set({ paintTextureRepeat }),
  paintCategoryFilter: 'all',
  setPaintCategoryFilter: (paintCategoryFilter) => set({ paintCategoryFilter }),
  paintSearchQuery: '',
  setPaintSearchQuery: (paintSearchQuery) => set({ paintSearchQuery }),

  // 3D Foliage & Nature Scatter Defaults (Ticket 07)
  foliageSubTool: 'scatter',
  setFoliageSubTool: (foliageSubTool) => set({ foliageSubTool }),
  foliageSelectMode: 'single',
  setFoliageSelectMode: (foliageSelectMode) => set({ foliageSelectMode }),
  selectedFoliageId: 'banyan_broad_canopy',
  setSelectedFoliageId: (selectedFoliageId) => {
    const item = getFoliageById(selectedFoliageId);
    if (item) {
      foliageTextureManager.preload(item.spritePath);
    }
    set({
      selectedFoliageId,
      selectedFoliageIds: [selectedFoliageId],
    });
  },
  selectedFoliageIds: ['banyan_broad_canopy'],
  setSelectedFoliageIds: (selectedFoliageIds) => {
    selectedFoliageIds.forEach((id) => {
      const it = getFoliageById(id);
      if (it) foliageTextureManager.preload(it.spritePath);
    });
    set({
      selectedFoliageIds,
      selectedFoliageId: selectedFoliageIds[0] || get().selectedFoliageId,
    });
  },
  toggleFoliageSelectedId: (id) => {
    const { selectedFoliageIds } = get();
    const item = getFoliageById(id);
    if (item) foliageTextureManager.preload(item.spritePath);

    if (selectedFoliageIds.includes(id)) {
      const next = selectedFoliageIds.filter((item) => item !== id);
      set({
        selectedFoliageIds: next,
        selectedFoliageId: next[0] || '',
      });
    } else {
      const next = [...selectedFoliageIds, id];
      set({
        selectedFoliageIds: next,
        selectedFoliageId: id,
      });
    }
  },
  clearFoliageSelection: () => set({ selectedFoliageIds: [] }),
  foliageBrushRadius: 0.6,
  setFoliageBrushRadius: (foliageBrushRadius) => set({ foliageBrushRadius }),
  foliageBrushDensity: 6,
  setFoliageBrushDensity: (foliageBrushDensity) => set({ foliageBrushDensity }),
  foliageScaleJitter: 0.25,
  setFoliageScaleJitter: (foliageScaleJitter) => set({ foliageScaleJitter }),
  foliageNormalAlign: 0.15,
  setFoliageNormalAlign: (foliageNormalAlign) => set({ foliageNormalAlign }),
  foliageCategoryFilter: 'all',
  setFoliageCategoryFilter: (foliageCategoryFilter) => set({ foliageCategoryFilter }),
  foliageSearchQuery: '',
  setFoliageSearchQuery: (foliageSearchQuery) => set({ foliageSearchQuery }),
  foliageInstances: [],
  addFoliageInstances: (instances) => {
    if (instances.length === 0) return;
    set((state) => ({
      foliageInstances: [...state.foliageInstances, ...instances],
    }));
  },
  removeFoliageInstances: (ids) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    set((state) => ({
      foliageInstances: state.foliageInstances.filter((inst) => !idSet.has(inst.id)),
    }));
  },
  clearAllFoliage: () => set({ foliageInstances: [] }),
  setFoliageInstances: (foliageInstances) => set({ foliageInstances }),

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
      buildingMode: wallMode === 'draw' ? 'walls' : wallMode === 'fortify' ? 'fortifications' : 'select',
      selectedWallId: wallMode === 'draw' ? null : state.selectedWallId,
      selectedComponent: wallMode === 'draw' ? null : state.selectedComponent,
      activeWallDraft: [],
      activeStamp: wallMode === 'fortify' ? (state.activeStamp || 'tower') : null,
      wallSnapPreview: null,
      hoveredElement: null,
    })),
  buildingMode: 'walls',
  setBuildingMode: (buildingMode) =>
    set((state) => ({
      buildingMode,
      wallMode: buildingMode === 'walls' ? 'draw' : buildingMode === 'fortifications' ? 'fortify' : 'select',
      selectedWallId: buildingMode === 'walls' || buildingMode === 'foundation' || buildingMode === 'stairs' ? null : state.selectedWallId,
      selectedComponent: buildingMode === 'walls' || buildingMode === 'foundation' || buildingMode === 'stairs' ? null : state.selectedComponent,
      selectedFoundationId: buildingMode === 'walls' || buildingMode === 'fortifications' || buildingMode === 'stairs' ? null : state.selectedFoundationId,
      selectedStairId: buildingMode === 'walls' || buildingMode === 'fortifications' || buildingMode === 'foundation' ? null : state.selectedStairId,
      activeWallDraft: buildingMode !== 'walls' ? [] : state.activeWallDraft,
      activeFoundationDraft: null,
      activeStairDraft: buildingMode !== 'stairs' ? [] : state.activeStairDraft,
      isDrawingStairs: false,
      activeStamp: buildingMode === 'fortifications' ? (state.activeStamp || 'tower') : null,
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
        selectedFoundationId: null,
        selectedStairId: null,
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
  setSelectedComponent: (selectedComponent) =>
    set({
      selectedComponent,
      ...(selectedComponent ? { selectedFoundationId: null, selectedStairId: null } : {}),
    }),
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
  addRoundBastionToWall: (wallId, segmentIndex, t = 0.5, props = {}) => {
    pushUndoSnapshot();
    const bastionId = `round_bastion_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newBastion: import('../walls/wallTypes').WallRoundBastion = {
      id: bastionId,
      name: props.name || 'Round Bastion',
      segmentIndex,
      t,
      radius: props.radius || 0.18,
      heightOffset: props.heightOffset || 0.04,
      flipSide: props.flipSide || false,
    };
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return { ...w, roundBastions: [...(w.roundBastions || []), newBastion] };
      }),
      selectedWallId: wallId,
      selectedComponent: { type: 'round_bastion', idOrIndex: bastionId, wallId },
      selectedFoundationId: null,
      selectedStairId: null,
    }));
    return bastionId;
  },
  updateRoundBastionProperties: (wallId, bastionId, props) => {
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return {
          ...w,
          roundBastions: (w.roundBastions || []).map((b) => (b.id === bastionId ? { ...b, ...props } : b)),
        };
      }),
    }));
  },
  removeRoundBastionFromWall: (wallId, bastionId) => {
    pushUndoSnapshot();
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return { ...w, roundBastions: (w.roundBastions || []).filter((b) => b.id !== bastionId) };
      }),
      selectedComponent:
        state.selectedComponent?.type === 'round_bastion' && state.selectedComponent.idOrIndex === bastionId
          ? null
          : state.selectedComponent,
    }));
  },
  updateRoundBastionName: (wallId, bastionId, name) => {
    set((state) => ({
      walls: state.walls.map((w) => {
        if (w.id !== wallId) return w;
        return {
          ...w,
          roundBastions: (w.roundBastions || []).map((b) => (b.id === bastionId ? { ...b, name } : b)),
        };
      }),
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

  // Foundation Slabs Implementation (Ticket 09)
  foundations: [],
  selectedFoundationId: null,
  activeFoundationDraft: null,
  defaultFoundationHeight: 0.40,
  defaultFoundationOffset: 0.0,
  defaultFoundationTiling: 3.0,

  addFoundation: (slab) => {
    pushUndoSnapshot();
    const id = `foundation_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newSlab: FoundationSlab = {
      ...slab,
      id,
      name: slab.name || 'Stone Foundation',
      createdAt: Date.now(),
    };
    set((state) => ({
      foundations: [...state.foundations, newSlab],
      selectedFoundationId: id,
    }));
    return id;
  },
  updateFoundation: (id, updates) => {
    pushUndoSnapshot();
    set((state) => ({
      foundations: state.foundations.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  },
  deleteFoundation: (id) => {
    pushUndoSnapshot();
    set((state) => ({
      foundations: state.foundations.filter((f) => f.id !== id),
      selectedFoundationId: state.selectedFoundationId === id ? null : state.selectedFoundationId,
      hoveredElement: state.hoveredElement?.id === id ? null : state.hoveredElement,
    }));
  },
  setSelectedFoundationId: (id) =>
    set({
      selectedFoundationId: id,
      ...(id ? { selectedWallId: null, selectedComponent: null, selectedStairId: null } : {}),
    }),
  setActiveFoundationDraft: (draft) => set({ activeFoundationDraft: draft }),
  setDefaultFoundationHeight: (defaultFoundationHeight) => set({ defaultFoundationHeight }),
  setDefaultFoundationOffset: (defaultFoundationOffset) => set({ defaultFoundationOffset }),
  setDefaultFoundationTiling: (defaultFoundationTiling) => set({ defaultFoundationTiling }),
  setFoundations: (foundations) => set({ foundations, selectedFoundationId: null }),

  // Stone Stairs Implementation (Ticket 09)
  stairs: [],
  selectedStairId: null,
  activeStairDraft: [],
  isDrawingStairs: false,
  stairSettings: {
    stepWidth: 0.12,
    stepRun: 0.035,
    stepRise: 0.015,
    stepOffset: 0.0,
    stepSpacing: 0.03,
    scale: 2.0,
  },
  startStairs: () =>
    set({
      isDrawingStairs: true,
      activeStairDraft: [],
      isDrawingSpline: true,
      currentSplinePoints: [],
    }),
  addStairPoint: (pt) =>
    set((state) => ({
      activeStairDraft: [...state.activeStairDraft, pt],
      currentSplinePoints: [...state.currentSplinePoints, pt],
    })),
  finishStairs: (settings) => {
    const { activeStairDraft, stairs, stairSettings, splines } = get();
    if (activeStairDraft.length >= 2) {
      pushUndoSnapshot();
      const id = `stairs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const resolvedSettings = settings ? { ...stairSettings, ...settings } : { ...stairSettings };
      const newStair: StairPath = {
        id,
        name: `Stone Steps ${stairs.length + 1}`,
        points: activeStairDraft,
        settings: resolvedSettings,
        createdAt: Date.now(),
      };
      const mirroredSpline: SplinePath = {
        id,
        name: newStair.name,
        points: activeStairDraft,
        type: 'steps',
        settings: resolvedSettings,
      };
      set({
        stairs: [...stairs, newStair],
        splines: [...splines, mirroredSpline],
        isDrawingStairs: false,
        activeStairDraft: [],
        isDrawingSpline: false,
        currentSplinePoints: [],
        selectedStairId: null,
      });
      return id;
    } else {
      set({
        isDrawingStairs: false,
        activeStairDraft: [],
        isDrawingSpline: false,
        currentSplinePoints: [],
      });
      return null;
    }
  },
  cancelStairs: () =>
    set({
      isDrawingStairs: false,
      activeStairDraft: [],
      isDrawingSpline: false,
      currentSplinePoints: [],
    }),
  deleteStair: (id) => {
    pushUndoSnapshot();
    set((state) => ({
      stairs: state.stairs.filter((s) => s.id !== id),
      splines: state.splines.filter((s) => s.id !== id),
      selectedStairId: state.selectedStairId === id ? null : state.selectedStairId,
      hoveredElement: state.hoveredElement?.id === id ? null : state.hoveredElement,
    }));
  },
  setSelectedStairId: (id) =>
    set({
      selectedStairId: id,
      ...(id ? { selectedWallId: null, selectedComponent: null, selectedFoundationId: null } : {}),
    }),
  updateStairSettings: (id, settings) => {
    pushUndoSnapshot();
    set((state) => ({
      stairs: state.stairs.map((s) =>
        s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s
      ),
      splines: state.splines.map((s) =>
        s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s
      ),
    }));
  },
  updateStairName: (id, name) => {
    set((state) => ({
      stairs: state.stairs.map((s) => (s.id === id ? { ...s, name } : s)),
      splines: state.splines.map((s) => (s.id === id ? { ...s, name } : s)),
    }));
  },
  setStairSettings: (settings) =>
    set((state) => ({
      stairSettings: { ...state.stairSettings, ...settings },
      splineSettings: { ...state.splineSettings, ...settings },
    })),
  setStairs: (stairs) => set({ stairs, selectedStairId: null }),

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

  propSubTool: 'place',
  propCategoryFilter: 'all',
  propSearchQuery: '',
  propPlacementScale: 1.0,
  propPlacementRotation: 0,
  propRandomRotation: false,
  propNormalAlign: 0.0,
  propElevationOffset: 0.0,
  propEraseRadius: 0.8,
  placedProps: [],
  selectedPropType: 'warrior',
  selectedPropId: null,

  // Festive Lighting & Fireworks Initial State (Ticket 10)
  lightingSubTool: 'place',
  setLightingSubTool: (st) => set({ lightingSubTool: st }),
  lightingCategoryFilter: 'all',
  setLightingCategoryFilter: (cat) => set({ lightingCategoryFilter: cat }),
  lightingSearchQuery: '',
  setLightingSearchQuery: (query) => set({ lightingSearchQuery: query }),
  lightPlacementScale: 1.0,
  setLightPlacementScale: (scale) => set({ lightPlacementScale: scale }),
  lightPlacementRotation: 0,
  setLightPlacementRotation: (rot) => set({ lightPlacementRotation: rot }),
  lightRandomRotation: false,
  setLightRandomRotation: (rand) => set({ lightRandomRotation: rand }),
  lightNormalAlign: 0.0,
  setLightNormalAlign: (align) => set({ lightNormalAlign: align }),
  lightElevationOffset: 0.0,
  setLightElevationOffset: (offset) => set({ lightElevationOffset: offset }),
  lightBurstHeight: 1.0,
  setLightBurstHeight: (height) => set({ lightBurstHeight: height }),
  lightEraseRadius: 0.8,
  setLightEraseRadius: (radius) => set({ lightEraseRadius: radius }),
  placedLights: [],
  selectedLightType: 'diya_clay_01',
  selectedLightId: null,
  testFireworkTrigger: null,

  // Time-of-Day & Celestial Lighting State
  timeOfDay: 14.0,
  sunElevation: 48,
  sunAzimuth: 55,

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
  collapseAllPanels: () =>
    set({
      isMobileSidebarMinimized: true,
      isToolModeMinimized: true,
      isRightSidebarMinimized: true,
      isMobileTopBarMinimized: true,
      showBottomStatusBar: false,
    }),
  expandAllPanels: () =>
    set({
      showLeftToolbar: true,
      isMobileSidebarMinimized: false,
      isToolModeMinimized: false,
      isRightSidebarMinimized: false,
      isMobileTopBarMinimized: false,
      showContextualDock: true,
      showBottomStatusBar: true,
    }),

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
    const { splines, walls, placedProps, placedLights, pondWaterFeatures, foliageInstances, fortTitle, builderName, templateId, paintColor, waterMode, savedProjects } = get();
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
        placedLights: placedLights || [],
        pondWaterFeatures,
        foliageInstances: foliageInstances || [],
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

    // Migrate any legacy diya props from placedProps to placedLights if needed
    const rawProps = proj.data.placedProps || [];
    const rawLights: PlacedLight[] = proj.data.placedLights || [];
    const migratedLights: PlacedLight[] = [...rawLights];
    const remainingProps: PlacedProp[] = [];

    for (const p of rawProps) {
      if (p.type && p.type.startsWith('diya_')) {
        migratedLights.push({
          id: p.id,
          type: p.type,
          category: p.type.startsWith('diya_color') ? 'diyas_color' : 'diyas_clay',
          position: p.position,
          rotation: p.rotation,
          scale: p.scale,
          createdAt: Date.now(),
        });
      } else {
        remainingProps.push(p);
      }
    }

    set({
      splines: proj.data.splines || [],
      walls: proj.data.walls || [],
      placedProps: remainingProps,
      placedLights: migratedLights,
      pondWaterFeatures: proj.data.pondWaterFeatures || [],
      foliageInstances: proj.data.foliageInstances || [],
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
    const { splines, walls, foundations, stairs, placedProps, placedLights, pondWaterFeatures, foliageInstances, fortTitle, builderName, templateId, paintColor, waterMode } = get();
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
      foundations: foundations || [],
      stairs: stairs || [],
      placedProps,
      placedLights: placedLights || [],
      pondWaterFeatures,
      foliageInstances: foliageInstances || [],
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

      const importedStairs: StairPath[] =
        (data as any).stairs && (data as any).stairs.length > 0
          ? (data as any).stairs
          : (data.splines || [])
              .filter((s: any) => s.type === 'steps')
              .map((s: any) => ({
                id: s.id,
                name: s.name,
                points: s.points,
                settings: s.settings,
                createdAt: s.createdAt || Date.now(),
              }));

      // Migrate legacy diya props from data.placedProps if present
      const rawProps = data.placedProps || [];
      const rawLights: PlacedLight[] = (data as any).placedLights || [];
      const migratedLights: PlacedLight[] = [...rawLights];
      const remainingProps: PlacedProp[] = [];

      for (const p of rawProps) {
        if (p.type && p.type.startsWith('diya_')) {
          migratedLights.push({
            id: p.id,
            type: p.type,
            category: p.type.startsWith('diya_color') ? 'diyas_color' : 'diyas_clay',
            position: p.position,
            rotation: p.rotation,
            scale: p.scale,
            createdAt: Date.now(),
          });
        } else {
          remainingProps.push(p);
        }
      }

      set({
        fortTitle: data.fortTitle,
        builderName: data.builderName,
        templateId: data.templateId,
        paintColor: data.paintColor,
        waterMode: data.waterMode as any,
        splines: data.splines,
        walls: (data as any).walls || [],
        foundations: (data as any).foundations || [],
        stairs: importedStairs,
        placedProps: remainingProps,
        placedLights: migratedLights,
        pondWaterFeatures: data.pondWaterFeatures || [],
        foliageInstances: (data as any).foliageInstances || [],
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
      selectedFoundationId: null,
      activeFoundationDraft: null,
      selectedStairId: null,
      activeStairDraft: [],
      isDrawingStairs: false,
      selectedPropId: null,
      selectedLightId: null,
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
  setNightMode: (night) =>
    set({
      nightMode: night,
      timeOfDay: night ? 21.0 : 12.0,
      sunElevation: night ? 52 : 75,
      sunAzimuth: night ? 230 : 180,
    }),
  toggleNightMode: () =>
    set((state) => {
      const nextNight = !state.nightMode;
      return {
        nightMode: nextNight,
        timeOfDay: nextNight ? 21.0 : 12.0,
        sunElevation: nextNight ? 52 : 75,
        sunAzimuth: nextNight ? 230 : 180,
      };
    }),
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
      const extraStairs =
        resolvedType === 'steps'
          ? [
              ...get().stairs,
              {
                id,
                name: `Stone Steps ${get().stairs.length + 1}`,
                points: currentSplinePoints,
                settings: resolvedSettings,
                createdAt: Date.now(),
              },
            ]
          : get().stairs;
      set({
        splines: [...splines, newSpline],
        stairs: extraStairs,
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
  setSplines: (splines) => set({ splines, selectedSplineId: null }),
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

  setPropSubTool: (st) => set({ propSubTool: st }),
  setPropCategoryFilter: (cat) => set({ propCategoryFilter: cat }),
  setPropSearchQuery: (query) => set({ propSearchQuery: query }),
  setPropPlacementScale: (scale) => set({ propPlacementScale: Math.max(0.2, Math.min(3.0, scale)) }),
  setPropPlacementRotation: (rot) => set({ propPlacementRotation: (rot + 360) % 360 }),
  setPropRandomRotation: (rand) => set({ propRandomRotation: rand }),
  setPropNormalAlign: (align) => set({ propNormalAlign: Math.max(0, Math.min(1, align)) }),
  setPropElevationOffset: (offset) => set({ propElevationOffset: Math.max(-0.5, Math.min(1.0, offset)) }),
  setPropEraseRadius: (radius) => set({ propEraseRadius: Math.max(0.2, Math.min(3.0, radius)) }),

  addProp: (prop) => {
    pushUndoSnapshot();
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
  removeProp: (id) => {
    pushUndoSnapshot();
    set((state) => ({
      placedProps: state.placedProps.filter((p) => p.id !== id),
      selectedPropId: state.selectedPropId === id ? null : state.selectedPropId,
    }));
  },
  removeProps: (ids) => {
    if (ids.length === 0) return;
    pushUndoSnapshot();
    const idSet = new Set(ids);
    set((state) => ({
      placedProps: state.placedProps.filter((p) => !idSet.has(p.id)),
      selectedPropId: state.selectedPropId && idSet.has(state.selectedPropId) ? null : state.selectedPropId,
    }));
  },
  setSelectedPropType: (type) => set({ selectedPropType: type }),
  setSelectedPropId: (id) => set({ selectedPropId: id }),
  duplicateProp: (id) => {
    const { placedProps } = get();
    const source = placedProps.find((p) => p.id === id);
    if (!source) return null;
    pushUndoSnapshot();
    const newId = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const dup: PlacedProp = {
      ...source,
      id: newId,
      position: [source.position[0] + 0.25, source.position[1], source.position[2] + 0.25],
    };
    set((state) => ({
      placedProps: [...state.placedProps, dup],
      selectedPropId: newId,
    }));
    return newId;
  },
  snapPropToSurface: (id) => {
    const { placedProps } = get();
    const prop = placedProps.find((p) => p.id === id);
    if (!prop) return;
    try {
      const terrainStore = useTerrainStore.getState();
      const groundY = getTerrainHeightAt(prop.position[0], prop.position[2], terrainStore.stateBuffer);
      pushUndoSnapshot();
      set((state) => ({
        placedProps: state.placedProps.map((p) =>
          p.id === id ? { ...p, position: [p.position[0], groundY, p.position[2]] } : p
        ),
      }));
    } catch {
      // ignore
    }
  },
  clearAllProps: () => {
    if (get().placedProps.length > 0) {
      pushUndoSnapshot();
      set({ placedProps: [], selectedPropId: null });
    }
  },
  setPlacedProps: (props) => set({ placedProps: props }),

  // Festive Lighting Actions (Ticket 10)
  addLight: (light) => {
    pushUndoSnapshot();
    const id = `light_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newLight: PlacedLight = {
      ...light,
      burstHeight: light.burstHeight ?? get().lightBurstHeight,
      id,
      createdAt: Date.now(),
    };
    set((state) => ({
      placedLights: [...state.placedLights, newLight],
      selectedLightId: id,
    }));
    return id;
  },
  updateLightTransform: (id, transform) =>
    set((state) => ({
      placedLights: state.placedLights.map((l) =>
        l.id === id ? { ...l, ...transform } : l
      ),
    })),
  removeLight: (id) => {
    pushUndoSnapshot();
    set((state) => ({
      placedLights: state.placedLights.filter((l) => l.id !== id),
      selectedLightId: state.selectedLightId === id ? null : state.selectedLightId,
    }));
  },
  removeLights: (ids) => {
    if (ids.length === 0) return;
    pushUndoSnapshot();
    const idSet = new Set(ids);
    set((state) => ({
      placedLights: state.placedLights.filter((l) => !idSet.has(l.id)),
      selectedLightId: state.selectedLightId && idSet.has(state.selectedLightId) ? null : state.selectedLightId,
    }));
  },
  setSelectedLightType: (type) => set({ selectedLightType: type }),
  setSelectedLightId: (id) => set({ selectedLightId: id }),
  duplicateLight: (id) => {
    const { placedLights } = get();
    const source = placedLights.find((l) => l.id === id);
    if (!source) return null;
    pushUndoSnapshot();
    const newId = `light_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const dup: PlacedLight = {
      ...source,
      id: newId,
      position: [source.position[0] + 0.2, source.position[1], source.position[2] + 0.2],
      createdAt: Date.now(),
    };
    set((state) => ({
      placedLights: [...state.placedLights, dup],
      selectedLightId: newId,
    }));
    return newId;
  },
  snapLightToSurface: (id) => {
    const { placedLights } = get();
    const light = placedLights.find((l) => l.id === id);
    if (!light) return;
    try {
      const terrainStore = useTerrainStore.getState();
      const groundY = getTerrainHeightAt(light.position[0], light.position[2], terrainStore.stateBuffer);
      pushUndoSnapshot();
      set((state) => ({
        placedLights: state.placedLights.map((l) =>
          l.id === id ? { ...l, position: [l.position[0], groundY, l.position[2]] } : l
        ),
      }));
    } catch {
      // ignore
    }
  },
  clearAllLights: () => {
    if (get().placedLights.length > 0) {
      pushUndoSnapshot();
      set({ placedLights: [], selectedLightId: null });
    }
  },
  setPlacedLights: (lights) => set({ placedLights: lights }),
  triggerTestFirework: (id) => set({ testFireworkTrigger: { id, timestamp: Date.now() } }),
  clearTestFireworkTrigger: () => set({ testFireworkTrigger: null }),

  setTimeOfDay: (hours) => {
    const clamped = Math.max(0, Math.min(24, hours));
    const isNight = clamped >= 18.5 || clamped < 5.5;

    let elev = 48;
    let azim = 55;
    if (clamped >= 5.5 && clamped < 18.5) {
      // Day arc (5.5h to 18.5h = 13 hour span)
      const dayProgress = (clamped - 5.5) / 13.0; // 0 (dawn) to 1 (sunset)
      elev = Math.sin(dayProgress * Math.PI) * 72; // peaks at 72° at solar noon
      azim = 90 + dayProgress * 180; // 90° (East) to 270° (West)
    } else {
      // Night arc
      const nightProgress = clamped >= 18.5 ? (clamped - 18.5) / 11.0 : (clamped + 5.5) / 11.0;
      elev = Math.max(10, Math.sin(nightProgress * Math.PI) * 55);
      azim = 230 + (nightProgress - 0.5) * 60;
    }

    set({
      timeOfDay: clamped,
      sunElevation: Math.round(elev),
      sunAzimuth: Math.round(azim),
      nightMode: isNight,
    });
  },

  setSunElevation: (deg) => set({ sunElevation: Math.max(-15, Math.min(90, deg)) }),
  setSunAzimuth: (deg) => set({ sunAzimuth: ((deg % 360) + 360) % 360 }),

  setSunDirectionPreset: (preset) => {
    switch (preset) {
      case 'dawn':
        set({ timeOfDay: 6.0, sunElevation: 12, sunAzimuth: 90, nightMode: false });
        break;
      case 'noon':
        set({ timeOfDay: 12.0, sunElevation: 75, sunAzimuth: 180, nightMode: false });
        break;
      case 'sunset':
        set({ timeOfDay: 17.5, sunElevation: 10, sunAzimuth: 270, nightMode: false });
        break;
      case 'night':
        set({ timeOfDay: 21.0, sunElevation: 52, sunAzimuth: 230, nightMode: true });
        break;
    }
  },

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
      foundations: [],
      selectedFoundationId: null,
      activeFoundationDraft: null,
      stairs: [],
      selectedStairId: null,
      activeStairDraft: [],
      isDrawingStairs: false,
      activeWallDraft: [],
      selectedWallId: null,
      wallStep: 'layout',
      activeStamp: null,
      citadelKeeps: [],
      selectedComponent: null,
      placedProps: [],
      placedLights: [],
      pondWaterFeatures: [],
      foliageInstances: [],
      selectedPropId: null,
      selectedPropType: null,
      selectedLightId: null,
      selectedLightType: 'diya_clay_01',
      mudLocked: false,
      isResetConfirmOpen: false,
    });
  },
}));

if (typeof window !== 'undefined') {
  (window as any).__editorStore = useEditorStore;
  const defaultFoliage = getFoliageById('banyan_broad_canopy');
  if (defaultFoliage) foliageTextureManager.preload(defaultFoliage.spritePath);
}
