import React, { useState, useRef } from 'react';
import { Search, Save, MapPin } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import AdminLayout from '../../components/AdminLayout';
import { router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';

const AdminDelivery = ({ wilayas, theme, toggleTheme }) => {
    const [search, setSearch] = useState('');
    const originalData = useRef(wilayas); // Store original data for comparison

    const { data, setData, post, processing } = useForm({
        wilayas: wilayas
    });

    const filteredWilayas = data.wilayas.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.code.includes(search)
    );

    const [isProcessing, setIsProcessing] = useState(false);

    const updateWilaya = (id, field, value) => {
        setData('wilayas', data.wilayas.map(w => {
            if (w.id !== id) return w;
            return { ...w, [field]: value };
        }));
    };

    const handleToggleAll = (id, checked) => {
        setData('wilayas', data.wilayas.map(w => {
            if (w.id !== id) return w;
            return { ...w, homeActive: checked, deskActive: checked };
        }));
    };

    const handleSave = () => {
        // Track which fields were modified for each wilaya
        const modifiedWilayas = [];

        data.wilayas.forEach((wilaya) => {
            const original = originalData.current.find(w => w.id === wilaya.id);
            if (!original) return;

            const modifiedFields = {};

            // Check each field individually
            if (wilaya.homeActive !== original.homeActive) {
                modifiedFields.homeActive = wilaya.homeActive;
            }
            if (wilaya.deskActive !== original.deskActive) {
                modifiedFields.deskActive = wilaya.deskActive;
            }
            if (wilaya.homePrice !== original.homePrice) {
                modifiedFields.homePrice = wilaya.homePrice;
            }
            if (wilaya.deskPrice !== original.deskPrice) {
                modifiedFields.deskPrice = wilaya.deskPrice;
            }

            // Only include wilayas that have at least one modified field
            if (Object.keys(modifiedFields).length > 0) {
                modifiedWilayas.push({
                    id: wilaya.id,
                    ...modifiedFields
                });
            }
        });

        if (modifiedWilayas.length === 0) {
            alert('Aucune modification détectée');
            return;
        }

        router.post(route('admin.delivery.bulk-update'), {
            wilayas: modifiedWilayas
        }, {
            preserveScroll: true,
            preserveState: true,
            only: ['wilayas', 'flash'], // Partial reload: only get back updated data and messages
            onStart: () => setIsProcessing(true),
            onFinish: () => setIsProcessing(false),
            onSuccess: () => {
                // Update original data after successful save
                originalData.current = data.wilayas;
            }
        });
    };

    return (
        <AdminLayout theme={theme} toggleTheme={toggleTheme}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Livraison</h1>
                    <Button
                        onClick={handleSave}
                        disabled={isProcessing}
                        className="bg-[#DB8B89] text-white hover:bg-[#C07573]"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isProcessing ? 'Sauvegarde...' : 'Sauvegarder tout'}
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une wilaya..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
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
                                    <th className="px-6 py-4 text-center">Active (Tout)</th>
                                    <th className="px-6 py-4">Domicile (DA)</th>
                                    <th className="px-6 py-4 text-center">Active</th>
                                    <th className="px-6 py-4">Bureau (DA)</th>
                                    <th className="px-6 py-4 text-center">Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {filteredWilayas.map((wilaya) => (
                                    <tr key={wilaya.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500">{wilaya.code}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{wilaya.name}</td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={wilaya.homeActive || wilaya.deskActive}
                                                onChange={(e) => handleToggleAll(wilaya.id, e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-[#DB8B89] focus:ring-[#DB8B89]"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={wilaya.homePrice}
                                                onChange={(e) => updateWilaya(wilaya.id, 'homePrice', e.target.value)}
                                                className="w-24 px-2 py-1 text-right border rounded bg-transparent dark:text-gray-200"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={wilaya.homeActive}
                                                onChange={(e) => updateWilaya(wilaya.id, 'homeActive', e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="number"
                                                value={wilaya.deskPrice}
                                                onChange={(e) => updateWilaya(wilaya.id, 'deskPrice', e.target.value)}
                                                className="w-24 px-2 py-1 text-right border rounded bg-transparent dark:text-gray-200"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={wilaya.deskActive}
                                                onChange={(e) => updateWilaya(wilaya.id, 'deskActive', e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
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

export default AdminDelivery;
