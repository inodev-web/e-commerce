import React, { useState } from 'react';
import { Save, Gift, Tag, Zap, TrendingUp, ShieldAlert, Plus, Trash2, Edit, Check, X, Search, Coins, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLayout from '../../components/AdminLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const AdminLoyalty = ({ auth, stats, settings, promoCodes }) => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('stats');
    const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);

    // --- FORMS ---
    const {
        data: adjustData,
        setData: setAdjustData,
        post: postAdjust,
        processing: adjustProcessing,
        errors: adjustErrors,
        reset: resetAdjust
    } = useForm({
        phone: '',
        action: 'add',
        points: '',
        description: ''
    });

    const {
        data: settingsData,
        setData: setSettingsData,
        put: putSettings,
        processing: settingsProcessing,
        errors: settingsErrors,
    } = useForm({
        referral_discount_amount: settings?.referral_discount_amount || 0,
        referral_reward_points: settings?.referral_reward_points || 0,
        points_conversion_rate: settings?.points_conversion_rate || 1.00,
    });

    const {
        data: promoData,
        setData: setPromoData,
        post: postPromo,
        put: putPromo,
        delete: destroyPromo,
        processing: promoProcessing,
        errors: promoErrors,
        reset: resetPromo,
        clearErrors: clearPromoErrors
    } = useForm({
        code: '',
        type: 'PERCENT',
        discount_value: '',
        max_use: '',
        expiry_date: '',
        is_active: true
    });

    // --- ACTIONS ---
    const handleSettingsSave = (e) => {
        e.preventDefault();
        putSettings(route('admin.loyalty.settings.update'));
    };

    const handleAdjust = (e) => {
        e.preventDefault();
        postAdjust(route('admin.loyalty.adjust'), {
            onSuccess: () => resetAdjust()
        });
    };

    const openPromoCreate = () => {
        setEditingPromo(null);
        clearPromoErrors();
        resetPromo();
        setIsPromoDialogOpen(true);
    };

    const openPromoEdit = (promo) => {
        setEditingPromo(promo);
        clearPromoErrors();
        setPromoData({
            code: promo.code,
            type: promo.type,
            discount_value: promo.discount_value,
            max_use: promo.max_use || '',
            expiry_date: promo.expiry_date ? promo.expiry_date.substring(0, 10) : '',
            is_active: !!promo.is_active
        });
        setIsPromoDialogOpen(true);
    };

    const submitPromo = (e) => {
        e.preventDefault();
        if (editingPromo) {
            putPromo(route('admin.promo-codes.update', editingPromo.id), {
                onSuccess: () => setIsPromoDialogOpen(false)
            });
        } else {
            postPromo(route('admin.promo-codes.store'), {
                onSuccess: () => setIsPromoDialogOpen(false)
            });
        }
    };

    const deletePromo = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce code ?')) {
            destroyPromo(route('admin.promo-codes.destroy', id));
        }
    };

    const togglePromoStatus = (promo) => {
        router.post(route('admin.promo-codes.toggle', promo.id));
    };

    // --- TABS RENDERING ---
    const renderStats = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('admin.loyalty_debt', 'Dette Fidélité')}
                    value={`${stats.debt} DA`}
                    subtitle={t('admin.points_value', 'Valeur totale des points')}
                    icon={<Coins className="w-5 h-5" />}
                    color="amber"
                />
                <StatCard
                    title={t('admin.promo_revenue', 'Chiffre d\'Affaires Promo')}
                    value={`${stats.promo_impact} DA`}
                    subtitle={t('admin.promo_impact_desc', 'Ventes avec réduction')}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="pink"
                />
                <StatCard
                    title={t('admin.total_referrals', 'Total Parrainages')}
                    value={stats.referrals}
                    subtitle={t('admin.successful_invites', 'Invitations réussies')}
                    icon={<Users className="w-5 h-5" />}
                    color="blue"
                />
                <StatCard
                    title={t('admin.active_clients', 'Clients Engagés')}
                    value={stats.clients}
                    subtitle={t('admin.loyal_users', 'Utilisateurs de points')}
                    icon={<Zap className="w-5 h-5" />}
                    color="emerald"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Visualizing small logic breakdown */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <ShieldAlert className="w-24 h-24" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-[#DB8B89]" />
                        {t('admin.security_status', 'Statut de Sécurité')}
                    </h3>
                    <div className="space-y-4">
                        <SecurityCheck
                            label={t('admin.anti_fraud_ip', 'Protection IP/Phone')}
                            status="active"
                            desc={t('admin.anti_fraud_ip_desc', 'Bloque les doublons referrer/client')}
                        />
                        <SecurityCheck
                            label={t('admin.anti_cumul', 'Anti-Cumul (Promo/Ref)')}
                            status="active"
                            desc={t('admin.anti_cumul_desc', 'Empêche l\'usage de deux codes')}
                        />
                        <SecurityCheck
                            label={t('admin.first_order_lock', 'Verrou Premier Achat')}
                            status="active"
                            desc={t('admin.first_order_lock_desc', 'Parrainage limité aux nouveaux')}
                        />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#DB8B89] to-[#C07573] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Gift className="w-40 h-40" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <Gift className="w-6 h-6" />
                            {t('admin.loyalty_program', 'Programme de Fidélité')}
                        </h3>
                        <p className="text-white/80 text-sm mb-6 max-w-sm">
                            {t('admin.loyalty_hero_desc', 'Générez de la rétention en récompensant vos clients fidèles. Le système est automatisé et sécurisé.')}
                        </p>
                        <div className="flex gap-4">
                            <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex-1 text-center">
                                <div className="text-2xl font-bold">{stats.distributed}</div>
                                <div className="text-[10px] uppercase opacity-60 font-bold">{t('admin.distributed', 'Distribués')}</div>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 flex-1 text-center">
                                <div className="text-2xl font-bold">{stats.used}</div>
                                <div className="text-[10px] uppercase opacity-60 font-bold">{t('admin.used', 'Échangés')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPromoCodes = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('admin.active_promos', 'Codes Promotionnels')}</h3>
                <Button onClick={openPromoCreate} className="bg-[#DB8B89] text-white hover:bg-[#C07573] shadow-md hover:shadow-lg transition-all rounded-xl">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('admin.new_promo', 'Nouveau Code')}
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {promoCodes.data.map((promo) => (
                    <div key={promo.id} className="group bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                        {/* Dynamic Background Indicator */}
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${promo.is_active ? 'bg-green-500' : 'bg-red-500'}`} />

                        <div className="flex justify-between items-start mb-4">
                            <Badge variant="outline" className={`rounded-lg py-1 px-3 ${promo.type === 'FREE_SHIPPING' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                promo.type === 'PERCENT' ? 'bg-pink-50 text-pink-700 border-pink-100' :
                                    'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                {promo.type === 'FREE_SHIPPING' ? <Zap className="w-3 h-3 mr-1" /> : null}
                                {promo.type === 'PERCENT' ? t('admin.percentage', 'Pourcentage') :
                                    promo.type === 'FREE_SHIPPING' ? t('admin.free_shipping', 'Livraison Gratuite') :
                                        t('admin.fixed_amount', 'Montant Fixe')}
                            </Badge>

                            <button
                                onClick={() => togglePromoStatus(promo)}
                                className={`h-2 w-8 rounded-full transition-all ${promo.is_active ? 'bg-green-400' : 'bg-gray-200 dark:bg-zinc-700'}`}
                            />
                        </div>

                        <div className="mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.code', 'Code')}</span>
                            <div className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                {promo.code}
                                {promo.is_active ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-500" />}
                            </div>
                        </div>

                        <div className="text-3xl font-black text-[#DB8B89] mb-5">
                            {promo.type === 'PERCENT' ? `-${promo.discount_value}%` :
                                promo.type === 'FREE_SHIPPING' ? t('admin.free', 'GRATUIT') :
                                    `-${promo.discount_value} DA`}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-6 bg-gray-50 dark:bg-zinc-800/50 p-2 rounded-lg">
                            <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-[#DB8B89]" />
                                <span>{t('admin.active', 'Actif')}</span>
                            </div>
                            {promo.expiry_date && (
                                <div className="font-medium text-gray-900 dark:text-gray-200">
                                    Exp: {new Date(promo.expiry_date).toLocaleDateString()}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9 text-xs" onClick={() => openPromoEdit(promo)}>
                                <Edit className="w-3.5 h-3.5 mr-2" />
                                {t('common.edit', 'Modifier')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-10 h-9 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => deletePromo(promo.id)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}
                {promoCodes.data.length === 0 && (
                    <div className="col-span-full bg-gray-50 dark:bg-zinc-800/20 border border-dashed rounded-2xl py-12 text-center text-gray-500">
                        <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{t('admin.no_promos_found', 'Aucun code promotionnel configuré.')}</p>
                    </div>
                )}
            </div>

            {/* Pagination Placeholder - Simplified */}
            {promoCodes.links && promoCodes.links.length > 3 && (
                <div className="flex justify-center gap-2 mt-4">
                    {promoCodes.links.map((link, i) => (
                        <button
                            key={i}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            onClick={() => link.url && router.get(link.url)}
                            disabled={!link.url || link.active}
                            className={`px-3 py-1 rounded-lg text-sm transition-all ${link.active ? 'bg-[#DB8B89] text-white' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );

    const renderConfiguration = () => (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Loyalty Rules Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-pink-50 dark:bg-[#DB8B89]/10 rounded-2xl">
                        <Gift className="w-6 h-6 text-[#DB8B89]" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('admin.loyalty_rules', 'Règles de Fidélité')}</h3>
                        <p className="text-sm text-gray-500">{t('admin.loyalty_rules_desc', 'Configurez comment les points sont générés et convertis.')}</p>
                    </div>
                </div>

                <form onSubmit={handleSettingsSave} className="space-y-6">
                    <InputField
                        label={t('admin.points_conversion_rate', 'Taux de Conversion')}
                        type="number"
                        step="0.01"
                        value={settingsData.points_conversion_rate}
                        onChange={val => setSettingsData('points_conversion_rate', val)}
                        error={settingsErrors.points_conversion_rate}
                        helper={t('admin.conversion_helper', '1.00 = 1 point vaut 1 DA. 0.50 = 1 point vaut 0.50 DA.')}
                        icon={<TrendingUp className="w-4 h-4" />}
                    />

                    <InputField
                        label={t('admin.referral_points', 'Points par parrainage')}
                        type="number"
                        value={settingsData.referral_reward_points}
                        onChange={val => setSettingsData('referral_reward_points', val)}
                        error={settingsErrors.referral_reward_points}
                        helper={t('admin.referral_points_helper', 'Points crédités au parrain après la 1ère commande.')}
                        icon={<Coins className="w-4 h-4" />}
                    />

                    <InputField
                        label={t('admin.referral_discount', 'Réduction Nouvel Acheteur')}
                        type="number"
                        value={settingsData.referral_discount_amount}
                        onChange={val => setSettingsData('referral_discount_amount', val)}
                        error={settingsErrors.referral_discount_amount}
                        helper={t('admin.referral_discount_helper', 'Montant fixe retiré à la première commande de l\'invité.')}
                        suffix="DA"
                        icon={<Tag className="w-4 h-4" />}
                    />

                    <Button type="submit" disabled={settingsProcessing} className="w-full h-12 bg-[#DB8B89] text-white hover:bg-[#C07573] rounded-xl font-bold shadow-lg shadow-pink-500/10 transition-all">
                        <Save className="w-4 h-4 mr-2" />
                        {settingsProcessing ? t('common.processing', 'Mise à jour...') : t('admin.save_config', 'Enregistrer la Configuration')}
                    </Button>
                </form>
            </div>

            {/* Manual Point Adjustment Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl">
                        <Edit className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('admin.manual_adjustment', 'Ajustement Manuel')}</h3>
                        <p className="text-sm text-gray-500">{t('admin.manual_adjustment_desc', 'Modifier directement le solde d\'un client.')}</p>
                    </div>
                </div>

                <form onSubmit={handleAdjust} className="space-y-6">
                    <div className="relative">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">{t('admin.client_phone', 'Téléphone Client')}</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#DB8B89] transition-colors" />
                            <input
                                type="text"
                                placeholder="0550123456"
                                value={adjustData.phone}
                                onChange={e => setAdjustData('phone', e.target.value)}
                                className="w-full pl-12 pr-4 h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-[#DB8B89]/20 transition-all font-medium"
                                required
                            />
                        </div>
                        {adjustErrors.phone && <p className="text-red-500 text-[10px] mt-1 font-bold">{adjustErrors.phone}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">{t('admin.action', 'Action')}</label>
                            <div className="flex bg-gray-50 dark:bg-zinc-800 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setAdjustData('action', 'add')}
                                    className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-bold transition-all ${adjustData.action === 'add' ? 'bg-[#DB8B89] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Plus className="w-3.5 h-3.5" /> {t('admin.add', 'Ajouter')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAdjustData('action', 'subtract')}
                                    className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-lg text-sm font-bold transition-all ${adjustData.action === 'subtract' ? 'bg-zinc-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> {t('admin.subtract', 'Retirer')}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">{t('admin.points', 'Points')}</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="100"
                                value={adjustData.points}
                                onChange={e => setAdjustData('points', e.target.value)}
                                className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-[#DB8B89]/20 transition-all font-bold text-center text-lg"
                                required
                            />
                            {adjustErrors.points && <p className="text-red-500 text-[10px] mt-1 font-bold">{adjustErrors.points}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">{t('admin.reason', 'Motif / Description')}</label>
                        <textarea
                            value={adjustData.description}
                            onChange={e => setAdjustData('description', e.target.value)}
                            rows="3"
                            className="w-full p-4 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-[#DB8B89]/20 transition-all text-sm resize-none"
                            placeholder={t('admin.adjustment_desc_placeholder', 'Ex: Geste commercial, Correction bug...')}
                            required
                        />
                        {adjustErrors.description && <p className="text-red-500 text-[10px] mt-1 font-bold">{adjustErrors.description}</p>}
                    </div>

                    <Button type="submit" disabled={adjustProcessing} variant="outline" className="w-full h-12 rounded-xl text-gray-900 dark:text-white font-bold border-2 hover:bg-gray-50 transition-all">
                        {adjustProcessing ? t('common.processing', 'Traitement...') : t('admin.apply_change', 'Appliquer l\'Ajustement')}
                    </Button>
                </form>
            </div>
        </div>
    );

    return (
        <AdminLayout user={auth.user}>
            <Head title={t('admin.loyalty_panel', 'Gestion Fidélité & Promos')} />

            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                {/* Header with Glassmorphic feel */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 dark:bg-[#DB8B89]/10 border border-pink-100 dark:border-[#DB8B89]/20">
                            <Tag className="w-3.5 h-3.5 text-[#DB8B89]" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-[#DB8B89]">{t('admin.loyalty_module', 'Module Fidélité')}</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                            {t('admin.loyalty_promos', 'Fidélité & Promotions')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 max-w-lg">
                            {t('admin.loyalty_header_desc', 'Gérez les récompenses clients, les codes promo et analysez l\'impact financier du programme.')}
                        </p>
                    </div>

                    {/* Custom Nav Tabs */}
                    <div className="flex bg-gray-100 dark:bg-zinc-800/50 p-1.5 rounded-2xl border border-gray-200 dark:border-zinc-800 self-start">
                        <TabItem active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<TrendingUp className="w-4 h-4" />} label={t('admin.overview', 'Vue d\'Ensemble')} />
                        <TabItem active={activeTab === 'promos'} onClick={() => setActiveTab('promos')} icon={<Tag className="w-4 h-4" />} label={t('admin.promos', 'Promotions')} />
                        <TabItem active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Gift className="w-4 h-4" />} label={t('admin.config', 'Configuration')} />
                    </div>
                </div>

                <div className="min-h-[500px]">
                    {activeTab === 'stats' && renderStats()}
                    {activeTab === 'promos' && renderPromoCodes()}
                    {activeTab === 'config' && renderConfiguration()}
                </div>
            </div>

            {/* PROMO CODE DIALOG */}
            <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
                <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl dark:bg-zinc-900 p-0 overflow-hidden">
                    <DialogHeader className="bg-[#DB8B89] p-6 text-white text-left">
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <Tag className="w-6 h-6" />
                            {editingPromo ? t('admin.edit_promo', 'Modifier le Code') : t('admin.create_promo', 'Nouveau Code Promo')}
                        </DialogTitle>
                        <p className="text-white/70 text-sm mt-1">{t('admin.promo_dialog_desc', 'Configurez les conditions et la valeur du code.')}</p>
                    </DialogHeader>

                    <form onSubmit={submitPromo} className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <InputField
                                    label="Code"
                                    value={promoData.code}
                                    onChange={val => setPromoData('code', val.toUpperCase())}
                                    error={promoErrors.code}
                                    placeholder="SUMMER2024"
                                    icon={<Tag className="w-4 h-4" />}
                                />
                            </div>

                            <div className="col-span-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t('admin.type', 'Type')}</label>
                                <select
                                    value={promoData.type}
                                    onChange={e => setPromoData('type', e.target.value)}
                                    className="w-full h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-[#DB8B89]/20 transition-all font-bold text-sm"
                                >
                                    <option value="PERCENT">{t('admin.percentage', 'Pourcentage')}</option>
                                    <option value="FIXED">{t('admin.fixed', 'FIXE (DA)')}</option>
                                    <option value="FREE_SHIPPING">{t('admin.free_shipping', 'LIVRAISON')}</option>
                                </select>
                            </div>

                            {promoData.type !== 'FREE_SHIPPING' && (
                                <div className="col-span-2">
                                    <InputField
                                        label={t('admin.value', 'Valeur')}
                                        type="number"
                                        step="0.01"
                                        value={promoData.discount_value}
                                        onChange={val => setPromoData('discount_value', val)}
                                        error={promoErrors.discount_value}
                                        suffix={promoData.type === 'PERCENT' ? '%' : 'DA'}
                                        icon={<TrendingUp className="w-4 h-4" />}
                                    />
                                </div>
                            )}

                            <InputField
                                label={t('admin.max_uses', 'Utilisations Max')}
                                type="number"
                                value={promoData.max_use}
                                onChange={val => setPromoData('max_use', val)}
                                error={promoErrors.max_use}
                                placeholder="∞"
                            />

                            <InputField
                                label={t('admin.expiry_date', 'Date d\'Expiration')}
                                type="date"
                                value={promoData.expiry_date}
                                onChange={val => setPromoData('expiry_date', val)}
                                error={promoErrors.expiry_date}
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl">
                            <input
                                type="checkbox"
                                checked={promoData.is_active}
                                onChange={e => setPromoData('is_active', e.target.checked)}
                                className="w-5 h-5 rounded-lg text-[#DB8B89] focus:ring-[#DB8B89] border-gray-300 transition-all"
                            />
                            <div className="flex-1">
                                <div className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">{t('admin.activate_code', 'Activer ce code')}</div>
                                <div className="text-[10px] text-gray-500">{t('admin.activate_desc', 'Rend le code immédiatement utilisable par les clients.')}</div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsPromoDialogOpen(false)} className="rounded-xl h-12 px-6 font-bold">{t('common.cancel', 'Annuler')}</Button>
                            <Button type="submit" disabled={promoProcessing} className="bg-[#DB8B89] hover:bg-[#C07573] text-white rounded-xl h-12 px-8 font-black shadow-lg shadow-pink-500/20 transition-all">
                                {promoProcessing ? t('common.saving', 'Sauvegarde...') : t('common.save', 'Enregistrer')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
};

// --- HELPER COMPONENTS ---

const TabItem = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${active
            ? 'bg-white dark:bg-zinc-700 text-[#DB8B89] shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
    >
        {icon}
        {label}
    </button>
);

const StatCard = ({ title, value, subtitle, icon, color }) => {
    const colors = {
        amber: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 border-amber-100 dark:border-amber-900/20',
        pink: 'bg-pink-50 dark:bg-[#DB8B89]/10 text-[#DB8B89] border-pink-100 dark:border-[#DB8B89]/20',
        blue: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 border-blue-100 dark:border-blue-900/20',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-100 dark:border-emerald-900/20',
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className={`p-3 rounded-2xl w-fit mb-4 transition-transform group-hover:scale-110 duration-500 ${colors[color]}`}>
                {icon}
            </div>
            <div className="space-y-1">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{title}</div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">{value}</div>
                <div className="text-[10px] font-bold text-gray-500">{subtitle}</div>
            </div>
        </div>
    );
};

const SecurityCheck = ({ label, status, desc }) => (
    <div className="flex gap-4 group">
        <div className={`mt-1 h-2 w-2 rounded-full ${status === 'active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`} />
        <div className="flex-1">
            <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{label}</div>
            <div className="text-[11px] text-gray-400 group-hover:text-gray-500 transition-colors uppercase font-black">{desc}</div>
        </div>
    </div>
);

const InputField = ({ label, type = "text", step, value, onChange, error, placeholder, suffix, icon, helper }) => (
    <div className="space-y-2 group">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{label}</label>
        <div className="relative">
            {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#DB8B89] transition-colors">{icon}</div>}
            <input
                type={type}
                step={step}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full ${icon ? 'pl-11' : 'px-4'} h-12 bg-gray-50 dark:bg-zinc-800 border-none rounded-xl focus:ring-2 focus:ring-[#DB8B89]/20 transition-all font-bold ${suffix ? 'pr-12' : ''}`}
            />
            {suffix && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">{suffix}</div>}
        </div>
        {helper && <p className="text-[10px] text-gray-400 font-medium px-1 leading-tight">{helper}</p>}
        {error && <p className="text-red-500 text-[10px] px-1 font-bold animate-bounce">{error}</p>}
    </div>
);

export default AdminLoyalty;
