import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCreditStore } from '../stores/creditStore';
import { useEffect } from 'react';

export function AccountPage() {
    const { user, profile, signOut } = useAuthStore();
    const { balance, fetchBalance } = useCreditStore();

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 shrink-0">
                <h2 className="text-2xl font-bold tracking-tight uppercase italic">Account</h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">Settings & Profile</p>
            </div>

            <div className="flex-1 p-8 pt-0 overflow-y-auto">
                <div className="max-w-lg mx-auto space-y-6">

                    {/* Profile Card */}
                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Profile</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center text-2xl font-bold">
                                {user?.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-lg">{user?.email}</p>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest">
                                    {profile?.plan || 'Free'} Plan
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Credits Card */}
                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Credits</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-4xl font-bold text-violet-400">{balance}</p>
                                <p className="text-xs text-zinc-500 mt-1">Available credits</p>
                            </div>
                            <Link
                                to="/pricing"
                                className="px-6 py-3 rounded-xl gradient-primary text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                            >
                                Buy More
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="glass rounded-2xl p-6 border border-white/5">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Quick Links</h3>
                        <div className="space-y-3">
                            <Link
                                to="/studio"
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <span className="font-medium">Create New Look</span>
                                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <Link
                                to="/studio/history"
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <span className="font-medium">View Gallery</span>
                                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={() => signOut()}
                        className="w-full py-4 rounded-2xl border border-red-500/20 text-red-400 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-colors"
                    >
                        Sign Out
                    </button>

                </div>
            </div>
        </div>
    );
}
