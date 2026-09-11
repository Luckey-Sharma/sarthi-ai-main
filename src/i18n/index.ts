import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Language } from '../types';
import { TranslationSchema } from './types';
import { en } from './en';
import { hi } from './hi';
import { as } from './as';
import { bn } from './bn';
import { mni } from './mni';
import { storage } from '../services/storage';

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  en,
  hi,
  as,
  bn,
  mni,
};

export interface LanguageInfo {
  code: Language;
  name: string;
  native: string;
  region: string;
  icon: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', native: 'English', region: 'Primary / Pan-India', icon: '🌿' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', region: 'Pan-India', icon: '🪔' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া', region: 'Assam', icon: '🦏' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', region: 'Barak Valley & Bengal', icon: '🌸' },
  { code: 'mni', name: 'Manipuri', native: 'মৈতৈলোন্', region: 'Manipur', icon: '🦌' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (path: string) => path,
});

/**
 * Deep key lookup in a translation dictionary.
 * Supports dot-separated keys like "games.teaGarden.title".
 * Also supports legacy flat keys like "teaGardenTitle" by searching common locations.
 */
export function resolveTranslationKey(
  dict: any,
  fallbackDict: any,
  path: string,
  params?: Record<string, string | number>
): string {
  if (!path) return '';

  // 1. Try direct dot-path lookup
  let current = dict;
  const parts = path.split('.');
  let found = true;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      found = false;
      break;
    }
  }

  // 2. If not found in primary dictionary, try fallback dictionary (en)
  if (!found || typeof current !== 'string') {
    let fallbackCurrent = fallbackDict;
    let fallbackFound = true;
    for (const part of parts) {
      if (fallbackCurrent && typeof fallbackCurrent === 'object' && part in fallbackCurrent) {
        fallbackCurrent = fallbackCurrent[part];
      } else {
        fallbackFound = false;
        break;
      }
    }
    if (fallbackFound && typeof fallbackCurrent === 'string') {
      current = fallbackCurrent;
    } else {
      // 3. Backward compatibility: check flat dictionary legacy keys
      current = findLegacyKey(dict, path) || findLegacyKey(fallbackDict, path) || path;
    }
  }

  // Interpolate parameters e.g. {count: 5} for {{count}}
  if (typeof current === 'string' && params) {
    let result = current;
    for (const [key, val] of Object.entries(params)) {
      result = result.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), String(val));
    }
    return result;
  }

  return typeof current === 'string' ? current : path;
}

/**
 * Helper to map legacy flat keys to the new nested schema
 */
function findLegacyKey(dict: any, flatKey: string): string | undefined {
  if (!dict || typeof dict !== 'object') return undefined;

  // Check common namespace
  if (dict.common && flatKey in dict.common) return dict.common[flatKey];
  // Check navigation namespace
  if (dict.navigation && flatKey in dict.navigation) return dict.navigation[flatKey];
  // Check elderlyHome namespace
  if (dict.elderlyHome && flatKey in dict.elderlyHome) return dict.elderlyHome[flatKey];
  // Check reminders namespace
  if (dict.reminders && flatKey in dict.reminders) return dict.reminders[flatKey];
  // Check calming namespace
  if (dict.calming && flatKey in dict.calming) return dict.calming[flatKey];
  // Check safeCard namespace
  if (dict.safeCard && flatKey in dict.safeCard) return dict.safeCard[flatKey];
  // Check caregiver namespace
  if (dict.caregiver && flatKey in dict.caregiver) return dict.caregiver[flatKey];

  return undefined;
}

/**
 * Standalone translator for non-React contexts
 */
export function t(
  path: string,
  lang: Language = 'en',
  params?: Record<string, string | number>
): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return resolveTranslationKey(dict, TRANSLATIONS.en, path, params);
}

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguage,
  onLanguageChange,
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return initialLanguage || storage.loadLanguage() || 'en';
  });

  useEffect(() => {
    if (initialLanguage && initialLanguage !== language) {
      setLanguageState(initialLanguage);
    }
  }, [initialLanguage]);

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    storage.saveLanguage(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const tFunc = useMemo(() => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.en;
    const fallback = TRANSLATIONS.en;
    return (path: string, params?: Record<string, string | number>) =>
      resolveTranslationKey(dict, fallback, path, params);
  }, [language]);

  return React.createElement(
    LanguageContext.Provider,
    { value: { language, setLanguage, t: tFunc } },
    children
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

/**
 * Translation Completeness Checker:
 * Traverses all keys in en.ts and asserts their existence in target dictionaries.
 */
export function validateTranslations(): {
  isValid: boolean;
  missingKeys: Record<Language, string[]>;
  totalKeys: number;
} {
  const missingKeys: Record<Language, string[]> = {
    en: [],
    hi: [],
    as: [],
    bn: [],
    mni: [],
  };

  function extractKeys(obj: any, prefix = ''): string[] {
    let keys: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      const fullPath = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        keys = keys.concat(extractKeys(v, fullPath));
      } else {
        keys.push(fullPath);
      }
    }
    return keys;
  }

  const enKeys = extractKeys(en);

  const targets: Language[] = ['hi', 'as', 'bn', 'mni'];

  for (const lang of targets) {
    const dict = TRANSLATIONS[lang];
    for (const keyPath of enKeys) {
      const parts = keyPath.split('.');
      let cur = dict as any;
      let found = true;
      for (const p of parts) {
        if (cur && typeof cur === 'object' && p in cur && cur[p] !== undefined && cur[p] !== '') {
          cur = cur[p];
        } else {
          found = false;
          break;
        }
      }
      if (!found) {
        missingKeys[lang].push(keyPath);
      }
    }
  }

  const totalMissing = Object.values(missingKeys).reduce((sum, list) => sum + list.length, 0);

  return {
    isValid: totalMissing === 0,
    missingKeys,
    totalKeys: enKeys.length,
  };
}

export * from './types';
