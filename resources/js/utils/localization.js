import i18n from '../i18n';

/**
 * Get the localized name of an entity (Wilaya, Commune, etc.)
 * Checks the current language and returns the appropriate name field.
 * Falls back to 'name' (Latin) if 'name_ar' is missing or empty.
 * 
 * @param {Object} item - The entity object containing name and name_ar
 * @param {string} lang - Optional language code (defaults to current i18n language)
 * @returns {string} - The localized name
 */
export const getLocalizedName = (item, lang = null) => {
    if (!item) return '';

    const currentLang = lang || i18n.language;

    if (currentLang === 'ar' && item.name_ar) {
        return item.name_ar;
    }

    return item.name || '';
};
