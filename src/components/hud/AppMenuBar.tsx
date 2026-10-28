'use client';

import React, { useState, useRef, useEffect } from 'react';
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
    isTerrainDrawerOpen,
    setTerrainDrawerOpen,
    saveProjectLocally,
    exportProjectData,
    importProjectData,
    setToastMessage,
    toastMessage,
  } = useEditorStore();

  const { t, locale, setLocale } = useTranslation();
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>(null);
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
  };

  const handleSave = () => {
    saveProjectLocally();
    setToastMessage(t.startupModal.savedSuccess);
    setTimeout(() => setToastMessage(null), 3000);
    setActiveMenu(null);
  };

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

      {/* Top Application Desktop Menu Bar */}
      <header
        ref={menuBarRef}
        className="w-full bg-[#F2EBE1]/96 backdrop-blur-md border-b border-[#D9C9B4] px-4 py-1.5 flex items-center justify-between pointer-events-auto shadow-sm"
      >
        {/* Left cluster: Application Menus (File, Edit, View, Language, Help) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Logo Icon */}
          <button
            onClick={() => setStartupModalOpen(true)}
            className="flex items-center gap-1.5 mr-2 px-2 py-1 rounded-lg hover:bg-[#DFCDBD] transition-colors cursor-pointer group"
            title="The Killa Playground - Open Hub"
          >
            <div className="w-6 h-6 rounded-lg bg-[#B85F45] text-white flex items-center justify-center font-bold text-xs shadow-inner group-hover:scale-105 transition-transform">
              <TbShield className="w-3.5 h-3.5 text-[#FAF8F5]" />
            </div>
          </button>

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
                  <span>Historical Forts (किल्ले)...</span>
                </button>
                <button
                  onClick={() => {
                    setTerrainDrawerOpen(true, 'freeform');
                    setActiveMenu(null);
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#2B1E16] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                >
                  <TbAdjustmentsHorizontal className="w-4 h-4 text-[#8F4938]" />
                  <span>Terrain Generation Settings...</span>
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
                        ? 'English (EN)'
                        : lang === 'mr'
                        ? 'मराठी (MR)'
                        : 'हिन्दी (HI)'}
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
                    alert(
                      'The Killa Playground v1.0\nA tactile 3D diorama workspace celebrating the Maharashtrian Diwali folk tradition of crafting miniature mud forts.\nBuilt with Three.js, React Three Fiber & Next.js.'
                    );
                    setActiveMenu(null);
                  }}
                  className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-[#8D7666] hover:bg-[#DFCDBD] transition-colors cursor-pointer"
                >
                  {t.appMenuBar.about}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right cluster: Quick Action Pills */}
        <div className="flex items-center gap-2">
          {/* Quick Language Pill */}
          <div className="hidden sm:flex items-center bg-[#EADECF] rounded-lg p-0.5 border border-[#D9C9B4]">
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
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
            className="flex items-center gap-1.5 bg-[#E85D04] hover:bg-[#FF7722] active:scale-95 text-white px-3 py-1 rounded-lg font-bold text-xs shadow-md shadow-[#E85D04]/30 transition-all cursor-pointer"
          >
            <TbSparkles className="w-3.5 h-3.5" />
            <span>{t.finishKilla}</span>
          </button>
        </div>
      </header>

      {/* Banner Row: Centered "The Killa Playground" Title + Left-Aligned Subtitle & Fort Dropdown Trigger */}
      <div className="relative w-full px-4 mt-2 flex items-center justify-between pointer-events-none select-none">
        {/* Left Side: Fort Selector Subtitle Dropdown Trigger (Moved to the left!) */}
        <div className="pointer-events-auto z-30">
          <button
            onClick={() => setTerrainDrawerOpen(!isTerrainDrawerOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm group active:scale-95 ${
              isTerrainDrawerOpen
                ? 'bg-[#4B382C] text-white border-[#38281E] shadow-md ring-2 ring-[#4B382C]/20'
                : 'bg-[#F2EBE1]/92 hover:bg-[#EADECF] text-[#4B382C] border-[#D9C9B4]'
            }`}
            title="Click to choose Historical Forts or Freeform Terrain"
          >
            <TbBuildingCastle className={`w-4 h-4 ${isTerrainDrawerOpen ? 'text-[#F59E0B]' : 'text-[#8F4938]'}`} />
            <span className="text-xs font-bold font-sans tracking-wide uppercase">
              {fortTitle}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E85D04]" />
            <span className={`text-[11px] font-sans font-medium hidden sm:inline ${
              isTerrainDrawerOpen ? 'text-white/85' : 'text-[#777A57]'
            }`}>
              दिवाळी मातीचा किल्ला कार्यशाळा
            </span>
            <TbChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isTerrainDrawerOpen ? 'rotate-180 text-[#F59E0B]' : 'text-[#8D7666]'
            }`} />
          </button>
        </div>

        {/* Center: "The Killa Playground" Website Title (Always centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none text-center">
          <h1 className="font-yatra text-2xl sm:text-3xl text-[#2B1E16] drop-shadow-sm tracking-wide leading-tight">
            The Killa Playground
          </h1>
        </div>

        {/* Right side spacer to balance layout */}
        <div className="w-24 hidden md:block" />
      </div>

      {/* Transient Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 z-50 px-4 py-2 bg-[#23211E] text-white text-xs font-semibold rounded-xl shadow-2xl border border-[#FAF8F5]/20 animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
