/**
 * Get translated field from a model
 * @param {Object} model - The model with translatable fields
 * @param {string} field - The field name (e.g., 'name', 'description')
 * @param {string} locale - The locale (defaults to current i18n language)
 * @returns {string} The translated value or empty string
 */
export function getTranslated(model, field, locale = null) {
    if (!model || !field) return '';

    const value = model[field];

    // If not an object, return as is
    if (typeof value !== 'object' || value === null) {
        return value || '';
    }

    // Get current locale from document or use provided
    const currentLocale = locale || document.documentElement.lang || 'fr';

    // Return the translated value or fallback to 'fr' or first available
    return value[currentLocale] || value['fr'] || Object.values(value)[0] || '';
}

/**
 * Check if current language is RTL
 * @returns {boolean}
 */
export function isRTL() {
    return document.documentElement.dir === 'rtl';
}

/**
 * Get RTL-aware margin/padding class
 * @param {string} direction - 'l' or 'r' for left/right
 * @param {string} type - 'margin' or 'padding'
 * @param {string} size - Tailwind size (e.g., '4', '8')
 * @returns {string} RTL-aware class
 */
export function rtlClass(direction, type = 'margin', size = '4') {
    const rtl = isRTL();
    const prefix = type === 'margin' ? 'm' : 'p';

    if (direction === 'l') {
        return rtl ? `${prefix}r-${size}` : `${prefix}l-${size}`;
    } else if (direction === 'r') {
        return rtl ? `${prefix}l-${size}` : `${prefix}r-${size}`;
    }

    return '';
}
