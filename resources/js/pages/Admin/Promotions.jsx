import React, { useState } from 'react';
import { Plus, Tag, Trash2, Edit, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AdminLayout from '../../Components/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const AdminPromotions = ({ auth, promoCodes }) => {
    const { t } = useTranslation();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        code: '',
        type: 'PERCENT',
        usage_type: 'SHAREABLE',
        discount_value: '',
        max_use: '',
        expiry_date: '',
        is_active: true
    });

    const openCreate = () => {
        setEditingPromo(null);
        clearErrors();
        reset();
        setIsDialogOpen(true);
    };

    const openEdit = (promo) => {
        setEditingPromo(promo);
        clearErrors();
        setData({
            code: promo.code,
            type: promo.type,
            usage_type: promo.usage_type,
            discount_value: promo.discount_value,
            max_use: promo.max_use || '',
            expiry_date: promo.expiry_date ? promo.expiry_date.substring(0, 10) : '',
            is_active: !!promo.is_active
        });
        setIsDialogOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingPromo) {
            put(route('admin.promo-codes.update', editingPromo.id), {
                onSuccess: () => setIsDialogOpen(false)
            });
        } else {
            post(route('admin.promo-codes.store'), {
                onSuccess: () => setIsDialogOpen(false)
            });
        }
    };

    const deletePromo = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce code ?')) {
            destroy(route('admin.promo-codes.destroy', id));
        }
    };

    const toggleStatus = (promo) => {
        router.post(route('admin.promo-codes.toggle', promo.id));
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={t('admin.promotions', 'Promotions')} />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('admin.promotions_title', 'Promotions')}</h1>
                    <Button onClick={openCreate} className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('admin.new_promo', 'Nouveau Code Promo')}
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {promoCodes.data.map((promo) => (
                        <div key={promo.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Tag className="w-24 h-24 rotate-12" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-pink-100 text-pink-800 dark:bg-[#DB8B89]/20 dark:text-[#DB8B89] rounded-full text-xs font-bold uppercase tracking-wider">
                                        {promo.type === 'PERCENT' ? t('admin.percentage', 'Pourcentage') : t('admin.fixed_amount', 'Montant Fixe')}
                                    </span>
                                    <button
                                        onClick={() => toggleStatus(promo)}
                                        className={`flex h-4 w-4 rounded-full items-center justify-center ${promo.is_active ? 'bg-green-500' : 'bg-red-500'} cursor-pointer`}
                                        title={promo.is_active ? 'Actif' : 'Inactif'}
                                    >
                                        <span className="sr-only">{promo.is_active ? 'Actif' : 'Inactif'}</span>
                                    </button>
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{promo.code}</h3>
                                <p className="text-3xl font-extrabold text-[#DB8B89] mb-4">
                                    {promo.type === 'PERCENT' ? `-${promo.discount_value}%` : `-${promo.discount_value} DA`}
                                </p>

                                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    <span>{t('admin.usage', 'Usage')}: {promo.usage_type === 'SHAREABLE' ? t('admin.shareable', 'Partageable') : t('admin.personal', 'Personnel')}</span>
                                    {promo.expiry_date && <span>Exp: {promo.expiry_date}</span>}
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={() => openEdit(promo)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Modifier
                                    </Button>
                                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => deletePromo(promo.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {promoCodes.data.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            {t('admin.no_promos', 'Aucun code promo trouvé.')}
                        </div>
                    )}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogHeader>
                                <DialogTitle>{editingPromo ? t('admin.edit_promo', 'Modifier Code Promo') : t('admin.new_promo', 'Nouveau Code Promo')}</DialogTitle>
                            </DialogHeader>
                        </DialogHeader>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={e => setData('code', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-zinc-800 dark:border-zinc-700"
                                    required
                                />
                                {errors.code && <div className="text-red-500 text-sm">{errors.code}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.type', 'Type')}</label>
                                    <select
                                        value={data.type}
                                        onChange={e => setData('type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-zinc-800 dark:border-zinc-700"
                                    >
                                        <option value="PERCENT">{t('admin.percentage', 'Pourcentage')}</option>
                                        <option value="FIXED">{t('admin.fixed_amount', 'Montant Fixe')} (DA)</option>
                                    </select>
                                    {errors.type && <div className="text-red-500 text-sm">{errors.type}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.usage', 'Usage')}</label>
                                    <select
                                        value={data.usage_type}
                                        onChange={e => setData('usage_type', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-zinc-800 dark:border-zinc-700"
                                    >
                                        <option value="SHAREABLE">{t('admin.shareable', 'Partageable')}</option>
                                        <option value="PERSONAL">{t('admin.personal', 'Personnel')}</option>
                                    </select>
                                    {errors.usage_type && <div className="text-red-500 text-sm">{errors.usage_type}</div>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('admin.value', 'Valeur')} {data.type === 'PERCENT' ? '(%)' : '(DA)'}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={data.discount_value}
                                    onChange={e => setData('discount_value', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-zinc-800 dark:border-zinc-700"
                                    required
                                />
                                {errors.discount_value && <div className="text-red-500 text-sm">{errors.discount_value}</div>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.max_uses', 'Max Utilisations')}</label>
                                    <input
                                        type="number"
                                        value={data.max_use}
                                        onChange={e => setData('max_use', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                    {errors.max_use && <div className="text-red-500 text-sm">{errors.max_use}</div>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.expiry_date', 'Date Expiration')}</label>
                                    <input
                                        type="date"
                                        value={data.expiry_date}
                                        onChange={e => setData('expiry_date', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 dark:bg-zinc-800 dark:border-zinc-700"
                                    />
                                    {errors.expiry_date && <div className="text-red-500 text-sm">{errors.expiry_date}</div>}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel', 'Annuler')}</Button>
                                <Button type="submit" className="bg-[#DB8B89] hover:bg-[#C07573]" disabled={processing}>
                                    {processing ? t('common.saving', 'Enregistrement...') : t('common.save', 'Enregistrer')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminPromotions;
