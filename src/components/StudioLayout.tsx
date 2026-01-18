import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useCreditStore } from '../stores/creditStore';

export function StudioLayout() {
    const location = useLocation();
    const { user, signOut } = useAuthStore();
    const { balance } = useCreditStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = [
        { id: 'atelier', label: 'Atelier', path: '/studio' },
        { id: 'tonight', label: '✨ Tonight', path: '/studio/tonight' },
        { id: 'wardrobe', label: 'Wardrobe', path: '/studio/wardrobe' },
        { id: 'outfits', label: 'Outfits', path: '/studio/outfits' },
        { id: 'gallery', label: 'Gallery', path: '/studio/history' },
        { id: 'account', label: 'Account', path: '/studio/account' },
    ];

    return (
        <div className="fixed inset-0 bg-zinc-950 flex flex-col text-white overflow-hidden"
            style={{ height: '100dvh' }}>
            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4 md:px-8">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold tracking-tighter flex items-center gap-2">
                    <span className="font-black italic">AIWEAR</span>
                </Link>

                {/* Center Navigation (Pills) */}
                <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/studio' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`relative px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${isActive ? 'text-zinc-950' : 'text-zinc-400 hover:text-white'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-white rounded-full"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Mobile Title (visible when nav hidden) */}
                <div className="md:hidden text-xs font-bold uppercase tracking-widest text-zinc-500">
                    {navItems.find(i => i.path === location.pathname)?.label || 'Studio'}
                </div>

                {/* Right: User Profile */}
                <div className="flex items-center gap-4">
                    {/* Credits (Desktop) */}
                    <div className="hidden md:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Credits</span>
                        <span className="text-xs font-bold text-white">{balance}</span>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-9 h-9 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center hover:border-violet-500/50 transition-colors"
                        >
                            <span className="text-xs font-bold text-zinc-400">
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </span>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-56 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden p-2 z-50"
                                >
                                    <div className="px-3 py-2 border-b border-white/5 mb-2">
                                        <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Free Plan</p>
                                    </div>

                                    <div className="md:hidden px-3 py-2 bg-white/5 rounded-xl mb-2 flex justify-between items-center">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase">Credits</span>
                                        <span className="text-sm font-bold text-white">{balance}</span>
                                    </div>

                                    {/* Mobile Nav Links in Dropdown */}
                                    <div className="md:hidden space-y-1 mb-2 border-b border-white/5 pb-2">
                                        {navItems.map(item => (
                                            <Link
                                                key={item.id}
                                                to={item.path}
                                                onClick={() => setIsProfileOpen(false)}
                                                className={`block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider ${location.pathname === item.path ? 'bg-white text-black' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => signOut()}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Main Content Area (padded for fixed header) */}
            <main className="flex-1 pt-16 relative flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-violet-500/5 blur-[120px] rounded-full -z-10" />
                <Outlet />
            </main>
        </div>
    );
}
