import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function SearchBar() {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);
    const timeoutRef = useRef(null);

    // Debounce API call - 300ms delay to avoid excessive requests
    useEffect(() => {
        // Clear previous timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Reset if query is empty
        if (!query.trim()) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        // Only search if query is 2+ characters
        if (query.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Set debounce timer
        timeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

                if (!response.ok) {
                    throw new Error('Search failed');
                }

                const data = await response.json();
                setResults(data.data || []);
                setIsOpen(true);
                setIsLoading(false);
            } catch (err) {
                console.error('Search error:', err);
                setError(t('common.search_error', 'Erreur lors de la recherche'));
                setResults([]);
                setIsLoading(false);
            }
        }, 300); // 300ms debounce delay

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [query]);

    // Handle click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Navigate to product page
    const handleSelectProduct = (productUrl) => {
        router.visit(productUrl);
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    // Handle input change
    const handleInputChange = (e) => {
        setQuery(e.target.value);
    };

    // Handle form submission (if user presses Enter)
    const handleSubmit = (e) => {
        e.preventDefault();
        if (results.length > 0) {
            handleSelectProduct(results[0].url);
        }
    };

    return (
        <div ref={dropdownRef} className="relative w-full">
            <form id="search-form" name="searchForm" onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    placeholder={t('common.search_placeholder', 'Rechercher un produit...')}
                    value={query}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 md:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoComplete="off"
                />
                {/* Loading indicator */}
                {isLoading && (
                    <div className="absolute right-2 sm:right-3 top-2.5 text-gray-500 dark:text-gray-400">
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </form>

            {/* Dropdown results */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-[calc(100vh-200px)] overflow-hidden">
                    {error && (
                        <div className="px-3 sm:px-4 py-2 sm:py-3 text-red-600 dark:text-red-400 text-xs sm:text-sm bg-red-50 dark:bg-red-900/20 border-b dark:border-gray-700">
                            {error}
                        </div>
                    )}

                    {results.length > 0 ? (
                        <ul className="max-h-96 overflow-y-auto">
                            {results.map((product) => (
                                <li key={product.id}>
                                    <button
                                        onClick={() => handleSelectProduct(product.url)}
                                        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b dark:border-gray-700 last:border-b-0"
                                    >
                                        {/* Product image */}
                                        <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/images/placeholder.jpg';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product details */}
                                        <div className="flex-1 min-w-0 text-left">
                                            <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {product.name}
                                            </h4>
                                            {product.category && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {product.category}
                                                </p>
                                            )}
                                            <p className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-500 mt-0.5">
                                                {product.price} DA
                                            </p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                            {t('common.no_results', 'Aucun produit trouvé')}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
