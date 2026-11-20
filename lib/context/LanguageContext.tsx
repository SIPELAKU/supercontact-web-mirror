'use client';
import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { strings } from '@/lib/utils/strings';
import { isFeatureHidden } from '@/lib/config/featureFlags';
import { LANGUAGE_STORAGE_KEY, type Language } from '@/lib/constants/i18n';
import { appLanguage as resolveAppLanguage, parseLanguage, readStoredLanguage, siteLanguage, writeStoredLanguage } from '@/lib/utils/language';

interface LanguageContextProps {
    /** The public site's language (Navbar ID/EN button, `strings`). */
    language: Language;
    /** The logged-in app's language (`useT`). */
    appLanguage: Language;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

function browserStorage(): Storage | null {
    try {
        return typeof window === 'undefined' ? null : window.localStorage;
    } catch {
        return null;
    }
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    // While the app's switch is hidden, everything works as before: the site
    // starts in Indonesian, its choice is not saved, and the app stays English.
    const switchHidden = isFeatureHidden('languageSwitch');
    const [choice, setChoice] = useState<Language | null>(null);
    const language = siteLanguage(choice);

    // `strings` is read during render, so it changes before the re-render.
    const apply = useCallback((lang: Language) => {
        strings.setLanguage(lang);
        setChoice(lang);
    }, []);

    const setLanguage = (lang: Language) => {
        apply(lang);
        if (!switchHidden) writeStoredLanguage(browserStorage(), lang);
    };

    // The saved choice, and a choice made in another tab.
    useEffect(() => {
        if (switchHidden) return;
        const stored = readStoredLanguage(browserStorage());
        if (stored) apply(stored);
        const onStorage = (event: StorageEvent) => {
            const next = event.key === LANGUAGE_STORAGE_KEY ? parseLanguage(event.newValue) : null;
            if (next) apply(next);
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [switchHidden, apply]);

    useEffect(() => {
        strings.setLanguage(language);
        document.documentElement.lang = language;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, appLanguage: resolveAppLanguage(choice, switchHidden), setLanguage }}>
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
