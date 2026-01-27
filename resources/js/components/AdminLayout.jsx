import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
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

const AdminLayout = ({ children, theme, toggleTheme }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { url } = usePage();

    const navItems = [
        { name: 'Dashboard', path: route('admin.dashboard'), icon: LayoutDashboard },
        { name: 'Produits', path: '/admin/products', icon: Package },
        { name: 'Commandes', path: route('admin.orders.index'), icon: ShoppingCart },
        { name: 'Catégories', path: route('admin.categories.index'), icon: Tags },
        { name: 'Livraison', path: route('admin.delivery.index'), icon: Truck },
        // { name: 'Clients', path: '/admin/customers', icon: Users },
        // { name: 'Fidélité', path: '/admin/loyalty', icon: Gift },
        // { name: 'Paramètres', path: '/admin/settings', icon: Settings },
    ];

    return (
        <div className={`flex h-screen bg-gray-100 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 overflow-hidden font-sans ${theme}`}>
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-xl lg:shadow-none ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-zinc-800">
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded bg-[#DB8B89] flex items-center justify-center text-white font-serif">
                            A
                        </div>
                        <span className="text-[#DB8B89]">Admin</span>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:bg-pink-50 dark:hover:bg-pink-900/10">
                        <X size={20} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-8rem)]">
                    {navItems.map((item) => {
                        const isActive = url.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? "bg-[#DB8B89] text-white shadow-lg shadow-pink-500/20"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:text-[#DB8B89] dark:hover:text-[#DB8B89]"
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-zinc-800">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={18} />
                        Déconnexion
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-6 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className={`p-2 rounded-md hover:bg-pink-50 dark:hover:bg-pink-900/10 lg:hidden ${isSidebarOpen ? "hidden" : ""}`}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex-1 lg:flex-none"></div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <Link href={route('home')} className="text-sm text-teal-600 font-bold hover:underline">
                            Voir la boutique
                        </Link>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#DB8B89] to-[#F8E4E0]"></div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-black/20 scroll-smooth">
                    <div className="mx-auto max-w-7xl">
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
