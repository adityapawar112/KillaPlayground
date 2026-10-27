import { useEditorStore } from '@/lib/state/useEditorStore';
import { TRANSLATIONS, Locale } from './translations';

export const useTranslation = () => {
  const locale = useEditorStore((state) => state.locale);
  const setLocale = useEditorStore((state) => state.setLocale);
  const t = TRANSLATIONS[locale] || TRANSLATIONS.en;

  return { t, locale, setLocale };
};
