import React, { useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../shopPage.css';

const MOCK_PRODUCTS = [
    {
        id: 1,
        brand: 'LA ROCHE-POSAY',
        name: 'Sérum Vitamine C Pure',
        rating: 4,
        reviews: 85,
        price: 2999,
        image: 'https://i.pinimg.com/736x/8f/3e/32/8f3e32b40656096537f07dc6d4834861.jpg',
        badge: 'NOUVEAU',
        badgeColor: 'nouveau-badge',
        bgColor: '#FFF0E6'
    },
    {
        id: 2,
        brand: 'CERAVE',
        name: 'Crème Hydratante Visage',
        rating: 5,
        reviews: 124,
        price: 1850,
        image: 'https://i.pinimg.com/736x/2d/ed/ce/2dedce93282245e35cb433d7197b483e.jpg',
    },
    {
        id: 3,
        brand: 'VICHY',
        name: 'Minéral 89 Booster',
        rating: 3.5,
        reviews: 56,
        price: 3600,
        oldPrice: 4500,
        image: 'https://i.pinimg.com/736x/98/22/01/982201d72dd675d045d4304859f8f420.jpg',
        badge: '-20%',
        badgeColor: 'discount-badge'
    },
    {
        id: 4,
        brand: 'THE ORDINARY',
        name: 'Niacinamide 10% + Zinc 1%',
        rating: 5,
        reviews: 210,
        price: 1200,
        image: 'https://i.pinimg.com/736x/80/76/99/807699144df8555819777df50942c730.jpg',
    },
    {
        id: 5,
        brand: 'LA ROCHE-POSAY',
        name: 'Anthelios UV Mune 400',
        rating: 4.5,
        reviews: 98,
        price: 2400,
        image: 'https://i.pinimg.com/736x/e8/34/ec/e834ecab32f2ec6f294522432657e289.jpg',
    },
    {
        id: 6,
        brand: 'AVENE',
        name: 'Cicalfate+ Crème Réparatrice',
        rating: 5,
        reviews: 340,
        price: 1450,
        image: 'https://i.pinimg.com/736x/39/10/a4/3910a473855018659d4c79873d639682.jpg',
        badge: 'BEST SELLER',
        badgeColor: 'bestseller-badge'
    },
    {
        id: 7,
        brand: 'ESTEE LAUDER',
        name: 'Advanced Night Repair',
        rating: 4.5,
        reviews: 67,
        price: 9800,
        image: 'https://i.pinimg.com/736x/91/9f/61/919f6103639803029177114115161499.jpg',
    },
    {
        id: 8,
        brand: 'NUXE',
        name: 'Huile Prodigieuse',
        rating: 4,
        reviews: 156,
        price: 3200,
        image: 'https://i.pinimg.com/736x/e5/7e/4e/e57e4e899222621430983190be9078a9.jpg',
        badge: 'BIO',
        badgeColor: 'bio-badge'
    }
];

const ShopPage = ({ theme, toggleTheme }) => {
    return (
        <div className="shop-page">
            <Header theme={theme} toggleTheme={toggleTheme} />

            <main className="shop-container">
                <div className="shop-header">
                    <h1 className="shop-title">Tous les Produits</h1>
                    <p className="shop-subtitle">Découvrez notre sélection de soins pour le corps et le visage.</p>
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
                            <DialogContent className="sm:max-w-[425px] p-10">
                                <DialogHeader>
                                    <DialogTitle>Catégories</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 mt-2">
                                    {['Soins Visage', 'Soins Corps', 'Solaire', 'Cheveux', 'Maquillage'].map((cat) => (
                                        <div key={cat} className="flex items-center gap-2">
                                            <input type="checkbox" id={cat} className="rounded border-gray-300" />
                                            <label htmlFor={cat} className="text-sm font-medium leading-none">
                                                {cat}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter>
                                    <button className="apply-button">Appliquer</button>
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
                                        <input type="number" placeholder="Min" className="w-full border rounded-lg p-2" />
                                        <input type="number" placeholder="Max" className="w-full border rounded-lg p-2" />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <button className="apply-button">Appliquer</button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        {/* Brand Filter */}
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="filter-button">
                                    Marque <span className="arrow">▼</span>
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] p-10">
                                <DialogHeader>
                                    <DialogTitle>Marques</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 mt-2">
                                    {['La Roche-Posay', 'CeraVe', 'Vichy', 'The Ordinary', 'Avène'].map((brand) => (
                                        <div key={brand} className="flex items-center gap-2">
                                            <input type="checkbox" id={brand} className="rounded border-gray-300" />
                                            <label htmlFor={brand} className="text-sm font-medium leading-none">
                                                {brand}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter>
                                    <button className="apply-button">Appliquer</button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="filter-right">
                        <span>124 produits</span>
                        <div className="sort-selector">
                            <span>Pertinence</span>
                            <span>▼</span>
                        </div>
                    </div>
                </div>

                {/* Active Filters */}
                <div className="active-filters">
                    <span className="filter-tag">Visage ✕</span>
                    <span className="filter-tag">La Roche-Posay ✕</span>
                    <span className="clear-all">Tout effacer</span>
                </div>

                {/* Product Grid */}
                <div className="product-grid">
                    {MOCK_PRODUCTS.map((product) => (
                        <div key={product.id} className="top-seller-card">
                            {product.badge && (
                                <span className="seller-badge">{product.badge}</span>
                            )}
                            <div className="seller-rating">
                                <Star size={14} fill="#FFC107" stroke="#FFC107" />
                                <span>{product.rating}</span>
                            </div>
                            <div className="seller-image" style={{ backgroundColor: product.bgColor || '#F5F5F5' }}>
                                <img src={product.image} alt={product.name} className="seller-image-img" />
                            </div>
                            <div className="seller-info">
                                <div className="seller-brand">{product.brand}</div>
                                <h3 className="seller-name">{product.name}</h3>
                                <div className="seller-price">
                                    {product.price} DA
                                    <button className="add-to-cart-btn" aria-label="Add to cart">
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button className="page-button">‹</button>
                    <button className="page-button active">1</button>
                    <button className="page-button">2</button>
                    <button className="page-button">3</button>
                    <span className="page-dots">...</span>
                    <button className="page-button">12</button>
                    <button className="page-button">›</button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ShopPage;
