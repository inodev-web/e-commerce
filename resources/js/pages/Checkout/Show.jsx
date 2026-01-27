import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Truck, MapPin, Phone, CreditCard, ShoppingBag, Loader2 } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const Show = ({ cart, items, productsTotal, wilayas, deliveryTypes }) => {
    // Theme state
    const [theme, setTheme] = useState('light');
    const toggleTheme = () => setTheme(pre => pre === 'dark' ? 'light' : 'dark');

    const { auth } = usePage().props;

    // Form handling
    const { data, setData, post, processing, errors } = useForm({
        first_name: auth.user?.client?.first_name || '',
        last_name: auth.user?.client?.last_name || '',
        phone: auth.user?.phone || auth.user?.client?.phone || '',
        wilaya_id: auth.user?.client?.wilaya_id || '',
        commune_id: auth.user?.client?.commune_id || '', // Note: Logic slightly flawed if communes not loaded
        address: auth.user?.client?.address || '',
        delivery_type: deliveryTypes[0].value,
    });

    // Local state for dynamic data
    const [communes, setCommunes] = useState([]);
    const [shippingPrice, setShippingPrice] = useState(0);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);

    // Initial load or update when wilaya/type changes
    useEffect(() => {
        if (data.wilaya_id) {
            fetchShippingAndCommunes();
        }
    }, [data.wilaya_id, data.delivery_type]);

    const fetchShippingAndCommunes = async () => {
        setIsLoadingShipping(true);
        try {
            const response = await axios.post(route('checkout.shipping'), {
                wilaya_id: data.wilaya_id,
                delivery_type: data.delivery_type
            });

            setShippingPrice(response.data.delivery_price);
            setCommunes(response.data.communes);
        } catch (error) {
            console.error("Erreur calcul livraison:", error);
            setShippingPrice(0);
            setCommunes([]);
        } finally {
            setIsLoadingShipping(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('checkout.place'));
    };

    const total = productsTotal + shippingPrice;

    return (
        <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-gray-50'}`}>
            <Header theme={theme} toggleTheme={toggleTheme} />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <CreditCard className="text-teal-600" />
                    Finaliser la commande
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm space-y-6">

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Phone size={20} className="text-gray-400" /> Informations de contact
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                        <input
                                            type="text"
                                            value={data.last_name}
                                            onChange={e => setData('last_name', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-500 ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        />
                                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                        <input
                                            type="text"
                                            value={data.first_name}
                                            onChange={e => setData('first_name', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-500 ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        />
                                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {/* Delivery Info */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <MapPin size={20} className="text-gray-400" /> Livraison
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Wilaya Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Wilaya</label>
                                        <select
                                            value={data.wilaya_id}
                                            onChange={e => setData('wilaya_id', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-500 ${errors.wilaya_id ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                        >
                                            <option value="">Sélectionner une wilaya</option>
                                            {wilayas.map(w => (
                                                <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                                            ))}
                                        </select>
                                        {errors.wilaya_id && <p className="text-red-500 text-xs mt-1">{errors.wilaya_id}</p>}
                                    </div>

                                    {/* Commune Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Commune</label>
                                        <select
                                            value={data.commune_id}
                                            onChange={e => setData('commune_id', e.target.value)}
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-500 ${errors.commune_id ? 'border-red-500' : 'border-gray-300'}`}
                                            required
                                            disabled={!data.wilaya_id}
                                        >
                                            <option value="">Sélectionner une commune</option>
                                            {communes.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        {errors.commune_id && <p className="text-red-500 text-xs mt-1">{errors.commune_id}</p>}
                                    </div>

                                    {/* Address */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
                                        <textarea
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            rows="2"
                                            className={`w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-teal-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Quartier, N° rue, Bâtiment..."
                                            required
                                        ></textarea>
                                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                                    </div>

                                    {/* Delivery Type */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mode de livraison</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {deliveryTypes.map(type => (
                                                <label
                                                    key={type.value}
                                                    className={`border rounded-xl p-4 cursor-pointer flex items-center justify-between transition-all ${data.delivery_type === type.value ? 'border-teal-600 bg-teal-50 ring-1 ring-teal-600' : 'hover:border-gray-400'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="radio"
                                                            name="delivery_type"
                                                            value={type.value}
                                                            checked={data.delivery_type === type.value}
                                                            onChange={e => setData('delivery_type', e.target.value)}
                                                            className="text-teal-600 focus:ring-teal-500"
                                                        />
                                                        <span className="font-medium">{type.label}</span>
                                                    </div>
                                                    <Truck size={18} className={data.delivery_type === type.value ? 'text-teal-600' : 'text-gray-400'} />
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                            <h3 className="text-xl font-bold mb-6">Récapitulatif</h3>

                            <div className="max-h-60 overflow-y-auto space-y-3 mb-6 pr-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-3 text-sm">
                                        <div className="w-12 h-12 bg-gray-100 rounded md-1 flex-shrink-0 relative">
                                            <img
                                                src={item.product && item.product.images[0] ? `/storage/${item.product.images[0].image_path}` : '/placeholder.png'}
                                                className="w-full h-full object-cover rounded"
                                            />
                                            <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-medium line-clamp-1">{item.product.name}</p>
                                            <p className="text-gray-500">{item.price_snapshot.toLocaleString()} DA</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Sous-total</span>
                                    <span>{productsTotal.toLocaleString()} DA</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Livraison</span>
                                    {isLoadingShipping ? (
                                        <Loader2 className="animate-spin w-4 h-4" />
                                    ) : (
                                        <span>{shippingPrice > 0 ? `${shippingPrice.toLocaleString()} DA` : 'Gratuit / Non calculé'}</span>
                                    )}
                                </div>
                                <div className="border-t pt-3 flex justify-between font-bold text-xl text-gray-900">
                                    <span>Total à payer</span>
                                    <span>{total.toLocaleString()} DA</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={processing || isLoadingShipping || !data.wilaya_id}
                                className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-center block hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Traitement...' : 'Confirmer la commande'}
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                En confirmant, vous acceptez nos conditions générales de vente.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Show;
