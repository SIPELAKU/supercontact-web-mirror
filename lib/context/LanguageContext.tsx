'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { strings } from '@/lib/utils/strings';

type Language = 'en' | 'id';

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<Language>('id');

    const setLanguage = (lang: Language) => {
        strings.setLanguage(lang);
        setLanguageState(lang);
        if (typeof document !== 'undefined') {
            document.documentElement.lang = lang;
        }
    };

    // Initialize language
    React.useEffect(() => {
        strings.setLanguage(language);
        document.documentElement.lang = language;
    }, []);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
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
