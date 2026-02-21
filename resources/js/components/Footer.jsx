import { Facebook, Twitter, Instagram, Linkedin, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePage, Link } from '@inertiajs/react';
import { getTranslated } from '@/utils/translation';

const Footer = () => {
    const { t } = useTranslation();
    const { footerCategories } = usePage().props;

    return (
        <motion.footer
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="footer"
        >
            {/* Developer Identity (Top Centered) */}
            <div className="footer-container developer-identity" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: '0.75rem' }}>
                <a href="https://www.instagram.com/inodev.dz?igsh=b2s3cTliZHZiMzli&utm_source=qr" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', transform: 'translateY(1px)' }}>Développé par</span>
                    <span style={{ fontWeight: '600', letterSpacing: '0.5px', fontSize: '1rem', transform: 'translateY(1px)' }}>Inodev</span>
                    <img src="/inodev.jpg" alt="Inodev Logo" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                </a>
                <div className="developer-socials" style={{ display: 'flex', gap: '1rem', opacity: '0.8', marginTop: '0.5rem' }}>
                    <a href="https://www.facebook.com/share/16T1m8NPRJ/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Inodev Facebook"><Facebook size={18} /></a>
                    <a href="https://www.instagram.com/inodev.dz?igsh=b2s3cTliZHZiMzli&utm_source=qr" target="_blank" rel="noreferrer" aria-label="Inodev Instagram"><Instagram size={18} /></a>
                    <a href="https://www.tiktok.com/@inodev.dz?_r=1&_t=ZS-946bPfZStHg" target="_blank" rel="noreferrer" aria-label="Inodev Tiktok">
                        <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" /></svg>
                    </a>
                </div>
            </div>

            <div className="footer-container">
                {/* Brand Section */}
                <div className="footer-section">
                    <div className="footer-logo">
                        <img src="/logo.png" alt="Puréva Logo" className="logo-icon" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        <span className="logo-text">Puréva</span>
                    </div>
                    <p className="footer-description">
                        {t('footer.description', 'Votre partenaire de confiance pour tous vos besoins médicaux et cosmétiques. Qualité et soin livrés à votre porte.')}
                    </p>
                </div>

                {/* Quick Links */}
                <div className="footer-section">
                    <h3 className="footer-heading">{t('footer.quick_links', 'Liens Rapides')}</h3>
                    <ul className="footer-links">
                        <li><Link href="/">{t('footer.home', 'Accueil')}</Link></li>
                        <li><Link href="/#categories-section">{t('footer.categories', 'Catégories')}</Link></li>
                        <li><Link href="/#brands-section">{t('footer.brands', 'Nos Marques')}</Link></li>
                        <li><Link href="/#recommended-section">{t('footer.recommended', 'Recommandé pour vous')}</Link></li>
                        <li><Link href={route('products.index')}>{t('footer.shop', 'Boutique')}</Link></li>
                    </ul>
                </div>

                {/* Categories */}
                <div className="footer-section">
                    <h3 className="footer-heading">{t('footer.categories', 'Catégories')}</h3>
                    <ul className="footer-links" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                        {footerCategories && footerCategories.length > 0 ? (
                            footerCategories.map((category) => (
                                <li key={category.id}>
                                    <Link href={route('products.index', { category_id: category.id })}>
                                        {getTranslated(category, 'name')}
                                    </Link>
                                </li>
                            ))
                        ) : (
                            // Fallback
                            <>
                                <li><Link href="#">{t('footer.skin_care', 'Soins de la Peau')}</Link></li>
                                <li><Link href="#">{t('footer.hair_care', 'Soins Capillaires')}</Link></li>
                            </>
                        )}
                    </ul>
                </div>

                {/* Contact Us */}
                <div className="footer-section">
                    <h3 className="footer-heading">{t('footer.contact_us', 'Contactez-nous')}</h3>
                    <ul className="footer-links contact-info" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Phone size={16} /> <a href="tel:0656171221">0656171221</a>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <MapPin size={16} /> <span>Skikda, Algérie</span>
                        </li>
                        <li>
                            <div className="social-links" style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                <a href="https://www.facebook.com/share/1AZ4dRhpso/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={20} /></a>
                                <a href="https://www.instagram.com/pureva_pharma?igsh=bDVxYWd6NmtwN2du&utm_source=qr" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
                                <a href="https://www.tiktok.com/@mrs.pharma?_r=1&_t=ZS-946bwiIRpZ7" target="_blank" rel="noreferrer" aria-label="Tiktok">
                                    <svg width="20" height="20" viewBox="0 0 448 512" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" /></svg>
                                </a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <div className="footer-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <p className="copyright" style={{ textAlign: 'center', width: '100%', margin: 0 }}>© 2026 Puréva. Tous droits réservés.</p>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;
