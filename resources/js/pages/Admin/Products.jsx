import React, { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AdminLayout from '../../Components/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { getTranslated } from '@/utils/translation';

const AdminProducts = ({ products, categories = [], filters = {}, theme, toggleTheme }) => {
    const [activeTab, setActiveTab] = useState('products');
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [productCategoryId, setProductCategoryId] = useState('');
    const [search, setSearch] = useState(filters.search || '');
    const [filterState, setFilterState] = useState({
        category_id: filters.category_id || '',
        sub_category_id: filters.sub_category_id || '',
        status: filters.status || '',
    });

    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [isSpecificationModalOpen, setIsSpecificationModalOpen] = useState(false);
    const [editingSpecification, setEditingSpecification] = useState(null);

    const allSubCategories = useMemo(() => categories.flatMap((cat) => cat.sub_categories || []), [categories]);

    const subCategoriesForFilters = useMemo(() => {
        if (filterState.category_id) {
            const selected = categories.find((cat) => cat.id == filterState.category_id);
            return selected?.sub_categories || [];
        }
        return allSubCategories;
    }, [categories, allSubCategories, filterState.category_id]);

    const subCategoriesForProduct = useMemo(() => {
        if (productCategoryId) {
            const selected = categories.find((cat) => cat.id == productCategoryId);
            return selected?.sub_categories || [];
        }
        return allSubCategories;
    }, [categories, allSubCategories, productCategoryId]);

    const categoryById = useMemo(() => {
        return categories.reduce((acc, cat) => {
            acc[cat.id] = cat;
            return acc;
        }, {});
    }, [categories]);

    const statusOptions = [
        { value: 'ACTIF', label: 'Actif' },
        { value: 'HORS_STOCK', label: 'Hors stock' },
    ];

    const statusBadge = {
        ACTIF: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        HORS_STOCK: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    const productForm = useForm({
        sub_category_id: '',
        name: { fr: '', ar: '' },
        description: { fr: '', ar: '' },
        price: '',
        stock: '',
        status: 'ACTIF',
        specifications: [],
    });

    const categoryForm = useForm({
        name: { fr: '', ar: '' },
        active: true,
    });

    const subCategoryForm = useForm({
        category_id: '',
        name: { fr: '', ar: '' },
        active: true,
    });

    const specificationForm = useForm({
        sub_category_id: '',
        name: { fr: '', ar: '' },
        required: false,
    });

    const buildSpecValues = (subCategory, product) => {
        if (!subCategory?.specifications) return [];
        const existingValues = new Map(
            (product?.specification_values || []).map((value) => [value.specification_id, value.value])
        );

        return subCategory.specifications.map((spec) => ({
            id: spec.id,
            name: spec.name,
            required: !!spec.required,
            value: existingValues.get(spec.id) ?? '',
        }));
    };

    const cleanPayload = (payload) => {
        const cleaned = {};
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                cleaned[key] = value;
            }
        });
        return cleaned;
    };

    const applyFilters = (overrides = {}) => {
        const payload = cleanPayload({
            ...filterState,
            ...overrides,
            search: search || '',
        });

        router.get(route('admin.products.index'), payload, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const clearFilters = () => {
        setSearch('');
        setFilterState({
            category_id: '',
            sub_category_id: '',
            status: '',
        });
        router.get(route('admin.products.index'), {});
    };

    const ensureBilingual = (value) => {
        if (typeof value === 'object' && value !== null) {
            return { fr: value.fr || '', ar: value.ar || '' };
        }
        return { fr: value || '', ar: '' };
    };

    const openCreateProduct = () => {
        setEditingProduct(null);
        setProductCategoryId('');
        productForm.reset();
        productForm.clearErrors();
        setIsProductModalOpen(true);
    };

    const openEditProduct = (product) => {
        setEditingProduct(product);
        const subCategoryId = product.sub_category_id || product.sub_category?.id || '';
        const categoryId = product.sub_category?.category?.id || '';
        setProductCategoryId(categoryId);

        const subCategory = allSubCategories.find((sub) => sub.id == subCategoryId);
        productForm.setData({
            sub_category_id: subCategoryId,
            name: ensureBilingual(product.name),
            description: ensureBilingual(product.description),
            price: product.price ?? '',
            stock: product.stock ?? '',
            status: product.status || 'ACTIF',
            images: [],
            specifications: buildSpecValues(subCategory, product),
        });
        productForm.clearErrors();
        setIsProductModalOpen(true);
    };

    const handleProductCategoryChange = (value) => {
        setProductCategoryId(value);
        productForm.setData('sub_category_id', '');
        productForm.setData('specifications', []);
    };

    const handleSubCategoryChange = (value) => {
        productForm.setData('sub_category_id', value);
        const subCategory = allSubCategories.find((sub) => sub.id == value);
        productForm.setData('specifications', buildSpecValues(subCategory, editingProduct));
    };

    const handleSpecValueChange = (index, value) => {
        const updated = [...productForm.data.specifications];
        updated[index] = { ...updated[index], value };
        productForm.setData('specifications', updated);
    };

    const submitProduct = (e) => {
        e.preventDefault();

        if (editingProduct) {
            productForm.setData('_method', 'put');
            productForm.post(route('admin.products.update', editingProduct.id), {
                forceFormData: true,
                onSuccess: () => {
                    setIsProductModalOpen(false);
                    setEditingProduct(null);
                    productForm.reset();
                },
                onFinish: () => productForm.setData('_method', undefined),
            });
            return;
        }

        productForm.post(route('admin.products.store'), {
            forceFormData: true,
            onSuccess: () => {
                setIsProductModalOpen(false);
                productForm.reset();
            },
        });
    };

    const deleteProduct = (productId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            router.delete(route('admin.products.destroy', productId));
        }
    };

    const toggleCategory = (categoryId) => {
        const next = new Set(expandedCategories);
        if (next.has(categoryId)) {
            next.delete(categoryId);
        } else {
            next.add(categoryId);
        }
        setExpandedCategories(next);
    };

    const openCreateCategory = () => {
        setEditingCategory(null);
        categoryForm.reset();
        categoryForm.clearErrors();
        setIsCategoryModalOpen(true);
    };

    const openEditCategory = (category) => {
        setEditingCategory(category);
        categoryForm.setData({
            name: ensureBilingual(category.name),
            active: !!category.active,
        });
        categoryForm.clearErrors();
        setIsCategoryModalOpen(true);
    };

    const submitCategory = (e) => {
        e.preventDefault();

        if (editingCategory) {
            categoryForm.put(route('admin.categories.update', editingCategory.id), {
                onSuccess: () => {
                    setIsCategoryModalOpen(false);
                    setEditingCategory(null);
                    categoryForm.reset();
                },
            });
            return;
        }

        categoryForm.post(route('admin.categories.store'), {
            onSuccess: () => {
                setIsCategoryModalOpen(false);
                categoryForm.reset();
            },
        });
    };

    const deleteCategory = (categoryId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
            categoryForm.delete(route('admin.categories.destroy', categoryId));
        }
    };

    const openCreateSubCategory = (category = null) => {
        setEditingSubCategory(null);
        subCategoryForm.reset();
        subCategoryForm.setData('category_id', category?.id || '');
        subCategoryForm.clearErrors();
        setIsSubCategoryModalOpen(true);
    };

    const openEditSubCategory = (subCategory) => {
        setEditingSubCategory(subCategory);
        subCategoryForm.setData({
            category_id: subCategory.category_id || '',
            name: ensureBilingual(subCategory.name),
            active: !!subCategory.active,
        });
        subCategoryForm.clearErrors();
        setIsSubCategoryModalOpen(true);
    };

    const submitSubCategory = (e) => {
        e.preventDefault();

        if (editingSubCategory) {
            subCategoryForm.patch(route('admin.sub-categories.update', editingSubCategory.id), {
                onSuccess: () => {
                    setIsSubCategoryModalOpen(false);
                    setEditingSubCategory(null);
                    subCategoryForm.reset();
                },
            });
            return;
        }

        if (!subCategoryForm.data.category_id) {
            subCategoryForm.setError('category_id', 'Sélectionnez une catégorie.');
            return;
        }

        subCategoryForm.post(route('admin.categories.sub-categories.store', subCategoryForm.data.category_id), {
            onSuccess: () => {
                setIsSubCategoryModalOpen(false);
                subCategoryForm.reset();
            },
        });
    };

    const deleteSubCategory = (subCategoryId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette sous-catégorie ?')) {
            router.delete(route('admin.sub-categories.destroy', subCategoryId));
        }
    };

    const allSpecifications = useMemo(() => {
        return allSubCategories.flatMap((subCategory) => {
            return (subCategory.specifications || []).map((spec) => ({
                ...spec,
                sub_category: subCategory,
            }));
        });
    }, [allSubCategories]);

    const openCreateSpecification = () => {
        setEditingSpecification(null);
        specificationForm.reset();
        specificationForm.clearErrors();
        setIsSpecificationModalOpen(true);
    };

    const openEditSpecification = (specification) => {
        setEditingSpecification(specification);
        specificationForm.setData({
            sub_category_id: specification.sub_category_id || '',
            name: ensureBilingual(specification.name),
            required: !!specification.required,
        });
        specificationForm.clearErrors();
        setIsSpecificationModalOpen(true);
    };

    const submitSpecification = (e) => {
        e.preventDefault();

        if (editingSpecification) {
            specificationForm.patch(route('admin.specifications.update', editingSpecification.id), {
                onSuccess: () => {
                    setIsSpecificationModalOpen(false);
                    setEditingSpecification(null);
                    specificationForm.reset();
                },
            });
            return;
        }

        specificationForm.post(route('admin.specifications.store'), {
            onSuccess: () => {
                setIsSpecificationModalOpen(false);
                specificationForm.reset();
            },
        });
    };

    const deleteSpecification = (specificationId) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette spécification ?')) {
            router.delete(route('admin.specifications.destroy', specificationId));
        }
    };

    const tabs = [
        { id: 'products', label: 'Produits' },
        { id: 'categories', label: 'Catégories' },
        { id: 'subcategories', label: 'Sous-catégories' },
        { id: 'specifications', label: 'Spécifications' },
    ];

    return (
        <AdminLayout theme={theme} toggleTheme={toggleTheme}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Gestion des Produits</h1>
                    <Button onClick={openCreateProduct} className="bg-[#DB8B89] text-white hover:bg-[#C07573] dark:bg-[#DB8B89] dark:text-white dark:hover:bg-[#C07573]">
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

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <form onSubmit={handleSearch} className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher un produit..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#DB8B89]/20 focus:border-[#DB8B89]"
                                />
                            </form>
                            <button
                                type="button"
                                onClick={() => setIsFilterOpen(true)}
                                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filtres</span>
                            </button>
                            <Button type="button" onClick={handleSearch} className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                                Appliquer
                            </Button>
                        </div>

                        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Filtres produits</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Catégorie</label>
                                        <select
                                            value={filterState.category_id}
                                            onChange={(e) =>
                                                setFilterState((prev) => ({
                                                    ...prev,
                                                    category_id: e.target.value,
                                                    sub_category_id: '',
                                                }))
                                            }
                                            className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        >
                                            <option value="">Toutes</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Sous-catégorie</label>
                                        <select
                                            value={filterState.sub_category_id}
                                            onChange={(e) => setFilterState((prev) => ({ ...prev, sub_category_id: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        >
                                            <option value="">Toutes</option>
                                            {subCategoriesForFilters.map((subCategory) => (
                                                <option key={subCategory.id} value={subCategory.id}>{subCategory.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Statut</label>
                                        <select
                                            value={filterState.status}
                                            onChange={(e) => setFilterState((prev) => ({ ...prev, status: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        >
                                            <option value="">Tous</option>
                                            {statusOptions.map((option) => (
                                                <option key={option.value} value={option.value}>{option.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <DialogFooter className="flex items-center justify-between">
                                    <Button type="button" variant="outline" onClick={clearFilters}>Réinitialiser</Button>
                                    <Button
                                        type="button"
                                        className="bg-[#DB8B89] text-white hover:bg-[#C07573]"
                                        onClick={() => {
                                            applyFilters();
                                            setIsFilterOpen(false);
                                        }}
                                    >
                                        Appliquer
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

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
                                        {products?.data?.length ? products.data.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{getTranslated(product, 'name')}</td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                                    {getTranslated(product.sub_category?.category, 'name') || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">{Number(product.price).toLocaleString()} DA</td>
                                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{product.stock}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[product.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'}`}>
                                                        {statusOptions.find((option) => option.value === product.status)?.label || product.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditProduct(product)}
                                                            className="p-2 text-gray-400 hover:text-[#DB8B89] dark:hover:text-[#DB8B89] transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteProduct(product.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                                    Aucun produit trouvé.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {products?.links && products.links.length > 3 && (
                            <div className="flex flex-wrap gap-2 justify-center">
                                {products.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-4 py-2 rounded-lg border transition-all ${link.active
                                            ? 'bg-[#DB8B89] text-white border-[#DB8B89]'
                                            : 'bg-white text-gray-600 hover:border-[#DB8B89] dark:bg-zinc-900 dark:text-gray-200'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        preserveState
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === 'categories' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={openCreateCategory} className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter Catégorie
                            </Button>
                        </div>
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
                                                                type="button"
                                                            >
                                                                {expandedCategories.has(category.id) ? '▾' : '▸'}
                                                            </button>
                                                            <span className="font-medium text-gray-900 dark:text-gray-100">{getTranslated(category, 'name')}</span>
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
                                                                onClick={() => openCreateSubCategory(category)}
                                                                className="px-3 py-1.5 text-xs font-medium text-[#DB8B89] hover:bg-pink-50 dark:hover:bg-pink-900/10 rounded-md transition-colors"
                                                            >
                                                                + Sous-catégorie
                                                            </button>
                                                            <button
                                                                onClick={() => openEditCategory(category)}
                                                                className="p-2 text-gray-400 hover:text-[#DB8B89] dark:hover:text-[#DB8B89] transition-colors"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteCategory(category.id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expandedCategories.has(category.id) && category.sub_categories?.map((subCategory) => (
                                                    <tr key={subCategory.id} className="bg-gray-50/50 dark:bg-zinc-800/20">
                                                        <td className="px-6 py-3 pl-16 text-sm text-gray-600 dark:text-gray-400">
                                                            → {getTranslated(subCategory, 'name')}
                                                        </td>
                                                        <td className="px-6 py-3 text-gray-400 text-sm">—</td>
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
                                                                <button
                                                                    onClick={() => openEditSubCategory(subCategory)}
                                                                    className="p-2 text-gray-400 hover:text-[#DB8B89] dark:hover:text-[#DB8B89] transition-colors"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteSubCategory(subCategory.id)}
                                                                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                                >
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
                    </div>
                )}

                {/* Subcategories Tab */}
                {activeTab === 'subcategories' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={() => openCreateSubCategory()} className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter Sous-catégorie
                            </Button>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-4">Nom</th>
                                            <th className="px-6 py-4">Catégorie parente</th>
                                            <th className="px-6 py-4">Statut</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                        {allSubCategories.length ? allSubCategories.map((subCategory) => (
                                            <tr key={subCategory.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                                <td className="px-6 py-4 font-medium dark:text-gray-100">{subCategory.name}</td>
                                                <td className="px-6 py-4 dark:text-gray-400">
                                                    {categoryById[subCategory.category_id]?.name || '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${subCategory.active
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                                        }`}>
                                                        {subCategory.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditSubCategory(subCategory)}
                                                            className="p-2 text-gray-400 hover:text-[#DB8B89]"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteSubCategory(subCategory.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                                    Aucune sous-catégorie disponible.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Specifications Tab */}
                {activeTab === 'specifications' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Button onClick={openCreateSpecification} className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter Spécification
                            </Button>
                        </div>
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400">
                                        <tr>
                                            <th className="px-6 py-4">Nom</th>
                                            <th className="px-6 py-4">Sous-catégorie</th>
                                            <th className="px-6 py-4">Obligatoire</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                                        {allSpecifications.length ? allSpecifications.map((spec) => (
                                            <tr key={spec.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                                                <td className="px-6 py-4 font-medium dark:text-gray-100">{getTranslated(spec, 'name')}</td>
                                                <td className="px-6 py-4 dark:text-gray-400">{getTranslated(spec.sub_category, 'name') || '—'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${spec.required
                                                        ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-[#DB8B89]'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                                        }`}>
                                                        {spec.required ? 'Oui' : 'Non'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditSpecification(spec)}
                                                            className="p-2 text-gray-400 hover:text-[#DB8B89]"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteSpecification(spec.id)}
                                                            className="p-2 text-gray-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                                    Aucune spécification disponible.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Product Modal */}
                <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitProduct} className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nom (FR)</label>
                                    <input
                                        value={productForm.data.name.fr}
                                        onChange={(e) => productForm.setData('name', { ...productForm.data.name, fr: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Nom en français"
                                        required
                                    />
                                    {productForm.errors['name.fr'] && <p className="text-xs text-red-500">{productForm.errors['name.fr']}</p>}
                                </div>
                                <div className="space-y-2" dir="rtl">
                                    <label className="text-sm font-medium">الاسم (AR)</label>
                                    <input
                                        value={productForm.data.name.ar}
                                        onChange={(e) => productForm.setData('name', { ...productForm.data.name, ar: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-right"
                                        placeholder="الاسم بالعربية"
                                    />
                                    {productForm.errors['name.ar'] && <p className="text-xs text-red-500">{productForm.errors['name.ar']}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Catégorie</label>
                                    <select
                                        value={productCategoryId}
                                        onChange={(e) => handleProductCategoryChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                    >
                                        <option value="">Toutes</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{getTranslated(category, 'name')}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Sous-catégorie</label>
                                    <select
                                        value={productForm.data.sub_category_id}
                                        onChange={(e) => handleSubCategoryChange(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        required
                                    >
                                        <option value="">Sélectionner...</option>
                                        {subCategoriesForProduct.map((subCategory) => (
                                            <option key={subCategory.id} value={subCategory.id}>{getTranslated(subCategory, 'name')}</option>
                                        ))}
                                    </select>
                                    {productForm.errors.sub_category_id && <p className="text-xs text-red-500">{productForm.errors.sub_category_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Statut</label>
                                    <select
                                        value={productForm.data.status}
                                        onChange={(e) => productForm.setData('status', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        required
                                    >
                                        {statusOptions.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    {productForm.errors.status && <p className="text-xs text-red-500">{productForm.errors.status}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Prix (DA)</label>
                                    <input
                                        type="number"
                                        value={productForm.data.price}
                                        onChange={(e) => productForm.setData('price', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                    {productForm.errors.price && <p className="text-xs text-red-500">{productForm.errors.price}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Stock</label>
                                    <input
                                        type="number"
                                        value={productForm.data.stock}
                                        onChange={(e) => productForm.setData('stock', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="0"
                                        min="0"
                                        required
                                    />
                                    {productForm.errors.stock && <p className="text-xs text-red-500">{productForm.errors.stock}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description (FR)</label>
                                    <textarea
                                        value={productForm.data.description.fr}
                                        onChange={(e) => productForm.setData('description', { ...productForm.data.description, fr: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 min-h-[100px]"
                                        placeholder="Description en français..."
                                    />
                                    {productForm.errors['description.fr'] && <p className="text-xs text-red-500">{productForm.errors['description.fr']}</p>}
                                </div>
                                <div className="space-y-2" dir="rtl">
                                    <label className="text-sm font-medium text-right block">الوصف (AR)</label>
                                    <textarea
                                        value={productForm.data.description.ar}
                                        onChange={(e) => productForm.setData('description', { ...productForm.data.description, ar: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 min-h-[100px] text-right"
                                        placeholder="الوصف بالعربية..."
                                    />
                                    {productForm.errors['description.ar'] && <p className="text-xs text-red-500">{productForm.errors['description.ar']}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Images</label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            productForm.setData('images', e.target.files);
                                        }
                                    }}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#DB8B89] file:text-white hover:file:bg-[#C07573]"
                                />
                                {(productForm.errors.images || productForm.errors['images.0']) && (
                                    <div className="space-y-1">
                                        {productForm.errors.images && (
                                            <p className="text-xs text-red-500">{productForm.errors.images}</p>
                                        )}
                                        {Object.entries(productForm.errors)
                                            .filter(([key]) => key.startsWith('images.'))
                                            .map(([key, message]) => (
                                                <p key={key} className="text-xs text-red-500">{message}</p>
                                            ))}
                                    </div>
                                )}
                                {editingProduct?.images?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {editingProduct.images.map((img) => (
                                            <div key={img.id} className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-zinc-700">
                                                <img src={`/storage/${img.image_path}`} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Spécifications</label>
                                {productForm.data.specifications.length ? (
                                    <div className="grid gap-3">
                                        {productForm.data.specifications.map((spec, index) => (
                                            <div key={spec.id} className="space-y-1">
                                                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {spec.name}{spec.required ? ' *' : ''}
                                                </label>
                                                <input
                                                    value={spec.value}
                                                    onChange={(e) => handleSpecValueChange(index, e.target.value)}
                                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                                    placeholder="Valeur"
                                                />
                                                {productForm.errors[`specifications.${index}.value`] && (
                                                    <p className="text-xs text-red-500">{productForm.errors[`specifications.${index}.value`]}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">Aucune spécification pour cette sous-catégorie.</p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsProductModalOpen(false)}>Annuler</Button>
                                <Button type="submit" className="bg-[#DB8B89] text-white hover:bg-[#C07573]" disabled={productForm.processing}>
                                    {editingProduct ? 'Mettre à jour' : 'Sauvegarder'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Category Modal */}
                <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                    <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitCategory}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nom (FR)</label>
                                    <input
                                        type="text"
                                        value={categoryForm.data.name.fr}
                                        onChange={(e) => categoryForm.setData('name', { ...categoryForm.data.name, fr: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Nom en français"
                                        required
                                    />
                                    {categoryForm.errors['name.fr'] && <p className="text-xs text-red-500">{categoryForm.errors['name.fr']}</p>}
                                </div>
                                <div className="space-y-2" dir="rtl">
                                    <label className="text-sm font-medium text-right block">الاسم (AR)</label>
                                    <input
                                        type="text"
                                        value={categoryForm.data.name.ar}
                                        onChange={(e) => categoryForm.setData('name', { ...categoryForm.data.name, ar: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-right"
                                        placeholder="الاسم بالعربية"
                                    />
                                    {categoryForm.errors['name.ar'] && <p className="text-xs text-red-500">{categoryForm.errors['name.ar']}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="category-active"
                                        checked={categoryForm.data.active}
                                        onChange={(e) => categoryForm.setData('active', e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="category-active" className="text-sm font-medium">Active</label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                                    {editingCategory ? 'Mettre à jour' : 'Sauvegarder'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* SubCategory Modal */}
                <Dialog open={isSubCategoryModalOpen} onOpenChange={setIsSubCategoryModalOpen}>
                    <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingSubCategory ? 'Modifier la sous-catégorie' : 'Ajouter une sous-catégorie'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitSubCategory}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Catégorie parente</label>
                                    <select
                                        value={subCategoryForm.data.category_id}
                                        onChange={(e) => subCategoryForm.setData('category_id', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        disabled={!!editingSubCategory}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>{getTranslated(category, 'name')}</option>
                                        ))}
                                    </select>
                                    {subCategoryForm.errors.category_id && <p className="text-xs text-red-500">{subCategoryForm.errors.category_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nom (FR)</label>
                                    <input
                                        type="text"
                                        value={subCategoryForm.data.name.fr}
                                        onChange={(e) => subCategoryForm.setData('name', { ...subCategoryForm.data.name, fr: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Nom en français"
                                        required
                                    />
                                    {subCategoryForm.errors['name.fr'] && <p className="text-xs text-red-500">{subCategoryForm.errors['name.fr']}</p>}
                                </div>
                                <div className="space-y-2" dir="rtl">
                                    <label className="text-sm font-medium text-right block">الاسم (AR)</label>
                                    <input
                                        type="text"
                                        value={subCategoryForm.data.name.ar}
                                        onChange={(e) => subCategoryForm.setData('name', { ...subCategoryForm.data.name, ar: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-right"
                                        placeholder="الاسم بالعربية"
                                    />
                                    {subCategoryForm.errors['name.ar'] && <p className="text-xs text-red-500">{subCategoryForm.errors['name.ar']}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="sub-active"
                                        checked={subCategoryForm.data.active}
                                        onChange={(e) => subCategoryForm.setData('active', e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="sub-active" className="text-sm font-medium">Active</label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsSubCategoryModalOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                                    {editingSubCategory ? 'Mettre à jour' : 'Sauvegarder'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Specification Modal */}
                <Dialog open={isSpecificationModalOpen} onOpenChange={setIsSpecificationModalOpen}>
                    <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingSpecification ? 'Modifier la spécification' : 'Ajouter une spécification'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={submitSpecification}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Sous-catégorie</label>
                                    <select
                                        value={specificationForm.data.sub_category_id}
                                        onChange={(e) => specificationForm.setData('sub_category_id', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        disabled={!!editingSpecification}
                                        required
                                    >
                                        <option value="">Sélectionner...</option>
                                        {allSubCategories.map((subCategory) => (
                                            <option key={subCategory.id} value={subCategory.id}>{getTranslated(subCategory, 'name')}</option>
                                        ))}
                                    </select>
                                    {specificationForm.errors.sub_category_id && <p className="text-xs text-red-500">{specificationForm.errors.sub_category_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nom (FR)</label>
                                    <input
                                        type="text"
                                        value={specificationForm.data.name.fr}
                                        onChange={(e) => specificationForm.setData('name', { ...specificationForm.data.name, fr: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        placeholder="Nom en français"
                                        required
                                    />
                                    {specificationForm.errors['name.fr'] && <p className="text-xs text-red-500">{specificationForm.errors['name.fr']}</p>}
                                </div>
                                <div className="space-y-2" dir="rtl">
                                    <label className="text-sm font-medium text-right block">الاسم (AR)</label>
                                    <input
                                        type="text"
                                        value={specificationForm.data.name.ar}
                                        onChange={(e) => specificationForm.setData('name', { ...specificationForm.data.name, ar: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 text-right"
                                        placeholder="الاسم بالعربية"
                                    />
                                    {specificationForm.errors['name.ar'] && <p className="text-xs text-red-500">{specificationForm.errors['name.ar']}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="spec-required"
                                        checked={specificationForm.data.required}
                                        onChange={(e) => specificationForm.setData('required', e.target.checked)}
                                        className="rounded"
                                    />
                                    <label htmlFor="spec-required" className="text-sm font-medium">Obligatoire</label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsSpecificationModalOpen(false)}>
                                    Annuler
                                </Button>
                                <Button type="submit" className="bg-[#DB8B89] text-white hover:bg-[#C07573]">
                                    {editingSpecification ? 'Mettre à jour' : 'Sauvegarder'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
};

export default AdminProducts;
