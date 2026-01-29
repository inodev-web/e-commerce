import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Package, ArrowLeft, MapPin, Phone, CreditCard, XCircle } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getTranslated } from '@/utils/translation';

const Show = ({ order }) => {
    const handleCancel = () => {
        if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
            router.post(route('orders.cancel', order.id));
        }
    };

    const resolveItemName = (item) => {
        const snapshotName = item?.metadata_snapshot?.name;
        if (snapshotName) {
            return typeof snapshotName === 'object'
                ? getTranslated({ name: snapshotName }, 'name')
                : snapshotName;
        }
        return item?.product ? getTranslated(item.product, 'name') : 'Produit supprimé';
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header theme="light" toggleTheme={() => { }} />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <Link href={route('orders.index')} className="inline-flex items-center gap-2 text-gray-500 hover:text-teal-600 mb-6 font-medium">
                    <ArrowLeft size={18} /> Retour à mes commandes
                </Link>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="bg-gray-50 p-6 border-b flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                Commande #{order.id}
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Passée le {new Date(order.created_at).toLocaleString()}
                            </p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${order.status === 'En attente' ? 'bg-orange-100 text-orange-600' :
                                order.status === 'Confirmée' ? 'bg-blue-100 text-blue-600' :
                                    order.status === 'Livrée' ? 'bg-green-100 text-green-600' :
                                        order.status === 'Annulée' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {order.status}
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Delivery Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <MapPin size={18} className="text-gray-400" /> Adresse de livraison
                            </h3>
                            <div className="text-sm text-gray-600 pl-7 space-y-1">
                                <p className="font-medium text-gray-900">{order.first_name} {order.last_name}</p>
                                <p>{order.address}</p>
                                <p>{order.commune_name}, {order.wilaya_name}</p>
                                <p className="flex items-center gap-2 mt-2">
                                    <Phone size={14} /> {order.phone}
                                </p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard size={18} className="text-gray-400" /> Paiement & Livraison
                            </h3>
                            <div className="text-sm text-gray-600 pl-7 space-y-2">
                                <div className="flex justify-between">
                                    <span>Type de livraison</span>
                                    <span className="font-medium text-gray-900">{order.delivery_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Frais de livraison</span>
                                    <span className="font-medium text-gray-900">{order.delivery_price} DA</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-teal-600 pt-2 border-t">
                                    <span>Total</span>
                                    <span>{order.total_price.toLocaleString()} DA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t p-6">
                        <h3 className="font-bold text-gray-900 mb-4 bg-gray-50 p-2 rounded">Produits commandés</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded md-1 flex-shrink-0">
                                        {/* Assuming product relationship is loaded via 'product' in item, or snapshot data */}
                                        <img
                                            src={item.product && item.product.images ? `/storage/${item.product.images[0].image_path}` : '/placeholder.svg'}
                                            className="w-full h-full object-cover rounded"
                                            alt="Product"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium text-gray-900">{resolveItemName(item)}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.quantity} x {item.price_snapshot} DA
                                        </p>
                                    </div>
                                    <div className="font-bold text-gray-900">
                                        {(item.quantity * item.price_snapshot).toLocaleString()} DA
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    {order.status === 'En attente' && (
                        <div className="bg-gray-50 p-6 border-t text-right">
                            <button
                                onClick={handleCancel}
                                className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1 ml-auto"
                            >
                                <XCircle size={16} /> Annuler la commande
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Show;
