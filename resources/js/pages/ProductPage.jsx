import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Star, ShoppingCart, Minus, Plus, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../productPage.css';

// Mock product data
const PRODUCTS = {
    1: {
        id: 1,
        name: 'Lotion Hydratante Quotidienne',
        brand: 'CeraVe',
        price: 1499,
        oldPrice: 1999,
        rating: 4.8,
        reviews: 128,
        images: [
            'https://i.pinimg.com/1200x/db/aa/c4/dbaac4e9b7c92cfd5d0fd33e1a2d8556.jpg',
            'https://i.pinimg.com/1200x/b4/13/1b/b4131b89326fdd62875c6e4fd30236d5.jpg',
            'https://i.pinimg.com/1200x/db/aa/c4/dbaac4e9b7c92cfd5d0fd33e1a2d8556.jpg',
        ],
        description: 'Un hydratant quotidien léger et non gras qui assure une hydratation durable. Formulé avec de l\'acide hyaluronique et des céramides pour restaurer et maintenir la barrière protectrice naturelle de la peau.',
        features: [
            'Sans parfum et non comédogène',
            'Convient à tous les types de peau',
            'Recommandé par les dermatologues',
            'Contient de l\'acide hyaluronique',
            'Formule sans paraben'
        ],
        inStock: true,
        category: 'Soins de la peau'
    },
    2: {
        id: 2,
        name: 'Sérum Vitamine C',
        brand: 'La Roche-Posay',
        price: 2999,
        rating: 4.9,
        reviews: 85,
        images: [
            'https://i.pinimg.com/1200x/b4/13/1b/b4131b89326fdd62875c6e4fd30236d5.jpg',
            'https://i.pinimg.com/1200x/db/aa/c4/dbaac4e9b7c92cfd5d0fd33e1a2d8556.jpg',
        ],
        description: 'Puissant sérum antioxydant qui illumine la peau et réduit les signes du vieillissement. Contient 20% de vitamine C pure pour une efficacité maximale.',
        features: [
            'Illumine le teint',
            'Réduit les ridules',
            'Uniformise le grain de peau',
            'Protection antioxydante',
            'Texture légère'
        ],
        inStock: true,
        category: 'Soins de la peau'
    }
};

