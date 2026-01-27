import { useState } from 'react';
import { Sun, Moon, Truck, ShieldCheck, CheckCircle, Search, User, ShoppingCart, Menu, X } from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';

const Header = ({ theme, toggleTheme }) => {
    const { auth } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.get(route('products.index'), { search: searchQuery });
        }
    };

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
                        placeholder="Rechercher des produits... (Entrée)"
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
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
                        {/* If you have cart count in props, use it here */}
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
