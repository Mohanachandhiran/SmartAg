'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../../messages/en.json';
import ta from '../../messages/ta.json';
import hi from '../../messages/hi.json';

type Language = 'en' | 'ta' | 'hi';

type Translations = typeof en;

const translations: Record<Language, any> = {
  en,
  ta,
  hi
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyPath: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('smartag_lang') as Language;
    if (saved && ['en', 'ta', 'hi'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('smartag_lang', lang);
    // Optionally update user language via API if logged in
  };

  const t = (keyPath: string): string => {
    const keys = keyPath.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English
        let englishFallback: any = translations['en'];
        for (const fKey of keys) {
          if (englishFallback && englishFallback[fKey] !== undefined) {
            englishFallback = englishFallback[fKey];
          } else {
            return keyPath; // return key if not found
          }
        }
        return englishFallback;
      }
    }

    return typeof current === 'string' ? current : keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
