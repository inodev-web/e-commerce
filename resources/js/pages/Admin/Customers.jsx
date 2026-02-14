import React, { useState } from 'react';
import { Search, MoreVertical, Ban, Gift, Eye } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

const AdminCustomers = ({ auth, theme, toggleTheme, clients, filters }) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters?.search || '');

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        router.get(route('admin.customers.index'), { search: val }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AdminLayout theme={theme} toggleTheme={toggleTheme} user={auth.user}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('admin.clients_title', 'Clients')}</h1>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder={t('admin.search_client_placeholder', 'Rechercher un client (nom, email, téléphone)...')}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#DB8B89]/20 focus:border-[#DB8B89]"
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">{t('admin.client', 'Client')}</th>
                                    <th className="px-6 py-4">{t('admin.total_orders', 'Total Commandes')}</th>
                                    <th className="px-6 py-4">{t('admin.loyalty_points', 'Points Fidé©lité©')}</th>
                                    <th className="px-6 py-4">{t('admin.status', 'Status')}</th>
                                    <th className="px-6 py-4 text-right">{t('admin.actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {clients.data.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#DB8B89] to-[#F8E4E0] flex items-center justify-center text-white text-xs font-bold">
                                                    {client.first_name ? client.first_name.charAt(0) : 'C'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{client.first_name} {client.last_name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">{client.user?.email || client.phone}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{client.orders_count}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-[#DB8B89] font-medium">
                                                <Gift className="w-3 h-3" />
                                                {client.loyalty_points_sum_points || 0} pts
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${client.user?.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {client.user?.status || 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.customers.show', client.id)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400" title={t('common.details', 'Dé©tails')}>
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => router.post(route('admin.customers.toggle', client.id), {}, {
                                                        preserveScroll: true,
                                                        onSuccess: () => router.reload({ only: ['clients'] })
                                                    })}
                                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                    title={client.user?.status === 'banned' ? 'Dé©bloquer' : 'Bloquer'}
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {clients.data.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            {t('admin.no_clients', 'Aucun client trouvé©.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCustomers;
