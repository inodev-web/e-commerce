import '../css/app.css';
import { Toaster } from 'sonner';
import './bootstrap';
import './i18n';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.jsx`,
            import.meta.glob('./pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Wrapper component to handle RTL
        const AppWrapper = () => {
            const { i18n } = useTranslation();

            useEffect(() => {
                // Sync i18n with server locale
                const locale = props.initialPage.props.locale || 'fr';
                if (i18n.language !== locale) {
                    i18n.changeLanguage(locale);
                }

                // Set document direction
                document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = locale;
            }, [props.initialPage.props.locale]);

            return (
                <>
                    <Toaster position="top-right" richColors closeButton />
                    <App {...props} />
                </>
            );
        };

        root.render(<AppWrapper />);
    },
    progress: {
        color: '#4B5563',
    },
});

// Global 419 CSRF error fallback
import { router } from '@inertiajs/react';
router.on('error', (event) => {
    const response = event.detail.response;
    if (response && response.status === 419) {
        console.warn('Session expired (419). Attempting transparent reload...');
        window.location.reload();
    }
});
