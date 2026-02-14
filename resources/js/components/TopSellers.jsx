import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '@/utils/translation';

const TopSellers = ({ products = [] }) => {
    const { t } = useTranslation();

    const truncateName = (name) => {
        if (!name) return '';
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
                <h2 className="section-title">{t('home.top_sellers', 'Meilleures Ventes')}</h2>
                <div className="product-grid">
                    {products.map((product) => (
                        <Link href={route('products.show', product.id)} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="top-seller-card h-full">
                                {product.stock <= 0 && (
                                    <span className="seller-badge out-of-stock bg-red-500 text-white">
                                        {t('product.out_of_stock', 'Rupture')}
                                    </span>
                                )}
                                <div className="seller-rating">
                                    <Star size={14} fill="#FFC107" stroke="#FFC107" />
                                    <span>{(Math.random() * (5 - 4) + 4).toFixed(1)}</span>
                                </div>
                                <div className="seller-image aspect-square w-full bg-gray-50 overflow-hidden">
                                    <img
                                        src={product.images && product.images.length > 0 ? `/storage/${product.images[0].image_path}` : '/placeholder.svg'}
                                        alt={getTranslated(product, 'name')}
                                        className="seller-image-img w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                    />
                                </div>
                                <div className="seller-info">
                                    <div className="seller-brand text-xs uppercase tracking-wider text-teal-600 font-bold mb-1">
                                        {product.sub_category ? getTranslated(product.sub_category, 'name') : 'Puréva'}
                                    </div>
                                    <h3 className="seller-name text-gray-800 font-semibold line-clamp-2 min-h-[3rem]">
                                        {truncateName(getTranslated(product, 'name'))}
                                    </h3>
                                    <div className="seller-price mt-auto flex items-center justify-between font-bold text-lg text-gray-900">
                                        {product.price.toLocaleString()} {t('currency.symbol', 'DA')}
                                        <button className="add-to-cart-btn" aria-label={t('product.add_to_cart')} onClick={(e) => e.preventDefault()}>
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
