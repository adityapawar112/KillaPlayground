'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  TbShield,
  TbChevronDown,
  TbFilePlus,
  TbDeviceFloppy,
  TbUpload,
  TbDownload,
  TbSparkles,
  TbArrowBackUp,
  TbArrowForwardUp,
  TbReload,
  TbLock,
  TbLockOpen,
  TbEye,
  TbFlame,
  TbKeyboard,
  TbHelp,
  TbCheck,
  TbLanguage,
  TbBuildingCastle,
  TbAdjustmentsHorizontal,
  TbMenu2,
  TbX,
} from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Locale } from '@/lib/i18n/translations';

interface AppMenuBarProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSetCameraView?: (view: 'top' | 'front' | 'side' | 'reset') => void;
}

const FORT_NAMES: Record<string, Record<Locale, string>> = {
  raigad: { en: 'Raigad Fort', mr: 'किल्ले रायगड', hi: 'रायगड किला' },
  janjira: { en: 'Murud-Janjira Sea Fort', mr: 'मुरुड-जंजिरा जलदुर्ग', hi: 'मुरुड-जंजीरा जलदुर्ग' },
  sinhagad: { en: 'Sinhagad Fort', mr: 'किल्ले सिंहगड', hi: 'सिंहगड किला' },
  pratapgad: { en: 'Pratapgad Fort', mr: 'किल्ले प्रतापगड', hi: 'प्रतापगड किला' },
  vijaydurg: { en: 'Vijaydurg Naval Fort', mr: 'विजयदुर्ग जलदुर्ग', hi: 'विजयदुर्ग नौसेना किला' },
  scratch: { en: 'Custom Fort', mr: 'स्वतःचा किल्ला', hi: 'कस्टम किला' },
};

type ActiveMenu = 'file' | 'edit' | 'view' | 'language' | 'help' | null;

