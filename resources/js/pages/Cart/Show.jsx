import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '@/utils/translation';

const Show = ({ cart, items, total, itemCount, auth }) => {
    const { t } = useTranslation();
    // Theme state (simplified for this example, usually context)
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => setTheme(pre => pre === 'dark' ? 'light' : 'dark');

    const updateQuantity = (item, quantity) => {
        if (quantity < 1) return;
        router.put(route('cart.update', item.id), { quantity });
    };

    const removeItem = (item) => {
        router.delete(route('cart.remove', item.id));
    };

    const clearCart = () => {
        if (confirm(t('common.confirm_clear_cart', 'Êtes-vous sûr de vouloir vider votre panier ?'))) {
            router.post(route('cart.clear'));
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <Header theme={theme} toggleTheme={toggleTheme} />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <ShoppingBag className="text-[#DB8B89]" />
                    {t('cart.title', 'Votre Panier')}
                </h1>

                {items.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('cart.empty', 'Votre panier est vide')}</h2>
                        <p className="text-gray-500 mb-6">{t('cart.empty_message', 'Découvrez nos produits et commencez votre shopping !')}</p>
                        <Link href={route('products.index')} className="bg-[#DB8B89] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#C07573] transition-colors">
                            {t('cart.browse_shop', 'Parcourir la boutique')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center">
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                        <img
                                            src={item.product && item.product.images && item.product.images.length > 0
                                                ? `/storage/${item.product.images[0].image_path}`
                                                : '/placeholder.svg'}
                                            alt={getTranslated(item.product, 'name')}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-lg text-gray-800">{getTranslated(item.product, 'name')}</h3>
                                        <p className="text-[#DB8B89] font-bold mb-2">{item.price_snapshot.toLocaleString()} {t('currency.symbol', 'DA')}</p>

                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center border rounded-lg">
                                                <button
                                                    onClick={() => updateQuantity(item, item.quantity - 1)}
                                                    className="p-2 hover:bg-gray-100 disabled:opacity-50"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-10 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item, item.quantity + 1)}
                                                    className="p-2 hover:bg-gray-100"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item)}
                                                className="text-red-500 p-2 hover:bg-red-50 rounded-lg ml-auto"
                                                title={t('common.delete', 'Supprimer')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-between items-center mt-6">
                                <Link href={route('products.index')} className="text-gray-600 hover:text-[#DB8B89] font-medium flex items-center gap-2">
                                    ← {t('cart.continue_shopping', 'Continuer vos achats')}
                                </Link>
                                <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-sm font-medium">
                                    {t('cart.clear', 'Vider le panier')}
                                </button>
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                                <h3 className="text-xl font-bold mb-6">{t('cart.summary', 'Résumé')}</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t('cart.subtotal', 'Sous-total')} ({itemCount} {t('cart.items', 'articles')})</span>
                                        <span>{total.toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t('cart.shipping', 'Livraison')}</span>
                                        <span className="text-xs italic">{t('cart.shipping_calculated_checkout', 'Calculé à l\'étape suivante')}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between font-bold text-xl text-gray-900">
                                        <span>{t('cart.total', 'Total')}</span>
                                        <span>{total.toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                    </div>
                                </div>

                                <Link
                                    href={route('checkout.show')}
                                    className="w-full bg-[#DB8B89] text-white py-3 rounded-xl font-bold text-center block hover:bg-[#C07573] transition-all flex items-center justify-center gap-2"
                                >
                                    {t('cart.checkout', 'Commander')} <ArrowRight size={20} />
                                </Link>

                                <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 justify-center">
                                    <ShieldCheck size={14} /> {t('common.cash_on_delivery', 'Paiement à la livraison sécurisé')}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Show;
