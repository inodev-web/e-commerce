import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Gift, Award, Package, Copy, Loader2, Users, ChevronRight, MapPin, Phone, Home } from 'lucide-react';
import { toast } from 'sonner';
import { usePage, useForm, Head, router, Link } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getLocalizedName } from '@/utils/localization';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export default function UserProfile({ theme, toggleTheme }) {
    const { t } = useTranslation();
    const { auth, referral_code, referrals = [], orders = null, loyaltyHistory = [], wilayas = [], communes: pageCommunes = [], activeTab: initialTab = 'personal' } = usePage().props;
    const ordersList = Array.isArray(orders?.data) ? orders.data : [];
    const user = auth.user;
    const points = user.points || 0;
    const client = user.client || {};

    const [activeTab, setActiveTab] = useState(initialTab);
    const [availableCommunes, setAvailableCommunes] = useState(pageCommunes);

    const { data, setData, patch, processing, errors } = useForm({
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        phone: user.phone || '',
        address: client.address || '',
        wilaya_id: client.wilaya_id || '',
        commune_id: client.commune_id || '',
    });

    const handleWilayaChange = async (wilayaId) => {
        setData('wilaya_id', wilayaId);
        setData('commune_id', '');

        if (!wilayaId) {
            setAvailableCommunes([]);
            return;
        }

        try {
            const response = await axios.get(`/api/wilayas/${wilayaId}/communes`);
            setAvailableCommunes(response.data);
        } catch (error) {
            console.error('Error fetching communes:', error);
            toast.error(t('common.error_fetching_communes', 'Erreur lors de la récupération des communes'));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('profile.update'), {
            onSuccess: () => toast.success(t('profile.updated', 'Profil mis à jour avec succès')),
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success(t('common.copied', 'Copié dans le presse-papier'));
    };

    return (
        <div className="profile-page min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
            <Head title="Mon Profil" />
            <Header theme={theme} toggleTheme={toggleTheme} />

            {/* Profile Header */}
            <div className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 transition-colors duration-300 pt-10">
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-[#F8E4E0] to-[#DB8B89] rounded-full flex items-center justify-center shadow-lg">
                            <User size={48} className="text-white" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-7 h-7 bg-[#C07573] rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900">
                            <Award size={14} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{user.name}</h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-500 px-3 py-1 rounded text-xs font-semibold border border-amber-200 dark:border-amber-800 uppercase">
                            {points > 1000 ? t('loyalty.gold_member', 'GOLD MEMBER') : t('loyalty.member', 'MEMBER')}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">• {user.phone}</span>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="max-w-4xl mx-auto px-4">
                    <div className="grid grid-cols-2 lg:flex gap-2 lg:gap-1 lg:border-b dark:border-neutral-800">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`w-full lg:flex-1 lg:min-w-[120px] px-4 py-3 text-sm font-medium transition-colors rounded-lg lg:rounded-none lg:rounded-t-lg ${activeTab === 'personal'
                                ? 'bg-[#DB8B89]/10 text-[#DB8B89] lg:bg-transparent lg:border-b-2 border-[#DB8B89]'
                                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 lg:hover:bg-transparent lg:hover:text-gray-700'
                                }`}
                        >
                            {t('profile.personal_info', 'Informations Personnelles')}
                        </button>
                        <button
                            onClick={() => setActiveTab('loyalty')}
                            className={`w-full lg:flex-1 lg:min-w-[120px] px-4 py-3 text-sm font-medium transition-colors rounded-lg lg:rounded-none lg:rounded-t-lg ${activeTab === 'loyalty'
                                ? 'bg-[#DB8B89]/10 text-[#DB8B89] lg:bg-transparent lg:border-b-2 border-[#DB8B89]'
                                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 lg:hover:bg-transparent lg:hover:text-gray-700'
                                }`}
                        >
                            {t('profile.loyalty_points', 'Fidélité & Points')}
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full lg:flex-1 lg:min-w-[120px] px-4 py-3 text-sm font-medium transition-colors rounded-lg lg:rounded-none lg:rounded-t-lg ${activeTab === 'orders'
                                ? 'bg-[#DB8B89]/10 text-[#DB8B89] lg:bg-transparent lg:border-b-2 border-[#DB8B89]'
                                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 lg:hover:bg-transparent lg:hover:text-gray-700'
                                }`}
                        >
                            {t('nav.orders', 'Mes Commandes')}
                        </button>
                        <button
                            onClick={() => setActiveTab('referral')}
                            className={`w-full lg:flex-1 lg:min-w-[120px] px-4 py-3 text-sm font-medium transition-colors rounded-lg lg:rounded-none lg:rounded-t-lg ${activeTab === 'referral'
                                ? 'bg-[#DB8B89]/10 text-[#DB8B89] lg:bg-transparent lg:border-b-2 border-[#DB8B89]'
                                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 lg:hover:bg-transparent lg:hover:text-gray-700'
                                }`}
                        >
                            {t('profile.referral', 'Parrainage')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {activeTab === 'personal' && (
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 transition-colors duration-300">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <User className="text-[#DB8B89]" size={24} />
                                    {t('profile.personal_info', 'Informations Personnelles')}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('profile.manage_contact', 'Gérez vos coordonnées.')}</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 sm:flex-none px-6 py-2 bg-[#DB8B89] text-white rounded-lg text-sm font-medium hover:bg-[#C07573] transition-colors disabled:opacity-50"
                                >
                                    {processing ? <Loader2 className="animate-spin mx-auto" size={18} /> : t('common.save', 'Enregistrer')}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('checkout.first_name', 'Prénom')}</label>
                                    <input
                                        type="text"
                                        value={data.first_name}
                                        onChange={e => setData('first_name', e.target.value)}
                                        className="w-full px-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-[#DB8B89]/25 focus:border-[#DB8B89] outline-none transition-colors"
                                        required
                                    />
                                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('checkout.last_name', 'Nom')}</label>
                                    <input
                                        type="text"
                                        value={data.last_name}
                                        onChange={e => setData('last_name', e.target.value)}
                                        className="w-full px-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-[#DB8B89]/25 focus:border-[#DB8B89] outline-none transition-colors"
                                        required
                                    />
                                    {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('checkout.phone', 'Numéro de Téléphone')}</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-[#DB8B89]/25 focus:border-[#DB8B89] outline-none transition-colors"
                                        required
                                    />
                                </div>
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('checkout.wilaya', 'Wilaya')}</label>
                                    <select
                                        value={data.wilaya_id}
                                        onChange={e => handleWilayaChange(e.target.value)}
                                        className="w-full px-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-[#DB8B89]/25 focus:border-[#DB8B89] outline-none transition-colors"
                                        required
                                    >
                                        <option value="">{t('checkout.select_wilaya', 'Sélectionner la wilaya')}</option>
                                        {wilayas.map(w => (
                                            <option key={w.id} value={w.id}>{getLocalizedName(w)}</option>
                                        ))}
                                    </select>
                                    {errors.wilaya_id && <p className="text-red-500 text-xs mt-1">{errors.wilaya_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('checkout.commune', 'Commune')}</label>
                                    <select
                                        value={data.commune_id}
                                        onChange={e => setData('commune_id', e.target.value)}
                                        className="w-full px-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-[#DB8B89]/25 focus:border-[#DB8B89] outline-none transition-colors"
                                        required
                                        disabled={!data.wilaya_id}
                                    >
                                        <option value="">{t('checkout.select_commune', 'Sélectionner la commune')}</option>
                                        {availableCommunes.map(c => (
                                            <option key={c.id} value={c.id}>{getLocalizedName(c)}</option>
                                        ))}
                                    </select>
                                    {errors.commune_id && <p className="text-red-500 text-xs mt-1">{errors.commune_id}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('checkout.address', 'Adresse Exacte')}</label>
                                <div className="relative">
                                    <Home className="absolute left-3 top-3 text-gray-400" size={18} />
                                    <textarea
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows="3"
                                        className="w-full pl-10 pr-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-[#DB8B89]/25 focus:border-[#DB8B89] outline-none transition-colors"
                                        placeholder={t('checkout.address_placeholder', 'Cité, Btiment, N° Appartement...')}
                                    ></textarea>
                                </div>
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>
                        </div>
                    </form>
                )}

                {activeTab === 'loyalty' && (
                    <div className="space-y-6">
                        {/* Loyalty Score Card */}
                        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 transition-colors duration-300">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                <div className="flex-1 w-full">
                                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                                        <Award className="text-teal-600 dark:text-teal-400" size={24} />
                                        {t('loyalty.score', 'Score de Fidélité')}
                                    </h2>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-5xl font-bold text-gray-900 dark:text-white">{points}</span>
                                        <span className="text-gray-500 dark:text-gray-400">{t('admin.points', 'points')}</span>
                                    </div>
                                    <div className="mb-2">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">{t('loyalty.current_tier', 'Palier actuel')}</span>
                                            <span className="text-[#DB8B89] font-medium">{1000 - points} {t('loyalty.points_to_next', 'pts pour le prochain palier')}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
                                            <div className="bg-[#DB8B89] h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, points / 10)}%` }}></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">{t('loyalty.earn_rule', 'Gagnez 1 point pour chaque 100 DA dépensé.')}</p>
                                </div>

                                {/* Next Reward Card */}
                                <div className="bg-pink-50 dark:bg-[#DB8B89]/10 rounded-lg p-4 w-full md:w-64 border border-pink-100 dark:border-[#DB8B89]/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gift className="text-[#DB8B89]" size={20} />
                                        <h3 className="font-semibold text-gray-900 dark:text-white">{t('loyalty.next_reward', 'Prochaine Récompense')}</h3>
                                    </div>
                                    <p className="text-sm text-gray-900 dark:text-gray-200 font-medium mb-1">{t('loyalty.reward_500da', "Bon d'achat de 500 DA")}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{t('loyalty.reach_1000', 'Dès 1000 points atteints.')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Loyalty History */}
                        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('loyalty.history', 'Historique des points')}</h3>
                            {loyaltyHistory.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-6">{t('loyalty.no_history', 'Aucun historique de points disponible.')}</p>
                            ) : (
                                <div className="space-y-2">
                                    {loyaltyHistory.map((entry) => (
                                        <div
                                            key={entry.id}
                                            className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 dark:bg-neutral-800"
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.description}</p>
                                                <p className="text-xs text-gray-500">{entry.created_at}</p>
                                            </div>
                                            <span className={`text-sm font-bold ${entry.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {entry.points > 0 ? '+' : ''}{entry.points}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Package className="text-[#DB8B89]" size={22} />
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {t('nav.orders', 'Mes Commandes')}
                                </h2>
                            </div>

                            {ordersList.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="font-medium mb-1">{t('orders.empty', 'Aucune commande')}</p>
                                    <p className="text-sm text-gray-400">
                                        {t('orders.empty_text', "Vous n'avez pas encore passé de commande.")}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {ordersList.map((order) => (
                                        <Link
                                            key={order.id}
                                            href={route('orders.show', order.id)}
                                            className="bg-pink-50/60 dark:bg-[#DB8B89]/5 border border-pink-100 dark:border-[#DB8B89]/20 rounded-xl px-4 py-3 flex items-center justify-between gap-4 hover:shadow-md transition-all duration-300 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 text-[#DB8B89] flex items-center justify-center text-sm font-bold border border-pink-100 dark:border-neutral-700">
                                                    #{order.id}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                        <span className="text-gray-400 mx-1">•</span>
                                                        {(order.items?.length || 0)} {t('orders.items', 'articles')}
                                                    </p>
                                                    <p className={`text-xs font-medium ${order.status === 'En attente' ? 'text-orange-500' :
                                                        order.status === 'Livrée' ? 'text-green-600' : 'text-gray-500'
                                                        }`}>
                                                        {order.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">{t('cart.total', 'Total')}</p>
                                                    <p className="text-base font-bold text-gray-900 dark:text-white">
                                                        {order.total_price.toLocaleString()} DA
                                                    </p>
                                                </div>
                                                <ChevronRight className="text-gray-400 group-hover:text-[#DB8B89] transition-colors" size={18} />
                                            </div>
                                        </Link>
                                    ))}

                                    {/* Pagination Link if needed */}
                                    {orders.links && orders.links.length > 3 && (
                                        <div className="flex justify-center mt-6 gap-2">
                                            {orders.links.map((link, i) => (
                                                link.url ? (
                                                    <Link
                                                        key={i}
                                                        href={link.url}
                                                        data={{ tab: 'orders' }}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                        className={`px-3 py-1 rounded text-sm border transition-colors ${link.active ? 'bg-[#DB8B89] text-white border-[#DB8B89]' : 'bg-white dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-neutral-700 hover:border-[#DB8B89]'}`}
                                                    />
                                                ) : (
                                                    <span key={i} dangerouslySetInnerHTML={{ __html: link.label }} className="px-3 py-1 text-sm text-gray-400" />
                                                )
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'referral' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6">
                            <div className="text-center mb-6">
                                <div className="mx-auto bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                    <Gift className="text-[#DB8B89] w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {t('referral.title', 'Invitez vos amis & Gagnez !')}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    {t('referral.subtitle', 'Partagez votre code unique et recevez des points.')}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                                <div className="bg-gray-50 dark:bg-white/5 px-8 py-4 rounded-xl text-2xl font-mono tracking-widest font-bold text-gray-800 dark:text-white border-2 border-dashed border-pink-200 dark:border-white/20">
                                    {(referral_code || user.referral_code) || t('common.generating', 'GéNéRATION...')}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(referral_code || user.referral_code)}
                                    disabled={!(referral_code || user.referral_code)}
                                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#DB8B89] text-white font-semibold hover:bg-[#C07573] disabled:opacity-50"
                                >
                                    <Copy size={18} />
                                    {t('common.copy', 'Copier')}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="text-gray-400" size={20} />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {t('referral.friends', 'Vos amis parrainés')} ({referrals.length})
                                </h3>
                            </div>

                            {referrals.length === 0 ? (
                                <p className="text-sm text-gray-400 italic text-center py-6">
                                    {t('referral.empty', "Vous n'avez parrainé personne pour le moment.")}
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {referrals.map((friend) => (
                                        <div
                                            key={friend.id}
                                            className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-50 dark:bg-neutral-800"
                                        >
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {friend.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {friend.joined_at}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
