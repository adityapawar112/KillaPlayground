'use client';

import React from 'react';
import {
  TbLock,
  TbLockOpen,
  TbRipple,
  TbSparkles,
  TbCheck,
  TbSun,
  TbMountain,
  TbPlant2,
  TbTrees,
  TbArrowsLeft,
  TbArrowsRight,
  TbArrowDownBar,
  TbTrendingDown,
  TbMinus,
  TbWaveSine,
  TbArrowUpRight,
  TbArrowBackUp,
  TbTrash,
} from 'react-icons/tb';
import { useEditorStore, BrushSizeType } from '@/lib/state/useEditorStore';
import { useTerrainStore } from '@/lib/terrain/terrainStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PAINT_COLORS } from '@/lib/constants/tokens';

export const ContextualDock: React.FC = () => {
  const canUndoTerrain = useTerrainStore((s) => s.canUndo());
  const undoTerrain = useTerrainStore((s) => s.undo);
  const {
    activeTool,
    setActiveTool,
    shapeSubTool,
    setShapeSubTool,
    terrainSubTool,
    setTerrainSubTool,
    plateauHeight,
    setPlateauHeight,
    slopeAngle,
    setSlopeAngle,
    slopeAlignment,
    setSlopeAlignment,
    slopeIncline,
    setSlopeIncline,
    foliageSubTool,
    setFoliageSubTool,
    foliageBrushRadius,
    setFoliageBrushRadius,
    lightingSubTool,
    lightEraseRadius,
    setLightEraseRadius,
    brushRadius,
    setBrushRadius,
    brushStrength,
    setBrushStrength,
    brushSize,
    setBrushSize,
    steadyHand,
    setSteadyHand,
    paintColor,
    setPaintColor,
    grassDensity,
    setGrassDensity,
    waterMode,
    setWaterMode,
    mudLocked,
    setMudLocked,
    showContextualDock,
    buildingMode,
    activeWallDraft,
    finishCurrentWall,
    cancelCurrentWall,
    activeStairDraft,
    finishStairs,
    cancelStairs,
    locale,
  } = useEditorStore();

  const { t } = useTranslation();

  if (!showContextualDock) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 bg-[#F2EBE1]/94 backdrop-blur-md rounded-2xl border border-[#D9C9B4] shadow-xl transition-all select-none">
      {/* 1. SOIL TOOL CONTROLS (Lump of Soil) */}
      {activeTool === 'soil' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">{t.tools.soil.radius}:</span>
            <input
              type="range"
              aria-label={t.tools.soil.radius}
              min="0.3"
              max="2.2"
              step="0.1"
              value={brushRadius}
              onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
              className="w-24 accent-[#B85F45] cursor-pointer"
            />
            <span className="text-xs text-[#8D7666] w-6">{brushRadius.toFixed(1)}</span>
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">{t.tools.soil.height}:</span>
            <input
              type="range"
              aria-label={t.tools.soil.height}
              min="0.1"
              max="1.0"
              step="0.05"
              value={brushStrength}
              onChange={(e) => setBrushStrength(parseFloat(e.target.value))}
              className="w-20 accent-[#B85F45] cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 2. WATER TOOL CONTROLS */}
      {activeTool === 'water' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">{t.tools.water.flow}:</span>
            <input
              type="range"
              aria-label={t.tools.water.flow}
              min="0.2"
              max="2.0"
              step="0.1"
              value={brushRadius}
              onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
              className="w-24 accent-[#0284C7] cursor-pointer"
            />
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          <button
            onClick={() => setWaterMode(waterMode === 'tarpaulin' ? 'reflective' : 'tarpaulin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              waterMode === 'tarpaulin'
                ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                : 'bg-[#EADECF] text-[#4B382C] border-[#D9C9B4]'
            }`}
            title="Toggle reflective water vs blue plastic sheet pond effect"
          >
            <TbRipple className="w-3.5 h-3.5" />
            <span>{waterMode === 'tarpaulin' ? t.tools.water.tarpaulin : t.tools.water.reflective}</span>
          </button>
        </div>
      )}

      {/* 3. SHAPING CONTROLS (Push Left, Push Right, Pat from Top) */}
      {(activeTool === 'shape' || activeTool === 'shape_side' || activeTool === 'shape_top') && (
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4] gap-1 font-sans">
            <button
              onClick={() => setShapeSubTool('push_left')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                shapeSubTool === 'push_left'
                  ? 'bg-[#4B382C] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <TbArrowsLeft className="w-3.5 h-3.5" />
              <span>{t.tools.shape.pushLeft}</span>
            </button>
            <button
              onClick={() => setShapeSubTool('push_right')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                shapeSubTool === 'push_right'
                  ? 'bg-[#4B382C] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <TbArrowsRight className="w-3.5 h-3.5" />
              <span>{t.tools.shape.pushRight}</span>
            </button>
            <button
              onClick={() => setShapeSubTool('pat_top')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                shapeSubTool === 'pat_top'
                  ? 'bg-[#4B382C] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <TbArrowDownBar className="w-3.5 h-3.5" />
              <span>{t.tools.shape.topPat}</span>
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">{t.tools.shape.size}:</span>
            <input
              type="range"
              aria-label={t.tools.shape.size}
              min="0.3"
              max="2.0"
              step="0.1"
              value={brushRadius}
              onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
              className="w-20 accent-[#4B382C] cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 4. DRYING TOOL CONTROLS */}
      {activeTool === 'dry' && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMudLocked(!mudLocked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              mudLocked
                ? 'bg-[#588157] text-white border-[#588157] shadow-sm'
                : 'bg-[#EADECF] text-[#4B382C] border-[#D9C9B4]'
            }`}
          >
            {mudLocked ? <TbLock className="w-4 h-4" /> : <TbSun className="w-4 h-4 text-[#F59E0B]" />}
            <span>{mudLocked ? 'Structure Solidified & Dried' : 'Dry & Solidify Soil'}</span>
          </button>
          <span className="text-[11px] text-[#8D7666]">
            Dries shaped mud to allow painting, figurines, and crenellations
          </span>
        </div>
      )}

      {/* 5. STRUCTURE PAINT STUDIO CONTROLS */}
      {activeTool === 'paint' && (
        <div className="flex items-center gap-3">
          {/* Brush Sizes */}
          <div className="flex items-center bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4]">
            {(['large', 'medium', 'fine'] as BrushSizeType[]).map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  brushSize === size
                    ? 'bg-[#4B382C] text-white shadow-sm'
                    : 'text-[#634E40] hover:text-[#2B1E16]'
                }`}
              >
                {size === 'large'
                  ? t.tools.paint.large
                  : size === 'medium'
                  ? t.tools.paint.medium
                  : t.tools.paint.fine}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          {/* Color Swatches */}
          <div className="flex items-center gap-1.5">
            {PAINT_COLORS.map((col) => {
              const isSelected = paintColor.toLowerCase() === col.hex.toLowerCase();
              return (
                <button
                  key={col.id}
                  onClick={() => setPaintColor(col.hex)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer relative ${
                    isSelected ? 'scale-125 border-[#4B382C] shadow-md' : 'border-white hover:scale-110'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={`${col.name} - ${col.role}`}
                >
                  {isSelected && (
                    <TbCheck
                      className={`w-3 h-3 absolute inset-0 m-auto ${
                        col.id === 'chuna' ? 'text-black' : 'text-white'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          {/* Steady-Hand Stabilizer Toggle */}
          <button
            onClick={() => setSteadyHand(!steadyHand)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              steadyHand
                ? 'bg-[#4B382C] text-white border-[#4B382C]'
                : 'bg-[#EADECF] text-[#4B382C] border-[#D9C9B4]'
            }`}
            title={t.tools.paint.steadyHandDesc}
          >
            <TbSparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{t.tools.paint.steadyHand}</span>
          </button>
        </div>
      )}

      {/* 6. TERRAIN MANIPULATION CONTROLS */}
      {activeTool === 'terrain' && (
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4] gap-1 font-sans">
            <button
              onClick={() => setTerrainSubTool('elevate')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                terrainSubTool === 'elevate'
                  ? 'bg-[#E85D04] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
              title={t.toolModeSidebar.terrainTitles.elevate}
            >
              <TbMountain className="w-3.5 h-3.5" />
              <span>{t.toolModeSidebar.terrainModes.elevate}</span>
            </button>
            <button
              onClick={() => setTerrainSubTool('lower')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                terrainSubTool === 'lower'
                  ? 'bg-[#8F4938] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
              title={t.toolModeSidebar.terrainTitles.lower}
            >
              <TbTrendingDown className="w-3.5 h-3.5" />
              <span>{t.toolModeSidebar.terrainModes.lower}</span>
            </button>
            <button
              onClick={() => setTerrainSubTool('plateau')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                terrainSubTool === 'plateau'
                  ? 'bg-[#B58B63] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
              title={t.toolModeSidebar.terrainTitles.plateau}
            >
              <TbMinus className="w-3.5 h-3.5" />
              <span>{t.toolModeSidebar.terrainModes.plateau}</span>
            </button>
            <button
              onClick={() => setTerrainSubTool('smooth')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                terrainSubTool === 'smooth'
                  ? 'bg-[#777A57] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
              title={t.toolModeSidebar.terrainTitles.smooth}
            >
              <TbWaveSine className="w-3.5 h-3.5" />
              <span>{t.toolModeSidebar.terrainModes.smooth}</span>
            </button>
            <button
              onClick={() => setTerrainSubTool('pond')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                terrainSubTool === 'pond'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
              title={t.toolModeSidebar.terrainTitles.pond}
            >
              <TbRipple className="w-3.5 h-3.5" />
              <span>{t.toolModeSidebar.terrainModes.pond}</span>
            </button>
            <button
              onClick={() => setTerrainSubTool('slope')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                terrainSubTool === 'slope'
                  ? 'bg-[#D97706] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
              title={t.toolModeSidebar.terrainTitles.slope}
            >
              <TbArrowUpRight className="w-3.5 h-3.5" />
              <span>{t.toolModeSidebar.terrainModes.slope}</span>
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          {/* Brush Size Slider */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#4B382C]">{t.tools.terrain.radius}:</span>
            <input
              type="range"
              aria-label={t.tools.terrain.radius}
              min="0.2"
              max="3.0"
              step="0.1"
              value={brushRadius}
              onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-[#4B382C] cursor-pointer"
            />
            <span className="text-[11px] font-mono text-[#8D7666] w-6">{brushRadius.toFixed(1)}m</span>
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          {/* Sculpt Strength Slider */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#4B382C]">{t.tools.terrain.strength}:</span>
            <input
              type="range"
              aria-label={t.tools.terrain.strength}
              min="0.05"
              max="1.0"
              step="0.05"
              value={brushStrength}
              onChange={(e) => setBrushStrength(parseFloat(e.target.value))}
              className="w-16 sm:w-20 accent-[#4B382C] cursor-pointer"
            />
          </div>

          {/* Plateau Height Slider if Plateau Tool Active */}
          {terrainSubTool === 'plateau' && (
            <>
              <div className="w-[1px] h-5 bg-[#D9C9B4]" />
              <div className="flex items-center gap-1.5 font-sans">
                <span className="text-xs font-semibold text-[#B58B63]">{t.tools.terrain.height}:</span>
                <input
                  type="range"
                  aria-label={t.tools.terrain.height}
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  value={plateauHeight}
                  onChange={(e) => setPlateauHeight(parseFloat(e.target.value))}
                  className="w-16 sm:w-20 accent-[#B58B63] cursor-pointer"
                />
                <span className="text-[11px] font-mono text-[#8D7666] w-6">{plateauHeight.toFixed(1)}m</span>
              </div>
            </>
          )}

          {/* Consolidated Slope Incline, Alignment & Angle Presets if Slope Tool Active */}
          {terrainSubTool === 'slope' && (
            <>
              <div className="w-[1px] h-5 bg-[#D9C9B4]" />

              {/* Incline vs Decline Toggle */}
              <button
                onClick={() => setSlopeIncline(slopeIncline === 'incline' ? 'decline' : 'incline')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EADECF] hover:bg-[#DFCDBD] text-[#D97706] border border-[#D9C9B4] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                title="Click to toggle Incline (Up) vs Decline (Down)"
              >
                <span>{slopeIncline === 'incline' ? '▲ Incline' : '▼ Decline'}</span>
              </button>

              {/* Alignment Mode: Camera View vs Terrain Gradient */}
              <button
                onClick={() => setSlopeAlignment(slopeAlignment === 'camera' ? 'terrain' : 'camera')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EADECF] hover:bg-[#DFCDBD] text-[#4B382C] border border-[#D9C9B4] flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                title="Click to toggle View direction vs Mountain slope normal"
              >
                <span>{slopeAlignment === 'camera' ? 'View' : 'Terrain'}</span>
              </button>

              {/* Angle Presets */}
              <div className="flex items-center gap-0.5 bg-[#EADECF] p-0.5 rounded-lg border border-[#D9C9B4]">
                {[15, 30, 45, 60].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => setSlopeAngle(deg)}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                      slopeAngle === deg
                        ? 'bg-[#D97706] text-white shadow-xs'
                        : 'text-[#634E40] hover:text-[#2B1E16]'
                    }`}
                    title={`${deg}° slope angle preset`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Default Soil brush indicator */}
          {terrainSubTool === 'soil' && (
            <>
              <div className="w-[1px] h-5 bg-[#D9C9B4]" />
              <span className="text-[11px] font-medium text-[#4B382C]">
                Paints natural dry soil & erases water/grass
              </span>
            </>
          )}
        </div>
      )}

      {/* 7. FOLIAGE CONTROLS (Scatter | Single | Erase) */}
      {(activeTool === 'foliage' || activeTool === 'grass') && (
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4] gap-1 font-sans">
            <button
              onClick={() => setFoliageSubTool('scatter')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                foliageSubTool === 'scatter'
                  ? 'bg-[#15803D] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <TbTrees className="w-3.5 h-3.5" />
              <span>{t.toolModeSidebar.foliageModes.scatter}</span>
            </button>
            <button
              onClick={() => setFoliageSubTool('single')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                foliageSubTool === 'single'
                  ? 'bg-[#15803D] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <span>{t.toolModeSidebar.foliageModes.single}</span>
            </button>
            <button
              onClick={() => setFoliageSubTool('erase')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                foliageSubTool === 'erase'
                  ? 'bg-[#8F4938] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <span>{t.toolModeSidebar.foliageModes.erase}</span>
            </button>
          </div>

          {foliageSubTool !== 'single' && (
            <>
              <div className="w-[1px] h-5 bg-[#D9C9B4]" />

              <div className="flex items-center gap-2 font-sans">
                <span className="text-xs font-semibold text-[#4B382C]">{t.tools.terrain.radius}:</span>
                <input
                  type="range"
                  aria-label={t.tools.terrain.radius}
                  min="0.1"
                  max="2.0"
                  step="0.05"
                  value={foliageBrushRadius}
                  onChange={(e) => setFoliageBrushRadius(parseFloat(e.target.value))}
                  className="w-20 accent-[#15803D] cursor-pointer"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* 8. BUILDING CONSTRUCTION TOOL CONTROLS */}
      {(activeTool === 'building' || activeTool === 'walls') && (
        <div className="flex items-center gap-3">
          {buildingMode === 'stairs' && (
            <>
              {activeStairDraft.length > 0 && (
                <>
                  <button
                    onClick={() => finishStairs()}
                    disabled={activeStairDraft.length < 2}
                    className="px-3 py-1 bg-[#E85D04] hover:bg-[#D05303] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {t.tools.walls.finishStairs} ({activeStairDraft.length} {t.common.faces})
                  </button>
                  <button
                    onClick={cancelStairs}
                    className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                </>
              )}
              {activeStairDraft.length === 0 && (
                <span className="text-[11px] font-medium text-[#634E40] hidden sm:inline">
                  {t.toolModeSidebar.buildingTitles.stairs}
                </span>
              )}
            </>
          )}

          {buildingMode === 'walls' && (
            <>
              {activeWallDraft.length > 0 && (
                <>
                  <button
                    onClick={() => finishCurrentWall()}
                    disabled={activeWallDraft.length < 2}
                    className="px-3 py-1 bg-[#E85D04] hover:bg-[#D05303] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {t.tools.walls.finishWall} ({activeWallDraft.length} {t.tools.walls.nodesCount})
                  </button>
                  <button
                    onClick={() => finishCurrentWall(true)}
                    disabled={activeWallDraft.length < 3}
                    title={t.tools.walls.closeHint}
                    className="px-3 py-1 bg-[#8C4A32] hover:bg-[#783E29] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    {t.tools.walls.closeLoop}
                  </button>
                  <button
                    onClick={cancelCurrentWall}
                    className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                </>
              )}
              {activeWallDraft.length === 0 && (
                <span className="text-[11px] font-medium text-[#634E40] hidden sm:inline">
                  {t.toolModeSidebar.buildingTitles.walls}
                </span>
              )}
            </>
          )}

          {buildingMode === 'foundation' && (
            <span className="text-[11px] font-medium text-[#634E40] hidden sm:inline">
              {t.toolModeSidebar.buildingTitles.foundation}
            </span>
          )}

          {buildingMode === 'fortifications' && (
            <span className="text-[11px] font-medium text-[#634E40] hidden sm:inline">
              {t.toolModeSidebar.buildingTitles.fortifications}
            </span>
          )}

          {buildingMode === 'select' && (
            <span className="text-[11px] font-medium text-[#634E40] hidden sm:inline">
              {t.toolModeSidebar.buildingTitles.select}
            </span>
          )}
        </div>
      )}

      {/* 9. FIGURINES TOOL HINT */}
      {activeTool === 'prop' && (
        <div className="flex items-center gap-3 font-sans">
          <span className="text-xs font-semibold text-[#4B382C]">
            {t.toolModeSidebar.propTitles.place}
          </span>
        </div>
      )}

      {/* 10. FESTIVE LIGHTING & FIREWORKS CONTROLS */}
      {activeTool === 'lighting' && (
        <div className="flex items-center gap-3 font-sans">
          {lightingSubTool === 'erase' ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#4B382C]">{t.toolModeSidebar.lightingModes.erase} {t.tools.terrain.radius}:</span>
              <input
                type="range"
                aria-label={`${t.toolModeSidebar.lightingModes.erase} ${t.tools.terrain.radius}`}
                min="0.2"
                max="2.5"
                step="0.1"
                value={lightEraseRadius}
                onChange={(e) => setLightEraseRadius(parseFloat(e.target.value))}
                className="w-20 accent-[#DC2626] cursor-pointer"
              />
              <span className="text-xs text-[#8D7666]">{lightEraseRadius.toFixed(1)}m</span>
            </div>
          ) : (
            <span className="text-xs font-semibold text-[#4B382C]">
              {lightingSubTool === 'place'
                ? t.toolModeSidebar.lightingTitles.place
                : lightingSubTool === 'select'
                ? t.toolModeSidebar.lightingTitles.select
                : t.toolModeSidebar.lightingTitles.transform}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
