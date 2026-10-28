'use client';

import React from 'react';
import { TbAlertTriangle, TbX, TbReload } from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ResetConfirmModalProps {
  onConfirmReset?: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  onConfirmReset,
}) => {
  const { isResetConfirmOpen, setResetConfirmOpen, resetScene, triggerCameraReset } =
    useEditorStore();
  const { t } = useTranslation();

  if (!isResetConfirmOpen) return null;

  const handleConfirm = () => {
    resetScene();
    triggerCameraReset();
    onConfirmReset?.();
    setResetConfirmOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#F9F6F0] rounded-2xl border border-[#D9C9B4] shadow-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#B85F45]/15 text-[#B85F45] flex items-center justify-center shrink-0">
            <TbAlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#2B1E16]">
              {t.resetTitle}
            </h3>
            <p className="text-xs text-[#634E40] mt-1.5 leading-relaxed">
              {t.resetConfirm}
            </p>
          </div>
          <button
            onClick={() => setResetConfirmOpen(false)}
            className="text-[#8D7666] hover:text-[#2B1E16] cursor-pointer"
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            onClick={() => setResetConfirmOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#634E40] hover:bg-[#EADECF] transition-colors cursor-pointer"
          >
            {t.cancelBtn}
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#B85F45] hover:bg-[#8F4938] text-white shadow-md shadow-[#B85F45]/30 transition-all cursor-pointer"
          >
            <TbReload className="w-4 h-4" />
            <span>{t.resetConfirmBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
