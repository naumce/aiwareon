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

export function LandingPage() {
    const { user } = useAuthStore();
    const [selectedSet, setSelectedSet] = useState(SHOWCASE_DATA[2]); // Default to 3 as user likes it
    const [selectedDress, setSelectedDress] = useState(SHOWCASE_DATA[2].dresses[1]); // Default to d2 of set 3
    const [isRevealed, setIsRevealed] = useState(false);

    useEffect(() => {
        setIsRevealed(false);
    }, [selectedSet, selectedDress]);

    return (
        <div className="min-h-screen w-full flex flex-col relative bg-zinc-950 overflow-x-hidden overflow-y-auto">
            {/* Background Glows - pointer-events-none so they don't block scrolling */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full animate-mesh pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/10 blur-[120px] rounded-full animate-mesh pointer-events-none" />

            {/* Navigation */}
            <nav className="relative z-10 px-6 py-8 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="text-2xl font-bold tracking-tight">
                    <span className="text-white">AI</span>
                    <span className="text-zinc-500">WEAR</span>
                </div>
                <div className="flex items-center gap-8">
                    <Link to="/pricing" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Pricing</Link>
                    <Link
                        to={user ? "/studio" : "/login"}
                        className="px-5 py-2.5 rounded-full glass glass-hover text-sm font-semibold tracking-wide"
                    >
                        {user ? "Studio" : "Sign In"}
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 text-center py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="max-w-4xl"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="inline-block px-4 py-1.5 rounded-full glass border-white/5 text-[10px] uppercase tracking-[0.2em] text-violet-400 font-bold mb-8"
                    >
                        The Future of Fashion
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]"
                    >
                        Luxury Try-On <br />
                        <span className="text-zinc-500 italic font-light">Redefined.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light"
                    >
                        Experience garments in photorealistic detail before they reach your wardrobe.
                        Powered by high-fidelity generative AI.
                    </motion.p>
                </motion.div>
            </main>

            {/* Interactive Try-On Section */}
            <section className="relative z-10 py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Selector UI */}
                        <div className="space-y-12">
                            <div>
                                <h2 className="text-4xl font-bold tracking-tighter mb-6">Interactive Studio</h2>
                                <p className="text-zinc-500 font-medium">Select a model and garment to witness the high-fidelity transformation.</p>
                            </div>

                            <div className="space-y-8">
                                {/* Model Selection */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">01. Select Model</h3>
                                    <div className="flex gap-4">
                                        {SHOWCASE_DATA.map((set) => (
                                            <button
                                                key={set.id}
                                                onClick={() => {
                                                    setSelectedSet(set);
                                                    setSelectedSet(set);
                                                    setSelectedDress(set.dresses[0]);
                                                }}
                                                className={`px-6 py-3 rounded-2xl glass transition-all border font-bold text-xs uppercase tracking-widest ${selectedSet.id === set.id ? 'border-violet-500 text-violet-400' : 'border-white/5 text-zinc-500 hover:border-white/10'}`}
                                            >
                                                M{set.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dress Selection */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">02. Select Garment</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {selectedSet.dresses.map((dress) => (
                                            <button
                                                key={dress.id}
                                                onClick={() => setSelectedDress(dress)}
                                                className={`aspect-square rounded-2xl overflow-hidden glass transition-all border p-2 group ${selectedDress.id === dress.id ? 'border-violet-500' : 'border-white/5 hover:border-white/10'}`}
                                            >
                                                <img src={dress.thumb} alt={dress.name} className="w-full h-full object-cover rounded-xl transition-transform group-hover:scale-110" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Reveal Action */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setIsRevealed(!isRevealed)}
                                        className="py-5 rounded-2xl border border-violet-500/20 glass text-white font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-violet-500/10 transition-colors shadow-2xl"
                                    >
                                        {isRevealed ? 'Reset' : 'Generate Preview'}
                                    </button>
                                    <Link
                                        to={user ? "/studio" : "/login"}
                                        className="py-5 rounded-2xl gradient-primary text-white font-bold text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] transition-transform shadow-2xl shadow-violet-500/20 text-center flex items-center justify-center"
                                    >
                                        Try on yourself
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Preview Display */}
                        <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden glass border-white/5 shadow-2xl">
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
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
                                            <div>
                                                <p className="text-violet-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Original State</p>
                                                <h4 className="text-2xl font-bold">Reference Subject</h4>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                        className="relative w-full h-full"
                                    >
                                        <img
                                            src={selectedDress.result}
                                            alt="Result"
                                            className="absolute inset-0 w-full h-full object-contain p-4"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
                                            <div>
                                                <p className="text-violet-400 text-[10px] font-bold tracking-[0.3em] uppercase mb-2">Processed Output</p>
                                                <h4 className="text-2xl font-bold">{selectedSet.name} — {selectedDress.name}</h4>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Scanning Line Overlay */}
                            {isRevealed && (
                                <motion.div
                                    initial={{ top: '-10%' }}
                                    animate={{ top: '110%' }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-0 right-0 h-px bg-violet-500/50 shadow-[0_0_20px_rgb(139,92,246)] z-20"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-xl font-bold tracking-tighter">
                        <span className="text-white">AI</span>
                        <span className="text-zinc-500">WEAR</span>
                    </div>
                    <div className="flex gap-10 text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500">
                        <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <a href="#" className="hover:text-white transition-colors">Legal</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-medium">
                        © 2026 AIWEAR Collective
                    </p>
                </div>
            </footer>
        </div>
    );
}
