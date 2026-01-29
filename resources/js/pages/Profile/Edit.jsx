import React, { useState } from 'react';
import { ShoppingCart, User, Gift, Award, Package, Copy, Loader2, Users, ChevronRight } from 'lucide-react';
import { usePage, useForm, Head } from '@inertiajs/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTranslation } from 'react-i18next';

export default function UserProfile({ theme, toggleTheme }) {
    const { t } = useTranslation();
    const { auth, referral_code, referrals = [], orders = null } = usePage().props;
    const ordersList = Array.isArray(orders?.data) ? orders.data : [];
    const user = auth.user;
    const client = user.client || {};

    const [activeTab, setActiveTab] = useState('personal');

    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        phone: user.phone,
        email: user.email || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
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
                            {client.points > 1000 ? 'GOLD MEMBER' : 'MEMBER'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">• {user.phone}</span>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex gap-1 border-b dark:border-neutral-800 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'personal'
                                ? 'text-[#DB8B89] border-b-2 border-[#DB8B89]'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {t('profile.personal_info', 'Infos Personnelles')}
                        </button>
                        <button
                            onClick={() => setActiveTab('loyalty')}
                            className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'loyalty'
                                ? 'text-[#DB8B89] border-b-2 border-[#DB8B89]'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {t('profile.loyalty_points', 'Fidélité & Points')}
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'orders'
                                ? 'text-[#DB8B89] border-b-2 border-[#DB8B89]'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {t('nav.orders', 'Mes Commandes')}
                        </button>
                        <button
                            onClick={() => setActiveTab('referral')}
                            className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'referral'
                                ? 'text-[#DB8B89] border-b-2 border-[#DB8B89]'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
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
                                    Informations Personnelles
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gérez vos coordonnées.</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 sm:flex-none px-6 py-2 bg-[#DB8B89] text-white rounded-lg text-sm font-medium hover:bg-[#C07573] transition-colors disabled:opacity-50"
                                >
                                    {processing ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Enregistrer'}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom Complet</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-[#DB8B89]/25 focus:border-[#DB8B89] outline-none transition-colors"
                                />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Numéro de Téléphone</label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={e => setData('phone', e.target.value)}
                                    className="w-full px-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-[#DB8B89]/25 focus:border-[#DB8B89] outline-none transition-colors"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
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
                                        Score de Fidélité
                                    </h2>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-5xl font-bold text-gray-900 dark:text-white">{client.points || 0}</span>
                                        <span className="text-gray-500 dark:text-gray-400">points</span>
                                    </div>
                                    <div className="mb-2">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">Palier actuel</span>
                                            <span className="text-[#DB8B89] font-medium">{1000 - (client.points || 0)} pts pour le prochain palier</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
                                            <div className="bg-[#DB8B89] h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (client.points || 0) / 10)}%` }}></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Gagnez 1 point pour chaque 100 DA dépensé.</p>
                                </div>

                                {/* Next Reward Card */}
                                <div className="bg-pink-50 dark:bg-[#DB8B89]/10 rounded-lg p-4 w-full md:w-64 border border-pink-100 dark:border-[#DB8B89]/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gift className="text-[#DB8B89]" size={20} />
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Prochaine Récompense</h3>
                                    </div>
                                    <p className="text-sm text-gray-900 dark:text-gray-200 font-medium mb-1">Bon d'achat de 500 DA</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Dès 1000 points atteints.</p>
                                </div>
                            </div>
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
                                        <div
                                            key={order.id}
                                            className="bg-pink-50/60 border border-pink-100 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-white text-[#DB8B89] flex items-center justify-center text-sm font-bold border border-pink-100">
                                                    #{order.id}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                        <span className="text-gray-400 mx-1">•</span>
                                                        {(order.items?.length || 0)} {t('orders.items', 'articles')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {order.status}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">{t('cart.total', 'Total')}</p>
                                                    <p className="text-base font-bold text-gray-900">
                                                        {order.total_price.toLocaleString()} DA
                                                    </p>
                                                </div>
                                                <ChevronRight className="text-gray-400" size={18} />
                                            </div>
                                        </div>
                                    ))}
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
                                <div className="bg-gray-50 dark:bg-neutral-800 px-8 py-4 rounded-xl text-2xl font-mono tracking-widest font-bold text-gray-800 dark:text-white border-2 border-dashed border-pink-200 dark:border-[#DB8B89]/40">
                                    {(referral_code || user.referral_code) || 'GÉNÉRATION...'}
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
