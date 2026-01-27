import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Play, Phone } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        password: '',
        password_confirmation: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isLogin) {
            post(route('login'), {
                onFinish: () => reset('password'),
            });
        } else {
            post(route('register'), {
                onFinish: () => reset('password', 'password_confirmation'),
            });
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        reset();
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-gray-900 lg:bg-gray-900 font-sans transition-colors duration-300 relative">

            {/* LEFT COLUMN / BACKGROUND - Image Section */}
            <div className="fixed inset-0 lg:static lg:w-1/2 h-full w-full z-0 lg:z-auto overflow-hidden">
                <div className="absolute inset-0 bg-gray-900">
                    <img
                        src="/authBg.png"
                        alt="Background"
                        className="w-full h-full object-cover opacity-90"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-black/60 lg:bg-gradient-to-t lg:from-black/80 lg:via-black/20 lg:to-black/30" />
                </div>

                {/* Content over image */}
                <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-between text-white z-10 pointer-events-none lg:pointer-events-auto">
                    {/* Logo area */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                        <span className="text-xl font-semibold tracking-wide">Puréva</span>
                    </div>

                    <div className="hidden lg:block mb-12">
                        <h1 className="text-5xl font-bold leading-tight mb-4">
                            Trouvez Vos <br /> Essentiels Santé
                        </h1>
                        <p className="text-gray-300 text-base max-w-md mb-8">
                            Accédez à une large gamme de produits parapharmaceutiques de qualité. Livraison rapide et conseils d'experts.
                        </p>

                        {/* Slider Dots */}
                        <div className="flex gap-2">
                            <div className="w-8 h-1.5 bg-white rounded-full"></div>
                            <div className="w-2 h-1.5 bg-white/40 rounded-full"></div>
                            <div className="w-2 h-1.5 bg-white/40 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN - Form Section */}
            <div className="relative z-10 w-full lg:w-1/2 flex flex-col min-h-screen lg:min-h-0 lg:h-auto items-center justify-center p-4 lg:p-8 lg:bg-white lg:dark:bg-neutral-950 lg:rounded-l-[30px] lg:order-2">

                {/* Top Right Button */}
                <div className="absolute top-6 right-6 lg:top-10 lg:right-10">
                    <button
                        onClick={toggleMode}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 lg:bg-black lg:text-white lg:hover:bg-gray-800 lg:border-transparent dark:lg:bg-white dark:lg:text-black px-6 py-2.5 rounded-full text-sm font-medium transition-all"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>

                {/* Form Container */}
                <div className="w-full max-w-md lg:max-w-xl px-6 py-10 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl lg:bg-transparent lg:backdrop-blur-none lg:border-none lg:shadow-none lg:px-12 lg:py-8 flex flex-col justify-center overflow-y-auto max-h-screen">

                    <div className="mb-6 lg:mb-8 text-center lg:text-left">
                        <h2 className="text-3xl lg:text-4xl font-bold text-white lg:text-gray-900 lg:dark:text-white mb-2">
                            {isLogin ? 'Welcome Back!' : 'Create Account'}
                        </h2>
                        <p className="text-gray-200 lg:text-gray-500 lg:dark:text-gray-400">
                            {isLogin ? 'Sign in to access your account' : 'Register to get started'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">

                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-200 lg:text-gray-700 lg:dark:text-gray-300">Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Full Name"
                                    className="w-full px-4 py-3 border border-white/20 lg:border-gray-300 lg:dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-white lg:focus:ring-gray-900 lg:dark:focus:ring-white focus:border-transparent outline-none transition-all bg-white/10 lg:bg-white lg:dark:bg-neutral-900 text-white lg:text-gray-900 lg:dark:text-white placeholder-gray-400 lg:placeholder-gray-400"
                                    required
                                />
                                {errors.name && <div className="text-red-400 lg:text-red-500 text-xs mt-1">{errors.name}</div>}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-200 lg:text-gray-700 lg:dark:text-gray-300">Phone Number</label>
                            <input
                                type="tel"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                placeholder="05XXXXXXXX"
                                className="w-full px-4 py-3 border border-white/20 lg:border-gray-300 lg:dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-white lg:focus:ring-gray-900 lg:dark:focus:ring-white focus:border-transparent outline-none transition-all bg-white/10 lg:bg-white lg:dark:bg-neutral-900 text-white lg:text-gray-900 lg:dark:text-white placeholder-gray-400 lg:placeholder-gray-400"
                                required
                            />
                            {errors.phone && <div className="text-red-400 lg:text-red-500 text-xs mt-1">{errors.phone}</div>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-200 lg:text-gray-700 lg:dark:text-gray-300">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-white/20 lg:border-gray-300 lg:dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-white lg:focus:ring-gray-900 lg:dark:focus:ring-white focus:border-transparent outline-none transition-all bg-white/10 lg:bg-white lg:dark:bg-neutral-900 text-white lg:text-gray-900 lg:dark:text-white placeholder-gray-400 lg:placeholder-gray-400 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white lg:hover:text-gray-600 lg:dark:hover:text-gray-200"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.password && <div className="text-red-400 lg:text-red-500 text-xs mt-1">{errors.password}</div>}
                        </div>

                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-200 lg:text-gray-700 lg:dark:text-gray-300">Confirm Password</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-3 border border-white/20 lg:border-gray-300 lg:dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-white lg:focus:ring-gray-900 lg:dark:focus:ring-white focus:border-transparent outline-none transition-all bg-white/10 lg:bg-white lg:dark:bg-neutral-900 text-white lg:text-gray-900 lg:dark:text-white placeholder-gray-400 lg:placeholder-gray-400"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-500 lg:text-black focus:ring-offset-0 focus:ring-2 focus:ring-blue-500 lg:focus:ring-black"
                                />
                                <span className="text-gray-200 lg:text-gray-600 lg:dark:text-gray-400 font-medium">Remember Me</span>
                            </label>
                            {isLogin && (
                                <Link href={route('password.request.sms')} className="text-gray-300 hover:text-white lg:text-gray-500 lg:hover:text-black lg:dark:hover:text-white transition-colors">Forgot Password?</Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-white text-gray-900 lg:bg-gray-900 lg:text-white lg:dark:bg-white lg:dark:text-black py-3.5 rounded-xl font-bold text-lg hover:bg-gray-100 lg:hover:bg-gray-800 lg:dark:hover:bg-gray-200 transition-colors shadow-lg disabled:opacity-50"
                        >
                            {processing ? <Loader2 className="animate-spin mx-auto" /> : (isLogin ? 'Login' : 'Register')}
                        </button>
                    </form>

                    <div className="mt-6 relative flex items-center justify-center">
                        <div className="absolute inset-x-0 h-px bg-white/20 lg:bg-gray-200 lg:dark:bg-neutral-800"></div>
                        <span className="relative px-4 text-sm text-gray-300 lg:text-gray-500 bg-transparent lg:bg-white lg:dark:bg-neutral-950">
                            Or {isLogin ? 'Login' : 'Register'} with
                        </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 px-4 py-3 border border-white/20 lg:border-gray-200 lg:dark:border-neutral-700 rounded-xl hover:bg-white/10 lg:hover:bg-gray-50 lg:dark:hover:bg-neutral-900 transition-colors bg-white/5 lg:bg-transparent">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                            <span className="text-sm font-medium text-white lg:text-gray-700 lg:dark:text-gray-300">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 border border-white/20 lg:border-gray-200 lg:dark:border-neutral-700 rounded-xl hover:bg-white/10 lg:hover:bg-gray-50 lg:dark:hover:bg-neutral-900 transition-colors bg-white/5 lg:bg-transparent">
                            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                            <span className="text-sm font-medium text-white lg:text-gray-700 lg:dark:text-gray-300">Facebook</span>
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default AuthPage;
