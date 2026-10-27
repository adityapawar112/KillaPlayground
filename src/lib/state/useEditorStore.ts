import { create } from 'zustand';
import { COLORS } from '../constants/tokens';

export type ToolType =
  | 'soil'
  | 'water'
  | 'shape_top'
  | 'shape_side'
  | 'spline'
  | 'paint'
  | 'grass'
  | 'prop';

export type SplineConversionType = 'walkway' | 'steps' | 'wall' | 'crenellated';

export type BrushSizeType = 'large' | 'medium' | 'fine';

export interface PlacedProp {
  id: string;
  type: string; // 'sinhasan' | 'mavala_spear' | 'mavala_sword' | 'tutari' | 'cannon' | 'flag' | 'boat' | 'diya' | 'temple'
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SplinePath {
  id: string;
  points: [number, number, number][];
  type: SplineConversionType;
}

interface EditorState {
  // Active Tool & Brush State
  activeTool: ToolType;
  brushRadius: number; // 0.2 to 2.5
  brushStrength: number; // 0.1 to 1.0
  brushSize: BrushSizeType;
  steadyHand: boolean;
  paintColor: string;
  grassDensity: number;
  waterMode: 'reflective' | 'tarpaulin';
  nightMode: boolean;
  mudLocked: boolean;

  // Spline Drawing State
  isDrawingSpline: boolean;
  currentSplinePoints: [number, number, number][];
  splines: SplinePath[];

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

  // Modals & Drawers Visibility
  isPropDrawerOpen: boolean;
  isPosterModalOpen: boolean;
  isModeSelectModalOpen: boolean;
  isShortcutsModalOpen: boolean;
  isResetConfirmOpen: boolean;

  // Camera & Navigation
  cameraResetTrigger: number;
  triggerCameraReset: () => void;

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
  finishSpline: (type: SplineConversionType) => void;
  cancelSpline: () => void;
  deleteSpline: (id: string) => void;

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

  // Reset
  resetScene: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  locale: 'en',
  setLocale: (locale) => set({ locale }),

  activeTool: 'soil',
  brushRadius: 0.8,
  brushStrength: 0.5,
  brushSize: 'medium',
  steadyHand: true,
  paintColor: COLORS.basalt,
  grassDensity: 0.6,
  waterMode: 'tarpaulin',
  nightMode: false,
  mudLocked: false,

  isDrawingSpline: false,
  currentSplinePoints: [],
  splines: [],

  placedProps: [],
  selectedPropType: null,
  selectedPropId: null,

  fortTitle: 'Our Killa',
  builderName: 'Mavala Builder',
  templateId: 'raigad',

  isPropDrawerOpen: false,
  isPosterModalOpen: false,
  isModeSelectModalOpen: false,
  isShortcutsModalOpen: false,
  isResetConfirmOpen: false,

  cameraResetTrigger: 0,
  triggerCameraReset: () => set((state) => ({ cameraResetTrigger: state.cameraResetTrigger + 1 })),

  setActiveTool: (tool) => {
    set({
      activeTool: tool,
      isPropDrawerOpen: tool === 'prop',
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
  finishSpline: (type) => {
    const { currentSplinePoints, splines } = get();
    if (currentSplinePoints.length >= 2) {
      const newSpline: SplinePath = {
        id: `spline_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        points: currentSplinePoints,
        type,
      };
      set({
        splines: [...splines, newSpline],
        isDrawingSpline: false,
        currentSplinePoints: [],
      });
    } else {
      set({ isDrawingSpline: false, currentSplinePoints: [] });
    }
  },
  cancelSpline: () => set({ isDrawingSpline: false, currentSplinePoints: [] }),
  deleteSpline: (id) =>
    set((state) => ({
      splines: state.splines.filter((s) => s.id !== id),
    })),

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
  setTemplateId: (templateId) => set({ templateId }),

  setPropDrawerOpen: (open) => set({ isPropDrawerOpen: open }),
  setPosterModalOpen: (open) => set({ isPosterModalOpen: open }),
  setModeSelectModalOpen: (open) => set({ isModeSelectModalOpen: open }),
  setShortcutsModalOpen: (open) => set({ isShortcutsModalOpen: open }),
  setResetConfirmOpen: (open) => set({ isResetConfirmOpen: open }),

  resetScene: () =>
    set({
      splines: [],
      placedProps: [],
      selectedPropId: null,
      selectedPropType: null,
      mudLocked: false,
      isResetConfirmOpen: false,
    }),
}));
