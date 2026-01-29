import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Truck, MapPin, Phone, CreditCard, ShoppingBag, Loader2, X } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useTranslation } from 'react-i18next';
import { getTranslated, isRTL } from '@/utils/translation';

const Show = ({ cart, items, productsTotal, wilayas, deliveryTypes, loyaltyBalance: propLoyaltyBalance }) => {
    // Theme state
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => setTheme(pre => pre === 'dark' ? 'light' : 'dark');

    const { auth } = usePage().props;
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
    });

    // Local state for dynamic data
    const [communes, setCommunes] = useState([]);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);

    // Promo code state
    const [promoInput, setPromoInput] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);

    // Loyalty points state
    const [loyaltyBalance, setLoyaltyBalance] = useState(propLoyaltyBalance || auth.user?.client?.total_points || 0);
    const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);

    // Initial load or update when wilaya/type changes
    useEffect(() => {
        if (data.wilaya_id) {
            fetchShippingAndCommunes();
        }
    }, [data.wilaya_id, data.delivery_type]);

    const fetchShippingAndCommunes = async () => {
        setIsLoadingShipping(true);
        try {
            const response = await axios.post(route('checkout.shipping'), {
                wilaya_id: data.wilaya_id,
                delivery_type: data.delivery_type
            });

            setShippingPrice(response.data.delivery_price);
            setCommunes(response.data.communes);
        } catch (error) {
            console.error("Erreur calcul livraison:", error);
            setShippingPrice(0);
            setCommunes([]);
        } finally {
            setIsLoadingShipping(false);
        }
    };

    const validatePromoCode = async () => {
        if (!promoInput.trim()) return;

        setIsValidatingPromo(true);
        setPromoError('');

        try {
            const response = await axios.post(route('checkout.validate-promo'), {
                code: promoInput,
                amount: productsTotal,
            });

            setPromoDiscount(response.data.discount);
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
        setData('promo_code', '');
        setPromoError('');
    };

    const handleLoyaltyPointsChange = (points) => {
        const maxPoints = Math.min(loyaltyBalance, productsTotal);
        const usePoints = Math.min(Math.max(0, parseInt(points) || 0), maxPoints);
        setData('use_loyalty_points', usePoints);
        setLoyaltyDiscount(usePoints); // 1 point = 1 DA
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('checkout.place'));
    };

    const total = productsTotal + shippingPrice - promoDiscount - loyaltyDiscount;

    return (
        <div className={`checkout-page min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <Header theme={theme} toggleTheme={toggleTheme} />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <CreditCard className="text-[#DB8B89]" />
                    Finaliser la commande
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="checkout-card bg-white p-6 rounded-2xl shadow-sm space-y-6">

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Phone size={20} className="text-gray-400" /> Informations de contact
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                        <input
                                            type="text"
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        />
                                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                        <input
                                            type="text"
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        />
                                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* Delivery Info */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <MapPin size={20} className="text-gray-400" /> Livraison
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Wilaya Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya</label>
                                        <select
                                            value={data.wilaya_id}
                                            onChange={e => setData('wilaya_id', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] ${errors.wilaya_id ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        >
                                            <option value="">{t('checkout.select_wilaya', 'Sélectionner une wilaya')}</option>
                                            {wilayas.map(w => (
                                                <option key={w.id} value={w.id}>{w.id} - {isAr ? (w.name_ar || w.name) : w.name}</option>
                                            ))}
                                        </select>
                                        {errors.wilaya_id && <p className="text-red-500 text-xs mt-1">{errors.wilaya_id}</p>}
                                    </div>

                                    {/* Commune Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                                        <select
                                            value={data.commune_id}
                                            onChange={e => setData('commune_id', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] ${errors.commune_id ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                            disabled={!data.wilaya_id}
                                        >
                                            <option value="">{t('checkout.select_commune', 'Sélectionner une commune')}</option>
                                            {communes.map(c => (
                                                <option key={c.id} value={c.id}>{isAr ? (c.name_ar || c.name) : c.name}</option>
                                            ))}
                                        </select>
                                        {errors.commune_id && <p className="text-red-500 text-xs mt-1">{errors.commune_id}</p>}
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
                                        <textarea
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            rows="2"
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Quartier, N° rue, Bâtiment..."
                                            required
                                        ></textarea>
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                    </div>

                                    {/* Delivery Type */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mode de livraison</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {deliveryTypes.map(type => (
                                                <label
                                                    key={type.value}
                                                    className={`border rounded-xl p-4 cursor-pointer flex items-center justify-between transition-all ${data.delivery_type === type.value ? 'border-[#DB8B89] bg-[#F8E4E0] ring-1 ring-[#DB8B89]' : 'hover:border-gray-400'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name="delivery_type"
                                                            value={type.value}
                                                            checked={data.delivery_type === type.value}
                                                            onChange={e => setData('delivery_type', e.target.value)}
                                                            className="text-[#DB8B89] focus:ring-[#DB8B89]"
                                                        />
                                                        <span className="font-medium">{type.label}</span>
                                                    </div>
                                                    <Truck size={18} className={data.delivery_type === type.value ? 'text-[#DB8B89]' : 'text-gray-400'} />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="checkout-card checkout-summary bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Récapitulatif</h3>

                            <div className="max-h-60 overflow-y-auto space-y-3 mb-6 pr-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-3 text-sm">
                                        <div className="w-12 h-12 bg-gray-100 rounded md-1 flex-shrink-0 relative">
                                            <img
                                                src={item.product && item.product.images[0] ? `/storage/${item.product.images[0].image_path}` : '/placeholder.svg'}
                                                className="w-full h-full object-cover rounded"
                                            />
                                            <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium line-clamp-1">{getTranslated(item.product, 'name')}</p>
                                            <p className="text-gray-500">{item.price_snapshot.toLocaleString()} DA</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            {/* Promo Code Section */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Code Promo</label>
                                {data.promo_code ? (
                                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-green-800">{data.promo_code}</p>
                                            <p className="text-xs text-green-600">-{promoDiscount.toLocaleString()} DA</p>
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
                                            className="flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#DB8B89]"
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
                            {auth.user && loyaltyBalance > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('loyalty.available_points', 'Points Fidélité')} ({t('loyalty.available', 'Disponible')}: {loyaltyBalance.toLocaleString()})
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={data.use_loyalty_points || ''}
                                            onChange={e => handleLoyaltyPointsChange(e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            max={Math.min(loyaltyBalance, productsTotal)}
                                            className="flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#DB8B89]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleLoyaltyPointsChange(Math.min(loyaltyBalance, productsTotal))}
                                            className="px-4 py-2 bg-[#DB8B89] text-white rounded-lg text-sm font-medium hover:bg-[#C07573]"
                                        >
                                            {t('loyalty.use_all', 'Utiliser tout')}
                                        </button>
                                    </div>
                                    {loyaltyDiscount > 0 && (
                                        <p className="text-xs text-green-600 mt-1">
                                            {t('cart.discount', 'Réduction')} : -{loyaltyDiscount.toLocaleString()} DA
                                        </p>
                                    )}
                                </div>
                            )}

                            <hr className="my-4" />

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
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
                                    <div className="flex justify-between text-green-600">
                                        <span>{t('admin.loyalty', 'Points Fidélité')}</span>
                                        <span>-{loyaltyDiscount.toLocaleString()} DA</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-600">
                                    <span>{t('cart.shipping', 'Livraison')}</span>
                                    {isLoadingShipping ? (
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    ) : (
                                        <span>{shippingPrice > 0 ? `${shippingPrice.toLocaleString()} DA` : t('cart.free_shipping', 'Gratuit / Non calculé')}</span>
                                    )}
                                </div>
                                <div className="border-t pt-3 flex justify-between font-bold text-xl text-gray-900">
                                    <span>{t('cart.total_to_pay', 'Total à payer')}</span>
                                    <span>{total.toLocaleString()} DA</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={processing || isLoadingShipping || !data.wilaya_id}
                                className="w-full bg-[#DB8B89] text-white py-3 rounded-xl font-bold text-center block hover:bg-[#C07573] transition-all shadow-lg shadow-[rgba(219,139,137,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? t('common.processing', 'Traitement...') : t('checkout.place_order', 'Confirmer la commande')}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                En confirmant, vous acceptez nos conditions générales de vente.
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
