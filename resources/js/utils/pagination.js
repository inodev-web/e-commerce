/**
 * Translate and clean pagination labels
 * @param {string} label - The label from Laravel pagination
 * @param {Function} getLabel - The translation function
 * @returns {string} - The translated and cleaned label
 */
export function getPaginationLabel(label, getLabel) {
    if (!label) return '';

    let text = label;

    // Detect and translate previous/next buttons
    // Look for « (left-pointing guillemet) for previous or &laquo;
    if (text.includes('&laquo;') || text.includes('«') || text.includes('pagination.previous')) {
        text = getLabel('pagination.previous') || 'Précédent';
    } 
    // Look for » (right-pointing guillemet) for next or &raquo;
    else if (text.includes('&raquo;') || text.includes('»') || text.includes('pagination.next')) {
        text = getLabel('pagination.next') || 'Suivant';
    }
    // Also handle common numeric pages - just return as is
    else if (/^\d+$/.test(text.trim())) {
        return text.trim();
    }

    return text.trim();
}
