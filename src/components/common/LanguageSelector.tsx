'use client';

import React from 'react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import type { Locale } from '@/lib/i18n/translations';

interface LanguageSelectorProps {
  className?: string;
  size?: 'sm' | 'md';
}

const LANGUAGES: Array<{ id: Locale; label: string; title: string }> = [
  { id: 'en', label: 'EN', title: 'English' },
  { id: 'mr', label: 'म', title: 'मराठी (Marathi)' },
  { id: 'hi', label: 'हि', title: 'हिंदी (Hindi)' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  size = 'md',
}) => {
  const { locale, setLocale } = useTranslation();

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : 'px-2.5 py-0.5 text-[11px]';

  return (
    <div
      role="radiogroup"
      aria-label="Language selection"
      className={`inline-flex items-center bg-[#EBE6DC] p-0.5 rounded-full border border-[#D8D1C5] select-none shadow-xs font-sans ${className}`}
    >
      {LANGUAGES.map((lang) => {
        const isActive = locale === lang.id;
        return (
          <button
            key={lang.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={lang.title}
            title={lang.title}
            onClick={() => setLocale(lang.id)}
            className={`relative rounded-full font-semibold transition-all duration-150 cursor-pointer ${sizeClasses} ${
              isActive
                ? 'bg-[#2B2621] text-[#FAF8F5] shadow-xs'
                : 'text-[#7C7267] hover:text-[#2B2621] hover:bg-[#D8D1C5]/60'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};