const ProductPage = ({ id, theme, toggleTheme }) => {
    // const { id } = useParams(); // Handled by props
    // const navigate = useNavigate(); // Handled by router
    const product = PRODUCTS[id] || PRODUCTS[1];

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    // Pricing & Delivery State
    const [selectedWilaya, setSelectedWilaya] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');
    const [showPromo, setShowPromo] = useState(false);

    const DELIVERY_FEES = {
        '16': 400, // Alger
        'default': 600
    };

    const PROMO_CODES = {
        'PROMO10': 0.10, // 10% off
        'SUMMER20': 0.20, // 20% off
        'WELCOME': 500   // 500 DA off flat
    };

    const handleApplyPromo = () => {
        const code = promoCode.trim().toUpperCase();
        if (PROMO_CODES[code]) {
            setDiscount(PROMO_CODES[code]);
            setPromoError('');
        } else {
            setDiscount(0);
            setPromoError('Code promo invalide');
        }
    };

    const getDeliveryFee = () => {
        if (!selectedWilaya) return 0;
        return DELIVERY_FEES[selectedWilaya] || DELIVERY_FEES['default'];
    };

    const calculateTotal = () => {
        let productTotal = product.price * quantity;

        // Apply discount
        if (discount > 0) {
            if (discount < 1) { // Percentage
                productTotal = productTotal * (1 - discount);
            } else { // Flat amount
                productTotal = Math.max(0, productTotal - discount);
            }
        }

        return productTotal + getDeliveryFee();
    };

    const handleQuantityChange = (delta) => {
        setQuantity(Math.max(1, quantity + delta));
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
                {/* Back Button */}
                <button onClick={() => router.visit('/')} className="back-button">
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
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className="main-product-image"
                            />
                        </motion.div>

                        <div className="thumbnail-container">
                            {product.images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(index)}
                                >
                                    <img src={img} alt={`${product.name} ${index + 1}`} />
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
                        <div className="product-brand">{product.brand}</div>
                        <h1 className="product-title">{product.name}</h1>

                        <div className="product-rating-section">
                            <div className="rating-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={18}
                                        fill={i < Math.floor(product.rating) ? '#FFC107' : 'none'}
                                        stroke="#FFC107"
                                    />
                                ))}
                            </div>
                            <span className="rating-text">{product.rating} ({product.reviews} avis)</span>
                        </div>

                        <div className="product-price-section">
                            <span className="current-price">{product.price} DA</span>
                            {product.oldPrice && (
                                <span className="old-price">{product.oldPrice} DA</span>
                            )}
                            {product.oldPrice && (
                                <span className="discount-badge">
                                    -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                                </span>
                            )}
                        </div>

                        <div className="stock-status">
                            {product.inStock ? (
                                <span className="in-stock">✓ En stock</span>
                            ) : (
                                <span className="out-of-stock">En rupture de stock</span>
                            )}
                        </div>

                        {/* Quantity Selector */}
                        <div className="quantity-section">
                            <label>Quantity:</label>
                            <div className="quantity-selector">
                                <button onClick={() => handleQuantityChange(-1)} className="qty-btn">
                                    <Minus size={16} />
                                </button>
                                <span className="qty-value">{quantity}</span>
                                <button onClick={() => handleQuantityChange(1)} className="qty-btn">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Order Form */}
                        <div className="order-form-section">
                            <h3 className="order-form-title">Complétez votre commande</h3>
                            <div className="order-form-content">
                                <div className="form-group">
                                    <label className="form-label">Nom complet *</label>
                                    <input
                                        type="text"
                                        placeholder="Entrez votre nom complet"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Numéro de téléphone *</label>
                                    <input
                                        type="tel"
                                        placeholder="Entrez votre numéro de téléphone"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Wilaya</label>
                                    <select
                                        className="form-select"
                                        value={selectedWilaya}
                                        onChange={(e) => setSelectedWilaya(e.target.value)}
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="16">16 - Alger</option>
                                        <option value="31">31 - Oran</option>
                                        <option value="25">25 - Constantine</option>
                                        <option value="06">06 - Bejaia</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Commune</label>
                                    <select className="form-select">
                                        <option value="">Sélectionner</option>
                                        <option value="alger-centre">Alger Centre</option>
                                        <option value="bab-el-oued">Bab El Oued</option>
                                        <option value="kouba">Kouba</option>
                                        <option value="hydra">Hydra</option>
                                    </select>
                                </div>
                            </div>

                            {/* Pricing Summary */}
                            <AnimatePresence>
                                {selectedWilaya && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, y: -10 }}
                                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                                        exit={{ opacity: 0, height: 0, y: -10 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="pricing-summary overflow-hidden"
                                    >
                                        <div className="summary-row">
                                            <span>Sous-total produit</span>
                                            <span>{(product.price * quantity).toLocaleString()} DA</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Livraison</span>
                                            <span>{getDeliveryFee()} DA</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="summary-row discount-text">
                                                <span>Réduction</span>
                                                <span>-
                                                    {discount < 1
                                                        ? `${Math.round((product.price * quantity) * discount)}`
                                                        : discount} DA
                                                </span>
                                            </div>
                                        )}
                                        <div className="summary-row total">
                                            <span>Total à payer</span>
                                            <span>{calculateTotal().toLocaleString()} DA</span>
                                        </div>

                                        <div className="promo-section">
                                            {!showPromo ? (
                                                <button
                                                    className="promo-toggle-btn"
                                                    onClick={() => setShowPromo(true)}
                                                >
                                                    code promo ?
                                                </button>
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="promo-form"
                                                >
                                                    <label className="form-label">Code promo</label>
                                                    <div className="promo-input-group">
                                                        <input
                                                            type="text"
                                                            placeholder="Entrez votre code"
                                                            className="promo-input"
                                                            value={promoCode}
                                                            onChange={(e) => setPromoCode(e.target.value)}
                                                        />
                                                        <button onClick={handleApplyPromo} className="promo-btn">
                                                            Appliquer
                                                        </button>
                                                    </div>
                                                    {promoError && <p className="text-red-500 text-sm mt-2">{promoError}</p>}
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Action Buttons */}
                        <div className="product-actions">
                            <button className="add-to-cart-btn primary">
                                <ShoppingCart size={20} />
                                Acheter maintenant
                            </button>
                            <button className="add-to-cart-btn primary">
                                <ShoppingCart size={20} />
                                Ajouter au panier
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="product-tabs">
                            <div className="tab-headers">
                                <button
                                    className={`tab-header ${activeTab === 'description' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('description')}
                                >
                                    Description
                                </button>
                                <button
                                    className={`tab-header ${activeTab === 'features' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('features')}
                                >
                                    Caractéristiques
                                </button>
                            </div>

                            <div className="tab-content">
                                {activeTab === 'description' && (
                                    <p className="product-description">{product.description}</p>
                                )}
                                {activeTab === 'features' && (
                                    <ul className="product-features">
                                        {product.features.map((feature, index) => (
                                            <li key={index}>✓ {feature}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </motion.div >
                </div >
            </motion.div >

            <Footer />
        </div >
    );
};

export default ProductPage;
