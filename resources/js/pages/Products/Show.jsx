import { router, useForm, usePage, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Star, ShoppingCart, Minus, Plus, ChevronLeft, Loader2, CreditCard, CheckCircle, Phone, MapPin, Truck, Building, User, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartConfirmationModal from '../../components/CartConfirmationModal';
import '../../../css/productPage.css';
import { useTranslation } from 'react-i18next';
import { getTranslated, isRTL } from '@/utils/translation';
import { trackEvent } from '@/utils/analytics';

const Show = ({ product, relatedProducts, theme, toggleTheme }) => {
    const { t, i18n } = useTranslation();
    const { auth, communes: pageCommunes, delivery_tariffs, selected_tariff, order, newLoyaltyBalance, flash } = usePage().props;
    const communes = pageCommunes || [];

    // š¡ï¸ VUE SUCCéˆS SPA (Si la commande vient d'éªtre passé©e)
    if (order) {
        return (
            <div className={`checkout-page min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
                <Header theme={theme} toggleTheme={toggleTheme} />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg max-w-2xl w-full text-center slide-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <CheckCircle size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande Ré©ussie !</h1>
                        <p className="text-gray-500 mb-8">
                            Merci <span className="font-semibold">{order.first_name}</span>. Votre commande <span className="font-mono text-[#DB8B89]">#{order.id}</span> est confirmé©e.
                        </p>
                        <div className="bg-gray-50 p-6 rounded-2xl mb-8 text-left border border-gray-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500">Montant total:</span>
                                <span className="font-bold">{order.total_price.toLocaleString()} DA</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Livraison é :</span>
                                <span className="font-medium">{order.commune_name}, {order.wilaya_name}</span>
                            </div>
                            {newLoyaltyBalance != null && (
                                <div className="flex justify-between mt-2 pt-2 border-t">
                                    <span className="text-gray-500">Nouveaux points de fidé©lité©:</span>
                                    <span className="font-bold text-[#DB8B89]">{newLoyaltyBalance} pts</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4 justify-center">
                            <Link href={route('products.index')} className="bg-[#DB8B89] text-white px-8 py-3 rounded-xl font-bold">Continuer les achats</Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // š¡ï¸ CRITIQUE : Garder le produit en mé©moire méªme si il devient null apré¨s commande
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
    const [deliveryTypeError, setDeliveryTypeError] = useState('');

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
    const [isFreeShipping, setIsFreeShipping] = useState(false);

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
                toast.success(t('product.added_to_cart', 'Produit ajouté© au panier'));

                // Track AddToCart event
                trackEvent('AddToCart', {
                    content_name: getTranslated(currentProduct, 'name'),
                    content_ids: [currentProduct.id],
                    content_type: 'product',
                    value: selectedVariant?.price || currentProduct?.price || 0,
                    currency: 'DZD'
                });
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

    // š¡ï¸ OPTIMISATION CRITIQUE : On ne recharge QUE si la wilaya change
    // On ré©cupé¨re les tarifs pour TOUS les modes d'un coup (Domicile & Bureau)
    useEffect(() => {
        if (!data.wilaya_id || order) return; // Pas de rechargement si la commande est passé©e (SPA)

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

    // Mise é  jour locale immé©diate du prix quand le type change (sans requéªte ré©seau)
    useEffect(() => {
        if (selected_tariff && data.delivery_type) {
            const price = selected_tariff[data.delivery_type];
            if (price !== undefined) {
                setShippingPrice(price);
                setDeliveryTypeError('');
            } else {
                setShippingPrice(0);
                setDeliveryTypeError(`Ce type de livraison (${data.delivery_type === 'DOMICILE' ? 'Domicile' : 'Bureau'}) n'est pas supporté© pour cette wilaya`);
            }
        } else if (selected_tariff === null && data.wilaya_id) {
            setDeliveryTypeError('Cette wilaya n\'est pas disponible pour la livraison');
            setShippingPrice(0);
        }
    }, [selected_tariff, data.delivery_type, data.wilaya_id]);

    // Update form specification_values when selection changes
    useEffect(() => {
        setData('specification_values', selectedSpecValues);
    }, [selectedSpecValues]);

    const [useLoyaltyEnabled, setUseLoyaltyEnabled] = useState(false);
    // š¡ï¸ OPTIMISATION : Utiliser le nouveau solde si disponible (apré¨s commande), sinon le solde actuel
    // Correction: On s'assure que loyaltyBalance n'est jamais null si auth.user.points existe
    const pointsAvailable = auth?.user?.points ?? 0;
    const loyaltyBalance = (newLoyaltyBalance !== null && newLoyaltyBalance !== undefined) ? newLoyaltyBalance : pointsAvailable;
    const loyaltyRate = auth?.user?.loyalty_conversion_rate || 1.0;

    // Automatically enable loyalty points and set the discount if user has points
    useEffect(() => {


        if (loyaltyBalance > 0 && auth.user) {

            setUseLoyaltyEnabled(true);
            setData('use_loyalty_points', loyaltyBalance);
        }
    }, [loyaltyBalance, auth.user]);



    const productsTotal = (currentProduct?.price || 0) * data.quantity;
    // š¡ï¸ Calcul du montant maximum convertible en points (Total + Livraison - Remise Promo)
    const activeShippingPrice = isFreeShipping ? 0 : shippingPrice;
    const maxReducibleAmount = Math.max(0, productsTotal + activeShippingPrice - promoDiscount);

    // Calcul de la remise fidé©lité© ré©elle
    const potentialLoyaltyDiscount = useLoyaltyEnabled ? (data.use_loyalty_points * loyaltyRate) : 0;
    const finalLoyaltyDiscount = Math.min(potentialLoyaltyDiscount, maxReducibleAmount);

    const finalTotal = productsTotal + activeShippingPrice - promoDiscount - finalLoyaltyDiscount;



    const calculateTotal = () => {
        const subtotal = (currentProduct?.price || 0) * data.quantity;
        const activeShipping = isFreeShipping ? 0 : shippingPrice;
        const total = subtotal + activeShipping - promoDiscount;
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
            setIsFreeShipping(!!response.data.is_free_shipping);
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
        setIsFreeShipping(false);
        setData('promo_code', '');
        setPromoError('');
    };

    const handlePlaceOrder = (e) => {
        e.preventDefault();

        // Validate required fields before submitting
        if (!data.wilaya_id || !data.commune_id || !data.first_name || !data.last_name || !data.phone) {
            toast.error(t('checkout.fill_all_fields', 'Veuillez remplir tous les champs requis'));
            return;
        }

        setPlacingOrder(true);

        // Safety timeout to prevent infinite loading (30 seconds)
        const timeoutId = setTimeout(() => {
            setPlacingOrder(false);
            toast.error(t('checkout.timeout_error', 'La requéªte a pris trop de temps. Veuillez ré©essayer.'));
        }, 30000);

        // š¡ï¸ FIX: Utiliser router.post avec l'objet de donné©es direct pour é©viter l'asynchronisme de setData
        const submissionData = {
            ...data,
            specification_values: selectedSpecValues,
            items: {
                [currentProduct?.id || 0]: {
                    quantity: data.quantity,
                    specification_values: selectedSpecValues,
                },
            },
            clear_cart: false,
        };

        router.post(route('checkout.place'), submissionData, {
            preserveState: false,
            preserveScroll: false,
            onFinish: () => {
                clearTimeout(timeoutId);
                setPlacingOrder(false);
            },
            onError: (err) => {
                clearTimeout(timeoutId);
                console.error("Erreur commande directe:", err);
                setPlacingOrder(false);
                const firstMsg = Array.isArray(err)
                    ? err[0]
                    : (typeof err === 'object' && err !== null ? Object.values(err)[0] : err);
                if (firstMsg) {
                    toast.error(typeof firstMsg === 'string' ? firstMsg : t('checkout.order_error', 'Une erreur est survenue lors de la commande'));
                } else {
                    toast.error(t('checkout.order_error', 'Une erreur est survenue lors de la commande'));
                }
            },
        });
    };



    return (
        <div className={`product-page min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            <Header theme={theme} toggleTheme={toggleTheme} />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="product-container"
            >
                <button onClick={() => router.visit(route('products.index'))} className="back-button">
                    <ChevronLeft size={20} />
                    {t('nav.shop', 'Retour é  la boutique')}
                </button>

                <div className="product-content">
                    {/* Image Gallery */}
                    <div className="product-gallery">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="main-image-container"
                        >
                            <img
                                src={currentProduct?.images && currentProduct.images.length > 0 ? `/storage/${currentProduct.images[selectedImage].image_path}` : '/placeholder.svg'}
                                alt={currentProduct ? getTranslated(currentProduct, 'name') : ''}
                                className="main-product-image object-contain"
                            />
                        </motion.div>

                        <div className="thumbnail-container">
                            {currentProduct?.images && currentProduct.images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={`/storage/${img.image_path}`} alt={currentProduct ? `${getTranslated(currentProduct, 'name')} ${index + 1}` : ''} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="product-info-section"
                    >
                        <div className="product-brand">{currentProduct?.sub_category ? getTranslated(currentProduct.sub_category, 'name') : 'Puréva'}</div>
                        <h1 className="product-title text-gray-900 dark:text-white">{currentProduct ? getTranslated(currentProduct, 'name') : ''}</h1>

                        <div className="product-rating-section">
                            <div className="rating-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill={i < 4 ? '#FFC107' : 'none'} stroke="#FFC107" />
                                ))}
                            </div>
                            <span className="rating-text">4.5 (80+ {t('product.reviews', 'avis')})</span>
                        </div>

                        <div className="product-price-section">
                            <span className="current-price">{(selectedVariant?.price || currentProduct?.price || 0).toLocaleString()} {t('currency.symbol', 'DA')}</span>
                        </div>

                        <div className="stock-status">
                            {(selectedVariant?.stock || currentProduct?.stock || 0) > 0 ? (
                                <span className="in-stock">œ“ {t('product.in_stock', 'En stock')} ({selectedVariant?.stock || currentProduct?.stock || 0} {t('product.available', 'disponibles')})</span>
                            ) : (
                                <span className="out-of-stock">{t('product.out_of_stock', 'En rupture de stock')}</span>
                            )
                            }</div>

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
                                                ? 'border-[#DB8B89] bg-[#DB8B89]/5 ring-2 ring-[#DB8B89]/20 dark:bg-[#DB8B89]/10'
                                                : 'border-gray-200 hover:border-[#DB8B89] dark:border-gray-700 dark:bg-gray-800 dark:hover:border-[#DB8B89]'
                                                } ${variant.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {variant.sku}
                                                    </p>
                                                    {variant.specifications && variant.specifications.length > 0 && (
                                                        <div className="mt-1">
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {variant.specifications.map(spec => getTranslated(spec, 'name')).join(' / ')}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {variant.specifications.map(spec => spec.pivot.value).join(' / ')}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-semibold">{variant.price.toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2">
                                                {variant.stock > 0 ? (
                                                    <span className="in-stock text-xs">œ“ {t('product.in_stock', 'En stock')} ({variant.stock})</span>
                                                ) : (
                                                    <span className="out-of-stock text-xs">{t('product.out_of_stock', 'En rupture de stock')}</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {!selectedVariant && (
                                    <p className="mt-2 text-xs text-amber-600">* {t('product.select_variant', 'Veuillez sé©lectionner une variante')}</p>
                                )}
                            </div>
                        )}

                        <div className="quantity-section">
                            <label>{t('cart.quantity', 'Quantité©')}:</label>
                            <div className="quantity-selector">
                                <button onClick={() => setData('quantity', Math.max(1, data.quantity - 1))} className="qty-btn">
                                    <Minus size={16} />
                                </button>
                                <span className="qty-value">{data.quantity}</span>
                                <button onClick={() => setData('quantity', Math.min(currentProduct?.stock || 0, data.quantity + 1))} className="qty-btn">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Specification Values Selector */}
                        {currentProduct?.specification_values && currentProduct.specification_values.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">{t('product.specifications', 'Spé©cifications')}</h3>
                                <div className="space-y-4">
                                    {(() => {
                                        const specsBySpecId = {};
                                        currentProduct.specification_values.forEach(psv => {
                                            if (!specsBySpecId[psv.specification_id]) {
                                                specsBySpecId[psv.specification_id] = [];
                                            }
                                            specsBySpecId[psv.specification_id].push(psv);
                                        });

                                        return Object.entries(specsBySpecId).map(([specId, values]) => {
                                            const spec = values[0]?.specification;
                                            if (!spec) return null;

                                            return (
                                                <div key={specId} className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        {getTranslated(spec, 'name')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {values.map((psv, idx) => {
                                                            const isSelected = selectedSpecValues[specId] === psv.value;
                                                            const isOutOfStock = (psv.quantity || 0) === 0;

                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (!isOutOfStock) {
                                                                            setSelectedSpecValues(prev => ({
                                                                                ...prev,
                                                                                [specId]: isSelected ? null : psv.value
                                                                            }));
                                                                        }
                                                                    }}
                                                                    className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${isSelected
                                                                        ? 'border-[#DB8B89] bg-[#DB8B89]/10 text-[#DB8B89]'
                                                                        : isOutOfStock
                                                                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60 dark:bg-gray-800 dark:border-gray-700'
                                                                            : 'border-gray-200 hover:border-[#DB8B89] text-gray-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-[#DB8B89]'
                                                                        }`}
                                                                    disabled={isOutOfStock}
                                                                >
                                                                    {psv.value}
                                                                    {psv.quantity !== undefined && psv.quantity !== null && (
                                                                        <span className={`ml-2 text-xs ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
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
                            </div>
                        )}

                        {/* Order Form (Publicly accessible) */}
                        <div className="mt-8">
                            <form onSubmit={handlePlaceOrder} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <ShoppingBag size={22} className="text-[#DB8B89]" />
                                    {t('checkout.title', 'Complé©tez votre commande')}
                                </h2>

                                {/* Contact Person Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                                        <User size={16} /> {t('checkout.contact_info', 'Informations personnelles')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.first_name', 'Pré©nom')}</label>
                                            <input
                                                type="text"
                                                value={data.first_name}
                                                onChange={e => setData('first_name', e.target.value)}
                                                className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                                                required
                                            />
                                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.last_name', 'Nom')}</label>
                                            <input
                                                type="text"
                                                value={data.last_name}
                                                onChange={e => setData('last_name', e.target.value)}
                                                className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                                                required
                                            />
                                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.phone', 'Té©lé©phone')}</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={e => setData('phone', e.target.value)}
                                                    className={`w-full pl-10 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                                    required
                                                />
                                            </div>
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-gray-100 dark:border-gray-700" />

                                {/* Delivery Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin size={16} /> {t('checkout.delivery', 'Livraison')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.wilaya', 'Wilaya')}</label>
                                            <div className="relative">
                                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <select
                                                    value={data.wilaya_id}
                                                    onChange={(e) => handleWilayaChange(e.target.value)}
                                                    className={`w-full pl-10 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] appearance-none dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark] ${errors.wilaya_id ? 'border-red-500' : 'border-gray-300'}`}
                                                    required
                                                >
                                                    <option value="" className="dark:bg-gray-700 dark:text-white">{t('common.select', 'Sé©lectionner')}</option>
                                                    {wilayas.map(w => (
                                                        <option key={w.id} value={w.id} className="dark:bg-gray-700 dark:text-white">{w.code} - {isRTL() || i18n.language === 'ar' ? (w.name_ar || w.name) : w.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {errors.wilaya_id && <p className="text-red-500 text-xs mt-1">{errors.wilaya_id}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('checkout.commune', 'Commune')}</label>
                                            <select
                                                value={data.commune_id}
                                                onChange={e => setData('commune_id', e.target.value)}
                                                className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-[#DB8B89] dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:[color-scheme:dark] ${errors.commune_id ? 'border-red-500' : 'border-gray-300'}`}
                                                required
                                                disabled={!data.wilaya_id}
                                            >
                                                <option value="" className="dark:bg-gray-700 dark:text-white">{t('common.select', 'Sé©lectionner')}</option>
                                                {communes.map(c => (
                                                    <option key={c.id} value={c.id} className="dark:bg-gray-700 dark:text-white">{isRTL() || i18n.language === 'ar' ? (c.name_ar || c.name) : c.name}</option>
                                                ))}
                                            </select>
                                            {errors.commune_id && <p className="text-red-500 text-xs mt-1">{errors.commune_id}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {t('checkout.address_placeholder', 'Adresse complé¨te (optionnelle)')}
                                            </label>
                                            <input
                                                type="text"
                                                id="address"
                                                name="address"
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                placeholder="Quartier, N° rue, Bé¢timent..."
                                            />
                                            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('checkout.delivery_type', 'Type de livraison')}</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    { value: 'DOMICILE', label: t('checkout.home_delivery', 'é€ Domicile'), icon: <MapPin size={18} /> },
                                                    { value: 'BUREAU', label: t('checkout.office_delivery', 'Bureau / Point Relais'), icon: <Building size={18} /> }
                                                ].map(type => {
                                                    const isSupported = selected_tariff && selected_tariff[type.value] !== undefined;
                                                    const isSelected = data.delivery_type === type.value;
                                                    return (
                                                        <label
                                                            key={type.value}
                                                            className={`border rounded-xl p-4 cursor-pointer flex items-center justify-between transition-all ${isSelected ? 'border-[#DB8B89] bg-[#F8E4E0] ring-1 ring-[#DB8B89] dark:bg-[#DB8B89]/20 dark:text-white' :
                                                                isSupported ? 'hover:border-gray-400 bg-white dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500' : 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
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
                                                                <span className="font-medium text-sm dark:text-gray-200">{type.label}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {selected_tariff && selected_tariff[type.value] !== undefined && (
                                                                    <span className="text-xs font-bold text-[#DB8B89]">{selected_tariff[type.value].toLocaleString()} DA</span>
                                                                )}
                                                                <div className={isSelected ? 'text-[#DB8B89]' : 'text-gray-400'}>
                                                                    {type.icon}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                            {deliveryTypeError && (
                                                <p className="text-red-500 text-xs mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800/30">{deliveryTypeError}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Summary */}
                                <AnimatePresence>
                                    {data.wilaya_id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="pricing-summary overflow-hidden mt-4 p-4 bg-gray-50 dark:bg-white/5 dark:text-gray-200 rounded-xl transition-colors duration-300"
                                        >
                                            <div className="summary-row flex justify-between">
                                                <span>{t('cart.subtotal', 'Sous-total')}</span>
                                                <span>{((currentProduct?.price || 0) * data.quantity).toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                            </div>
                                            {promoDiscount > 0 && (
                                                <div className="summary-row flex justify-between text-green-600 text-sm">
                                                    <span>{t('admin.promo_codes', 'Code promo')}</span>
                                                    <span>-{promoDiscount.toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                                </div>
                                            )}
                                            <div className="summary-row flex justify-between">
                                                <span>{t('cart.shipping', 'Livraison')}</span>
                                                <span className={isFreeShipping ? "text-green-600 font-bold" : ""}>
                                                    {isCalculatingShipping
                                                        ? '...'
                                                        : (isFreeShipping ? t('cart.free_shipping', 'Gratuit (Promo)') : `${shippingPrice.toLocaleString()} ${t('currency.symbol', 'DA')}`)
                                                    }
                                                </span>
                                            </div>
                                            <div className="summary-row total flex justify-between font-bold border-t border-gray-200 dark:border-gray-600 mt-2 pt-2 text-lg dark:text-white">
                                                <span>{t('cart.total', 'Total é  payer')}</span>
                                                <span>{finalTotal.toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                            </div>

                                            {/* Loyalty Points Section */}
                                            <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                                <label className="flex items-center justify-between cursor-pointer p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={useLoyaltyEnabled}
                                                            onChange={e => {
                                                                const isChecked = e.target.checked;
                                                                setUseLoyaltyEnabled(isChecked);
                                                                // Auto-fill max points (balance) when checked, 0 when unchecked
                                                                // calculation logic downstream handles the capping
                                                                setData('use_loyalty_points', isChecked ? loyaltyBalance : 0);
                                                            }}
                                                            className="w-5 h-5 text-[#DB8B89] rounded focus:ring-[#DB8B89] border-gray-300"
                                                        />
                                                        <div>
                                                            <span className="font-medium block dark:text-gray-200">{t('loyalty.use_points', 'Utiliser mes points')}</span>
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                                {t('loyalty.available', 'Disponible')}: {loyaltyBalance} pts
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {useLoyaltyEnabled && finalLoyaltyDiscount > 0 && (
                                                        <span className="text-green-600 font-bold">
                                                            -{finalLoyaltyDiscount.toLocaleString()} DA
                                                        </span>
                                                    )}
                                                </label>
                                            </div>

                                            {/* Promo code section */}
                                            <div className="mt-4">
                                                {!showPromo ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPromo(true)}
                                                        className="text-sm text-[#DB8B89] underline"
                                                    >
                                                        {t('checkout.promo_link', 'code promo ?')}
                                                    </button>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {t('checkout.promo_label', 'Code promo')}
                                                        </label>
                                                        {data.promo_code ? (
                                                            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg text-sm transition-colors">
                                                                <div>
                                                                    <p className="font-medium text-green-800">{data.promo_code}</p>
                                                                    <p className="text-xs text-green-600">
                                                                        {isFreeShipping ? t('cart.free_shipping', 'Livraison Gratuite') : `-${promoDiscount.toLocaleString()} ${t('currency.symbol', 'DA')}`}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={removePromoCode}
                                                                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                                >
                                                                    {t('common.remove', 'Retirer')}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={promoInput}
                                                                    onChange={e => setPromoInput(e.target.value.toUpperCase())}
                                                                    placeholder={t('checkout.promo_placeholder', 'Entrez votre code')}
                                                                    className="flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#DB8B89] dark:bg-neutral-800 dark:border-neutral-700 dark:text-white transition-colors"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={validatePromoCode}
                                                                    disabled={isValidatingPromo || !promoInput.trim()}
                                                                    className="px-4 py-2 bg-[#DB8B89] text-white rounded-lg text-sm font-medium hover:bg-[#C07573] disabled:opacity-50"
                                                                >
                                                                    {isValidatingPromo
                                                                        ? t('common.loading', 'Vé©rification...')
                                                                        : t('common.apply', 'Appliquer')}
                                                                </button>
                                                            </div>
                                                        )}
                                                        {promoError && (
                                                            <p className="text-xs text-red-500">
                                                                {promoError}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="product-actions mt-6 flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={processing || placingOrder || (currentProduct?.stock || 0) <= 0 || !data.wilaya_id || !data.commune_id || (currentProduct?.variants?.length > 0 && !selectedVariant) || deliveryTypeError}
                                        className="add-to-cart-btn primary flex-1 bg-[#DB8B89] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#C07573] disabled:opacity-50"
                                    >
                                        {processing || placingOrder ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> {t('checkout.place_order', 'Acheter maintenant')}</>}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleAddToCart}
                                        disabled={addingToCart || (currentProduct?.stock || 0) <= 0 || (currentProduct?.variants?.length > 0 && !selectedVariant)}
                                        className="flex-1 bg-white dark:bg-transparent border-2 border-[#DB8B89] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#F8E4E0] dark:hover:bg-[#DB8B89]/10 disabled:opacity-50 text-[#DB8B89]"
                                    >
                                        {addingToCart ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={20} /> {t('product.add_to_cart', 'Ajouter au panier')}</>}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Tabs */}
                        <div className="product-tabs mt-8">
                            <div className="tab-headers border-b dark:border-gray-700 flex gap-6">
                                <button className={`pb-2 ${activeTab === 'description' ? 'border-b-2 border-[#DB8B89] font-bold text-[#DB8B89]' : ''}`} onClick={() => setActiveTab('description')}>{t('product.description', 'Description')}</button>
                                <button className={`pb-2 ${activeTab === 'features' ? 'border-b-2 border-[#DB8B89] font-bold text-[#DB8B89]' : ''}`} onClick={() => setActiveTab('features')}>{t('product.specifications', 'Spé©cifications')}</button>
                            </div>
                            <div className="tab-content py-4">
                                {activeTab === 'description' && <p>{currentProduct ? getTranslated(currentProduct, 'description') : ''}</p>}
                                {activeTab === 'features' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {currentProduct?.specification_values && currentProduct.specification_values.map((spec, i) => (
                                            <div key={i} className="flex flex-col border-b dark:border-gray-700 pb-2">
                                                <span className="text-gray-500 dark:text-gray-400 text-xs">{getTranslated(spec.specification, 'name')}</span>
                                                <span className="font-medium dark:text-gray-200">{spec.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div >

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
