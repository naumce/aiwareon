import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCreditStore } from '../stores/creditStore';
import { useEffect } from 'react';
import { useInstall } from '../hooks/useInstall';

export function AccountPage() {
    const { user, signOut } = useAuthStore();
    const { balance, fetchBalance } = useCreditStore();
    const { canInstall, isInstalled, handleInstall, IOSInstructions } = useInstall();

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 shrink-0">
                <h2 className="text-2xl font-bold tracking-tight uppercase italic">Account</h2>
                <p className="text-xs text-[#AAA] font-bold uppercase tracking-[0.2em] mt-1">Settings & Profile</p>
            </div>

            <div className="flex-1 p-8 pt-0 overflow-y-auto">
                <div className="max-w-lg mx-auto space-y-6">

                    {/* Profile Card */}
                    <div className="glass rounded-2xl p-6 border border-black/[0.04]">
                        <h3 className="text-[10px] font-bold text-[#AAA] uppercase tracking-widest mb-4">Profile</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#C9A0FF] to-[#FF8FAB] flex items-center justify-center text-2xl font-bold">
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-lg">{user?.email}</p>
                                <p className="text-xs text-[#AAA] uppercase tracking-widest">
                                    Free Plan
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Credits Card */}
                    <div className="glass rounded-2xl p-6 border border-black/[0.04]">
                        <h3 className="text-[10px] font-bold text-[#AAA] uppercase tracking-widest mb-4">Credits</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-4xl font-bold text-[#C9A0FF]">{balance}</p>
                                <p className="text-xs text-[#AAA] mt-1">Available credits</p>
                            </div>
                            <Link
                                to="/pricing"
                                className="px-6 py-3 rounded-xl gradient-primary text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                            >
                                Buy More
                            </Link>
                        </div>
                    </div>

                    {/* Install App Card */}
                    {canInstall && !isInstalled && (
                        <div className="glass rounded-2xl p-6 border border-[#C9A0FF]/20 bg-gradient-to-br from-[#C9A0FF]/5 to-transparent">
                            <h3 className="text-[10px] font-bold text-[#AAA] uppercase tracking-widest mb-4">Install App</h3>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-lg mb-1">Add to Home Screen</p>
                                    <p className="text-xs text-[#888]">Faster access & offline mode</p>
                                </div>
                                <button
                                    onClick={handleInstall}
                                    className="px-6 py-3 rounded-xl gradient-primary text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Install
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="glass rounded-2xl p-6 border border-black/[0.04]">
                        <h3 className="text-[10px] font-bold text-[#AAA] uppercase tracking-widest mb-4">Quick Links</h3>
                        <div className="space-y-3">
                            <Link
                                to="/studio"
                                className="flex items-center justify-between p-4 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors"
                            >
                                <span className="font-medium">Create New Look</span>
                                <svg className="w-5 h-5 text-[#AAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link
                                to="/studio/history"
                                className="flex items-center justify-between p-4 rounded-xl bg-black/[0.03] hover:bg-black/[0.06] transition-colors"
                            >
                                <span className="font-medium">View Gallery</span>
                                <svg className="w-5 h-5 text-[#AAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={() => signOut()}
                        className="w-full py-4 rounded-2xl border border-red-400/20 text-red-400 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-colors"
                    >
                        Sign Out
                    </button>

                </div>
            </div>

            {/* iOS Install Instructions Modal */}
            <IOSInstructions />
        </div>
    );
}
