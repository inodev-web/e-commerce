import React, { useState } from 'react';
import { Search, MoreVertical, Ban, Gift, Shield } from 'lucide-react';

const AdminCustomers = () => {
    // Mock Customers Data
    const customers = [
        { id: 1, name: 'Amine Amine', email: 'amine@example.com', orders: 12, spent: 45000, points: 450, status: 'Active' },
        { id: 2, name: 'Sarah Smith', email: 'sarah@example.com', orders: 5, spent: 12500, points: 125, status: 'Active' },
        { id: 3, name: 'Bad User', email: 'bad@example.com', orders: 0, spent: 0, points: 0, status: 'Blocked' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Clients</h1>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un client (nom, email, téléphone)..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#DB8B89]/20 focus:border-[#DB8B89]"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Total Commandes</th>
                                <th className="px-6 py-4">Total Dépensé</th>
                                <th className="px-6 py-4">Points Fidélité</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#DB8B89] to-[#F8E4E0] flex items-center justify-center text-white text-xs font-bold">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{customer.orders}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{customer.spent} DA</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-[#DB8B89] font-medium">
                                            <Gift className="w-3 h-3" />
                                            {customer.points} pts
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${customer.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400" title="Bloquer">
                                                <Ban className="w-4 h-4" />
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

export default AdminCustomers;
