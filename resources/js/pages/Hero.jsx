import Lottie from 'lottie-react';
import arrowData from '../assets/arrow.json';
import { useTranslation } from 'react-i18next';
import { Link } from '@inertiajs/react';

const Hero = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <section className="hero">
            <div className="hero-content" style={{ position: 'relative', zIndex: 10, marginTop: '-2rem' }}>
                <div className="hero-badge">
                    {t('hero.badge', 'FOURNISSEUR PARAPHARMACEUTIQUE DE CONFIANCE')}
                </div>
                {/* Branding Title */}
                <h1 className="hero-title !mb-4">
                    Puréva Pharma
                </h1>

                {/* Catchphrase */}
                <p className="text-dark dark:text-white text-xl md:text-2xl lg:text-3xl font-medium tracking-tight !mb-10 max-w-3xl mx-auto opacity-90">
                    {t('hero.tagline_start', 'Au service de votre')} <span className="text-[#DB8B89]">{t('hero.tagline_highlight', 'beautÃ© & bien Ãªtre')}</span>
                </p>

                {/* CTA Buttons */}
                <div className="hero-buttons">
                    <div className="relative inline-flex items-center">
                        <Link href={route('products.index')}>
                            <button className="btn btn-primary px-8 py-3 text-lg">
                                {t('hero.cta', 'Acheter')}
                            </button>
                        </Link>

                        {/* CTA Indicator */}
                        <div className={`absolute flex items-center gap-2 md:gap-0 pointer-events-none select-none translate-y-[70px] md:translate-y-[0] ${isRTL ? 'md:translate-x-[210px]' : 'md:translate-x-[-210px]'}`}>
                            <span className="text-[#DB8B89] font-handwriting text-xl md:text-2xl italic whitespace-nowrap md:translate-y-[60px]" style={{ fontFamily: 'var(--font-cursive, cursive)' }}>
                                {t('hero.cta_indicator', 'En un clic')}
                            </span>
                            <div className={`w-16 h-16 md:w-20 md:h-20 translate-y-[10px] md:translate-y-[20px] ${isRTL ? 'scale-x-[-1]' : ''} rotate-180 rotate-x-180 md:rotate-119 md:rotate-x-0`}>
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
                        <span>{t('hero.feature_authentic', '100% Authentique')}</span>
                    </div>
                    <div className="hero-feature">
                        <svg className="hero-feature-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{t('hero.feature_shipping', 'Livraison Rapide')}</span>
                    </div>
                </div>
            </div>
        </section>
    );
};


export default Hero;
