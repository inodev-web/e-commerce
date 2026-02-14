import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/AdminLayout';
import { Button } from "@/Components/ui/button";
import { Search, Eye, Check, Filter, ShoppingCart } from 'lucide-react';

const AdminOrders = ({ auth, orders, filters }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [statusFilter, setStatusFilter] = useState(filters.status || 'ALL');
    const [search, setSearch] = useState(filters.search || '');

    // Debounce search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(route('admin.orders.index'),
                    { ...filters, search: search },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        const query = { ...filters, status: status === 'ALL' ? null : status };
        router.get(route('admin.orders.index'), query, { preserveState: true, preserveScroll: true });
    };

    const statuses = [
        { key: 'ALL', label: t('admin.all', 'Toutes') },
        { key: 'PENDING', label: t('status.pending', 'En attente') },
        { key: 'CONFIRMED', label: t('status.confirmed', 'Confirmée') },
        { key: 'SHIPPED', label: t('status.shipped', 'Expédiée') },
        { key: 'DELIVERED', label: t('status.delivered', 'Livrée') },
        { key: 'CANCELLED', label: t('status.cancelled', 'Annulée') },
    ];

    // Status Selector Component
    const StatusSelector = ({ order }) => {
        const [isUpdating, setIsUpdating] = useState(false);
        const currentStatus = order.status || 'PENDING';

        const statusMap = {
            'PENDING': { label: t('status.pending', 'En Attente'), style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
            'PROCESSING': { label: t('status.processing', 'En Traitement'), style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
            'CONFIRMED': { label: t('status.confirmed', 'Confirmée'), style: 'bg-pink-100 text-pink-800 dark:bg-[#DB8B89]/20 dark:text-[#DB8B89]' },
            'SHIPPED': { label: t('status.shipped', 'Expédiée'), style: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
            'DELIVERED': { label: t('status.delivered', 'Livrée'), style: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
            'CANCELLED': { label: t('status.cancelled', 'Annulée'), style: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
        };

        const handleStatusChange = (e) => {
            const newStatus = e.target.value;
            if (newStatus === currentStatus) return;

            setIsUpdating(true);
            router.patch(
                route('admin.orders.status.update', order.id),
                { status: newStatus },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsUpdating(false);
                    },
                    onError: (errors) => {
                        setIsUpdating(false);
                        console.error('Failed to update status:', errors);
                    },
                }
            );
        };

        const config = statusMap[currentStatus] || statusMap['PENDING'];

        return (
            <select
                value={currentStatus}
                onChange={handleStatusChange}
                disabled={isUpdating}
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer transition-opacity ${config.style} ${isUpdating ? 'opacity-50 cursor-wait' : 'hover:opacity-80'}`}
            >
                <option value="PENDING">{t('status.pending', 'En Attente')}</option>
                <option value="PROCESSING">{t('status.processing', 'En Traitement')}</option>
                <option value="CONFIRMED">{t('status.confirmed', 'Confirmée')}</option>
                <option value="SHIPPED">{t('status.shipped', 'Expédiée')}</option>
                <option value="DELIVERED">{t('status.delivered', 'Livrée')}</option>
                <option value="CANCELLED">{t('status.cancelled', 'Annulée')}</option>
            </select>
        );
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={t('admin.orders', 'Commandes')} />
            <div className={`space-y-6 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
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
                        <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder={t('admin.search_order_placeholder', 'Rechercher une commande...')}
                            className={`w-full ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#DB8B89]/20`}
                        />
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-start">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 font-medium">
                                <tr>
                                    <th className="px-4 py-4">{t('admin.order_no', 'N°')}</th>
                                    <th className="px-4 py-4">{t('admin.client', 'Client')}</th>
                                    <th className="px-4 py-4">{t('admin.phone', 'Téléphone')}</th>
                                    <th className="px-4 py-4">{t('admin.date', 'Date & Heure')}</th>
                                    <th className="px-4 py-4">{t('admin.location', 'Localisation')}</th>
                                    <th className="px-4 py-4">{t('admin.total', 'Total')}</th>
                                    <th className="px-4 py-4">{t('admin.status', 'Statut')}</th>
                                    <th className={`px-4 py-4 ${isRtl ? 'text-start' : 'text-end'}`}>{t('admin.actions', 'Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100">#{order.id}</td>
                                        <td className="px-4 py-4 text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">
                                            {order.first_name} {order.last_name}
                                        </td>
                                        <td className="px-4 py-4">
                                            <a href={`tel:${order.phone}`} className="text-[#DB8B89] hover:underline font-medium">
                                                {order.phone}
                                            </a>
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {new Date(order.created_at).toLocaleString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }).replace(',', '')}
                                        </td>
                                        <td className="px-4 py-4 text-gray-500 dark:text-gray-400">
                                            <div className="text-xs">{order.wilaya_name} - {order.commune_name}</div>
                                        </td>
                                        <td className="px-4 py-4 font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                                            {parseFloat(order.total_price).toLocaleString()} {t('currency.symbol', 'DA')}
                                        </td>
                                        <td className="px-4 py-4">
                                            <StatusSelector order={order} />
                                        </td>
                                        <td className="px-4 py-4 text-end">
                                            <div className={`flex ${isRtl ? 'justify-start' : 'justify-end'} gap-1`}>
                                                <Link href={route('admin.orders.show', order.id)} className="p-1.5 text-gray-400 hover:text-[#DB8B89] dark:hover:text-[#DB8B89] transition-colors" title={t('common.details', 'Voir détails')}>
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                {order.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => router.patch(route('admin.orders.status.update', order.id), { status: 'CONFIRMED' })}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
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
                                        <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShoppingCart className="w-8 h-8 opacity-20" />
                                                {t('admin.no_orders', 'Aucune commande trouvée.')}
                                            </div>
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
