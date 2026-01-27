import { useState } from 'react';
import { Sun, Moon, Truck, ShieldCheck, CheckCircle, Search, User, ShoppingCart, Menu, X } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';

const MOCK_PRODUCTS = [
    { id: 1, name: 'Lotion Hydratante Quotidienne', image: 'https://i.pinimg.com/1200x/db/aa/c4/dbaac4e9b7c92cfd5d0fd33e1a2d8556.jpg', price: 2400, brand: 'Soin de la peau' },
    { id: 2, name: 'Sérum Vitamine C 20%', image: 'https://i.pinimg.com/1200x/b4/13/1b/b4131b89326fdd62875c6e4fd30236d5.jpg', price: 4500, brand: 'Éclat' },
    { id: 3, name: 'Nettoyant Visage Doux', image: 'https://i.pinimg.com/1200x/db/aa/c4/dbaac4e9b7c92cfd5d0fd33e1a2d8556.jpg', price: 1550, brand: 'Thérapie Cutanée' },
];

const Header = ({ theme, toggleTheme }) => {
    const { auth } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const filteredProducts = MOCK_PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showDropdown = searchQuery.length > 0 && isSearchFocused;

    return (
        <header className="header">
            {/* Top Bar */}
            <div style={{ backgroundColor: 'var(--primary-blue)', color: 'white' }}>
                <div className="header-container" style={{ padding: '0.5rem 2rem', minHeight: 'auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem', fontSize: '0.85rem', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={16} />
                        <span>Paiement à la livraison</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} />
                        <span>Qualité Garantie</span>
                    </div>
                </div>
            </div>
            <div className="header-container">
                {/* Logo */}
                <Link href="/" className="header-logo">
                    <img
                        src="/logo.png"
                        alt="Puréva Logo"
                        className="logo-icon"
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                    />
                    <span className="logo-text hidden sm:inline">Puréva</span>
                </Link>

                {/* Search Bar (Desktop) */}
                <div className="header-search">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Rechercher des produits..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    />

                    {/* Search Dropdown */}
                    {showDropdown && (
                        <div className="search-dropdown">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map(product => (
                                    <Link key={product.id} href={route('products.show', product.id)} className="search-result-item">
                                        <img src={product.image} alt={product.name} className="search-result-img" />
                                        <div className="search-result-info">
                                            <div className="search-result-name">{product.name}</div>
                                            <div className="search-result-price">{product.price} DA</div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="search-no-results">Aucun produit trouvé</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className={`header-nav ${isMenuOpen ? 'active' : ''}`}>
                    <button
                        onClick={toggleTheme}
                        className="nav-link theme-toggle-btn"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <Link href={auth.user ? route('profile.edit') : route('auth')} className="nav-link">
                        <User className="nav-icon" size={22} />
                        <span>{auth.user ? 'Profil' : 'Connexion'}</span>
                    </Link>

                    <Link href={route('cart.show')} className="nav-link cart-link">
                        <ShoppingCart className="nav-icon" size={22} />
                        <span>Panier</span>
                        <span className="cart-badge">0</span>
                    </Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="mobile-menu-toggle"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
        </header>
    );
};

export default Header;
