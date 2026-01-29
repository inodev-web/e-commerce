import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AdminLayout from '../../Components/AdminLayout';
import { useForm } from '@inertiajs/react';
import { getTranslated } from '@/utils/translation';

const AdminCategories = ({ categories, theme, toggleTheme }) => {
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [isAddSubCategoryOpen, setIsAddSubCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState(new Set());

    const categoryForm = useForm({
        name: '',
        active: true,
        image: null,
    });

    const subCategoryForm = useForm({
        name: '',
        active: true,
    });

    const toggleCategory = (categoryId) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const handleAddCategory = (e) => {
        e.preventDefault();
        categoryForm.transform((data) => {
            const payload = { ...data };
            if (!payload.image) {
                delete payload.image;
            }
            return payload;
        });
        categoryForm.post(route('admin.categories.store'), {
            forceFormData: true,
            onSuccess: () => {
                setIsAddCategoryOpen(false);
                categoryForm.reset();
                categoryForm.setData('image', null);
            },
            onFinish: () => {
                categoryForm.transform((data) => data);
            },
        });
    };

    const handleAddSubCategory = (e) => {
        e.preventDefault();
        subCategoryForm.post(route('admin.categories.sub-categories.store', selectedCategory.id), {
            onSuccess: () => {
                setIsAddSubCategoryOpen(false);
                subCategoryForm.reset();
                setSelectedCategory(null);
            }
        });
    };

    const handleDeleteCategory = (categoryId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            categoryForm.delete(route('admin.categories.destroy', categoryId));
        }
    };

    return (
        <AdminLayout theme={theme} toggleTheme={toggleTheme}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Catégories</h1>
                    <Button
                        onClick={() => setIsAddCategoryOpen(true)}
                        className="bg-[#DB8B89] text-white hover:bg-[#C07573]"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter une catégorie
                    </Button>
                </div>

                {/* Categories List */}
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400 font-medium border-b border-gray-200 dark:border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4">Nom</th>
                                    <th className="px-6 py-4">Sous-catégories</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                {categories.map((category) => (
                                    <React.Fragment key={category.id}>
                                        <tr className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleCategory(category.id)}
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        {expandedCategories.has(category.id) ? (
                                                            <ChevronDown className="w-4 h-4" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    {category.image_path && (
                                                        <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 dark:border-zinc-700">
                                                            <img
                                                                src={`/storage/${category.image_path}`}
                                                                alt={getTranslated(category, 'name')}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {getTranslated(category, 'name')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                {category.sub_categories?.length || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                                    }`}>
                                                    {category.active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCategory(category);
                                                            setIsAddSubCategoryOpen(true);
                                                        }}
                                                        className="px-3 py-1.5 text-xs font-medium text-[#DB8B89] hover:bg-pink-50 dark:hover:bg-pink-900/10 rounded-md transition-colors"
                                                    >
                                                        + Sous-catégorie
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-[#DB8B89] dark:hover:text-[#DB8B89] transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Subcategories */}
                                        {expandedCategories.has(category.id) && category.sub_categories?.map((subCategory) => (
                                            <tr key={subCategory.id} className="bg-gray-50/50 dark:bg-zinc-800/20">
                                                <td className="px-6 py-3 pl-16">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        → {getTranslated(subCategory, 'name')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-gray-400 text-sm">-</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subCategory.active
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                                        }`}>
                                                        {subCategory.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right">
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
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Add Category Dialog */}
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Ajouter une catégorie</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddCategory}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nom de la catégorie</label>
                                    <input
                                        type="text"
                                        value={categoryForm.data.name}
                                        onChange={e => categoryForm.setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Ex: Vêtements"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={categoryForm.data.active}
                                        onChange={e => categoryForm.setData('active', e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="active" className="text-sm font-medium">Active</label>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            categoryForm.setData('image', file);
                                        }}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#DB8B89] file:text-white hover:file:bg-[#C07573]"
                                    />
                                    {categoryForm.errors.image && (
                                        <p className="text-xs text-red-500">{categoryForm.errors.image}</p>
                                    )}
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddCategoryOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                                    Sauvegarder
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Add SubCategory Dialog */}
                <Dialog open={isAddSubCategoryOpen} onOpenChange={setIsAddSubCategoryOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Ajouter une sous-catégorie à "{selectedCategory?.name}"</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddSubCategory}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nom de la sous-catégorie</label>
                                    <input
                                        type="text"
                                        value={subCategoryForm.data.name}
                                        onChange={e => subCategoryForm.setData('name', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Ex: T-Shirts"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="sub-active"
                                        checked={subCategoryForm.data.active}
                                        onChange={e => subCategoryForm.setData('active', e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="sub-active" className="text-sm font-medium">Active</label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddSubCategoryOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                                    Sauvegarder
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminCategories;
