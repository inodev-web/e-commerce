import React, { useState } from 'react';
import { Search, Save, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";

const AdminDelivery = () => {
    // Mock Wilayas Data
    const wilayas = [
        { id: 1, name: 'Adrar', code: '01', homePrice: 1200, deskPrice: 800, active: true, homeActive: true, deskActive: true },
        { id: 16, name: 'Alger', code: '16', homePrice: 400, deskPrice: 200, active: true, homeActive: true, deskActive: true },
        { id: 31, name: 'Oran', code: '31', homePrice: 600, deskPrice: 400, active: true, homeActive: true, deskActive: true },
        { id: 25, name: 'Constantine', code: '25', homePrice: 600, deskPrice: 400, active: true, homeActive: true, deskActive: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Livraison</h1>
                <Button className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder tout
                </Button>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une wilaya..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#DB8B89]/20 focus:border-[#DB8B89]"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4 w-20">Code</th>
                                <th className="px-6 py-4">Wilaya</th>
                                <th className="px-6 py-4 text-center">Active</th>
                                <th className="px-6 py-4">Domicile (DA)</th>
                                <th className="px-6 py-4 text-center">Active</th>
                                <th className="px-6 py-4">Bureau (DA)</th>
                                <th className="px-6 py-4 text-center">Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {wilayas.map((wilaya) => (
                                <tr key={wilaya.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-500">{wilaya.code}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{wilaya.name}</td>
                                    <td className="px-6 py-4 text-center">
                                        <input type="checkbox" defaultChecked={wilaya.active} className="w-4 h-4 rounded border-gray-300 text-[#DB8B89] focus:ring-[#DB8B89]" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input type="number" defaultValue={wilaya.homePrice} className="w-24 px-2 py-1 text-right border rounded bg-transparent" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input type="checkbox" defaultChecked={wilaya.homeActive} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <input type="number" defaultValue={wilaya.deskPrice} className="w-24 px-2 py-1 text-right border rounded bg-transparent" />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <input type="checkbox" defaultChecked={wilaya.deskActive} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
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

export default AdminDelivery;
