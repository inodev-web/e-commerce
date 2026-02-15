import { useState, useEffect } from 'react';
import { Sun, Moon, Truck, ShieldCheck, CheckCircle, User, ShoppingCart, Menu, X, LogOut } from 'lucide-react';
import { Link, usePage, router } from '@inertiajs/react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import SearchBar from '@/Components/SearchBar';
import { useTranslation } from 'react-i18next';

const Header = ({ theme: propsTheme, toggleTheme: propsToggleTheme }) => {
    const { t } = useTranslation();
    const { auth, cartCount } = usePage().props;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                <div className="flex-1 px-4">
                    <SearchBar />
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
                    {auth.user && auth.user.role === 'admin' && (
                        <Link href={route('admin.dashboard')} className="nav-link text-teal-600 font-bold">
                            <ShieldCheck className="nav-icon" size={22} />
                            <span>{t('nav.dashboard', 'Tableau de bord')}</span>
                        </Link>
                    )}

                    {/* Client Links (Profile/Cart) - Hide for Admin */}
                    {(!auth.user || auth.user.role !== 'admin') && (
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
