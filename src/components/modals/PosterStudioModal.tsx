'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TbX,
  TbDownload,
  TbShare,
  TbCopy,
  TbRefresh,
  TbCamera,
  TbTrash,
  TbCheck,
  TbPhoto,
  TbGridDots,
  TbTypography,
  TbPalette,
  TbBrandWhatsapp,
  TbBrandX,
  TbSunrise,
  TbSun,
  TbSunset,
  TbFlame,
} from 'react-icons/tb';
import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Locale } from '@/lib/i18n/translations';
import {
  POSTER_TEMPLATES,
  PosterTemplateId,
  ImageCount,
  GridLayoutType,
  getAvailableGridLayouts,
} from '@/lib/poster/posterTemplates';
import {
  captureHeadlessSnapshot,
  CameraPerspectiveId,
  CAMERA_PERSPECTIVES,
  TimePresetId,
} from '@/lib/poster/posterSnapshotEngine';
import {
  composeFestivePoster,
  preloadTemplateAssets,
  PosterTextOptions,
} from '@/lib/poster/posterCompositor';
import {
  downloadPosterBlob,
  sharePosterFile,
  copyPosterToClipboard,
  getSocialShareLinks,
} from '@/lib/poster/posterShare';
import {
  listLocalScreenshots,
  deleteLocalScreenshot,
  clearAllLocalScreenshots,
  LocalScreenshot,
} from '@/lib/persistence/screenshotVault';

interface SlotSourceConfig {
  type: 'perspective' | 'current' | 'gallery';
  perspectiveId?: CameraPerspectiveId;
  timePreset: TimePresetId;
  galleryDataUrl?: string;
}

const TIME_PRESET_OPTIONS: TimePresetId[] = ['dawn', 'noon', 'sunset', 'night'];

