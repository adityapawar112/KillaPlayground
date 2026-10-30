'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TbBuildingFortress,
  TbTower,
  TbDoorEnter,
  TbChevronRight,
  TbChevronDown,
  TbTrash,
  TbFocus2,
  TbStairs,
  TbFlag,
  TbFlame,
  TbChevronLeft,
  TbPointer,
  TbPencil,
  TbArrowsMove,
  TbMountain,
  TbMinus,
  TbArrowUpRight,
  TbTrendingDown,
  TbWaveSine,
  TbRipple,
  TbDropletHalf2,
  TbBrush,
  TbAdjustmentsHorizontal,
  TbDice5,
  TbX,
  TbCheck,
} from 'react-icons/tb';
import { useEditorStore, TerrainSubTool } from '@/lib/state/useEditorStore';
import { WallMode } from '@/lib/walls/wallTypes';
import { SplineMode, SplineConversionType } from '@/lib/spline/splineTypes';
import { calculateWallTotalLength, detectBastionLocations } from '@/lib/walls/wallGeometry';

const STORAGE_RIGHT_WIDTH_KEY = 'killa_right_sidebar_width_v1';

const HISTORICAL_NAMES = [
  'North Rampart',
  'Western Causeway',
  'Ganesh Bastion',
  'Main Gateway',
  'Nagarkhana Citadel',
  'Bhavani Point',
  'Takmak Cliff',
  'Kalyan Gateway',
  'Rajmachi Bastion',
  'Sinhagad Causeway',
  'Grand Staircase',
  'Panhala Watchtower',
  'Torna Rampart',
  'Sea Gate',
];

