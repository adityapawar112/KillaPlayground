'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  RefreshCw,
  Camera,
  Trash2,
  Check,
  Image as ImageIcon,
  Grid,
  Type,
  Palette,
  Sunrise,
  Sun,
  Sunset,
  Flame,
  LayoutGrid,
} from 'lucide-react';

const WhatsappIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
);

const XSocialIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

import { useEditorStore } from '@/lib/state/useEditorStore';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LanguageSelector } from '@/components/common/LanguageSelector';
import {
  POSTER_TEMPLATES,
  PosterTemplateId,
  ImageCount,
  GridLayoutType,
  getAvailableGridLayouts,
  calculateGridSlotRects,
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
    defaultBuilder: 'Builder',
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
      top: "Bird's Eye (90°)",
      rampart: 'Rampart Eye (15°)',
      bastion: 'Bastion Hero (30°)',
    },
    times: {
      dawn: 'Dawn',
      noon: 'Noon',
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
      'stack-4': '4 Rows',
      'quad-4': '2×2 Quad Grid',
      'hero-top-3-stack': '1 Hero + 3 Rows',
    },
    banners: {
      'traditional-banner': 'Bottom Banner',
      'minimal-stamp': 'Corner Stamp',
      'royal-plaque': 'Royal Plaque',
      'none': 'Pure Artwork',
    },
    cleanNone: 'None',
    tabs: {
      slots: 'Slots & Layout',
      style: 'Poster Style',
    },
    slotNavigator: 'Photo Slots',
    recaptureAll: 'Recapture All',
    recaptureSlot: 'Recapture Slot',
    slotInspector: 'Slot Configuration',
    sourceLabel: 'Image Source',
    sources: {
      perspective: '3D Angles',
      current: 'Live Viewport',
      gallery: 'Screenshot Vault',
    },
    cameraAngle: 'Camera Perspective',
    timeOfDay: 'Diurnal Lighting & Sky',
    screenshotVault: 'Screenshot Vault',
    themeLabel: 'Festival Theme',
    textLabel: 'Royal Plaque & Typography',
    fortTitle: 'Fort Title',
    builderCredit: 'Builder / Team Credit',
    festiveWish: 'Festive Greeting',
    bannerStyle: 'Plaque / Watermark Style',
    exportFormat: 'Export Format',
    downloadBtn: 'Download Festive Poster',
    shareBtn: 'Share Poster',
    copyBtn: 'Copy Image',
    shareX: 'Share on X',
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
      isometric: 'त्रिमितीय (४५°)',
      top: 'विहंगम (९०°)',
      rampart: 'तटबंदी (१५°)',
      bastion: 'बुरुज देखावा (३०°)',
    },
    times: {
      dawn: 'पहाट',
      noon: 'दुपार',
      sunset: 'गोधूलि',
      night: 'दिवाळी रात्र',
    },
    grids: {
      'single': '१ चौकट',
      'stack-2': '२ पट्ट्या',
      'cols-2': '२ स्तंभ',
      'stack-3': '३ पट्ट्या',
      'hero-top-2-bottom': '१ मुख्य + २ पट्ट्या',
      'hero-bottom-2-top': '२ पट्ट्या + १ मुख्य',
      'stack-4': '४ पट्ट्या',
      'quad-4': '२×२ चौकोन',
      'hero-top-3-stack': '१ मुख्य + ३ पट्ट्या',
    },
    banners: {
      'traditional-banner': 'तळ पट्टी',
      'minimal-stamp': 'कोपरा मुद्रा',
      'royal-plaque': 'राजकीय शिलालेख',
      'none': 'केवळ कलाकृती',
    },
    cleanNone: 'काही नाही',
    tabs: {
      slots: 'चित्र व मांडणी',
      style: 'पोस्टर शैली',
    },
    slotNavigator: 'चित्रांचे स्लॉट्स',
    recaptureAll: 'सर्व पुन्हा घ्या',
    recaptureSlot: 'हे चित्र पुन्हा घ्या',
    slotInspector: 'चित्र संरचना',
    sourceLabel: 'चित्राचा स्रोत',
    sources: {
      perspective: 'त्रिमितीय कोन',
      current: 'थेट कॅमेरा',
      gallery: 'स्क्रीनशॉट गॅलरी',
    },
    cameraAngle: 'कॅमेरा कोन',
    timeOfDay: 'वेळ व प्रकाश',
    screenshotVault: 'स्क्रीनशॉट गॅलरी',
    themeLabel: 'पोस्टर थीम',
    textLabel: 'शिलालेख व मजकूर',
    fortTitle: 'किल्ल्याचे नाव',
    builderCredit: 'निर्माता / संघ',
    festiveWish: 'उत्सव शुभेच्छा',
    bannerStyle: 'मुद्रा / पट्टी शैली',
    exportFormat: 'स्वरूप',
    downloadBtn: 'पोस्टर डाऊनलोड करा',
    shareBtn: 'शेअर करा',
    copyBtn: 'इमेज कॉपी',
    shareX: 'एक्स वर शेअर',
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
      isometric: 'त्रिविमीय (45°)',
      top: 'विहंगम (90°)',
      rampart: 'परकोटा (15°)',
      bastion: 'बुर्ज दृश्य (30°)',
    },
    times: {
      dawn: 'उषाकाल',
      noon: 'दोपहर',
      sunset: 'गोधूलि',
      night: 'दिवाली रात',
    },
    grids: {
      'single': '1 फ्रेम',
      'stack-2': '2 पंक्तियाँ',
      'cols-2': '2 कॉलम',
      'stack-3': '3 पंक्तियाँ',
      'hero-top-2-bottom': '1 मुख्य + 2 पंक्तियाँ',
      'hero-bottom-2-top': '2 पंक्तियाँ + 1 मुख्य',
      'stack-4': '4 पंक्तियाँ',
      'quad-4': '2×2 चौकोर',
      'hero-top-3-stack': '1 मुख्य + 3 पंक्तियाँ',
    },
    banners: {
      'traditional-banner': 'निचली पट्टी',
      'minimal-stamp': 'कोना मुहर',
      'royal-plaque': 'राजकीय शिलालेख',
      'none': 'केवल कलाकृति',
    },
    cleanNone: 'कोई नहीं',
    tabs: {
      slots: 'चित्र व लेआउट',
      style: 'पोस्टर शैली',
    },
    slotNavigator: 'फोटो स्लॉट्स',
    recaptureAll: 'सभी फिर लें',
    recaptureSlot: 'यह फोटो फिर लें',
    slotInspector: 'फोटो संरचना',
    sourceLabel: 'फोटो का स्रोत',
    sources: {
      perspective: '3D कोण',
      current: 'लाइव कैमरा',
      gallery: 'स्क्रीनशॉट गैलरी',
    },
    cameraAngle: 'कैमरा कोण',
    timeOfDay: 'समय व प्रकाश',
    screenshotVault: 'स्क्रीनशॉट गैलरी',
    themeLabel: 'पोस्टर थीम',
    textLabel: 'शिलालेख व टेक्स्ट',
    fortTitle: 'किले का नाम',
    builderCredit: 'निर्माता / दल',
    festiveWish: 'उत्सव शुभकामनाएं',
    bannerStyle: 'मुहर / पट्टी शैली',
    exportFormat: 'प्रारूप',
    downloadBtn: 'पोस्टर डाउनलोड करें',
    shareBtn: 'साझा करें',
    copyBtn: 'इमेज कॉपी',
    shareX: 'एक्स पर साझा',
  },
};

