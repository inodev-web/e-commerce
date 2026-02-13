/**
 * Analytics utility to track events across different platforms (Facebook, TikTok, Google)
 * 
 * @param {string} eventName - The name of the event (e.g., 'AddToCart', 'Purchase')
 * @param {object} data - Event parameters
 */
export const trackEvent = (eventName, data = {}) => {
    // 1. Meta (Facebook) Pixel
    if (typeof window.fbq === 'function') {
        window.fbq('track', eventName, data);
    }

    // 2. TikTok Pixel
    if (typeof window.ttq === 'object' && typeof window.ttq.track === 'function') {
        window.ttq.track(eventName, data);
    }

    // 3. Snapchat Pixel
    if (typeof window.snaptr === 'function') {
        window.snaptr('track', eventName, data);
    }

    // 4. Google Analytics (gtag)
    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, data);
    }

    // Debug log for development (can be removed in production)
    if (import.meta.env.DEV) {
        console.log(`[Analytics] Tracked ${eventName}:`, data);
    }
};
