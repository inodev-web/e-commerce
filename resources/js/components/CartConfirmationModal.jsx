import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Link } from '@inertiajs/react';
import { CheckCircle, ShoppingCart, ArrowRight } from 'lucide-react';

const CartConfirmationModal = ({ isOpen, onClose, product }) => {
    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-teal-600">
                        <CheckCircle size={24} /> Produit ajouté au panier !
                    </DialogTitle>
                </DialogHeader>

                <div className="flex items-start gap-4 py-4">
                    <img
                        src={product.images && product.images.length > 0 ? `/storage/${product.images[0].image_path}` : '/placeholder.png'}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-md bg-gray-100"
                    />
                    <div>
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <p className="text-gray-500">{product.price.toLocaleString()} DA</p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
                    >
                        Continuer les achats
                    </button>
                    <Link
                        href={route('cart.show')}
                        className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium flex items-center justify-center gap-2"
                    >
                        <ShoppingCart size={16} /> Voir le panier
                    </Link>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CartConfirmationModal;
