import React, { useState, useEffect, useRef } from 'react';
import { useForm, usePage, Link, router } from '@inertiajs/react';
import { Truck, MapPin, Phone, CreditCard, ShoppingBag, Loader2, X, CheckCircle, Star } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTranslation } from 'react-i18next';
import { getTranslated, isRTL } from '@/utils/translation';
import { getLocalizedName } from '@/utils/localization';
import { trackEvent } from '@/utils/analytics';

const Show = ({ cart, items, productsTotal, wilayas, deliveryTypes, loyaltyBalance: propLoyaltyBalance, communes: propCommunes }) => {
    // Theme state
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => setTheme(pre => pre === 'dark' ? 'light' : 'dark');

    const { auth, delivery_tariffs, communes: pageCommunes, selected_tariff, order: flashOrder, newLoyaltyBalance } = usePage().props;
    const order = flashOrder; // On récupère la commande en prop si elle vient d'être créée

    const communes = propCommunes || pageCommunes || [];

    const { t, i18n } = useTranslation();
    const isAr = i18n.language === 'ar';

    // Form handling
    const { data, setData, post, processing, errors } = useForm({
        first_name: auth.user?.client?.first_name || '',
        last_name: auth.user?.client?.last_name || '',
        phone: auth.user?.phone || auth.user?.client?.phone || '',
        wilaya_id: auth.user?.client?.wilaya_id || '',
        commune_id: auth.user?.client?.commune_id || '',
        address: auth.user?.client?.address || '',
        delivery_type: deliveryTypes[0].value,
        promo_code: '',
        use_loyalty_points: 0,
        cart_id: cart?.id,
    });

    const [shippingPrice, setShippingPrice] = useState(0);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);
    const [deliveryTypeError, setDeliveryTypeError] = useState('');

    // Promo code state
    const [promoInput, setPromoInput] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);
    const [isFreeShipping, setIsFreeShipping] = useState(false);

    // Loyalty points state (Utilise les points du user partagés par Inertia)
    const loyaltyBalance = auth.user?.points || 0;
    const loyaltyRate = auth.user?.loyalty_conversion_rate || 1.0;
    const [useLoyaltyEnabled, setUseLoyaltyEnabled] = useState(false);

    // Automatically enable loyalty points if user has some
    useEffect(() => {
        if (loyaltyBalance > 0 && !useLoyaltyEnabled && data.use_loyalty_points === 0) {
            setUseLoyaltyEnabled(true);
            setData('use_loyalty_points', loyaltyBalance);
        }
    }, [loyaltyBalance]);

    // Track InitiateCheckout on mount
    useEffect(() => {
        trackEvent('InitiateCheckout', {
            value: productsTotal,
            currency: 'DZD',
            content_ids: items.map(i => i.product_id),
            num_items: items.length,
            content_type: 'product'
        });
    }, []);

    // Initial load or update when cart changes
    useEffect(() => {
        if (cart?.id) {
            setData('cart_id', cart.id);
        }
    }, [cart]);

    useEffect(() => {
        if (!data.wilaya_id) return;

        router.get(route('checkout.show'),
            { wilaya_id: data.wilaya_id },
            {
                only: ['selected_tariff', 'communes'],
                preserveState: true,
                preserveScroll: true,
                replace: true
            }
        );
    }, [data.wilaya_id]);

    // Mise à jour locale immédiate du prix quand le type change
    useEffect(() => {
        if (selected_tariff && data.delivery_type) {
            const price = selected_tariff[data.delivery_type];
            if (price !== undefined) {
                setShippingPrice(price);
                setDeliveryTypeError('');
            } else {
                setShippingPrice(0);
                setDeliveryTypeError(`Ce type de livraison (${data.delivery_type === 'domicile' ? 'Domicile' : 'Bureau'}) n'est pas supporté pour cette wilaya`);
            }
        } else if (selected_tariff === null && data.wilaya_id) {
            setDeliveryTypeError('Cette wilaya n\'est pas disponible pour la livraison');
            setShippingPrice(0);
        }
    }, [selected_tariff, data.delivery_type, data.wilaya_id]);

    const calculateShipping = () => {
        if (selected_tariff) {
            setShippingPrice(selected_tariff[data.delivery_type] || 0);
            return;
        }

        if (!data.wilaya_id || !data.delivery_type || !delivery_tariffs) {
            setShippingPrice(0);
            return;
        }

        const wilayaTariffs = delivery_tariffs[data.wilaya_id] || [];
        const tariff = wilayaTariffs.find(t => t.type === data.delivery_type);
        setShippingPrice(tariff ? parseFloat(tariff.price) : 0);
    };

    const validatePromoCode = async () => {
        if (!promoInput.trim()) return;

        setIsValidatingPromo(true);
        setPromoError('');

        try {
            const response = await window.axios.post(route('checkout.validate-promo'), {
                code: promoInput,
                amount: productsTotal,
            });

            setPromoDiscount(response.data.discount);
            setIsFreeShipping(!!response.data.is_free_shipping);
            setData('promo_code', response.data.code);
            setPromoError('');
        } catch (error) {
            setPromoDiscount(0);
            setData('promo_code', '');
            setPromoError(error.response?.data?.error || 'Code invalide');
        } finally {
            setIsValidatingPromo(false);
        }
    };

    const removePromoCode = () => {
        setPromoInput('');
        setPromoDiscount(0);
        setIsFreeShipping(false);
        setData('promo_code', '');
        setPromoError('');
    };

    const handleLoyaltyPointsChange = (points) => {
        const p = Math.max(0, parseInt(points) || 0);
        setData('use_loyalty_points', p);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('checkout.place'), {
            preserveScroll: true,
            onError: (errors) => {
                console.error("Erreurs de validation:", errors);
                const firstError = Object.values(errors)[0];
                if (firstError) {
                    alert(`Erreur: ${firstError}`);
                }
            }
        });
    };

    // VUE SUCCÈS SPA (Si la commande vient d'être passée)
    if (order) {
        return (
            <div className={`checkout-page min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-black text-white' : 'bg-gray-50'}`} dir={isAr ? 'rtl' : 'ltr'}>
                <Header theme={theme} toggleTheme={toggleTheme} />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#171717] p-8 md:p-12 rounded-3xl shadow-lg max-w-2xl w-full text-center slide-in border border-gray-100 dark:border-gray-800">
                        <div className="w-20 h-20 bg-[#DB8B89]/10 rounded-full flex items-center justify-center mx-auto mb-6 text-[#DB8B89]">
                            <CheckCircle size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('common.success', 'Commande Réussie !')}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">
                            {t('checkout.thank_you', 'Merci')} <span className="font-semibold text-gray-900 dark:text-gray-200">{order.first_name}</span>. {t('checkout.order_confirmed', 'Votre commande')} <span className="font-mono text-[#DB8B89]">#{order.id}</span> {t('status.confirmed', 'est confirmée')}.
                        </p>
                        <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 rounded-2xl mb-8 text-left border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500 dark:text-gray-400">{t('orders.total', 'Montant total')}:</span>
                                <span className="font-bold text-gray-900 dark:text-gray-100">{order.total_price.toLocaleString()} DA</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">{t('checkout.shipping_to', 'Livraison à')}:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">{order.commune_name}, {order.wilaya_name}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 justify-center">
                            <Link href={route('products.index')} className="bg-[#DB8B89] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#C07573] transition-colors">{t('cart.continue_shopping', 'Continuer les achats')}</Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const activeShippingPrice = isFreeShipping ? 0 : shippingPrice;

    // Calcul de la remise fidélité réelle (plafonnée par le total restant)
    const maxReducibleAmount = Math.max(0, productsTotal + activeShippingPrice - promoDiscount);
    const potentialLoyaltyDiscount = useLoyaltyEnabled ? (data.use_loyalty_points * loyaltyRate) : 0;
    const loyaltyDiscount = Math.min(potentialLoyaltyDiscount, maxReducibleAmount);

    const total = productsTotal + activeShippingPrice - promoDiscount - loyaltyDiscount;

    return (
        <div className={`checkout-page min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-black text-white' : 'bg-gray-50'}`} dir={isAr ? 'rtl' : 'ltr'}>
            <Header theme={theme} toggleTheme={toggleTheme} />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <CreditCard className="text-[#DB8B89]" />
                    {t('checkout.title', 'Finaliser la commande')}
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="checkout-card bg-white dark:bg-[#171717] p-6 rounded-2xl shadow-sm space-y-6 border border-gray-100 dark:border-gray-800">

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    <Phone size={20} className="text-gray-400 dark:text-gray-500" /> {t('checkout.contact_info', 'Informations de contact')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.last_name', 'Nom')}</label>
                                        <input
                                            type="text"
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] bg-white dark:bg-[#1a1a1a] dark:text-white ${errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                            required
                                        />
                                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.first_name', 'Prénom')}</label>
                                        <input
                                            type="text"
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] bg-white dark:bg-[#1a1a1a] dark:text-white ${errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                            required
                                        />
                                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.phone', 'Téléphone')}</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] bg-white dark:bg-[#1a1a1a] dark:text-white ${errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                            required
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200 dark:border-gray-800" />

                            {/* Delivery Info */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                                    <MapPin size={20} className="text-gray-400 dark:text-gray-500" /> {t('checkout.shipping_info', 'Livraison')}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Wilaya Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.wilaya', 'Wilaya')}</label>
                                        <select
                                            value={data.wilaya_id}
                                            onChange={e => setData('wilaya_id', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] bg-white dark:bg-[#1a1a1a] dark:text-white ${errors.wilaya_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                            required
                                        >
                                            <option value="">{t('checkout.select_wilaya', 'Sélectionner une wilaya')}</option>
                                            {wilayas.map(w => (
                                                <option key={w.id} value={w.id}>{w.id} - {getLocalizedName(w)}</option>
                                            ))}
                                        </select>
                                        {errors.wilaya_id && <p className="text-red-500 text-xs mt-1">{errors.wilaya_id}</p>}
                                        {deliveryTypeError && !selected_tariff && (
                                            <p className="text-red-500 text-xs mt-1">{deliveryTypeError}</p>
                                        )}
                                    </div>

                                    {/* Commune Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.commune', 'Commune')}</label>
                                        <select
                                            value={data.commune_id}
                                            onChange={e => setData('commune_id', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] bg-white dark:bg-[#1a1a1a] dark:text-white ${errors.commune_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                            required
                                            disabled={!data.wilaya_id}
                                        >
                                            <option value="">{t('checkout.select_commune', 'Sélectionner une commune')}</option>
                                            {communes.map(c => (
                                                <option key={c.id} value={c.id}>{getLocalizedName(c)}</option>
                                            ))}
                                        </select>
                                        {errors.commune_id && <p className="text-red-500 text-xs mt-1">{errors.commune_id}</p>}
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.address', 'Adresse complète (optionnelle)')}</label>
                                        <textarea
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            rows="2"
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] bg-white dark:bg-[#1a1a1a] dark:text-white ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                            placeholder={t('checkout.address_placeholder', 'Quartier, N° rue, Btiment...')}
                                        ></textarea>
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                    </div>

                                    {/* Delivery Type */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('checkout.delivery_type', 'Mode de livraison')}</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {deliveryTypes.map(type => {
                                                const isSupported = selected_tariff && selected_tariff[type.value] !== undefined;
                                                const isSelected = data.delivery_type === type.value;
                                                return (
                                                    <label
                                                        key={type.value}
                                                        className={`border rounded-xl p-4 cursor-pointer flex items-center justify-between transition-all ${isSelected ? 'border-[#DB8B89] bg-[#F8E4E0] dark:bg-[#DB8B89]/20 ring-1 ring-[#DB8B89]' :
                                                            isSupported ? 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500' : 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="radio"
                                                                name="delivery_type"
                                                                value={type.value}
                                                                checked={isSelected}
                                                                onChange={e => setData('delivery_type', e.target.value)}
                                                                className="text-[#DB8B89] focus:ring-[#DB8B89]"
                                                                disabled={!isSupported}
                                                            />
                                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                {type.value === 'DOMICILE' ? t('checkout.domicile', 'Domicile') :
                                                                    type.value === 'BUREAU' ? t('checkout.bureau', 'Bureau') :
                                                                        type.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {selected_tariff && selected_tariff[type.value] !== undefined && (
                                                                <span className="text-sm font-bold text-[#DB8B89]">{selected_tariff[type.value].toLocaleString()} DA</span>
                                                            )}
                                                            <Truck size={18} className={isSelected ? 'text-[#DB8B89]' : 'text-gray-400 dark:text-gray-500'} />
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {deliveryTypeError && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-sm text-red-600 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    {deliveryTypeError}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="checkout-card checkout-summary bg-white dark:bg-[#171717] p-6 rounded-2xl shadow-sm sticky top-24 border border-gray-100 dark:border-gray-800">
                            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">{t('checkout.summary', 'Récapitulatif')}</h3>

                            <div className="max-h-60 overflow-y-auto space-y-3 mb-6 pr-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-3 text-sm">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded md-1 flex-shrink-0 relative">
                                            <img
                                                src={item.product && item.product.images[0] ? `/storage/${item.product.images[0].image_path}` : '/placeholder.svg'}
                                                className="w-full h-full object-cover rounded"
                                            />
                                            <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium line-clamp-1 text-gray-900 dark:text-gray-200">{getTranslated(item.product, 'name')}</p>
                                            {item.product_variant && item.product_variant.variant_specifications && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {item.product_variant.variant_specifications.map((spec, idx) => (
                                                        <span key={spec.id}>
                                                            {idx > 0 && ' / '}
                                                            {getTranslated(spec, 'name')}: {spec.pivot.value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-gray-500 dark:text-gray-400">{item.price_snapshot.toLocaleString()} DA</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4 border-gray-200 dark:border-gray-800" />

                            {/* Promo Code Section */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('admin.promo_codes', 'Code Promo')}</label>
                                {data.promo_code ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                        <div>
                                            <p className="font-medium text-green-800 dark:text-green-400">{data.promo_code}</p>
                                            <p className="text-xs text-green-600 dark:text-green-500">
                                                {isFreeShipping ? t('cart.free_shipping', 'Livraison Gratuite') : `-${promoDiscount.toLocaleString()} DA`}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removePromoCode}
                                            className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium"
                                            title={t('common.remove', 'Supprimer')}
                                        >
                                            <X className="w-4 h-4" />
                                            {t('common.remove', 'Retirer')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoInput}
                                            onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                            placeholder={t('checkout.promo_placeholder', 'Entrer le code')}
                                            className="flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#DB8B89] bg-white dark:bg-[#1a1a1a] dark:text-white border-gray-300 dark:border-gray-700"
                                        />
                                        <button
                                            type="button"
                                            onClick={validatePromoCode}
                                            disabled={isValidatingPromo || !promoInput.trim()}
                                            className="px-4 py-2 bg-[#DB8B89] text-white rounded-lg text-sm font-medium hover:bg-[#C07573] disabled:opacity-50"
                                        >
                                            {isValidatingPromo ? t('common.loading', 'Vérification...') : t('common.apply', 'Appliquer')}
                                        </button>
                                    </div>
                                )}
                                {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                            </div>

                            {/* Loyalty Points Section */}
                            {auth.user && (
                                <div className="mb-4">
                                    {loyaltyBalance > 0 ? (
                                        <>
                                            <label className="flex items-center gap-2 cursor-pointer mb-2 p-3 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={useLoyaltyEnabled}
                                                    onChange={e => {
                                                        const checked = e.target.checked;
                                                        setUseLoyaltyEnabled(checked);
                                                        setData('use_loyalty_points', checked ? loyaltyBalance : 0);
                                                    }}
                                                    className="w-4 h-4 text-[#DB8B89] rounded focus:ring-[#DB8B89]"
                                                />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {t('loyalty.use_points', 'Utiliser mes points')} ({loyaltyBalance.toLocaleString()} pts)
                                                </span>
                                            </label>

                                            {useLoyaltyEnabled && (
                                                <div className="flex gap-2 p-1">
                                                    <input
                                                        type="number"
                                                        value={data.use_loyalty_points || ''}
                                                        onChange={e => handleLoyaltyPointsChange(e.target.value)}
                                                        placeholder="0"
                                                        max={loyaltyBalance}
                                                        className="w-32 border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#DB8B89] bg-white dark:bg-[#1a1a1a] dark:text-white border-gray-300 dark:border-gray-700"
                                                    />
                                                    <div className="flex-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                        <span>= {(data.use_loyalty_points * loyaltyRate).toLocaleString()} DA</span>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-3 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-zinc-800/30">
                                            <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                                                <Star size={18} />
                                                <div>
                                                    <span className="text-sm font-medium block">{t('loyalty.no_points', 'Programme de fidélité')}</span>
                                                    <span className="text-xs">{t('loyalty.no_points_desc', 'Gagnez des points sur chaque commande !')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <hr className="my-4 border-gray-200 dark:border-gray-800" />

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>{t('cart.subtotal', 'Sous-total')}</span>
                                    <span>{productsTotal.toLocaleString()} DA</span>
                                </div>
                                {promoDiscount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>{t('admin.promo_codes', 'Code Promo')}</span>
                                        <span>-{promoDiscount.toLocaleString()} DA</span>
                                    </div>
                                )}
                                {loyaltyDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-500">
                                        <span>{t('admin.loyalty', 'Points Fidélité')}</span>
                                        <span>-{loyaltyDiscount.toLocaleString()} DA</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>{t('cart.shipping', 'Livraison')}</span>
                                    {isLoadingShipping ? (
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    ) : (
                                        <span className={isFreeShipping ? "text-green-600 font-bold" : ""}>
                                            {isFreeShipping
                                                ? t('cart.free_shipping', 'Gratuit (Promo)')
                                                : (shippingPrice > 0 ? `${shippingPrice.toLocaleString()} DA` : t('cart.free_shipping', 'Gratuit / Non calculé'))
                                            }
                                        </span>
                                    )}
                                </div>
                                <div className="border-t dark:border-gray-800 pt-3 flex justify-between font-bold text-xl text-gray-900 dark:text-white">
                                    <span>{t('cart.total_to_pay', 'Total à payer')}</span>
                                    <span className="text-[#DB8B89]">{total.toLocaleString()} DA</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={processing || isLoadingShipping || !data.wilaya_id || deliveryTypeError}
                                className="w-full bg-[#DB8B89] text-white py-3 rounded-xl font-bold text-center block hover:bg-[#C07573] transition-all shadow-lg shadow-[rgba(219,139,137,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? t('common.processing', 'Traitement...') : t('checkout.place_order', 'Confirmer la commande')}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                {t('checkout.terms', 'En confirmant, vous acceptez nos conditions générales de vente.')}
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Show;
