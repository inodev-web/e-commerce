import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <motion.footer
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="footer"
        >
            <div className="footer-container">
                {/* Brand Section */}
                <div className="footer-section">
                    <div className="footer-logo">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
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
                        <li><a href="#">{t('footer.about', 'À Propos')}</a></li>
                        <li><a href="#">{t('footer.contact', 'Contact')}</a></li>
                        <li><a href="#">{t('footer.faq', 'FAQ')}</a></li>
                        <li><a href="#">{t('footer.shipping_policy', 'Politique de Livraison')}</a></li>
                    </ul>
                </div>

                {/* Categories */}
                <div className="footer-section">
                    <h3 className="footer-heading">{t('footer.categories', 'Catégories')}</h3>
                    <ul className="footer-links">
                        <li><a href="#">{t('footer.skin_care', 'Soins de la Peau')}</a></li>
                        <li><a href="#">{t('footer.hair_care', 'Soins Capillaires')}</a></li>
                        <li><a href="#">{t('footer.baby_care', 'Soins Bébé')}</a></li>
                        <li><a href="#">{t('footer.vitamins', 'Vitamines')}</a></li>
                    </ul>
                </div>

                {/* Contact Us */}
                <div className="footer-section">
                    <h3 className="footer-heading">{t('footer.contact_us', 'Contactez-nous')}</h3>
                    <ul className="footer-links">
                        <li><a href="#">support@pureva.dz</a></li>
                        <li><a href="#">+213 555 123 456</a></li>
                        <li><a href="#">Alger, Algérie</a></li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <div className="footer-container">
                    <p className="copyright">{t('footer.copyright', '© 2024 Puréva. Tous droits réservés.')}</p>
                    <div className="social-links">
                        <a href="#"><Facebook /></a>
                        <a href="#"><Twitter /></a>
                        <a href="#"><Instagram /></a>
                        <a href="#"><Linkedin /></a>
                    </div>
                </div>
            </div>
        </motion.footer>
    );
};

export default Footer;