export const RightToolSidebar: React.FC = () => {
  const {
    activeTool,
    showContextualDock,
    isMobileTopBarMinimized,
    isRightSidebarMinimized,
    toggleRightSidebar,
    wallMode,
    setWallMode,
    splineMode,
    setSplineMode,
    terrainSubTool,
    setTerrainSubTool,
    walls,
    selectedWallId,
    setSelectedWallId,
    selectedComponent,
    setSelectedComponent,
    wallSettings,
    setWallSettings,
    updateWallName,
    updateTowerProperties,
    updateTowerName,
    removeTowerFromWall,
    updateBoxBastionProperties,
    updateBoxBastionName,
    removeBoxBastionFromWall,
    updateGateProperties,
    updateGateName,
    removeGateFromWall,
    updateBastionProperties,
    toggleGrandBastionOnNode,
    removeBastionFromNode,
    removeWall,
    splines,
    selectedSplineId,
    setSelectedSplineId,
    updateSplineName,
    updateSplineType,
    updateSplineSettings,
    deleteSpline,
    setHoveredElement,
    setCameraViewPreset,
    rightSidebarWidth: sidebarWidth,
    setRightSidebarWidth: setSidebarWidth,
  } = useEditorStore();

  const isDraggingWidthRef = useRef<boolean>(false);
  const [expandedWalls, setExpandedWalls] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_RIGHT_WIDTH_KEY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 260 && val <= 460) {
          setSidebarWidth(val);
        }
      }
    } catch {}
  }, []);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingWidthRef.current = true;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvt: MouseEvent) => {
      if (!isDraggingWidthRef.current) return;
      const newWidth = Math.max(260, Math.min(460, window.innerWidth - moveEvt.clientX));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      isDraggingWidthRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      try {
        localStorage.setItem(STORAGE_RIGHT_WIDTH_KEY, sidebarWidth.toString());
      } catch {}
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const toggleWallExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWalls((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const rollRandomName = (onSetName: (name: string) => void) => {
    const random = HISTORICAL_NAMES[Math.floor(Math.random() * HISTORICAL_NAMES.length)];
    onSetName(random);
  };

  const focusCamera = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCameraViewPreset('reset');
  };

  // Only show right sidebar for tools with outliner/modes (walls, spline, terrain, prop)
  const isRelevantTool =
    activeTool === 'walls' || activeTool === 'spline' || activeTool === 'terrain' || activeTool === 'prop';
  if (!isRelevantTool) return null;

  const selectedWall = walls.find((w) => w.id === selectedWallId);
  if (activeTool === 'terrain') {
    return null;
  }

  const selectedSpline = splines.find((s) => s.id === selectedSplineId);

  return (
    <>
      {/* Minimized Hanging Guide Tab (Pinned to top-right below top bar) */}
      {isRightSidebarMinimized && (
        <div
          className={`fixed right-2 z-30 pointer-events-auto transition-all duration-200 ${
            !showContextualDock || isMobileTopBarMinimized ? 'top-[41px]' : 'top-[112px] xl:top-[81px]'
          }`}
        >
          <button
            onClick={toggleRightSidebar}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#E4D8CB] border-x border-b border-[#CDBCAB] rounded-b-lg shadow-sm text-xs font-semibold text-[#4B382C] active:scale-95 transition-transform cursor-pointer"
            title="Open Outliner"
          >
            <TbBuildingFortress className="w-3.5 h-3.5 text-[#8F4938]" />
            <span className="text-[11px] font-bold">Outliner</span>
            <TbChevronDown className="w-3.5 h-3.5 text-[#5C4638]" />
          </button>
        </div>
      )}

      {/* Docked Right Sidebar (Matching Left Panel style exactly) */}
      <aside
        aria-label="Right Tools Sidebar"
        style={{ width: `${sidebarWidth}px` }}
        className={`fixed right-0 bottom-0 z-20 flex flex-col bg-[#F3EBE0] border-l border-[#CDBCAB] shadow-lg select-none pointer-events-auto transition-all duration-200 max-w-[85vw] ${
          isRightSidebarMinimized ? 'translate-x-full' : 'translate-x-0'
        } ${
          !showContextualDock
            ? 'top-[41px]'
            : isMobileTopBarMinimized
            ? 'top-[41px]'
            : 'top-[112px] xl:top-[81px]'
        }`}
      >
        {/* Left Resizing Edge with Tactile Grip Dots */}
        <div
          onMouseDown={handleResizeStart}
          title="Drag to resize panel"
          className="group absolute top-0 left-0 w-2 h-full cursor-ew-resize hover:bg-[#B85F45]/30 transition-colors z-30 flex items-center justify-center"
        >
          {/* Tactile embossed 6-dot grip */}
          <div className="flex flex-col items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
            <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
            <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
            <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
            <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
            <div className="w-1 h-1 rounded-full bg-[#8D7666]" />
          </div>
        </div>

        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#D8C7B5] shrink-0 bg-[#ECE2D5]/70">
          <div className="flex items-center gap-1.5 text-[#4B382C]">
            <TbBuildingFortress className="w-4 h-4 text-[#8F4938]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {activeTool === 'walls'
                ? 'Fort Outliner'
                : activeTool === 'spline'
                ? 'Path Outliner'
                : 'Props Outliner'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleRightSidebar}
              title="Minimize Outliner"
              className="p-1 rounded hover:bg-[#D8C7B5] text-[#5C4638] transition-colors cursor-pointer"
            >
              <TbChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs text-[#4B382C]">
          {/* ======================================================== */}
          {/* 1. HIERARCHICAL OUTLINER FILE TREE                        */}
          {/* ======================================================== */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#8D7666] uppercase tracking-wider">
                Diorama Elements
              </span>
              <span className="text-[10px] font-bold bg-[#EADECF] text-[#5C4638] px-1.5 py-0.5 rounded-full">
                {activeTool === 'walls' ? walls.length : splines.length}
              </span>
            </div>

              {/* WALLS TREE VIEW */}
              {activeTool === 'walls' && (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {walls.length === 0 ? (
                    <div className="text-center py-4 text-[#8D7666] italic text-xs">
                      No walls drawn yet.
                    </div>
                  ) : (
                    walls.map((wall, idx) => {
                      const isSelected = selectedWallId === wall.id && !selectedComponent;
                      const isExpanded = expandedWalls[wall.id] ?? true;
                      const totalLengthM = calculateWallTotalLength(wall.points, wall.isClosed);
                      const bastionIndices = detectBastionLocations(
                        wall.points,
                        wall.isClosed,
                        wall.settings?.autoBastions ?? true,
                        wall.manualBastionIndices,
                        wall.excludedBastionIndices
                      );
                      const childCount =
                        bastionIndices.length +
                        (wall.towers?.length || 0) +
                        (wall.boxBastions?.length || 0) +
                        (wall.gates?.length || 0);

                      return (
                        <div key={wall.id} className="rounded-xl border border-[#D9C9B4] bg-[#FAF8F5] overflow-hidden">
                          {/* Wall Row */}
                          <div
                            onClick={() => {
                              setSelectedWallId(wall.id);
                              setSelectedComponent(null);
                            }}
                            onMouseEnter={() => setHoveredElement({ type: 'wall', id: wall.id })}
                            onMouseLeave={() => setHoveredElement(null)}
                            className={`group flex items-center justify-between px-2.5 py-1.5 transition-colors cursor-pointer ${
                              isSelected ? 'bg-[#B85F45] text-[#FAF8F5]' : 'hover:bg-[#EADECF]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {childCount > 0 ? (
                                <button
                                  onClick={(e) => toggleWallExpand(wall.id, e)}
                                  className="p-0.5 rounded hover:bg-black/10 cursor-pointer"
                                >
                                  {isExpanded ? (
                                    <TbChevronDown className="w-3.5 h-3.5" />
                                  ) : (
                                    <TbChevronRight className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              ) : (
                                <div className="w-4" />
                              )}
                              <TbBuildingFortress className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-semibold truncate">{wall.name || `Rampart ${idx + 1}`}</span>
                              <span
                                className={`text-[10px] truncate ${
                                  isSelected ? 'text-[#FAF8F5]/80' : 'text-[#8D7666]'
                                }`}
                              >
                                ({totalLengthM.toFixed(1)}m)
                              </span>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={focusCamera}
                                title="Focus Camera"
                                className="p-1 rounded hover:bg-black/10 cursor-pointer"
                              >
                                <TbFocus2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeWall(wall.id);
                                }}
                                title="Delete Wall"
                                className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                              >
                                <TbTrash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          {isExpanded && childCount > 0 && (
                            <div className="pl-6 pr-2 py-1 space-y-1 bg-[#F3EBE0]/60 border-t border-[#D9C9B4]/60">
                              {/* Corner Bastions */}
                              {bastionIndices.map((bIdx) => {
                                const isChildSelected =
                                  selectedComponent?.type === 'bastion' &&
                                  selectedComponent.idOrIndex === bIdx &&
                                  selectedComponent.wallId === wall.id;
                                const custom = wall.customBastions?.[bIdx];
                                const label = custom?.name || `Rampart Bastion ${bIdx + 1}`;

                                return (
                                  <div
                                    key={`bastion_${bIdx}`}
                                    onClick={() => {
                                      setSelectedWallId(wall.id);
                                      setSelectedComponent({ type: 'bastion', idOrIndex: bIdx, wallId: wall.id });
                                    }}
                                    className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isChildSelected
                                        ? 'bg-[#4B382C] text-[#FAF8F5]'
                                        : 'hover:bg-[#EADECF] text-[#5C4638]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <TbBuildingFortress className="w-3 h-3 text-[#B85F45]" />
                                      <span className="truncate">{label}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeBastionFromNode(wall.id, bIdx);
                                      }}
                                      title="Remove Bastion"
                                      className="p-0.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                    >
                                      <TbTrash className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Round Watchtowers */}
                              {wall.towers?.map((tw, tIdx) => {
                                const isChildSelected =
                                  selectedComponent?.type === 'tower' &&
                                  selectedComponent.idOrIndex === tw.id &&
                                  selectedComponent.wallId === wall.id;

                                return (
                                  <div
                                    key={tw.id}
                                    onClick={() => {
                                      setSelectedWallId(wall.id);
                                      setSelectedComponent({ type: 'tower', idOrIndex: tw.id, wallId: wall.id });
                                    }}
                                    className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isChildSelected
                                        ? 'bg-[#4B382C] text-[#FAF8F5]'
                                        : 'hover:bg-[#EADECF] text-[#5C4638]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <TbTower className="w-3 h-3 text-[#B85F45]" />
                                      <span className="truncate">{tw.name || `Watchtower ${tIdx + 1}`}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeTowerFromWall(wall.id, tw.id);
                                      }}
                                      title="Remove Watchtower"
                                      className="p-0.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                    >
                                      <TbTrash className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Rampart Bastions (Platforms) */}
                              {wall.boxBastions?.map((bx, bIdx) => {
                                const isChildSelected =
                                  selectedComponent?.type === 'box' &&
                                  selectedComponent.idOrIndex === bx.id &&
                                  selectedComponent.wallId === wall.id;

                                return (
                                  <div
                                    key={bx.id}
                                    onClick={() => {
                                      setSelectedWallId(wall.id);
                                      setSelectedComponent({ type: 'box', idOrIndex: bx.id, wallId: wall.id });
                                    }}
                                    className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isChildSelected
                                        ? 'bg-[#4B382C] text-[#FAF8F5]'
                                        : 'hover:bg-[#EADECF] text-[#5C4638]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <TbBuildingFortress className="w-3 h-3 text-[#B85F45]" />
                                      <span className="truncate">{bx.name || `Rampart Bastion ${bIdx + 1}`}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeBoxBastionFromWall(wall.id, bx.id);
                                      }}
                                      title="Remove Bastion"
                                      className="p-0.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                    >
                                      <TbTrash className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}

                              {/* Arched Gateways */}
                              {wall.gates?.map((gt, gIdx) => {
                                const isChildSelected =
                                  selectedComponent?.type === 'gate' &&
                                  selectedComponent.idOrIndex === gt.id &&
                                  selectedComponent.wallId === wall.id;

                                return (
                                  <div
                                    key={gt.id}
                                    onClick={() => {
                                      setSelectedWallId(wall.id);
                                      setSelectedComponent({ type: 'gate', idOrIndex: gt.id, wallId: wall.id });
                                    }}
                                    className={`flex items-center justify-between px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                                      isChildSelected
                                        ? 'bg-[#4B382C] text-[#FAF8F5]'
                                        : 'hover:bg-[#EADECF] text-[#5C4638]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <TbDoorEnter className="w-3 h-3 text-[#B85F45]" />
                                      <span className="truncate">{gt.name || `Arched Gateway ${gIdx + 1}`}</span>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeGateFromWall(wall.id, gt.id);
                                      }}
                                      title="Remove Gateway"
                                      className="p-0.5 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                                    >
                                      <TbTrash className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* SPLINES TREE VIEW */}
              {activeTool === 'spline' && (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                  {splines.length === 0 ? (
                    <div className="text-center py-4 text-[#8D7666] italic text-xs">
                      No paths drawn yet.
                    </div>
                  ) : (
                    splines.map((spline, idx) => {
                      const isSelected = selectedSplineId === spline.id;
                      const Icon =
                        spline.type === 'steps' ? TbStairs : spline.type === 'flags' ? TbFlag : TbFlame;
                      const label =
                        spline.name ||
                        (spline.type === 'steps'
                          ? `Stone Steps ${idx + 1}`
                          : spline.type === 'flags'
                          ? `Bhagwa Flags ${idx + 1}`
                          : `Festive Diyas ${idx + 1}`);

                      return (
                        <div
                          key={spline.id}
                          onClick={() => setSelectedSplineId(spline.id)}
                          onMouseEnter={() => setHoveredElement({ type: 'spline', id: spline.id })}
                          onMouseLeave={() => setHoveredElement(null)}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl border border-[#D9C9B4] transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#B85F45] text-[#FAF8F5]'
                              : 'bg-[#FAF8F5] hover:bg-[#EADECF] text-[#4B382C]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon className="w-4 h-4 shrink-0 text-[#B85F45]" />
                            <span className="font-semibold truncate">{label}</span>
                            <span
                              className={`text-[10px] truncate ${
                                isSelected ? 'text-[#FAF8F5]/80' : 'text-[#8D7666]'
                              }`}
                            >
                              ({spline.points.length} pts)
                            </span>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={focusCamera}
                              title="Focus Camera"
                              className="p-1 rounded hover:bg-black/10 cursor-pointer"
                            >
                              <TbFocus2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSpline(spline.id);
                              }}
                              title="Delete Path"
                              className="p-1 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                            >
                              <TbTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

          {/* ======================================================== */}
          {/* 2. CONTEXTUAL OBJECT INSPECTOR                            */}
          {/* ======================================================== */}
          <div className="border-t border-[#D9C9B4] pt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#8D7666] uppercase tracking-wider">
                Element Properties
              </span>
                {(selectedWallId || selectedComponent || selectedSplineId) && (
                  <button
                    onClick={() => {
                      setSelectedWallId(null);
                      setSelectedComponent(null);
                      setSelectedSplineId(null);
                    }}
                    className="text-[10px] text-[#B85F45] hover:underline cursor-pointer font-semibold"
                  >
                    Deselect
                  </button>
                )}
              </div>

              {/* A. BASTION (CORNER AUTO-BASTION) INSPECTOR */}
              {activeTool === 'walls' && selectedWall && selectedComponent?.type === 'bastion' && (
                (() => {
                  const bIdx = Number(selectedComponent.idOrIndex);
                  const custom = selectedWall.customBastions?.[bIdx];
                  const radius = custom?.radius ?? selectedWall.settings?.bastionRadius ?? 0.13;
                  const heightOffset = custom?.heightOffset ?? 0.0;

                  return (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#D9C9B4] pb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#4B382C]">
                          <TbBuildingFortress className="w-4 h-4 text-[#B85F45]" />
                          <span>Rampart Bastion</span>
                        </div>
                      </div>

                      {/* Bastion Name */}
                      <div>
                        <label className="text-[10px] font-bold text-[#8D7666] uppercase">Name</label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            value={custom?.name || ''}
                            placeholder={`Rampart Bastion ${bIdx + 1}`}
                            onChange={(e) =>
                              updateBastionProperties(selectedWall.id, bIdx, { name: e.target.value })
                            }
                            className="flex-1 px-2 py-1 text-xs bg-white border border-[#D9C9B4] rounded-lg text-[#2B1E16]"
                          />
                          <button
                            onClick={() =>
                              rollRandomName((name) =>
                                updateBastionProperties(selectedWall.id, bIdx, { name })
                              )
                            }
                            className="p-1 rounded-lg bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD]"
                            title="Random Name"
                          >
                            <TbDice5 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Radius Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Bastion Radius</span>
                          <span className="text-[#8D7666]">{(radius * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.06"
                          max="0.35"
                          step="0.01"
                          value={radius}
                          onChange={(e) =>
                            updateBastionProperties(selectedWall.id, bIdx, {
                              radius: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Height Offset Slider */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Height Above Wall</span>
                          <span className="text-[#8D7666]">{(heightOffset * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="0.30"
                          step="0.01"
                          value={heightOffset}
                          onChange={(e) =>
                            updateBastionProperties(selectedWall.id, bIdx, {
                              heightOffset: parseFloat(e.target.value),
                            })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D9C9B4]">
                        <button
                          onClick={focusCamera}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#EADECF] text-[#4B382C] rounded-lg hover:bg-[#DFCDBD] cursor-pointer text-center"
                        >
                          Focus
                        </button>
                        <button
                          onClick={() => {
                            removeBastionFromNode(selectedWall.id, bIdx);
                            setSelectedComponent(null);
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* B. WATCHTOWER (ROUND TOWER) INSPECTOR */}
              {activeTool === 'walls' && selectedWall && selectedComponent?.type === 'tower' && (
                (() => {
                  const tower = selectedWall.towers?.find((t) => t.id === selectedComponent.idOrIndex);
                  if (!tower) return null;

                  return (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#D9C9B4] pb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#4B382C]">
                          <TbTower className="w-4 h-4 text-[#B85F45]" />
                          <span>Watchtower</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#8D7666] uppercase">Name</label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            value={tower.name || ''}
                            placeholder="Watchtower"
                            onChange={(e) => updateTowerName(selectedWall.id, tower.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-white border border-[#D9C9B4] rounded-lg text-[#2B1E16]"
                          />
                          <button
                            onClick={() => rollRandomName((name) => updateTowerName(selectedWall.id, tower.id, name))}
                            className="p-1 rounded-lg bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD]"
                            title="Random Name"
                          >
                            <TbDice5 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Radius / Width */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Tower Radius</span>
                          <span className="text-[#8D7666]">{((tower.radius || 0.13) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.06"
                          max="0.35"
                          step="0.01"
                          value={tower.radius || 0.13}
                          onChange={(e) =>
                            updateTowerProperties(selectedWall.id, tower.id, { radius: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Height Above Wall */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Height Above Wall</span>
                          <span className="text-[#8D7666]">{((tower.heightOffset || 0.02) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="0.30"
                          step="0.01"
                          value={tower.heightOffset || 0.02}
                          onChange={(e) =>
                            updateTowerProperties(selectedWall.id, tower.id, { heightOffset: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D9C9B4]">
                        <button
                          onClick={focusCamera}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#EADECF] text-[#4B382C] rounded-lg hover:bg-[#DFCDBD] cursor-pointer text-center"
                        >
                          Focus
                        </button>
                        <button
                          onClick={() => {
                            removeTowerFromWall(selectedWall.id, tower.id);
                            setSelectedComponent(null);
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* C. RAMPART BASTION (PLATFORM) INSPECTOR */}
              {activeTool === 'walls' && selectedWall && selectedComponent?.type === 'box' && (
                (() => {
                  const box = selectedWall.boxBastions?.find((b) => b.id === selectedComponent.idOrIndex);
                  if (!box) return null;

                  return (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#D9C9B4] pb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#4B382C]">
                          <TbBuildingFortress className="w-4 h-4 text-[#B85F45]" />
                          <span>Rampart Bastion</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#8D7666] uppercase">Name</label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            value={box.name || ''}
                            placeholder="Rampart Bastion"
                            onChange={(e) => updateBoxBastionName(selectedWall.id, box.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-white border border-[#D9C9B4] rounded-lg text-[#2B1E16]"
                          />
                          <button
                            onClick={() => rollRandomName((name) => updateBoxBastionName(selectedWall.id, box.id, name))}
                            className="p-1 rounded-lg bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD]"
                            title="Random Name"
                          >
                            <TbDice5 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Width along wall */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Width</span>
                          <span className="text-[#8D7666]">{((box.width || 0.30) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.15"
                          max="0.80"
                          step="0.02"
                          value={box.width || 0.30}
                          onChange={(e) =>
                            updateBoxBastionProperties(selectedWall.id, box.id, { width: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Inward Depth / Length */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Length (Inward Depth)</span>
                          <span className="text-[#8D7666]">{((box.depth || 0.30) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.15"
                          max="0.80"
                          step="0.02"
                          value={box.depth || 0.30}
                          onChange={(e) =>
                            updateBoxBastionProperties(selectedWall.id, box.id, { depth: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Height Above Wall */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Height Above Wall</span>
                          <span className="text-[#8D7666]">{((box.heightOffset || 0.04) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.0"
                          max="0.25"
                          step="0.01"
                          value={box.heightOffset || 0.04}
                          onChange={(e) =>
                            updateBoxBastionProperties(selectedWall.id, box.id, { heightOffset: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Flip Orientation */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-[#4B382C]">Flip Orientation</span>
                        <input
                          type="checkbox"
                          checked={box.flipSide || false}
                          onChange={(e) =>
                            updateBoxBastionProperties(selectedWall.id, box.id, { flipSide: e.target.checked })
                          }
                          className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D9C9B4]">
                        <button
                          onClick={focusCamera}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#EADECF] text-[#4B382C] rounded-lg hover:bg-[#DFCDBD] cursor-pointer text-center"
                        >
                          Focus
                        </button>
                        <button
                          onClick={() => {
                            removeBoxBastionFromWall(selectedWall.id, box.id);
                            setSelectedComponent(null);
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* D. ARCHED GATEWAY INSPECTOR */}
              {activeTool === 'walls' && selectedWall && selectedComponent?.type === 'gate' && (
                (() => {
                  const gate = selectedWall.gates?.find((g) => g.id === selectedComponent.idOrIndex);
                  if (!gate) return null;

                  return (
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#D9C9B4] pb-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#4B382C]">
                          <TbDoorEnter className="w-4 h-4 text-[#B85F45]" />
                          <span>Arched Gateway</span>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#8D7666] uppercase">Name</label>
                        <div className="flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            value={gate.name || ''}
                            placeholder="Arched Gateway"
                            onChange={(e) => updateGateName(selectedWall.id, gate.id, e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-white border border-[#D9C9B4] rounded-lg text-[#2B1E16]"
                          />
                          <button
                            onClick={() => rollRandomName((name) => updateGateName(selectedWall.id, gate.id, name))}
                            className="p-1 rounded-lg bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD]"
                            title="Random Name"
                          >
                            <TbDice5 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Arch Width */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Arch Width</span>
                          <span className="text-[#8D7666]">{((gate.width || 0.18) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="0.50"
                          step="0.01"
                          value={gate.width || 0.18}
                          onChange={(e) =>
                            updateGateProperties(selectedWall.id, gate.id, { width: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Arch Height */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Arch Height</span>
                          <span className="text-[#8D7666]">{((gate.height || 0.18) * 100).toFixed(0)} cm</span>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="0.45"
                          step="0.01"
                          value={gate.height || 0.18}
                          onChange={(e) =>
                            updateGateProperties(selectedWall.id, gate.id, { height: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      {/* Flanking Watchtowers */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] font-semibold text-[#4B382C]">Flanking Watchtowers</span>
                        <input
                          type="checkbox"
                          checked={gate.hasGatehouse ?? true}
                          onChange={(e) =>
                            updateGateProperties(selectedWall.id, gate.id, { hasGatehouse: e.target.checked })
                          }
                          className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-[#D9C9B4]">
                        <button
                          onClick={focusCamera}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#EADECF] text-[#4B382C] rounded-lg hover:bg-[#DFCDBD] cursor-pointer text-center"
                        >
                          Focus
                        </button>
                        <button
                          onClick={() => {
                            removeGateFromWall(selectedWall.id, gate.id);
                            setSelectedComponent(null);
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* E. PARENT WALL INSPECTOR */}
              {activeTool === 'walls' && selectedWall && !selectedComponent && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#D9C9B4] pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#4B382C]">
                      <TbBuildingFortress className="w-4 h-4 text-[#B85F45]" />
                      <span>Rampart Specs</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-[#8D7666] uppercase">Name</label>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="text"
                        value={selectedWall.name || ''}
                        placeholder="East Rampart"
                        onChange={(e) => updateWallName(selectedWall.id, e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-white border border-[#D9C9B4] rounded-lg text-[#2B1E16]"
                      />
                      <button
                        onClick={() => rollRandomName((name) => updateWallName(selectedWall.id, name))}
                        className="p-1 rounded-lg bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD]"
                        title="Random Name"
                      >
                        <TbDice5 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                      <span>Wall Height</span>
                      <span className="text-[#8D7666]">{((wallSettings.height || 0.25) * 100).toFixed(0)} cm</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="0.60"
                      step="0.02"
                      value={wallSettings.height || 0.25}
                      onChange={(e) => setWallSettings({ height: parseFloat(e.target.value) })}
                      className="w-full accent-[#B85F45] cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                      <span>Wall Thickness</span>
                      <span className="text-[#8D7666]">{((wallSettings.thickness || 0.15) * 100).toFixed(0)} cm</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.35"
                      step="0.01"
                      value={wallSettings.thickness || 0.15}
                      onChange={(e) => setWallSettings({ thickness: parseFloat(e.target.value) })}
                      className="w-full accent-[#B85F45] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-[#4B382C]">Battlements (Crenellations)</span>
                    <input
                      type="checkbox"
                      checked={wallSettings.crenellations}
                      onChange={(e) => setWallSettings({ crenellations: e.target.checked })}
                      className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {wallSettings.crenellations && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#4B382C]">Flip Battlements Rim</span>
                      <input
                        type="checkbox"
                        checked={wallSettings.flipCrenellations ?? false}
                        onChange={(e) => setWallSettings({ flipCrenellations: e.target.checked })}
                        className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#4B382C]">Corner Auto-Bastions</span>
                    <input
                      type="checkbox"
                      checked={wallSettings.autoBastions}
                      onChange={(e) => setWallSettings({ autoBastions: e.target.checked })}
                      className="accent-[#B85F45] w-4 h-4 cursor-pointer"
                    />
                  </div>

                  {wallSettings.autoBastions && (
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                        <span>Bastion Radius</span>
                        <span className="text-[#8D7666]">{((wallSettings.bastionRadius || 0.13) * 100).toFixed(0)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0.06"
                        max="0.35"
                        step="0.01"
                        value={wallSettings.bastionRadius || 0.13}
                        onChange={(e) => setWallSettings({ bastionRadius: parseFloat(e.target.value) })}
                        className="w-full accent-[#B85F45] cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-[#D9C9B4]">
                    <button
                      onClick={focusCamera}
                      className="flex-1 py-1.5 text-xs font-semibold bg-[#EADECF] text-[#4B382C] rounded-lg hover:bg-[#DFCDBD] cursor-pointer text-center"
                    >
                      Focus
                    </button>
                    <button
                      onClick={() => {
                        removeWall(selectedWall.id);
                        setSelectedWallId(null);
                      }}
                      className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* F. SPLINE FEATURE INSPECTOR */}
              {activeTool === 'spline' && selectedSpline && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-[#D9C9B4] pb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#4B382C]">
                      {selectedSpline.type === 'steps' ? (
                        <TbStairs className="w-4 h-4 text-[#B85F45]" />
                      ) : selectedSpline.type === 'flags' ? (
                        <TbFlag className="w-4 h-4 text-[#B85F45]" />
                      ) : (
                        <TbFlame className="w-4 h-4 text-[#B85F45]" />
                      )}
                      <span>Path Feature</span>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-bold text-[#8D7666] uppercase">Name</label>
                    <div className="flex items-center gap-1 mt-0.5">
                      <input
                        type="text"
                        value={selectedSpline.name || ''}
                        placeholder={selectedSpline.type === 'steps' ? 'Stone Steps' : selectedSpline.type === 'flags' ? 'Flags' : 'Diyas'}
                        onChange={(e) => updateSplineName(selectedSpline.id, e.target.value)}
                        className="flex-1 px-2 py-1 text-xs bg-white border border-[#D9C9B4] rounded-lg text-[#2B1E16]"
                      />
                      <button
                        onClick={() => rollRandomName((name) => updateSplineName(selectedSpline.id, name))}
                        className="p-1 rounded-lg bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD]"
                        title="Random Name"
                      >
                        <TbDice5 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Switch Type inside Inspector */}
                  <div>
                    <label className="text-[10px] font-bold text-[#8D7666] uppercase">Feature Type</label>
                    <div className="grid grid-cols-3 gap-1 mt-0.5">
                      {(['steps', 'flags', 'diyas'] as SplineConversionType[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => updateSplineType(selectedSpline.id, t)}
                          className={`py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                            selectedSpline.type === t
                              ? 'bg-[#4B382C] text-[#FAF8F5]'
                              : 'bg-[#EADECF] text-[#5C4638] hover:bg-[#DFCDBD]'
                          }`}
                        >
                          {t === 'steps' ? 'Steps' : t === 'flags' ? 'Flags' : 'Diyas'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Complete Elemental Sliders for Spline */}
                  {selectedSpline.type === 'steps' && (
                    <div className="space-y-2 pt-1 border-t border-[#D9C9B4]">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Stair Width</span>
                          <span className="text-[#8D7666]">
                            {(((selectedSpline.settings?.stepWidth ?? 0.06)) * 100).toFixed(0)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.03"
                          max="0.15"
                          step="0.01"
                          value={selectedSpline.settings?.stepWidth ?? 0.06}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepWidth: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Tread Depth</span>
                          <span className="text-[#8D7666]">
                            {(((selectedSpline.settings?.stepRun ?? 0.025)) * 100).toFixed(1)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.015"
                          max="0.06"
                          step="0.005"
                          value={selectedSpline.settings?.stepRun ?? 0.025}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepRun: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Step Rise Height</span>
                          <span className="text-[#8D7666]">
                            {(((selectedSpline.settings?.stepRise ?? 0.01)) * 100).toFixed(1)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.005"
                          max="0.03"
                          step="0.002"
                          value={selectedSpline.settings?.stepRise ?? 0.01}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepRise: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Step Spacing</span>
                          <span className="text-[#8D7666]">
                            {(((selectedSpline.settings?.stepSpacing ?? 0.025)) * 100).toFixed(1)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.015"
                          max="0.06"
                          step="0.005"
                          value={selectedSpline.settings?.stepSpacing ?? 0.025}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepSpacing: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Path Offset</span>
                          <span className="text-[#8D7666]">
                            {(((selectedSpline.settings?.stepOffset ?? 0.0)) * 100).toFixed(1)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-0.05"
                          max="0.05"
                          step="0.005"
                          value={selectedSpline.settings?.stepOffset ?? 0.0}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepOffset: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Scale</span>
                          <span className="text-[#8D7666]">
                            {(selectedSpline.settings?.scale ?? 1.0).toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={selectedSpline.settings?.scale ?? 1.0}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { scale: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {selectedSpline.type !== 'steps' && (
                    <div className="space-y-2 pt-1 border-t border-[#D9C9B4]">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Item Spacing</span>
                          <span className="text-[#8D7666]">
                            {(((selectedSpline.settings?.spacing ?? (selectedSpline.type === 'flags' ? 0.20 : 0.35))) * 100).toFixed(0)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.10"
                          max="0.80"
                          step="0.05"
                          value={selectedSpline.settings?.spacing ?? (selectedSpline.type === 'flags' ? 0.20 : 0.35)}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { spacing: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Path Offset</span>
                          <span className="text-[#8D7666]">
                            {(((selectedSpline.settings?.stepOffset ?? 0.0)) * 100).toFixed(1)} cm
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-0.10"
                          max="0.10"
                          step="0.01"
                          value={selectedSpline.settings?.stepOffset ?? 0.0}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { stepOffset: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4B382C]">
                          <span>Item Scale</span>
                          <span className="text-[#8D7666]">
                            {(selectedSpline.settings?.scale ?? 1.0).toFixed(1)}x
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={selectedSpline.settings?.scale ?? 1.0}
                          onChange={(e) =>
                            updateSplineSettings(selectedSpline.id, { scale: parseFloat(e.target.value) })
                          }
                          className="w-full accent-[#B85F45] cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-[#D9C9B4]">
                    <button
                      onClick={focusCamera}
                      className="flex-1 py-1.5 text-xs font-semibold bg-[#EADECF] text-[#4B382C] rounded-lg hover:bg-[#DFCDBD] cursor-pointer text-center"
                    >
                      Focus
                    </button>
                    <button
                      onClick={() => {
                        deleteSpline(selectedSpline.id);
                        setSelectedSplineId(null);
                      }}
                      className="flex-1 py-1.5 text-xs font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 cursor-pointer text-center"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* G. EMPTY SELECTION STATE */}
              {!selectedWallId && !selectedComponent && !selectedSplineId && (
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D9C9B4] text-[11px] text-[#8D7666] leading-relaxed">
                  Click any wall, bastion, or path in the diorama or outliner above to adjust dimensions, rename, or delete it.
                </div>
              )}
            </div>
        </div>
      </aside>
    </>
  );
};

