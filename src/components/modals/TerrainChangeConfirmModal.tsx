'use client';

import React from 'react';
import {
  TbAlertTriangle,
  TbX,
  TbTrash,
  TbDeviceFloppy,
  TbArrowBackUp,
} from 'react-icons/tb';
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
      <div className="relative w-full max-w-lg bg-[#F9F6F0] rounded-3xl border-2 border-[#D9C9B4] shadow-2xl p-6 sm:p-7 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#B85F45]/15 text-[#B85F45] border border-[#B85F45]/30 flex items-center justify-center shrink-0 shadow-xs">
              <TbAlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-yatra text-xl text-[#2B1E16] tracking-wide leading-tight">
                {t.startupModal.terrainConfirmTitle}
              </h3>
              <span className="text-xs text-[#8D7666] font-sans">
                {t.terrainConfirmModal.target} <strong className="text-[#4B382C] uppercase">{pendingTerrainChange.title}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => setTerrainConfirmOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8D7666] hover:text-[#2B1E16] hover:bg-[#EADECF] transition-colors cursor-pointer"
            title={t.common.cancel}
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Body */}
        <p className="text-xs sm:text-sm text-[#634E40] leading-relaxed font-sans">
          {t.startupModal.terrainConfirmDesc}
        </p>

        {/* Item Count Badges */}
        <div className="p-3.5 rounded-2xl bg-[#F2EBE1] border border-[#D9C9B4] flex flex-wrap gap-2 text-xs font-sans">
          <div className="w-full text-[11px] font-bold text-[#8F4938] uppercase tracking-wider mb-0.5">
            {t.terrainConfirmModal.objectsToBeCleared} ({totalCount}):
          </div>
          {wallCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-[#EADECF] font-semibold text-[#4B382C]">
              {wallCount} {t.terrainConfirmModal.walls}
            </span>
          )}
          {foundationCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-[#EADECF] font-semibold text-[#4B382C]">
              {foundationCount} {t.terrainConfirmModal.foundations}
            </span>
          )}
          {stairCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-[#EADECF] font-semibold text-[#4B382C]">
              {stairCount} {t.terrainConfirmModal.stairs}
            </span>
          )}
          {propCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-[#EADECF] font-semibold text-[#4B382C]">
              {propCount} {t.terrainConfirmModal.figurines}
            </span>
          )}
          {lightCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-[#EADECF] font-semibold text-[#4B382C]">
              {lightCount} {t.terrainConfirmModal.diyasLights}
            </span>
          )}
          {foliageCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-[#EADECF] font-semibold text-[#4B382C]">
              {foliageCount} {t.terrainConfirmModal.foliage}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-[#D9C9B4]/60">
          <button
            onClick={() => setTerrainConfirmOpen(false)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-[#634E40] hover:bg-[#EADECF] transition-colors cursor-pointer text-center"
          >
            {t.startupModal.terrainConfirmCancelBtn}
          </button>

          <button
            onClick={handleBackupAndProceed}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#4B382C] hover:bg-[#38281E] text-white shadow-xs transition-all cursor-pointer"
          >
            <TbDeviceFloppy className="w-4 h-4 text-[#F59E0B]" />
            <span>{t.startupModal.terrainConfirmBackupBtn}</span>
          </button>

          <button
            onClick={handleWipeAndProceed}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#B85F45] hover:bg-[#8F4938] text-white shadow-md shadow-[#B85F45]/30 transition-all cursor-pointer"
          >
            <TbTrash className="w-4 h-4" />
            <span>{t.startupModal.terrainConfirmWipeBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

