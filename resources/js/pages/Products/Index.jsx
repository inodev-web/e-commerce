import React, { useState } from 'react';
import { ShoppingCart, Star, Filter, Search as SearchIcon } from 'lucide-react';
import { router, Link } from '@inertiajs/react';
import { getTranslated } from '@/utils/translation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartConfirmationModal from '../../components/CartConfirmationModal';
import '../../../css/shopPage.css';

const Index = ({ products, categories, filters, theme, toggleTheme }) => {
    const [search, setSearch] = useState(filters.search || '');

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        // Remove empty values
        Object.keys(newFilters).forEach(k => {
            if (newFilters[k] === null || newFilters[k] === '') {
                delete newFilters[k];
            }
        });

        router.get(route('products.index'), newFilters, {
            preserveState: true,
            replace: true
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        handleFilterChange('search', search);
    };

    const clearFilters = () => {
        router.get(route('products.index'), {});
    };


    const [modalOpen, setModalOpen] = useState(false);
    const [addedProduct, setAddedProduct] = useState(null);

    const addToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        router.post(route('cart.add'), {
            product_id: product.id,
            quantity: 1
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setAddedProduct(product);
                setModalOpen(true);
            }
        });
    };

    return (
        <div className="shop-page">
            <Header theme={theme} toggleTheme={toggleTheme} />

            <main className="shop-container">
                <div className="shop-header">
                    <h1 className="shop-title">Tous les Produits</h1>
                    <p className="shop-subtitle">Découvrez notre sélection de produits parapharmaceutiques de qualité.</p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-8">
                    <form onSubmit={handleSearch} className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-28 py-3 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-[#DB8B89]/25 focus:border-[#DB8B89] outline-none transition-shadow"
                        />
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#DB8B89]" size={20} />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#DB8B89] text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-[#C07573] transition-colors">
                            Rechercher
                        </button>
                    </form>
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    <div className="filter-left">
                        <span className="filter-label">FILTRER PAR:</span>

                        {/* Categories Filter */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="filter-button">
                                    Catégories <span className="arrow">▼</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] p-6 lg:p-10">
                                <DialogHeader>
                                    <DialogTitle>Catégories</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 mt-2 max-h-60 overflow-y-auto">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="space-y-2">
                                            <div className="flex items-center gap-2 font-bold text-gray-800">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.category_id == cat.id}
                                                    onChange={() => handleFilterChange('category_id', filters.category_id == cat.id ? null : cat.id)}
                                                    className="rounded border-gray-300"
                                                />
                                                <span>{getTranslated(cat, 'name')}</span>
                                            </div>
                                            {cat.sub_categories && cat.sub_categories.map(sub => (
                                                <div key={sub.id} className="flex items-center gap-2 pl-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={filters.sub_category_id == sub.id}
                                                        onChange={() => handleFilterChange('sub_category_id', filters.sub_category_id == sub.id ? null : sub.id)}
                                                        className="rounded border-gray-300"
                                                    />
                                                    <label className="text-sm">{getTranslated(sub, 'name')}</label>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter>
                                    <button className="apply-button" onClick={() => router.reload()}>Fermer</button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Price Filter */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="filter-button">
                                    Prix <span className="arrow">▼</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] p-10">
                                <DialogHeader>
                                    <DialogTitle>Plage de prix</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 mt-2">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500">Min (DA)</label>
                                            <input
                                                type="number"
                                                value={filters.min_price || ''}
                                                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                                className="w-full border rounded-lg p-2"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-500">Max (DA)</label>
                                            <input
                                                type="number"
                                                value={filters.max_price || ''}
                                                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                                className="w-full border rounded-lg p-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <button className="apply-button" onClick={() => router.reload()}>Fermer</button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="filter-right">
                        <span>{products.total} produits</span>
                        <div className="sort-selector">
                            <select
                                className="bg-transparent outline-none cursor-pointer"
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                value={filters.sort ? String(filters.sort) : ''}
                            >
                                <option value="">Pertinence</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix décroissant</option>
                                <option value="newest">Nouveautés</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Active Filters */}
                {Object.keys(filters).length > 0 && (
                    <div className="active-filters">
                        {filters.search && <span className="filter-tag">Search: {filters.search} <button onClick={() => handleFilterChange('search', null)}>✕</button></span>}
                        {filters.category_id && <span className="filter-tag">Category ID: {filters.category_id} <button onClick={() => handleFilterChange('category_id', null)}>✕</button></span>}
                        <button className="clear-all" onClick={clearFilters}>Tout effacer</button>
                    </div>
                )}

                {/* Product Grid */}
                <div className="product-grid">
                    {products.data.length > 0 ? products.data.map((product) => (
                        <Link key={product.id} href={route('products.show', product.id)} className="top-seller-card h-full">
                            {product.stock <= 0 && (
                                <span className="seller-badge out-of-stock">RUPTURE</span>
                            )}
                            <div className="seller-rating">
                                <Star size={14} fill="#FFC107" stroke="#FFC107" />
                                <span>{(Math.random() * (5 - 4) + 4).toFixed(1)}</span>
                            </div>
                            <div className="seller-image bg-gray-50">
                                <img
                                    src={product.images && product.images.length > 0 ? `/storage/${product.images[0].image_path}` : '/placeholder.svg'}
                                    alt={getTranslated(product, 'name')}
                                    className="seller-image-img object-cover"
                                />
                            </div>
                            <div className="seller-info">
                                <div className="seller-brand text-xs uppercase tracking-wider text-teal-600 font-bold mb-1">
                                    {product.sub_category ? getTranslated(product.sub_category, 'name') : 'Puréva'}
                                </div>
                                <h3 className="seller-name text-gray-800 font-semibold line-clamp-2 min-h-[3rem]">{getTranslated(product, 'name')}</h3>
                                <div className="seller-price mt-auto flex items-center justify-between font-bold text-lg text-gray-900">
                                    {product.price.toLocaleString()} DA
                                    <button
                                        className="add-to-cart-btn"
                                        aria-label="Add to cart"
                                        onClick={(e) => addToCart(e, product)}
                                        disabled={product.stock <= 0}
                                    >
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <div className="col-span-full py-20 text-center text-gray-500 italic">
                            Aucun produit ne correspond à vos critères.
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
                                className={`px-4 py-2 rounded-lg border transition-all ${link.active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 hover:border-teal-600'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
            <CartConfirmationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                product={addedProduct}
            />
        </div>
    );
};

export default Index;
