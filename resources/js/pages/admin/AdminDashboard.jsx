import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, ShoppingBag, MapPin, TrendingUp, Users } from 'lucide-react';

const AdminDashboard = () => {
    // Mock Data for Revenue Chart
    const revenueData = [
        { name: 'Jan', revenue: 400000, orders: 240 },
        { name: 'Feb', revenue: 300000, orders: 139 },
        { name: 'Mar', revenue: 200000, orders: 98 },
        { name: 'Apr', revenue: 278000, orders: 309 },
        { name: 'May', revenue: 189000, orders: 480 },
        { name: 'Jun', revenue: 239000, orders: 380 },
        { name: 'Jul', revenue: 349000, orders: 430 },
    ];

    // Mock Data for Top Wilayas
    const wilayaData = [
        { name: 'Alger', value: 400 },
        { name: 'Oran', value: 300 },
        { name: 'Setif', value: 300 },
        { name: 'Constantine', value: 200 },
        { name: 'Blida', value: 278 },
        { name: 'Batna', value: 189 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

    const StatCard = ({ title, value, icon: Icon, trend, trendUp }) => (
        <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
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
                    <TrendingUp className={`w-4 h-4 mr-1 ${trendUp ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={trendUp ? 'text-green-500' : 'text-red-500'}>{trend}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">vs mois précédent</span>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Tableau de Bord</h1>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Dernière mise à jour: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Revenu Total"
                    value="4,231,000 DA"
                    icon={DollarSign}
                    trend="+12%"
                    trendUp={true}
                />
                <StatCard
                    title="Commandes Totales"
                    value="1,203"
                    icon={ShoppingBag}
                    trend="+8%"
                    trendUp={true}
                />
                <StatCard
                    title="Clients Actifs"
                    value="845"
                    icon={Users}
                    trend="+5%"
                    trendUp={true}
                />
                <StatCard
                    title="Top Wilaya"
                    value="Alger"
                    icon={MapPin}
                    trend="32% des ventes"
                    trendUp={true}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart */}
                <div className="col-span-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Aperçu du Revenu</h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#DB8B89" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#DB8B89" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" style={{ opacity: 0.3 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ color: '#111827' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#DB8B89"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Wilayas Chart */}
                <div className="col-span-3 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">Top Wilayas</h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={wilayaData} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} style={{ opacity: 0.3 }} />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fill: '#888888', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={80}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                    {wilayaData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#DB8B89' : '#F8E4E0'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
