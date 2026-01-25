import React, { useState } from 'react';
import { Search, Filter, Eye, MoreHorizontal, Check, X, Truck, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";

const AdminOrders = () => {
    const [statusFilter, setStatusFilter] = useState('All');

    // Mock Orders Data
    const orders = [
        { id: '#CMD-1024', customer: 'Amine Amine', date: '2024-01-22', amount: 4500, status: 'En attente', items: 3 },
        { id: '#CMD-1023', customer: 'Sarah Smith', date: '2024-01-21', amount: 12500, status: 'Confirmée', items: 5 },
        { id: '#CMD-1022', customer: 'Mohamed Ali', date: '2024-01-21', amount: 3200, status: 'Expédiée', items: 1 },
        { id: '#CMD-1021', customer: 'Yasmine K.', date: '2024-01-20', amount: 8900, status: 'Livrée', items: 2 },
        { id: '#CMD-1020', customer: 'Karim Z.', date: '2024-01-19', amount: 2500, status: 'Annulée', items: 1 },
    ];

    const statuses = ['All', 'En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée'];

    // Status Badge Component
    const StatusBadge = ({ status }) => {
        let styles = '';
        switch (status) {
            case 'En attente': styles = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'; break;
            case 'Confirmée': styles = 'bg-pink-100 text-pink-800 dark:bg-[#DB8B89]/20 dark:text-[#DB8B89]'; break;
            case 'Expédiée': styles = 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'; break;
            case 'Livrée': styles = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'; break;
            case 'Annulée': styles = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'; break;
            default: styles = 'bg-gray-100 text-gray-800';
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Commandes</h1>
                <div className="flex gap-2">
                    <Button variant="outline" className="dark:bg-zinc-900 dark:text-gray-100">Export CSV</Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-900 rounded-lg">
                    {statuses.map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all
                                ${statusFilter === status
                                    ? 'bg-[#DB8B89] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-[#DB8B89] dark:hover:text-[#DB8B89]'}
                            `}
                        >
                            {status}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une commande..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{order.id}</td>
                                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">{order.customer}</td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{order.date}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{order.amount} DA</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-[#DB8B89] dark:hover:text-[#DB8B89]" title="Voir détails">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400" title="Confirmer">
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
