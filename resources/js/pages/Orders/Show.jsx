import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Package, ArrowLeft, ArrowRight, MapPin, Phone, CreditCard, XCircle } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getTranslated } from '@/utils/translation';
import { useTranslation } from 'react-i18next';

const Show = ({ order }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    const handleCancel = () => {
        if (confirm(t('orders.confirm_cancel_msg', 'Êtes-vous sûr de vouloir annuler cette commande ?'))) {
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
        return item?.product ? getTranslated(item.product, 'name') : t('common.product_deleted', 'Produit supprimé');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black" dir={isRtl ? 'rtl' : 'ltr'}>
            <Header />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
                <Link href={route('orders.index')} className="inline-flex items-center gap-2 text-gray-500 hover:text-[#DB8B89] mb-6 font-medium dark:text-gray-400 dark:hover:text-[#DB8B89]">
                    {isRtl ? <ArrowRight size={18} /> : <ArrowLeft size={18} />} {t('orders.back', 'Retour à mes commandes')}
                </Link>

                <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
                    {/* Header */}
                    <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 border-b dark:border-gray-800 flex flex-wrap justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                {t('orders.order', 'Commande')} #{order.id}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {t('orders.placed_on', 'Passée le')} {new Date(order.created_at).toLocaleString()}
                            </p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${order.status === 'En attente' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                            order.status === 'Confirmée' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                order.status === 'Livrée' ? 'bg-[#DB8B89]/10 text-[#DB8B89] dark:bg-[#DB8B89]/20' :
                                    order.status === 'Annulée' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}>
                            {order.status}
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Delivery Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <MapPin size={18} className="text-gray-400 dark:text-gray-500" /> {t('orders.shipping_address', 'Adresse de livraison')}
                            </h3>
                            <div className={`text-sm text-gray-600 dark:text-gray-400 space-y-1 ${isRtl ? 'pr-7' : 'pl-7'}`}>
                                <p className="font-medium text-gray-900 dark:text-gray-200">{order.first_name} {order.last_name}</p>
                                <p>{order.address}</p>
                                <p>{order.commune_name}, {order.wilaya_name}</p>
                                <p className="flex items-center gap-2 mt-2">
                                    <Phone size={14} /> {order.phone}
                                </p>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <CreditCard size={18} className="text-gray-400 dark:text-gray-500" /> {t('orders.payment_shipping', 'Paiement & Livraison')}
                            </h3>
                            <div className={`text-sm text-gray-600 dark:text-gray-400 space-y-2 ${isRtl ? 'pr-7' : 'pl-7'}`}>
                                <div className="flex justify-between">
                                    <span>{t('orders.shipping_type', 'Type de livraison')}</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{order.delivery_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{t('orders.shipping_fees', 'Frais de livraison')}</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-200">{order.delivery_price} DA</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-[#DB8B89] pt-2 border-t dark:border-gray-700">
                                    <span>{t('orders.total', 'Total')}</span>
                                    <span>{order.total_price.toLocaleString()} DA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="border-t dark:border-gray-800 p-6">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 bg-gray-50 dark:bg-[#1a1a1a] p-2 rounded">{t('orders.ordered_products', 'Produits commandés')}</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded md-1 flex-shrink-0">
                                        {/* Assuming product relationship is loaded via 'product' in item, or snapshot data */}
                                        <img
                                            src={item.product && item.product.images && item.product.images.length > 0 ? `/storage/${item.product.images[0].image_path}` : '/placeholder.svg'}
                                            className="w-full h-full object-cover rounded"
                                            alt="Product"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-medium text-gray-900 dark:text-gray-200">{resolveItemName(item)}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {item.quantity} x {item.price_snapshot} DA
                                        </p>
                                    </div>
                                    <div className="font-bold text-gray-900 dark:text-gray-100">
                                        {(item.quantity * item.price_snapshot).toLocaleString()} DA
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    {order.status === 'En attente' && (
                        <div className="bg-gray-50 dark:bg-[#1a1a1a] p-6 border-t dark:border-gray-800 text-right">
                            <button
                                onClick={handleCancel}
                                className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center gap-1 ml-auto"
                            >
                                <XCircle size={16} /> {t('orders.cancel_order', 'Annuler la commande')}
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
