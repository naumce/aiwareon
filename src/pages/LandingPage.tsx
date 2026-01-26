import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';

const SHOWCASE_DATA = [
    {
        id: 1,
        name: 'Technical Series',
        modelImg: '/assets/showcase/1/g1.png',
        dresses: [
            { id: 1, name: 'HDS-01A', thumb: '/assets/showcase/1/g1d1.png', result: '/assets/showcase/1/g1d1f.png' },
            { id: 2, name: 'HDS-01B', thumb: '/assets/showcase/1/g1d2.png', result: '/assets/showcase/1/g1d2f.png' },
        ]
    },
    {
        id: 2,
        name: 'Structural Form',
        modelImg: '/assets/showcase/2/g2.png',
        dresses: [
            { id: 1, name: 'HDS-02A', thumb: '/assets/showcase/2/g2d1.png', result: '/assets/showcase/2/g2d1f.png' },
        ]
    },
    {
        id: 3,
        name: 'Utility Core',
        modelImg: '/assets/showcase/3/g3.png',
        dresses: [
            { id: 1, name: 'HDS-03A', thumb: '/assets/showcase/3/g3d1.png', result: '/assets/showcase/3/g3d1f.png' },
            { id: 2, name: 'HDS-03B', thumb: '/assets/showcase/3/g3d2.png', result: '/assets/showcase/3/g3d2f.png' },
        ]
    }
];

const FEATURES = [
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
        title: 'Virtual Try-On',
        description: 'See yourself in any garment with photorealistic AI rendering'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
        title: 'Fast Processing',
        description: 'Get your virtual try-on results in under 30 seconds'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        title: 'HD Quality',
        description: 'Crystal-clear results with high-resolution output'
    },
    {
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Pay As You Go',
        description: 'No subscriptions. Only pay for what you use'
    }
];

