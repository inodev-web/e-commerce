import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import confetti from 'canvas-confetti';
import { trackEvent } from '@/utils/analytics';

const Success = ({ order, newLoyaltyBalance }) => {
    const pageProps = usePage().props;
    const auth = pageProps.auth;
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const isClient = auth.user && auth.user.client;

    useEffect(() => {
        // Track Purchase event
        trackEvent('Purchase', {
            value: order.total_price,
            currency: 'DZD',
            content_ids: (order.items || []).map(i => i.product_id),
            num_items: (order.items || []).length,
            content_type: 'product'
        });

        // Confetti effect on load
        const duration = 3 * 1000;
        // ... rest of confetti logic
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }, []);

    return (
        <div className="checkout-page min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950">
            <Header theme={theme} toggleTheme={toggleTheme} />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="checkout-card bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-3xl shadow-lg max-w-2xl w-full text-center">
                    <div className="w-24 h-24 bg-[#F8E4E0] dark:bg-[#DB8B89]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#DB8B89]">
                        <CheckCircle size={48} />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Commande Confirmée !</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
                        Merci <span className="font-semibold text-[#DB8B89]">{order.first_name}</span>, votre commande <span className="font-mono bg-[#F8E4E0] dark:bg-[#DB8B89]/20 px-2 py-1 rounded text-[#DB8B89]">#{order.id}</span> a été enregistrée avec succès.
                    </p>

                    <div className="bg-[#FDF6F5] dark:bg-zinc-800 p-6 rounded-2xl mb-8 text-left border border-[#F3CFCB] dark:border-zinc-700">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 border-gray-200 dark:border-zinc-700">Détails de la livraison</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Adresse</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{order.address}</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">{order.commune_name}, {order.wilaya_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 dark:text-gray-400">Montant Total</p>
                                <p className="font-bold text-lg text-[#DB8B89]">{order.total_price.toLocaleString()} DA</p>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Mode de paiement</p>
                                <p className="font-medium text-gray-900 dark:text-gray-100">Paiement à la livraison</p>
                            </div>
                        </div>
                    </div>

                    {isClient && newLoyaltyBalance !== undefined && newLoyaltyBalance !== null && (
                        <div className="bg-gradient-to-r from-[#F8E4E0] to-[#FDF6F5] dark:from-[#DB8B89]/20 dark:to-zinc-800 p-6 rounded-2xl mb-8 border border-[#F3CFCB] dark:border-zinc-700">
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-12 h-12 bg-[#DB8B89] rounded-full flex items-center justify-center">
                                    <span className="text-white text-xl">★</span>
                                </div>
                                <div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">Votre nouveau solde de points fidélité</p>
                                    <p className="font-bold text-2xl text-[#DB8B89]">{newLoyaltyBalance} points</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={route('products.index')}
                            className="bg-[#DB8B89] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#C07573] transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingBag size={20} /> Continuer les achats
                        </Link>
                        {isClient && (
                            <Link
                                href={route('orders.show', order.id)}
                                className="bg-white dark:bg-zinc-800 border-2 border-[#DB8B89] text-[#DB8B89] px-8 py-3 rounded-xl font-bold hover:bg-[#F8E4E0] dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                            >
                                Suivre ma commande <ArrowRight size={20} />
                            </Link>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Success;
