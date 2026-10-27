'use client';

import React from 'react';
import { Undo2, Redo2, Flame, Sparkles, Shield, ChevronDown } from 'lucide-react';
import { useEditorStore } from '@/lib/state/useEditorStore';

interface TopNavBarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}) => {
  const {
    fortTitle,
    templateId,
    nightMode,
    toggleNightMode,
    setPosterModalOpen,
    setModeSelectModalOpen,
  } = useEditorStore();

  const templateNames: Record<string, string> = {
    raigad: 'किल्ले रायगड (Raigad)',
    janjira: 'मुरुड-जंजिरा (Janjira)',
    sinhagad: 'किल्ले सिंहगड (Sinhagad)',
    pratapgad: 'किल्ले प्रतापगड (Pratapgad)',
    vijaydurg: 'किल्ले विजयदुर्ग (Vijaydurg)',
    scratch: 'मुक्त रचना (Freeform)',
  };

  return (
    <header className="fixed top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      {/* Left cluster: Branding & Fort Title */}
      <div className="flex items-center gap-3 pointer-events-auto bg-[#F2EBE1]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#D9C9B4] shadow-md transition-all">
        <div className="w-8 h-8 rounded-full bg-[#B85F45] text-white flex items-center justify-center font-bold text-xs shadow-inner">
          <Shield className="w-4 h-4 text-[#FAF8F5]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-['Yatra_One'] text-base tracking-wide text-[#2B1E16]">
              {fortTitle || 'आमचा किल्ला'}
            </span>
            <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#EADECF] text-[#634E40]">
              Playground
            </span>
          </div>
        </div>
      </div>

      {/* Center cluster: Active Mode Pill */}
      <button
        onClick={() => setModeSelectModalOpen(true)}
        className="hidden md:flex items-center gap-2 pointer-events-auto bg-[#F2EBE1]/90 backdrop-blur-md hover:bg-[#DFCDBD] px-4 py-2 rounded-full border border-[#D9C9B4] shadow-md transition-all group cursor-pointer"
        title="Change Fort Template or Generate New Terrain"
      >
        <span className="w-2 h-2 rounded-full bg-[#E85D04] animate-pulse" />
        <span className="text-xs font-semibold text-[#4B382C]">
          {templateNames[templateId] || 'किल्ला रचना'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#8D7666] group-hover:translate-y-0.5 transition-transform" />
      </button>

      {/* Right cluster: Controls, Night Diya Mode & Finish CTA */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Undo / Redo Cluster */}
        <div className="flex items-center bg-[#F2EBE1]/90 backdrop-blur-md rounded-full border border-[#D9C9B4] shadow-md p-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              canUndo
                ? 'text-[#2B1E16] hover:bg-[#DFCDBD]'
                : 'text-[#B29E8E] cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-[#D9C9B4]" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              canRedo
                ? 'text-[#2B1E16] hover:bg-[#DFCDBD]'
                : 'text-[#B29E8E] cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Diwali Night Diya Toggle */}
        <button
          onClick={toggleNightMode}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border shadow-md backdrop-blur-md transition-all cursor-pointer ${
            nightMode
              ? 'bg-[#23211E] text-[#F59E0B] border-[#F59E0B] shadow-[#F59E0B]/20'
              : 'bg-[#F2EBE1]/90 text-[#634E40] border-[#D9C9B4] hover:bg-[#DFCDBD]'
          }`}
          title="Toggle Diwali Evening & Glowing Diyas"
        >
          <Flame
            className={`w-4 h-4 transition-transform ${
              nightMode ? 'scale-110 text-[#F59E0B] animate-pulse' : 'text-[#8D7666]'
            }`}
          />
          <span className="text-xs font-semibold hidden sm:inline">
            {nightMode ? 'दिवाळी संध्या' : 'दिवे लावा'}
          </span>
        </button>

        {/* Finish & Share Button */}
        <button
          onClick={() => setPosterModalOpen(true)}
          className="flex items-center gap-2 bg-[#E85D04] hover:bg-[#FF7722] active:scale-95 text-white px-4 py-2 rounded-full font-semibold text-xs shadow-lg shadow-[#E85D04]/35 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>किल्ला पूर्ण करा</span>
        </button>
      </div>
    </header>
  );
};
