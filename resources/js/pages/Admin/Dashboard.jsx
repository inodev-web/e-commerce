import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, ShoppingBag, MapPin, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../Components/AdminLayout';

const Dashboard = ({ stats, salesByWilaya, recentOrders, revenueByDay, topProducts, theme, toggleTheme }) => {

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
        <AdminLayout theme={theme} toggleTheme={toggleTheme}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Tableau de Bord</h1>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        État actuel du système
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Revenu Total (Livré)"
                        value={`${stats.totalRevenue} DA`}
                        icon={DollarSign}
                    />
                    <StatCard
                        title="Commandes En attente"
                        value={stats.pendingOrders}
                        icon={ShoppingBag}
                        trend={`${stats.totalOrders} commandes au total`}
                        trendColor="text-blue-500"
                    />
                    <StatCard
                        title="Stock Alerte"
                        value={stats.lowStockProducts}
                        icon={AlertTriangle}
                        trend="Produits < 10 unités"
                        trendColor="text-orange-500"
                    />
                    <StatCard
                        title="Top Wilaya"
                        value={salesByWilaya[0]?.wilaya_name || 'N/A'}
                        icon={MapPin}
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Revenue Chart */}
                    <div className="col-span-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Revenus (7 derniers jours)</h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="revenue" stroke="#DB8B89" fill="#DB8B89" fillOpacity={0.1} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Wilayas Chart */}
                    <div className="col-span-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Ventes par Wilaya</h3>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={wilayaData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" fontSize={12} width={80} axisLine={false} tickLine={false} />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#DB8B89" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Commandes Récentes</h3>
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
                                        <td className="py-3 px-4 font-mono">#{order.id}</td>
                                        <td className="py-3 px-4">{order.first_name} {order.last_name}</td>
                                        <td className="py-3 px-4">{order.wilaya_name}</td>
                                        <td className="py-3 px-4 font-bold">{order.total_price.toLocaleString()} DA</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                {order.status}
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
