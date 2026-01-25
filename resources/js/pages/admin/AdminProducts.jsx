import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, MoreHorizontal, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const AdminProducts = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);

    // Mock Data
    const products = [
        { id: 1, name: 'T-Shirt Basic', category: 'T-Shirts', price: 1500, stock: 120, status: 'Active' },
        { id: 2, name: 'Jeans Slim Fit', category: 'Pants', price: 3500, stock: 45, status: 'Active' },
        { id: 3, name: 'Hoodie Oversized', category: 'Hoodies', price: 4500, stock: 0, status: 'Out of Stock' },
        { id: 4, name: 'Sneakers Urban', category: 'Shoes', price: 8900, stock: 12, status: 'Low Stock' },
        { id: 5, name: 'Cap Classic', category: 'Accessories', price: 1200, stock: 200, status: 'Active' },
    ];

    const tabs = [
        { id: 'products', label: 'Produits' },
        { id: 'categories', label: 'Catégories' },
        { id: 'subcategories', label: 'Sous-catégories' },
        { id: 'specifications', label: 'Spécifications' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Gestion des Produits</h1>
                <Button onClick={() => setIsAddProductOpen(true)} className="bg-[#DB8B89] text-white hover:bg-[#C07573] dark:bg-[#DB8B89] dark:text-white dark:hover:bg-[#C07573]">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un produit
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-zinc-800">
                <nav className="-mb-px flex space-x-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id
                                    ? 'border-[#DB8B89] text-[#DB8B89]'
                                    : 'border-transparent text-gray-500 hover:text-[#DB8B89] hover:border-pink-200 dark:text-gray-400 dark:hover:text-[#DB8B89]'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'products' && (
                <div className="space-y-4">
                    {/* Filters & Search */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un produit..."
                                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#DB8B89]/20 focus:border-[#DB8B89]"
                            />
                        </div>
                        <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filtres</span>
                        </button>
                    </div>

                    {/* Table */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4">Nom du produit</th>
                                        <th className="px-6 py-4">Catégorie</th>
                                        <th className="px-6 py-4">Prix</th>
                                        <th className="px-6 py-4">Stock</th>
                                        <th className="px-6 py-4">Statut</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                    {products.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{product.name}</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{product.category}</td>
                                            <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">{product.price} DA</td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{product.stock}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                    ${product.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                        product.status === 'Out of Stock' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}
                                                `}>
                                                    {product.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-[#DB8B89] dark:hover:text-[#DB8B89] transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'categories' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter Catégorie
                        </Button>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Nom</th>
                                    <th className="px-6 py-4">Image</th>
                                    <th className="px-6 py-4">Produits</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {[1, 2, 3].map((i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 font-medium dark:text-gray-100">Category {i}</td>
                                        <td className="px-6 py-4"><div className="w-10 h-10 rounded bg-gray-200 dark:bg-zinc-700"></div></td>
                                        <td className="px-6 py-4 dark:text-gray-400">12</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-[#DB8B89]"><Edit className="w-4 h-4" /></button>
                                                <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'subcategories' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter Sous-catégorie
                        </Button>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Nom</th>
                                    <th className="px-6 py-4">Catégorie PArente</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {[1, 2].map((i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 font-medium dark:text-gray-100">Sub Category {i}</td>
                                        <td className="px-6 py-4 dark:text-gray-400">Category 1</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-[#DB8B89]"><Edit className="w-4 h-4" /></button>
                                                <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'specifications' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <Button className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter Spécification
                        </Button>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Nom (ex: Couleur, Taille)</th>
                                    <th className="px-6 py-4">Valeurs</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                    <td className="px-6 py-4 font-medium dark:text-gray-100">Couleur</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-1">
                                            <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-xs">Rouge</span>
                                            <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-xs">Bleu</span>
                                            <span className="px-2 py-1 rounded-md bg-gray-100 dark:bg-zinc-800 text-xs">Vert</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-[#DB8B89]"><Edit className="w-4 h-4" /></button>
                                            <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Product Dialog */}
            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nom du produit</label>
                                <input className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" placeholder="Ex: T-Shirt Basic" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Catégorie</label>
                                <select className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700">
                                    <option>Sélectionner...</option>
                                    <option>T-Shirts</option>
                                    <option>Pants</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Prix (DA)</label>
                                <input type="number" className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" placeholder="0.00" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock</label>
                                <input type="number" className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" placeholder="0" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 min-h-[100px]" placeholder="Description du produit..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Annuler</Button>
                        <Button className="bg-[#DB8B89] text-white hover:bg-[#C07573]">Sauvegarder</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminProducts;
