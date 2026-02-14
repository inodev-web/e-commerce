import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '@/utils/translation';
import AdminLayout from '../../components/AdminLayout';
import {
    DollarSign,
    ShoppingBag,
    AlertTriangle,
    MapPin,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const Dashboard = ({ auth, stats, salesByWilaya, recentOrders, revenueByDay, topProducts }) => {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    const revenueData = revenueByDay.map(day => ({
        name: new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        revenue: parseFloat(day.revenue)
    }));

    const wilayaData = salesByWilaya.map(w => ({
        name: w.wilaya_name,
        value: parseInt(w.order_count)
    }));

    const StatCard = ({ title, value, icon: Icon, trend, trendColor }) => (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                    <div className="mt-2 text-2xl font-bold dark:text-gray-100">{value}</div>
                </div>
                <div className="p-3 bg-pink-50 dark:bg-[#DB8B89]/10 rounded-lg">
                    <Icon className="w-6 h-6 text-[#DB8B89]" />
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={trendColor}>{trend}</span>
                </div>
            )}
        </div>
    );

    return (
        <AdminLayout user={auth.user}>
            <Head title={t('admin.dashboard', 'Tableau de Bord')} />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('admin.dashboard_title', 'Tableau de Bord')}</h1>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {t('admin.system_status', 'Ã‰tat actuel du systÃ¨me')}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title={t('admin.total_revenue_delivered', 'Revenu Total (LivrÃ©)')}
                        value={`${stats.totalRevenue} DA`}
                        icon={DollarSign}
                    />
                    <StatCard
                        title={t('admin.pending_orders', 'Commandes En attente')}
                        value={stats.pendingOrders}
                        icon={ShoppingBag}
                        trend={`${stats.totalOrders} ${t('admin.total_orders', 'commandes au total')}`}
                        trendColor="text-blue-500"
                    />
                    <StatCard
                        title={t('admin.low_stock', 'Stock Alerte')}
                        value={stats.lowStockProducts}
                        icon={AlertTriangle}
                        trend={t('admin.low_stock_desc', 'Produits < 10 unitÃ©s')}
                        trendColor="text-orange-500"
                    />
                    <StatCard
                        title={t('admin.top_wilaya', 'Top Wilaya')}
                        value={salesByWilaya[0]?.wilaya_name || 'N/A'}
                        icon={MapPin}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Revenue Chart */}
                    <div className="col-span-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">{t('admin.revenue_last_7_days', 'Revenus (7 derniers jours)')}</h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} orientation={isAr ? 'right' : 'left'} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} orientation={isAr ? 'right' : 'left'} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="revenue" stroke="#DB8B89" fill="#DB8B89" fillOpacity={0.1} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Wilayas Chart */}
                    <div className="col-span-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">{t('admin.sales_by_wilaya', 'Ventes par Wilaya')}</h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={wilayaData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" fontSize={12} width={80} axisLine={false} tickLine={false} orientation={isAr ? 'right' : 'left'} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#DB8B89" radius={isAr ? [4, 0, 0, 4] : [0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">{t('admin.recent_orders', 'Commandes RÃ©centes')}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b dark:border-zinc-800 text-gray-500">
                                    <th className="py-3 px-4">ID</th>
                                    <th className="py-3 px-4">Client</th>
                                    <th className="py-3 px-4">Ville</th>
                                    <th className="py-3 px-4">Total</th>
                                    <th className="py-3 px-4">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <td className="py-3 px-4 font-mono font-medium">#{order.code || order.id}</td>
                                        <td className="py-3 px-4">{order.first_name} {order.last_name}</td>
                                        <td className="py-3 px-4">{order.wilaya_name}</td>
                                        <td className="py-3 px-4 font-bold">{order.total_price.toLocaleString()} DA</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}
                                            `}>
                                                {t(`status.${order.status}`, order.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
