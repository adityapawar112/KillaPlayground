'use client';

import React from 'react';
import Image from 'next/image';
import { TbX, TbKeyboard } from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsModalOpen, setShortcutsModalOpen } = useEditorStore();
  const { t } = useTranslation();

  if (!isShortcutsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#F9F6F0] rounded-2xl border border-[#D9C9B4] shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9C9B4]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-[#4B382C] text-[#FAF8F5] flex items-center justify-center shadow-md p-1 shrink-0">
              <Image
                src="/killaplayground-tranparent.png"
                alt="The Killa Playground Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#2B1E16] font-yatra tracking-wide">
                {t.shortcutsModal.title}
              </h2>
              <p className="text-xs text-[#8D7666]">
                Tactile 3D diorama navigation & sculpting keys
              </p>
            </div>
          </div>

          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8D7666] hover:bg-[#DFCDBD] hover:text-[#2B1E16] transition-colors cursor-pointer"
          >
            <TbX className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto py-4 space-y-5 flex-1 pr-1">
          {/* Mouse & Navigation Controls */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B85F45] mb-2.5">
              {t.shortcutsModal.cameraNav}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {t.shortcutsModal.cameraKeys.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#F2EBE1] border border-[#D9C9B4]/80"
                >
                  <span className="text-[#634E40]">{item.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#EADECF] text-[#2B1E16] font-mono font-semibold text-[11px] border border-[#D9C9B4]">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Number Keys */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B85F45] mb-2.5">
              {t.shortcutsModal.toolsNav}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {t.shortcutsModal.toolKeys.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#F2EBE1] border border-[#D9C9B4]/80"
                >
                  <span className="text-[#634E40]">{item.desc}</span>
                  <kbd className="w-6 h-6 flex items-center justify-center rounded bg-[#EADECF] text-[#2B1E16] font-mono font-bold text-xs border border-[#D9C9B4]">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Editing Actions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#B85F45] mb-2.5">
              {t.shortcutsModal.actions}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {t.shortcutsModal.actionKeys.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#F2EBE1] border border-[#D9C9B4]/80"
                >
                  <span className="text-[#634E40]">{item.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-[#EADECF] text-[#2B1E16] font-mono font-semibold text-[11px] border border-[#D9C9B4]">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#D9C9B4] flex justify-end">
          <button
            onClick={() => setShortcutsModalOpen(false)}
            className="px-5 py-2 rounded-xl bg-[#4B382C] text-[#FAF8F5] text-xs font-semibold hover:bg-[#322E2A] transition-colors cursor-pointer"
          >
            {t.posterModal.close}
          </button>
        </div>
      </div>
    </div>
  );
};
