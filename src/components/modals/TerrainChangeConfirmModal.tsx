'use client';

import React from 'react';
import {
  AlertTriangle,
  X,
  Trash2,
  Save,
  Undo2,
} from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const TerrainChangeConfirmModal: React.FC = () => {
  const {
    isTerrainConfirmOpen,
    setTerrainConfirmOpen,
    pendingTerrainChange,
    confirmTerrainChange,
    saveProjectLocally,
    setToastMessage,
    walls,
    foundations,
    stairs,
    placedProps,
    placedLights,
    foliageInstances,
  } = useEditorStore();

  const { t } = useTranslation();

  if (!isTerrainConfirmOpen || !pendingTerrainChange) return null;

  const handleBackupAndProceed = async () => {
    await saveProjectLocally();
    confirmTerrainChange();
    setToastMessage(t.startupModal.savedSuccess);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleWipeAndProceed = () => {
    confirmTerrainChange();
  };

  const wallCount = walls.length;
  const foundationCount = foundations?.length || 0;
  const stairCount = stairs?.length || 0;
  const propCount = placedProps.length;
  const lightCount = placedLights?.length || 0;
  const foliageCount = foliageInstances?.length || 0;
  const totalCount = wallCount + foundationCount + stairCount + propCount + lightCount + foliageCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-[#EBE6DC] rounded-2xl border border-[#D8D1C5] shadow-2xl p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B85F45]/15 text-[#B85F45] border border-[#B85F45]/30 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="font-yatra text-xl text-[#2B2621] tracking-wide leading-tight">
                {t.startupModal.terrainConfirmTitle}
              </h3>
              <span className="text-xs text-[#7C7267] font-sans">
                {t.terrainConfirmModal.target} <strong className="text-[#2B2621] uppercase">{pendingTerrainChange.title}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => setTerrainConfirmOpen(false)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#7C7267] hover:text-[#2B2621] hover:bg-[#D8D1C5] transition-colors cursor-pointer"
            title={t.common.cancel}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Warning Body */}
        <p className="text-xs sm:text-sm text-[#5A5248] leading-relaxed font-sans">
          {t.startupModal.terrainConfirmDesc}
        </p>

        {/* Item Count Badges */}
        <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D8D1C5] flex flex-wrap gap-2 text-xs font-sans">
          <div className="w-full text-[11px] font-semibold text-[#B85F45] tracking-wide mb-0.5">
            {t.terrainConfirmModal.objectsToBeCleared} ({totalCount}):
          </div>
          {wallCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-md bg-[#EBE6DC] text-[#2B2621] font-medium text-[11px] tabular-nums border border-[#D8D1C5]">
              {wallCount} {t.terrainConfirmModal.walls}
            </span>
          )}
          {foundationCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-md bg-[#EBE6DC] text-[#2B2621] font-medium text-[11px] tabular-nums border border-[#D8D1C5]">
              {foundationCount} {t.terrainConfirmModal.foundations}
            </span>
          )}
          {stairCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-md bg-[#EBE6DC] text-[#2B2621] font-medium text-[11px] tabular-nums border border-[#D8D1C5]">
              {stairCount} {t.terrainConfirmModal.stairs}
            </span>
          )}
          {propCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-md bg-[#EBE6DC] text-[#2B2621] font-medium text-[11px] tabular-nums border border-[#D8D1C5]">
              {propCount} {t.terrainConfirmModal.figurines}
            </span>
          )}
          {lightCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-md bg-[#EBE6DC] text-[#2B2621] font-medium text-[11px] tabular-nums border border-[#D8D1C5]">
              {lightCount} {t.terrainConfirmModal.diyasLights}
            </span>
          )}
          {foliageCount > 0 && (
            <span className="px-2.5 py-0.5 rounded-md bg-[#EBE6DC] text-[#2B2621] font-medium text-[11px] tabular-nums border border-[#D8D1C5]">
              {foliageCount} {t.terrainConfirmModal.foliage}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-[#D8D1C5]">
          <button
            onClick={() => setTerrainConfirmOpen(false)}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-md text-xs font-medium text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer text-center"
          >
            {t.startupModal.terrainConfirmCancelBtn}
          </button>

          <button
            onClick={handleBackupAndProceed}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#2B2621] hover:bg-[#38322B] text-[#FAF8F5] shadow-xs transition-all cursor-pointer"
          >
            <Save size={15} strokeWidth={1.75} className="text-[#FAF8F5]" />
            <span>{t.startupModal.terrainConfirmBackupBtn}</span>
          </button>

          <button
            onClick={handleWipeAndProceed}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#B85F45] hover:bg-[#A3523B] text-white shadow-sm transition-all cursor-pointer"
          >
            <Trash2 size={15} strokeWidth={1.75} />
            <span>{t.startupModal.terrainConfirmWipeBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
