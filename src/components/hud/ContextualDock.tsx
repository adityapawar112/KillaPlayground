'use client';

import React from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Paintbrush,
  Sparkles,
  Waves,
  Maximize2,
  Minimize2,
  Check,
} from 'lucide-react';
import { useEditorStore, BrushSizeType } from '@/lib/state/useEditorStore';
import { PAINT_COLORS } from '@/lib/constants/tokens';

export const ContextualDock: React.FC = () => {
  const {
    activeTool,
    setActiveTool,
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
  } = useEditorStore();

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-2 bg-[#F2EBE1]/94 backdrop-blur-md rounded-2xl border border-[#D9C9B4] shadow-xl transition-all">
      {/* SOIL TOOL CONTROLS */}
      {activeTool === 'soil' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">पसरवा (Radius):</span>
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
            <span className="text-xs font-semibold text-[#4B382C]">उंची (Height):</span>
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

      {/* WATER TOOL CONTROLS */}
      {activeTool === 'water' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">पाण्याचा वेग (Flow):</span>
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

          {/* Water Style: Reflective vs Blue Plastic Sheet */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setWaterMode(waterMode === 'tarpaulin' ? 'reflective' : 'tarpaulin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                waterMode === 'tarpaulin'
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-sm'
                  : 'bg-[#EADECF] text-[#4B382C] border-[#D9C9B4]'
              }`}
              title="Toggle nostalgic blue plastic sheet pond effect"
            >
              <Waves className="w-3.5 h-3.5" />
              <span>{waterMode === 'tarpaulin' ? 'निळी प्लास्टिक (Tarpaulin)' : 'स्वच्छ पाणी (Clean)'}</span>
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          {/* Mud Lock State */}
          <button
            onClick={() => setMudLocked(!mudLocked)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              mudLocked
                ? 'bg-[#588157] text-white border-[#588157]'
                : 'bg-[#EADECF] text-[#4B382C] border-[#D9C9B4]'
            }`}
            title="Lock mud so nearby sculpting does not distort finished walls"
          >
            {mudLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{mudLocked ? 'माती पक्की झाली (Locked)' : 'माती पक्की करा (Lock)'}</span>
          </button>
        </div>
      )}

      {/* SHAPING CONTROLS (TOP PATTING vs SIDE PUSHING) */}
      {(activeTool === 'shape_side' || activeTool === 'shape_top') && (
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#EADECF] p-1 rounded-xl border border-[#D9C9B4]">
            <button
              onClick={() => setActiveTool('shape_side')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTool === 'shape_side'
                  ? 'bg-[#4B382C] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              उभी भिंत (Side Push)
            </button>
            <button
              onClick={() => setActiveTool('shape_top')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTool === 'shape_top'
                  ? 'bg-[#4B382C] text-white shadow-sm'
                  : 'text-[#634E40] hover:text-[#2B1E16]'
              }`}
            >
              सपाट माथा (Top Pat)
            </button>
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">आकार (Size):</span>
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

      {/* PAINT STUDIO CONTROLS */}
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
                {size === 'large' ? 'मोठा (XL)' : size === 'medium' ? 'मध्यम' : 'बारीक (Fine)'}
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
                    <Check
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
            title="Steady-hand stabilizer for drawing dead-straight white mortar lines without jitter"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>स्थिर हात (Steady Hand)</span>
          </button>
        </div>
      )}

      {/* GREENERY / HALIM GRASS CONTROLS */}
      {activeTool === 'grass' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">पसरवा (Radius):</span>
            <input
              type="range"
              min="0.3"
              max="2.0"
              step="0.1"
              value={brushRadius}
              onChange={(e) => setBrushRadius(parseFloat(e.target.value))}
              className="w-24 accent-[#65A30D] cursor-pointer"
            />
          </div>

          <div className="w-[1px] h-5 bg-[#D9C9B4]" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#4B382C]">घनता (Density):</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.1"
              value={grassDensity}
              onChange={(e) => setGrassDensity(parseFloat(e.target.value))}
              className="w-24 accent-[#65A30D] cursor-pointer"
            />
            <span className="text-xs text-[#8D7666] w-6">{Math.round(grassDensity * 100)}%</span>
          </div>
        </div>
      )}

      {/* SPLINE TOOL HINT */}
      {activeTool === 'spline' && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#4B382C]">
            जमिनीवर क्लिक करून रेषा काढा (Click terrain to draw path)
          </span>
        </div>
      )}

      {/* PROP TOOL HINT */}
      {activeTool === 'prop' && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#4B382C]">
            उजव्या ड्रॉवरमधून मावळे किंवा तोफा निवडून जमिनीवर ठेवा
          </span>
        </div>
      )}
    </div>
  );
};
