import { router, useForm, usePage, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Star, ShoppingCart, Minus, Plus, ChevronLeft, Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartConfirmationModal from '../../components/CartConfirmationModal';
// import '../../../css/productPage.css'; // Removing custom CSS to rely on Tailwind
import { useTranslation } from 'react-i18next';
import { getTranslated, isRTL } from '@/utils/translation';

const Show = ({ product, relatedProducts, theme, toggleTheme }) => {
    const { t, i18n } = useTranslation();
    const { auth, communes: pageCommunes, delivery_tariffs, selected_tariff, order, newLoyaltyBalance, flash } = usePage().props;
    const communes = pageCommunes || [];

    // ⚡️ CRITIQUE : Garder le produit en mémoire même si il devient null après commande
    const productRef = useRef(product);
    useEffect(() => {
        if (product) {
            productRef.current = product;
        }
    }, [product]);
    const currentProduct = product || productRef.current;

    const fullName = auth?.user?.name ?? '';
    const [first = '', ...rest] = fullName.split(' ');
    const last = rest.join(' ');
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedSpecValues, setSelectedSpecValues] = useState({});

    const [wilayas, setWilayas] = useState([]);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

    // Form handling
    const { data, setData, post, processing, errors } = useForm({
        product_id: currentProduct?.id || 0,
        product_variant_id: null,
        quantity: 1,
        specification_values: {},
        first_name: auth?.user?.client?.first_name || '',
        last_name: auth?.user?.client?.last_name || '',
        phone: auth?.user?.phone || auth?.user?.client?.phone || '',
        address: auth?.user?.client?.address || '',
        wilaya_id: auth?.user?.client?.wilaya_id || '',
        commune_id: auth?.user?.client?.commune_id || '',
        delivery_type: 'DOMICILE',
        promo_code: '',
        use_loyalty_points: 0,
    });

    // Update form variant_id when selection changes
    useEffect(() => {
        setData('product_variant_id', selectedVariant?.id || null);
    }, [selectedVariant]);

    // Promo code state
    const [showPromo, setShowPromo] = useState(false);
    const [promoInput, setPromoInput] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [isValidatingPromo, setIsValidatingPromo] = useState(false);

    // Cart Modal State
    const [cartModalOpen, setCartModalOpen] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        setAddingToCart(true);
        router.post(route('cart.add'), {
            product_id: currentProduct?.id || 0,
            product_variant_id: selectedVariant?.id || null,
            quantity: data.quantity,
            price: selectedVariant?.price || currentProduct?.price || 0,
            stock: selectedVariant?.stock || currentProduct?.stock || 0,
            specification_values: selectedSpecValues
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setCartModalOpen(true);
                setAddingToCart(false);
                toast.success(t('product.added_to_cart', 'Produit ajouté au panier'));
            },
            onError: () => setAddingToCart(false)
        });
    };

    // Initial load for wilayas only (static list)
    useEffect(() => {
        axios.get(route('wilayas.index')).then(res => {
            setWilayas(res.data.data);
        });
    }, []);

    const handleWilayaChange = (wilayaId) => {
        setData(d => ({ ...d, wilaya_id: wilayaId, commune_id: '' }));
    };

    // ⚡️ OPTIMISATION CRITIQUE : On ne recharge QUE si la wilaya change
    // On récupère les tarifs pour TOUS les modes d'un coup (Domicile & Bureau)
    useEffect(() => {
        if (!data.wilaya_id || order) return; // Pas de rechargement si la commande est passée (SPA)

        setIsCalculatingShipping(true);
        router.get(route('products.show', currentProduct?.id || 0),
            { wilaya_id: data.wilaya_id },
            {
                only: ['selected_tariff', 'communes'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsCalculatingShipping(false)
            }
        );
    }, [data.wilaya_id, order]);

    // Mise à jour locale immédiate du prix quand le type change (sans requête réseau)
    useEffect(() => {
        if (selected_tariff && data.delivery_type) {
            setShippingPrice(selected_tariff[data.delivery_type] || 0);
        }
    }, [selected_tariff, data.delivery_type]);

    // Update form specification_values when selection changes
    useEffect(() => {
        setData('specification_values', selectedSpecValues);
    }, [selectedSpecValues]);

    const [useLoyaltyEnabled, setUseLoyaltyEnabled] = useState(false);
    // ⚡️ OPTIMISATION : Utiliser le nouveau solde si disponible (après commande), sinon le solde actuel
    const loyaltyBalance = newLoyaltyBalance !== undefined ? newLoyaltyBalance : (auth.user?.points || 0);

    // Automatically enable loyalty points and set the discount if user has points
    useEffect(() => {
        console.log('Loyalty useEffect triggered:', {
            loyaltyBalance,
            hasAuth: !!auth.user,
            shouldEnable: loyaltyBalance > 0 && !!auth.user,
            currentUseLoyaltyEnabled: useLoyaltyEnabled,
            currentUseLoyaltyPoints: data.use_loyalty_points,
        });

        if (loyaltyBalance > 0 && auth.user) {
            console.log('Enabling loyalty points automatically:', loyaltyBalance);
            setUseLoyaltyEnabled(true);
            setData('use_loyalty_points', loyaltyBalance);
        }
    }, [loyaltyBalance, auth.user]);

    console.log('Show.jsx Debug:', {
        user: auth.user,
        points: auth.user?.points,
        loyaltyBalance,
        useLoyaltyEnabled,
        use_loyalty_points: data.use_loyalty_points,
        wilaya_id: data.wilaya_id,
        showCondition: auth.user && loyaltyBalance > 0
    });

    const productsTotal = (currentProduct?.price || 0) * data.quantity;
    // ⚡️ Calcul du montant maximum convertible en points (Total + Livraison - Remise Promo)
    const maxLoyaltyAmount = Math.max(0, productsTotal + shippingPrice - promoDiscount);
    const finalLoyaltyDiscount = useLoyaltyEnabled ? Math.min(data.use_loyalty_points, maxLoyaltyAmount, loyaltyBalance) : 0;
    const finalTotal = productsTotal + shippingPrice - promoDiscount - finalLoyaltyDiscount;

    console.log('Loyalty calculation:', {
        productsTotal,
        shippingPrice,
        promoDiscount,
        useLoyaltyEnabled,
        use_loyalty_points: data.use_loyalty_points,
        loyaltyBalance,
        maxLoyaltyAmount,
        finalLoyaltyDiscount,
        finalTotal,
    });

    const calculateTotal = () => {
        const subtotal = (currentProduct?.price || 0) * data.quantity;
        const total = subtotal + shippingPrice - promoDiscount;
        return Math.max(0, total);
    };

    const validatePromoCode = async () => {
        if (!promoInput.trim()) return;

        setIsValidatingPromo(true);
        setPromoError('');

        try {
            const response = await axios.post(route('checkout.validate-promo'), {
                code: promoInput,
                amount: (currentProduct?.price || 0) * data.quantity,
            });

            setPromoDiscount(response.data.discount);
            setData('promo_code', response.data.code);
            setPromoError('');
        } catch (error) {
            setPromoDiscount(0);
            setData('promo_code', '');
            setPromoError(error.response?.data?.error || t('checkout.invalid_code', 'Code invalide'));
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

    const handlePlaceOrder = (e) => {
        e.preventDefault();

        // Validate required fields before submitting
        if (!data.wilaya_id || !data.commune_id || !data.first_name || !data.last_name || !data.phone || !data.address) {
            toast.error(t('checkout.fill_all_fields', 'Veuillez remplir tous les champs requis'));
            return;
        }

        // Inject the direct-purchase structure into the Inertia form state
        setData(prev => ({
            ...prev,
            specification_values: selectedSpecValues,
            items: {
                [currentProduct?.id || 0]: {
                    quantity: prev.quantity,
                    specification_values: selectedSpecValues,
                },
            },
            clear_cart: false,
        }));

        setPlacingOrder(true);

        // Safety timeout to prevent infinite loading (30 seconds)
        const timeoutId = setTimeout(() => {
            setPlacingOrder(false);
            toast.error(t('checkout.timeout_error', 'La requête a pris trop de temps. Veuillez réessayer.'));
        }, 30000);

        // With useForm, the payload comes from `data`. We only pass options here.
        post(route('checkout.place'), {
            preserveState: false, // ⚡️ CRITIQUE : Il faut laisser Inertia charger la nouvelle page (Success)
            preserveScroll: false,
            onFinish: () => {
                clearTimeout(timeoutId);
                setPlacingOrder(false);
            },
            onSuccess: () => {
                clearTimeout(timeoutId);
                setPlacingOrder(false);
            },
            onError: (err) => {
                clearTimeout(timeoutId);
                console.error("Erreur commande directe:", err);
                setPlacingOrder(false); // ⚡️ CRITIQUE : Reset loading state on error
                const firstMsg = Array.isArray(err)
                    ? err[0]
                    : (typeof err === 'object' && err !== null ? Object.values(err)[0] : err);
                if (firstMsg) {
                    toast.error(typeof firstMsg === 'string'
                        ? firstMsg
                        : t('checkout.order_error', 'Une erreur est survenue lors de la commande'));
                } else {
                    toast.error(t('checkout.order_error', 'Une erreur est survenue lors de la commande'));
                }
            },
        });
    };



    return (
        <div className="product-page">
            <Header theme={theme} toggleTheme={toggleTheme} />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen"
            >
                <div className="mb-6">
                    <button onClick={() => router.visit(route('products.index'))} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <ChevronLeft size={20} className="mr-1" />
                        {t('nav.shop', 'Retour à la boutique')}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Product Info (Left Side) - Order 2 on mobile, Order 1 on desktop */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-7 order-2 lg:order-1 flex flex-col gap-6"
                    >
                        <div>
                            <div className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">{currentProduct?.sub_category ? getTranslated(currentProduct.sub_category, 'name') : 'Puréva'}</div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{currentProduct ? getTranslated(currentProduct, 'name') : ''}</h1>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} className={`${i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">4.5 (80+ {t('product.reviews', 'avis')})</span>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-gray-900">{(selectedVariant?.price || currentProduct?.price || 0).toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                {currentProduct?.old_price && <span className="text-xl text-gray-500 line-through">{currentProduct.old_price.toLocaleString()} DA</span>}
                            </div>
                        </div>

                        {/* Description Tab - Moved up for better flow */}
                        <div className="prose prose-sm text-gray-600 max-w-none">
                            <p>{currentProduct ? getTranslated(currentProduct, 'description') : ''}</p>
                        </div>

                        {/* Order Form Section */}
                        <div className="bg-white rounded-2xl md:p-6 border border-gray-100 shadow-sm">




                            {/* Product Variants */}
                            {currentProduct?.variants && currentProduct.variants.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-900">{t('product.variants', 'Variantes')}</h3>
                                    <div className="mt-3 space-y-3">
                                        {currentProduct.variants.map((variant) => (
                                            <div
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${selectedVariant?.id === variant.id
                                                    ? 'border-[#DB8B89] bg-[#DB8B89]/5 ring-2 ring-[#DB8B89]/20'
                                                    : 'border-gray-200 hover:border-[#DB8B89]'
                                                    } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {variant.sku}
                                                        </p>
                                                        {variant.specifications && variant.specifications.length > 0 && (
                                                            <div className="mt-1">
                                                                <p className="text-xs text-gray-500">
                                                                    {variant.specifications.map(spec => getTranslated(spec, 'name')).join(' / ')}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {variant.specifications.map(spec => spec.pivot.value).join(' / ')}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-semibold">{variant.price.toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    {variant.stock > 0 ? (
                                                        <span className="in-stock text-xs">✓ {t('product.in_stock', 'En stock')} ({variant.stock})</span>
                                                    ) : (
                                                        <span className="out-of-stock text-xs">{t('product.out_of_stock', 'En rupture de stock')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {!selectedVariant && (
                                        <p className="mt-2 text-xs text-amber-600">* {t('product.select_variant', 'Veuillez sélectionner une variante')}</p>
                                    )}
                                </div>
                            )}

                            {/* Stock Status Inside Form Area */}
                            <div className="mb-6">
                                {(selectedVariant?.stock || currentProduct?.stock || 0) > 0 ? (
                                    <p className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                                        <CheckCircle size={16} />
                                        {t('product.in_stock', 'En stock')}
                                        <span className="text-gray-500 font-normal ml-1">({selectedVariant?.stock || currentProduct?.stock || 0} {t('product.available', 'disponibles')})</span>
                                    </p>
                                ) : (
                                    <p className="text-sm font-medium text-red-500">
                                        {t('product.out_of_stock', 'En rupture de stock')}
                                    </p>
                                )}
                            </div>

                            {/* Order Form (Publicly accessible) */}
                            <form onSubmit={handlePlaceOrder} className="space-y-6">
                                {/* <h3 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.title', 'Complétez votre commande')}</h3> */}
                                <div className="space-y-4">

                                    {/* Quantity Selector */}
                                    <div className="flex items-center justify-end mb-4">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setData('quantity', Math.max(1, data.quantity - 1))}
                                                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-l-lg"
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="px-3 py-2 font-medium min-w-[3rem] text-center border-x border-gray-300">
                                                {data.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setData('quantity', Math.min(currentProduct?.stock || 0, data.quantity + 1))}
                                                className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-r-lg"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-dashed border-gray-400 rounded-xl text-gray-600 font-medium hover:border-gray-900 hover:text-gray-900 transition-all bg-white"
                                    >
                                        <Plus size={18} />
                                        <span>Ajouter un autre article</span>
                                    </button>

                                    <div className="bg-gray-50 rounded-xl p-1">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                        </svg>
                                                    </span>
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={e => setData('phone', e.target.value)}
                                                    placeholder={t('checkout.phone', 'Numéro de téléphone')}
                                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-500"
                                                    required
                                                />
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-400">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                    </span>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={data.first_name} // using first_name as full name container usually
                                                    onChange={e => setData('first_name', e.target.value)}
                                                    placeholder={t('checkout.first_name', 'Nom complet')}
                                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all placeholder-gray-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                </span>
                                            </div>
                                            <select
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none transition-all"
                                                value={data.wilaya_id}
                                                onChange={(e) => handleWilayaChange(e.target.value)}
                                                required
                                            >
                                                <option value="">{t('checkout.wilaya', 'Wilaya')} *</option>
                                                {wilayas.map(w => (
                                                    <option key={w.id} value={w.id}>{w.code} - {isRTL() || i18n.language === 'ar' ? (w.name_ar || w.name) : w.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </span>
                                            </div>
                                            <select
                                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none appearance-none transition-all"
                                                value={data.commune_id}
                                                onChange={e => setData('commune_id', e.target.value)}
                                                required
                                            >
                                                <option value="">{t('checkout.commune', 'Commune')} *</option>
                                                {communes.map(c => (
                                                    <option key={c.id} value={c.id}>{isRTL() || i18n.language === 'ar' ? (c.name_ar || c.name) : c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.delivery_type}
                                            readOnly
                                            disabled
                                            placeholder={t('checkout.delivery_type', 'Livraison à domicile')}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                                        />
                                        <div className="hidden">
                                            <label className="flex items-center gap-2">
                                                <input type="radio" name="delivery_type" value="DOMICILE" checked={data.delivery_type === 'DOMICILE'} onChange={e => setData('delivery_type', e.target.value)} /> {t('checkout.home_delivery', 'Domicile')}
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="radio" name="delivery_type" value="BUREAU" checked={data.delivery_type === 'BUREAU'} onChange={e => setData('delivery_type', e.target.value)} /> {t('checkout.office_delivery', 'Bureau / Point relais')}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="product-actions mt-6">
                                    <button
                                        type="submit"
                                        disabled={processing || placingOrder || (currentProduct?.stock || 0) <= 0 || !data.wilaya_id || !data.commune_id}
                                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                                    >
                                        {processing || placingOrder ? <Loader2 className="animate-spin" /> : <span>{t('checkout.place_order', 'Commander maintenant')}</span>}
                                    </button>
                                </div>

                                {/* Pricing Summary - Card Style */}
                                <div className="mt-8 border border-gray-200 rounded-2xl p-6 bg-white shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
                                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center justify-between">
                                        <span>{t('cart.summary', 'Récapitulatif de la commande')}</span>
                                        <ChevronLeft size={20} className="rotate-90 text-gray-400" />
                                    </h3>

                                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={currentProduct?.images && currentProduct.images.length > 0 ? `/storage/${currentProduct.images[0].image_path}` : '/placeholder.svg'}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 line-clamp-1">{currentProduct ? getTranslated(currentProduct, 'name') : ''}</h4>
                                            <div className="flex justify-between items-center mt-1">
                                                <span className="text-gray-900 font-bold">{(selectedVariant?.price || currentProduct?.price || 0).toLocaleString()} DA</span>
                                                <span className="text-sm text-gray-500">x{data.quantity}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-gray-600">
                                            <span>{t('cart.subtotal', 'Sous-total')}</span>
                                            <span className="font-medium">{productsTotal.toLocaleString()} DA</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>{t('cart.shipping', 'Frais de livraison')}</span>
                                            <span className="font-medium">{shippingPrice === 0 ? '0 DA' : `${shippingPrice.toLocaleString()} DA`}</span>
                                        </div>
                                        {promoDiscount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>{t('admin.promo_codes', 'Remise')}</span>
                                                <span className="font-medium">-{promoDiscount.toLocaleString()} DA</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <button className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl flex justify-between px-6 hover:bg-gray-800 transition-colors">
                                            <span>{finalTotal.toLocaleString()} DA</span>
                                            <span>{t('cart.total', 'Total')}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>

                    {/* Image Gallery (Right Side) - Order 1 on mobile, Order 2 on desktop */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="sticky top-24">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="aspect-square bg-gray-100 rounded-3xl overflow-hidden mb-4 relative"
                            >
                                <img
                                    src={currentProduct?.images && currentProduct.images.length > 0 ? `/storage/${currentProduct.images[selectedImage].image_path}` : '/placeholder.svg'}
                                    alt={currentProduct ? getTranslated(currentProduct, 'name') : ''}
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(prev => prev > 0 ? prev - 1 : currentProduct?.images.length - 1);
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md backdrop-blur-sm transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage(prev => prev < (currentProduct?.images.length - 1) ? prev + 1 : 0);
                                    }}
                                >
                                    <ChevronLeft size={20} className="rotate-180" />
                                </button>
                            </motion.div>

                            <div className="grid grid-cols-4 gap-4">
                                {currentProduct?.images && currentProduct.images.map((img, index) => (
                                    <div
                                        key={index}
                                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === index ? 'border-gray-900 ring-1 ring-gray-900' : 'border-transparent hover:border-gray-300'}`}
                                        onClick={() => setSelectedImage(index)}
                                    >
                                        <img src={`/storage/${img.image_path}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                {/* Tabs - can remain or be simplified/removed if not in design */}
                {/* <div className="mt-8 border-t pt-8">
                             <div className="flex gap-6 mb-4">
                                <button className={`pb-2 ${activeTab === 'description' ? 'border-b-2 border-gray-900 font-bold' : 'text-gray-500'}`} onClick={() => setActiveTab('description')}>{t('product.description', 'Description')}</button>
                                <button className={`pb-2 ${activeTab === 'features' ? 'border-b-2 border-gray-900 font-bold' : 'text-gray-500'}`} onClick={() => setActiveTab('features')}>{t('product.specifications', 'Spécifications')}</button>
                            </div>
                            <div className="py-4 text-gray-600">
                                {activeTab === 'description' && <p>{currentProduct ? getTranslated(currentProduct, 'description') : ''}</p>}
                                {activeTab === 'features' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {currentProduct?.specification_values && currentProduct.specification_values.map((spec, i) => (
                                            <div key={i} className="flex flex-col border-b border-gray-100 pb-2">
                                                <span className="text-gray-400 text-xs uppercase">{getTranslated(spec.specification, 'name')}</span>
                                                <span className="font-medium text-gray-900">{spec.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div> */}
            </motion.div>



            <Footer />
            <CartConfirmationModal
                isOpen={cartModalOpen}
                onClose={() => setCartModalOpen(false)}
                product={product}
            />
        </div >
    );
};

export default Show;
