import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { dictionaries, type Language, type Dictionary } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  dict: Dictionary;
  setLanguage: (language: Language) => void;
}

const LANGUAGE_KEY = 'freight_language';

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored && stored in dictionaries) return stored as Language;
  return 'en';
}

const LanguageContext = createContext<LanguageState | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  function setLanguage(next: Language) { setLanguageState(next); }

  return (
    <LanguageContext.Provider value={{ language, dict: dictionaries[language], setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
