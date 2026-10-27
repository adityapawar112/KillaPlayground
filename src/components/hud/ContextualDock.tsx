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
  TbArrowsLeft,
  TbArrowsRight,
  TbArrowDownBar,
} from 'react-icons/tb';
import { useEditorStore, BrushSizeType } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { PAINT_COLORS } from '@/lib/constants/tokens';

export const ContextualDock: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
    shapeSubTool,
    setShapeSubTool,
    terrainSubTool,
    setTerrainSubTool,
    foliageSubTool,
    setFoliageSubTool,
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
          <div className="flex items-center bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4] gap-1">
            <button
              onClick={() => setShapeSubTool('push_left')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                shapeSubTool === 'push_left'
                  ? 'bg-[#4B382C] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <TbArrowsLeft className="w-3.5 h-3.5" />
              <span>Push Left</span>
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
              <span>Push Right</span>
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
              <span>Pat Top</span>
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">{t.tools.shape.size}:</span>
            <input
              type="range"
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
          <div className="flex items-center bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4] gap-1">
            <button
              onClick={() => setTerrainSubTool('elevate')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                terrainSubTool === 'elevate'
                  ? 'bg-[#4B382C] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <TbMountain className="w-3.5 h-3.5" />
              <span>Elevate Mountain</span>
            </button>
            <button
              onClick={() => setTerrainSubTool('pond')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                terrainSubTool === 'pond'
                  ? 'bg-[#0284C7] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <TbRipple className="w-3.5 h-3.5" />
              <span>Excavate Pond</span>
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">Size:</span>
            <input
              type="range"
              min="0.4"
              max="3.0"
              step="0.1"
              value={brushRadius}
              onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
              className="w-20 accent-[#4B382C] cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 7. FOLIAGE CONTROLS (Grass/Moss vs Path) */}
      {(activeTool === 'foliage' || activeTool === 'grass') && (
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4] gap-1">
            <button
              onClick={() => setFoliageSubTool('grass')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                foliageSubTool === 'grass'
                  ? 'bg-[#588157] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <TbPlant2 className="w-3.5 h-3.5" />
              <span>Grass / Moss</span>
            </button>
            <button
              onClick={() => setFoliageSubTool('path')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                foliageSubTool === 'path'
                  ? 'bg-[#8F4938] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              <span>Foliage Path</span>
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">Radius:</span>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.1"
              value={brushRadius}
              onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
              className="w-20 accent-[#65A30D] cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 8. SPLINE TOOL HINT */}
      {activeTool === 'spline' && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#4B382C]">
            Click on terrain or solid structure to draw stairways (Payrya) or crenellations (Kangare)
          </span>
        </div>
      )}

      {/* 9. FIGURINES TOOL HINT */}
      {activeTool === 'prop' && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#4B382C]">
            Select figurine from right drawer and place on terrain or solid structures
          </span>
        </div>
      )}
    </div>
  );
};
