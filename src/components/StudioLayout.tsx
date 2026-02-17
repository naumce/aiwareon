import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { useCreditStore } from '../stores/creditStore';
import { PWAInstallFloater } from './PWAInstallFloater';

export function StudioLayout() {
    const location = useLocation();
    const { user, signOut } = useAuthStore();
    const { balance } = useCreditStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

    // Close dropdowns on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node) &&
                mobileMenuButtonRef.current &&
                !mobileMenuButtonRef.current.contains(event.target as Node)
            ) {
                setIsMobileMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = [
        { id: 'atelier', label: 'Atelier', path: '/studio' },
        { id: 'tonight', label: 'Tonight', path: '/studio/tonight' },
        { id: 'wardrobe', label: 'Wardrobe', path: '/studio/wardrobe' },
        { id: 'outfits', label: 'Outfits', path: '/studio/outfits' },
        { id: 'gallery', label: 'History', path: '/studio/history' },
    ];

    return (
        <div className="fixed inset-0 flex flex-col overflow-hidden"
            style={{ height: '100dvh', background: '#F7F5F2', color: '#1A1A2E' }}>

            {/* Light Navigation Header */}
            <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-4 md:px-8"
                style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                }}>

                {/* Logo */}
                <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity text-[#1A1A2E]">
                    <span className="font-extrabold">AIWEAR</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/studio' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`relative px-4 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'text-[#1A1A2E]'
                                    : 'text-[#AAA] hover:text-[#1A1A2E]'
                                    }`}
                            >
                                {item.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-underline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5"
                                        style={{ background: 'linear-gradient(90deg, #C9A0FF, #FF8FAB)' }}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Side Actions */}
                <div className="flex items-center gap-3">
                    {/* Credits Badge */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                        style={{
                            background: 'rgba(201, 160, 255, 0.1)',
                            border: '1px solid rgba(201, 160, 255, 0.2)'
                        }}>
                        <span className="text-xs text-[#AAA] font-medium">Credits</span>
                        <span className="font-semibold text-[#1A1A2E]">{balance}</span>
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:ring-2 hover:ring-[#FF8FAB]/50"
                            style={{
                                background: 'linear-gradient(135deg, #C9A0FF, #FF8FAB)',
                            }}
                        >
                            <span className="text-sm font-bold text-white">
                                {user?.email?.[0].toUpperCase() || 'U'}
                            </span>
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(0, 0, 0, 0.08)',
                                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.12)'
                                    }}
                                >
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.06)' }}>
                                        <p className="text-sm font-semibold text-[#1A1A2E] truncate">{user?.email}</p>
                                        <p className="text-xs text-[#AAA] mt-0.5">Free Plan</p>
                                    </div>

                                    {/* Account Link */}
                                    <Link
                                        to="/studio/account"
                                        onClick={() => setIsProfileOpen(false)}
                                        className="block px-4 py-3 text-sm text-[#888] hover:text-[#1A1A2E] hover:bg-black/[0.03] transition-colors"
                                    >
                                        Account Settings
                                    </Link>

                                    {/* Sign Out */}
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-50 transition-colors"
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

                    {/* Mobile Menu Toggle */}
                    <button
                        ref={mobileMenuButtonRef}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors"
                    >
                        <svg className="w-5 h-5 text-[#1A1A2E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </header>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        ref={mobileMenuRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden fixed top-16 left-0 right-0 z-40 px-4 pb-4"
                        style={{
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                        }}
                    >
                        <nav className="flex flex-col gap-1 py-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path ||
                                    (item.path !== '/studio' && location.pathname.startsWith(item.path));
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? 'text-[#1A1A2E]'
                                            : 'text-[#AAA] hover:bg-black/[0.03] hover:text-[#1A1A2E]'
                                            }`}
                                        style={isActive ? {
                                            background: 'rgba(201, 160, 255, 0.1)',
                                        } : undefined}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Credits in mobile menu */}
                        <div className="flex items-center justify-between px-4 py-3 mt-2 rounded-xl"
                            style={{ background: 'rgba(201, 160, 255, 0.08)' }}>
                            <span className="text-sm text-[#AAA]">Credits</span>
                            <span className="text-sm font-semibold text-[#1A1A2E]">{balance}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="flex-1 pt-16 relative flex flex-col min-w-0 overflow-y-auto overflow-x-hidden">
                <Outlet />
            </main>

            {/* PWA Install Floater */}
            <PWAInstallFloater />
        </div>
    );
}