export const PosterStudioModal: React.FC = () => {
  const { isPosterModalOpen, setPosterModalOpen, setToastMessage } = useEditorStore();
  const { t, locale } = useTranslation();
  const presets = LOCALE_PRESETS[locale] || LOCALE_PRESETS.en;

  // Navigation tab in control panel: 'slots' | 'style'
  const [activeTab, setActiveTab] = useState<'slots' | 'style'>('slots');

  // Active selected slot index (0, 1, 2, or 3)
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);

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

  // 4. Rendered canvases per slot
  const [slotCanvases, setSlotCanvases] = useState<(HTMLCanvasElement | null)[]>([null, null, null, null]);

  // 5. Typography and personalization
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

  // Clamp active slot index whenever image count changes
  useEffect(() => {
    setActiveSlotIndex((prev) => Math.min(prev, imageCount - 1));
  }, [imageCount]);

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

  // Compute bounding rects for all slots on the 1080x1350 poster canvas
  const slotRects = useMemo(() => {
    return calculateGridSlotRects(
      POSTER_TEMPLATES[selectedTemplateId].gridBounds,
      gridLayout,
      1080,
      1350
    );
  }, [selectedTemplateId, gridLayout]);

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

  // Atomic update for a single slot's source & canvas
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

  // Capture snapshots for all active slots
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

  // Recapture single currently active slot
  const handleRecaptureActiveSlot = useCallback(() => {
    const cur = slotSources[activeSlotIndex] || {
      type: 'perspective',
      perspectiveId: 'isometric',
      timePreset: 'noon',
    };
    updateSlot(activeSlotIndex, cur);
  }, [activeSlotIndex, slotSources, updateSlot]);

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
      previewCanvas.style.width = '100%';
      previewCanvas.style.height = '100%';
      previewCanvas.style.objectFit = 'contain';
      previewCanvas.style.borderRadius = '8px';
      previewCanvas.style.display = 'block';
      previewContainerRef.current.appendChild(previewCanvas);
    }
  }, [previewCanvas]);

  // Assign a perspective to the active slot
  const handleAssignPerspective = (pId: CameraPerspectiveId) => {
    const curTime = slotSources[activeSlotIndex]?.timePreset || 'noon';
    updateSlot(activeSlotIndex, {
      type: pId === 'current' ? 'current' : 'perspective',
      perspectiveId: pId,
      timePreset: curTime,
    });
  };

  // Assign a time-of-day preset to the active slot
  const handleAssignTimePreset = (timePreset: TimePresetId) => {
    const cur = slotSources[activeSlotIndex] || { type: 'perspective', perspectiveId: 'isometric', timePreset: 'noon' };
    updateSlot(activeSlotIndex, {
      ...cur,
      timePreset,
    });
  };

  // Assign a gallery screenshot to the active slot
  const handleAssignGalleryShot = (dataUrl: string) => {
    const curTime = slotSources[activeSlotIndex]?.timePreset || 'noon';
    updateSlot(activeSlotIndex, {
      type: 'gallery',
      galleryDataUrl: dataUrl,
      timePreset: curTime,
    });
    setToastMessage(`Assigned snapshot to Slot ${activeSlotIndex + 1}`);
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
  const activeSource = slotSources[activeSlotIndex] || { type: 'perspective', perspectiveId: 'isometric', timePreset: 'noon' };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="poster-studio-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs select-none"
    >
      <div className="relative w-full max-w-6xl h-[96vh] md:h-[92vh] max-h-[960px] bg-[#EBE6DC] border-2 border-[#D8D1C5] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#2B2621]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#FAF8F5] border-b border-[#D8D1C5] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFFBEB] border border-[#F59E0B] flex items-center justify-center text-[#B45309]">
              <Palette className="w-5 h-5 text-[#E85D04]" />
            </div>
            <div>
              <h2 id="poster-studio-title" className="text-base font-bold text-[#2B2621]">
                {t.posterModal?.title || 'Festive Fort Poster Studio'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector Pill */}
            <LanguageSelector size="sm" />

            <button
              onClick={() => setPosterModalOpen(false)}
              className="p-1.5 rounded-lg text-[#7C7267] hover:bg-[#EAE0D3] hover:text-[#2B2621] transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Studio Body: 2-Column Responsive Layout (Upper Half Preview + Lower Half Properties on Mobile) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Upper Half (Mobile) / Left Column (Desktop): Interactive Live Poster Preview */}
          <div className="h-[40vh] sm:h-[42vh] md:h-full md:flex-1 bg-[#1E1915] p-2 sm:p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-0 shrink-0 md:shrink">
            {/* Compositing / Capturing Loading Overlay */}
            {(isCapturing || isCompositing) && (
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-xs text-white text-xs font-semibold shadow-lg">
                <RefreshCw className="w-4 h-4 animate-spin text-[#F59E0B]" />
                <span>
                  {locale === 'mr'
                    ? 'चित्र तयार होत आहे...'
                    : locale === 'hi'
                    ? 'चित्र तैयार हो रहा है...'
                    : 'Compositing layered artwork...'}
                </span>
              </div>
            )}

            {/* 4:5 Poster Frame with Strict Aspect Ratio (Entire poster visible without scrolling) */}
            <div
              className="relative rounded-lg shadow-2xl overflow-hidden flex items-center justify-center"
              style={{
                aspectRatio: '1080 / 1350',
                maxHeight: '100%',
                maxWidth: '100%',
                height: '100%',
                width: 'auto',
              }}
            >
              {/* 1080x1350 Canvas Target */}
              <div
                ref={previewContainerRef}
                className="w-full h-full flex items-center justify-center pointer-events-none"
              />

              {/* Synchronized Slot Selection Overlay (Zero export impact) */}
              <div className="absolute inset-0 pointer-events-none">
                {slotRects.map((rect, idx) => {
                  if (idx >= imageCount) return null;
                  const isSelected = activeSlotIndex === idx;
                  const leftPct = (rect.x / 1080) * 100;
                  const topPct = (rect.y / 1350) * 100;
                  const widthPct = (rect.width / 1080) * 100;
                  const heightPct = (rect.height / 1350) * 100;

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSlotIndex(idx)}
                      className={`absolute pointer-events-auto cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#E85D04] bg-[#E85D04]/10 shadow-lg'
                          : 'hover:bg-white/10'
                      }`}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                      }}
                      title={`Slot ${idx + 1} (Click to inspect)`}
                    >
                      {/* Subtle Corner Brackets for Active Slot */}
                      {isSelected && (
                        <>
                          <div className="absolute top-1 left-1 w-3.5 h-3.5 border-t-2 border-l-2 border-[#E85D04] drop-shadow-md" />
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 border-t-2 border-r-2 border-[#E85D04] drop-shadow-md" />
                          <div className="absolute bottom-1 left-1 w-3.5 h-3.5 border-b-2 border-l-2 border-[#E85D04] drop-shadow-md" />
                          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 border-b-2 border-r-2 border-[#E85D04] drop-shadow-md" />
                          <span className="absolute top-1.5 left-2 px-1.5 py-0.5 rounded bg-black/85 text-white text-[9px] font-bold tracking-wider shadow-sm flex items-center gap-1">
                            <span>SLOT {idx + 1}</span>
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lower Half (Mobile) / Right Column (Desktop): Streamlined Studio Inspector & Sticky Dock */}
          <div className="w-full flex-1 md:flex-initial md:w-[380px] lg:w-[420px] bg-[#EBE6DC] border-t md:border-t-0 md:border-l border-[#D8D1C5] flex flex-col md:h-full overflow-hidden min-h-0">
            {/* Top Navigation Tabs: Slots & Layout vs Poster Style */}
            <div className="px-3.5 pt-3 pb-2.5 bg-[#FAF8F5] border-b border-[#D8D1C5] shrink-0">
              <div className="grid grid-cols-2 p-1 bg-[#EAE0D3] rounded-xl border border-[#D8D1C5]">
                <button
                  type="button"
                  onClick={() => setActiveTab('slots')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'slots'
                      ? 'bg-[#FAF8F5] text-[#E85D04] shadow-xs'
                      : 'text-[#5A5248] hover:text-[#2B2621]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{presets.tabs.slots}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('style')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'style'
                      ? 'bg-[#FAF8F5] text-[#E85D04] shadow-xs'
                      : 'text-[#5A5248] hover:text-[#2B2621]'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>{presets.tabs.style}</span>
                </button>
              </div>
            </div>

            {/* Scrollable Middle Controls Area */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 min-h-0">
              {activeTab === 'slots' ? (
                <>
                  {/* 1. Images Count & Grid Pattern */}
                  <div className="space-y-2 bg-[#FAF8F5] p-3 rounded-xl border border-[#D8D1C5]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5">
                        <Grid className="w-4 h-4 text-[#B85F45]" />
                        <span>{locale === 'mr' ? 'चित्रांची संख्या' : locale === 'hi' ? 'चित्रों की संख्या' : 'Images in Poster'}</span>
                      </label>
                      {/* Count selector pills (1, 2, 3, 4) */}
                      <div className="flex items-center gap-1 bg-[#EAE0D3] p-0.5 rounded-lg border border-[#D8D1C5]">
                        {([1, 2, 3, 4] as ImageCount[]).map((cnt) => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setImageCount(cnt)}
                            className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                              imageCount === cnt
                                ? 'bg-[#FAF8F5] text-[#E85D04] shadow-xs'
                                : 'text-[#5A5248] hover:text-[#2B1E16]'
                            }`}
                          >
                            {cnt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Grid Layout Variations */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {availableGrids.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setGridLayout(g.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            gridLayout === g.id
                              ? 'border-[#E85D04] bg-[#FFFBEB] text-[#B45309] font-bold shadow-2xs'
                              : 'border-[#D8D1C5] bg-[#EBE6DC]/60 text-[#5A5248] hover:bg-[#EAE0D3]'
                          }`}
                        >
                          {presets.grids[g.id] || g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Compact Horizontal Slot Navigator Strip */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-[#B85F45]" />
                        <span>{presets.slotNavigator}</span>
                      </label>
                      <button
                        type="button"
                        onClick={captureAllSlots}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#B85F45] hover:text-[#8F4938] transition-colors cursor-pointer"
                        title="Recapture all slots"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{presets.recaptureAll}</span>
                      </button>
                    </div>

                    {/* Horizontal Navigator Strip */}
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#FAF8F5] border border-[#D8D1C5] rounded-xl">
                      {Array.from({ length: imageCount }).map((_, idx) => {
                        const isSelected = activeSlotIndex === idx;
                        const src = slotSources[idx];
                        const timeKey = src?.timePreset || 'noon';
                        const TimeIcon =
                          timeKey === 'dawn'
                            ? Sunrise
                            : timeKey === 'noon'
                            ? Sun
                            : timeKey === 'sunset'
                            ? Sunset
                            : Flame;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveSlotIndex(idx)}
                            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                              isSelected
                                ? 'bg-[#FFFBEB] border-[#E85D04] text-[#B45309] shadow-xs ring-1 ring-[#E85D04]/30'
                                : 'bg-[#EBE6DC]/40 border-transparent text-[#5A5248] hover:bg-[#EAE0D3]'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <span>Slot {idx + 1}</span>
                              <TimeIcon className="w-3 h-3 text-[#B85F45]" />
                            </div>
                            <span className="text-[9px] font-normal text-[#7C7267] truncate max-w-full">
                              {src?.type === 'current'
                                ? 'Live'
                                : src?.type === 'gallery'
                                ? 'Vault'
                                : src?.perspectiveId === 'top'
                                ? '90°'
                                : src?.perspectiveId === 'rampart'
                                ? '15°'
                                : src?.perspectiveId === 'bastion'
                                ? '30°'
                                : '45°'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Focused Single-Slot Inspector */}
                  <div className="space-y-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#D8D1C5]">
                    <div className="flex items-center justify-between pb-1.5 border-b border-[#D8D1C5]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#2B2621]">
                          {locale === 'mr' ? `चित्र ${activeSlotIndex + 1} संरचना` : locale === 'hi' ? `चित्र ${activeSlotIndex + 1} संरचना` : `Slot ${activeSlotIndex + 1} Configuration`}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EAE0D3] text-[#5A5248]">
                          {activeSource.type === 'current'
                            ? presets.sources.current
                            : activeSource.type === 'gallery'
                            ? presets.sources.gallery
                            : presets.sources.perspective}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRecaptureActiveSlot}
                        className="text-[11px] font-bold text-[#B85F45] hover:text-[#8F4938] flex items-center gap-1 cursor-pointer"
                        title="Recapture this slot"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{presets.recaptureSlot}</span>
                      </button>
                    </div>

                    {/* Source Selector Tabs */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-[#5A5248]">
                        {presets.sourceLabel}
                      </label>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeSource.type !== 'perspective') {
                              handleAssignPerspective('isometric');
                            }
                          }}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer text-center ${
                            activeSource.type === 'perspective'
                              ? 'bg-[#FFFBEB] border-[#E85D04] text-[#B45309] shadow-2xs'
                              : 'bg-[#EBE6DC] border-[#D8D1C5] text-[#5A5248] hover:bg-[#EAE0D3]'
                          }`}
                        >
                          {presets.sources.perspective}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignPerspective('current')}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer text-center ${
                            activeSource.type === 'current'
                              ? 'bg-[#FFFBEB] border-[#E85D04] text-[#B45309] shadow-2xs'
                              : 'bg-[#EBE6DC] border-[#D8D1C5] text-[#5A5248] hover:bg-[#EAE0D3]'
                          }`}
                        >
                          {presets.sources.current}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (activeSource.type !== 'gallery') {
                              if (galleryScreenshots.length > 0) {
                                handleAssignGalleryShot(galleryScreenshots[0].dataUrl);
                              } else {
                                updateSlot(activeSlotIndex, {
                                  type: 'gallery',
                                  galleryDataUrl: undefined,
                                  timePreset: activeSource.timePreset,
                                });
                              }
                            }
                          }}
                          className={`py-1.5 px-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                            activeSource.type === 'gallery'
                              ? 'bg-[#FFFBEB] border-[#E85D04] text-[#B45309] shadow-2xs'
                              : 'bg-[#EBE6DC] border-[#D8D1C5] text-[#5A5248] hover:bg-[#EAE0D3]'
                          }`}
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>{presets.sources.gallery}</span>
                        </button>
                      </div>
                    </div>

                    {/* Camera Perspectives (Only if perspective mode is selected) */}
                    {activeSource.type === 'perspective' && (
                      <div className="space-y-1.5 pt-1">
                        <label className="text-[11px] font-bold text-[#5A5248]">
                          {presets.cameraAngle}
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {(Object.keys(CAMERA_PERSPECTIVES) as (keyof typeof CAMERA_PERSPECTIVES)[]).map((pKey) => {
                            const isActive = activeSource.perspectiveId === pKey;
                            const pLabel = presets.perspectives[pKey] || CAMERA_PERSPECTIVES[pKey].name;

                            return (
                              <button
                                key={pKey}
                                type="button"
                                onClick={() => handleAssignPerspective(pKey)}
                                className={`py-1.5 px-2 rounded-lg text-[10.5px] font-semibold border text-left truncate transition-colors cursor-pointer ${
                                  isActive
                                    ? 'bg-[#FFFBEB] border-[#E85D04] text-[#B45309] font-bold shadow-2xs'
                                    : 'bg-[#EBE6DC] border-[#D8D1C5] text-[#5A5248] hover:bg-[#EAE0D3]'
                                }`}
                              >
                                {pLabel}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Diurnal Lighting & Atmosphere (For perspective and current view modes) */}
                    {activeSource.type !== 'gallery' && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-[#5A5248]">
                            {presets.timeOfDay}
                          </label>
                          <span className="text-[10px] font-medium text-[#7C7267]">
                            {presets.times[activeSource.timePreset || 'noon']}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {TIME_PRESET_OPTIONS.map((tKey) => {
                            const isTimeActive = activeSource.timePreset === tKey;
                            const tLabel = presets.times[tKey];
                            const Icon =
                              tKey === 'dawn'
                                ? Sunrise
                                : tKey === 'noon'
                                ? Sun
                                : tKey === 'sunset'
                                ? Sunset
                                : Flame;

                            return (
                              <button
                                key={tKey}
                                type="button"
                                onClick={() => handleAssignTimePreset(tKey)}
                                className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                                  isTimeActive
                                    ? 'bg-[#FFFBEB] border-[#E85D04] text-[#B45309] font-bold shadow-2xs'
                                    : 'bg-[#EBE6DC] border-[#D8D1C5] text-[#5A5248] hover:bg-[#EAE0D3]'
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
                                <span className="truncate max-w-full text-[9px]">
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
                    )}

                    {/* Screenshot Vault Picker (Only if gallery mode is selected) */}
                    {activeSource.type === 'gallery' && (
                      <div className="space-y-2 pt-1 border-t border-[#D8D1C5]">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-[#5A5248]">
                            {presets.screenshotVault}
                          </label>
                          {galleryScreenshots.length > 0 && (
                            <button
                              type="button"
                              onClick={handleRequestClearAllScreenshots}
                              className="text-[9.5px] font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-0.5"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>{locale === 'mr' ? 'सर्व हटवा' : locale === 'hi' ? 'सभी हटाएं' : 'Clear All'}</span>
                            </button>
                          )}
                        </div>

                        {galleryScreenshots.length === 0 ? (
                          <div className="text-[10px] text-[#7C7267] italic py-3 text-center bg-[#FAF8F5] rounded-lg border border-[#D8D1C5]">
                            {locale === 'mr'
                              ? 'अद्याप कोणतेही स्क्रीनशॉट नाहीत. मुख्य स्क्रीनवरील कॅमेरा आयकॉन क्लिक करा.'
                              : locale === 'hi'
                              ? 'अभी कोई स्क्रीनशॉट नहीं है। मुख्य स्क्रीन पर कैमरा आइकन क्लिक करें।'
                              : 'No snapshots captured yet. Click the camera icon in the diorama bar.'}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-0.5">
                            {galleryScreenshots.map((shot) => {
                              const isCurrentShot = activeSource.galleryDataUrl === shot.dataUrl;

                              return (
                                <div
                                  key={shot.id}
                                  onClick={() => handleAssignGalleryShot(shot.dataUrl)}
                                  className={`group relative h-16 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                                    isCurrentShot
                                      ? 'border-[#E85D04] ring-2 ring-[#E85D04]/30'
                                      : 'border-[#D8D1C5] hover:border-[#E85D04]'
                                  }`}
                                >
                                  <img
                                    src={shot.dataUrl}
                                    alt="Screenshot"
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => handleRequestDeleteScreenshot(e, shot.id)}
                                    className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                                    title="Delete from local gallery"
                                  >
                                    <Trash2 className="w-2.5 h-2.5" />
                                  </button>
                                  <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1 py-0.5 text-[8px] text-white truncate font-mono">
                                    {new Date(shot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Poster Style Tab Content */}
                  {/* 1. Festival Theme Selector */}
                  <div className="space-y-1.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#D8D1C5]">
                    <label className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-[#B85F45]" />
                      <span>{presets.themeLabel}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {(Object.keys(POSTER_TEMPLATES) as PosterTemplateId[]).map((tid) => {
                        const tpl = POSTER_TEMPLATES[tid];
                        const isSelected = selectedTemplateId === tid;
                        const displayName = locale === 'mr' || locale === 'hi' ? tpl.marathiName : tpl.name;

                        return (
                          <button
                            key={tid}
                            type="button"
                            onClick={() => setSelectedTemplateId(tid)}
                            className={`relative p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                              isSelected
                                ? 'border-[#E85D04] bg-[#FFFBEB] ring-2 ring-[#E85D04]/30 shadow-xs'
                                : 'border-[#D8D1C5] bg-[#EBE6DC]/50 hover:bg-[#EAE0D3]'
                            }`}
                          >
                            <div className="w-full h-32 flex items-center justify-center bg-[#EFE8DD]/40 rounded-lg overflow-hidden relative p-1">
                              <img
                                src={tpl.previewUrl}
                                alt={displayName}
                                className="max-h-full max-w-full object-contain rounded shadow-xs"
                              />
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#E85D04] text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                            <div className="text-[11.5px] font-bold text-[#2B2621] truncate text-center">
                              {displayName}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Royal Shilalekh Plaque & Typography */}
                  <div className="space-y-3 bg-[#FAF8F5] p-3 rounded-xl border border-[#D8D1C5]">
                    <label className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-[#B85F45]" />
                      <span>{presets.textLabel}</span>
                    </label>

                    {/* Plaque / Watermark Style */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#5A5248]">
                        {presets.bannerStyle}
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        {(['traditional-banner', 'minimal-stamp', 'royal-plaque', 'none'] as const).map((sId) => (
                          <button
                            key={sId}
                            type="button"
                            onClick={() => setStampStyle(sId)}
                            className={`py-1.5 px-2 rounded-lg text-[10px] font-semibold border text-center transition-colors cursor-pointer ${
                              stampStyle === sId
                                ? 'bg-[#FFFBEB] border-[#E85D04] text-[#B45309] font-bold shadow-2xs'
                                : 'bg-[#EBE6DC] border-[#D8D1C5] text-[#5A5248] hover:bg-[#EAE0D3]'
                            }`}
                          >
                            {presets.banners[sId]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Fort Title input & presets */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#5A5248]">
                        {presets.fortTitle}
                      </span>
                      <input
                        type="text"
                        value={fortTitle}
                        onChange={(e) => setFortTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg text-[#2B2621] focus:outline-hidden focus:border-[#E85D04]"
                        placeholder={locale === 'mr' ? 'किल्ल्याचे नाव...' : locale === 'hi' ? 'किले का नाम...' : 'Enter Fort Title...'}
                      />
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {presets.titles.map((tItem) => (
                          <button
                            key={tItem}
                            type="button"
                            onClick={() => setFortTitle(tItem)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                              fortTitle === tItem
                                ? 'bg-[#E85D04] text-white border-[#E85D04]'
                                : 'bg-[#EBE6DC] border-[#D8D1C5] text-[#5A5248] hover:bg-[#EAE0D3]'
                            }`}
                          >
                            {tItem}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Builder Name input */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#5A5248]">
                        {presets.builderCredit}
                      </span>
                      <input
                        type="text"
                        value={builderName}
                        onChange={(e) => setBuilderName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg text-[#2B2621] focus:outline-hidden focus:border-[#E85D04]"
                        placeholder={locale === 'mr' ? 'नाव...' : locale === 'hi' ? 'नाम...' : 'Builder Name...'}
                      />
                    </div>

                    {/* Festive Greeting Presets */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-[#5A5248]">
                        {presets.festiveWish}
                      </span>
                      <input
                        type="text"
                        value={festiveGreeting}
                        onChange={(e) => setFestiveGreeting(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#D8D1C5] rounded-lg text-[#2B2621] focus:outline-hidden focus:border-[#E85D04]"
                        placeholder={locale === 'mr' ? 'शुभेच्छा...' : locale === 'hi' ? 'शुभकामनाएं...' : 'Greeting...'}
                      />
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {presets.greetings.map((gItem) => (
                          <button
                            key={gItem}
                            type="button"
                            onClick={() => setFestiveGreeting(gItem)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-colors cursor-pointer ${
                              festiveGreeting === gItem
                                ? 'bg-[#E85D04] text-white border-[#E85D04]'
                                : 'bg-[#EBE6DC] border-[#D8D1C5] text-[#5A5248] hover:bg-[#EAE0D3]'
                            }`}
                          >
                            {gItem || presets.cleanNone}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Show Builder Credit Toggle */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#D8D1C5]/60">
                      <input
                        type="checkbox"
                        id="show-builder-credit"
                        checked={showBuilderCredit}
                        onChange={(e) => setShowBuilderCredit(e.target.checked)}
                        className="w-3.5 h-3.5 accent-[#E85D04] rounded cursor-pointer"
                      />
                      <label htmlFor="show-builder-credit" className="text-xs font-semibold text-[#5A5248] cursor-pointer">
                        {locale === 'mr' ? 'निर्माता नाव श्रेय दाखवा' : locale === 'hi' ? 'निर्माता श्रेय दिखाएं' : 'Display Builder Credits on Plaque'}
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pinned Bottom Action Dock: Always Visible & Accessible */}
            <div className="shrink-0 bg-[#FAF8F5] border-t border-[#D8D1C5] p-3 sm:p-3.5 space-y-2.5 shadow-lg">
              {/* Format selection */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#5A5248]">
                  {presets.exportFormat}
                </span>
                <div className="flex items-center gap-1 bg-[#EAE0D3] p-0.5 rounded-lg border border-[#D8D1C5]">
                  <button
                    type="button"
                    onClick={() => setExportFormat('png')}
                    className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer ${
                      exportFormat === 'png'
                        ? 'bg-[#FAF8F5] text-[#E85D04] shadow-xs'
                        : 'text-[#5A5248] hover:text-[#2B1E16]'
                    }`}
                  >
                    PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat('jpeg')}
                    className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer ${
                      exportFormat === 'jpeg'
                        ? 'bg-[#FAF8F5] text-[#E85D04] shadow-xs'
                        : 'text-[#5A5248] hover:text-[#2B1E16]'
                    }`}
                  >
                    JPG
                  </button>
                </div>
              </div>

              {/* Primary Download CTA */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={!previewCanvas || isCompositing}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E85D04] hover:bg-[#D04E00] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span>
                  {presets.downloadBtn} ({exportFormat.toUpperCase()})
                </span>
              </button>

              {/* Secondary Sharing Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  disabled={!previewCanvas || isCompositing}
                  className="py-1.5 px-3 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE0D3] border border-[#D8D1C5] text-[#2B2621] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Share to WhatsApp, Instagram, or AirDrop"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#E85D04]" />
                  <span>{presets.shareBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyClipboard}
                  disabled={!previewCanvas || isCompositing}
                  className="py-1.5 px-3 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE0D3] border border-[#D8D1C5] text-[#2B2621] font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Copy image to clipboard for WhatsApp Web / Discord"
                >
                  <Copy className="w-3.5 h-3.5 text-[#B85F45]" />
                  <span>{presets.copyBtn}</span>
                </button>
              </div>

              {/* Direct Social Links */}
              <div className="flex items-center justify-center gap-3 pt-0.5">
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#16A34A] hover:underline flex items-center gap-1"
                >
                  <WhatsappIcon className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <span className="text-[#D9C9B4]">•</span>
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#0284C7] hover:underline flex items-center gap-1"
                >
                  <XSocialIcon className="w-3.5 h-3.5" />
                  <span>{presets.shareX}</span>
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
            <div className="w-full max-w-sm bg-[#FAF8F5] border-2 border-[#D8D1C5] rounded-2xl p-5 shadow-2xl text-[#2B2621] space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2B2621]">
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
                  <p className="text-xs text-[#5A5248] mt-1 leading-relaxed">
                    {confirmDialog.type === 'clear-all'
                      ? locale === 'mr'
                        ? 'तुम्हाला खात्री आहे की तुम्ही सर्व स्क्रीनशॉट हटवू इच्छिता? ही कृती पूर्ववत केली जाऊ शकत नाही.'
                        : locale === 'hi'
                        ? 'क्या आप वाकई स्थानीय स्टोरेज से सभी स्क्रीनशॉट हटाना चाहते हैं? यह क्रिया पूर्ववत नहीं की जा सकती।'
                        : 'Are you sure you want to clear all local screenshots? This action cannot be undone.'
                      : locale === 'mr'
                      ? 'हा स्क्रीनशॉट कायमचा हटवला जाईल.'
                      : locale === 'hi'
                      ? 'यह स्क्रीनशॉट हमेशा के लिए हटा दिया जाएगा।'
                      : 'This snapshot will be permanently removed from local storage.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D8D1C5]">
                <button
                  type="button"
                  onClick={() => setConfirmDialog({ isOpen: false, type: 'clear-all' })}
                  className="px-3 py-1.5 rounded-lg border border-[#D8D1C5] bg-[#EBE6DC] text-[#2B2621] text-xs font-semibold hover:bg-[#EAE0D3] transition-colors cursor-pointer"
                >
                  {locale === 'mr' ? 'रद्द करा' : locale === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
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
