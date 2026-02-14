import { useState, useEffect } from 'react';
import { Sun, Moon, Truck, ShieldCheck, CheckCircle, Search, User, ShoppingCart, Menu, X, LogOut } from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Header = ({ theme: propsTheme, toggleTheme: propsToggleTheme }) => {
    const { t } = useTranslation();
    const { auth, cartCount } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Internal state to handle theme if not managed by parent
    const [internalTheme, setInternalTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    const theme = propsTheme || internalTheme;

    const toggleTheme = () => {
        if (propsToggleTheme) {
            propsToggleTheme();
        } else {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            setInternalTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        }
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                setIsLoading(true);
                fetch(route('api.products.search', { query: searchQuery }))
                    .then(res => res.json())
                    .then(data => {
                        setSearchResults(data);
                        setShowDropdown(true);
                        setIsLoading(false);
                    })
                    .catch(() => {
                        setSearchResults([]);
                        setIsLoading(false);
                    });
            } else {
                setSearchResults([]);
                setShowDropdown(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            setShowDropdown(false);
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
                        <span>{t('common.cash_on_delivery', 'Paiement é  la livraison')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={16} />
                        <span>{t('common.quality_guaranteed', 'Qualité Garantie')}</span>
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
                <div className="header-search relative">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder={t('common.search_placeholder', 'Rechercher des produits... (Entrée)')}
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                    />

                    {/* Search Results Dropdown */}
                    {showDropdown && (
                        <div className="search-dropdown absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-lg rounded-b-lg border border-gray-200 dark:border-gray-700 mt-1 max-h-96 overflow-y-auto z-50">
                            {isLoading ? (
                                <div className="p-4 text-center text-gray-500">{t('common.loading', 'Chargement...')}</div>
                            ) : searchResults.length > 0 ? (
                                <ul>
                                    {searchResults.map((product) => (
                                        <li key={product.id}>
                                            <Link
                                                href={product.url}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                                            >
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">{product.name}</div>
                                                    <div className="text-sm font-bold text-teal-600">{product.formatted_price}</div>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-gray-500">{t('admin.no_results', 'Aucun résultat trouvé.')}</div>
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

                    <LanguageSwitcher />

                    {/* Admin Dashboard Link */}
                    {auth.user && auth.user.roles && auth.user.roles.includes('admin') && (
                        <Link href={route('admin.dashboard')} className="nav-link text-teal-600 font-bold">
                            <ShieldCheck className="nav-icon" size={22} />
                            <span>{t('nav.dashboard', 'Tableau de bord')}</span>
                        </Link>
                    )}

                    {/* Client Links (Profile/Cart) - Hide for Admin */}
                    {(!auth.user || !auth.user.roles || !auth.user.roles.includes('admin')) && (
                        <>
                            <Link href={auth.user ? route('profile.edit') : route('auth')} className="nav-link">
                                <User className="nav-icon" size={22} />
                                <span>{auth.user ? t('nav.account', 'Profil') : t('nav.login', 'Connexion')}</span>
                            </Link>

                            <Link href={route('cart.show')} className="nav-link cart-link">
                                <ShoppingCart className="nav-icon" size={22} />
                                <span>{t('nav.cart', 'Panier')}</span>
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                        </>
                    )}

                    {auth.user && (
                        <Link href={route('logout')} method="post" as="button" className="nav-link logout-link text-red-500 hover:text-red-700">
                            <LogOut className="nav-icon" size={22} />
                            <span>{t('nav.logout', 'Déconnexion')}</span>
                        </Link>
                    )}
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
