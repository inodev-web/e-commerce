import React, { useState } from 'react';
import { Save, Globe, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from "@/Components/ui/button";
import AdminLayout from '../../components/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const AdminSettings = ({ auth, pixelSettings }) => {
    const { t } = useTranslation();

    // Transform incoming array into a workable state if it's not already
    const getInitialPixels = () => {
        if (Array.isArray(pixelSettings) && pixelSettings.length > 0) {
            return pixelSettings.map(p => ({
                id: p.id,
                platform: p.platform || 'facebook',
                pixel_id: p.pixel_id || '',
                name: p.name || '',
                is_active: !!p.is_active
            }));
        }
        return [{ platform: 'facebook', pixel_id: '', name: '', is_active: true }];
    };

    const { data, setData, put, processing, errors } = useForm({
        pixels: getInitialPixels()
    });

    const platforms = [
        { id: 'facebook', name: 'Meta (Facebook)', color: 'bg-blue-500' },
        { id: 'google', name: 'Google Analytics', color: 'bg-orange-500' },
        { id: 'tiktok', name: 'TikTok', color: 'bg-black' },
        { id: 'snapchat', name: 'Snapchat', color: 'bg-yellow-400' },
    ];

    const addPixel = () => {
        setData('pixels', [
            ...(data.pixels || []),
            { platform: 'facebook', pixel_id: '', name: '', is_active: true }
        ]);
    };

    const removePixel = (index) => {
        const newPixels = [...(data.pixels || [])];
        newPixels.splice(index, 1);
        setData('pixels', newPixels);
    };

    const updatePixel = (index, field, value) => {
        const newPixels = [...(data.pixels || [])];
        if (newPixels[index]) {
            newPixels[index][field] = value;
            setData('pixels', newPixels);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.settings.pixel.update'), {
            onSuccess: () => toast.success('Paramé¨tres des pixels mis é  jour.'),
        });
    };

    return (
        <AdminLayout user={auth.user}>
            <Head title="Paramé¨tres des Pixels" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Pixels de Tracking</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Gé©rez plusieurs IDs pour Meta, Google, TikTok et Snapchat.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4">
                        {(data.pixels || []).map((pixel, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-top-2"
                            >
                                <div className="w-full md:w-1/4 space-y-2">
                                    <label htmlFor={`platform-${index}`} className="text-xs font-bold uppercase text-gray-400">Plateforme</label>
                                    <select
                                        id={`platform-${index}`}
                                        name={`pixels[${index}][platform]`}
                                        value={pixel.platform}
                                        onChange={e => updatePixel(index, 'platform', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:border-[#DB8B89] focus:ring-1 focus:ring-[#DB8B89]"
                                    >
                                        {platforms.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-full md:flex-1 space-y-2">
                                    <label htmlFor={`pixel-id-${index}`} className="text-xs font-bold uppercase text-gray-400">ID du Pixel</label>
                                    <input
                                        id={`pixel-id-${index}`}
                                        name={`pixels[${index}][pixel_id]`}
                                        type="text"
                                        placeholder="ID du Pixel"
                                        value={pixel.pixel_id}
                                        onChange={e => updatePixel(index, 'pixel_id', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded-md dark:bg-zinc-800 dark:border-zinc-700 font-mono focus:border-[#DB8B89] focus:ring-1 focus:ring-[#DB8B89]"
                                        required
                                    />
                                    {errors[`pixels.${index}.pixel_id`] && <p className="text-red-500 text-xs mt-1">{errors[`pixels.${index}.pixel_id`]}</p>}
                                </div>

                                <div className="w-full md:w-1/5 space-y-2">
                                    <label htmlFor={`name-${index}`} className="text-xs font-bold uppercase text-gray-400">Nom (Optionnel)</label>
                                    <input
                                        id={`name-${index}`}
                                        name={`pixels[${index}][name]`}
                                        type="text"
                                        placeholder="Label"
                                        value={pixel.name}
                                        onChange={e => updatePixel(index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:border-[#DB8B89] focus:ring-1 focus:ring-[#DB8B89]"
                                    />
                                </div>

                                <div className="flex gap-2 items-center h-10">
                                    <button
                                        type="button"
                                        onClick={() => updatePixel(index, 'is_active', !pixel.is_active)}
                                        className={`p-2 rounded-lg transition-colors ${pixel.is_active ? 'text-green-500 bg-green-50 dark:bg-green-500/10' : 'text-gray-400 bg-gray-50 dark:bg-zinc-800'}`}
                                        title={pixel.is_active ? 'Actif' : 'Inactif'}
                                    >
                                        {pixel.is_active ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => removePixel(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addPixel}
                            className="border-dashed border-2 hover:border-[#DB8B89] hover:text-[#DB8B89]"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter un Pixel
                        </Button>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-[#DB8B89] text-white hover:bg-[#C07573]"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? t('common.saving', 'Sauvegarde...') : t('common.save', 'Enregistrer les modifications')}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminSettings;
