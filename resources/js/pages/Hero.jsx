import Lottie from 'lottie-react';
import arrowData from '../assets/arrow.json';

const Hero = () => {
    return (
        <section className="hero">
            {/* <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                <img
                    src="/cremeJar.png"
                    alt="Creme Jar"
                    className="absolute top-[10%] left-[5%] md:top-[10%] md:left-[5%] w-16 md:w-24 opacity-0 animate-slide-left transition-all duration-500"
                />
                <img
                    src="/cremeTape.png"
                    alt="Creme Tape"
                    className="absolute bottom-[8%] left-[5%] md:bottom-[10%] md:left-[8%] w-16 md:w-24 opacity-0 animate-slide-left-alt transition-all duration-500"
                    style={{ animationDelay: '0.2s' }}
                />
                <img
                    src="/serum.png"
                    alt="Serum"
                    className="absolute bottom-[12%] right-[5%] md:bottom-[25%] md:right-[10%] w-14 md:w-22 opacity-0 animate-slide-right transition-all duration-500"
                    style={{ animationDelay: '0.1s' }}
                />
            </div> */}
            <div className="hero-content" style={{ position: 'relative', zIndex: 10, marginTop: '-2rem' }}>
                <div className="hero-badge">
                    FOURNISSEUR MÉDICAL DE CONFIANCE
                </div>
                {/* Branding Title */}
                <h1 className="hero-title !mb-4">
                    Puréva
                </h1>

                {/* Catchphrase */}
                <p className="text-dark dark:text-white text-xl md:text-2xl lg:text-3xl font-medium tracking-tight !mb-10 max-w-3xl mx-auto opacity-90">
                    Au service de votre <span className="text-[#DB8B89]">beauté & bien être</span>
                </p>

                {/* CTA Buttons */}
                <div className="hero-buttons">
                    <div className="relative inline-flex items-center">
                        <button className="btn btn-primary px-8 py-3 text-lg">
                            Acheter
                        </button>

                        {/* CTA Indicator */}
                        <div className="absolute flex items-center gap-2 md:gap-0 pointer-events-none select-none translate-y-[70px] md:translate-y-[0] md:translate-x-[-210px]">
                            <span className="text-[#DB8B89] font-handwriting text-xl md:text-2xl italic whitespace-nowrap md:translate-y-[60px]" style={{ fontFamily: 'var(--font-cursive, cursive)' }}>
                                En un clic
                            </span>
                            <div className="w-16 h-16 md:w-20 md:h-20 translate-y-[10px] md:translate-y-[20px] rotate-180 rotate-x-180 md:rotate-119 md:rotate-x-0 ">
                                <Lottie animationData={arrowData} loop={true} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="hero-features">
                    <div className="hero-feature">
                        <svg className="hero-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>100% Authentique</span>
                    </div>
                    <div className="hero-feature">
                        <svg className="hero-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Livraison Rapide</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
