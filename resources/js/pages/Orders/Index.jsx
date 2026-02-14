import React from 'react';
import { Link } from '@inertiajs/react'; // Correct import
import { Package, Clock, ChevronRight, Calculator } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Index = ({ orders }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header theme="light" toggleTheme={() => { }} />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <Package className="text-teal-600" />
                    Mes Commandes
                </h1>

                {orders.data.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl shadow-sm text-center">
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucune commande</h2>
                        <p className="text-gray-500 mb-6">Vous n'avez pas encore passé© de commande.</p>
                        <Link href={route('products.index')} className="text-teal-600 font-bold hover:underline">
                            Commencer vos achats
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.data.map((order) => (
                            <Link
                                key={order.id}
                                href={route('orders.show', order.id)}
                                className="block bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-teal-100"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold">
                                            #{order.id}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(order.created_at).toLocaleDateString()}
                                                <span className="text-gray-400 font-normal mx-2">•</span>
                                                {order.items.length} articles
                                            </p>
                                            <p className={`text-sm font-medium ${order.status === 'En attente' ? 'text-orange-500' :
                                                order.status === 'Livré©e' ? 'text-green-600' : 'text-gray-500'
                                                }`}>
                                                {order.status}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total</p>
                                            <p className="font-bold text-lg">{order.total_price.toLocaleString()} DA</p>
                                        </div>
                                        <ChevronRight className="text-gray-400" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination (Simplified) */}
                {orders.links && orders.links.length > 3 && (
                    <div className="flex justify-center mt-8 gap-2">
                        {orders.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded border ${link.active ? 'bg-teal-600 text-white' : 'bg-white'}`}
                                />
                            ) : (
                                <span key={i} dangerouslySetInnerHTML={{ __html: link.label }} className="px-3 py-1 text-gray-400" />
                            )
                        ))}
                    </div>
                )}

            </main>
            <Footer />
        </div>
    );
};

export default Index;
