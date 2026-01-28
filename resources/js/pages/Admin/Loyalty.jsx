import React from 'react';
import { Save, Gift, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AdminLayout from '../../Components/AdminLayout';

const AdminLoyalty = ({ theme, toggleTheme }) => {
    return (
        <AdminLayout theme={theme} toggleTheme={toggleTheme}>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Programme de Fidélité</h1>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Conversion Settings */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-100 dark:bg-[#DB8B89]/20 rounded-lg">
                                <Gift className="w-5 h-5 text-[#DB8B89]" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Règles de Conversion</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Montant (DA)</label>
                                    <input type="number" defaultValue={100} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 mt-6" />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Points Gagnés</label>
                                    <input type="number" defaultValue={1} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Points Utilisés</label>
                                    <input type="number" defaultValue={100} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 mt-6" />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Réduction (DA)</label>
                                    <input type="number" defaultValue={50} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
                                </div>
                            </div>
                        </div>

                        <Button className="w-full bg-[#DB8B89] text-white hover:bg-[#C07573]">
                            <Save className="w-4 h-4 mr-2" />
                            Sauvegarder les règles
                        </Button>
                    </div>

                    {/* Manual Adjustment */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ajustement Manuel</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ajouter ou retirer des points à un client spécifique.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Rechercher Client</label>
                                <input type="text" placeholder="Email ou Nom" className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Action</label>
                                    <select className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700">
                                        <option>Ajouter (+)</option>
                                        <option>Retirer (-)</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Points</label>
                                    <input type="number" placeholder="0" className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
                                </div>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full">
                            Appliquer
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminLoyalty;
