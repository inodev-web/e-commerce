import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../Components/AdminLayout';
import { Button } from "@/components/ui/button";
import { Search, Eye, Check, Filter } from 'lucide-react';

const AdminOrders = ({ auth, orders, filters }) => {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState(filters.status || 'All');
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        router.get(route('admin.orders.index'), { ...filters, search: val }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        const query = { ...filters, status: status === 'All' ? null : status };
        router.get(route('admin.orders.index'), query, { preserveState: true, preserveScroll: true });
    };

    const statuses = [
        { key: 'All', label: t('admin.all', 'Toutes') },
        { key: 'pending', label: t('status.pending', 'En attente') },
        { key: 'confirmed', label: t('status.confirmed', 'Confirmée') },
        { key: 'shipped', label: t('status.shipped', 'Expédiée') },
        { key: 'delivered', label: t('status.delivered', 'Livrée') },
        { key: 'cancelled', label: t('status.cancelled', 'Annulée') },
    ];

    // Status Badge Component
    const StatusBadge = ({ status }) => {
        let styles = '';
        switch (status) {
            case 'pending': styles = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'; break;
            case 'confirmed': styles = 'bg-pink-100 text-pink-800 dark:bg-[#DB8B89]/20 dark:text-[#DB8B89]'; break;
            case 'shipped': styles = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'; break;
            case 'delivered': styles = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'; break;
            case 'cancelled': styles = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'; break;
            default: styles = 'bg-gray-100 text-gray-800';
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
                {t(`status.${status}`, status)}
            </span>
        );
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={t('admin.orders', 'Commandes')} />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('admin.orders_title', 'Commandes')}</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" className="dark:bg-zinc-900 dark:text-gray-100">{t('admin.export_csv', 'Export CSV')}</Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-900 rounded-lg overflow-x-auto max-w-full">
                        {statuses.map(status => (
                            <button
                                key={status.key}
                                onClick={() => handleStatusFilter(status.key)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap
                                ${statusFilter === status.key
                                        ? 'bg-[#DB8B89] text-white shadow-sm'
                                        : 'text-gray-500 hover:text-[#DB8B89] dark:hover:text-[#DB8B89]'}
                            `}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder={t('admin.search_order_placeholder', 'Rechercher une commande...')}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#DB8B89]/20"
                        />
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Commande</th>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">#{order.code || order.id}</td>
                                        <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{order.first_name} {order.last_name}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(order.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{order.total_price.toLocaleString()} DA</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.orders.show', order.id)} className="p-2 text-gray-400 hover:text-[#DB8B89] dark:hover:text-[#DB8B89]" title={t('common.details', 'Voir détails')}>
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => router.patch(route('admin.orders.status.update', order.id), { status: 'confirmed' })}
                                                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                                        title={t('common.confirm', 'Confirmer')}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {orders.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            {t('admin.no_orders', 'Aucune commande trouvée.')}
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

export default AdminOrders;
