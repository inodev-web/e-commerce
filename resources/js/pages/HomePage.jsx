import Hero from './Hero';
import CategorySection from '../components/CategorySection';
import LogoLoop from '../components/LogoLoop';
import TopSellers from '../components/TopSellers';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link } from '@inertiajs/react';
import { Star, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTranslated } from '@/utils/translation';

const HomePage = ({ featuredProducts, topSellers, categories, theme, toggleTheme }) => {
    const { t } = useTranslation();

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
            <Hero />
            <CategorySection categories={categories} />
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
            {featuredProducts && featuredProducts.length > 0 && (
                <div className="product-section">
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
                                        <div className="seller-image bg-gray-50">
                                            <img
                                                src={product.images && product.images.length > 0 ? `/storage/${product.images[0].image_path}` : '/placeholder.svg'}
                                                alt={getTranslated(product, 'name')}
                                                className="seller-image-img object-cover"
                                            />
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

