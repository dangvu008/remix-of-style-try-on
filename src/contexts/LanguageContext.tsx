import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language, TranslationKey } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const defaultContext: LanguageContextType = {
  language: 'vi',
  setLanguage: () => {
    // no-op fallback when provider is missing
    if (import.meta.env.DEV) {
      console.warn('LanguageProvider is missing; setLanguage() is a no-op.');
    }
  },
  t: (key) => translations.vi[key] || key,
};

// Provide a safe default so the app never crashes if a component renders outside LanguageProvider
const LanguageContext = createContext<LanguageContextType>(defaultContext);

const LANGUAGE_STORAGE_KEY = 'app_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') return saved;
      // Auto-detect from browser
      const browserLang = navigator.language.toLowerCase();
      return browserLang.startsWith('vi') ? 'vi' : 'en';
    } catch {
      return 'vi';
    }
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  return useContext(LanguageContext);
};
