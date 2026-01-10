import { create } from 'zustand';
import { getProfile, deductCredits } from '../services/supabaseClient';

interface CreditState {
    credits: number;
    isLoading: boolean;
    guestShotsLeft: number;

    // Computed
    getCreditWarning: () => 'empty' | 'critical' | 'low' | null;

    // Actions
    setCredits: (credits: number) => void;
    syncCredits: (userId: string) => Promise<void>;
    deduct: (userId: string, amount: number) => Promise<{ error: string | null }>;
    useGuestShot: () => boolean;
    initGuestShots: () => void;
}

const GUEST_SHOTS_KEY = 'aiwear_guest_shots_left';
const MAX_GUEST_SHOTS = 2;

export const useCreditStore = create<CreditState>((set, get) => ({
    credits: 0,
    isLoading: false,
    guestShotsLeft: MAX_GUEST_SHOTS,

    getCreditWarning: () => {
        const { credits } = get();
        if (credits === 0) return 'empty';
        if (credits < 2) return 'critical';
        if (credits < 5) return 'low';
        return null;
    },

    setCredits: (credits) => set({ credits }),

    syncCredits: async (userId) => {
        set({ isLoading: true });
        try {
            const profile = await getProfile(userId);
            if (profile) {
                set({ credits: profile.credits });
            }
        } catch (err) {
            console.error('Failed to sync credits:', err);
        } finally {
            set({ isLoading: false });
        }
    },

    deduct: async (userId, amount) => {
        const { error } = await deductCredits(userId, amount);
        if (!error) {
            // Re-sync to get accurate value from DB
            await get().syncCredits(userId);
        }
        return { error };
    },

    useGuestShot: () => {
        const { guestShotsLeft } = get();
        if (guestShotsLeft <= 0) return false;

        const newValue = guestShotsLeft - 1;
        set({ guestShotsLeft: newValue });

        try {
            localStorage.setItem(GUEST_SHOTS_KEY, String(newValue));
        } catch { }

        return true;
    },

    initGuestShots: () => {
        try {
            const raw = localStorage.getItem(GUEST_SHOTS_KEY);
            const n = raw ? Number(raw) : MAX_GUEST_SHOTS;
            const shots = Number.isFinite(n) ? Math.max(0, Math.min(MAX_GUEST_SHOTS, n)) : MAX_GUEST_SHOTS;
            set({ guestShotsLeft: shots });
        } catch {
            set({ guestShotsLeft: MAX_GUEST_SHOTS });
        }
    },
}));
