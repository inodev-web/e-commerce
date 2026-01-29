import React from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '' }) {
    const { i18n } = useTranslation();
    const currentLang = i18n.language || 'fr';

    const toggleLanguage = () => {
        const newLang = currentLang === 'fr' ? 'ar' : 'fr';

        // Change i18n language
        i18n.changeLanguage(newLang);

        // Update document direction
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;

        // Persist language to server via query parameter (session will be updated by middleware)
        router.visit(window.location.pathname, {
            data: { lang: newLang },
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <button
            onClick={toggleLanguage}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
            aria-label="Change language"
        >
            <Globe className="w-5 h-5" />
            <span className="font-medium">{currentLang.toUpperCase()}</span>
        </button>
    );
}