export const AppMenuBar: React.FC<AppMenuBarProps> = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSetCameraView,
}) => {
  const {
    fortTitle,
    templateId,
    nightMode,
    toggleNightMode,
    mudLocked,
    setMudLocked,
    showLeftToolbar,
    toggleLeftToolbar,
    showContextualDock,
    toggleContextualDock,
    showBottomStatusBar,
    toggleBottomStatusBar,
    setPosterModalOpen,
    setResetConfirmOpen,
    setShortcutsModalOpen,
    setStartupModalOpen,
    setAboutModalOpen,
    isTerrainDrawerOpen,
    setTerrainDrawerOpen,
    saveProjectLocally,
    exportProjectData,
    importProjectData,
    setToastMessage,
    toastMessage,
  } = useEditorStore();

  const { t, locale, setLocale } = useTranslation();
  const displayFortTitle =
    FORT_NAMES[templateId]?.[locale] ||
    (templateId === 'scratch'
      ? locale === 'mr'
        ? 'स्वतःचा किल्ला'
        : locale === 'hi'
        ? 'कस्टम किला'
        : 'Custom Fort'
      : fortTitle);

  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut listener for Ctrl+S and Ctrl+N
  useEffect(() => {
    const handleMenuShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveProjectLocally();
        setToastMessage(t.startupModal.savedSuccess);
        setTimeout(() => setToastMessage(null), 3000);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setStartupModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleMenuShortcuts);
    return () => window.removeEventListener('keydown', handleMenuShortcuts);
  }, [saveProjectLocally, setStartupModalOpen, setToastMessage, t]);

  const handleExport = () => {
    const json = exportProjectData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (fortTitle || 'my_killa').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.href = url;
    a.download = `${safeName}.killa`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProjectData(content);
      if (success) {
        setToastMessage(t.startupModal.importSuccess);
      } else {
        setToastMessage(t.startupModal.invalidFormat);
      }
      setTimeout(() => setToastMessage(null), 3000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
  };

  const handleSave = () => {
    saveProjectLocally();
    setToastMessage(t.startupModal.savedSuccess);
    setTimeout(() => setToastMessage(null), 3000);
    setActiveMenu(null);
    setIsMobileMenuOpen(false);
  };

  // Auto-dismiss transient toast after 3.5 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage, setToastMessage]);

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none select-none">
      {/* Hidden file input for importing project files */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.killa"
        onChange={handleFileImport}
        className="hidden"
      />

      {/* Mobile Hamburger Drawer Overlay (< xl) */}
      {isMobileMenuOpen && (
        <div className="fixed top-[41px] left-0 bottom-0 right-0 z-40 flex xl:hidden pointer-events-auto">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over menu panel starting right below top bar */}
          <div className="relative w-80 max-w-[85vw] h-full bg-[#F5EDE3] border-r border-[#CDBCAB] shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Brand Header in Drawer */}
            <div className="p-3.5 border-b border-[#D8C7B5] bg-[#EADECF]/90 flex items-center gap-3">
              <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
                <Image
                  src="/killaplayground-tranparent.png"
                  alt="The Killa Playground Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain drop-shadow-xs"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-yatra text-base text-[#2B1E16] leading-tight">
                  The Killa Playground
                </span>
                <span className="text-[10px] text-[#8D7666] font-sans font-medium">
                  किल्ला प्लेग्राउंड • 3D Diorama
                </span>
              </div>
            </div>

            {/* Active Fort Selector Header in Drawer */}
            <div className="p-3 border-b border-[#D8C7B5] bg-[#ECE2D5]/70">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setTerrainDrawerOpen(true);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#EADECF] hover:bg-[#DFCDBD] text-[#4B382C] border border-[#D9C9B4] text-xs font-bold cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <TbBuildingCastle className="w-4 h-4 text-[#8F4938]" />
                  <span className="font-sans uppercase">{displayFortTitle}</span>
                </div>
                <span className="text-[10px] text-[#8D7666] uppercase bg-black/10 px-2 py-0.5 rounded">
                  Change
                </span>
              </button>
            </div>

            {/* Drawer Links & Controls */}
            <div className="flex-1 p-3 space-y-3.5 text-xs">
              {/* FILE SECTION */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8D7666] px-2">
                  {t.appMenuBar.file}
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setStartupModalOpen(true);
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <TbFilePlus className="w-4 h-4 text-[#B85F45]" />
                  <span>{t.appMenuBar.newCanvas}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setTerrainDrawerOpen(true, 'historical');
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <TbBuildingCastle className="w-4 h-4 text-[#4B382C]" />
                  <span>{t.modeModal.historicalTab}...</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setTerrainDrawerOpen(true, 'freeform');
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <TbAdjustmentsHorizontal className="w-4 h-4 text-[#8F4938]" />
                  <span>{t.modeModal.freeformTab}...</span>
                </button>
                <button
                  onClick={handleSave}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <TbDeviceFloppy className="w-4 h-4 text-[#777A57]" />
                  <span>{t.appMenuBar.saveCanvas}</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <TbUpload className="w-4 h-4 text-[#B58B63]" />
                  <span>{t.appMenuBar.importProject}</span>
                </button>
                <button
                  onClick={handleExport}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <TbDownload className="w-4 h-4 text-[#0284C7]" />
                  <span>{t.appMenuBar.exportProject}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setPosterModalOpen(true);
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#E85D04] font-bold hover:bg-[#EADECF] cursor-pointer"
                >
                  <TbSparkles className="w-4 h-4 text-[#E85D04]" />
                  <span>{t.appMenuBar.exportPoster}</span>
                </button>
              </div>

              {/* EDIT SECTION */}
              <div className="space-y-1 pt-2 border-t border-[#D8C7B5]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8D7666] px-2">
                  {t.appMenuBar.edit}
                </div>
                <button
                  onClick={() => {
                    onUndo?.();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={!canUndo}
                  className={`w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg ${
                    canUndo ? 'text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer' : 'text-[#B29E8E] cursor-not-allowed'
                  }`}
                >
                  <TbArrowBackUp className="w-4 h-4" />
                  <span>{t.appMenuBar.undo}</span>
                </button>
                <button
                  onClick={() => {
                    onRedo?.();
                    setIsMobileMenuOpen(false);
                  }}
                  disabled={!canRedo}
                  className={`w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg ${
                    canRedo ? 'text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer' : 'text-[#B29E8E] cursor-not-allowed'
                  }`}
                >
                  <TbArrowForwardUp className="w-4 h-4" />
                  <span>{t.appMenuBar.redo}</span>
                </button>
                <button
                  onClick={() => {
                    setMudLocked(!mudLocked);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  {mudLocked ? <TbLock className="w-4 h-4 text-[#B85F45]" /> : <TbLockOpen className="w-4 h-4 text-[#777A57]" />}
                  <span>{t.appMenuBar.mudLockToggle}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setResetConfirmOpen(true);
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#B85F45] font-semibold hover:bg-[#B85F45]/10 cursor-pointer"
                >
                  <TbReload className="w-4 h-4" />
                  <span>{t.appMenuBar.resetCanvas}</span>
                </button>
              </div>

              {/* VIEW SECTION */}
              <div className="space-y-1 pt-2 border-t border-[#D8C7B5]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8D7666] px-2">
                  {t.appMenuBar.view}
                </div>
                <button
                  onClick={() => {
                    toggleLeftToolbar();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center justify-between rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <TbEye className="w-4 h-4 text-[#634E40]" />
                    {t.appMenuBar.toggleLeftToolbar}
                  </span>
                  {showLeftToolbar && <TbCheck className="w-4 h-4 text-[#777A57]" />}
                </button>
                <button
                  onClick={() => {
                    toggleContextualDock();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center justify-between rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <TbEye className="w-4 h-4 text-[#634E40]" />
                    {t.appMenuBar.toggleContextual}
                  </span>
                  {showContextualDock && <TbCheck className="w-4 h-4 text-[#777A57]" />}
                </button>
                <button
                  onClick={() => {
                    toggleNightMode();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center justify-between rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <TbFlame className="w-4 h-4 text-[#F59E0B]" />
                    {t.appMenuBar.toggleNight}
                  </span>
                  {nightMode && <TbCheck className="w-4 h-4 text-[#F59E0B]" />}
                </button>
              </div>

              {/* LANGUAGE SECTION */}
              <div className="space-y-1 pt-2 border-t border-[#D8C7B5]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8D7666] px-2 flex items-center gap-1">
                  <TbLanguage className="w-3.5 h-3.5" />
                  <span>{t.appMenuBar.language}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 px-1">
                  {(['en', 'mr', 'hi'] as Locale[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLocale(lang);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold text-center transition-colors cursor-pointer ${
                        locale === lang ? 'bg-[#4B382C] text-white shadow-xs' : 'bg-[#EADECF] text-[#4B382C] hover:bg-[#DFCDBD]'
                      }`}
                    >
                      {lang === 'en' ? 'English' : lang === 'mr' ? 'मराठी' : 'हिन्दी'}
                    </button>
                  ))}
                </div>
              </div>

              {/* HELP SECTION */}
              <div className="space-y-1 pt-2 border-t border-[#D8C7B5]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#8D7666] px-2">
                  {t.appMenuBar.help}
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShortcutsModalOpen(true);
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <TbKeyboard className="w-4 h-4 text-[#B85F45]" />
                  <span>{t.appMenuBar.shortcuts}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setStartupModalOpen(true);
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#2B1E16] hover:bg-[#EADECF] cursor-pointer"
                >
                  <TbHelp className="w-4 h-4 text-[#777A57]" />
                  <span>{t.appMenuBar.tutorial}</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setAboutModalOpen(true);
                  }}
                  className="w-full px-2.5 py-2 text-left flex items-center gap-2.5 rounded-lg text-[#634E40] hover:bg-[#EADECF] cursor-pointer"
                >
                  <TbShield className="w-4 h-4 text-[#B85F45]" />
                  <span>{t.appMenuBar.about}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Application Desktop Menu Bar */}
      <header
        ref={menuBarRef}
        className="w-full bg-[#F2EBE1]/96 backdrop-blur-md border-b border-[#D9C9B4] px-2 sm:px-4 py-1 flex items-center justify-between pointer-events-auto shadow-sm relative z-50 h-[41px]"
      >
        {/* Left cluster: Hamburger + Logo & Title + Desktop Menus */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Hamburger Button (< xl): Shifts into X when menu is open */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-lg text-[#4B382C] hover:bg-[#DFCDBD] transition-colors cursor-pointer shrink-0"
            title={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {isMobileMenuOpen ? (
              <TbX className="w-5 h-5 text-[#8F4938]" />
            ) : (
              <TbMenu2 className="w-5 h-5" />
            )}
          </button>

          {/* Logo Icon & Permanent In-Flow Title */}
          <button
            onClick={() => setStartupModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-1.5 py-1 rounded-lg hover:bg-[#DFCDBD] transition-colors cursor-pointer group shrink-0"
            title="The Killa Playground - Open Hub"
          >
            <div className="relative w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shrink-0">
              <Image
                src="/killaplayground-tranparent.png"
                alt="The Killa Playground Logo"
                width={28}
                height={28}
                className="w-full h-full object-contain group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200 drop-shadow-xs"
                priority
              />
            </div>
            <span className="font-yatra text-base sm:text-lg text-[#2B1E16] tracking-wide whitespace-nowrap hidden sm:inline">
              The Killa Playground
            </span>
          </button>

          {/* Desktop Fort Selector Header Button (>= xl) */}
          <button
            onClick={() => {
              setActiveMenu(null);
              setTerrainDrawerOpen(!isTerrainDrawerOpen);
            }}
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isTerrainDrawerOpen
                ? 'bg-[#4B382C] text-white border-[#38281E] shadow-sm'
                : 'bg-[#EADECF] hover:bg-[#DFCDBD] text-[#4B382C] border-[#D9C9B4]'
            }`}
            title={t.modeModal.subtitle}
          >
            <TbBuildingCastle className={`w-3.5 h-3.5 ${isTerrainDrawerOpen ? 'text-[#F59E0B]' : 'text-[#8F4938]'}`} />
            <span className="tracking-wide uppercase font-sans">
              {displayFortTitle}
            </span>
            <TbChevronDown className={`w-3 h-3 transition-transform duration-200 ${
              isTerrainDrawerOpen ? 'rotate-180 text-[#F59E0B]' : 'text-[#8D7666]'
            }`} />
          </button>

          <div className="hidden xl:block w-[1px] h-4 bg-[#D9C9B4] mx-1" />

          {/* DESKTOP MENUS (>= xl) */}
          <div className="hidden xl:flex items-center gap-0.5">
            {/* FILE MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  activeMenu === 'file'
                    ? 'bg-[#4B382C] text-white'
                    : 'text-[#4B382C] hover:bg-[#DFCDBD]'
                }`}
              >
                {t.appMenuBar.file}
                <TbChevronDown className="w-3 h-3 text-[#8D7666]" />
              </button>
              {activeMenu === 'file' && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-[#F9F6F0] rounded-xl border border-[#D9C9B4] shadow-2xl py-1 z-50 text-xs">
                  <button
                    onClick={() => {
                      setStartupModalOpen(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <TbFilePlus className="w-4 h-4 text-[#B85F45]" />
                      {t.appMenuBar.newCanvas}
                    </span>
                    <kbd className="text-[10px] text-[#8D7666] font-mono">Ctrl+N</kbd>
                  </button>
                  <button
                    onClick={() => {
                      setTerrainDrawerOpen(true, 'historical');
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <TbBuildingCastle className="w-4 h-4 text-[#4B382C]" />
                    <span>{t.modeModal.historicalTab}...</span>
                  </button>
                  <button
                    onClick={() => {
                      setTerrainDrawerOpen(true, 'freeform');
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <TbAdjustmentsHorizontal className="w-4 h-4 text-[#8F4938]" />
                    <span>{t.modeModal.freeformTab}...</span>
                  </button>
                  <div className="my-1 border-t border-[#D9C9B4]" />
                  <button
                    onClick={handleSave}
                    className="w-full px-3.5 py-2 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <TbDeviceFloppy className="w-4 h-4 text-[#777A57]" />
                      {t.appMenuBar.saveCanvas}
                    </span>
                    <kbd className="text-[10px] text-[#8D7666] font-mono">Ctrl+S</kbd>
                  </button>
                  <div className="my-1 border-t border-[#D9C9B4]" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <TbUpload className="w-4 h-4 text-[#B58B63]" />
                    {t.appMenuBar.importProject}
                  </button>
                  <button
                    onClick={handleExport}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <TbDownload className="w-4 h-4 text-[#0284C7]" />
                    {t.appMenuBar.exportProject}
                  </button>
                  <div className="my-1 border-t border-[#D9C9B4]" />
                  <button
                    onClick={() => {
                      setPosterModalOpen(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#E85D04] font-semibold hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <TbSparkles className="w-4 h-4 text-[#E85D04]" />
                    {t.appMenuBar.exportPoster}
                  </button>
                </div>
              )}
            </div>

            {/* EDIT MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  activeMenu === 'edit'
                    ? 'bg-[#4B382C] text-white'
                    : 'text-[#4B382C] hover:bg-[#DFCDBD]'
                }`}
              >
                {t.appMenuBar.edit}
                <TbChevronDown className="w-3 h-3 text-[#8D7666]" />
              </button>
              {activeMenu === 'edit' && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-[#F9F6F0] rounded-xl border border-[#D9C9B4] shadow-2xl py-1 z-50 text-xs">
                  <button
                    onClick={() => {
                      onUndo?.();
                      setActiveMenu(null);
                    }}
                    disabled={!canUndo}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors ${
                      canUndo
                        ? 'text-[#2B1E16] hover:bg-[#DFCDBD] cursor-pointer'
                        : 'text-[#B29E8E] cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <TbArrowBackUp className="w-4 h-4" />
                      {t.appMenuBar.undo}
                    </span>
                    <kbd className="text-[10px] text-[#8D7666] font-mono">Ctrl+Z</kbd>
                  </button>
                  <button
                    onClick={() => {
                      onRedo?.();
                      setActiveMenu(null);
                    }}
                    disabled={!canRedo}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors ${
                      canRedo
                        ? 'text-[#2B1E16] hover:bg-[#DFCDBD] cursor-pointer'
                        : 'text-[#B29E8E] cursor-not-allowed'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <TbArrowForwardUp className="w-4 h-4" />
                      {t.appMenuBar.redo}
                    </span>
                    <kbd className="text-[10px] text-[#8D7666] font-mono">Ctrl+Y</kbd>
                  </button>
                  <div className="my-1 border-t border-[#D9C9B4]" />
                  <button
                    onClick={() => {
                      setMudLocked(!mudLocked);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      {mudLocked ? (
                        <TbLock className="w-4 h-4 text-[#B85F45]" />
                      ) : (
                        <TbLockOpen className="w-4 h-4 text-[#777A57]" />
                      )}
                      {t.appMenuBar.mudLockToggle}
                    </span>
                    <kbd className="text-[10px] text-[#8D7666] font-mono">L</kbd>
                  </button>
                  <div className="my-1 border-t border-[#D9C9B4]" />
                  <button
                    onClick={() => {
                      setResetConfirmOpen(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#B85F45] font-semibold hover:bg-[#B85F45]/10 transition-colors cursor-pointer"
                  >
                    <TbReload className="w-4 h-4" />
                    {t.appMenuBar.resetCanvas}
                  </button>
                </div>
              )}
            </div>

            {/* VIEW MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  activeMenu === 'view'
                    ? 'bg-[#4B382C] text-white'
                    : 'text-[#4B382C] hover:bg-[#DFCDBD]'
                }`}
              >
                {t.appMenuBar.view}
                <TbChevronDown className="w-3 h-3 text-[#8D7666]" />
              </button>
              {activeMenu === 'view' && (
                <div className="absolute top-full left-0 mt-1 w-60 bg-[#F9F6F0] rounded-xl border border-[#D9C9B4] shadow-2xl py-1 z-50 text-xs">
                  <button
                    onClick={toggleLeftToolbar}
                    className="w-full px-3.5 py-2 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <TbEye className="w-4 h-4 text-[#634E40]" />
                      {t.appMenuBar.toggleLeftToolbar}
                    </span>
                    {showLeftToolbar && <TbCheck className="w-4 h-4 text-[#777A57]" />}
                  </button>
                  <button
                    onClick={toggleContextualDock}
                    className="w-full px-3.5 py-2 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <TbEye className="w-4 h-4 text-[#634E40]" />
                      {t.appMenuBar.toggleContextual}
                    </span>
                    {showContextualDock && <TbCheck className="w-4 h-4 text-[#777A57]" />}
                  </button>
                  <button
                    onClick={toggleBottomStatusBar}
                    className="w-full px-3.5 py-2 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <TbEye className="w-4 h-4 text-[#634E40]" />
                      {t.appMenuBar.toggleBottomStrip}
                    </span>
                    {showBottomStatusBar && <TbCheck className="w-4 h-4 text-[#777A57]" />}
                  </button>
                  <div className="my-1 border-t border-[#D9C9B4]" />
                  <button
                    onClick={toggleNightMode}
                    className="w-full px-3.5 py-2 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <TbFlame className="w-4 h-4 text-[#F59E0B]" />
                      {t.appMenuBar.toggleNight}
                    </span>
                    <kbd className="text-[10px] text-[#8D7666] font-mono">N</kbd>
                  </button>
                  <div className="my-1 border-t border-[#D9C9B4]" />
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8D7666]">
                    {t.appMenuBar.cameraViews}
                  </div>
                  <button
                    onClick={() => {
                      onSetCameraView?.('top');
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-1.5 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span>{t.appMenuBar.viewTop}</span>
                  </button>
                  <button
                    onClick={() => {
                      onSetCameraView?.('front');
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-1.5 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span>{t.appMenuBar.viewFront}</span>
                  </button>
                  <button
                    onClick={() => {
                      onSetCameraView?.('side');
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-1.5 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span>{t.appMenuBar.viewSide}</span>
                  </button>
                  <button
                    onClick={() => {
                      onSetCameraView?.('reset');
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-1.5 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span>{t.appMenuBar.viewReset}</span>
                  </button>
                </div>
              )}
            </div>

            {/* LANGUAGE MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'language' ? null : 'language')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  activeMenu === 'language'
                    ? 'bg-[#4B382C] text-white'
                    : 'text-[#4B382C] hover:bg-[#DFCDBD]'
                }`}
              >
                {t.appMenuBar.language}
                <TbChevronDown className="w-3 h-3 text-[#8D7666]" />
              </button>
              {activeMenu === 'language' && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-[#F9F6F0] rounded-xl border border-[#D9C9B4] shadow-2xl py-1 z-50 text-xs">
                  {(['en', 'mr', 'hi'] as Locale[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setLocale(lang);
                        setActiveMenu(null);
                      }}
                      className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                        locale === lang
                          ? 'bg-[#4B382C] text-white font-bold'
                          : 'text-[#2B1E16] hover:bg-[#DFCDBD]'
                      }`}
                    >
                      <span>
                        {lang === 'en'
                          ? 'English'
                          : lang === 'mr'
                          ? 'मराठी'
                          : 'हिन्दी'}
                      </span>
                      {locale === lang && <TbCheck className="w-4 h-4 text-[#F59E0B]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* HELP MENU */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                  activeMenu === 'help'
                    ? 'bg-[#4B382C] text-white'
                    : 'text-[#4B382C] hover:bg-[#DFCDBD]'
                }`}
              >
                {t.appMenuBar.help}
                <TbChevronDown className="w-3 h-3 text-[#8D7666]" />
              </button>
              {activeMenu === 'help' && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-[#F9F6F0] rounded-xl border border-[#D9C9B4] shadow-2xl py-1 z-50 text-xs">
                  <button
                    onClick={() => {
                      setShortcutsModalOpen(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center justify-between text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <TbKeyboard className="w-4 h-4 text-[#B85F45]" />
                      {t.appMenuBar.shortcuts}
                    </span>
                    <kbd className="text-[10px] text-[#8D7666] font-mono">?</kbd>
                  </button>
                  <button
                    onClick={() => {
                      setStartupModalOpen(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <TbHelp className="w-4 h-4 text-[#777A57]" />
                    {t.appMenuBar.tutorial}
                  </button>
                  <div className="my-1 border-t border-[#D9C9B4]" />
                  <button
                    onClick={() => {
                      setAboutModalOpen(true);
                      setActiveMenu(null);
                    }}
                    className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                  >
                    <TbShield className="w-4 h-4 text-[#B85F45]" />
                    <span>{t.appMenuBar.about}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right cluster: Quick Action Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Language Pill (hidden on narrow screens to prevent crowding) */}
          <div className="hidden lg:flex items-center bg-[#EADECF] rounded-lg p-0.5 border border-[#D9C9B4]">
            {(['en', 'mr', 'hi'] as Locale[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLocale(lang)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  locale === lang
                    ? 'bg-[#4B382C] text-[#FAF8F5] shadow-xs'
                    : 'text-[#8D7666] hover:text-[#2B1E16]'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'mr' ? 'म' : 'हि'}
              </button>
            ))}
          </div>

          {/* Quick Undo / Redo / Reset */}
          <div className="flex items-center bg-[#EADECF] rounded-lg p-0.5 border border-[#D9C9B4]">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1 rounded transition-colors ${
                canUndo ? 'text-[#2B1E16] hover:bg-[#DFCDBD] cursor-pointer' : 'text-[#B29E8E] cursor-not-allowed'
              }`}
              title={t.appMenuBar.undo}
            >
              <TbArrowBackUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1 rounded transition-colors ${
                canRedo ? 'text-[#2B1E16] hover:bg-[#DFCDBD] cursor-pointer' : 'text-[#B29E8E] cursor-not-allowed'
              }`}
              title={t.appMenuBar.redo}
            >
              <TbArrowForwardUp className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3.5 bg-[#D9C9B4] mx-0.5" />
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="p-1 rounded text-[#B85F45] hover:bg-[#B85F45]/15 transition-colors cursor-pointer"
              title={t.appMenuBar.resetCanvas}
            >
              <TbReload className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Night Diya Toggle */}
          <button
            onClick={toggleNightMode}
            className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
              nightMode
                ? 'bg-[#23211E] text-[#F59E0B] border-[#F59E0B]'
                : 'bg-[#EADECF] text-[#634E40] border-[#D9C9B4] hover:bg-[#DFCDBD]'
            }`}
            title="Toggle Diwali Night Diya Mode (N)"
          >
            <TbFlame className={`w-3.5 h-3.5 ${nightMode ? 'text-[#F59E0B] animate-pulse' : 'text-[#8D7666]'}`} />
            <span className="hidden md:inline text-[11px]">{nightMode ? t.nightModeOn : t.nightModeOff}</span>
          </button>

          {/* Finish & Share CTA */}
          <button
            onClick={() => setPosterModalOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 bg-[#E85D04] hover:bg-[#FF7722] active:scale-95 text-white px-2.5 sm:px-3 py-1 rounded-lg font-bold text-xs shadow-md shadow-[#E85D04]/30 transition-all cursor-pointer"
          >
            <TbSparkles className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.finishKilla}</span>
          </button>
        </div>
      </header>

      {/* Transient Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 z-50 flex items-center gap-2.5 px-4 py-2 bg-[#23211E]/95 text-white text-xs font-semibold rounded-xl shadow-2xl border border-[#FAF8F5]/20 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-0.5 hover:bg-white/20 rounded-md transition-colors text-white/70 hover:text-white cursor-pointer"
            title="Dismiss notification"
          >
            <TbX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
