import React, { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '@/utils/translation';

const Show = ({ cart, items, total, itemCount, auth }) => {
    const { t } = useTranslation();
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => setTheme(pre => pre === 'dark' ? 'light' : 'dark');
    const [localSpecValues, setLocalSpecValues] = useState({});

    useEffect(() => {
        const initialSpecValues = {};
        items.forEach(item => {
            if (item.specification_values && Object.keys(item.specification_values).length > 0) {
                initialSpecValues[item.id] = item.specification_values;
            }
        });
        setLocalSpecValues(initialSpecValues);
    }, [items]);

    const updateQuantity = (item, quantity) => {
        if (quantity < 1) return;
        router.put(route('cart.update', item.id), { quantity });
    };

    const removeItem = (item) => {
        router.delete(route('cart.remove', item.id));
    };

    const clearCart = () => {
        if (confirm(t('common.confirm_clear_cart', 'ÃŠtes-vous sÃ»r de vouloir vider votre panier ?'))) {
            router.post(route('cart.clear'));
        }
    };

    const updateSpecValue = (itemId, specId, value) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const currentSpecValues = item.specification_values || {};
        const newSpecValues = currentSpecValues[specId] === value 
            ? Object.fromEntries(Object.entries(currentSpecValues).filter(([k]) => k !== specId.toString()))
            : { ...currentSpecValues, [specId]: value };

        router.put(route('cart.update', item.id), { 
            quantity: item.quantity,
            specification_values: newSpecValues 
        });
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
                        <p className="text-gray-500 mb-6">{t('cart.empty_message', 'DÃ©couvrez nos produits et commencez votre shopping !')}</p>
                        <Link href={route('products.index')} className="bg-[#DB8B89] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#C07573] transition-colors">
                            {t('cart.browse_shop', 'Parcourir la boutique')}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => {
                                const variant = item.product_variant;
                                const displayImage = variant?.image 
                                    ? `/storage/${variant.image}`
                                    : (item.product && item.product.images && item.product.images.length > 0
                                        ? `/storage/${item.product.images[0].image_path}`
                                        : '/placeholder.svg');
                                const variantSpecs = variant?.specifications || [];
                                
                                return (
                                    <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex gap-4 items-center">
                                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                            <img
                                                src={displayImage}
                                                alt={getTranslated(item.product, 'name')}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-semibold text-lg text-gray-800">{getTranslated(item.product, 'name')}</h3>
                                            {variant && (
                                                <div className="text-sm text-gray-500 mb-1">
                                                    <span className="font-medium text-[#DB8B89]">SKU:</span> {variant.sku}
                                                </div>
                                            )}
                                            {variantSpecs.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {variantSpecs.map((spec) => (
                                                        <span key={spec.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                            {getTranslated(spec, 'name')}: {getTranslated(spec.pivot, 'value')}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {item.product?.specification_values && item.product.specification_values.length > 0 && (
                                                <div className="mb-2">
                                                    {(() => {
                                                        const specsBySpecId = {};
                                                        item.product.specification_values.forEach(psv => {
                                                            if (!specsBySpecId[psv.specification_id]) {
                                                                specsBySpecId[psv.specification_id] = [];
                                                            }
                                                            specsBySpecId[psv.specification_id].push(psv);
                                                        });

                                                        const currentSpecValues = localSpecValues[item.id] || item.specification_values || {};

                                                        return Object.entries(specsBySpecId).map(([specId, values]) => {
                                                            const spec = values[0]?.specification;
                                                            if (!spec) return null;

                                                            return (
                                                                <div key={specId} className="mb-2">
                                                                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                                                                        {getTranslated(spec, 'name')}
                                                                    </label>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {values.map((psv, idx) => {
                                                                            const isSelected = currentSpecValues[specId] === psv.value;
                                                                            const isOutOfStock = (psv.quantity || 0) === 0;

                                                                            return (
                                                                                <button
                                                                                    key={idx}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        if (!isOutOfStock) {
                                                                                            const newSpecValues = currentSpecValues[specId] === psv.value
                                                                                                ? Object.fromEntries(Object.entries(currentSpecValues).filter(([k]) => k !== specId.toString()))
                                                                                                : { ...currentSpecValues, [specId]: psv.value };
                                                                                            setLocalSpecValues(prev => ({ ...prev, [item.id]: newSpecValues }));
                                                                                            updateSpecValue(item.id, specId, psv.value);
                                                                                        }
                                                                                    }}
                                                                                    className={`px-2 py-1 rounded border text-xs font-medium transition-all ${isSelected
                                                                                        ? 'border-[#DB8B89] bg-[#DB8B89]/10 text-[#DB8B89]'
                                                                                        : isOutOfStock
                                                                                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                                                            : 'border-gray-200 hover:border-[#DB8B89] text-gray-700'
                                                                                    }`}
                                                                                    disabled={isOutOfStock}
                                                                                >
                                                                                    {psv.value}
                                                                                    {psv.quantity !== undefined && psv.quantity !== null && (
                                                                                        <span className={`ml-1 text-xs ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                                                                                            ({psv.quantity})
                                                                                        </span>
                                                                                    )}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            )}

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
                                );
                            })}

                            <div className="flex justify-between items-center mt-6">
                                <Link href={route('products.index')} className="text-gray-600 hover:text-[#DB8B89] font-medium flex items-center gap-2">
                                    â† {t('cart.continue_shopping', 'Continuer vos achats')}
                                </Link>
                                <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-sm font-medium">
                                    {t('cart.clear', 'Vider le panier')}
                                </button>
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                                <h3 className="text-xl font-bold mb-6">{t('cart.summary', 'RÃ©sumÃ©')}</h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t('cart.subtotal', 'Sous-total')} ({itemCount} {t('cart.items', 'articles')})</span>
                                        <span>{total.toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>{t('cart.shipping', 'Livraison')}</span>
                                        <span className="text-xs italic">{t('cart.shipping_calculated_checkout', 'CalculÃ© Ã  l\'Ã©tape suivante')}</span>
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
                                    <ShieldCheck size={14} /> {t('common.cash_on_delivery', 'Paiement Ã  la livraison sÃ©curisÃ©')}
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
