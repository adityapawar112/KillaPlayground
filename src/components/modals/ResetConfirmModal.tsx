'use client';

import React from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';
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
      <div className="relative w-full max-w-md bg-[#EBE6DC] rounded-2xl border border-[#D8D1C5] shadow-2xl p-6 select-none">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#B85F45]/15 text-[#B85F45] flex items-center justify-center shrink-0">
            <AlertTriangle size={20} strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#2B2621]">
              {t.resetTitle}
            </h3>
            <p className="text-xs text-[#5A5248] mt-1.5 leading-relaxed">
              {t.resetConfirm}
            </p>
          </div>
          <button
            onClick={() => setResetConfirmOpen(false)}
            className="text-[#7C7267] hover:text-[#2B2621] transition-colors cursor-pointer p-1"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={() => setResetConfirmOpen(false)}
            className="px-3.5 py-1.5 rounded-md text-xs font-medium text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer"
          >
            {t.cancelBtn}
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#B85F45] hover:bg-[#A3523B] text-white shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw size={15} strokeWidth={1.75} />
            <span>{t.resetConfirmBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
