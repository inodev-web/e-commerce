import Hero from './Hero';
import CategorySection from '../components/CategorySection';
import LogoLoop from '../components/LogoLoop';
import ProductSection from '../components/ProductSection';
import TopSellers from '../components/TopSellers';
import Footer from '../components/Footer';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "../components/ui/carousel";

const HomePage = () => {
    const pharmaLogos = [
        { src: '/saidalLogo.png', alt: 'Saidal' },
        { src: '/toucheLogo.jpg', alt: 'Touche' },
        { src: '/saidalLogo.png', alt: 'Saidal' },
        { src: '/toucheLogo.jpg', alt: 'Touche' },
        { src: '/saidalLogo.png', alt: 'Saidal' },
        { src: '/toucheLogo.jpg', alt: 'Touche' },
    ];

    return (
        <>
            <Hero />
            <CategorySection />
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
            <ProductSection title="Recommandé pour vous" />

            <div className="w-full max-w-screen-xl mx-auto">
                <Carousel className="w-full">
                    <CarouselContent>
                        {[
                            "https://i.pinimg.com/736x/2f/1c/08/2f1c084ab70ad4ad916b0dc286bc1e4f.jpg",
                            "https://i.pinimg.com/1200x/38/3d/5c/383d5c482b067804ad7d6eede12ff44a.jpg"
                        ].map((src, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1">
                                    <img
                                        src={src}
                                        alt={`Slide ${index + 1}`}
                                        className="w-full aspect-[21/9] object-cover rounded-xl shadow-sm"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="translate-x-[3em] xl:translate-x-[5em] " />
                    <CarouselNext className="translate-x-[-3em] xl:translate-x-[-5em]" />
                </Carousel>
            </div>

            <TopSellers />
            <Footer />
        </>
    );
};

export default HomePage;
