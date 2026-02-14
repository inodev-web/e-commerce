import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Share2, Users, Copy, Check } from 'lucide-react';
import { getLabel } from '@/utils/i18n';

export default function Referral({ auth, referral_code, referrals }) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referral_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Parrainage</h2>}
        >
            <Head title="Parrainage" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Code Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 text-center">
                        <div className="mb-4">
                            <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                <Share2 className="text-green-600 w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">{getLabel('referral_invite', 'Invitez vos amis & Gagnez !')}</h3>
                            <p className="text-gray-500 mt-2">{getLabel('referral_share', 'Partagez votre code unique et recevez des points.')}</p>
                        </div>

                        <div className="flex justify-center items-center gap-4 mt-6">
                            <div className="bg-gray-100 px-8 py-4 rounded-xl text-2xl font-mono tracking-widest font-bold text-gray-800 border-2 border-dashed border-gray-300">
                                {referral_code || getLabel('referral_generation', 'GÃ‰NÃ‰RATION...')}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-xl transition-colors flex items-center gap-2 font-bold"
                            >
                                {copied ? <Check size={24} /> : <Copy size={24} />}
                                {copied ? getLabel('referral_copied', 'CopiÃ© !') : getLabel('referral_copy', 'Copier')}
                            </button>
                        </div>
                    </div>

                    {/* Referrals List */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="text-gray-400" />
                            <h3 className="text-lg font-bold text-gray-900">{getLabel('referral_friends', 'Vos amis parrainÃ©s')} ({referrals.length})</h3>
                        </div>

                        {referrals.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getLabel('referral_name', 'Nom')}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getLabel('referral_date', "Date d'inscription")}</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{getLabel('referral_status', 'Statut')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {referrals.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.joined_at}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {getLabel('referral_active', 'Actif')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-400 italic">
                                {getLabel('referral_none', "Vous n'avez parrainÃ© personne pour le moment.")}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
