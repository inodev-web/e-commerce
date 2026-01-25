import React, { useState } from 'react';
import { Plus, Tag, Trash2, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";

const AdminPromotions = () => {
    // Mock Promo Codes
    const promos = [
        { id: 1, code: 'WELCOME10', discount: '10%', type: 'Percentage', status: 'Active', uses: 45 },
        { id: 2, code: 'SUMMER2024', discount: '2000 DA', type: 'Fixed Amount', status: 'Expired', uses: 120 },
        { id: 3, code: 'FREESHIP', discount: 'Free Shipping', type: 'Shipping', status: 'Active', uses: 12 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Promotions</h1>
                <Button className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau Code Promo
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {promos.map((promo) => (
                    <div key={promo.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Tag className="w-24 h-24 rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-pink-100 text-pink-800 dark:bg-[#DB8B89]/20 dark:text-[#DB8B89] rounded-full text-xs font-bold uppercase tracking-wider">
                                    {promo.type}
                                </span>
                                <span className={`flex h-2 w-2 rounded-full ${promo.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{promo.code}</h3>
                            <p className="text-3xl font-extrabold text-[#DB8B89] mb-4">{promo.discount}</p>

                            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                                <span>Utilisé {promo.uses} fois</span>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier
                                </Button>
                                <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPromotions;