const getRandomizedTimePresets = (): TimePresetId[] => {
  const array: TimePresetId[] = ['dawn', 'noon', 'sunset', 'night'];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Locale-specific presets
const LOCALE_PRESETS = {
  en: {
    titles: [
      'The Killa Playground',
      'Fort Raigad',
      'Fort Murud-Janjira',
      'Fort Sinhagad',
      'Our Diwali Fort',
    ],
    defaultTitle: 'The Killa Playground',
    defaultBuilder: 'Mavala',
    greetings: [
      'Happy Diwali & Prosperous New Year',
      'Happy Diwali',
      'Warm Festive Wishes',
      '',
    ],
    defaultGreeting: 'Happy Diwali & Prosperous New Year',
    creditLine: (name: string) => `Created by: ${name} • Diwali 2026`,
    perspectives: {
      isometric: 'Isometric (45°)',
      top: "Bird's Eye",
      rampart: 'Rampart Eye',
      bastion: 'Bastion Hero',
    },
    times: {
      dawn: 'Dawn (06:00)',
      noon: 'Noon (12:00)',
      sunset: 'Golden Hour',
      night: 'Diwali Night',
    },
    grids: {
      'single': '1 Frame',
      'stack-2': '2 Rows',
      'cols-2': '2 Columns',
      'stack-3': '3 Rows',
      'hero-top-2-bottom': '1 Hero + 2 Split',
      'hero-bottom-2-top': '2 Split + 1 Hero',
      'stack-4': '4 Rows (Default)',
      'quad-4': '2×2 Quad Grid',
      'hero-top-3-stack': '1 Hero + 3 Rows',
    },
    banners: {
      'traditional-banner': 'Bottom Banner',
      'minimal-stamp': 'Corner Stamp',
      'royal-plaque': 'Royal Plaque',
      'none': 'Pure Artwork',
    },
    cleanNone: 'None (Clean)',
  },
  mr: {
    titles: [
      'माझा किल्ला',
      'किल्ले रायगड',
      'किल्ले मुरुड जंजिरा',
      'किल्ले सिंहगड',
      'आमचा किल्ला',
    ],
    defaultTitle: 'माझा किल्ला',
    defaultBuilder: 'मावळा',
    greetings: [
      'दिवाळीच्या हार्दिक शुभेच्छा',
      'दीपावलीच्या मनःपूर्वक शुभेच्छा',
      'हर हर महादेव • जय भवानी, जय शिवाजी',
      '',
    ],
    defaultGreeting: 'दिवाळीच्या हार्दिक शुभेच्छा',
    creditLine: (name: string) => `निर्मिती: ${name} • दिवाळी २०२६`,
    perspectives: {
      isometric: 'त्रिमितीय देखावा (४५°)',
      top: 'विहंगम देखावा',
      rampart: 'तटबंदी देखावा',
      bastion: 'बुरुज देखावा',
    },
    times: {
      dawn: 'पहाट (०६:००)',
      noon: 'दुपार (१२:००)',
      sunset: 'गोधूलि (१७:३०)',
      night: 'दिवाळी रात्र',
    },
    grids: {
      'single': '१ चौकट',
      'stack-2': '२ पट्ट्या',
      'cols-2': '२ स्तंभ',
      'stack-3': '३ पट्ट्या',
      'hero-top-2-bottom': '१ मुख्य + २ पट्ट्या',
      'hero-bottom-2-top': '२ पट्ट्या + १ मुख्य',
      'stack-4': '४ पट्ट्या (मूळ)',
      'quad-4': '२×२ चौकोन',
      'hero-top-3-stack': '१ मुख्य + ३ पट्ट्या',
    },
    banners: {
      'traditional-banner': 'तळ पट्टी',
      'minimal-stamp': 'कोपरा मुद्रा',
      'royal-plaque': 'राजकीय शिलालेख',
      'none': 'केवळ कलाकृती',
    },
    cleanNone: 'काही नाही (स्वच्छ)',
  },
  hi: {
    titles: [
      'मेरा किला',
      'किला रायगढ़',
      'किला मुरुड जंजीरा',
      'किला सिंहगढ़',
      'हमारा किला',
    ],
    defaultTitle: 'मेरा किला',
    defaultBuilder: 'मावला',
    greetings: [
      'शुभ दीपावली',
      'दीपावली की हार्दिक शुभकामनाएं',
      'हैप्पी दिवाली',
      '',
    ],
    defaultGreeting: 'शुभ दीपावली',
    creditLine: (name: string) => `रचना: ${name} • दिवाली २०२६`,
    perspectives: {
      isometric: 'त्रिविमीय दृश्य (४५°)',
      top: 'विहंगम दृश्य',
      rampart: 'परकोटा दृश्य',
      bastion: 'बुर्ज दृश्य',
    },
    times: {
      dawn: 'उषाकाल (06:00)',
      noon: 'दोपहर (12:00)',
      sunset: 'गोधूलि (17:30)',
      night: 'दिवाली रात',
    },
    grids: {
      'single': '1 फ्रेम',
      'stack-2': '2 पंक्तियाँ',
      'cols-2': '2 कॉलम',
      'stack-3': '3 पंक्तियाँ',
      'hero-top-2-bottom': '1 मुख्य + 2 पंक्तियाँ',
      'hero-bottom-2-top': '2 पंक्तियाँ + 1 मुख्य',
      'stack-4': '4 पंक्तियाँ (मूल)',
      'quad-4': '2×2 चौकोर',
      'hero-top-3-stack': '1 मुख्य + 3 पंक्तियाँ',
    },
    banners: {
      'traditional-banner': 'निचली पट्टी',
      'minimal-stamp': 'कोना मुहर',
      'royal-plaque': 'राजकीय शिलालेख',
      'none': 'केवल कलाकृति',
    },
    cleanNone: 'कोई नहीं (खाली)',
  },
};

export const PosterStudioModal: React.FC = () => {
  const { isPosterModalOpen, setPosterModalOpen, setToastMessage } = useEditorStore();
  const { t, locale, setLocale } = useTranslation();
  const presets = LOCALE_PRESETS[locale] || LOCALE_PRESETS.en;

  // 1. Template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<PosterTemplateId>('archway_cannon');

  // 2. Image count & Grid layout
  const [imageCount, setImageCount] = useState<ImageCount>(4);
  const [gridLayout, setGridLayout] = useState<GridLayoutType>('stack-4');

  // 3. Slot source assignments (up to 4 slots) with randomized diurnal time presets
  const [slotSources, setSlotSources] = useState<SlotSourceConfig[]>(() => {
    const randomTimes = getRandomizedTimePresets();
    return [
      { type: 'perspective', perspectiveId: 'isometric', timePreset: randomTimes[0] },
      { type: 'perspective', perspectiveId: 'rampart', timePreset: randomTimes[1] },
      { type: 'perspective', perspectiveId: 'bastion', timePreset: randomTimes[2] },
      { type: 'perspective', perspectiveId: 'top', timePreset: randomTimes[3] },
    ];
  });

  // Which slot has its inline gallery open (null = closed)
  const [activeGallerySlotIndex, setActiveGallerySlotIndex] = useState<number | null>(null);

  // 4. Rendered canvases per slot
  const [slotCanvases, setSlotCanvases] = useState<(HTMLCanvasElement | null)[]>([null, null, null, null]);

  // 5. Typography and personalization (initialized according to current locale)
  const [fortTitle, setFortTitle] = useState<string>(presets.defaultTitle);
  const [builderName, setBuilderName] = useState<string>(presets.defaultBuilder);
  const [festiveGreeting, setFestiveGreeting] = useState<string>(presets.defaultGreeting);
  const [stampStyle, setStampStyle] = useState<'traditional-banner' | 'minimal-stamp' | 'royal-plaque' | 'none'>('traditional-banner');
  const [showBuilderCredit, setShowBuilderCredit] = useState<boolean>(true);

  // 6. Local screenshot gallery
  const [galleryScreenshots, setGalleryScreenshots] = useState<LocalScreenshot[]>([]);

  // Confirmation Dialog state for screenshot deletion & clear-all
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'clear-all' | 'delete-single';
    screenshotId?: string;
  }>({
    isOpen: false,
    type: 'clear-all',
  });

  // 7. Preview and export state
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isCompositing, setIsCompositing] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const previewContainerRef = useRef<HTMLDivElement>(null);
  const slotRequestVersions = useRef<number[]>([0, 0, 0, 0]);
  const initialCapturedRef = useRef(false);

  // Synchronize locale changes to default inputs if user hasn't heavily customized
  useEffect(() => {
    const curPresets = LOCALE_PRESETS[locale] || LOCALE_PRESETS.en;
    setFortTitle(curPresets.defaultTitle);
    setBuilderName(curPresets.defaultBuilder);
    setFestiveGreeting(curPresets.defaultGreeting);
  }, [locale]);

  // Load local screenshot gallery on modal open
  const refreshGallery = useCallback(async () => {
    try {
      const shots = await listLocalScreenshots();
      setGalleryScreenshots(shots);
    } catch (err) {
      console.warn('Failed to load local screenshot gallery:', err);
    }
  }, []);

  useEffect(() => {
    if (isPosterModalOpen) {
      refreshGallery();
    }
  }, [isPosterModalOpen, refreshGallery]);

  // Ensure grid layout matches image count
  useEffect(() => {
    const available = getAvailableGridLayouts(imageCount);
    if (!available.some((g) => g.id === gridLayout)) {
      setGridLayout(available[0].id);
    }
  }, [imageCount, gridLayout]);

  // Capture single slot canvas cleanly given its source with authentic diurnal lighting & sky
  const captureSingleSlotCanvas = useCallback(async (source: SlotSourceConfig): Promise<HTMLCanvasElement | null> => {
    if (source.type === 'gallery' && source.galleryDataUrl) {
      const img = new Image();
      img.src = source.galleryDataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
      const c = document.createElement('canvas');
      c.width = img.width || 1080;
      c.height = img.height || 340;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      return c;
    }

    const timePreset = source.timePreset || 'noon';

    if (source.type === 'current') {
      return await captureHeadlessSnapshot({
        perspective: 'current',
        timePreset,
        width: 1080,
        height: 340,
      });
    }

    const pId = source.perspectiveId || 'isometric';
    return await captureHeadlessSnapshot({
      perspective: pId,
      timePreset,
      width: 1080,
      height: 340,
    });
  }, []);

  // Atomic update for a single slot's source & canvas (No race conditions, no bouncing!)
  const updateSlot = useCallback(
    async (slotIdx: number, newSource: SlotSourceConfig) => {
      const version = ++slotRequestVersions.current[slotIdx];

      setSlotSources((prev) => {
        const next = [...prev];
        next[slotIdx] = newSource;
        return next;
      });

      try {
        setIsCapturing(true);
        const canvas = await captureSingleSlotCanvas(newSource);
        // Only commit if this is still the most recent request for this slot
        if (slotRequestVersions.current[slotIdx] === version) {
          setSlotCanvases((prev) => {
            const next = [...prev];
            next[slotIdx] = canvas;
            return next;
          });
        }
      } catch (err) {
        console.error(`Failed to capture slot ${slotIdx + 1}:`, err);
      } finally {
        setIsCapturing(false);
      }
    },
    [captureSingleSlotCanvas]
  );

  // Capture snapshots for all active slots (initial open or user-requested Recapture All)
  const captureAllSlots = useCallback(async () => {
    setIsCapturing(true);
    try {
      const results = await Promise.all(
        Array.from({ length: 4 }).map(async (_, idx) => {
          const version = ++slotRequestVersions.current[idx];
          if (idx >= imageCount) return { idx, version, canvas: null };
          const src = slotSources[idx] || { type: 'perspective', perspectiveId: 'isometric', timePreset: 'noon' };
          const c = await captureSingleSlotCanvas(src);
          return { idx, version, canvas: c };
        })
      );

      setSlotCanvases((prev) => {
        const next = [...prev];
        for (const res of results) {
          if (slotRequestVersions.current[res.idx] === res.version) {
            next[res.idx] = res.canvas;
          }
        }
        return next;
      });
    } catch (err) {
      console.error('Error capturing all slot snapshots:', err);
    } finally {
      setIsCapturing(false);
    }
  }, [imageCount, slotSources, captureSingleSlotCanvas]);

  // Capture initial slots on modal open
  useEffect(() => {
    if (isPosterModalOpen) {
      preloadTemplateAssets(POSTER_TEMPLATES[selectedTemplateId]);
      if (!initialCapturedRef.current) {
        initialCapturedRef.current = true;
        captureAllSlots();
      }
    } else {
      initialCapturedRef.current = false;
    }
  }, [isPosterModalOpen, selectedTemplateId, captureAllSlots]);

  // When imageCount increases, ensure any uncaptured visible slot is captured
  useEffect(() => {
    if (!isPosterModalOpen) return;
    for (let i = 0; i < imageCount; i++) {
      if (!slotCanvases[i]) {
        updateSlot(i, slotSources[i] || { type: 'perspective', perspectiveId: 'isometric', timePreset: 'noon' });
      }
    }
  }, [imageCount, isPosterModalOpen, slotCanvases, slotSources, updateSlot]);

  // Re-composite full poster whenever slots, template, or text options change
  useEffect(() => {
    if (!isPosterModalOpen) return;

    let isMounted = true;
    setIsCompositing(true);

    const curPresets = LOCALE_PRESETS[locale] || LOCALE_PRESETS.en;
    const textOpts: PosterTextOptions = {
      fortTitle,
      builderName,
      builderCreditLine: curPresets.creditLine(builderName),
      festiveGreeting,
      stampStyle,
      fontFamily: 'Yatra One',
      showBuilderCredit,
    };

    composeFestivePoster({
      template: POSTER_TEMPLATES[selectedTemplateId],
      gridType: gridLayout,
      slotCanvases: slotCanvases.slice(0, imageCount),
      textOptions: textOpts,
      canvasWidth: 1080,
      canvasHeight: 1350,
    })
      .then((canvas) => {
        if (isMounted) {
          setPreviewCanvas(canvas);
          setIsCompositing(false);
        }
      })
      .catch((err) => {
        console.error('Failed to compose poster preview:', err);
        if (isMounted) setIsCompositing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [
    isPosterModalOpen,
    selectedTemplateId,
    gridLayout,
    imageCount,
    slotCanvases,
    fortTitle,
    builderName,
    festiveGreeting,
    stampStyle,
    showBuilderCredit,
    locale,
  ]);

  // Mount preview canvas into DOM
  useEffect(() => {
    if (previewContainerRef.current && previewCanvas) {
      previewContainerRef.current.innerHTML = '';
      previewCanvas.style.maxWidth = '100%';
      previewCanvas.style.maxHeight = '100%';
      previewCanvas.style.objectFit = 'contain';
      previewCanvas.style.borderRadius = '8px';
      previewCanvas.style.boxShadow = '0 12px 36px rgba(0,0,0,0.35)';
      previewContainerRef.current.appendChild(previewCanvas);
    }
  }, [previewCanvas]);

  // Assign a perspective to a slot
  const handleAssignPerspective = (slotIdx: number, pId: CameraPerspectiveId) => {
    const curTime = slotSources[slotIdx]?.timePreset || 'noon';
    updateSlot(slotIdx, {
      type: pId === 'current' ? 'current' : 'perspective',
      perspectiveId: pId,
      timePreset: curTime,
    });
  };

  // Assign a time-of-day preset to a slot
  const handleAssignTimePreset = (slotIdx: number, timePreset: TimePresetId) => {
    const cur = slotSources[slotIdx] || { type: 'perspective', perspectiveId: 'isometric', timePreset: 'noon' };
    updateSlot(slotIdx, {
      ...cur,
      timePreset,
    });
  };

  // Assign a gallery screenshot to a specific slot
  const handleAssignGalleryShot = (slotIdx: number, dataUrl: string) => {
    const curTime = slotSources[slotIdx]?.timePreset || 'noon';
    updateSlot(slotIdx, {
      type: 'gallery',
      galleryDataUrl: dataUrl,
      timePreset: curTime,
    });
    setActiveGallerySlotIndex(null);
    setToastMessage(`Assigned snapshot to Slot ${slotIdx + 1}`);
  };

  // Open confirmation dialog for deleting a single screenshot
  const handleRequestDeleteScreenshot = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      type: 'delete-single',
      screenshotId: id,
    });
  };

  // Open confirmation dialog for clearing all screenshots
  const handleRequestClearAllScreenshots = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'clear-all',
    });
  };

  // Execute confirmed deletion action
  const handleConfirmAction = async () => {
    if (confirmDialog.type === 'clear-all') {
      await clearAllLocalScreenshots();
      await refreshGallery();
      setToastMessage(
        locale === 'mr'
          ? 'स्थानिक गॅलरी रिकामी केली'
          : locale === 'hi'
          ? 'स्थानीय गैलरी खाली कर दी गई'
          : 'Local gallery cleared'
      );
    } else if (confirmDialog.type === 'delete-single' && confirmDialog.screenshotId) {
      await deleteLocalScreenshot(confirmDialog.screenshotId);
      await refreshGallery();
      setToastMessage(
        locale === 'mr'
          ? 'स्क्रीनशॉट हटवला'
          : locale === 'hi'
          ? 'स्क्रीनशॉट हटा दिया गया'
          : 'Snapshot deleted from local gallery'
      );
    }
    setConfirmDialog({ isOpen: false, type: 'clear-all' });
  };

  // Download high-resolution poster
  const handleDownload = () => {
    if (!previewCanvas) return;
    const mime = exportFormat === 'png' ? 'image/png' : 'image/jpeg';
    const ext = exportFormat === 'png' ? 'png' : 'jpg';
    const sanitizedTitle = fortTitle.replace(/[^\w\u0900-\u097F-]/g, '_').slice(0, 24);
    const filename = `killa-poster-${sanitizedTitle}-${Date.now()}.${ext}`;

    previewCanvas.toBlob((blob) => {
      if (blob) {
        downloadPosterBlob(blob, filename);
        setToastMessage(`Festive poster downloaded (${ext.toUpperCase()})!`);
      }
    }, mime, 0.95);
  };

  // Native Web Share API
  const handleShare = async () => {
    if (!previewCanvas) return;
    const filename = `killa-poster-${Date.now()}.png`;

    previewCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const result = await sharePosterFile({
        blob,
        filename,
        title: fortTitle,
        text: `${fortTitle} • ${festiveGreeting}\nCrafted with Killa Playground.`,
      });

      if (result.method === 'web-share') {
        setToastMessage('Shared festive poster!');
      } else if (result.method === 'clipboard') {
        setToastMessage('Poster copied to clipboard! Paste directly (Ctrl+V) into WhatsApp or Discord.');
      } else {
        setToastMessage('Poster downloaded to your device!');
      }
    }, 'image/png');
  };

  // Direct Clipboard Copy
  const handleCopyClipboard = async () => {
    if (!previewCanvas) return;
    previewCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const success = await copyPosterToClipboard(blob);
      if (success) {
        setToastMessage('Poster image copied to clipboard! Ready to paste (Ctrl+V).');
      } else {
        setToastMessage('Clipboard image copy not supported in this browser. Downloading file instead.');
        downloadPosterBlob(blob, 'killa-poster.png');
      }
    }, 'image/png');
  };

  if (!isPosterModalOpen) return null;

  const availableGrids = getAvailableGridLayouts(imageCount);
  const socialLinks = getSocialShareLinks(fortTitle, festiveGreeting);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="poster-studio-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs select-none"
    >
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[960px] bg-[#F9F6F0] border-2 border-[#D9C9B4] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#4B382C]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#FAF8F5] border-b border-[#D9C9B4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] border border-[#F59E0B] flex items-center justify-center text-[#B45309]">
              <TbPalette className="w-5 h-5 text-[#E85D04]" />
            </div>
            <div>
              <h2 id="poster-studio-title" className="text-base font-bold text-[#4B382C]">
                {t.posterModal?.title || 'Festive Killa Poster Studio'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector Pill */}
            <div className="flex items-center bg-[#EADECF] p-0.5 rounded-lg border border-[#CDBCAB]">
              {(['en', 'mr', 'hi'] as Locale[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLocale(lang)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    locale === lang
                      ? 'bg-[#FAF8F5] text-[#E85D04] shadow-xs'
                      : 'text-[#634E40] hover:text-[#2B1E16]'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'mr' ? 'म' : 'हि'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setPosterModalOpen(false)}
              className="p-1.5 rounded-lg text-[#8D7666] hover:bg-[#EAE0D3] hover:text-[#4B382C] transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <TbX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Body: 2-Column Responsive Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left / Center: Interactive Live Poster Preview */}
          <div className="flex-1 bg-[#1E1915] p-3 sm:p-5 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Compositing / Capturing Loading Overlay */}
            {(isCapturing || isCompositing) && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xs text-white text-xs font-semibold shadow-lg">
                <TbRefresh className="w-4 h-4 animate-spin text-[#F59E0B]" />
                <span>
                  {locale === 'mr'
                    ? 'चित्र तयार होत आहे...'
                    : locale === 'hi'
                    ? 'चित्र तैयार हो रहा है...'
                    : 'Compositing layered artwork...'}
                </span>
              </div>
            )}

            {/* Canvas Mount Container */}
            <div
              ref={previewContainerRef}
              className="w-full h-full flex items-center justify-center relative"
            />
          </div>

          {/* Right Sidebar: Studio Controls & Configuration */}
          <div className="w-full md:w-[380px] lg:w-[420px] bg-[#F9F6F0] border-t md:border-t-0 md:border-l border-[#D9C9B4] flex flex-col overflow-y-auto p-3.5 sm:p-4 space-y-4">
            {/* 1. Template Selector (Full visible thumbnails) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4B382C] flex items-center gap-1.5">
                <TbPalette className="w-4 h-4 text-[#B85F45]" />
                <span>{locale === 'mr' ? 'पोस्टर थीम' : locale === 'hi' ? 'पोस्टर थीम' : 'Poster Theme'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(POSTER_TEMPLATES) as PosterTemplateId[]).map((tid) => {
                  const tpl = POSTER_TEMPLATES[tid];
                  const isSelected = selectedTemplateId === tid;
                  const displayName = locale === 'mr' || locale === 'hi' ? tpl.marathiName : tpl.name;

                  return (
                    <button
                      key={tid}
                      onClick={() => setSelectedTemplateId(tid)}
                      className={`relative p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'border-[#E85D04] bg-[#FFFBEB] ring-2 ring-[#E85D04]/30 shadow-xs'
                          : 'border-[#D9C9B4] bg-[#FAF8F5] hover:bg-[#EFE8DD]'
                      }`}
                    >
                      {/* Thumbnail container adjusted so ENTIRE 4:5 poster is 100% visible */}
                      <div className="w-full h-36 sm:h-40 flex items-center justify-center bg-[#EFE8DD]/40 rounded-lg overflow-hidden relative p-1">
                        <img
                          src={tpl.previewUrl}
                          alt={displayName}
                          className="max-h-full max-w-full object-contain rounded shadow-xs"
                        />
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#E85D04] text-white flex items-center justify-center shadow-xs">
                            <TbCheck className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="px-0.5">
                        <div className="text-[12px] font-bold text-[#4B382C] truncate text-center">
                          {displayName}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Image Count & Grid Pattern Selector */}
            <div className="space-y-2 pt-2 border-t border-[#D9C9B4]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#4B382C] flex items-center gap-1.5">
                  <TbGridDots className="w-4 h-4 text-[#B85F45]" />
                  <span>{locale === 'mr' ? 'चित्रांची संख्या' : locale === 'hi' ? 'चित्रों की संख्या' : 'Images in Poster'}</span>
                </label>
                {/* Count selector pills (1, 2, 3, 4) */}
                <div className="flex items-center gap-1 bg-[#EAE0D3] p-0.5 rounded-lg border border-[#D9C9B4]">
                  {([1, 2, 3, 4] as ImageCount[]).map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setImageCount(cnt)}
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        imageCount === cnt
                          ? 'bg-[#FAF8F5] text-[#E85D04] shadow-xs'
                          : 'text-[#634E40] hover:text-[#2B1E16]'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Layout Variations */}
              <div className="flex flex-wrap gap-1.5">
                {availableGrids.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGridLayout(g.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                      gridLayout === g.id
                        ? 'border-[#E85D04] bg-[#FFFBEB] text-[#B45309] font-bold shadow-2xs'
                        : 'border-[#D9C9B4] bg-[#FAF8F5] text-[#634E40] hover:bg-[#EAE0D3]'
                    }`}
                  >
                    {presets.grids[g.id] || g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Slot Camera Angles & Sources Manager with INLINE Gallery Drawers */}
            <div className="space-y-2 pt-2 border-t border-[#D9C9B4]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#4B382C] flex items-center gap-1.5">
                  <TbCamera className="w-4 h-4 text-[#B85F45]" />
                  <span>{locale === 'mr' ? 'चित्रांचे कोन व स्रोत' : locale === 'hi' ? 'चित्रों के कोण व स्रोत' : 'Slot Angles & Sources'}</span>
                </label>
                <button
                  onClick={captureAllSlots}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#B85F45] hover:text-[#8F4938] transition-colors cursor-pointer"
                  title="Recapture all slots"
                >
                  <TbRefresh className="w-3.5 h-3.5" />
                  <span>{locale === 'mr' ? 'सर्व पुन्हा घ्या' : locale === 'hi' ? 'सभी फिर लें' : 'Recapture All'}</span>
                </button>
              </div>

              <div className="space-y-2">
                {Array.from({ length: imageCount }).map((_, idx) => {
                  const source = slotSources[idx] || { type: 'perspective', perspectiveId: 'isometric' };
                  const isInlineGalleryOpen = activeGallerySlotIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl border transition-all ${
                        isInlineGalleryOpen
                          ? 'border-[#F59E0B] bg-[#FFFBEB]/50 shadow-xs'
                          : 'border-[#D9C9B4] bg-[#FAF8F5]/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-[#4B382C]">
                          {locale === 'mr' ? `चित्र ${idx + 1}` : locale === 'hi' ? `चित्र ${idx + 1}` : `Slot ${idx + 1}`}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAssignPerspective(idx, 'current')}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EFE8DD] hover:bg-[#E0D5C5] text-[#4B382C] border border-[#D9C9B4] transition-colors cursor-pointer"
                            title="Capture current viewport view"
                          >
                            {locale === 'mr' ? 'थेट कॅमेरा' : locale === 'hi' ? 'लाइव कैमरा' : 'Live Camera'}
                          </button>
                          <button
                            onClick={() =>
                              setActiveGallerySlotIndex(isInlineGalleryOpen ? null : idx)
                            }
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              isInlineGalleryOpen
                                ? 'bg-[#E85D04] text-white border-[#E85D04]'
                                : 'bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border-[#F59E0B]'
                            }`}
                            title="Pick from local screenshot gallery"
                          >
                            <TbPhoto className="w-3 h-3" />
                            <span>{locale === 'mr' ? 'गॅलरी' : locale === 'hi' ? 'गैलरी' : 'Gallery'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Perspective Presets Pills */}
                      <div className="grid grid-cols-2 gap-1">
                        {(Object.keys(CAMERA_PERSPECTIVES) as (keyof typeof CAMERA_PERSPECTIVES)[]).map((pKey) => {
                          const isActive = source.type === 'perspective' && source.perspectiveId === pKey;
                          const pLabel = presets.perspectives[pKey] || CAMERA_PERSPECTIVES[pKey].name;

                          return (
                            <button
                              key={pKey}
                              onClick={() => {
                                handleAssignPerspective(idx, pKey);
                                if (isInlineGalleryOpen) setActiveGallerySlotIndex(null);
                              }}
                              className={`py-1 px-1.5 rounded-md text-[10px] font-semibold border text-left truncate transition-colors cursor-pointer ${
                                isActive
                                  ? 'bg-[#FFFBEB] border-[#E85D04] text-[#B45309] font-bold shadow-2xs'
                                  : 'bg-[#F9F6F0] border-[#D9C9B4] text-[#634E40] hover:bg-[#EAE0D3]'
                              }`}
                            >
                              {pLabel}
                            </button>
                          );
                        })}
                      </div>

                      {/* 4-Tile Diurnal Time of Day Toggle */}
                      <div className="mt-2 pt-1.5 border-t border-[#D9C9B4]/60">
                        <div className="text-[10px] font-bold text-[#634E40] mb-1 flex items-center justify-between">
                          <span>{locale === 'mr' ? 'वेळ व प्रकाश' : locale === 'hi' ? 'समय व प्रकाश' : 'Time of Day'}</span>
                          <span className="text-[9px] font-normal text-[#8D7666]">
                            {presets.times[source.timePreset || 'noon']}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {TIME_PRESET_OPTIONS.map((tKey) => {
                            const isTimeActive = source.timePreset === tKey;
                            const tLabel = presets.times[tKey];
                            const Icon =
                              tKey === 'dawn'
                                ? TbSunrise
                                : tKey === 'noon'
                                ? TbSun
                                : tKey === 'sunset'
                                ? TbSunset
                                : TbFlame;

                            return (
                              <button
                                key={tKey}
                                type="button"
                                onClick={() => handleAssignTimePreset(idx, tKey)}
                                className={`py-1 px-0.5 rounded-md text-[9px] font-semibold border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                                  isTimeActive
                                    ? 'bg-[#FFFBEB] border-[#E85D04] text-[#B45309] font-bold shadow-2xs'
                                    : 'bg-[#F9F6F0] border-[#D9C9B4] text-[#634E40] hover:bg-[#EAE0D3]'
                                }`}
                                title={tLabel}
                              >
                                <Icon
                                  className={`w-3.5 h-3.5 ${
                                    tKey === 'dawn'
                                      ? 'text-[#EA580C]'
                                      : tKey === 'noon'
                                      ? 'text-[#F59E0B]'
                                      : tKey === 'sunset'
                                      ? 'text-[#D97706]'
                                      : 'text-[#B85F45]'
                                  }`}
                                />
                                <span className="truncate max-w-full text-[8.5px]">
                                  {tKey === 'dawn'
                                    ? (locale === 'mr' ? 'पहाट' : locale === 'hi' ? 'उषा' : 'Dawn')
                                    : tKey === 'noon'
                                    ? (locale === 'mr' ? 'दुपार' : locale === 'hi' ? 'दोपहर' : 'Noon')
                                    : tKey === 'sunset'
                                    ? (locale === 'mr' ? 'गोधूलि' : locale === 'hi' ? 'गोधूलि' : 'Golden')
                                    : (locale === 'mr' ? 'रात्र' : locale === 'hi' ? 'रात' : 'Night')}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* INLINE GALLERY DRAWER: Opens DIRECTLY below the slot whose gallery was clicked */}
                      {isInlineGalleryOpen && (
                        <div className="mt-2.5 pt-2 border-t border-[#F59E0B]/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#B45309]">
                              {locale === 'mr'
                                ? `चित्र ${idx + 1} साठी स्क्रीनशॉट निवडा`
                                : locale === 'hi'
                                ? `चित्र ${idx + 1} के लिए स्क्रीनशॉट चुनें`
                                : `Select Screenshot for Slot ${idx + 1}`}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {galleryScreenshots.length > 0 && (
                                <button
                                  onClick={handleRequestClearAllScreenshots}
                                  className="text-[9px] font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-0.5"
                                >
                                  <TbTrash className="w-2.5 h-2.5" />
                                  <span>{locale === 'mr' ? 'सर्व हटवा' : locale === 'hi' ? 'सभी हटाएं' : 'Clear All'}</span>
                                </button>
                              )}
                              <button
                                onClick={() => setActiveGallerySlotIndex(null)}
                                className="p-0.5 text-[#8D7666] hover:text-[#4B382C] cursor-pointer"
                              >
                                <TbX className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {galleryScreenshots.length === 0 ? (
                            <div className="text-[10px] text-[#8D7666] italic py-2 text-center bg-[#FAF8F5] rounded-lg border border-[#D9C9B4]/50">
                              {locale === 'mr'
                                ? 'अद्याप कोणतेही स्क्रीनशॉट नाहीत. मुख्य स्क्रीनवरील कॅमेरा आयकॉन क्लिक करा.'
                                : locale === 'hi'
                                ? 'अभी कोई स्क्रीनशॉट नहीं है। मुख्य स्क्रीन पर कैमरा आइकन क्लिक करें।'
                                : 'No snapshots captured yet. Click the camera icon in the diorama bar.'}
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-0.5">
                              {galleryScreenshots.map((shot) => (
                                <div
                                  key={shot.id}
                                  onClick={() => handleAssignGalleryShot(idx, shot.dataUrl)}
                                  className="group relative h-16 rounded-lg overflow-hidden border border-[#D9C9B4] bg-[#23211E] cursor-pointer hover:border-[#E85D04] transition-all"
                                >
                                  <img
                                    src={shot.dataUrl}
                                    alt="Screenshot"
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    onClick={(e) => handleRequestDeleteScreenshot(e, shot.id)}
                                    className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                                    title="Delete from local gallery"
                                  >
                                    <TbTrash className="w-2.5 h-2.5" />
                                  </button>
                                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5 text-[8px] text-white truncate font-mono">
                                    {new Date(shot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. Typography & Text Personalization (Language-aware, Font locked to Yatra One) */}
            <div className="space-y-2 pt-2 border-t border-[#D9C9B4]">
              <label className="text-xs font-bold text-[#4B382C] flex items-center gap-1.5">
                <TbTypography className="w-4 h-4 text-[#B85F45]" />
                <span>{locale === 'mr' ? 'मजकूर व मुद्रा' : locale === 'hi' ? 'टेक्स्ट व मुहर' : 'Text & Branding Presets'}</span>
              </label>

              {/* Fort Title input & language presets */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#634E40]">
                  {locale === 'mr' ? 'किल्ल्याचे नाव' : locale === 'hi' ? 'किले का नाम' : 'Fort Title'}
                </span>
                <input
                  type="text"
                  value={fortTitle}
                  onChange={(e) => setFortTitle(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-[#FAF8F5] border border-[#D9C9B4] rounded-lg text-[#4B382C] focus:outline-hidden focus:border-[#E85D04]"
                  placeholder={locale === 'mr' ? 'किल्ल्याचे नाव...' : locale === 'hi' ? 'किले का नाम...' : 'Enter Fort Title...'}
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {presets.titles.map((tItem) => (
                    <button
                      key={tItem}
                      onClick={() => setFortTitle(tItem)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                        fortTitle === tItem
                          ? 'bg-[#E85D04] text-white border-[#E85D04]'
                          : 'bg-[#FAF8F5] border-[#D9C9B4] text-[#634E40] hover:bg-[#EAE0D3]'
                      }`}
                    >
                      {tItem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Builder Name input */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#634E40]">
                  {locale === 'mr' ? 'निर्माता / संघ' : locale === 'hi' ? 'निर्माता / दल' : 'Builder / Team Credit'}
                </span>
                <input
                  type="text"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-[#FAF8F5] border border-[#D9C9B4] rounded-lg text-[#4B382C] focus:outline-hidden focus:border-[#E85D04]"
                  placeholder={locale === 'mr' ? 'नाव...' : locale === 'hi' ? 'नाम...' : 'Builder Name...'}
                />
              </div>

              {/* Festive Greeting Presets */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#634E40]">
                  {locale === 'mr' ? 'उत्सव शुभेच्छा' : locale === 'hi' ? 'उत्सव शुभकामनाएं' : 'Festive Wish'}
                </span>
                <input
                  type="text"
                  value={festiveGreeting}
                  onChange={(e) => setFestiveGreeting(e.target.value)}
                  className="w-full px-2.5 py-1 text-xs bg-[#FAF8F5] border border-[#D9C9B4] rounded-lg text-[#4B382C] focus:outline-hidden focus:border-[#E85D04]"
                  placeholder={locale === 'mr' ? 'शुभेच्छा...' : locale === 'hi' ? 'शुभकामनाएं...' : 'Greeting...'}
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {presets.greetings.map((gItem) => (
                    <button
                      key={gItem}
                      onClick={() => setFestiveGreeting(gItem)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                        festiveGreeting === gItem
                          ? 'bg-[#E85D04] text-white border-[#E85D04]'
                          : 'bg-[#FAF8F5] border-[#D9C9B4] text-[#634E40] hover:bg-[#EAE0D3]'
                      }`}
                    >
                      {gItem || presets.cleanNone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Banner / Stamp Style */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-[#634E40]">
                  {locale === 'mr' ? 'मुद्रा / पट्टी शैली' : locale === 'hi' ? 'मुहर / पट्टी शैली' : 'Banner / Watermark Style'}
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {(['traditional-banner', 'minimal-stamp', 'royal-plaque', 'none'] as const).map((sId) => (
                    <button
                      key={sId}
                      onClick={() => setStampStyle(sId)}
                      className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold border text-center transition-colors cursor-pointer ${
                        stampStyle === sId
                          ? 'bg-[#FFFBEB] border-[#E85D04] text-[#B45309] font-bold shadow-2xs'
                          : 'bg-[#FAF8F5] border-[#D9C9B4] text-[#634E40] hover:bg-[#EAE0D3]'
                      }`}
                    >
                      {presets.banners[sId]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Export & Social Sharing Actions */}
            <div className="space-y-2.5 pt-3 border-t border-[#D9C9B4] mt-auto">
              {/* Format selection */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#634E40]">
                  {locale === 'mr' ? 'स्वरूप' : locale === 'hi' ? 'प्रारूप' : 'Export Format'}
                </span>
                <div className="flex items-center gap-1 bg-[#EAE0D3] p-0.5 rounded-lg border border-[#D9C9B4]">
                  <button
                    onClick={() => setExportFormat('png')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      exportFormat === 'png'
                        ? 'bg-[#FAF8F5] text-[#E85D04] shadow-xs'
                        : 'text-[#634E40] hover:text-[#2B1E16]'
                    }`}
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => setExportFormat('jpeg')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      exportFormat === 'jpeg'
                        ? 'bg-[#FAF8F5] text-[#E85D04] shadow-xs'
                        : 'text-[#634E40] hover:text-[#2B1E16]'
                    }`}
                  >
                    JPG
                  </button>
                </div>
              </div>

              {/* Primary Download CTA */}
              <button
                onClick={handleDownload}
                disabled={!previewCanvas || isCompositing}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E85D04] hover:bg-[#D04E00] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TbDownload className="w-4 h-4" />
                <span>
                  {locale === 'mr'
                    ? `पोस्टर डाऊनलोड करा (${exportFormat.toUpperCase()})`
                    : locale === 'hi'
                    ? `पोस्टर डाउनलोड करें (${exportFormat.toUpperCase()})`
                    : `Download Festive Poster (${exportFormat.toUpperCase()})`}
                </span>
              </button>

              {/* Secondary Sharing Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShare}
                  disabled={!previewCanvas || isCompositing}
                  className="py-1.5 px-3 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE0D3] border border-[#D9C9B4] text-[#4B382C] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Share to WhatsApp, Instagram, or AirDrop"
                >
                  <TbShare className="w-3.5 h-3.5 text-[#E85D04]" />
                  <span>{locale === 'mr' ? 'शेअर करा' : locale === 'hi' ? 'साझा करें' : 'Share Poster'}</span>
                </button>

                <button
                  onClick={handleCopyClipboard}
                  disabled={!previewCanvas || isCompositing}
                  className="py-1.5 px-3 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE0D3] border border-[#D9C9B4] text-[#4B382C] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Copy image to clipboard for WhatsApp Web / Discord"
                >
                  <TbCopy className="w-3.5 h-3.5 text-[#B85F45]" />
                  <span>{locale === 'mr' ? 'इमेज कॉपी' : locale === 'hi' ? 'इमेज कॉपी' : 'Copy Image'}</span>
                </button>
              </div>

              {/* Direct Social Links */}
              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#16A34A] hover:underline flex items-center gap-1"
                >
                  <TbBrandWhatsapp className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <span className="text-[#D9C9B4]">•</span>
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#0284C7] hover:underline flex items-center gap-1"
                >
                  <TbBrandX className="w-3.5 h-3.5" />
                  <span>{locale === 'mr' ? 'एक्स वर शेअर' : locale === 'hi' ? 'एक्स पर साझा' : 'Share on X'}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Themed In-App Confirmation Modal for Screenshot Deletion */}
        {confirmDialog.isOpen && (
          <div
            role="alertdialog"
            aria-modal="true"
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs select-none"
          >
            <div className="w-full max-w-sm bg-[#FAF8F5] border-2 border-[#D9C9B4] rounded-2xl p-5 shadow-2xl text-[#4B382C] space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                  <TbTrash className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#4B382C]">
                    {confirmDialog.type === 'clear-all'
                      ? locale === 'mr'
                        ? 'सर्व स्क्रीनशॉट हटवायचे?'
                        : locale === 'hi'
                        ? 'सभी स्क्रीनशॉट हटाएं?'
                        : 'Clear All Screenshots?'
                      : locale === 'mr'
                      ? 'हा स्क्रीनशॉट हटवायचा?'
                      : locale === 'hi'
                      ? 'यह स्क्रीनशॉट हटाएं?'
                      : 'Delete Screenshot?'}
                  </h3>
                  <p className="text-xs text-[#634E40] mt-1 leading-relaxed">
                    {confirmDialog.type === 'clear-all'
                      ? locale === 'mr'
                        ? 'तुम्हाला खात्री आहे की तुम्ही सर्व स्क्रीनशॉट हटवू इच्छिता? ही कृती पूर्ववत केली जाऊ शकत नाही.'
                        : locale === 'hi'
                        ? 'क्या आप वाकई स्थानीय स्टोरेज से सभी स्क्रीनशॉट हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'
                        : 'Are you sure you want to delete all saved snapshots from local storage? This action cannot be undone.'
                      : locale === 'mr'
                      ? 'तुम्हाला हा स्क्रीनशॉट गॅलरीतून कायमचा हटवायचा आहे का?'
                      : locale === 'hi'
                      ? 'क्या आप इस स्क्रीनशॉट को गैलरी से हटाना चाहते हैं?'
                      : 'Are you sure you want to delete this snapshot from your local gallery?'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D9C9B4]">
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ isOpen: false, type: 'clear-all' })}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#634E40] bg-[#EFE8DD] hover:bg-[#E0D5C5] border border-[#D9C9B4] transition-colors cursor-pointer"
                >
                  {locale === 'mr' ? 'रद्द करा' : locale === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs transition-colors cursor-pointer"
                >
                  {confirmDialog.type === 'clear-all'
                    ? locale === 'mr'
                      ? 'सर्व हटवा'
                      : locale === 'hi'
                      ? 'सभी हटाएं'
                      : 'Clear All'
                    : locale === 'mr'
                    ? 'हटवा'
                    : locale === 'hi'
                    ? 'हटाएं'
                    : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
