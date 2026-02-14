import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Gift, ShoppingBag, MapPin, Phone, Mail } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '@/utils/translation';

const CustomerDetails = ({ auth, client }) => {
    const { t } = useTranslation();

    return (
        <AdminLayout user={auth.user}>
            <Head title={`${client.first_name} ${client.last_name}`} />
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.customers.index')} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        {client.first_name} {client.last_name}
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Client Info Card */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('admin.client_info', 'Informations Client')}</h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <Mail className="w-4 h-4" />
                                    <span>{client.user?.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <Phone className="w-4 h-4" />
                                    <span>{client.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    <span>{client.address}, {getTranslated(client.commune, 'name')}, {getTranslated(client.wilaya, 'name')}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[#DB8B89] font-medium">
                                    <Gift className="w-4 h-4" />
                                    <span>{client.loyalty_points?.reduce((acc, p) => acc + p.points, 0) || 0} {t('admin.points', 'Points')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders History */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    {t('admin.order_history', 'Historique des Commandes')}
                                </h3>
                                <span className="text-sm text-gray-500">{client.orders?.length || 0} {t('admin.orders', 'commandes')}</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500">
                                        <tr>
                                            <th className="px-4 py-2">{t('admin.id', 'ID')}</th>
                                            <th className="px-4 py-2">{t('admin.date', 'Date')}</th>
                                            <th className="px-4 py-2">{t('admin.total', 'Total')}</th>
                                            <th className="px-4 py-2">{t('admin.status', 'Statut')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                        {client.orders && client.orders.map(order => (
                                            <tr key={order.id}>
                                                <td className="px-4 py-3 font-mono">#{order.code || order.id}</td>
                                                <td className="px-4 py-3">{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-medium">{order.total_price.toLocaleString()} DA</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {t(`status.${order.status}`, order.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {(!client.orders || client.orders.length === 0) && (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                                    {t('admin.no_orders', 'Aucune commande trouvée.')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Loyalty History */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Gift className="w-4 h-4" />
                                {t('admin.loyalty_history', 'Historique Fidélité')}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500">
                                        <tr>
                                            <th className="px-4 py-2">{t('admin.date', 'Date')}</th>
                                            <th className="px-4 py-2">{t('admin.description', 'Description')}</th>
                                            <th className="px-4 py-2 text-right">{t('admin.points', 'Points')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                        {client.loyalty_points && client.loyalty_points.map(pt => (
                                            <tr key={pt.id}>
                                                <td className="px-4 py-3">{new Date(pt.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">{pt.description}</td>
                                                <td className={`px-4 py-3 text-right font-bold ${pt.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {pt.points > 0 ? '+' : ''}{pt.points}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CustomerDetails;
