'use client';

import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { INTERACTION_CLASSES } from '@/lib/theme/tokens';

export const DestructiveConfirmModal: React.FC = () => {
  const destructiveModal = useEditorStore((s) => s.destructiveModal);
  const closeDestructiveConfirm = useEditorStore((s) => s.closeDestructiveConfirm);
  const { t } = useTranslation();
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (destructiveModal?.isOpen) {
      // Focus cancel button by default to prevent accidental confirmation
      setTimeout(() => cancelBtnRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeDestructiveConfirm();
          e.preventDefault();
        } else if (e.key === 'Enter') {
          destructiveModal.onConfirm();
          closeDestructiveConfirm();
          e.preventDefault();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [destructiveModal, closeDestructiveConfirm]);

  if (!destructiveModal?.isOpen) return null;

  const handleConfirm = () => {
    destructiveModal.onConfirm();
    closeDestructiveConfirm();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="destructive-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md bg-[#EBE6DC] rounded-2xl border border-[#D8D1C5] shadow-2xl p-6 select-none font-sans">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#B85F45]/15 text-[#B85F45] flex items-center justify-center shrink-0">
            <AlertTriangle size={20} strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <h3
              id="destructive-modal-title"
              className="text-sm font-semibold text-[#2B2621]"
            >
              {destructiveModal.title || t.destructiveModal.defaultTitle}
            </h3>
            <p className="text-xs text-[#5A5248] mt-1.5 leading-relaxed">
              {destructiveModal.description || t.destructiveModal.defaultDesc}
            </p>
          </div>
          <button
            onClick={closeDestructiveConfirm}
            className={`text-[#7C7267] hover:text-[#2B2621] p-1 rounded-md transition-colors cursor-pointer ${INTERACTION_CLASSES.focusRing}`}
            title={t.destructiveModal.cancel}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            ref={cancelBtnRef}
            onClick={closeDestructiveConfirm}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium text-[#5A5248] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer ${INTERACTION_CLASSES.focusRing}`}
          >
            {destructiveModal.cancelLabel || t.destructiveModal.cancel}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#B85F45] hover:bg-[#A3523B] text-white shadow-xs transition-all cursor-pointer ${INTERACTION_CLASSES.focusRing}`}
          >
            <Trash2 size={15} strokeWidth={1.75} />
            <span>{destructiveModal.confirmLabel || t.destructiveModal.confirm}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

