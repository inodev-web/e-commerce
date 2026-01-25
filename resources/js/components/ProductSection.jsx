import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';

const ProductSection = ({ title }) => {
    const products = [
        {
            id: 1,
            name: 'Lotion Hydratante Quotidienne',
            brand: 'CeraVe',
            price: 1499,
            rating: 4.8,
            reviews: 128,
            image: 'https://i.pinimg.com/1200x/db/aa/c4/dbaac4e9b7c92cfd5d0fd33e1a2d8556.jpg',
            bgColor: '#F5F5F5',
            badge: 'Meilleure vente'
        },
        {
            id: 2,
            name: 'Sérum Vitamine C',
            brand: 'La Roche-Posay',
            price: 2999,
            rating: 4.9,
            reviews: 85,
            image: 'https://i.pinimg.com/1200x/b4/13/1b/b4131b89326fdd62875c6e4fd30236d5.jpg',
            bgColor: '#FFF0E6',
            badge: 'Nouveau'
        },
        {
            id: 3,
            name: 'Nettoyant Visage Doux',
            brand: 'Cetaphil',
            price: 1150,
            rating: 4.7,
            reviews: 210,
            image: 'https://i.pinimg.com/1200x/db/aa/c4/dbaac4e9b7c92cfd5d0fd33e1a2d8556.jpg',
            bgColor: '#E6F4FF'
        },
        {
            id: 4,
            name: 'Lotion Hydratante Quotidienne',
            brand: 'Aveeno',
            price: 999,
            rating: 4.6,
            reviews: 156,
            image: 'https://i.pinimg.com/1200x/b4/13/1b/b4131b89326fdd62875c6e4fd30236d5.jpg',
            bgColor: '#F0F9EA'
        }
    ];

    const truncateName = (name) => {
        return name.length > 25 ? name.substring(0, 22) + '...' : name;
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="product-section"
        >
            <div className="section-container">
                <h2 className="section-title">{title}</h2>
                <div className="product-grid">
                    {products.map((product) => (
                        <Link href={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="top-seller-card">
                                {product.badge && (
                                    <span className="seller-badge">{product.badge}</span>
                                )}
                                <div className="seller-rating">
                                    <Star size={14} fill="#FFC107" stroke="#FFC107" />
                                    <span>{product.rating}</span>
                                </div>
                                <div className="seller-image" style={{ backgroundColor: product.bgColor }}>
                                    <img src={product.image} alt={product.name} className="seller-image-img" />
                                </div>
                                <div className="seller-info">
                                    <div className="seller-brand">{product.brand}</div>
                                    <h3 className="seller-name">{truncateName(product.name)}</h3>
                                    <div className="seller-price">
                                        {product.price} DA
                                        <button className="add-to-cart-btn" aria-label="Add to cart" onClick={(e) => e.preventDefault()}>
                                            <ShoppingCart size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default ProductSection;
