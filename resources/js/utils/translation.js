export function getTranslated(model, field, locale = null) {
    // Handle null/undefined model or field
    if (!model || !field) return '';

    try {
        // Get the value safely with optional chaining
        const value = model?.[field];

        // If value is explicitly null or undefined, return empty string
        if (value === null || value === undefined) {
            return '';
        }

        // If it's an object (including arrays and plain objects)
        if (typeof value === 'object') {
            // If it's an empty array, return empty string
            if (Array.isArray(value) && value.length === 0) {
                return '';
            }

            // If it's an object but all values are null/empty, handle gracefully
            const objectKeys = Object.keys(value).filter(k => value[k] !== null && value[k] !== undefined && value[k] !== '');
            if (objectKeys.length === 0) {
                return '';
            }

            // Get current locale from document or use provided
            const currentLocale = locale || document.documentElement.lang || 'fr';

            // Return the translated value or fallback to 'fr' or first non-empty available
            let result = value[currentLocale];

            // If not found in current locale, try 'fr'
            if (!result) {
                result = value['fr'];
            }

            // If still not found, find the first non-empty value
            if (!result) {
                result = Object.values(value).find(v => v !== null && v !== undefined && v !== '');
            }

            // If we still have nothing, return empty string
            if (!result) {
                return '';
            }

            // Handle the result
            if (typeof result === 'object') {
                try {
                    return JSON.stringify(result) || '';
                } catch (e) {
                    console.error(`Error stringifying result for field: ${field}`, e);
                    return '';
                }
            }

            // Final safeguard: convert to string safely
            try {
                const stringResult = String(result).trim();
                return stringResult === 'null' || stringResult === 'undefined' || stringResult === '' ? '' : stringResult;
            } catch (e) {
                console.error(`Error converting result to string for field: ${field}`, e);
                return '';
            }
        }

        // If not an object (simple string, number, boolean, etc.)
        if (Array.isArray(value) && value.length === 0) {
            return '';
        }

        try {
            const stringResult = String(value).trim();
            return stringResult === 'null' || stringResult === 'undefined' || stringResult === '' ? '' : stringResult;
        } catch (e) {
            console.error(`Error converting value to string for field: ${field}`, e);
            return '';
        }
    } catch (e) {
        console.error(`Error in getTranslated for field: ${field}`, e);
        return '';
    }
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
