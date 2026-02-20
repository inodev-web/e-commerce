import { Star, ShoppingCart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '@/utils/translation';
import { pickMainImage } from '@/utils/productImage';
import { useState } from 'react';
import { toast } from 'sonner';
import { trackEvent } from '@/utils/analytics';

const ProductSection = ({ title, products = [] }) => {
    const { t } = useTranslation();
    const [addingToCartId, setAddingToCartId] = useState(null);

    const truncateName = (name) => {
        if (!name) return '';
        return name.length > 25 ? name.substring(0, 22) + '...' : name;
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();

        setAddingToCartId(product.id);

        router.post(route('cart.add'), {
            product_id: product.id,
            quantity: 1
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(t('product.added_to_cart') || 'Produit ajouté au panier');
                setAddingToCartId(null);

                trackEvent('AddToCart', {
                    content_name: getTranslated(product, 'name'),
                    content_ids: [product.id],
                    content_type: 'product',
                    value: product.price,
                    currency: 'DZD'
                });
            },
            onError: () => {
                setAddingToCartId(null);
                toast.error('Erreur lors de l\'ajout au panier');
            }
        });
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
                                <div className="seller-image bg-gray-50">
                                    {(() => {
                                        const img = pickMainImage(product.images);
                                        return (
                                            <img
                                                src={img ? `/storage/${img.image_path}` : '/placeholder.svg'}
                                                alt={getTranslated(product, 'name')}
                                                className="seller-image-img object-cover"
                                            />
                                        );
                                    })()}
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
                                        <button 
                                            className="add-to-cart-btn transition-all hover:scale-110" 
                                            aria-label={t('product.add_to_cart')} 
                                            onClick={(e) => handleAddToCart(e, product)}
                                            disabled={addingToCartId === product.id}
                                            type="button"
                                        >
                                            {addingToCartId === product.id ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <ShoppingCart size={18} />
                                            )}
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
