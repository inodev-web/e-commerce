import Hero from './Hero';
import CategorySection from '../components/CategorySection';
import LogoLoop from '../components/LogoLoop';
import ProductSection from '../components/ProductSection';
import TopSellers from '../components/TopSellers';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link } from '@inertiajs/react';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../components/ui/carousel";

const HomePage = ({ featuredProducts, topSellers, categories, theme, toggleTheme }) => {
    const pharmaLogos = [
        { src: '/saidalLogo.png', alt: 'Saidal' },
        { src: '/toucheLogo.jpg', alt: 'Touche' },
        { src: '/saidalLogo.png', alt: 'Saidal' },
        { src: '/toucheLogo.jpg', alt: 'Touche' },
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
                gap={100}
                hoverSpeed={0}
                scaleOnHover
                fadeOut
                fadeOutColor="#ffffff"
                ariaLabel="Marques partenaires"
            />
            {featuredProducts && featuredProducts.length > 0 && (
                <div className="w-full max-w-screen-xl mx-auto my-12 px-4">
                    <h2 className="section-title mb-8">Nouveautés pour vous</h2>
                    <Carousel className="w-full">
                        <CarouselContent>
                            {featuredProducts.map((product) => (
                                <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4">
                                    <div className="p-1 h-full">
                                        <Link href={route('products.show', product.id)} className="block h-full">
                                            <div className="top-seller-card h-full flex flex-col">
                                                <div className="seller-image bg-gray-50 flex-1 min-h-[200px] flex items-center justify-center">
                                                    <img
                                                        src={product.images && product.images.length > 0 ? `/storage/${product.images[0].image_path}` : '/placeholder.png'}
                                                        alt={product.name}
                                                        className="seller-image-img object-contain p-4 max-h-[180px]"
                                                    />
                                                </div>
                                                <div className="seller-info p-4">
                                                    <div className="seller-brand text-xs uppercase tracking-wider text-teal-600 font-bold mb-1">
                                                        {product.sub_category ? product.sub_category.name : 'Puréva'}
                                                    </div>
                                                    <h3 className="seller-name text-gray-800 font-semibold line-clamp-2 min-h-[3rem]">{product.name}</h3>
                                                    <div className="seller-price mt-auto font-bold text-lg text-gray-900">
                                                        {product.price.toLocaleString()} DA
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex translate-x-12" />
                        <CarouselNext className="hidden md:flex -translate-x-12" />
                    </Carousel>
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
