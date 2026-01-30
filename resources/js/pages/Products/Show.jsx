import { router, useForm, usePage, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Star, ShoppingCart, Minus, Plus, ChevronLeft, Loader2, CreditCard, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import CartConfirmationModal from '../../components/CartConfirmationModal';
import '../../../css/productPage.css';
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
    const [activeTab, setActiveTab] = useState('description');

    const [wilayas, setWilayas] = useState([]);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

    // Form handling
    const { data, setData, post, processing, errors } = useForm({
        product_id: currentProduct?.id || 0,
        quantity: 1,
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
            quantity: data.quantity
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setCartModalOpen(true);
                setAddingToCart(false);
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

    const [useLoyaltyEnabled, setUseLoyaltyEnabled] = useState(false);
    // ⚡️ OPTIMISATION : Utiliser le nouveau solde si disponible (après commande), sinon le solde actuel
    const loyaltyBalance = newLoyaltyBalance !== undefined ? newLoyaltyBalance : (auth.user?.points || 0);

    const productsTotal = (currentProduct?.price || 0) * data.quantity;
    const finalLoyaltyDiscount = useLoyaltyEnabled ? Math.min(data.use_loyalty_points, productsTotal, loyaltyBalance) : 0;
    const finalTotal = productsTotal + shippingPrice - finalLoyaltyDiscount;

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
        setPlacingOrder(true);

        // ⚡️ OPTIMISATION RADICALE : Une seule requête (Single Hit)
        // On envoie les items directement, le backend les prioritizes
        post(route('checkout.place'), {
            ...data,
            items: {
                [currentProduct?.id || 0]: { quantity: data.quantity }
            },
            clear_cart: false
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setPlacingOrder(false),
            onError: (err) => {
                console.error("Erreur commande directe:", err);
                const firstMsg = Object.values(err)[0];
                if (firstMsg) alert(firstMsg);
            }
        });
    };

    // ⚡️ VUE SUCCÈS SPA (Si la commande vient d'être passée)
    if (order) {
        return (
            <div className={`checkout-page min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
                <Header theme={theme} toggleTheme={toggleTheme} />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg max-w-2xl w-full text-center slide-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                            <CheckCircle size={40} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande Réussie !</h1>
                        <p className="text-gray-500 mb-8">
                            Merci <span className="font-semibold">{order.first_name}</span>. Votre commande <span className="font-mono text-[#DB8B89]">#{order.id}</span> est confirmée.
                        </p>
                        <div className="bg-gray-50 p-6 rounded-2xl mb-8 text-left border border-gray-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-500">Montant total:</span>
                                <span className="font-bold">{order.total_price.toLocaleString()} DA</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Livraison à:</span>
                                <span className="font-medium">{order.commune_name}, {order.wilaya_name}</span>
                            </div>
                            {newLoyaltyBalance !== undefined && (
                                <div className="flex justify-between mt-2 pt-2 border-t">
                                    <span className="text-gray-500">Nouveaux points de fidélité:</span>
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

    return (
        <div className="product-page">
            <Header theme={theme} toggleTheme={toggleTheme} />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="product-container"
            >
                <button onClick={() => router.visit(route('products.index'))} className="back-button">
                    <ChevronLeft size={20} />
                    {t('nav.shop', 'Retour à la boutique')}
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
                        <h1 className="product-title">{currentProduct ? getTranslated(currentProduct, 'name') : ''}</h1>

                        <div className="product-rating-section">
                            <div className="rating-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill={i < 4 ? '#FFC107' : 'none'} stroke="#FFC107" />
                                ))}
                            </div>
                            <span className="rating-text">4.5 (80+ {t('product.reviews', 'avis')})</span>
                        </div>

                        <div className="product-price-section">
                            <span className="current-price">{(currentProduct?.price || 0).toLocaleString()} {t('currency.symbol', 'DA')}</span>
                        </div>

                        <div className="stock-status">
                            {(currentProduct?.stock || 0) > 0 ? (
                                <span className="in-stock">✓ {t('product.in_stock', 'En stock')} ({currentProduct?.stock || 0} {t('product.available', 'disponibles')})</span>
                            ) : (
                                <span className="out-of-stock">{t('product.out_of_stock', 'En rupture de stock')}</span>
                            )}
                        </div>

                        <div className="quantity-section">
                            <label>{t('cart.quantity', 'Quantité')}:</label>
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

                        {/* Order Form (Publicly accessible) */}
                        <form onSubmit={handlePlaceOrder} className="order-form-section">
                            <h3 className="order-form-title">{t('checkout.title', 'Complétez votre commande')}</h3>
                            <div className="order-form-content">
                                <div className="form-group grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="form-label">{t('checkout.first_name', 'Prénom')} *</label>
                                        <input
                                            type="text"
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            placeholder={t('checkout.first_name', 'Prénom')}
                                            className="form-input"
                                            required
                                        />
                                        {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <label className="form-label">{t('checkout.last_name', 'Nom')} *</label>
                                        <input
                                            type="text"
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                            placeholder={t('checkout.last_name', 'Nom')}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('checkout.phone', 'Téléphone')} *</label>
                                    <input
                                        type="tel"
                                        value={data.phone}
                                        onChange={e => setData('phone', e.target.value)}
                                        placeholder="0XXXXXXXXX"
                                        className="form-input"
                                        required
                                    />
                                    {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('checkout.wilaya', 'Wilaya')} *</label>
                                    <select
                                        className="form-select"
                                        value={data.wilaya_id}
                                        onChange={(e) => handleWilayaChange(e.target.value)}
                                        required
                                    >
                                        <option value="">{t('common.select', 'Sélectionner')}</option>
                                        {wilayas.map(w => (
                                            <option key={w.id} value={w.id}>{w.code} - {isRTL() || i18n.language === 'ar' ? (w.name_ar || w.name) : w.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('checkout.commune', 'Commune')} *</label>
                                    <select
                                        className="form-select"
                                        value={data.commune_id}
                                        onChange={e => setData('commune_id', e.target.value)}
                                        required
                                    >
                                        <option value="">{t('common.select', 'Sélectionner')}</option>
                                        {communes.map(c => (
                                            <option key={c.id} value={c.id}>{isRTL() || i18n.language === 'ar' ? (c.name_ar || c.name) : c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('checkout.address', 'Adresse')} *</label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        placeholder={t('checkout.address', 'Adresse exacte')}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{t('checkout.delivery_type', 'Type de livraison')}</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="delivery_type" value="DOMICILE" checked={data.delivery_type === 'DOMICILE'} onChange={e => setData('delivery_type', e.target.value)} /> {t('checkout.home_delivery', 'Domicile')}
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="delivery_type" value="BUREAU" checked={data.delivery_type === 'BUREAU'} onChange={e => setData('delivery_type', e.target.value)} /> {t('checkout.office_delivery', 'Bureau / Point relais')}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing Summary */}
                            <AnimatePresence>
                                {data.wilaya_id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="pricing-summary overflow-hidden mt-4 p-4 bg-gray-50 rounded-xl"
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
                                            <span>{isCalculatingShipping ? '...' : `${shippingPrice.toLocaleString()} ${t('currency.symbol', 'DA')}`}</span>
                                        </div>
                                        <div className="summary-row total flex justify-between font-bold border-t mt-2 pt-2 text-lg">
                                            <span>{t('cart.total', 'Total à payer')}</span>
                                            <span>{finalTotal.toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                        </div>

                                        {/* Loyalty Points Section */}
                                        {auth.user && loyaltyBalance > 0 && (
                                            <div className="mt-4 border-t pt-4">
                                                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium mb-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={useLoyaltyEnabled}
                                                        onChange={e => {
                                                            setUseLoyaltyEnabled(e.target.checked);
                                                            if (!e.target.checked) setData('use_loyalty_points', 0);
                                                        }}
                                                        className="text-[#DB8B89] rounded focus:ring-[#DB8B89]"
                                                    />
                                                    {t('loyalty.use_points', 'Utiliser mes points')} ({loyaltyBalance} pts)
                                                </label>

                                                {useLoyaltyEnabled && (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            value={data.use_loyalty_points || ''}
                                                            onChange={e => setData('use_loyalty_points', Math.min(parseInt(e.target.value) || 0, loyaltyBalance))}
                                                            max={loyaltyBalance}
                                                            placeholder="0"
                                                            className="flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#DB8B89]"
                                                        />
                                                        <span className="text-green-600 text-sm flex items-center">
                                                            -{finalLoyaltyDiscount.toLocaleString()} DA
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Promo code section */}
                                        <div className="mt-4">
                                            {!showPromo ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPromo(true)}
                                                    className="text-sm text-red-500 underline"
                                                >
                                                    {t('checkout.promo_link', 'code promo ?')}
                                                </button>
                                            ) : (
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        {t('checkout.promo_label', 'Code promo')}
                                                    </label>
                                                    {data.promo_code ? (
                                                        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
                                                            <div>
                                                                <p className="font-medium text-green-800">{data.promo_code}</p>
                                                                <p className="text-xs text-green-600">
                                                                    -{promoDiscount.toLocaleString()} {t('currency.symbol', 'DA')}
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
                                                                className="flex-1 border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-[#DB8B89]"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={validatePromoCode}
                                                                disabled={isValidatingPromo || !promoInput.trim()}
                                                                className="px-4 py-2 bg-[#DB8B89] text-white rounded-lg text-sm font-medium hover:bg-[#C07573] disabled:opacity-50"
                                                            >
                                                                {isValidatingPromo
                                                                    ? t('common.loading', 'Vérification...')
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
                                    disabled={processing || placingOrder || (currentProduct?.stock || 0) <= 0}
                                    className="add-to-cart-btn primary flex-1 bg-[#DB8B89] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#C07573] disabled:opacity-50"
                                >
                                    {processing || placingOrder ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> {t('checkout.place_order', 'Acheter maintenant')}</>}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || (currentProduct?.stock || 0) <= 0}
                                    className="flex-1 bg-white border-2 border-[#DB8B89] py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#F8E4E0] disabled:opacity-50 text-[#DB8B89]"
                                >
                                    {addingToCart ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={20} /> {t('product.add_to_cart', 'Ajouter au panier')}</>}
                                </button>
                            </div>
                        </form>

                        {/* Tabs */}
                        <div className="product-tabs mt-8">
                            <div className="tab-headers border-b flex gap-6">
                                <button className={`pb-2 ${activeTab === 'description' ? 'border-b-2 border-teal-600 font-bold' : ''}`} onClick={() => setActiveTab('description')}>{t('product.description', 'Description')}</button>
                                <button className={`pb-2 ${activeTab === 'features' ? 'border-b-2 border-teal-600 font-bold' : ''}`} onClick={() => setActiveTab('features')}>{t('product.specifications', 'Spécifications')}</button>
                            </div>
                            <div className="tab-content py-4">
                                {activeTab === 'description' && <p>{currentProduct ? getTranslated(currentProduct, 'description') : ''}</p>}
                                {activeTab === 'features' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {currentProduct?.specification_values && currentProduct.specification_values.map((spec, i) => (
                                            <div key={i} className="flex flex-col border-b pb-2">
                                                <span className="text-gray-500 text-xs">{getTranslated(spec.specification, 'name')}</span>
                                                <span className="font-medium">{spec.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <Footer />
            <CartConfirmationModal
                isOpen={cartModalOpen}
                onClose={() => setCartModalOpen(false)}
                product={product}
            />
        </div>
    );
};

export default Show;
