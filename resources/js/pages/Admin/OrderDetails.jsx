import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft,
    Calendar,
    User,
    Phone,
    MapPin,
    Truck,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Package
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { Button } from "@/Components/ui/button";
import { getTranslated } from '@/utils/translation';

const AdminOrderDetails = ({ auth, order }) => {
    const { t } = useTranslation();
    const resolveItemName = (item) => {
        const snapshotName = item?.metadata_snapshot?.name;
        if (snapshotName) {
            return typeof snapshotName === 'object'
                ? getTranslated({ name: snapshotName }, 'name')
                : snapshotName;
        }
        return getTranslated(item?.product, 'name');
    };

    const renderSpecifications = (item) => {
        const specifications = item?.metadata_snapshot?.specifications;
        if (!specifications || !Array.isArray(specifications) || specifications.length === 0) {
            return null;
        }

        return (
            <div className="mt-2 space-y-1">
                {specifications.map((spec, index) => {
                    const specName = typeof spec.n === 'object' 
                        ? getTranslated({ name: spec.n }, 'name')
                        : spec.n || 'Specification';
                    return (
                        <div key={index} className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">{specName}:</span> {spec.v}
                        </div>
                    );
                })}
            </div>
        );
    };

    const StatusBadge = ({ status }) => {
        let styles = '';
        let icon = null;
        switch (status) {
            case 'pending':
                styles = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
                icon = <Clock className="w-3 h-3 mr-1" />;
                break;
            case 'confirmed':
                styles = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
                icon = <CheckCircle className="w-3 h-3 mr-1" />;
                break;
            case 'shipped':
                styles = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
                icon = <Truck className="w-3 h-3 mr-1" />;
                break;
            case 'delivered':
                styles = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
                icon = <CheckCircle className="w-3 h-3 mr-1" />;
                break;
            case 'cancelled':
                styles = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
                icon = <XCircle className="w-3 h-3 mr-1" />;
                break;
            default: styles = 'bg-gray-100 text-gray-800';
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles}`}>
                {icon}
                {t(`status.${status}`, status)}
            </span>
        );
    };

    const updateStatus = (newStatus) => {
        if (confirm(t('admin.confirm_status_change', 'Voulez-vous vraiment changer le statut de cette commande ?'))) {
            router.patch(route('admin.orders.status.update', order.id), { status: newStatus });
        }
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title={`${t('admin.order', 'Commande')} #${order.code || order.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.orders.index')} className="p-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                                {t('admin.order', 'Commande')} #{order.code || order.id}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    {new Date(order.created_at).toLocaleString()}
                                </span>
                                <StatusBadge status={order.status} />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        {order.status === 'pending' && (
                            <Button onClick={() => updateStatus('confirmed')} className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none">
                                {t('admin.confirm_order', 'Confirmer la commande')}
                            </Button>
                        )}
                        {order.status === 'confirmed' && (
                            <Button onClick={() => updateStatus('shipped')} className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none">
                                {t('admin.mark_as_shipped', 'Marquer comme expÃ©diÃ©e')}
                            </Button>
                        )}
                        {order.status === 'shipped' && (
                            <Button onClick={() => updateStatus('delivered')} className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none">
                                {t('admin.mark_as_delivered', 'Marquer comme livrÃ©e')}
                            </Button>
                        )}
                        {['pending', 'confirmed'].includes(order.status) && (
                            <Button onClick={() => updateStatus('cancelled')} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 flex-1 sm:flex-none">
                                {t('common.cancel', 'Annuler')}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Items & Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
                                <Package className="w-5 h-5 text-[#DB8B89]" />
                                <h2 className="font-semibold text-gray-900 dark:text-gray-100">{t('cart.products', 'Produits')}</h2>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                {order.items.map((item) => (
                                    <div key={item.id} className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-zinc-800 flex-shrink-0 overflow-hidden border border-gray-100 dark:border-zinc-800">
                                            {item.product?.images?.[0] ? (
                                                <img
                                                    src={`/storage/${item.product.images[0].image_path}`}
                                                    alt={resolveItemName(item)}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {resolveItemName(item)}
                                            </h3>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                {item.quantity} x {item.price_snapshot.toLocaleString()} DA
                                            </div>
                                            {renderSpecifications(item)}
                                        </div>
                                        <div className="text-right font-semibold text-gray-900 dark:text-gray-100">
                                            {(item.quantity * item.price_snapshot).toLocaleString()} DA
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-800/50 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>{t('cart.subtotal', 'Sous-total')}</span>
                                    <span>{order.products_total.toLocaleString()} DA</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>{t('cart.shipping', 'Livraison')}</span>
                                    <span>{order.delivery_price.toLocaleString()} DA</span>
                                </div>
                                {order.discount_total > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>{t('cart.discount', 'RÃ©duction')}</span>
                                        <span>-{order.discount_total.toLocaleString()} DA</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-zinc-700">
                                    <span>Total</span>
                                    <span>{order.total_price.toLocaleString()} DA</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Timeline (Simple version) */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" />
                                {t('admin.audit_trail', 'Historique')}
                            </h2>
                            <div className="space-y-6">
                                <div className="relative pl-8 before:absolute before:left-3 before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-100 dark:before:bg-zinc-800 last:before:hidden">
                                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                        {t('status.pending', 'Commande passÃ©e')}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(order.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {/* Could add more timeline items here if tracked */}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Shipping */}
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-gray-400" />
                                {t('admin.customer', 'Client')}
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#DB8B89]/10 text-[#DB8B89] flex items-center justify-center font-bold">
                                        {order.first_name?.[0]}{order.last_name?.[0]}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-gray-100">{order.first_name} {order.last_name}</div>
                                        <div className="text-sm text-gray-500">{order.client?.user?.email || t('common.guest', 'InvitÃ©')}</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Phone className="w-4 h-4" />
                                        {order.phone}
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <MapPin className="w-4 h-4 mt-0.5" />
                                        <span>
                                            {order.address}<br />
                                            {order.commune_name}, {order.wilaya_name}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <Truck className="w-5 h-5 text-gray-400" />
                                {t('cart.shipping', 'Livraison')}
                            </h2>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('admin.delivery_type', 'Mode')}</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {order.delivery_type === 'domicile' ? t('delivery.domicile', 'Domicile') : t('delivery.bureau', 'Bureau')}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('admin.wilaya', 'Wilaya')}</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{order.wilaya_name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">{t('admin.commune', 'Commune')}</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{order.commune_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                {t('checkout.payment_method', 'Paiement')}
                            </h2>
                            <div className="p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-100 dark:border-zinc-700">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {t('common.cash_on_delivery', 'Paiement Ã  la livraison (COD)')}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {t('admin.cod_hint', 'Le client paiera Ã  la rÃ©ception.')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminOrderDetails;
