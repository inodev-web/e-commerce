import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';

const TopSellers = ({ products = [] }) => {
    const truncateName = (name) => {
        return name.length > 25 ? name.substring(0, 22) + '...' : name;
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="top-sellers-section"
        >
            <div className="section-container">
                <h2 className="section-title">Meilleures Ventes</h2>
                <div className="product-grid">
                    {products.map((product) => (
                        <Link href={route('products.show', product.id)} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="top-seller-card h-full">
                                {product.stock <= 0 && (
                                    <span className="seller-badge out-of-stock bg-red-500 text-white">Rupture</span>
                                )}
                                <div className="seller-rating">
                                    <Star size={14} fill="#FFC107" stroke="#FFC107" />
                                    <span>{(Math.random() * (5 - 4) + 4).toFixed(1)}</span>
                                </div>
                                <div className="seller-image bg-gray-50">
                                    <img
                                        src={product.images && product.images.length > 0 ? `/storage/${product.images[0].image_path}` : '/placeholder.png'}
                                        alt={product.name}
                                        className="seller-image-img object-contain p-4"
                                    />
                                </div>
                                <div className="seller-info">
                                    <div className="seller-brand text-xs uppercase tracking-wider text-teal-600 font-bold mb-1">
                                        {product.sub_category ? product.sub_category.name : 'Puréva'}
                                    </div>
                                    <h3 className="seller-name text-gray-800 font-semibold line-clamp-2 min-h-[3rem]">{truncateName(product.name)}</h3>
                                    <div className="seller-price mt-auto flex items-center justify-between font-bold text-lg text-gray-900">
                                        {product.price.toLocaleString()} DA
                                        <button className="add-to-cart-btn bg-black text-white p-2 rounded-lg hover:bg-gray-800" aria-label="Add to cart" onClick={(e) => e.preventDefault()}>
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

export default TopSellers;
