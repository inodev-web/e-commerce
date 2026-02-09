import React, { useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import confetti from 'canvas-confetti';

const Success = ({ order, newLoyaltyBalance }) => {
    useEffect(() => {
        // Confetti effect on load
        const duration = 3 * 1000;
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
        <div className="checkout-page min-h-screen flex flex-col bg-gray-50">
            <Header theme="light" toggleTheme={() => { }} />

            <main className="flex-grow flex items-center justify-center p-4">
                <div className="checkout-card bg-white p-8 md:p-12 rounded-3xl shadow-lg max-w-2xl w-full text-center">
                    <div className="w-24 h-24 bg-[#F8E4E0] rounded-full flex items-center justify-center mx-auto mb-6 text-[#DB8B89]">
                        <CheckCircle size={48} />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Commande Confirmée !</h1>
                    <p className="text-gray-500 text-lg mb-8">
                        Merci <span className="font-semibold text-[#DB8B89]">{order.first_name}</span>, votre commande <span className="font-mono bg-[#F8E4E0] px-2 py-1 rounded text-[#DB8B89]">#{order.id}</span> a été enregistrée avec succès.
                    </p>

                    <div className="bg-[#FDF6F5] p-6 rounded-2xl mb-8 text-left border border-[#F3CFCB]">
                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Détails de la livraison</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Adresse</p>
                                <p className="font-medium">{order.address}</p>
                                <p className="font-medium">{order.commune_name}, {order.wilaya_name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Montant Total</p>
                                <p className="font-bold text-lg text-[#DB8B89]">{order.total_price.toLocaleString()} DA</p>
                                <p className="text-gray-500 mt-2">Mode de paiement</p>
                                <p className="font-medium">Paiement à la livraison</p>
                            </div>
                        </div>
                    </div>

                    {newLoyaltyBalance !== undefined && newLoyaltyBalance !== null && (
                        <div className="bg-gradient-to-r from-[#F8E4E0] to-[#FDF6F5] p-6 rounded-2xl mb-8 border border-[#F3CFCB]">
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-12 h-12 bg-[#DB8B89] rounded-full flex items-center justify-center">
                                    <span className="text-white text-xl">★</span>
                                </div>
                                <div>
                                    <p className="text-gray-600 text-sm">Votre nouveau solde de points fidélité</p>
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
                        {/* If you have an order tracking page, link there */}
                        <Link
                            href={route('orders.show', order.id)}
                            className="bg-white border-2 border-[#DB8B89] text-[#DB8B89] px-8 py-3 rounded-xl font-bold hover:bg-[#F8E4E0] transition-colors flex items-center justify-center gap-2"
                        >
                            Suivre ma commande <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Success;
