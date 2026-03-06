import Hero from './Hero';
import CategorySection from '@/Components/CategorySection';
import LogoLoop from '@/Components/LogoLoop';
import TopSellers from '@/Components/TopSellers';
import Footer from '@/Components/Footer';
import Header from '@/Components/Header';
import { Link, router } from '@inertiajs/react';
import { Star, ShoppingCart, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '@/utils/translation';
import { pickMainImage } from '@/utils/productImage';
import { useState } from 'react';
import { toast } from 'sonner';
import { trackEvent } from '@/utils/analytics';

const HomePage = ({ featuredProducts, topSellers, categories, theme, toggleTheme }) => {
    const { t } = useTranslation();
    const [addingToCartId, setAddingToCartId] = useState(null);

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
                toast.success('Produit ajouté au panier');
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

    const pharmaLogos = [
        { src: '/acm.png', alt: 'ACM' },
        { src: '/althea.png', alt: 'Althea' },
        { src: '/eucerin.png', alt: 'Eucerin' },
        { src: '/flux.png', alt: 'Flux' },
        { src: '/k-beauty.png', alt: 'K-Beauty' },
        { src: '/lca.png', alt: 'LCA' },
        { src: '/touche1.png', alt: 'Touche' },
    ];

    return (
        <>
            <Header theme={theme} toggleTheme={toggleTheme} />
            <div id="home"><Hero /></div>
            <div id="categories-section"><CategorySection categories={categories} /></div>
            <div id="brands-section">
                <LogoLoop
                    logos={pharmaLogos}
                    speed={100}
                    direction="left"
                    logoHeight={80}
                    gap={50}
                    hoverSpeed={0}
                    scaleOnHover
                    fadeOut
                    fadeOutColor="#ffffff"
                    ariaLabel={t('home.partner_brands', 'Marques partenaires')}
                />
            </div>
            {featuredProducts && featuredProducts.length > 0 && (
                <div className="product-section" id="recommended-section">
                    <div className="section-container">
                        <h2 className="section-title">{t('home.recommended', 'Recommandé pour vous')}</h2>
                        <div className="product-grid">
                            {featuredProducts.slice(0, 4).map((product) => (
                                <Link href={route('products.show', product.id)} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div className="top-seller-card h-full">
                                        <span className="seller-badge">{t('home.new', 'Nouveau')}</span>
                                        <div className="seller-rating">
                                            <Star size={14} fill="#FFC107" stroke="#FFC107" />
                                            <span>{(Math.random() * (5 - 4) + 4).toFixed(1)}</span>
                                        </div>
                                        <div className="seller-image aspect-square w-full bg-gray-50 overflow-hidden">
                                            {(() => {
                                                const img = pickMainImage(product.images);
                                                return (
                                                    <img
                                                        src={img ? `/storage/${img.image_path}` : '/placeholder.svg'}
                                                        alt={getTranslated(product, 'name')}
                                                        className="seller-image-img w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                                    />
                                                );
                                            })()}
                                        </div>
                                        <div className="seller-info">
                                            <div className="seller-brand text-xs uppercase tracking-wider text-teal-600 font-bold mb-1">
                                                {product.sub_category ? getTranslated(product.sub_category, 'name') : 'Puréva'}
                                            </div>
                                            <h3 className="seller-name text-gray-800 font-semibold line-clamp-2 min-h-[3rem]">
                                                {getTranslated(product, 'name')}
                                            </h3>
                                            <div className="seller-price mt-auto flex items-center justify-between font-bold text-lg text-gray-900">
                                                {product.price.toLocaleString()} {t('currency.symbol', 'DA')}
                                                <button className="add-to-cart-btn transition-all hover:scale-110 disabled:opacity-50" aria-label={t('product.add_to_cart')} onClick={(e) => handleAddToCart(e, product)} disabled={addingToCartId === product.id} type="button">
                                                    {addingToCartId === product.id ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {topSellers && topSellers.length > 0 && (
                <TopSellers products={topSellers} />
            )}
            <Footer />
        </>
    );
};

export default HomePage;

