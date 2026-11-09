'use client';

import React from 'react';
import Image from 'next/image';
import { X, Keyboard } from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setShortcutsModalOpen } = useEditorStore();
  const { t } = useTranslation();

  if (!isShortcutsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-[#EBE6DC] rounded-2xl border border-[#D8D1C5] shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D8D1C5]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-[#2B2621] text-[#FAF8F5] flex items-center justify-center shadow-sm p-1 shrink-0">
              <Image
                src="/killaplayground-tranparent.png"
                alt="The Killa Playground Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2B2621] font-yatra tracking-wide">
                {t.shortcutsModal.title}
              </h2>
              <p className="text-xs text-[#7C7267] font-sans">
                {t.shortcutsModal.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#7C7267] hover:bg-[#D8D1C5] hover:text-[#2B2621] transition-colors cursor-pointer"
            title={t.common.close}
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {/* Mouse & Navigation Controls */}
          <div>
            <h3 className="text-xs font-semibold text-[#B85F45] tracking-wide mb-2.5">
              {t.shortcutsModal.cameraNav}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {t.shortcutsModal.cameraKeys.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-md bg-[#FAF8F5] border border-[#D8D1C5]"
                >
                  <span className="text-[#5A5248] text-[11px] font-medium">{item.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#EBE6DC] text-[#2B2621] font-mono font-semibold text-[11px] tabular-nums border border-[#D8D1C5]">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Number Keys */}
          <div>
            <h3 className="text-xs font-semibold text-[#B85F45] tracking-wide mb-2.5">
              {t.shortcutsModal.toolsNav}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {t.shortcutsModal.toolKeys.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-md bg-[#FAF8F5] border border-[#D8D1C5]"
                >
                  <span className="text-[#5A5248] text-[11px] font-medium">{item.desc}</span>
                  <kbd className="w-6 h-6 flex items-center justify-center rounded bg-[#EBE6DC] text-[#2B2621] font-mono font-bold text-[11px] tabular-nums border border-[#D8D1C5]">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Editing Actions */}
          <div>
            <h3 className="text-xs font-semibold text-[#B85F45] tracking-wide mb-2.5">
              {t.shortcutsModal.actions}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {t.shortcutsModal.actionKeys.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-md bg-[#FAF8F5] border border-[#D8D1C5]"
                >
                  <span className="text-[#5A5248] text-[11px] font-medium">{item.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#EBE6DC] text-[#2B2621] font-mono font-semibold text-[11px] tabular-nums border border-[#D8D1C5]">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#D8D1C5] flex justify-end">
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="px-4 py-1.5 rounded-md bg-[#2B2621] text-[#FAF8F5] text-xs font-semibold hover:bg-[#38322B] transition-colors cursor-pointer"
          >
            {t.posterModal.close}
          </button>
        </div>
      </div>
    </div>
  );
};
