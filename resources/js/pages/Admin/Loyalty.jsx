import React from 'react';
import { Save, Gift, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AdminLayout from '../../Components/AdminLayout';

import { useTranslation } from 'react-i18next';
import { useForm } from '@inertiajs/react';

const AdminLoyalty = ({ auth, stats }) => {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        action: 'add',
        points: '',
        description: ''
    });

    const handleAdjust = (e) => {
        e.preventDefault();
        post(route('admin.loyalty.adjust'), {
            onSuccess: () => reset()
        });
    };

    return (
        <AdminLayout user={auth.user}>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('admin.loyalty_program', 'Programme de Fidélité')}</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                        <h3 className="text-sm text-gray-500">{t('admin.points_distributed', 'Points Distribués')}</h3>
                        <p className="text-2xl font-bold text-green-600">{stats?.distributed || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                        <h3 className="text-sm text-gray-500">{t('admin.points_used', 'Points Échangés')}</h3>
                        <p className="text-2xl font-bold text-red-600">{stats?.used || 0}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800">
                        <h3 className="text-sm text-gray-500">{t('admin.active_clients', 'Clients Actifs')}</h3>
                        <p className="text-2xl font-bold text-blue-600">{stats?.clients || 0}</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Conversion Settings */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-100 dark:bg-[#DB8B89]/20 rounded-lg">
                                <Gift className="w-5 h-5 text-[#DB8B89]" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('admin.conversion_rules', 'Règles de Conversion')}</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('common.amount', 'Montant')} (DA)</label>
                                    <input type="number" defaultValue={100} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 mt-6" />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('admin.points_earned', 'Points Gagnés')}</label>
                                    <input type="number" defaultValue={1} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('admin.points_used_label', 'Points Utilisés')}</label>
                                    <input type="number" defaultValue={100} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 mt-6" />
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('cart.discount', 'Réduction')} (DA)</label>
                                    <input type="number" defaultValue={50} className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
                                </div>
                            </div>
                        </div>

                        <Button className="w-full bg-[#DB8B89] text-white hover:bg-[#C07573]">
                            <Save className="w-4 h-4 mr-2" />
                            {t('admin.save_rules', 'Sauvegarder les règles')}
                        </Button>
                    </div>

                    {/* Manual Adjustment */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('admin.manual_adjustment', 'Ajustement Manuel')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.manual_adjustment_desc', 'Ajouter ou retirer des points à un client spécifique.')}</p>

                        <form onSubmit={handleAdjust} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('admin.search_client_email', 'Email du Client')}</label>
                                <input
                                    type="email"
                                    placeholder="client@example.com"
                                    value={data.email}
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    required
                                />
                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('admin.action', 'Action')}</label>
                                    <select
                                        value={data.action}
                                        onChange={e => setData('action', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    >
                                        <option value="add">{t('admin.add', 'Ajouter (+)')}</option>
                                        <option value="subtract">{t('admin.subtract', 'Retirer (-)')}</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('admin.points', 'Points')}</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={data.points}
                                        onChange={e => setData('points', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        required
                                        min="1"
                                    />
                                    {errors.points && <p className="text-red-500 text-xs">{errors.points}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('admin.description', 'Description / Motif')}</label>
                                <input
                                    type="text"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    required
                                />
                                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                            </div>

                            <Button type="submit" disabled={processing} variant="outline" className="w-full">
                                {processing ? t('common.processing', 'Traitement...') : t('admin.apply', 'Appliquer')}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminLoyalty;
