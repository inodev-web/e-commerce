import React, { useState } from 'react';
import { ShoppingCart, User, Gift, Award, Copy } from 'lucide-react';

export default function UserProfile() {
    const [activeTab, setActiveTab] = useState('personal');

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
            {/* Profile Header */}
            <div className="bg-white dark:bg-neutral-900 border-b dark:border-neutral-800 transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <div className="relative inline-block mb-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                            <User size={48} className="text-white" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-7 h-7 bg-teal-700 rounded-full flex items-center justify-center border-2 border-white dark:border-neutral-900">
                            <Award size={14} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Marie Dupont</h1>
                    <div className="flex items-center justify-center gap-2">
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-500 px-3 py-1 rounded text-xs font-semibold border border-amber-200 dark:border-amber-800">GOLD MEMBER</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">• Member since 2021</span>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex gap-1 border-b dark:border-neutral-800 overflow-x-auto no-scrollbar">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'personal'
                                    ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Personal Info
                        </button>
                        <button
                            onClick={() => setActiveTab('loyalty')}
                            className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'loyalty'
                                    ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Loyalty & Points
                        </button>
                        <button
                            onClick={() => setActiveTab('promo')}
                            className={`flex-1 min-w-[120px] px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'promo'
                                    ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Promo Codes
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {activeTab === 'personal' && (
                    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 transition-colors duration-300">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                            <div>
                                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <User className="text-blue-600 dark:text-blue-400" size={24} />
                                    Personal Information
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your personal details and contact preferences.</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium border dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
                                    Cancel
                                </button>
                                <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Marie"
                                        className="w-full px-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Dupont"
                                        className="w-full px-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue="marie.dupont@example.com"
                                        className="w-full px-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        defaultValue="+33 6 12 34 56 78"
                                        className="w-full px-4 py-2 border dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-neutral-950 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'loyalty' && (
                    <div className="space-y-6">
                        {/* Loyalty Score Card */}
                        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 transition-colors duration-300">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                <div className="flex-1 w-full">
                                    <h2 className="text-xl font-semibold flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
                                        <Award className="text-blue-600 dark:text-blue-400" size={24} />
                                        Loyalty Score
                                    </h2>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-5xl font-bold text-gray-900 dark:text-white">450</span>
                                        <span className="text-gray-500 dark:text-gray-400">points</span>
                                    </div>
                                    <div className="mb-2">
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">Gold Tier</span>
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">50 pts to Platinum</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2">
                                            <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: '90%' }}></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">Earn 1 point for every $1 spent on beauty products.</p>
                                </div>

                                {/* Next Reward Card */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 w-full md:w-64 border border-blue-100 dark:border-blue-800/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Gift className="text-blue-600 dark:text-blue-400" size={20} />
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Next Reward</h3>
                                    </div>
                                    <p className="text-sm text-gray-900 dark:text-gray-200 font-medium mb-1">Unlock a Free Shipping Voucher</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">when you reach 500 points.</p>
                                    <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                        View All Rewards
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'promo' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm p-6 transition-colors duration-300">
                            <h2 className="text-xl font-semibold flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
                                <Gift className="text-gray-600 dark:text-gray-400" size={24} />
                                Active Promo Codes
                            </h2>

                            <div className="space-y-4">
                                {/* Personal Promo Code */}
                                <div className="border dark:border-neutral-700 rounded-lg p-4 dark:bg-neutral-800/50">
                                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded text-xs font-semibold border border-blue-200 dark:border-blue-800">PERSONAL</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">Expires Dec 31</span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">10% Off Your Next Order</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Valid on all non-prescription items in your cart.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-950 rounded px-4 py-2 border dark:border-neutral-800">
                                        <code className="flex-1 font-mono text-sm font-semibold text-gray-900 dark:text-white">SAVE10</code>
                                        <button
                                            onClick={() => copyToClipboard('SAVE10')}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors"
                                            aria-label="Copy code"
                                        >
                                            <Copy size={16} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Referral Promo Code */}
                                <div className="border dark:border-neutral-700 rounded-lg p-4 dark:bg-neutral-800/50">
                                    <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold border border-green-200 dark:border-green-800">REFERRAL</span>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Give 20%, Get 20%</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Share this code with friends. They save, you earn points.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-neutral-950 rounded px-4 py-2 border dark:border-neutral-800">
                                        <code className="flex-1 font-mono text-sm font-semibold text-gray-900 dark:text-white">MARIE20</code>
                                        <button
                                            onClick={() => copyToClipboard('MARIE20')}
                                            className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded transition-colors"
                                            aria-label="Copy code"
                                        >
                                            <Copy size={16} className="text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
