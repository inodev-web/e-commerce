import { router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Minus, Plus, ChevronLeft, Loader2, CreditCard } from 'lucide-react';
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
    const { auth } = usePage().props;
    const fullName = auth?.user?.name ?? '';
    const [first = '', ...rest] = fullName.split(' ');
    const last = rest.join(' ');
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');

    // Wilayas & Communes
    const [wilayas, setWilayas] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

    // Cart Modal State
    const [cartModalOpen, setCartModalOpen] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);

    const handleAddToCart = (e) => {
        e.preventDefault();
        setAddingToCart(true);
        router.post(route('cart.add'), {
            product_id: product.id,
            quantity: data.quantity
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setCartModalOpen(true);
                setAddingToCart(false);
            },
            onError: () => setAddingToCart(false)
        });
    };
    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        quantity: 1,
        first_name: auth?.user?.client?.first_name || '',
        last_name: auth?.user?.client?.last_name || '',
        phone: auth?.user?.phone || auth?.user?.client?.phone || '',
        address: auth?.user?.client?.address || '',
        wilaya_id: auth?.user?.client?.wilaya_id || '',
        commune_id: auth?.user?.client?.commune_id || '',
        delivery_type: 'DOMICILE',
        promo_code: '',
    });

    useEffect(() => {
        axios.get(route('wilayas.index')).then(res => {
            setWilayas(res.data.data);
        });
    }, []);

    const handleWilayaChange = (wilayaId) => {
        setData(d => ({ ...d, wilaya_id: wilayaId, commune_id: '' }));
        // Communes + delivery price will be loaded via calculate-shipping (authenticated users only)
        setCommunes([]);
    };

    useEffect(() => {
        if (data.wilaya_id && data.delivery_type) {
            setIsCalculatingShipping(true);
            axios.post(route('checkout.shipping'), {
                wilaya_id: data.wilaya_id,
                delivery_type: data.delivery_type
            }).then(res => {
                setShippingPrice(res.data.delivery_price ?? 0);
                setCommunes(res.data.communes ?? []);
            }).finally(() => {
                setIsCalculatingShipping(false);
            });
        }
    }, [data.wilaya_id, data.delivery_type]);

    const calculateTotal = () => {
        return (product.price * data.quantity) + shippingPrice;
    };

    const handlePlaceOrder = (e) => {
        e.preventDefault();

        // Ensure the product is in the cart (checkout.place uses cart items)
        router.post(route('cart.add'), {
            product_id: product.id,
            quantity: data.quantity,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                post(route('checkout.place'), {
                    onSuccess: () => {
                        // Success redirect handled by Laravel
                    }
                });
            }
        });
    };

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
                                src={product.images && product.images.length > 0 ? `/storage/${product.images[selectedImage].image_path}` : '/placeholder.svg'}
                                alt={getTranslated(product, 'name')}
                                className="main-product-image object-contain"
                            />
                        </motion.div>

                        <div className="thumbnail-container">
                            {product.images && product.images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={`/storage/${img.image_path}`} alt={`${getTranslated(product, 'name')} ${index + 1}`} />
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
                        <div className="product-brand">{product.sub_category ? getTranslated(product.sub_category, 'name') : 'Puréva'}</div>
                        <h1 className="product-title">{getTranslated(product, 'name')}</h1>

                        <div className="product-rating-section">
                            <div className="rating-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill={i < 4 ? '#FFC107' : 'none'} stroke="#FFC107" />
                                ))}
                            </div>
                            <span className="rating-text">4.5 (80+ {t('product.reviews', 'avis')})</span>
                        </div>

                        <div className="product-price-section">
                            <span className="current-price">{product.price.toLocaleString()} {t('currency.symbol', 'DA')}</span>
                        </div>

                        <div className="stock-status">
                            {product.stock > 0 ? (
                                <span className="in-stock">✓ {t('product.in_stock', 'En stock')} ({product.stock} {t('product.available', 'disponibles')})</span>
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
                                <button onClick={() => setData('quantity', Math.min(product.stock, data.quantity + 1))} className="qty-btn">
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
                                            <span>{(product.price * data.quantity).toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                        </div>
                                        <div className="summary-row flex justify-between">
                                            <span>{t('cart.shipping', 'Livraison')}</span>
                                            <span>{isCalculatingShipping ? '...' : `${shippingPrice.toLocaleString()} ${t('currency.symbol', 'DA')}`}</span>
                                        </div>
                                        <div className="summary-row total flex justify-between font-bold border-t mt-2 pt-2 text-lg">
                                            <span>{t('cart.total', 'Total à payer')}</span>
                                            <span>{calculateTotal().toLocaleString()} {t('currency.symbol', 'DA')}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="product-actions mt-6 flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleAddToCart}
                                    disabled={addingToCart || product.stock <= 0}
                                    className="flex-1 bg-white border-2 border-teal-600 text-teal-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-50 disabled:opacity-50"
                                >
                                    {addingToCart ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={20} /> {t('product.add_to_cart', 'Ajouter au panier')}</>}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || product.stock <= 0}
                                    className="add-to-cart-btn primary flex-1 bg-teal-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 disabled:opacity-50"
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : <><CreditCard size={20} /> {t('checkout.place_order', 'Acheter maintenant')}</>}
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
                                {activeTab === 'description' && <p>{getTranslated(product, 'description')}</p>}
                                {activeTab === 'features' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {product.specification_values && product.specification_values.map((spec, i) => (
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
