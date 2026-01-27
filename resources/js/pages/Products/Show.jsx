import { router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Star, ShoppingCart, Minus, Plus, ChevronLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import '../../productPage.css';

const Show = ({ product, relatedProducts, theme, toggleTheme }) => {
    const { auth } = usePage().props;
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');

    // Wilayas & Communes
    const [wilayas, setWilayas] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        product_id: product.id,
        quantity: 1,
        first_name: auth.user ? auth.user.name.split(' ')[0] : '',
        last_name: auth.user ? (auth.user.name.split(' ').slice(1).join(' ') || '') : '',
        phone: auth.user ? auth.user.phone : '',
        address: '',
        wilaya_id: '',
        commune_id: '',
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
        const wilaya = wilayas.find(w => w.id == wilayaId);
        if (wilaya) {
            setCommunes(wilaya.communes || []);
        } else {
            setCommunes([]);
        }
    };

    useEffect(() => {
        if (data.wilaya_id && data.delivery_type) {
            setIsCalculatingShipping(true);
            axios.post(route('checkout.shipping'), {
                wilaya_id: data.wilaya_id,
                delivery_type: data.delivery_type
            }).then(res => {
                setShippingPrice(res.data.price);
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
        post(route('checkout.place'), {
            onSuccess: (page) => {
                // Success redirect logic handled by Laravel
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
                    Retour à la boutique
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
                                src={product.images && product.images.length > 0 ? `/storage/${product.images[selectedImage].image_path}` : '/placeholder.png'}
                                alt={product.name}
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
                                    <img src={`/storage/${img.image_path}`} alt={`${product.name} ${index + 1}`} />
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
                        <div className="product-brand">{product.sub_category ? product.sub_category.name : 'Puréva'}</div>
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-rating-section">
                            <div className="rating-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={18} fill={i < 4 ? '#FFC107' : 'none'} stroke="#FFC107" />
                                ))}
                            </div>
                            <span className="rating-text">4.5 (80+ avis)</span>
                        </div>

                        <div className="product-price-section">
                            <span className="current-price">{product.price.toLocaleString()} DA</span>
                        </div>

                        <div className="stock-status">
                            {product.stock > 0 ? (
                                <span className="in-stock">✓ En stock ({product.stock} disponibles)</span>
                            ) : (
                                <span className="out-of-stock">En rupture de stock</span>
                            )}
                        </div>

                        <div className="quantity-section">
                            <label>Quantité:</label>
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

                        {/* Order Form */}
                        <form onSubmit={handlePlaceOrder} className="order-form-section">
                            <h3 className="order-form-title">Complétez votre commande</h3>
                            <div className="order-form-content">
                                <div className="form-group grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="form-label">Prénom *</label>
                                        <input
                                            type="text"
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            placeholder="Prénom"
                                            className="form-input"
                                            required
                                        />
                                        {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <label className="form-label">Nom *</label>
                                        <input
                                            type="text"
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                            placeholder="Nom"
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Téléphone *</label>
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
                                    <label className="form-label">Wilaya *</label>
                                    <select
                                        className="form-select"
                                        value={data.wilaya_id}
                                        onChange={(e) => handleWilayaChange(e.target.value)}
                                        required
                                    >
                                        <option value="">Sélectionner</option>
                                        {wilayas.map(w => (
                                            <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Commune *</label>
                                    <select
                                        className="form-select"
                                        value={data.commune_id}
                                        onChange={e => setData('commune_id', e.target.value)}
                                        required
                                    >
                                        <option value="">Sélectionner</option>
                                        {communes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Adresse *</label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        placeholder="Adresse exacte"
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Type de livraison</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="delivery_type" value="DOMICILE" checked={data.delivery_type === 'DOMICILE'} onChange={e => setData('delivery_type', e.target.value)} /> Domicile
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="delivery_type" value="BUREAU" checked={data.delivery_type === 'BUREAU'} onChange={e => setData('delivery_type', e.target.value)} /> Bureau / Point relais
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
                                            <span>Sous-total</span>
                                            <span>{(product.price * data.quantity).toLocaleString()} DA</span>
                                        </div>
                                        <div className="summary-row flex justify-between">
                                            <span>Livraison</span>
                                            <span>{isCalculatingShipping ? '...' : `${shippingPrice.toLocaleString()} DA`}</span>
                                        </div>
                                        <div className="summary-row total flex justify-between font-bold border-t mt-2 pt-2 text-lg">
                                            <span>Total à payer</span>
                                            <span>{calculateTotal().toLocaleString()} DA</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="product-actions mt-6 flex gap-2">
                                <button
                                    type="submit"
                                    disabled={processing || product.stock <= 0}
                                    className="add-to-cart-btn primary flex-1 bg-teal-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700 disabled:opacity-50"
                                >
                                    {processing ? <Loader2 className="animate-spin" /> : <><ShoppingCart size={20} /> Acheter maintenant</>}
                                </button>
                            </div>
                        </form>

                        {/* Tabs */}
                        <div className="product-tabs mt-8">
                            <div className="tab-headers border-b flex gap-6">
                                <button className={`pb-2 ${activeTab === 'description' ? 'border-b-2 border-teal-600 font-bold' : ''}`} onClick={() => setActiveTab('description')}>Description</button>
                                <button className={`pb-2 ${activeTab === 'features' ? 'border-b-2 border-teal-600 font-bold' : ''}`} onClick={() => setActiveTab('features')}>Spécifications</button>
                            </div>
                            <div className="tab-content py-4">
                                {activeTab === 'description' && <p>{product.description}</p>}
                                {activeTab === 'features' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {product.specification_values && product.specification_values.map((spec, i) => (
                                            <div key={i} className="flex flex-col border-b pb-2">
                                                <span className="text-gray-500 text-xs">{spec.specification.name}</span>
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
        </div>
    );
};

export default Show;
