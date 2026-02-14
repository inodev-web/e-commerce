import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Search as SearchIcon, Sparkles, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { router, Link, usePage } from '@inertiajs/react';
import { getTranslated } from '@/utils/translation';
import { getLabel } from '../../utils/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../../components/ui/dialog';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartConfirmationModal from '../../components/CartConfirmationModal';
import { trackEvent } from '@/utils/analytics';
import '../../../css/shopPage.css';

const Index = ({ products, categories, filters, theme, toggleTheme }) => {
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        Object.keys(newFilters).forEach(k => {
            if (newFilters[k] === null || newFilters[k] === '') {
                delete newFilters[k];
            }
        });

        router.get(route('products.index'), newFilters, {
            preserveState: true,
            replace: true,
            preserveScroll: true
        });
    };

    // Debounce implementation for Price
    const [priceFilters, setPriceFilters] = useState({
        min_price: filters.min_price || '',
        max_price: filters.max_price || ''
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (priceFilters.min_price !== (filters.min_price || '') || priceFilters.max_price !== (filters.max_price || '')) {
                const newFilters = { ...filters };
                if (priceFilters.min_price) newFilters.min_price = priceFilters.min_price;
                else delete newFilters.min_price;

                if (priceFilters.max_price) newFilters.max_price = priceFilters.max_price;
                else delete newFilters.max_price;

                router.get(route('products.index'), newFilters, {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [priceFilters]);

    const handlePriceChange = (key, value) => {
        setPriceFilters(prev => ({ ...prev, [key]: value }));
    };

    // Debounce implementation for Search
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                const newFilters = { ...filters };
                if (searchTerm) newFilters.search = searchTerm;
                else delete newFilters.search;

                router.get(route('products.index'), newFilters, {
                    preserveState: true,
                    replace: true,
                    preserveScroll: true
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleSearch = (e) => {
        e.preventDefault();
    };

    const clearFilters = () => {
        router.get(route('products.index'), {});
    };

    const [modalOpen, setModalOpen] = useState(false);
    const [addedProduct, setAddedProduct] = useState(null);

    // Back to top
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const addToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        router.post(route('cart.add'), {
            product_id: product.id,
            quantity: 1
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setAddedProduct(product);
                setModalOpen(true);
                toast.success(getLabel('product_added_to_cart') || 'Produit ajoutÃ© au panier');

                trackEvent('AddToCart', {
                    content_name: getTranslated(product, 'name'),
                    content_ids: [product.id],
                    content_type: 'product',
                    value: product.price,
                    currency: 'DZD'
                });
            }
        });
    };

    return (
        <div className="shop-page">
            <Header theme={theme} toggleTheme={toggleTheme} />

            <main className="shop-container">
                {/* Hero Header */}
                <div className="shop-hero">
                    <Sparkles className="shop-hero-sparkle" size={20} />
                    <Sparkles className="shop-hero-sparkle" size={16} />
                    <Sparkles className="shop-hero-sparkle" size={14} />
                    <h1 className="shop-title">{getLabel('all_products')}</h1>
                    <p className="shop-subtitle">
                        utilisez les filtres et la barre de recherche
                    </p>
                    <div className="shop-hero-divider" />
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-left">
                        <span className="filter-label">{getLabel('filter_by')}</span>

                        {/* Categories Filter */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="filter-button">
                                    {getLabel('categories')} <span className="arrow">â–¼</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] p-6 lg:p-10">
                                <DialogHeader>
                                    <DialogTitle>{getLabel('categories')}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 mt-2 max-h-60 overflow-y-auto">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="space-y-2">
                                            <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.category_id == cat.id}
                                                    onChange={() => handleFilterChange('category_id', filters.category_id == cat.id ? null : cat.id)}
                                                    className="rounded border-gray-300 accent-[#DB8B89]"
                                                />
                                                <span>{getTranslated(cat, 'name')}</span>
                                            </div>
                                            {cat.sub_categories && cat.sub_categories.map(sub => (
                                                <div key={sub.id} className="flex items-center gap-2 pl-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.sub_category_id == sub.id}
                                                        onChange={() => handleFilterChange('sub_category_id', filters.sub_category_id == sub.id ? null : sub.id)}
                                                        className="rounded border-gray-300 accent-[#DB8B89]"
                                                    />
                                                    <label className="text-sm dark:text-gray-300">{getTranslated(sub, 'name')}</label>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <button className="apply-button">{getLabel('close')}</button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Price Filter */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="filter-button">
                                    {getLabel('price')} <span className="arrow">â–¼</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] p-10">
                                <DialogHeader>
                                    <DialogTitle>{getLabel('price')}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 mt-2">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 dark:text-gray-400">{getLabel('min')} (DA)</label>
                                            <input
                                                type="number"
                                                value={priceFilters.min_price}
                                                onChange={(e) => handlePriceChange('min_price', e.target.value)}
                                                className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500 dark:text-gray-400">{getLabel('max')} (DA)</label>
                                            <input
                                                type="number"
                                                value={priceFilters.max_price}
                                                onChange={(e) => handlePriceChange('max_price', e.target.value)}
                                                className="w-full border rounded-lg p-2 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <button className="apply-button">{getLabel('close')}</button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="filter-right">
                        <form onSubmit={handleSearch} className="relative w-full max-w-xs">
                            <input
                                type="text"
                                placeholder={getLabel('search') + "..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-[#DB8B89]/25 focus:border-[#DB8B89] outline-none transition-all text-sm"
                            />
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#DB8B89]" size={16} />
                        </form>
                    </div>
                </div>

                {/* Active Filters */}
                {Object.keys(filters).length > 0 && (
                    <div className="active-filters">
                        {filters.search && (
                            <span className="filter-tag">
                                {getLabel('search')}: {filters.search}
                                <button onClick={() => setSearchTerm('')}>âœ•</button>
                            </span>
                        )}
                        {filters.category_id && (
                            <span className="filter-tag">
                                {getLabel('categories')}: {categories.find(c => c.id == filters.category_id)?.name || filters.category_id}
                                <button onClick={() => handleFilterChange('category_id', null)}>âœ•</button>
                            </span>
                        )}
                        {filters.min_price && (
                            <span className="filter-tag">
                                Min: {filters.min_price} DA
                                <button onClick={() => handlePriceChange('min_price', '')}>âœ•</button>
                            </span>
                        )}
                        {filters.max_price && (
                            <span className="filter-tag">
                                Max: {filters.max_price} DA
                                <button onClick={() => handlePriceChange('max_price', '')}>âœ•</button>
                            </span>
                        )}
                        <button className="clear-all" onClick={clearFilters}>
                            {getLabel('clear_all') || 'Tout effacer'}
                        </button>
                    </div>
                )}

                {/* Results Bar */}
                <div className="results-bar">
                    <p className="results-count">
                        <strong>{products.total || products.data.length}</strong> {getLabel('products_found') || 'produits trouvÃ©s'}
                    </p>
                </div>

                {/* Product Grid */}
                <div className="product-grid">
                    {products.data.length > 0 ? products.data.map((product) => (
                        <Link key={product.id} href={route('products.show', product.id)} className="top-seller-card h-full">
                            {product.stock <= 0 && (
                                <span className="seller-badge out-of-stock">{getLabel('out_of_stock')}</span>
                            )}
                            <div className="seller-rating">
                                <Star size={14} fill="#FFC107" stroke="#FFC107" />
                                <span>{(Math.random() * (5 - 4) + 4).toFixed(1)}</span>
                            </div>
                            <div className="seller-image bg-gray-50 dark:bg-gray-800">
                                <img
                                    src={product.images && product.images.length > 0 ? `/storage/${product.images[0].image_path}` : '/placeholder.svg'}
                                    alt={getTranslated(product, 'name')}
                                    className="seller-image-img object-cover"
                                />
                            </div>
                            <div className="seller-info">
                                <div className="seller-brand text-xs uppercase tracking-wider font-bold mb-1">
                                    {product.sub_category ? getTranslated(product.sub_category, 'name') : 'PurÃ©va'}
                                </div>
                                <h3 className="seller-name text-gray-800 dark:text-gray-100 font-semibold line-clamp-2 min-h-[3rem]">
                                    {getTranslated(product, 'name')}
                                </h3>
                                <div className="seller-price mt-auto flex items-center justify-between font-bold text-lg text-gray-900 dark:text-gray-100">
                                    {product.price.toLocaleString()} DA
                                    <button
                                        className="add-to-cart-btn"
                                        aria-label="View product"
                                    >
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="shop-empty-state">
                            <div className="empty-icon">ðŸ”</div>
                            <p>{getLabel('no_products_match') || 'Aucun produit ne correspond Ã  vos critÃ¨res.'}</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {products.links && products.links.length > 3 && (
                    <div className="pagination flex justify-center items-center gap-2 mt-12">
                        {products.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-4 py-2 rounded-xl border transition-all ${link.active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white/70 text-gray-600 hover:border-[#DB8B89] hover:text-[#DB8B89] dark:bg-white/5 dark:text-gray-400'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />

            {/* Back to Top */}
            <button
                className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <ChevronUp size={22} />
            </button>

            <CartConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                product={addedProduct}
            />
        </div>
    );
};

export default Index;
