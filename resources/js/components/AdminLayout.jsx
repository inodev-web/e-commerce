import { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    Gift,
    Truck,
    Tags,
    Settings,
    Moon,
    Sun,
    Menu,
    X,
    LogOut
} from 'lucide-react';

const AdminLayout = ({ children, theme: propsTheme, toggleTheme: propsToggleTheme }) => {
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile
    const [isCollapsed, setIsCollapsed] = useState(() => {
        // Only on client side
        if (typeof window !== 'undefined') {
            return localStorage.getItem('admin_sidebar_collapsed') === 'true';
        }
        return false;
    });

    const { url } = usePage();

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

    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('admin_sidebar_collapsed', String(newState));
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const navItems = [
        { name: t('admin.dashboard', 'Dashboard'), path: route('admin.dashboard'), icon: LayoutDashboard },
        { name: t('admin.products', 'Produits'), path: route('admin.products.index'), icon: Package },
        { name: t('admin.orders', 'Commandes'), path: route('admin.orders.index'), icon: ShoppingCart },
        { name: t('admin.delivery', 'Livraison'), path: route('admin.delivery.index'), icon: Truck },
        { name: t('admin.customers', 'Clients'), path: route('admin.customers.index'), icon: Users },
        { name: t('admin.loyalty_promos', 'FidÃ©litÃ© & Promos'), path: route('admin.loyalty.index'), icon: Gift },
        { name: t('admin.settings', 'ParamÃ¨tres'), path: route('admin.settings.pixel'), icon: Settings },
    ];

    return (
        <div className={`admin-app flex h-screen bg-gray-100 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans ${theme}`}>
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl lg:shadow-none 
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    ${isCollapsed ? "lg:w-20" : "lg:w-64"}
                `}
            >
                <div className={`flex items-center justify-between h-16 border-b border-gray-200 dark:border-zinc-800 transition-all duration-300 ${isCollapsed ? "px-4" : "px-6"}`}>
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2 font-bold text-xl tracking-tight overflow-hidden whitespace-nowrap">
                        <div className="w-8 h-8 rounded shrink-0 bg-[#DB8B89] flex items-center justify-center text-white font-serif">
                            A
                        </div>
                        {!isCollapsed && <span className="text-[#DB8B89]">Admin</span>}
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-pink-50 dark:hover:bg-pink-900/10">
                        <X size={20} />
                    </button>
                </div>

                <nav className={`p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)] transition-all duration-300 ${isCollapsed ? "px-2" : "px-4"}`}>
                    {navItems.map((item) => {
                        const isActive = url.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                title={isCollapsed ? item.name : ""}
                                className={`flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? "bg-[#DB8B89] text-white shadow-lg shadow-pink-500/20"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:text-[#DB8B89] dark:hover:text-[#DB8B89]"
                                    } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
                            >
                                <item.icon size={18} className="shrink-0" />
                                {!isCollapsed && <span className="truncate">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <button
                        onClick={() => router.post(route('logout'))}
                        title={isCollapsed ? t('nav.logout', 'DÃ©connexion') : ""}
                        className={`flex items-center gap-3 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all ${isCollapsed ? "justify-center px-0 w-12 mx-auto" : "px-4 w-full"}`}
                    >
                        <LogOut size={18} className="shrink-0" />
                        {!isCollapsed && <span>{t('nav.logout', 'DÃ©connexion')}</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={`p-2 rounded-md hover:bg-pink-50 dark:hover:bg-pink-900/10 lg:hidden ${isSidebarOpen ? "hidden" : ""}`}
                        >
                            <Menu size={20} />
                        </button>

                        {/* PC Collapse Toggle */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden lg:flex p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors border border-gray-100 dark:border-zinc-800"
                            title={isCollapsed ? "DÃ©velopper" : "RÃ©duire"}
                        >
                            <Menu size={20} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link href={route('home')} className="hidden sm:inline text-sm text-teal-600 font-bold hover:underline">
                            {t('admin.view_shop', 'Voir la boutique')}
                        </Link>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#DB8B89] to-[#F8E4E0]"></div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-black/20 scroll-smooth">
                    <div className="mx-auto max-w-full lg:max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-pink-900/10 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default AdminLayout;