export function LandingPage() {
    const { user } = useAuthStore();
    const [selectedSet, setSelectedSet] = useState(SHOWCASE_DATA[2]);
    const [selectedDress, setSelectedDress] = useState(SHOWCASE_DATA[2].dresses[1]);
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        setIsRevealed(false);
    }, [selectedSet, selectedDress]);

    return (
        <div className="min-h-screen w-full bg-[#0a0a0a]">
            {/* Navigation */}
            <nav className="relative z-10 px-4 md:px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <Link to="/" className="text-xl font-bold tracking-tight">
                    <span className="text-white">AIWEAR</span>
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                        Pricing
                    </Link>
                    <Link
                        to={user ? "/studio" : "/login"}
                        className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        {user ? "Open Studio" : "Get Started"}
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 px-4 text-center py-16 md:py-24 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                        <span className="text-gradient">AI Virtual Try-On</span>
                        <br />
                        <span className="text-zinc-400 font-light">For Everyone</span>
                    </h1>

                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-8">
                        See yourself in any outfit before you buy. Powered by cutting-edge AI for photorealistic results.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to={user ? "/studio" : "/login"}
                            className="px-8 py-4 rounded-xl text-base font-semibold transition-all hover:scale-105 hover:shadow-lg"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.3)'
                            }}
                        >
                            Start Creating
                        </Link>
                        <Link
                            to="/pricing"
                            className="px-8 py-4 rounded-xl text-base font-semibold transition-all hover:bg-white/10"
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.15)'
                            }}
                        >
                            View Pricing
                        </Link>
                    </div>

                    <p className="text-sm text-zinc-500 mt-4">
                        Pay as you go • No subscription required
                    </p>
                </motion.div>
            </section>

            {/* Features Grid */}
            <section className="relative z-10 px-4 md:px-8 py-16 max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                        Features That Set Us Apart
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.1 }}
                                className="p-6 rounded-2xl transition-all hover:border-indigo-500/30"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)'
                                }}
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-indigo-400 mb-4"
                                    style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                <p className="text-sm text-zinc-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </section>

            {/* Interactive Demo Section */}
            <section className="relative z-10 py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">See What You Can Create</h2>
                        <p className="text-zinc-400">Try the interactive demo below</p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Selector UI */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            {/* Model Selection */}
                            <div>
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                                    01. Select Model
                                </h3>
                                <div className="flex gap-3">
                                    {SHOWCASE_DATA.map((set) => (
                                        <button
                                            key={set.id}
                                            onClick={() => {
                                                setSelectedSet(set);
                                                setSelectedDress(set.dresses[0]);
                                            }}
                                            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${selectedSet.id === set.id
                                                    ? 'text-indigo-300'
                                                    : 'text-zinc-500 hover:text-white'
                                                }`}
                                            style={{
                                                background: selectedSet.id === set.id
                                                    ? 'rgba(99, 102, 241, 0.2)'
                                                    : 'rgba(255, 255, 255, 0.05)',
                                                border: selectedSet.id === set.id
                                                    ? '1px solid rgba(99, 102, 241, 0.5)'
                                                    : '1px solid rgba(255, 255, 255, 0.1)'
                                            }}
                                        >
                                            Model {set.id}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Garment Selection */}
                            <div>
                                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                                    02. Select Garment
                                </h3>
                                <div className="flex gap-3">
                                    {selectedSet.dresses.map((dress) => (
                                        <button
                                            key={dress.id}
                                            onClick={() => setSelectedDress(dress)}
                                            className={`w-20 h-24 rounded-xl overflow-hidden transition-all ${selectedDress.id === dress.id
                                                    ? 'ring-2 ring-indigo-500'
                                                    : 'hover:ring-2 hover:ring-white/30'
                                                }`}
                                            style={{
                                                border: '1px solid rgba(255, 255, 255, 0.1)'
                                            }}
                                        >
                                            <img src={dress.thumb} alt={dress.name} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsRevealed(!isRevealed)}
                                    className="flex-1 py-4 rounded-xl text-sm font-semibold transition-all"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)'
                                    }}
                                >
                                    {isRevealed ? 'Show Original' : 'Generate Preview'}
                                </button>
                                <Link
                                    to={user ? "/studio" : "/login"}
                                    className="flex-1 py-4 rounded-xl text-sm font-semibold text-center transition-all hover:scale-[1.02]"
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.25)'
                                    }}
                                >
                                    Try With Your Photo
                                </Link>
                            </div>
                        </motion.div>

                        {/* Preview Display */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative aspect-[3/4] rounded-3xl overflow-hidden"
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                        >
                            <AnimatePresence mode="wait">
                                {!isRevealed ? (
                                    <motion.div
                                        key="original"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="relative w-full h-full"
                                    >
                                        <img
                                            src={selectedSet.modelImg}
                                            alt="Model"
                                            className="absolute inset-0 w-full h-full object-contain p-4"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8">
                                            <div>
                                                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">Original</p>
                                                <h4 className="text-xl font-bold">Reference Photo</h4>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                        className="relative w-full h-full"
                                    >
                                        <img
                                            src={selectedDress.result}
                                            alt="Result"
                                            className="absolute inset-0 w-full h-full object-contain p-4"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8">
                                            <div>
                                                <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">AI Generated</p>
                                                <h4 className="text-xl font-bold">{selectedSet.name} — {selectedDress.name}</h4>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Scan Line Effect */}
                            {isRevealed && (
                                <motion.div
                                    initial={{ top: '-10%' }}
                                    animate={{ top: '110%' }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-px z-20"
                                    style={{
                                        background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
                                        boxShadow: '0 0 20px #6366f1'
                                    }}
                                />
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-16 md:py-24">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="p-8 md:p-12 rounded-3xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15))',
                            border: '1px solid rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Ready to Try It Yourself?
                        </h2>
                        <p className="text-zinc-400 mb-8">
                            Join thousands of users creating virtual try-ons with AI.
                        </p>
                        <Link
                            to={user ? "/studio" : "/login"}
                            className="inline-block px-8 py-4 rounded-xl text-base font-semibold transition-all hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)'
                            }}
                        >
                            Get Started Free
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t py-12 px-4 md:px-8"
                style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Brand */}
                        <div>
                            <Link to="/" className="text-xl font-bold">AIWEAR</Link>
                            <p className="text-sm text-zinc-500 mt-2 max-w-xs">
                                AI-powered virtual try-on. See yourself in any outfit before you buy.
                            </p>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4">Product</h4>
                            <div className="space-y-2">
                                <Link to="/studio" className="block text-sm text-zinc-400 hover:text-white transition-colors">Studio</Link>
                                <Link to="/pricing" className="block text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link>
                            </div>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <h4 className="text-sm font-semibold mb-4">Legal</h4>
                            <div className="space-y-2">
                                <a href="#" className="block text-sm text-zinc-400 hover:text-white transition-colors">Privacy Policy</a>
                                <a href="#" className="block text-sm text-zinc-400 hover:text-white transition-colors">Terms of Service</a>
                                <a href="#" className="block text-sm text-zinc-400 hover:text-white transition-colors">Contact</a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 text-center text-sm text-zinc-600"
                        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        © 2026 AIWEAR. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
