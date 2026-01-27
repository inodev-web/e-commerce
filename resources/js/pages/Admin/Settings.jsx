import React from 'react';
import { Save, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";

const AdminSettings = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Paramètres</h1>

            <div className="grid gap-6 max-w-2xl">
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-pink-100 dark:bg-[#DB8B89]/20 rounded-lg">
                            <Globe className="w-5 h-5 text-[#DB8B89]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Meta Pixel (Facebook)</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Configurez votre pixel Facebook pour le tracking.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Activer le Pixel</span>
                            <label className="inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DB8B89]/20 dark:peer-focus:ring-[#DB8B89]/40 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#DB8B89]"></div>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Pixel ID</label>
                            <input
                                type="text"
                                placeholder="ex: 123456789012345"
                                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 font-mono focus:border-[#DB8B89] focus:ring-1 focus:ring-[#DB8B89]"
                                defaultValue="8492018492"
                            />
                            <p className="text-xs text-gray-500">
                                L'ID de votre pixel se trouve dans le Gestionnaire d'événements Facebook.
                            </p>
                        </div>

                        <Button className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                            <Save className="w-4 h-4 mr-2" />
                            Sauvegarder
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
